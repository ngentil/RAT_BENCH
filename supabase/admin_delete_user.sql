-- Admin: permanently delete a user and all their data from Supabase.
-- Run in Supabase SQL Editor.
-- Replaces the old email-based version — drop it first.

DROP FUNCTION IF EXISTS admin_delete_user(text);
DROP FUNCTION IF EXISTS admin_delete_user(uuid);

CREATE OR REPLACE FUNCTION admin_delete_user(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'User not found');
  END IF;

  -- Remove from teams (don't delete the company itself)
  DELETE FROM company_members    WHERE user_id = p_user_id;
  DELETE FROM machine_permissions WHERE user_id = p_user_id;
  DELETE FROM asset_permissions   WHERE user_id = p_user_id;

  -- Delete dependent rows before machines to avoid FK violations
  DELETE FROM services         WHERE machine_id IN (SELECT id FROM machines WHERE user_id = p_user_id);
  DELETE FROM machine_bookings WHERE machine_id IN (SELECT id FROM machines WHERE user_id = p_user_id);

  -- Workshop data
  DELETE FROM machines        WHERE user_id = p_user_id;
  DELETE FROM clients         WHERE user_id = p_user_id;
  DELETE FROM inventory_items WHERE user_id = p_user_id;
  DELETE FROM vehicles        WHERE user_id = p_user_id;
  DELETE FROM equipment       WHERE user_id = p_user_id;
  DELETE FROM tools           WHERE user_id = p_user_id;
  DELETE FROM consumables     WHERE user_id = p_user_id;

  -- Wiki: contributions first (FK child), then revisions, then entries
  DELETE FROM wiki_contributions WHERE user_id    = p_user_id;
  DELETE FROM wiki_revisions     WHERE edited_by  = p_user_id;
  DELETE FROM wiki_entries       WHERE created_by = p_user_id;

  -- Asset assignments owned by this user
  DELETE FROM asset_assignments WHERE user_id = p_user_id;

  DELETE FROM profiles   WHERE id = p_user_id;
  DELETE FROM auth.users WHERE id = p_user_id;

  INSERT INTO admin_audit_log (action, target_email, detail)
  VALUES ('delete_user', COALESCE(v_email, 'guest:' || p_user_id::text), 'permanently deleted');

  RETURN jsonb_build_object('ok', true);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;
