-- Removes the DB-level remnants of the invoice-add-on and per-seat billing
-- systems, now that the client has no paywall UI left at all (Rat Bench
-- launches — and stays — completely free; monetization is planned to come
-- later via marketplace ads/sponsored listings instead, a different system
-- entirely). Same shape as remove_tier_system.sql's prior removal of the
-- old paid-tier system — restore the pre-billing behavior, drop what's now
-- orphaned, leave now-vestigial-but-harmless columns alone rather than risk
-- an irreversible DROP COLUMN for no remaining functional benefit.
--
-- join_company_by_invite() is restored to its exact pre-seat-billing form
-- from company_rpcs.sql (no seat-availability check at all) rather than
-- just always-true-ing the check in place — this is what that function
-- looked like before company_billing.sql ever added the gate, so "remove
-- the paywall" means literally reverting to that, not carrying forward
-- machinery that now always no-ops.
--
-- Deliberately NOT touched: companies.paid_seats / subscription_status /
-- stripe_customer_id / stripe_subscription_id / invoice_addon_status /
-- invoice_addon_subscription_id / invoice_usage — all now-vestigial but
-- harmless historical columns, same reasoning as remove_tier_system.sql's
-- profiles.tier. _paid_seats_in_use() is also left in place even though
-- nothing calls it anymore post this migration — cheap, harmless, and
-- deleting it would just be a second migration to re-add if seat billing
-- ever comes back and wants to reuse it.
--
-- Run in Supabase SQL Editor. Run this AFTER deleting the launch-flags rows
-- it also cleans up (see the DELETE below) — order doesn't actually matter
-- here since nothing else in this file depends on feature_flags, but this
-- is the file that removes them so they don't linger referencing
-- functionality the app no longer has any flag-driven behavior for.

-- ── Seat cap removed — joining a company is unlimited again ─────────────────
CREATE OR REPLACE FUNCTION join_company_by_invite(invite_code_input text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_uid        uuid := auth.uid();
  v_company_id uuid;
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

  -- Upsert so re-joining after leaving doesn't error
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
-- community/wiki/marketplace stay — those are still real, still-flag-driven
-- features. invoices_free/free_seats controlled functionality that no
-- longer exists in any form (free or paid), so the rows are just removed
-- rather than left around describing nothing.
DELETE FROM feature_flags WHERE key IN ('invoices_free', 'free_seats');
