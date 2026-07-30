-- Per-company Invoice Add-on: unlocks unlimited invoice generation beyond
-- the free monthly cap (5 free invoices/company/calendar-month). Deliberately
-- a SEPARATE subscription from per-seat billing (company_billing.sql) —
-- a solo, owner-only company can have zero paid seats (seats start at 0 and
-- stay free until a second member joins) and still want just this add-on,
-- so it can't be piggybacked on the seat subscription. Shares the same
-- stripe_customer_id; gets its own stripe_subscription_id column since a
-- company may have both subscriptions active at once.
--
-- Quotes are never gated by any of this — only Invoice generation counts.
-- Regenerating an already-generated document from its stored snapshot
-- (Office tab's "Regenerate PDF", src/lib/invoicePdf.js regenerateDocument)
-- doesn't call into this table at all — it never touches billing_documents
-- or this credit check, since no new content is being billed. Only
-- generateInvoicePDF's docType==='invoice' path (first-time, "New Copy", AND
-- "Merge into it") consumes a credit — merge still counts because it brings
-- in newly-logged hours/parts, i.e. genuinely new billable content, even
-- though it reuses the old invoice number.
--
-- invoice_addon_status/invoice_addon_subscription_id are only ever written by
-- the update-invoice-addon edge function or the stripe-webhook, same
-- service-role-only pattern as paid_seats/subscription_status.
--
-- Requires: company_billing.sql (for companies.stripe_customer_id and the
-- REVOKE/GRANT column-restriction pattern this re-issues).
-- Run in Supabase SQL Editor.

ALTER TABLE companies ADD COLUMN IF NOT EXISTS invoice_addon_status text NOT NULL DEFAULT 'inactive';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS invoice_addon_subscription_id text;
-- Per-calendar-month invoice usage, keyed "YYYY-MM" -> count. A JSONB map
-- rather than a single counter + reset job — mirrors next_invoice_number's
-- existing per-year-key pattern in profiles.preferences — so a new month
-- just starts an implicit fresh key instead of needing a cron reset.
ALTER TABLE companies ADD COLUMN IF NOT EXISTS invoice_usage jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Re-issue the *complete* companies SELECT column list (company_billing.sql's
-- own convention) plus the two new columns — every member can see usage/
-- add-on status (so they understand why an invoice might be blocked), but
-- not invoice_addon_subscription_id, which stays owner-only via get_my_company().
REVOKE SELECT ON companies FROM authenticated;
GRANT SELECT (
  id, name, trading_name, abn, phone, email, website, address, city, state,
  postcode, country, industry, logo, hourly_rate, tax_rate, tax_label,
  invite_code, tier, created_at, paid_seats, subscription_status,
  invoice_addon_status, invoice_usage
) ON companies TO authenticated;

-- Atomically checks entitlement and consumes one invoice credit in a single
-- statement (FOR UPDATE locks the row for the transaction's duration, so two
-- near-simultaneous invoice generations can't both slip in under the same
-- last free credit). Returns what happened rather than just true/false, so
-- the client can show "3/5 used" style messaging without a second query.
CREATE OR REPLACE FUNCTION check_and_use_invoice_credit(p_company_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_month  text := to_char(now(), 'YYYY-MM');
  v_usage  jsonb;
  v_addon  text;
  v_used   integer;
  v_cap    constant integer := 5;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = p_company_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT invoice_usage, invoice_addon_status INTO v_usage, v_addon
  FROM companies WHERE id = p_company_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Company not found';
  END IF;

  v_used := COALESCE((v_usage ->> v_month)::int, 0);

  -- An active add-on never blocks, but usage is still tracked for the
  -- Billing tab's "X invoices this month" display.
  IF v_addon = 'active' THEN
    v_used := v_used + 1;
    UPDATE companies SET invoice_usage = v_usage || jsonb_build_object(v_month, v_used)
    WHERE id = p_company_id;
    RETURN jsonb_build_object('allowed', true, 'used', v_used, 'cap', null);
  END IF;

  IF v_used >= v_cap THEN
    RETURN jsonb_build_object('allowed', false, 'used', v_used, 'cap', v_cap);
  END IF;

  v_used := v_used + 1;
  UPDATE companies SET invoice_usage = v_usage || jsonb_build_object(v_month, v_used)
  WHERE id = p_company_id;
  RETURN jsonb_build_object('allowed', true, 'used', v_used, 'cap', v_cap);
END;
$$;

GRANT EXECUTE ON FUNCTION check_and_use_invoice_credit(uuid) TO authenticated;
