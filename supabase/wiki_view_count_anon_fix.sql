-- Restrict increment_wiki_views to authenticated users only.
-- Previously granted to anon, allowing bots to inflate view counts
-- without any authentication — the client-side session guard in wiki.js
-- does not protect the RPC endpoint.
-- Run in Supabase SQL Editor.

REVOKE EXECUTE ON FUNCTION increment_wiki_views(uuid) FROM anon;

-- Ensure authenticated grant is still present (idempotent)
GRANT EXECUTE ON FUNCTION increment_wiki_views(uuid) TO authenticated;
