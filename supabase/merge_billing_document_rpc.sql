-- Atomically archives a billing_documents row's current snapshot/total into
-- its own revisions array before overwriting them — so "Merge" (regenerate's
-- merge-vs-copy choice) keeps a real version history instead of destroying
-- the pre-merge state. A plain client-side read-then-write UPDATE couldn't
-- reference the row's own prior column values in one step; this does it in
-- a single statement so there's no window for a lost update.
-- Not SECURITY DEFINER — runs as the calling role, so the existing
-- billing_documents_own RLS policy still governs which row can be touched.
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION merge_billing_document(
  p_id uuid,
  p_snapshot jsonb,
  p_total numeric,
  p_client_id uuid DEFAULT NULL
)
RETURNS billing_documents
LANGUAGE plpgsql
AS $$
DECLARE
  v_row billing_documents;
BEGIN
  UPDATE billing_documents SET
    revisions  = revisions || jsonb_build_array(jsonb_build_object(
                   'snapshot', snapshot, 'total', total, 'archived_at', updated_at
                 )),
    snapshot   = p_snapshot,
    total      = p_total,
    client_id  = COALESCE(p_client_id, client_id),
    updated_at = now()
  WHERE id = p_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document not found or not permitted';
  END IF;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION merge_billing_document(uuid, jsonb, numeric, uuid) TO authenticated;
