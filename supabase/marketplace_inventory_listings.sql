-- Marketplace: selling surplus Parts/Consumables while reserving a minimum
-- stock level for your own workshop.
--
-- Reserve is opt-in per item and OFF by default (0 — no floor, list freely).
-- It is distinct from the existing minQuantity/min_quantity "reorder point"
-- (a LOW-stock alert you can still sell straight through) — reservedQty is a
-- hard floor the marketplace itself will never let you sell below.
--
-- Parts (inventory_items) already store everything in a jsonb `payload`
-- blob, so reservedQty just joins minQuantity/maxQuantity there as another
-- payload key — no column migration needed, only the trigger below reading
-- it. Consumables are flat columns, so a real column is added here.
--
-- Requires supabase/marketplace_listings.sql, supabase/assets_migration.sql
-- (tools/equipment/inventory_items ownership), supabase/consumables_table_migration.sql.
-- Run in Supabase SQL Editor, after marketplace_listings.sql.

ALTER TABLE consumables ADD COLUMN IF NOT EXISTS reserved_qty numeric NOT NULL DEFAULT 0 CHECK (reserved_qty >= 0);

-- Listing a part/consumable takes those units out of your usable stock
-- immediately (same mental model as a job consuming parts) rather than
-- waiting until "mark sold" — this is what stops the same units from being
-- double-committed to a second listing or used on a job while a sale is
-- pending, and it's the single point where the reserve floor is enforced.
-- Cancelling an unsold listing (active → removed) gives the quantity back.
-- A listing that already sold can never be reactivated — those units are
-- genuinely gone, unlike a machine/tool/equipment listing where the seller
-- still physically holds the one-of-a-kind item and relisting is fine.
CREATE OR REPLACE FUNCTION _apply_marketplace_stock_listing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stock    numeric;
  v_reserved numeric;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status = 'active' AND OLD.item_kind IN ('part', 'consumable') THEN
      IF OLD.item_kind = 'part' THEN
        UPDATE inventory_items
        SET payload = jsonb_set(payload, '{stockQty}', to_jsonb(COALESCE((payload->>'stockQty')::numeric, 0) + OLD.quantity), true),
            updated_at = now()
        WHERE id = OLD.part_id;
      ELSE
        UPDATE consumables SET quantity = COALESCE(quantity, 0) + OLD.quantity, updated_at = now() WHERE id = OLD.consumable_id;
      END IF;
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'INSERT' AND NEW.status = 'active' AND NEW.item_kind IN ('part', 'consumable') THEN
    IF NEW.item_kind = 'part' THEN
      SELECT (payload->>'stockQty')::numeric, COALESCE((payload->>'reservedQty')::numeric, 0)
        INTO v_stock, v_reserved
        FROM inventory_items WHERE id = NEW.part_id AND user_id = NEW.seller_id FOR UPDATE;
    ELSE
      SELECT quantity, reserved_qty INTO v_stock, v_reserved
        FROM consumables WHERE id = NEW.consumable_id AND user_id = NEW.seller_id FOR UPDATE;
    END IF;

    IF v_stock IS NULL THEN
      RAISE EXCEPTION 'Source item not found or not owned by you';
    END IF;
    IF v_stock - NEW.quantity < v_reserved THEN
      RAISE EXCEPTION 'Only % available to sell (% in stock, % reserved for your workshop)', (v_stock - v_reserved), v_stock, v_reserved;
    END IF;

    IF NEW.item_kind = 'part' THEN
      UPDATE inventory_items
      SET payload = jsonb_set(payload, '{stockQty}', to_jsonb(v_stock - NEW.quantity), true), updated_at = now()
      WHERE id = NEW.part_id;
    ELSE
      UPDATE consumables SET quantity = v_stock - NEW.quantity, updated_at = now() WHERE id = NEW.consumable_id;
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.item_kind IN ('part', 'consumable') THEN
    IF OLD.status = 'active' AND NEW.status = 'removed' THEN
      IF OLD.item_kind = 'part' THEN
        UPDATE inventory_items
        SET payload = jsonb_set(payload, '{stockQty}', to_jsonb(COALESCE((payload->>'stockQty')::numeric, 0) + OLD.quantity), true),
            updated_at = now()
        WHERE id = OLD.part_id;
      ELSE
        UPDATE consumables SET quantity = COALESCE(quantity, 0) + OLD.quantity, updated_at = now() WHERE id = OLD.consumable_id;
      END IF;
    ELSIF OLD.status = 'sold' AND NEW.status = 'active' THEN
      RAISE EXCEPTION 'A sold part/consumable listing cannot be relisted';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_marketplace_stock_listing ON marketplace_listings;
CREATE TRIGGER trg_marketplace_stock_listing
  BEFORE INSERT OR UPDATE OR DELETE ON marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION _apply_marketplace_stock_listing();
