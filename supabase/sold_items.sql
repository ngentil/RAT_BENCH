-- Sold Items: when a machine/tool/equipment listing sells, mark the source
-- Garage/Workshop record with `sold_at` so it can drop out of the active
-- Garage/Workshop view and show up in a new consolidated "Sold Items" tab
-- instead — without touching its own service history/photos/data, and
-- without touching equipment's separate, pre-existing manual "Sold" status
-- option (that's a different, user-set concept unrelated to a marketplace
-- sale specifically). Also allows relisting for every item kind — parts and
-- consumables used to be permanently blocked from relisting once sold;
-- relisting now re-validates and re-decrements *current* stock (the same
-- check a fresh listing does), since the originally-sold units are still
-- genuinely gone — relisting offers more of whatever you currently have.
-- Requires supabase/marketplace_inventory_listings.sql (this replaces its
-- trigger function).
-- Run in Supabase SQL Editor.

ALTER TABLE machines  ADD COLUMN IF NOT EXISTS sold_at timestamptz;
ALTER TABLE tools     ADD COLUMN IF NOT EXISTS sold_at timestamptz;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS sold_at timestamptz;

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

  IF TG_OP = 'UPDATE' THEN
    -- Sold: flag the one-of-a-kind source item so it drops out of the
    -- active Garage/Workshop view. Stock kinds (part/consumable) need
    -- nothing here — quantity already left usable stock at listing time.
    IF OLD.status = 'active' AND NEW.status = 'sold' THEN
      IF NEW.item_kind = 'machine' THEN
        UPDATE machines SET sold_at = now() WHERE id = NEW.machine_id;
      ELSIF NEW.item_kind = 'tool' THEN
        UPDATE tools SET sold_at = now() WHERE id = NEW.tool_id;
      ELSIF NEW.item_kind = 'equipment' THEN
        UPDATE equipment SET sold_at = now() WHERE id = NEW.equipment_id;
      END IF;

    -- Cancelled while still active (never sold) — give reserved stock back.
    ELSIF OLD.status = 'active' AND NEW.status = 'removed' AND OLD.item_kind IN ('part', 'consumable') THEN
      IF OLD.item_kind = 'part' THEN
        UPDATE inventory_items
        SET payload = jsonb_set(payload, '{stockQty}', to_jsonb(COALESCE((payload->>'stockQty')::numeric, 0) + OLD.quantity), true),
            updated_at = now()
        WHERE id = OLD.part_id;
      ELSE
        UPDATE consumables SET quantity = COALESCE(quantity, 0) + OLD.quantity, updated_at = now() WHERE id = OLD.consumable_id;
      END IF;

    -- Relist: clear the sold marker for one-of-a-kind kinds; re-validate and
    -- re-decrement *current* stock for part/consumable (same check as a
    -- fresh listing — the originally-sold units aren't coming back).
    ELSIF OLD.status = 'sold' AND NEW.status = 'active' THEN
      IF NEW.item_kind = 'machine' THEN
        UPDATE machines SET sold_at = NULL WHERE id = NEW.machine_id;
      ELSIF NEW.item_kind = 'tool' THEN
        UPDATE tools SET sold_at = NULL WHERE id = NEW.tool_id;
      ELSIF NEW.item_kind = 'equipment' THEN
        UPDATE equipment SET sold_at = NULL WHERE id = NEW.equipment_id;
      ELSIF NEW.item_kind IN ('part', 'consumable') THEN
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
          RAISE EXCEPTION 'Only % available to relist (% in stock, % reserved for your workshop)', (v_stock - v_reserved), v_stock, v_reserved;
        END IF;

        IF NEW.item_kind = 'part' THEN
          UPDATE inventory_items
          SET payload = jsonb_set(payload, '{stockQty}', to_jsonb(v_stock - NEW.quantity), true), updated_at = now()
          WHERE id = NEW.part_id;
        ELSE
          UPDATE consumables SET quantity = v_stock - NEW.quantity, updated_at = now() WHERE id = NEW.consumable_id;
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_marketplace_stock_listing ON marketplace_listings;
CREATE TRIGGER trg_marketplace_stock_listing
  BEFORE INSERT OR UPDATE OR DELETE ON marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION _apply_marketplace_stock_listing();
