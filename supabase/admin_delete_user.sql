-- Admin: permanently delete a user and all their data from Supabase.
-- Run in Supabase SQL Editor to create the RPC.

CREATE OR REPLACE FUNCTION admin_delete_user(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'User not found');
  END IF;

  -- Remove from company/team memberships (don't delete the company itself)
  DELETE FROM company_members   WHERE user_id = v_user_id;
  DELETE FROM machine_permissions WHERE user_id = v_user_id;
  DELETE FROM asset_permissions   WHERE user_id = v_user_id;

  -- Delete all workshop data
  DELETE FROM machines        WHERE user_id = v_user_id;
  DELETE FROM clients         WHERE user_id = v_user_id;
  DELETE FROM inventory_items WHERE user_id = v_user_id;
  DELETE FROM vehicles        WHERE user_id = v_user_id;
  DELETE FROM equipment       WHERE user_id = v_user_id;
  DELETE FROM tools           WHERE user_id = v_user_id;
  DELETE FROM consumables     WHERE user_id = v_user_id;

  -- Profile row
  DELETE FROM profiles WHERE id = v_user_id;

  -- Auth user — cascades to anything we may have missed
  DELETE FROM auth.users WHERE id = v_user_id;

  -- Audit trail
  INSERT INTO admin_audit_log (action, target_email, detail)
  VALUES ('delete_user', p_email, 'account and all data permanently deleted');

  RETURN jsonb_build_object('ok', true);
END;
$$;
