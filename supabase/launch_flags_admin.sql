-- Wires the launch-mode toggles (invoices free, Wiki hidden, Marketplace
-- hidden, free seat cap — see docs/FEATURE_MAP.md section 19) into the
-- existing feature_flags table (admin_tables_rls.sql) so they're flippable
-- from the Admin Panel's Flags tab at runtime, instead of requiring a code
-- change + redeploy to touch src/lib/launchFlags.js's old hardcoded
-- constants (that file is now deleted — this table is the single source of
-- truth for all four).
--
-- feature_flags only had `enabled boolean` before; this adds a nullable
-- numeric `value` column so free_seats can carry its seat-count alongside
-- its on/off state, without a second table. Every other existing/future
-- flag just leaves value null.
--
-- Naming/polarity: every flag name is what "on" gives you (not what it
-- restricts), so the Admin Panel's ON/OFF button always reads naturally —
--   wiki           on = Wiki tab visible
--   marketplace    on = Marketplace + Messages visible
--   invoices_free  on = invoices free & uncapped (off = restores the
--                  original 5/month cap + $20/mo add-on)
--   free_seats     on = every company gets `value` free seats beyond the
--                  owner, no purchase required (off = restores the
--                  original paid-only per-seat model)
--
-- This file becomes the sole owner of _invoices_free() and _free_seat_cap()
-- once applied — launch_free_invoices.sql / launch_free_seats.sql each
-- define their own hardcoded version first, and re-running either of THOSE
-- files after this one would silently clobber the Admin Panel's control
-- over them (see the warning in each of those files' own header comment).
--
-- Requires: admin_tables_rls.sql (feature_flags table), launch_free_invoices.sql,
-- and launch_free_seats.sql already applied, in that order.
-- Run in Supabase SQL Editor.

ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS value integer;

-- Seed the four rows if they don't already exist — matches the exact
-- behavior the old hardcoded launchFlags.js constants shipped with, so
-- applying this file doesn't change anything until an admin touches a
-- switch. ON CONFLICT DO NOTHING so re-running this file never stomps on
-- whatever an admin has already set.
INSERT INTO feature_flags (key, label, enabled, value) VALUES
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
