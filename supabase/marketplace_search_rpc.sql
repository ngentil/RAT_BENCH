-- Safe replacement for the client-side .or() filter string previously built
-- in getActiveListings() (src/lib/marketplace.js). That approach interpolated
-- the raw search query directly into a PostgREST .or() filter string, e.g.:
--   `title.ilike.%${t}%,description.ilike.%${t}%,...`
-- PostgREST's .or() syntax uses commas as condition separators and
-- parentheses for grouping — the old code only escaped SQL ILIKE wildcards
-- (% and _), not those filter-syntax characters, so a search string
-- containing a comma or parenthesis could reshape which conditions were
-- OR'd/AND'd together (a PostgREST filter-injection class of bug), separate
-- from and not mitigated by RLS (RLS still correctly blocked any actual
-- unauthorized row access — this was a filter-logic integrity issue, not a
-- data-exposure one, but still wrong and worth closing properly).
--
-- This RPC mirrors search_wiki's approach (wiki_fuzzy_search_rpc.sql): `q` is
-- a bound SQL function parameter, not a client-built filter string, so
-- there's no filter-syntax for user input to break out of — Postgres treats
-- it as inert text data throughout. ILIKE wildcards (%, _) are escaped
-- server-side so the caller doesn't need to (and can't get it wrong again).
--
-- SECURITY INVOKER (default) — marketplace_listings' own RLS
-- (marketplace_listings_select) still applies, same public-active-only
-- scoping as a direct client-side select.
--
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION search_marketplace_listings(q text, lim int DEFAULT 50)
RETURNS SETOF marketplace_listings
LANGUAGE sql STABLE
AS $$
  SELECT *
  FROM marketplace_listings
  WHERE status = 'active'
    AND (
      q IS NULL OR btrim(q) = ''
      OR title       ILIKE '%' || replace(replace(q, '%', '\%'), '_', '\_') || '%'
      OR description ILIKE '%' || replace(replace(q, '%', '\%'), '_', '\_') || '%'
      OR make        ILIKE '%' || replace(replace(q, '%', '\%'), '_', '\_') || '%'
      OR model       ILIKE '%' || replace(replace(q, '%', '\%'), '_', '\_') || '%'
    )
  ORDER BY created_at DESC
  LIMIT lim;
$$;

GRANT EXECUTE ON FUNCTION search_marketplace_listings(text, int) TO anon, authenticated;
