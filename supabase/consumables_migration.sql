-- Consumables migration: extend vehicle_assignments to support consumable asset type
-- Run in Supabase SQL Editor.

ALTER TABLE vehicle_assignments
  DROP CONSTRAINT vehicle_assignments_asset_type_check;

ALTER TABLE vehicle_assignments
  ADD CONSTRAINT vehicle_assignments_asset_type_check
  CHECK (asset_type IN ('tool', 'equipment', 'consumable'));
