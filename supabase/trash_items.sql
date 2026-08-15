-- "Recently Deleted" for things that live INSIDE a machine's own jsonb array
-- columns — a time log entry, a part usage line, one photo, one attachment,
-- a lighting entry, a fastener spec. These aren't their own table rows, so
-- the row-level activity_log trigger (see recently_deleted.sql) never sees
-- them individually — it only ever sees "the machines row's `parts` column
-- changed," not which specific part was removed. This is a separate,
-- purpose-built mechanism: the client captures exactly what it's about to
-- remove and logs it here at the moment of removal, alongside its own
-- upsertMachine() call that actually removes it from the array — same
-- best-effort two-step pattern already used elsewhere in this app (e.g.
-- inventory stock adjustments alongside a machine save), not a new
-- transactional primitive.
--
-- Same 72-hour recovery window as recently_deleted.sql's whole-record trash,
-- and both surface together in one Settings → Recently Deleted list client-
-- side (src/lib/db/trash.js merges the two).
--
-- Requires: machines table, _provisioned_machine_ids() (from
-- billing_documents.sql or company_columns_restrict.sql's family of RLS
-- helpers).
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS trash_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  machine_id  uuid NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  -- The machine column this came from, e.g. 'time_log' / 'parts' / 'photos' /
  -- 'attachments' / 'lighting' / 'fasteners' — also doubles as the restore
  -- target column name, checked against an allowlist below rather than
  -- trusted blindly.
  item_type   text NOT NULL,
  -- A short human label for the Recently Deleted list, e.g. a part's name or
  -- a time entry's job label — computed client-side at delete time so the
  -- list doesn't need to reverse-engineer one from arbitrary snapshot shapes.
  label       text NOT NULL,
  snapshot    jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  restored_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_trash_items_restorable
  ON trash_items (user_id, created_at DESC)
  WHERE restored_at IS NULL;

ALTER TABLE trash_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON trash_items TO authenticated;

-- Same ownership model as billing_documents/machine access generally: the
-- machine's owner, or someone provisioned access to it.
DROP POLICY IF EXISTS trash_items_owner ON trash_items;
CREATE POLICY trash_items_owner ON trash_items
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    AND (
      machine_id IN (SELECT id FROM machines WHERE user_id = auth.uid())
      OR machine_id IN (SELECT _provisioned_machine_ids(auth.uid()))
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND (
      machine_id IN (SELECT id FROM machines WHERE user_id = auth.uid())
      OR machine_id IN (SELECT _provisioned_machine_ids(auth.uid()))
    )
  );

CREATE OR REPLACE FUNCTION _trash_item_allowed_column(p_col text)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT p_col IN ('time_log', 'parts', 'photos', 'attachments', 'lighting', 'fasteners');
$$;

-- Appends the snapshot back onto the end of the machine's array column and
-- marks this trash_items row restored. Ownership enforced by RLS (the
-- UPDATE below only succeeds for a row the caller is already allowed to
-- touch); the machines UPDATE that follows relies on the caller already
-- having write access to that machine via its own existing RLS policy —
-- this function is SECURITY DEFINER only to let the two updates happen
-- together, not to bypass either table's access rules (the initial SELECT
-- re-checks ownership explicitly below rather than assuming RLS alone
-- covers it, since SECURITY DEFINER runs with elevated privileges).
CREATE OR REPLACE FUNCTION restore_trash_item(p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_row trash_items;
BEGIN
  SELECT * INTO v_row FROM trash_items
  WHERE id = p_id AND user_id = auth.uid() FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nothing to restore — not found, or not yours';
  END IF;
  IF v_row.restored_at IS NOT NULL THEN
    RAISE EXCEPTION 'Already restored';
  END IF;
  IF v_row.created_at < now() - interval '72 hours' THEN
    RAISE EXCEPTION 'This is past the 72-hour recovery window';
  END IF;
  IF NOT _trash_item_allowed_column(v_row.item_type) THEN
    RAISE EXCEPTION 'Unknown item type';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM machines WHERE id = v_row.machine_id
    AND (user_id = auth.uid() OR id IN (SELECT _provisioned_machine_ids(auth.uid())))
  ) THEN
    RAISE EXCEPTION 'The machine this belongs to is no longer accessible';
  END IF;

  EXECUTE format(
    'UPDATE machines SET %I = COALESCE(%I, ''[]''::jsonb) || jsonb_build_array($1) WHERE id = $2',
    v_row.item_type, v_row.item_type
  ) USING v_row.snapshot, v_row.machine_id;

  UPDATE trash_items SET restored_at = now() WHERE id = p_id;

  RETURN jsonb_build_object('machine_id', v_row.machine_id, 'item_type', v_row.item_type);
END;
$$;

GRANT EXECUTE ON FUNCTION restore_trash_item(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION list_my_trash_items()
RETURNS TABLE (id uuid, machine_id uuid, item_type text, label text, created_at timestamptz)
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT t.id, t.machine_id, t.item_type, t.label, t.created_at
  FROM trash_items t
  WHERE t.user_id = auth.uid()
    AND t.restored_at IS NULL
    AND t.created_at > now() - interval '72 hours'
  ORDER BY t.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION list_my_trash_items() TO authenticated;
