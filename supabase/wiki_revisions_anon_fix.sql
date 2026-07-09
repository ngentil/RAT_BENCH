-- Fixes an access regression introduced by wiki_revisions_rls_helper.sql.
--
-- That migration decoupled the wiki_revisions SELECT policy from an inline
-- join back to wiki_entries (good — avoids a nested-RLS dependency), but in
-- doing so it recreated the policy as "FOR SELECT TO authenticated" and
-- granted EXECUTE on the new _wiki_entry_visible() helper only to
-- authenticated. The ORIGINAL policy in wiki_rls.sql had no role
-- restriction at all (defaults to PUBLIC, i.e. anon + authenticated).
--
-- Combined, this silently blocks anonymous/logged-out callers from reading
-- ANY wiki_revisions row — meaning the public wiki.ratbench.net subdomain
-- (and the build-time SEO prerenderer in scripts/prerender-wiki.mjs, which
-- runs unauthenticated) has been rendering every entry page with an EMPTY
-- spec grid for anyone not logged in. wiki_entries itself stays visible
-- (that table's RLS is separate and does allow anon), so the page loads
-- and shows make/model/type — just none of the actual spec data.
--
-- _wiki_entry_visible()'s own logic already handles anon fine: for a
-- non-sample entry, "NOT is_sample" is true regardless of p_uid, so passing
-- auth.uid() = NULL (which is what anon gets) still resolves correctly.
-- It was purely the GRANT and the policy's role scoping that blocked it.
--
-- Run in Supabase SQL Editor. Safe to re-run.

GRANT EXECUTE ON FUNCTION _wiki_entry_visible(uuid, uuid) TO anon;

DROP POLICY IF EXISTS wiki_revisions_select ON wiki_revisions;

CREATE POLICY wiki_revisions_select ON wiki_revisions
  FOR SELECT
  USING (_wiki_entry_visible(entry_id, auth.uid()));
