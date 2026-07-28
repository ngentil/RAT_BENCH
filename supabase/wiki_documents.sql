-- Wiki entry documents — PDF manuals / spec sheets attached to a wiki entry,
-- separate from wiki_entry_photos (own table, own bucket, own moderation
-- state) since a bad/wrong document shouldn't touch photo or spec data.
-- Uses the 'documents' Storage bucket (supabase/create_documents_bucket.sql)
-- and the app's uploadDocument() helper (src/lib/storage.js).
-- Requires is_admin_user() from supabase/admin_storage_policy.sql.
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS wiki_entry_documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id      uuid NOT NULL REFERENCES wiki_entries(id) ON DELETE CASCADE,
  uploaded_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  url           text NOT NULL,
  filename      text NOT NULL,
  file_size     bigint,
  doc_type      text NOT NULL DEFAULT 'manual' CHECK (doc_type IN ('manual','spec_sheet','parts_diagram','other')),
  status        text NOT NULL DEFAULT 'live' CHECK (status IN ('live','hidden','removed')),
  report_count  int  NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wiki_entry_documents_entry    ON wiki_entry_documents(entry_id);
CREATE INDEX IF NOT EXISTS idx_wiki_entry_documents_uploader ON wiki_entry_documents(uploaded_by);

ALTER TABLE wiki_entry_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wiki_entry_documents_select ON wiki_entry_documents;
DROP POLICY IF EXISTS wiki_entry_documents_insert ON wiki_entry_documents;
DROP POLICY IF EXISTS wiki_entry_documents_delete ON wiki_entry_documents;

-- SELECT: live documents are public (same read model as specs/photos).
-- Hidden/removed documents stay visible only to their uploader or an admin.
CREATE POLICY wiki_entry_documents_select ON wiki_entry_documents
  FOR SELECT
  USING (
    status = 'live'
    OR uploaded_by = (select auth.uid())
    OR (select is_admin_user())
  );

-- INSERT: any authenticated user, only attributing the upload to themselves.
CREATE POLICY wiki_entry_documents_insert ON wiki_entry_documents
  FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = (select auth.uid()));

-- DELETE: uploader can remove their own document; admin can remove any.
CREATE POLICY wiki_entry_documents_delete ON wiki_entry_documents
  FOR DELETE TO authenticated
  USING (uploaded_by = (select auth.uid()) OR (select is_admin_user()));

GRANT SELECT, INSERT, DELETE ON wiki_entry_documents TO authenticated;
GRANT SELECT ON wiki_entry_documents TO anon;

-- Same anon grant this SELECT policy needs as wiki_entry_photos does — the
-- public wiki subdomain and the unauthenticated SEO prerenderer both call
-- is_admin_user() as part of evaluating the policy even when they're not one.
GRANT EXECUTE ON FUNCTION is_admin_user() TO anon;
