-- Add SECURITY DEFINER helper for wiki_revisions SELECT policy.
-- The existing wiki_revisions_select policy joins back to wiki_entries inline,
-- creating a nested RLS dependency: if wiki_entries gains a new policy in the
-- future, revisions could silently disappear for non-authors without any error.
-- A SECURITY DEFINER helper breaks the dependency and runs as DB owner.
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION _wiki_entry_visible(p_entry_id uuid, p_uid uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM wiki_entries
    WHERE id = p_entry_id
      AND (NOT is_sample OR sample_owner_id = p_uid)
  );
$$;

GRANT EXECUTE ON FUNCTION _wiki_entry_visible(uuid, uuid) TO authenticated;


-- Re-create revisions SELECT policy to use the helper instead of inline join
DROP POLICY IF EXISTS wiki_revisions_select ON wiki_revisions;

CREATE POLICY wiki_revisions_select ON wiki_revisions
  FOR SELECT TO authenticated
  USING (_wiki_entry_visible(entry_id, auth.uid()));
