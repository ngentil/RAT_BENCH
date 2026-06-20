-- RLS for announcements table
-- Restricts mutations to the admin account; all authenticated users can read.
-- Run in Supabase SQL Editor

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS anns_read        ON announcements;
DROP POLICY IF EXISTS anns_admin_write ON announcements;

-- All authenticated users can read active announcements
CREATE POLICY anns_read ON announcements
  FOR SELECT TO authenticated
  USING (true);

-- Only the admin account can insert / update / delete
-- Replace the email below if the admin email ever changes.
CREATE POLICY anns_admin_write ON announcements
  FOR ALL TO authenticated
  USING     (auth.email() = 'nathan.gentil.ai@gmail.com')
  WITH CHECK (auth.email() = 'nathan.gentil.ai@gmail.com');
