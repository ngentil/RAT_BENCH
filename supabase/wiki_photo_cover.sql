-- Preferred/cover photo for a wiki entry's photo gallery — same idea as the
-- Tracker's "☆ Cover" picker on machines/parts/tools/equipment, but those
-- pick a cover by reordering a plain `photos` array on the owner's own
-- record. wiki_entry_photos is a shared table of independent rows (no
-- single owner), so the cover is instead an `is_cover` flag on the row,
-- flipped through an RPC so at most one photo per entry is ever the cover.
-- Any authenticated user may set it — same open, collaborative model as
-- editing spec fields (see awardWikiEditPoints in src/lib/wiki.js): the
-- gallery is community-curated, not owned by whoever uploaded first.
-- Requires supabase/wiki_photos.sql (wiki_entry_photos).
-- Run in Supabase SQL Editor.

ALTER TABLE wiki_entry_photos ADD COLUMN IF NOT EXISTS is_cover boolean NOT NULL DEFAULT false;

-- Enforce "at most one cover per entry" in the database, not just in app code.
CREATE UNIQUE INDEX IF NOT EXISTS idx_wiki_entry_photos_one_cover
  ON wiki_entry_photos(entry_id) WHERE is_cover;

CREATE OR REPLACE FUNCTION set_wiki_cover_photo(p_photo_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_photo wiki_entry_photos%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_photo FROM wiki_entry_photos WHERE id = p_photo_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Photo not found';
  END IF;
  IF v_photo.status != 'live' THEN
    RAISE EXCEPTION 'Only a live photo can be set as cover';
  END IF;

  -- Two statements rather than one UPDATE ... CASE so the partial unique
  -- index above never sees two covers for the same entry_id at once.
  UPDATE wiki_entry_photos SET is_cover = false WHERE entry_id = v_photo.entry_id AND is_cover;
  UPDATE wiki_entry_photos SET is_cover = true WHERE id = p_photo_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION set_wiki_cover_photo(uuid) TO authenticated;
