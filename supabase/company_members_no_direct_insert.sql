-- Split cm_manage (FOR ALL) into UPDATE + DELETE only.
-- The FOR ALL policy allowed admins to INSERT arbitrary company_members rows
-- directly via PostgREST, bypassing the join_company_by_invite SECURITY DEFINER
-- RPC which enforces role='viewer' on join. A compromised admin could grant
-- themselves or another user admin-level access without going through the invite flow.
-- Routing all INSERTs through the SECURITY DEFINER RPC removes the attack surface.
-- Run in Supabase SQL Editor.

DROP POLICY IF EXISTS cm_manage        ON company_members;
DROP POLICY IF EXISTS cm_manage_update ON company_members;
DROP POLICY IF EXISTS cm_manage_delete ON company_members;

-- Admins can update member roles (but not escalate to 'owner')
CREATE POLICY cm_manage_update ON company_members
  FOR UPDATE TO authenticated
  USING     (_is_company_admin(company_id, auth.uid()))
  WITH CHECK (_is_company_admin(company_id, auth.uid()) AND role != 'owner');

-- Admins can remove members (owners are protected — rpc_remove_member blocks it)
CREATE POLICY cm_manage_delete ON company_members
  FOR DELETE TO authenticated
  USING (_is_company_admin(company_id, auth.uid()) AND role != 'owner');
