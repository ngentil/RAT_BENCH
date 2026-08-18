-- Wires the launch-mode toggles (invoices free, Wiki hidden, Marketplace
-- hidden, free seat cap, plus a Community master switch — see
-- docs/FEATURE_MAP.md section 19) into the existing feature_flags table
-- (admin_tables_rls.sql) so they're flippable from the Admin Panel's Flags
-- tab at runtime, instead of requiring a code change + redeploy to touch
-- src/lib/launchFlags.js's old hardcoded constants (that file is now
-- deleted — this table is the single source of truth for all five).
--
-- feature_flags only had `enabled boolean` before; this adds a nullable
-- numeric `value` column so free_seats can carry its seat-count alongside
-- its on/off state, without a second table. Every other existing/future
-- flag just leaves value null.
--
-- Naming/polarity: every flag name is what "on" gives you (not what it
-- restricts), so the Admin Panel's ON/OFF button always reads naturally —
--   community      on = Community section reachable at all (master
--                  switch — see below); off overrides wiki/marketplace
--                  regardless of their own state
--   wiki           on = Wiki tab visible (still requires community on too)
--   marketplace    on = Marketplace + Messages visible (still requires
--                  community on too)
--   invoices_free  on = invoices free & uncapped (off = restores the
--                  original 5/month cap + $20/mo add-on)
--   free_seats     on = every company gets `value` free seats beyond the
--                  owner, no purchase required (off = restores the
--                  original paid-only per-seat model)
--
-- `community` is a pure master AND on top of wiki/marketplace, combined
-- client-side in src/lib/db/featureFlags.js's getFeatureFlags() — turning
-- community off hides Wiki and Marketplace together no matter what those
-- two switches say; turning community back on doesn't itself show
-- anything, it just stops overriding wiki/marketplace's own switches.
-- Defaults to true (unlocked) so today's two-switch behavior is unchanged
-- unless an admin deliberately reaches for this as a stronger override.
--
-- This file becomes the sole owner of _invoices_free() and _free_seat_cap()
-- once applied — launch_free_invoices.sql / launch_free_seats.sql each
-- define their own hardcoded version first, and re-running either of THOSE
-- files after this one would silently clobber the Admin Panel's control
-- over them (see the warning in each of those files' own header comment).
-- community/wiki/marketplace have no SQL-side enforcement at all (same as
-- before this file existed) — they're pure UI nav-visibility flags, not
-- backed by an RLS gate on wiki_entries/marketplace_listings.
--
-- Requires: launch_free_invoices.sql and launch_free_seats.sql already
-- applied, in that order. admin_tables_rls.sql is NOT actually required —
-- this file no longer assumes it was ever cleanly applied (see below).
-- Run in Supabase SQL Editor.

-- admin_tables_rls.sql's CREATE TABLE IF NOT EXISTS defines the full
-- intended shape (id/key/label/enabled/created_at), but if feature_flags
-- already existed before that file was written — e.g. created ad hoc via
-- the Supabase dashboard, which is exactly what its own header comment
-- says happened ("was being used by AdminPanel but had no tracked
-- schema/RLS") — CREATE TABLE IF NOT EXISTS is a silent no-op against it
-- and never adds whatever columns/constraints/RLS the live table is
-- missing. Rather than assume that file ever actually ran, this section
-- defensively brings the table up to its full intended shape no matter
-- which columns/policies already exist, so this file works standalone.
CREATE TABLE IF NOT EXISTS feature_flags (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text,
  label      text,
  enabled    boolean     NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS key text;
ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS label text;
ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT false;
ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS value integer;
-- Backfill any pre-existing rows (from before id/label/key were guaranteed
-- present) before locking any of them down as NOT NULL/unique, then apply
-- the constraints admin_tables_rls.sql always intended. id specifically
-- turned out to be missing on the live table too, not just label — the
-- client's toggle()/setNumericValue()/del() all key off .eq('id', f.id),
-- so every one of them failed with "column feature_flags.id does not
-- exist" until this ran.
UPDATE feature_flags SET id = gen_random_uuid() WHERE id IS NULL;
UPDATE feature_flags SET label = key WHERE label IS NULL AND key IS NOT NULL;
UPDATE feature_flags SET label = 'Untitled flag' WHERE label IS NULL;
ALTER TABLE feature_flags ALTER COLUMN id SET NOT NULL;
ALTER TABLE feature_flags ALTER COLUMN label SET NOT NULL;
ALTER TABLE feature_flags ALTER COLUMN key SET NOT NULL;
-- id needs to be unique for .eq('id', ...) lookups to be meaningful, and
-- ON CONFLICT (key) below needs a real unique constraint on key too, not
-- just "no duplicates happen to exist yet" — add both if the table didn't
-- already have them under some other name (a duplicate under a different
-- name would just be a harmless redundant index, not an error).
CREATE UNIQUE INDEX IF NOT EXISTS feature_flags_id_idx ON feature_flags (id);
DO $$
BEGIN
  ALTER TABLE feature_flags ADD CONSTRAINT feature_flags_key_key UNIQUE (key);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS feature_flags_admin_write ON feature_flags;
CREATE POLICY feature_flags_admin_write ON feature_flags
  FOR ALL TO authenticated
  USING     (auth.email() IN ('nathan.gentil.ai@gmail.com', 'nathan.gentil@gmail.com'))
  WITH CHECK (auth.email() IN ('nathan.gentil.ai@gmail.com', 'nathan.gentil@gmail.com'));

-- Seed the five rows if they don't already exist — matches the exact
-- behavior the app already ships with, so applying (or re-applying) this
-- file doesn't change anything until an admin touches a switch. ON
-- CONFLICT DO NOTHING so re-running this file never stomps on whatever an
-- admin has already set, and adding the `community` row here later (after
-- the original four were already seeded in production) is exactly as safe
-- as the first run — each row conflict-checks independently.
INSERT INTO feature_flags (key, label, enabled, value) VALUES
  ('community',     'Community section (master switch)', true,  null),
  ('wiki',          'Wiki',                              false, null),
  ('marketplace',   'Marketplace & Messages',             false, null),
  ('invoices_free', 'Free unlimited invoicing',           true,  null),
  ('free_seats',    'Free team seats (no seat purchase)', true,  10)
ON CONFLICT (key) DO NOTHING;

-- feature_flags previously only granted SELECT to `authenticated` — the
-- public wiki.ratbench.net subdomain and /marketplace, /listing/:id routes
-- (src/main.jsx) need to read these flags before any session exists at all
-- (a first-time anonymous visitor), so this also grants the built-in `anon`
-- role read access. Flags carry no sensitive data (just booleans/small
-- integers), so this is safe.
GRANT SELECT ON feature_flags TO anon;
DROP POLICY IF EXISTS feature_flags_read ON feature_flags;
CREATE POLICY feature_flags_read ON feature_flags
  FOR SELECT TO anon, authenticated
  USING (true);

-- Re-point the two launch-mode SQL helpers (originally hardcoded literals
-- in launch_free_invoices.sql / launch_free_seats.sql) at this table
-- instead, so flipping a switch in the Admin Panel takes effect immediately
-- server-side too — no separate SQL deploy needed to match a UI change.
-- STABLE (not IMMUTABLE, which the original versions incorrectly used) since
-- the result can now change between calls as the underlying row changes.
CREATE OR REPLACE FUNCTION _invoices_free()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT COALESCE((SELECT enabled FROM feature_flags WHERE key = 'invoices_free'), true);
$$;

-- Only apply the free floor when the flag is actually on — off means
-- GREATEST(paid_seats, 0) = paid_seats, i.e. exactly the original
-- paid-only behavior from company_billing.sql, no special-casing needed in
-- join_company_by_invite() itself.
CREATE OR REPLACE FUNCTION _free_seat_cap()
RETURNS integer LANGUAGE sql STABLE AS $$
  SELECT CASE WHEN COALESCE((SELECT enabled FROM feature_flags WHERE key = 'free_seats'), true)
    THEN COALESCE((SELECT value FROM feature_flags WHERE key = 'free_seats'), 10)
    ELSE 0
  END;
$$;
