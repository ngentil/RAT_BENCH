-- RLS for profiles, companies, company_members
-- Also fixes asset_permissions policies to use SECURITY DEFINER helpers
-- so they don't break when company_members gets RLS enabled.
-- Run in Supabase SQL Editor.

-- ── SECURITY DEFINER helpers (break RLS recursion) ───────────────────────────
-- asset_permissions policies already query company_members directly.
-- Once company_members has RLS those subqueries would recurse infinitely.
-- Running through a SECURITY DEFINER function executes as DB owner,
-- bypassing the RLS check on company_members.

CREATE OR REPLACE FUNCTION _is_company_member(cid uuid, uid uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = cid AND user_id = uid
  );
$$;

CREATE OR REPLACE FUNCTION _is_company_admin(cid uuid, uid uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = cid AND user_id = uid
      AND role IN ('owner', 'admin')
  );
$$;

GRANT EXECUTE ON FUNCTION _is_company_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION _is_company_admin(uuid, uuid)  TO authenticated;


-- ── company_members ───────────────────────────────────────────────────────────

ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cm_read   ON company_members;
DROP POLICY IF EXISTS cm_manage ON company_members;
DROP POLICY IF EXISTS cm_leave  ON company_members;

-- Members can see the full member list for their own company
CREATE POLICY cm_read ON company_members
  FOR SELECT TO authenticated
  USING (_is_company_member(company_id, auth.uid()));

-- Owners/admins can add, update, or remove members
CREATE POLICY cm_manage ON company_members
  FOR ALL TO authenticated
  USING     (_is_company_admin(company_id, auth.uid()))
  WITH CHECK (_is_company_admin(company_id, auth.uid()));

-- Users can remove themselves (leave)
CREATE POLICY cm_leave ON company_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());


-- ── companies ─────────────────────────────────────────────────────────────────

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS companies_read   ON companies;
DROP POLICY IF EXISTS companies_manage ON companies;
DROP POLICY IF EXISTS companies_create ON companies;

-- Members can read their company's details
CREATE POLICY companies_read ON companies
  FOR SELECT TO authenticated
  USING (_is_company_member(id, auth.uid()));

-- Owners/admins can update company settings
CREATE POLICY companies_manage ON companies
  FOR UPDATE TO authenticated
  USING     (_is_company_admin(id, auth.uid()))
  WITH CHECK (_is_company_admin(id, auth.uid()));

-- Authenticated users can create a company (rpc_create_company is SECURITY DEFINER
-- and will also insert the owner into company_members)
CREATE POLICY companies_create ON companies
  FOR INSERT TO authenticated
  WITH CHECK (true);


-- ── Fix asset_permissions to use SECURITY DEFINER helpers ────────────────────
-- The existing policies query company_members inline; those subqueries now
-- go through the SECURITY DEFINER functions so RLS on company_members
-- doesn't interfere.

DROP POLICY IF EXISTS "asset_permissions_org_read"   ON asset_permissions;
DROP POLICY IF EXISTS "asset_permissions_org_manage" ON asset_permissions;

CREATE POLICY "asset_permissions_org_read" ON asset_permissions
  FOR SELECT TO authenticated
  USING (_is_company_member(company_id, auth.uid()));

CREATE POLICY "asset_permissions_org_manage" ON asset_permissions
  FOR ALL TO authenticated
  USING     (_is_company_admin(company_id, auth.uid()))
  WITH CHECK (_is_company_admin(company_id, auth.uid()));


-- ── profiles ──────────────────────────────────────────────────────────────────
-- profiles are created automatically by a Supabase trigger on auth.users,
-- so no INSERT policy is needed for the authenticated role.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_read  ON profiles;
DROP POLICY IF EXISTS profiles_write ON profiles;

-- All authenticated users can read any profile.
-- Usernames and display names are public-facing (wiki attribution, member lists).
CREATE POLICY profiles_read ON profiles
  FOR SELECT TO authenticated
  USING (true);

-- Users can only update their own profile row.
CREATE POLICY profiles_write ON profiles
  FOR UPDATE TO authenticated
  USING     (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Column-level write restrictions: prevent self-escalation of tier/billing fields.
-- SECURITY DEFINER functions (admin_set_tier, apply_pending_upgrade, stripe webhook, etc.)
-- run as the DB owner and bypass column-level grants, so they can still write any column.
REVOKE UPDATE ON profiles FROM authenticated;

GRANT UPDATE (
  display_name,
  username,
  units,
  default_status,
  tab_order,
  preferences,
  storage_policy_enabled,
  storage_tiers
) ON profiles TO authenticated;
