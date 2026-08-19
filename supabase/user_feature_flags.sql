-- Per-user feature flag overrides — lets an admin flip a launch flag on
-- (or off) for one hand-picked user regardless of what the global flag in
-- feature_flags says, so a new feature (starting with wiki/marketplace) can
-- be tested by a controlled group before it's rolled out publicly. This is
-- deliberately a separate table/mechanism alongside launch_flags_admin.sql,
-- not a replacement — the global Flags tab and feature_flags table are
-- untouched. See docs/FEATURE_MAP.md.
--
-- Surfaced in the Admin Panel's existing Users tab (per-user row, next to
-- Deactivate/Del Wiki/Delete) rather than a new screen.
--
-- Read side: src/lib/db/featureFlags.js's getFeatureFlags() checks this
-- table for the logged-in user's own overrides (self-scoped via RLS + an
-- explicit .eq('user_id', ...) filter) and lets a present row win over the
-- global flag, in either direction — enabled=true unblocks a feature that's
-- globally off, enabled=false blocks one that's globally on. No row for a
-- given flag_key = fall through to the global value, same as always.
-- Safe to re-run on its own, any time, any number of times.

CREATE TABLE IF NOT EXISTS user_feature_flags (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flag_key   text NOT NULL,
  enabled    boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, flag_key)
);

ALTER TABLE user_feature_flags ENABLE ROW LEVEL SECURITY;

-- Admin: full read/write over every user's overrides, same admin emails as
-- feature_flags_admin_write.
DROP POLICY IF EXISTS user_feature_flags_admin_write ON user_feature_flags;
CREATE POLICY user_feature_flags_admin_write ON user_feature_flags
  FOR ALL TO authenticated
  USING     (auth.email() IN ('nathan.gentil.ai@gmail.com', 'nathan.gentil@gmail.com'))
  WITH CHECK (auth.email() IN ('nathan.gentil.ai@gmail.com', 'nathan.gentil@gmail.com'));

-- Self: a logged-in user can read (only) their own override rows — needed
-- so getFeatureFlags() can see them on every ordinary session, not just an
-- admin's.
DROP POLICY IF EXISTS user_feature_flags_self_read ON user_feature_flags;
CREATE POLICY user_feature_flags_self_read ON user_feature_flags
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
