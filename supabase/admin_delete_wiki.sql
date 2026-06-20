-- Admin: delete all wiki entries and revisions.
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION admin_delete_all_wiki()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count FROM wiki_entries;
  DELETE FROM wiki_contributions WHERE true;
  DELETE FROM wiki_revisions    WHERE true;
  DELETE FROM wiki_entries      WHERE true;
  INSERT INTO admin_audit_log (action, detail)
  VALUES ('delete_all_wiki', v_count || ' entries permanently deleted');
  RETURN jsonb_build_object('ok', true, 'deleted', v_count);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;
