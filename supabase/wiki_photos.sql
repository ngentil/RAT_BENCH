-- Wiki entry photos — a public gallery of real, community-uploaded photos per
-- entry. Deliberately a separate table from wiki_revisions/wiki_entries:
-- photos persist independently of which spec revision is "current" and need
-- their own per-row moderation state (a bad photo shouldn't require touching
-- spec data). Reuses the existing public "photos" Storage bucket and the
-- app's uploadPhoto() helper (src/lib/storage.js) — no new storage
-- infrastructure, just a new table pointing at URLs in the same bucket.
-- Requires is_admin_user() from supabase/admin_storage_policy.sql.
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS wiki_entry_photos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id      uuid NOT NULL REFERENCES wiki_entries(id) ON DELETE CASCADE,
  uploaded_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  url           text NOT NULL,
  status        text NOT NULL DEFAULT 'live' CHECK (status IN ('live','hidden','removed')),
  report_count  int  NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wiki_entry_photos_entry    ON wiki_entry_photos(entry_id);
CREATE INDEX IF NOT EXISTS idx_wiki_entry_photos_uploader ON wiki_entry_photos(uploaded_by);

ALTER TABLE wiki_entry_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wiki_entry_photos_select ON wiki_entry_photos;
DROP POLICY IF EXISTS wiki_entry_photos_insert ON wiki_entry_photos;
DROP POLICY IF EXISTS wiki_entry_photos_delete ON wiki_entry_photos;

-- SELECT: live photos are public (same read model as specs). Hidden/removed
-- photos stay visible only to their uploader (so they can see it's under
-- review) or an admin — strangers shouldn't see a photo mid-moderation.
-- auth.uid()/is_admin_user() calls wrapped in (select ...) so Postgres
-- evaluates them once per statement instead of once per row (Supabase's
-- perf advisor: "auth_rls_initplan") — no behavior change, just faster.
CREATE POLICY wiki_entry_photos_select ON wiki_entry_photos
  FOR SELECT
  USING (
    status = 'live'
    OR uploaded_by = (select auth.uid())
    OR (select is_admin_user())
  );

-- INSERT: any authenticated user, only attributing the upload to themselves.
CREATE POLICY wiki_entry_photos_insert ON wiki_entry_photos
  FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = (select auth.uid()));

-- DELETE: uploader can remove their own photo; admin can remove any.
CREATE POLICY wiki_entry_photos_delete ON wiki_entry_photos
  FOR DELETE TO authenticated
  USING (uploaded_by = (select auth.uid()) OR (select is_admin_user()));

GRANT SELECT, INSERT, DELETE ON wiki_entry_photos TO authenticated;
GRANT SELECT ON wiki_entry_photos TO anon;

-- The SELECT policy calls is_admin_user() for every caller including anon
-- (e.g. the public wiki.ratbench.net subdomain and the unauthenticated SEO
-- prerenderer) — without this grant, anon callers get a permission-denied
-- error on the *entire* query, not just a false evaluation of that clause.
-- (This is the exact class of regression wiki_revisions_anon_fix.sql fixed
-- for a different helper — granting to anon up front here avoids repeating it.)
GRANT EXECUTE ON FUNCTION is_admin_user() TO anon;
