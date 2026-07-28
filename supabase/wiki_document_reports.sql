-- Community reporting of wiki documents (wrong document, outdated, copyright,
-- spam). 3 distinct reports auto-hides a document pending review. An admin
-- resolves the report batch, which pays every reporter +1 if they were right
-- (document removed) — clearing a report as false pays nothing, deliberately
-- not a penalty. Mirrors supabase/wiki_photo_reports.sql exactly, just for
-- wiki_entry_documents instead of wiki_entry_photos.
-- Requires supabase/wiki_documents.sql (wiki_entry_documents) and
-- supabase/wiki_points.sql (wiki_points_ledger).
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS wiki_document_reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  uuid NOT NULL REFERENCES wiki_entry_documents(id) ON DELETE CASCADE,
  reporter_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason       text NOT NULL CHECK (reason IN ('wrong_document','outdated','copyright','spam')),
  resolved     boolean NOT NULL DEFAULT false,
  outcome      text CHECK (outcome IN ('removed','cleared')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_wiki_document_reports_document ON wiki_document_reports(document_id);
CREATE INDEX IF NOT EXISTS idx_wiki_document_reports_reporter ON wiki_document_reports(reporter_id);

ALTER TABLE wiki_document_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wiki_document_reports_select ON wiki_document_reports;

CREATE POLICY wiki_document_reports_select ON wiki_document_reports
  FOR SELECT TO authenticated
  USING (reporter_id = (select auth.uid()) OR (select is_admin_user()));

GRANT SELECT ON wiki_document_reports TO authenticated;
-- No direct INSERT/UPDATE grant — reporting and resolution both go through
-- the RPCs below so report_count/status never drift from the reports table.

CREATE OR REPLACE FUNCTION report_wiki_document(p_document_id uuid, p_reason text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_doc   wiki_entry_documents%ROWTYPE;
  v_count int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_reason NOT IN ('wrong_document','outdated','copyright','spam') THEN
    RAISE EXCEPTION 'Invalid reason';
  END IF;

  SELECT * INTO v_doc FROM wiki_entry_documents WHERE id = p_document_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document not found';
  END IF;
  IF v_doc.uploaded_by = auth.uid() THEN
    RAISE EXCEPTION 'Cannot report your own document';
  END IF;

  INSERT INTO wiki_document_reports (document_id, reporter_id, reason)
  VALUES (p_document_id, auth.uid(), p_reason)
  ON CONFLICT (document_id, reporter_id) DO NOTHING;

  SELECT COUNT(*) INTO v_count
  FROM wiki_document_reports WHERE document_id = p_document_id AND resolved = false;

  UPDATE wiki_entry_documents SET report_count = v_count WHERE id = p_document_id;

  IF v_count >= 3 AND v_doc.status = 'live' THEN
    UPDATE wiki_entry_documents SET status = 'hidden' WHERE id = p_document_id;
  END IF;

  RETURN jsonb_build_object('report_count', v_count, 'hidden', v_count >= 3);
END;
$$;

GRANT EXECUTE ON FUNCTION report_wiki_document(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION resolve_wiki_document_report(p_document_id uuid, p_outcome text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_doc wiki_entry_documents%ROWTYPE;
  r     RECORD;
BEGIN
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  IF p_outcome NOT IN ('removed','cleared') THEN
    RAISE EXCEPTION 'Invalid outcome';
  END IF;

  SELECT * INTO v_doc FROM wiki_entry_documents WHERE id = p_document_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document not found';
  END IF;

  -- Only a confirmed report pays out — clearing one as false costs the
  -- reporter nothing, so there's no downside to flagging something in good
  -- faith that turns out fine.
  IF p_outcome = 'removed' THEN
    FOR r IN SELECT * FROM wiki_document_reports WHERE document_id = p_document_id AND resolved = false LOOP
      INSERT INTO wiki_points_ledger (user_id, entry_id, ref_table, ref_id, action, points)
      VALUES (r.reporter_id, v_doc.entry_id, 'wiki_document_reports', r.id, 'report_confirmed', 1)
      ON CONFLICT (user_id, ref_table, ref_id, action) DO NOTHING;
    END LOOP;
  END IF;

  UPDATE wiki_document_reports SET resolved = true, outcome = p_outcome
  WHERE document_id = p_document_id AND resolved = false;

  UPDATE wiki_entry_documents
  SET status = CASE WHEN p_outcome = 'removed' THEN 'removed' ELSE 'live' END,
      report_count = 0
  WHERE id = p_document_id;

  RETURN jsonb_build_object('ok', true, 'outcome', p_outcome);
END;
$$;

GRANT EXECUTE ON FUNCTION resolve_wiki_document_report(uuid, text) TO authenticated;
