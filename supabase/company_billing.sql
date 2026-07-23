-- Per-seat company billing.
--
-- Pricing model: the company owner's own membership is always free. Every
-- OTHER member (admin, technician, or viewer role — any non-owner row in
-- company_members) requires one purchased seat. Individual/solo accounts
-- (no company) and the Tracker/Wiki/Marketplace themselves are never gated
-- by any of this — this only ever touches the company invite/join path.
--
-- companies.stripe_customer_id / stripe_subscription_id already exist from
-- the earlier (removed) tier system and were deliberately left in place —
-- reused here rather than re-added. paid_seats/subscription_status are new.
--
-- paid_seats/subscription_status are only ever written by the stripe-webhook
-- edge function (using the service-role key, which bypasses RLS/grants
-- entirely) — never directly by a client, same pattern already used for
-- tier/stripe_* fields. The client-facing seat *count* the owner wants is
-- requested through the update-seat-subscription edge function, which asks
-- Stripe to change the subscription quantity; the webhook is the only thing
-- that then updates paid_seats once Stripe confirms it.
--
-- Requires: company_rpcs.sql, company_columns_restrict.sql, org_and_profiles_rls.sql.
-- Run in Supabase SQL Editor.

ALTER TABLE companies ADD COLUMN IF NOT EXISTS paid_seats integer NOT NULL DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'inactive';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS last_billing_action_at timestamptz;

-- Re-issue the *complete* companies SELECT column list (company_columns_restrict.sql's
-- own convention) plus the two new columns — every member can see seat count/status
-- (so they understand why an invite might be blocked), but not stripe_customer_id/
-- stripe_subscription_id, which stay owner-only via get_my_company().
REVOKE SELECT ON companies FROM authenticated;
GRANT SELECT (
  id, name, trading_name, abn, phone, email, website, address, city, state,
  postcode, country, industry, logo, hourly_rate, tax_rate, tax_label,
  invite_code, tier, created_at, paid_seats, subscription_status
) ON companies TO authenticated;

-- Counts seats actually in use — every non-owner member of a company.
-- SECURITY DEFINER so it can be called from RLS-sensitive contexts without
-- re-triggering company_members' own RLS.
CREATE OR REPLACE FUNCTION _paid_seats_in_use(p_company_id uuid)
RETURNS integer
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT COUNT(*)::integer FROM company_members
  WHERE company_id = p_company_id AND role != 'owner';
$$;

-- Replaces join_company_by_invite() from company_rpcs.sql — same signature,
-- adds a seat-availability check before the insert. Locks the companies row
-- for the duration of the check+insert so two people joining at the same
-- instant can't both slip in under the same last available seat.
CREATE OR REPLACE FUNCTION join_company_by_invite(invite_code_input text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_uid        uuid := auth.uid();
  v_company_id uuid;
  v_paid_seats integer;
  v_in_use     integer;
  v_already_member boolean;
BEGIN
  SELECT id, paid_seats INTO v_company_id, v_paid_seats
  FROM companies
  WHERE invite_code = upper(trim(invite_code_input))
  FOR UPDATE;

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

  -- Only a genuinely new member consumes a seat — rejoining after leaving
  -- (or an ON CONFLICT no-op below) doesn't need a fresh seat check.
  IF NOT v_already_member THEN
    v_in_use := _paid_seats_in_use(v_company_id);
    IF v_in_use >= v_paid_seats THEN
      RAISE EXCEPTION 'This organisation has no available seats — ask the owner to add more in Billing before you can join';
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
GRANT EXECUTE ON FUNCTION _paid_seats_in_use(uuid) TO authenticated;

-- Internal helper for the create-billing-setup / update-seat-subscription edge
-- functions to atomically stamp last_billing_action_at, mirroring
-- _set_portal_session_at()'s rate-limit pattern for the old create-portal
-- function. NOT granted to authenticated — only callable by service_role
-- (edge functions), so a client can't call it directly to reset their own
-- rate-limit timestamp.
CREATE OR REPLACE FUNCTION _set_billing_action_at(p_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE companies SET last_billing_action_at = now() WHERE id = p_company_id;
END;
$$;
