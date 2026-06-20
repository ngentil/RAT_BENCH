-- rpc_leave_company: self-leave with full permission cleanup.
-- Unlike a direct company_members DELETE, this also removes machine_permissions
-- and asset_permissions so the leaving member loses all provisioned access.
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION rpc_leave_company(p_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Owners cannot leave — they must transfer ownership or delete the company
  IF EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = p_company_id AND user_id = v_uid AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Owner cannot leave — transfer ownership or delete the company first';
  END IF;

  -- Revoke provisioned machine access
  DELETE FROM machine_permissions
  WHERE user_id = v_uid
    AND machine_id IN (
      SELECT id FROM machines WHERE company_id = p_company_id
    );

  -- Revoke provisioned asset access
  DELETE FROM asset_permissions
  WHERE user_id    = v_uid
    AND company_id = p_company_id;

  -- Leave the company
  DELETE FROM company_members
  WHERE company_id = p_company_id AND user_id = v_uid;

  -- Clear company link on profile
  UPDATE profiles SET company_id = NULL WHERE id = v_uid;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_leave_company(uuid) TO authenticated;
