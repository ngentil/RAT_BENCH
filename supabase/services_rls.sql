-- RLS for the services (machine service log) table
-- Run in Supabase SQL Editor

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS services_own        ON services;
DROP POLICY IF EXISTS services_provisioned_select ON services;

-- Full access for: service creator OR owner of the machine
CREATE POLICY services_own ON services
  FOR ALL
  USING (
    user_id    = auth.uid()
    OR machine_id IN (SELECT id FROM machines WHERE user_id = auth.uid())
  )
  WITH CHECK (user_id = auth.uid());

-- Read-only for provisioned machine access (uses existing SECURITY DEFINER helper)
CREATE POLICY services_provisioned_select ON services
  FOR SELECT
  USING (
    machine_id IN (SELECT _provisioned_machine_ids(auth.uid()))
  );
