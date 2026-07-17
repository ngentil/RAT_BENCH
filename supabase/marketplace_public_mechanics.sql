-- Wiki-like public discovery mechanics for the Marketplace: a view_count
-- column + increment RPC, mirroring wiki_view_count_rpc.sql. Public
-- read access to active listings already exists (marketplace_listings.sql's
-- marketplace_listings_select policy grants SELECT to anon) — this file only
-- adds the view-count piece.
--
-- Run in Supabase SQL Editor.

ALTER TABLE marketplace_listings
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_view_count ON marketplace_listings (view_count DESC);

CREATE OR REPLACE FUNCTION increment_marketplace_listing_views(listing_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE marketplace_listings
  SET view_count = view_count + 1
  WHERE id = listing_id AND status = 'active';
END;
$$;

-- Authenticated only, not anon — the wiki originally granted anon too
-- (wiki_view_count_rpc.sql) and had to walk it back in
-- wiki_view_count_anon_fix.sql once it became clear the client-side
-- session-dedup guard doesn't protect the RPC endpoint itself, letting bots
-- inflate counts with unauthenticated calls. Starting this one authenticated-
-- only from day one avoids repeating that.
GRANT EXECUTE ON FUNCTION increment_marketplace_listing_views(uuid) TO authenticated;
