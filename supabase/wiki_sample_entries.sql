-- Wiki sample entries migration
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add is_sample and sample_owner_id columns
ALTER TABLE wiki_entries
  ADD COLUMN IF NOT EXISTS is_sample       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sample_owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. RLS — allow users to delete their own sample entries and all dependent rows

DROP POLICY IF EXISTS wiki_entries_delete_own_sample  ON wiki_entries;
DROP POLICY IF EXISTS wiki_revisions_delete_own_sample ON wiki_revisions;
DROP POLICY IF EXISTS wiki_contribs_delete_own_sample  ON wiki_contributions;

CREATE POLICY wiki_entries_delete_own_sample ON wiki_entries
  FOR DELETE
  USING (is_sample = true AND sample_owner_id = auth.uid());

CREATE POLICY wiki_revisions_delete_own_sample ON wiki_revisions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM wiki_entries e
      WHERE e.id = entry_id
        AND e.is_sample = true
        AND e.sample_owner_id = auth.uid()
    )
  );

CREATE POLICY wiki_contribs_delete_own_sample ON wiki_contributions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM wiki_entries e
      WHERE e.id = entry_id
        AND e.is_sample = true
        AND e.sample_owner_id = auth.uid()
    )
  );

-- 3. To wipe existing (test) wiki entries before deploying samples, run:
--    SELECT admin_delete_all_wiki();
