-- Allow wiki entry authors to delete their own non-sample public entries.
-- Sample entry deletion is already handled by wiki_sample_entries.sql.
-- Run in Supabase SQL Editor.

DROP POLICY IF EXISTS wiki_entries_delete_own     ON wiki_entries;
DROP POLICY IF EXISTS wiki_revisions_delete_own   ON wiki_revisions;
DROP POLICY IF EXISTS wiki_contribs_delete_own    ON wiki_contributions;

-- Authors can delete their own public (non-sample) entries.
-- Deleting the entry will cascade to revisions + contributions if FK is CASCADE;
-- the revision/contribution policies below cover any non-cascade setups.
CREATE POLICY wiki_entries_delete_own ON wiki_entries
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() AND NOT is_sample);

-- Editors can delete their own revision records
CREATE POLICY wiki_revisions_delete_own ON wiki_revisions
  FOR DELETE TO authenticated
  USING (edited_by = auth.uid());

-- Contributors can delete their own contribution records
CREATE POLICY wiki_contribs_delete_own ON wiki_contributions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());
