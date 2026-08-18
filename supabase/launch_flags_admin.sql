-- Sets up the entire admin-controllable launch-flags system in one file:
-- brings the feature_flags table up to full shape no matter what state it's
-- actually in live, wires it up with RLS, seeds the three real launch flags
-- (community/wiki/marketplace) plus a plain unpaid member_cap, and defines
-- join_company_by_invite() in its final form enforcing that cap — no
-- billing involved anywhere. See docs/FEATURE_MAP.md section 19.
--
-- History (why this one file exists instead of several): this started as
-- three separate migrations applied same-day — launch_flags_admin.sql
-- (schema + seed + a bypass for the invoice/seat paywall), a standalone
-- member_cap.sql (re-adding a plain cap after the paywall was deleted
-- outright), and remove_paywall_system.sql (dropping the paywall's
-- orphaned functions/flags). Two different files each redefined
-- join_company_by_invite() at different points, which meant running them
-- out of order — or re-running an earlier one after a later one — could
-- silently revert the function to an earlier, wrong form. Also turned out
-- the live feature_flags table was missing not just `label` but `id`
-- entirely, discovered only because every Admin Panel toggle failed with
-- "column feature_flags.id does not exist" and had no error message to
-- explain why until that got fixed too. All of that is now one file that
-- defines every function exactly once, already in its final form, so
-- there's nothing left for a re-run — of this file, in any order, any
-- number of times — to clobber.
--
-- Naming/polarity: every flag name is what "on" gives you (not what it
-- restricts) —
--   community    on = Community section reachable at all (master switch);
--                off overrides wiki/marketplace regardless of their own state
--   wiki         on = Wiki tab + public wiki.ratbench.net visible (also
--                requires community on)
--   marketplace  on = Marketplace + Messages tabs + public /marketplace,
--                /listing pages visible (also requires community on)
--   member_cap   on = every company capped at `value` members beyond the
--                owner (who never counts against it) — a plain
--                abuse-prevention limit, nothing to do with billing. Off =
--                unlimited members for every company.
-- `community` combines with wiki/marketplace entirely client-side, in
-- src/lib/db/featureFlags.js's getFeatureFlags() — not a fourth field of
-- its own, since every consumer just reads flags.wiki/flags.marketplace.
--
-- Deliberately NOT touched: companies.paid_seats / subscription_status /
-- stripe_customer_id / stripe_subscription_id / invoice_addon_status /
-- invoice_addon_subscription_id / invoice_usage — all now-vestigial but
-- harmless historical columns from the deleted paywall, same reasoning
-- remove_tier_system.sql used for profiles.tier: dropping columns other
-- code might still reference is a needless, irreversible risk for no
-- remaining functional benefit. _paid_seats_in_use() (company_billing.sql)
-- is reused unchanged for the member count below despite its now-stale
-- name — a rename earns nothing functional.
--
-- Requires: company_billing.sql (_paid_seats_in_use()). Does NOT require
-- admin_tables_rls.sql, invoice_addon_billing.sql, launch_free_invoices.sql,
-- or launch_free_seats.sql to have ever been applied — this file assumes
-- nothing about the table's prior state and brings it up to full shape
-- itself. Safe to re-run on its own, any time, any number of times.
-- Run in Supabase SQL Editor.

-- ── feature_flags: bring the table up to full shape regardless of its
-- actual current state (it may not exist at all, or may be missing any
-- subset of these columns/constraints from being created ad hoc before any
-- migration file ever described it) ─────────────────────────────────────────
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
-- Backfill any pre-existing rows before locking columns down as NOT
-- NULL/unique. The client's toggle()/setNumericValue()/del() all key off
-- .eq('id', f.id) — without a real id every one of them fails outright.
UPDATE feature_flags SET id = gen_random_uuid() WHERE id IS NULL;
UPDATE feature_flags SET label = key WHERE label IS NULL AND key IS NOT NULL;
UPDATE feature_flags SET label = 'Untitled flag' WHERE label IS NULL;
ALTER TABLE feature_flags ALTER COLUMN id SET NOT NULL;
ALTER TABLE feature_flags ALTER COLUMN label SET NOT NULL;
ALTER TABLE feature_flags ALTER COLUMN key SET NOT NULL;
-- id needs to be unique for .eq('id', ...) to be meaningful; key needs a
-- real unique constraint for ON CONFLICT (key) below to work at all — add
-- both if the table didn't already have them under some other name (a
-- duplicate under a different name is just a harmless redundant index).
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
-- The public wiki.ratbench.net subdomain and /marketplace, /listing/:id
-- routes (src/main.jsx) need to read these flags before any session
-- exists at all (a first-time anonymous visitor), so this also grants the
-- built-in `anon` role read access. Flags carry no sensitive data (just
-- booleans/small integers), so this is safe.
GRANT SELECT ON feature_flags TO anon;
DROP POLICY IF EXISTS feature_flags_read ON feature_flags;
CREATE POLICY feature_flags_read ON feature_flags
  FOR SELECT TO anon, authenticated
  USING (true);

