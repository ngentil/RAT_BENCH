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
  IF auth.email() NOT IN ('nathan.gentil.ai@gmail.com', 'nathan.gentil@gmail.com') THEN
    RETURN jsonb_build_object('error', 'Access denied');
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'User not found');
  END IF;

  -- If user is the sole owner of any company, reset that company to free tier
  -- so it doesn't keep a paid subscription with no owner to manage it.
  UPDATE companies SET tier = 'free', stripe_subscription_id = NULL
  WHERE id IN (
    SELECT company_id FROM company_members
    WHERE user_id = p_user_id AND role = 'owner'
  )
  AND NOT EXISTS (
    SELECT 1 FROM company_members cm2
    WHERE cm2.company_id = companies.id
      AND cm2.user_id   != p_user_id
      AND cm2.role = 'owner'
  );

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

  -- Wiki: preserve all community content — orphan the author references instead of deleting.
  -- wiki_revisions.username is a text snapshot so author credit remains visible as "user retired".
  -- Requires wiki_nullable_author_cols.sql to have been run first.
  UPDATE wiki_entries       SET created_by = NULL WHERE created_by = p_user_id;
  UPDATE wiki_revisions     SET edited_by  = NULL WHERE edited_by  = p_user_id;
  UPDATE wiki_contributions SET user_id    = NULL WHERE user_id    = p_user_id;

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

GRANT EXECUTE ON FUNCTION admin_delete_user(uuid) TO authenticated;
