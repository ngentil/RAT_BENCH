-- Defines the increment_wiki_views RPC called by wiki.js:incrementViewCount().
-- Also adds the view_count column if it doesn't exist.
-- Run in Supabase SQL Editor.

ALTER TABLE wiki_entries
  ADD COLUMN IF NOT EXISTS view_count bigint NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_wiki_entries_view_count ON wiki_entries (view_count DESC);

CREATE OR REPLACE FUNCTION increment_wiki_views(entry_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE wiki_entries
  SET view_count = view_count + 1
  WHERE id = entry_id;
END;
$$;

-- Allow any visitor (including unauthenticated) to increment view counts
GRANT EXECUTE ON FUNCTION increment_wiki_views(uuid) TO anon;
GRANT EXECUTE ON FUNCTION increment_wiki_views(uuid) TO authenticated;
