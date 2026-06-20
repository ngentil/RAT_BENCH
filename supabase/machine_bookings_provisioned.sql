-- Allow provisioned users (company members with machine access) to read
-- machine_bookings for machines they can see.
-- The _provisioned_machine_ids() helper is defined in scalability_hardening.sql.
-- Run in Supabase SQL Editor.

DROP POLICY IF EXISTS machine_bookings_provisioned_select ON machine_bookings;

CREATE POLICY machine_bookings_provisioned_select ON machine_bookings
  FOR SELECT TO authenticated
  USING (machine_id IN (SELECT _provisioned_machine_ids(auth.uid())));
