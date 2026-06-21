-- Restrict SELECT on companies to safe columns (mirror the pattern used for profiles).
-- Without this, any company member (even viewer role) can call select("*") on companies
-- and read stripe_customer_id + stripe_subscription_id. While these alone can't be used
-- to charge, they leak billing metadata and can be used for enumeration.
-- A get_my_company() SECURITY DEFINER RPC returns the full row for members
-- (analogous to get_my_profile()).
-- Run in Supabase SQL Editor.

REVOKE SELECT ON companies FROM authenticated;

GRANT SELECT (
  id, name, trading_name, abn, phone, email, website, address, city, state,
  postcode, country, industry, logo, hourly_rate, tax_rate, tax_label,
  invite_code, tier, created_at
) ON companies TO authenticated;

-- Full-row access via SECURITY DEFINER — returns own company only
CREATE OR REPLACE FUNCTION get_my_company(p_company_id uuid)
RETURNS SETOF companies
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM companies
  WHERE id = p_company_id
    AND EXISTS (
      SELECT 1 FROM company_members
      WHERE company_id = p_company_id AND user_id = auth.uid()
    );
$$;

GRANT EXECUTE ON FUNCTION get_my_company(uuid) TO authenticated;
