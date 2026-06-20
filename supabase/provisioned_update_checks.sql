-- Add WITH CHECK to all provisioned UPDATE policies to prevent ownership theft.
-- Without WITH CHECK, a provisioned user could change user_id on an asset they
-- have edit rights for, stealing ownership from the real owner.
-- Also adds CHECK constraint to asset_permissions.asset_type.
-- Run in Supabase SQL Editor.

-- ── SECURITY DEFINER owner helpers (bypass RLS for the current-owner lookup) ───

CREATE OR REPLACE FUNCTION _machine_owner(p_id uuid)
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT user_id FROM machines WHERE id = p_id;
$$;

CREATE OR REPLACE FUNCTION _vehicle_owner(p_id uuid)
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT user_id FROM vehicles WHERE id = p_id;
$$;

CREATE OR REPLACE FUNCTION _equipment_owner(p_id uuid)
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT user_id FROM equipment WHERE id = p_id;
$$;

CREATE OR REPLACE FUNCTION _tool_owner(p_id uuid)
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT user_id FROM tools WHERE id = p_id;
$$;


-- ── machines: add WITH CHECK ──────────────────────────────────────────────────

DROP POLICY IF EXISTS machines_provisioned_update ON machines;

CREATE POLICY machines_provisioned_update ON machines
  FOR UPDATE
  USING  (id IN (SELECT _editable_provisioned_machine_ids(auth.uid())))
  WITH CHECK (
    id IN (SELECT _editable_provisioned_machine_ids(auth.uid()))
    AND user_id = _machine_owner(id)
  );


-- ── vehicles: add WITH CHECK ──────────────────────────────────────────────────

DROP POLICY IF EXISTS vehicles_provisioned_update ON vehicles;

CREATE POLICY vehicles_provisioned_update ON vehicles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_type = 'vehicle' AND asset_id = vehicles.id
        AND user_id = auth.uid() AND can_edit = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_type = 'vehicle' AND asset_id = id
        AND user_id = auth.uid() AND can_edit = true
    )
    AND user_id = _vehicle_owner(id)
  );


-- ── equipment: add WITH CHECK ─────────────────────────────────────────────────

DROP POLICY IF EXISTS equipment_provisioned_update ON equipment;

CREATE POLICY equipment_provisioned_update ON equipment
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_type = 'equipment' AND asset_id = equipment.id
        AND user_id = auth.uid() AND can_edit = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_type = 'equipment' AND asset_id = id
        AND user_id = auth.uid() AND can_edit = true
    )
    AND user_id = _equipment_owner(id)
  );


-- ── tools: add WITH CHECK ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS tools_provisioned_update ON tools;

CREATE POLICY tools_provisioned_update ON tools
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_type = 'tool' AND asset_id = tools.id
        AND user_id = auth.uid() AND can_edit = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_type = 'tool' AND asset_id = id
        AND user_id = auth.uid() AND can_edit = true
    )
    AND user_id = _tool_owner(id)
  );


-- ── consumables: add WITH CHECK ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION _consumable_owner(p_id uuid)
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT user_id FROM consumables WHERE id = p_id;
$$;

DROP POLICY IF EXISTS consumables_provisioned_update ON consumables;

CREATE POLICY consumables_provisioned_update ON consumables
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_type = 'consumable' AND asset_id = consumables.id
        AND user_id = auth.uid() AND can_edit = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_type = 'consumable' AND asset_id = id
        AND user_id = auth.uid() AND can_edit = true
    )
    AND user_id = _consumable_owner(id)
  );


-- ── asset_permissions.asset_type: enforce valid values ───────────────────────

ALTER TABLE asset_permissions
  DROP CONSTRAINT IF EXISTS chk_asset_permissions_type,
  ADD CONSTRAINT chk_asset_permissions_type
    CHECK (asset_type IN ('vehicle', 'equipment', 'tool', 'consumable', 'part'));
