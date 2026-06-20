-- admin_audit_log and feature_flags tables with RLS.
-- These tables were being used by AdminPanel but had no tracked schema/RLS.
-- Run in Supabase SQL Editor.

-- ─── admin_audit_log ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  action       text        NOT NULL,
  target_email text,
  detail       text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_log_admin_only ON admin_audit_log;

-- Only admin can read the audit log — it contains user emails and upgrade codes
CREATE POLICY audit_log_admin_only ON admin_audit_log
  FOR ALL TO authenticated
  USING     (auth.email() = 'nathan.gentil.ai@gmail.com')
  WITH CHECK (auth.email() = 'nathan.gentil.ai@gmail.com');

-- SECURITY DEFINER functions (admin_delete_user, grant_upgrade, etc.) run as
-- the DB owner and bypass RLS when they INSERT into this table — no extra
-- GRANT is needed for those writes.

-- ─── feature_flags ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS feature_flags (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text        NOT NULL UNIQUE,
  label      text        NOT NULL,
  enabled    boolean     NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS feature_flags_admin_write ON feature_flags;
DROP POLICY IF EXISTS feature_flags_read        ON feature_flags;

-- Admin has full access (insert, update, delete)
CREATE POLICY feature_flags_admin_write ON feature_flags
  FOR ALL TO authenticated
  USING     (auth.email() = 'nathan.gentil.ai@gmail.com')
  WITH CHECK (auth.email() = 'nathan.gentil.ai@gmail.com');

-- All authenticated users can read flags (needed to gate features client-side)
CREATE POLICY feature_flags_read ON feature_flags
  FOR SELECT TO authenticated
  USING (true);
