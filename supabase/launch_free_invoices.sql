-- Launch mode: invoices are free and uncapped for everyone, same as Quotes
-- always have been (see src/lib/launchFlags.js's INVOICES_FREE — keep this
-- file's _invoices_free() in sync with that constant if it ever changes).
-- The 5/month cap and $20/mo add-on machinery in invoice_addon_billing.sql
-- stays completely intact — this only teaches check_and_use_invoice_credit()
-- to treat "launch mode" the same as an active add-on: usage is still
-- tracked (so Billing's "X invoices this month" stays meaningful once this
-- flips back off), it's just never allowed to block.
--
-- Deliberately a separate file rather than editing invoice_addon_billing.sql
-- in place — same layering convention as inventory_recently_deleted.sql
-- extending recently_deleted.sql, so the original cap logic is never lost,
-- just bypassed, and reverting later is deleting this one file plus the
-- matching client-side flag rather than reconstructing anything.
--
-- Requires: invoice_addon_billing.sql already applied.
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION _invoices_free()
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT true;
$$;

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

  -- Launch mode or an active add-on both mean "never block" — usage is
  -- still tracked either way for the Billing tab's monthly count.
  IF _invoices_free() OR v_addon = 'active' THEN
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
