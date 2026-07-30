-- Logs every generated Quote/Invoice so the Office tab can list them and so
-- regenerating for the same machine can offer "merge into existing" vs
-- "keep as a new copy" instead of always minting a fresh document.
-- Stores a JSON snapshot of the line items/totals/client info at generation
-- time (not the rendered PDF itself) — re-viewing a document re-renders the
-- PDF from this snapshot rather than needing a Storage bucket upload.
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS billing_documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id  uuid REFERENCES companies(id) ON DELETE SET NULL,
  machine_id  uuid NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  client_id   uuid REFERENCES clients(id) ON DELETE SET NULL,
  doc_type    text NOT NULL CHECK (doc_type IN ('quote', 'invoice')),
  doc_ref     text NOT NULL,
  snapshot    jsonb NOT NULL DEFAULT '{}'::jsonb,
  total       numeric,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE billing_documents ENABLE ROW LEVEL SECURITY;

-- Table-level GRANT is a separate authorization layer from RLS — a role can
-- have zero applicable RLS policies and still get "permission denied for
-- table X" if this GRANT is missing, distinct from an RLS row-visibility
-- mismatch. Written in from the start this time (see machine_collections.sql
-- for the bug this fixes).
GRANT SELECT, INSERT, UPDATE ON billing_documents TO authenticated;

DROP POLICY IF EXISTS billing_documents_own ON billing_documents;
CREATE POLICY billing_documents_own ON billing_documents
  FOR ALL TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND (
      machine_id IN (SELECT id FROM machines WHERE user_id = auth.uid())
      OR machine_id IN (SELECT _provisioned_machine_ids(auth.uid()))
    )
  );

DROP POLICY IF EXISTS billing_documents_provisioned_select ON billing_documents;
CREATE POLICY billing_documents_provisioned_select ON billing_documents
  FOR SELECT TO authenticated
  USING (machine_id IN (SELECT _provisioned_machine_ids(auth.uid())));

-- Fast "most recent document for this machine+type" lookup — the query the
-- regenerate-merge-or-copy check runs on every Quote/Invoice button press.
CREATE INDEX IF NOT EXISTS idx_billing_documents_machine_type
  ON billing_documents (machine_id, doc_type, created_at DESC);
