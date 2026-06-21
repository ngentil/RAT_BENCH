-- Inventory items: add provisioned SELECT/UPDATE policies.
-- inventory_items only had an owner policy; shared-access users with
-- asset_permissions entries for asset_type='part' had no way to read
-- or edit parts granted to them.
-- Run in Supabase SQL Editor.

-- ── SECURITY DEFINER owner helper (prevents ownership theft on UPDATE) ─────────

CREATE OR REPLACE FUNCTION _inventory_item_owner(p_id uuid)
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT user_id FROM inventory_items WHERE id = p_id;
$$;


-- ── Provisioned SELECT ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS inventory_provisioned_select ON inventory_items;

CREATE POLICY inventory_provisioned_select ON inventory_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_type = 'part'
        AND asset_id   = inventory_items.id
        AND user_id    = auth.uid()
    )
  );


-- ── Provisioned UPDATE (with ownership-theft guard) ───────────────────────────

DROP POLICY IF EXISTS inventory_provisioned_update ON inventory_items;

CREATE POLICY inventory_provisioned_update ON inventory_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_type = 'part'
        AND asset_id   = inventory_items.id
        AND user_id    = auth.uid()
        AND can_edit   = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_type = 'part'
        AND asset_id   = id
        AND user_id    = auth.uid()
        AND can_edit   = true
    )
    AND user_id = _inventory_item_owner(id)
  );
