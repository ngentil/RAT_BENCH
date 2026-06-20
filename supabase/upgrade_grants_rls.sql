-- RLS for upgrade_grants table (admin-issued upgrade codes / tier grants)
-- Without this, any authenticated user can SELECT all rows and see who
-- has been granted upgrades and what email addresses received them.
-- Run in Supabase SQL Editor.

ALTER TABLE upgrade_grants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS upgrade_grants_admin ON upgrade_grants;

-- Only the admin account can read or manage grants
CREATE POLICY upgrade_grants_admin ON upgrade_grants
  FOR ALL TO authenticated
  USING     (auth.email() = 'nathan.gentil.ai@gmail.com')
  WITH CHECK (auth.email() = 'nathan.gentil.ai@gmail.com');
