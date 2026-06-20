-- Delete cascade fixes
-- Run in Supabase SQL Editor

-- ── 1. machines.client_id: clear on client delete ─────────────────────────
-- The UI already unlinks machines before deleting a client, but if that
-- fails mid-flight the machine is left with a dangling client_id.
-- ON DELETE SET NULL is the safe DB-level backstop.

ALTER TABLE machines
  DROP CONSTRAINT IF EXISTS machines_client_id_fkey;

ALTER TABLE machines
  ADD CONSTRAINT machines_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;


-- ── 2. rpc_remove_member: clean up all permissions + assignments ───────────
-- Called when an org admin removes a member.  The old implementation only
-- deleted the company_members row; it left behind:
--   • machine_permissions rows for org machines
--   • asset_permissions rows for provisioned tools / vehicles / equipment
--   • asset_assignments rows where that user was assigned to a vehicle

CREATE OR REPLACE FUNCTION rpc_remove_member(p_company_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role text;
BEGIN
  SELECT role INTO v_caller_role
  FROM company_members
  WHERE company_id = p_company_id AND user_id = auth.uid();

  IF v_caller_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Forbidden: only company owners and admins can remove members';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot remove yourself — use leave company instead';
  END IF;

  -- Prevent removing the company owner (would orphan the company)
  IF EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = p_company_id AND user_id = p_user_id AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Cannot remove the company owner — transfer ownership first';
  END IF;

  -- Revoke machine access
  DELETE FROM machine_permissions
  WHERE user_id = p_user_id
    AND machine_id IN (
      SELECT id FROM machines WHERE company_id = p_company_id
    );

  -- Revoke tool / vehicle / equipment provisioning
  DELETE FROM asset_permissions
  WHERE user_id    = p_user_id
    AND company_id = p_company_id;

  -- Remove from any vehicle crew assignments
  DELETE FROM asset_assignments
  WHERE child_type = 'member'
    AND child_id   = p_user_id::text
    AND parent_id  IN (
      SELECT id::text FROM vehicles WHERE company_id = p_company_id
    );

  -- Remove from company
  DELETE FROM company_members
  WHERE company_id = p_company_id
    AND user_id    = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_remove_member(uuid, uuid) TO authenticated;