-- Seed the four real flags if they don't already exist — matches the exact
-- behavior the app ships with, so applying (or re-applying) this file
-- doesn't change anything until an admin touches a switch. ON CONFLICT DO
-- NOTHING so re-running never stomps on whatever an admin has already set.
INSERT INTO feature_flags (key, label, enabled, value) VALUES
  ('community',   'Community section (master switch)',  true, null),
  ('wiki',        'Wiki',                                false, null),
  ('marketplace', 'Marketplace & Messages',              false, null),
  ('member_cap',  'Team member limit (per company)',     true, 10)
ON CONFLICT (key) DO NOTHING;

-- NULL means uncapped (flag off) — deliberately not 0, which would mean
-- "cap at zero members," the opposite of what "off" should do.
CREATE OR REPLACE FUNCTION _member_cap()
RETURNS integer LANGUAGE sql STABLE AS $$
  SELECT CASE WHEN COALESCE((SELECT enabled FROM feature_flags WHERE key = 'member_cap'), true)
    THEN COALESCE((SELECT value FROM feature_flags WHERE key = 'member_cap'), 10)
    ELSE NULL
  END;
$$;

-- ── join_company_by_invite(), final form ─────────────────────────────────────
-- No paid_seats/billing involvement at all — gated purely by _member_cap().
CREATE OR REPLACE FUNCTION join_company_by_invite(invite_code_input text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_uid        uuid := auth.uid();
  v_company_id uuid;
  v_cap        integer := _member_cap();
  v_already_member boolean;
BEGIN
  SELECT id INTO v_company_id
  FROM companies
  WHERE invite_code = upper(trim(invite_code_input));

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  -- Prevent joining if already a member of a different company
  IF EXISTS (
    SELECT 1 FROM company_members
    WHERE user_id = v_uid AND company_id != v_company_id
  ) THEN
    RAISE EXCEPTION 'Leave your current organisation before joining another';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM company_members WHERE company_id = v_company_id AND user_id = v_uid
  ) INTO v_already_member;

  -- Only a genuinely new member counts against the cap — rejoining after
  -- leaving (or an ON CONFLICT no-op below) doesn't need a fresh check.
  IF NOT v_already_member AND v_cap IS NOT NULL THEN
    IF _paid_seats_in_use(v_company_id) >= v_cap THEN
      RAISE EXCEPTION 'This organisation has reached its member limit — ask the owner to free up a spot before you can join';
    END IF;
  END IF;

  INSERT INTO company_members (company_id, user_id, role, joined_at)
  VALUES (v_company_id, v_uid, 'viewer', now())
  ON CONFLICT (company_id, user_id) DO NOTHING;

  UPDATE profiles SET company_id = v_company_id WHERE id = v_uid;

  RETURN v_company_id;
END;
$$;

GRANT EXECUTE ON FUNCTION join_company_by_invite(text) TO authenticated;

-- ── Cleanup: orphaned billing-gate RPCs and stale flag rows ──────────────────
-- Nothing calls any of these anymore — BillingSection.jsx, InvoicePaywallModal.jsx,
-- src/lib/billing.js, and src/lib/db/invoiceCredits.js were all deleted from
-- the client. Harmless no-ops if they were never created on this database.
DROP FUNCTION IF EXISTS check_and_use_invoice_credit(uuid);
DROP FUNCTION IF EXISTS _invoices_free();
DROP FUNCTION IF EXISTS _free_seat_cap();
-- invoices_free/free_seats controlled functionality that no longer exists
-- in any form (free or paid) — remove the rows rather than leave them
-- around describing nothing. Harmless no-op if they were never seeded.
DELETE FROM feature_flags WHERE key IN ('invoices_free', 'free_seats');
