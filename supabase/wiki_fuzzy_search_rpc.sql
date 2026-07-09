-- Fuzzy wiki search RPC — called by searchWiki() in src/lib/wiki.js.
-- Run in Supabase SQL Editor. Requires the pg_trgm extension (already installed).
--
-- Two stages:
--   1) AND pass on DESPACED normalized text — every whitespace token (stripped
--      of spaces/hyphens) must be a substring of the entry's despaced
--      make+model+type+slug+specdata. Spacing/hyphenation becomes irrelevant
--      in BOTH directions: "seadoo"→"Sea-Doo", "ms441"→"MS 441",
--      "hondagx200"→"Honda GX200". specdata is the current revision's full
--      JSONB spec blob cast to text (field names + values), so a spark plug
--      code, part number, or any other spec value is searchable too — e.g.
--      "bpmr" matches a plugType of "NGK BPMR7A" — not just make/model/type.
--   2) If stage 1 finds nothing, fall back to pg_trgm word_similarity on
--      make / make+model vs the raw query (threshold 0.42) so brand typos like
--      "honfa"→Honda, "kawaski"→Kawasaki still resolve without flooding.
--      Spec values are exact codes/numbers, not prose, so typo-tolerance
--      isn't meaningful there — stage 2 stays make/model-only.
--
-- SECURITY INVOKER (default) so wiki_entries + wiki_revisions RLS still
-- applies (non-sample only). The wiki_revisions join requires
-- wiki_revisions_anon_fix.sql to be applied — otherwise anon callers get
-- NULL back for r.data (RLS-filtered) and stage 1 silently degrades to
-- make/model/type/slug-only for them, same as before this change.
-- At ~1k entries a per-query normalized scan is sub-millisecond; if the wiki
-- grows large, add a normalized generated column + GIN trgm index.

CREATE OR REPLACE FUNCTION search_wiki(q text, lim int DEFAULT 50)
RETURNS TABLE (id uuid, slug text, make text, model text, type text, view_count int)
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  pats text[];
BEGIN
  IF q IS NULL OR btrim(q) = '' THEN
    RETURN QUERY
      SELECT e.id, e.slug, e.make, e.model, e.type, e.view_count
      FROM wiki_entries e WHERE NOT e.is_sample
      ORDER BY e.view_count DESC NULLS LAST LIMIT lim;
    RETURN;
  END IF;

  SELECT array_agg('%' || t || '%')
  INTO pats
  FROM (
    SELECT lower(regexp_replace(w, '[^a-zA-Z0-9]', '', 'g')) AS t
    FROM regexp_split_to_table(btrim(q), '\s+') AS w
  ) s
  WHERE t <> '';

  IF pats IS NULL OR array_length(pats, 1) IS NULL THEN
    RETURN QUERY
      SELECT e.id, e.slug, e.make, e.model, e.type, e.view_count
      FROM wiki_entries e WHERE NOT e.is_sample
      ORDER BY e.view_count DESC NULLS LAST LIMIT lim;
    RETURN;
  END IF;

  -- Stage 1: despaced substring AND match — make/model/type/slug + spec data
  RETURN QUERY
    SELECT e.id, e.slug, e.make, e.model, e.type, e.view_count
    FROM wiki_entries e
    LEFT JOIN wiki_revisions r ON r.id = e.current_rev_id
    WHERE NOT e.is_sample
      AND lower(regexp_replace(
            coalesce(e.make,'') || coalesce(e.model,'') || coalesce(e.type,'') || coalesce(e.slug,'') || coalesce(r.data::text,''),
            '[^a-zA-Z0-9]', '', 'g')) LIKE ALL (pats)
    ORDER BY e.view_count DESC NULLS LAST
    LIMIT lim;

  IF FOUND THEN RETURN; END IF;

  -- Stage 2: trigram typo fallback
  RETURN QUERY
    SELECT e.id, e.slug, e.make, e.model, e.type, e.view_count
    FROM wiki_entries e
    WHERE NOT e.is_sample
      AND greatest(
            word_similarity(lower(q), lower(coalesce(e.make,''))),
            word_similarity(lower(q), lower(coalesce(e.make,'') || ' ' || coalesce(e.model,'')))
          ) > 0.42
    ORDER BY greatest(
               word_similarity(lower(q), lower(coalesce(e.make,''))),
               word_similarity(lower(q), lower(coalesce(e.make,'') || ' ' || coalesce(e.model,'')))
             ) DESC,
             e.view_count DESC NULLS LAST
    LIMIT lim;
END;
$$;

GRANT EXECUTE ON FUNCTION search_wiki(text, int) TO anon, authenticated;
