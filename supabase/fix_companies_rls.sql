-- Fix: apply RLS policies and column-level grants for the companies table.
-- Run in Supabase SQL Editor if you see "permission denied for table companies".

-- Helper functions (break RLS recursion in asset_permissions policies)
CREATE OR REPLACE FUNCTION _is_company_member(cid uuid, uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM company_members WHERE company_id = cid AND user_id = uid);
$$;

CREATE OR REPLACE FUNCTION _is_company_admin(cid uuid, uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM company_members WHERE company_id = cid AND user_id = uid
    AND role IN ('owner', 'admin'));
$$;

GRANT EXECUTE ON FUNCTION _is_company_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION _is_company_admin(uuid, uuid)  TO authenticated;

-- RLS policies for companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS companies_read   ON companies;
DROP POLICY IF EXISTS companies_manage ON companies;
DROP POLICY IF EXISTS companies_create ON companies;

CREATE POLICY companies_read ON companies
  FOR SELECT TO authenticated
  USING (_is_company_member(id, auth.uid()));

CREATE POLICY companies_manage ON companies
  FOR UPDATE TO authenticated
  USING     (_is_company_admin(id, auth.uid()))
  WITH CHECK (_is_company_admin(id, auth.uid()));

-- Column-level UPDATE grants (prevents billing tier self-escalation via direct API)
REVOKE UPDATE ON companies FROM authenticated;
GRANT UPDATE (
  name, trading_name, abn, phone, email, website,
  address, city, state, postcode, country,
  industry, logo, hourly_rate, tax_rate, tax_label,
  invite_code
) ON companies TO authenticated;
