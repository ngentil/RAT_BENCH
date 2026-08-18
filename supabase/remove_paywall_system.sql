-- Removes the DB-level remnants of the invoice-add-on and per-seat billing
-- systems, now that the client has no paywall UI left at all (Rat Bench
-- launches — and stays — completely free; monetization is planned to come
-- later via marketplace ads/sponsored listings instead, a different system
-- entirely), and puts a plain, unpaid member-count cap back in its place.
--
-- Originally shipped as two files (this one, deleting the paywall down to
-- an unrestricted join_company_by_invite(); a separate member_cap.sql
-- redefining that same function again to add the cap back) — running them
-- out of order, or running just this one a second time on its own, would
-- silently wipe out the member cap by reverting join_company_by_invite()
-- to unrestricted. Merged into one file the same day specifically to make
-- that ordering trap impossible: the function is now defined exactly once
-- here, already in its final (capped) form.
--
-- Deliberately NOT touched: companies.paid_seats / subscription_status /
-- stripe_customer_id / stripe_subscription_id / invoice_addon_status /
-- invoice_addon_subscription_id / invoice_usage — all now-vestigial but
-- harmless historical columns, same reasoning as remove_tier_system.sql's
-- profiles.tier. _paid_seats_in_use() is reused unchanged for the member
-- count below despite its now-stale name — same reasoning, a rename earns
-- nothing functional.
--
-- Naming/polarity of the member_cap flag: "on" means the cap is active
-- (matches every other launch flag's convention — see launch_flags_admin.sql
-- for the full explanation) — flip it off entirely for genuinely unlimited
-- members, or change the number, both from the Admin Panel with no
-- redeploy. Defaults to enabled=true, value=10.
--
-- Requires: company_billing.sql (_paid_seats_in_use()), invoice_addon_billing.sql,
-- and admin_tables_rls.sql (feature_flags table) already applied.
-- Safe to re-run this file on its own at any time — everything in it is
-- idempotent and there is no other file that also defines
-- join_company_by_invite(), so there's nothing left for a re-run to clobber.
-- Run in Supabase SQL Editor.

INSERT INTO feature_flags (key, label, enabled, value) VALUES
  ('member_cap', 'Team member limit (per company)', true, 10)
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

-- ── Orphaned billing-gate RPCs ───────────────────────────────────────────────
-- Nothing calls any of these anymore — BillingSection.jsx, InvoicePaywallModal.jsx,
-- src/lib/billing.js, and src/lib/db/invoiceCredits.js were all deleted from
-- the client, and the launch-mode bypass layer (launch_flags_admin.sql) that
-- used to redefine _invoices_free()/_free_seat_cap() has nothing left to gate.
DROP FUNCTION IF EXISTS check_and_use_invoice_credit(uuid);
DROP FUNCTION IF EXISTS _invoices_free();
DROP FUNCTION IF EXISTS _free_seat_cap();

-- ── Now-meaningless launch flags ─────────────────────────────────────────────
-- community/wiki/marketplace/member_cap stay — those are still real,
-- still-flag-driven features/limits. invoices_free/free_seats controlled
-- functionality that no longer exists in any form (free or paid), so the
-- rows are just removed rather than left around describing nothing.
DELETE FROM feature_flags WHERE key IN ('invoices_free', 'free_seats');
