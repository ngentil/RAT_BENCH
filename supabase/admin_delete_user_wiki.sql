-- Admin: delete all wiki entries authored by a specific user.
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION admin_delete_user_wiki(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count int;
BEGIN
  IF auth.email() != 'nathan.gentil.ai@gmail.com' THEN
    RETURN jsonb_build_object('error', 'Access denied');
  END IF;

  SELECT COUNT(*) INTO v_count FROM wiki_entries WHERE created_by = p_user_id;
  DELETE FROM wiki_contributions WHERE user_id = p_user_id;
  DELETE FROM wiki_revisions WHERE edited_by = p_user_id;
  DELETE FROM wiki_entries WHERE created_by = p_user_id;
  INSERT INTO admin_audit_log (action, target_email, detail)
  VALUES ('delete_user_wiki', p_user_id::text, v_count || ' entries deleted');
  RETURN jsonb_build_object('ok', true, 'deleted', v_count);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION admin_delete_user_wiki(uuid) TO authenticated;
