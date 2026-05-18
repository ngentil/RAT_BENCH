-- Vehicle Assignments migration
-- Run in Supabase SQL Editor after deploying this update

CREATE TABLE IF NOT EXISTS vehicle_assignments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id  uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  asset_type  text NOT NULL CHECK (asset_type IN ('tool', 'equipment')),
  asset_id    uuid NOT NULL,
  asset_name  text NOT NULL,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes       text,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE (vehicle_id, asset_type, asset_id)
);

ALTER TABLE vehicle_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own" ON vehicle_assignments
  FOR ALL
  TO authenticated
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON vehicle_assignments TO authenticated;
GRANT ALL ON vehicle_assignments TO service_role;

CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_vehicle
  ON vehicle_assignments (vehicle_id);
