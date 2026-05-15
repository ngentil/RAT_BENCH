-- All-to-all asset assignments migration.
-- Replaces vehicle-centric vehicle_assignments with a generic cross-type table.
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS asset_assignments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_type  text NOT NULL CHECK (parent_type IN ('vehicle','tool','equipment','consumable')),
  parent_id    uuid NOT NULL,
  child_type   text NOT NULL CHECK (child_type IN ('vehicle','tool','equipment','consumable')),
  child_id     uuid NOT NULL,
  child_name   text NOT NULL,
  parent_name  text NOT NULL DEFAULT '',
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes        text,
  assigned_at  timestamptz DEFAULT now(),
  UNIQUE (parent_type, parent_id, child_type, child_id)
);

ALTER TABLE asset_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own" ON asset_assignments FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON asset_assignments TO authenticated;
GRANT ALL ON asset_assignments TO service_role;

CREATE INDEX IF NOT EXISTS idx_asset_assignments_parent ON asset_assignments (parent_type, parent_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_child  ON asset_assignments (child_type,  child_id);

-- Migrate existing vehicle_assignments rows (parent_name left blank for legacy rows)
INSERT INTO asset_assignments (parent_type, parent_id, child_type, child_id, child_name, parent_name, user_id, assigned_at)
SELECT 'vehicle', vehicle_id, asset_type, asset_id, asset_name, '', user_id, assigned_at
FROM vehicle_assignments
ON CONFLICT DO NOTHING;
