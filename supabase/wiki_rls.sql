-- RLS for wiki_entries, wiki_revisions, wiki_contributions
-- wiki_sample_entries.sql only added DELETE policies — this completes the set.
-- Run in Supabase SQL Editor

-- ── wiki_entries ─────────────────────────────────────────────────────────────

ALTER TABLE wiki_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wiki_entries_select      ON wiki_entries;
DROP POLICY IF EXISTS wiki_entries_insert      ON wiki_entries;
DROP POLICY IF EXISTS wiki_entries_update      ON wiki_entries;

-- SELECT: public (non-sample) entries readable by anyone;
--         sample entries only visible to their owner
CREATE POLICY wiki_entries_select ON wiki_entries
  FOR SELECT
  USING (
    NOT is_sample
    OR sample_owner_id = auth.uid()
  );

-- INSERT: authenticated users only; block injecting is_sample into another user's library
CREATE POLICY wiki_entries_insert ON wiki_entries
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (NOT is_sample OR sample_owner_id = auth.uid())
  );

-- UPDATE: only the original author
CREATE POLICY wiki_entries_update ON wiki_entries
  FOR UPDATE TO authenticated
  USING  (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Column-level restrictions: prevent authors from flipping is_sample / sample_owner_id
-- which could hide entries from their intended audience or inject into another user's samples.
-- current_rev_id is handled exclusively by the update_wiki_rev_pointer SECURITY DEFINER RPC.
REVOKE UPDATE ON wiki_entries FROM authenticated;
GRANT UPDATE (make, model, type, slug) ON wiki_entries TO authenticated;

-- Enforce slug format: lowercase alphanumeric + hyphens, minimum 1 char.
-- Prevents empty slugs and slugs that would break URL routing.
ALTER TABLE wiki_entries
  DROP CONSTRAINT IF EXISTS chk_wiki_entries_slug,
  ADD CONSTRAINT chk_wiki_entries_slug
    CHECK (slug ~ '^[a-z0-9][a-z0-9\-]*$');

-- (DELETE policies already exist from wiki_sample_entries.sql)


-- ── wiki_revisions ───────────────────────────────────────────────────────────

ALTER TABLE wiki_revisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wiki_revisions_select ON wiki_revisions;
DROP POLICY IF EXISTS wiki_revisions_insert ON wiki_revisions;

-- SELECT: visible if the parent entry is visible
CREATE POLICY wiki_revisions_select ON wiki_revisions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wiki_entries e
      WHERE e.id = entry_id
        AND (NOT e.is_sample OR e.sample_owner_id = auth.uid())
    )
  );

-- INSERT: authenticated users only
CREATE POLICY wiki_revisions_insert ON wiki_revisions
  FOR INSERT TO authenticated
  WITH CHECK (edited_by = auth.uid());

-- (DELETE policy already exists from wiki_sample_entries.sql)


-- ── wiki_contributions ───────────────────────────────────────────────────────

ALTER TABLE wiki_contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wiki_contribs_select ON wiki_contributions;
DROP POLICY IF EXISTS wiki_contribs_insert ON wiki_contributions;

-- SELECT: same visibility as parent entry
CREATE POLICY wiki_contribs_select ON wiki_contributions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wiki_entries e
      WHERE e.id = entry_id
        AND (NOT e.is_sample OR e.sample_owner_id = auth.uid())
    )
  );

-- INSERT: authenticated users only
CREATE POLICY wiki_contribs_insert ON wiki_contributions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- (DELETE policy already exists from wiki_sample_entries.sql)
