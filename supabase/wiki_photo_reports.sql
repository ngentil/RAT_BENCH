-- Community reporting of wiki photos (AI-generated, wrong machine,
-- inappropriate, duplicate). 3 distinct reports auto-hides a photo pending
-- review. An admin resolves the report batch, which pays every reporter +1
-- if they were right (photo removed) — clearing a report as false pays
-- nothing, deliberately not a penalty. Reporting is still an act of trying
-- to improve the wiki even when the call turns out wrong; only confirmed
-- catches get rewarded.
-- Requires supabase/wiki_photos.sql (wiki_entry_photos) and
-- supabase/wiki_points.sql (wiki_points_ledger).
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS wiki_photo_reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id     uuid NOT NULL REFERENCES wiki_entry_photos(id) ON DELETE CASCADE,
  reporter_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason       text NOT NULL CHECK (reason IN ('ai_generated','wrong_machine','inappropriate','duplicate')),
  resolved     boolean NOT NULL DEFAULT false,
  outcome      text CHECK (outcome IN ('removed','cleared')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (photo_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_wiki_photo_reports_photo ON wiki_photo_reports(photo_id);
CREATE INDEX IF NOT EXISTS idx_wiki_photo_reports_reporter ON wiki_photo_reports(reporter_id);

ALTER TABLE wiki_photo_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wiki_photo_reports_select ON wiki_photo_reports;

CREATE POLICY wiki_photo_reports_select ON wiki_photo_reports
  FOR SELECT TO authenticated
  USING (reporter_id = (select auth.uid()) OR (select is_admin_user()));

GRANT SELECT ON wiki_photo_reports TO authenticated;
-- No direct INSERT/UPDATE grant — reporting and resolution both go through
-- the RPCs below so report_count/status never drift from the reports table.

CREATE OR REPLACE FUNCTION report_wiki_photo(p_photo_id uuid, p_reason text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_photo wiki_entry_photos%ROWTYPE;
  v_count int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_reason NOT IN ('ai_generated','wrong_machine','inappropriate','duplicate') THEN
    RAISE EXCEPTION 'Invalid reason';
  END IF;

  SELECT * INTO v_photo FROM wiki_entry_photos WHERE id = p_photo_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Photo not found';
  END IF;
  IF v_photo.uploaded_by = auth.uid() THEN
    RAISE EXCEPTION 'Cannot report your own photo';
  END IF;

  INSERT INTO wiki_photo_reports (photo_id, reporter_id, reason)
  VALUES (p_photo_id, auth.uid(), p_reason)
  ON CONFLICT (photo_id, reporter_id) DO NOTHING;

  SELECT COUNT(*) INTO v_count
  FROM wiki_photo_reports WHERE photo_id = p_photo_id AND resolved = false;

  UPDATE wiki_entry_photos SET report_count = v_count WHERE id = p_photo_id;

  IF v_count >= 3 AND v_photo.status = 'live' THEN
    UPDATE wiki_entry_photos SET status = 'hidden' WHERE id = p_photo_id;
  END IF;

  RETURN jsonb_build_object('report_count', v_count, 'hidden', v_count >= 3);
END;
$$;

GRANT EXECUTE ON FUNCTION report_wiki_photo(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION resolve_wiki_photo_report(p_photo_id uuid, p_outcome text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_photo wiki_entry_photos%ROWTYPE;
  r RECORD;
BEGIN
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  IF p_outcome NOT IN ('removed','cleared') THEN
    RAISE EXCEPTION 'Invalid outcome';
  END IF;

  SELECT * INTO v_photo FROM wiki_entry_photos WHERE id = p_photo_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Photo not found';
  END IF;

  -- Only a confirmed report pays out — clearing one as false costs the
  -- reporter nothing, so there's no downside to flagging something in good
  -- faith that turns out fine.
  IF p_outcome = 'removed' THEN
    FOR r IN SELECT * FROM wiki_photo_reports WHERE photo_id = p_photo_id AND resolved = false LOOP
      INSERT INTO wiki_points_ledger (user_id, entry_id, ref_table, ref_id, action, points)
      VALUES (r.reporter_id, v_photo.entry_id, 'wiki_photo_reports', r.id, 'report_confirmed', 1)
      ON CONFLICT (user_id, ref_table, ref_id, action) DO NOTHING;
    END LOOP;
  END IF;

  UPDATE wiki_photo_reports SET resolved = true, outcome = p_outcome
  WHERE photo_id = p_photo_id AND resolved = false;

  UPDATE wiki_entry_photos
  SET status = CASE WHEN p_outcome = 'removed' THEN 'removed' ELSE 'live' END,
      report_count = 0
  WHERE id = p_photo_id;

  RETURN jsonb_build_object('ok', true, 'outcome', p_outcome);
END;
$$;

GRANT EXECUTE ON FUNCTION resolve_wiki_photo_report(uuid, text) TO authenticated;
