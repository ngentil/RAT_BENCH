-- update_wiki_rev_pointer: SECURITY DEFINER RPC to advance the current_rev_id
-- pointer on a wiki entry after a revision is saved or deleted.
--
-- The wiki is collaborative — any authenticated user can add revisions to public
-- entries — but the wiki_entries_update RLS policy restricts direct row UPDATEs
-- to the entry author. This RPC bypasses that restriction for the pointer field only.
--
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION update_wiki_rev_pointer(p_entry_id uuid, p_rev_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify the revision belongs to this entry (when not null)
  IF p_rev_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM wiki_revisions WHERE id = p_rev_id AND entry_id = p_entry_id
  ) THEN
    RAISE EXCEPTION 'Revision not found for this entry';
  END IF;

  -- Caller must be the entry author OR have at least one revision on this entry.
  -- This blocks random users from blanking or reverting entries they have no
  -- connection to, while allowing the post-delete pointer restore flow for any
  -- legitimate contributor.
  IF NOT EXISTS (SELECT 1 FROM wiki_entries WHERE id = p_entry_id AND created_by = auth.uid())
  AND NOT EXISTS (SELECT 1 FROM wiki_revisions WHERE entry_id = p_entry_id AND edited_by = auth.uid())
  THEN
    RAISE EXCEPTION 'Forbidden — must be entry author or contributor to advance pointer';
  END IF;

  -- For non-null: also require caller authored the target rev OR is entry author
  -- (prevents arbitrary revision rollbacks by contributors who didn't author the target)
  IF p_rev_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM wiki_entries WHERE id = p_entry_id AND created_by = auth.uid())
    AND NOT EXISTS (SELECT 1 FROM wiki_revisions WHERE id = p_rev_id AND edited_by = auth.uid())
    THEN
      RAISE EXCEPTION 'Forbidden — must be the target revision author or entry author';
    END IF;
  END IF;

  UPDATE wiki_entries
  SET current_rev_id = p_rev_id
  WHERE id = p_entry_id AND NOT is_sample;
END;
$$;

GRANT EXECUTE ON FUNCTION update_wiki_rev_pointer(uuid, uuid) TO authenticated;
