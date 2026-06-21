-- update_wiki_rev_pointer: add FOR UPDATE row lock to eliminate TOCTOU race.
-- The original function ran the permission check and UPDATE as separate statements.
-- Two concurrent calls from the same contributor could both pass the check then
-- race on the UPDATE, orphaning one revision from current_rev_id without error.
-- Locking the entry row with FOR UPDATE serializes concurrent calls so only one
-- wins at a time. The IS DISTINCT FROM guard makes duplicate calls idempotent.
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION update_wiki_rev_pointer(p_entry_id uuid, p_rev_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_entry wiki_entries%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock the entry row so concurrent calls are serialized — one wins, others wait.
  SELECT * INTO v_entry FROM wiki_entries WHERE id = p_entry_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Entry not found';
  END IF;

  IF v_entry.is_sample THEN
    RETURN;
  END IF;

  -- Verify the revision belongs to this entry (when not null)
  IF p_rev_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM wiki_revisions WHERE id = p_rev_id AND entry_id = p_entry_id
  ) THEN
    RAISE EXCEPTION 'Revision not found for this entry';
  END IF;

  -- Caller must be entry author OR a contributor to this entry
  IF v_entry.created_by != auth.uid()
  AND NOT EXISTS (SELECT 1 FROM wiki_revisions WHERE entry_id = p_entry_id AND edited_by = auth.uid())
  THEN
    RAISE EXCEPTION 'Forbidden — must be entry author or contributor to advance pointer';
  END IF;

  -- For non-null: caller must also be the target revision author OR entry author
  IF p_rev_id IS NOT NULL THEN
    IF v_entry.created_by != auth.uid()
    AND NOT EXISTS (SELECT 1 FROM wiki_revisions WHERE id = p_rev_id AND edited_by = auth.uid())
    THEN
      RAISE EXCEPTION 'Forbidden — must be the target revision author or entry author';
    END IF;
  END IF;

  -- Update only if actually changing (idempotent — concurrent duplicate calls become no-ops)
  IF v_entry.current_rev_id IS DISTINCT FROM p_rev_id THEN
    UPDATE wiki_entries
    SET current_rev_id = p_rev_id
    WHERE id = p_entry_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION update_wiki_rev_pointer(uuid, uuid) TO authenticated;
