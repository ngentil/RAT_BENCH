-- "Recently Deleted" — makes ordinary deletes (machines, clients, vehicles,
-- equipment, tools, consumables, company_members) restorable for 30 days,
-- replacing a scary confirm() popup with "just delete it, you can undo for
-- a few days" the way most consumer apps' trash/recycle-bin works.
--
-- Reuses activity_log.sql's existing generic delete trigger rather than
-- building a parallel logging system — that trigger already fires on every
-- DELETE for machines/vehicles/equipment/tools/consumables/company_members/
-- clients (see activity_log.sql's covered-tables list) and already computes
-- to_jsonb(OLD) internally; it just never stored that full blob anywhere,
-- only a short human-readable summary. This adds a `snapshot` column and
-- teaches the trigger to save the full row on delete (deletes only — insert/
-- update snapshots aren't needed for undo purposes and would just be dead
-- weight in every row).
--
-- Scope: only entities that are their own table row use this file's
-- mechanism. Things embedded inside a machine's own jsonb columns (time log
-- entries, parts, photos) aren't visible to a row-level trigger at all —
-- those go through the separate trash_items.sql file instead.
--
-- Requires: activity_log.sql already applied.
-- Run in Supabase SQL Editor.

ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS snapshot jsonb;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS restored_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_activity_log_restorable
  ON activity_log (actor_id, created_at DESC)
  WHERE action LIKE '%.delete' AND snapshot IS NOT NULL AND restored_at IS NULL;

-- Re-point the existing trigger function at a version that also captures the
-- full pre-delete row. Everything else about it (detail summary, record_id,
-- company_id derivation) is untouched — this only adds one line's worth of
-- new behavior, gated to TG_OP = 'DELETE'.
CREATE OR REPLACE FUNCTION _log_activity() RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor_id    uuid;
  v_actor_email text;
  v_new         jsonb;
  v_old         jsonb;
  v_changed     text[];
  v_detail      text;
  v_record_id   text;
  v_company_id  uuid;
  v_snapshot    jsonb;
BEGIN
  v_actor_id := auth.uid();
  IF v_actor_id IS NOT NULL THEN
    SELECT email INTO v_actor_email FROM auth.users WHERE id = v_actor_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    v_new := to_jsonb(OLD);
    v_snapshot := v_new; -- full row, for 30-day undo — see recently_deleted.sql
  ELSE
    v_new := to_jsonb(NEW);
  END IF;
  v_record_id  := COALESCE(v_new->>'id', v_new->>'user_id');
  v_company_id := NULLIF(v_new->>'company_id', '')::uuid;

  IF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD);
    SELECT array_agg(e.key ORDER BY e.key) INTO v_changed
    FROM jsonb_each(to_jsonb(NEW)) e
    WHERE v_old->e.key IS DISTINCT FROM e.value
      AND e.key NOT IN ('updated_at', 'created_at');

    IF v_changed IS NULL THEN
      RETURN NEW;
    END IF;

    IF v_changed = ARRAY['photos'] THEN
      DECLARE
        v_before int := COALESCE(jsonb_array_length(v_old->'photos'), 0);
        v_after  int := COALESCE(jsonb_array_length(v_new->'photos'), 0);
      BEGIN
        v_detail := COALESCE(v_new->>'name', v_new->'payload'->>'name', v_new->>'title', left(v_record_id, 8))
          || ' — ' || CASE WHEN v_after > v_before THEN 'added a photo' WHEN v_after < v_before THEN 'removed a photo' ELSE 'reordered photos' END;
      END;
    ELSE
      v_detail := COALESCE(v_new->>'name', v_new->'payload'->>'name', v_new->>'title', v_new->>'edit_summary', v_new->>'role', left(v_record_id, 8))
        || ' (' || array_to_string(v_changed, ', ') || ')';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- v_new->'payload'->>'name' covers inventory_items, which stores almost
    -- everything (including its display name) inside one jsonb `payload`
    -- column rather than a flat `name` column like the other trashed
    -- tables — without this fallback, a deleted part's Recently Deleted row
    -- would show a truncated uuid instead of its actual name.
    v_detail := COALESCE(v_new->>'name', v_new->'payload'->>'name', v_new->>'title', v_new->>'role', left(v_record_id, 8));
  ELSE
    v_detail := COALESCE(v_new->>'name', v_new->'payload'->>'name', v_new->>'title', v_new->>'edit_summary', v_new->>'role', left(v_record_id, 8));
  END IF;

  INSERT INTO activity_log (actor_id, actor_email, action, table_name, record_id, company_id, detail, source, snapshot)
  VALUES (
    v_actor_id, v_actor_email,
    TG_TABLE_NAME || '.' || lower(TG_OP::text),
    TG_TABLE_NAME, v_record_id, v_company_id, v_detail, 'trigger', v_snapshot
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Only tables a restore is actually meaningful/safe for — deliberately not
-- every table the base trigger covers (wiki_entries/wiki_revisions/
-- marketplace_listings/machine_bookings are collaborative/public-facing
-- content with their own edit-history or moderation model already; folding
-- them into a personal "my recently deleted" undo isn't the right fit).
-- This is the ONE place this list is defined — inventory_recently_deleted.sql
-- (which extends this file to also cover inventory_items) deliberately does
-- NOT redefine this function itself; CREATE OR REPLACE would silently
-- clobber whichever version ran last if two files both tried to own it, so
-- re-running this file alone would otherwise quietly regress the allowlist.
CREATE OR REPLACE FUNCTION _recently_deleted_allowed_table(p_table text)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT p_table IN ('machines', 'vehicles', 'equipment', 'tools', 'consumables', 'clients', 'company_members', 'services', 'inventory_items');
$$;

-- Returns the caller's own deleted rows from the last 30 days that haven't
-- already been restored. Deliberately scoped to `actor_id = auth.uid()` —
-- "things I deleted", not a company-wide view — activity_log itself stays
-- admin-only (this RPC is the one narrow, self-scoped window into it for
-- everyone else). `services` rows are excluded from the list itself (they
-- only ever come back as a side effect of restoring their parent machine,
-- never restored standalone) but still need snapshot storage to make that
-- possible.
CREATE OR REPLACE FUNCTION list_my_recently_deleted()
RETURNS TABLE (id uuid, table_name text, record_id text, detail text, created_at timestamptz)
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT a.id, a.table_name, a.record_id, a.detail, a.created_at
  FROM activity_log a
  WHERE a.actor_id = auth.uid()
    AND a.action LIKE '%.delete'
    AND a.snapshot IS NOT NULL
    AND a.restored_at IS NULL
    AND a.created_at > now() - interval '30 days'
    AND a.table_name != 'services'
    AND _recently_deleted_allowed_table(a.table_name)
  ORDER BY a.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION list_my_recently_deleted() TO authenticated;

-- Restores one deleted row from its snapshot. machines get one extra step:
-- deleteMachineApi() also hard-deletes that machine's `services` rows first
-- (no ON DELETE CASCADE on services.machine_id) — those got their own
-- `services.delete` activity_log rows via the same trigger, so restoring a
-- machine also restores every matching services snapshot from the same
-- delete operation, rather than bringing the machine back with its service
-- history silently gone.
CREATE OR REPLACE FUNCTION restore_deleted_record(p_log_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_row       activity_log;
  v_svc       activity_log;
  v_restored  int := 0;
BEGIN
  SELECT * INTO v_row FROM activity_log
  WHERE id = p_log_id AND actor_id = auth.uid() FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nothing to restore — not found, or not yours';
  END IF;
  IF v_row.restored_at IS NOT NULL THEN
    RAISE EXCEPTION 'Already restored';
  END IF;
  IF v_row.snapshot IS NULL THEN
    RAISE EXCEPTION 'Nothing to restore — no snapshot was captured';
  END IF;
  IF v_row.created_at < now() - interval '30 days' THEN
    RAISE EXCEPTION 'This is past the 30-day recovery window';
  END IF;
  IF NOT _recently_deleted_allowed_table(v_row.table_name) THEN
    RAISE EXCEPTION 'This type of record can''t be restored here';
  END IF;

  BEGIN
    EXECUTE format(
      'INSERT INTO %I SELECT * FROM jsonb_populate_record(NULL::%I, $1)',
      v_row.table_name, v_row.table_name
    ) USING v_row.snapshot;
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE EXCEPTION 'Couldn''t restore — something this record depended on (like a linked client or company) no longer exists';
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Couldn''t restore — a record with the same id already exists';
  END;

  UPDATE activity_log SET restored_at = now() WHERE id = p_log_id;
  v_restored := 1;

  IF v_row.table_name = 'machines' THEN
    FOR v_svc IN
      SELECT * FROM activity_log
      WHERE table_name = 'services'
        AND action = 'services.delete'
        AND actor_id = auth.uid()
        AND restored_at IS NULL
        AND snapshot IS NOT NULL
        AND snapshot->>'machine_id' = v_row.record_id
        -- Same delete operation only — services deleted independently at an
        -- unrelated time shouldn't come back just because the machine did.
        AND created_at BETWEEN v_row.created_at - interval '10 seconds' AND v_row.created_at + interval '10 seconds'
    LOOP
      BEGIN
        EXECUTE 'INSERT INTO services SELECT * FROM jsonb_populate_record(NULL::services, $1)' USING v_svc.snapshot;
        UPDATE activity_log SET restored_at = now() WHERE id = v_svc.id;
        v_restored := v_restored + 1;
      EXCEPTION WHEN OTHERS THEN
        -- Best-effort — the machine itself is already back; a service record
        -- failing to restore shouldn't undo that or abort the whole call.
        NULL;
      END;
    END LOOP;
  END IF;

  -- `record` is the raw re-inserted row (same shape as v_row.snapshot) so the
  -- client can push it straight into its own machines/clients/etc. state
  -- without a second round-trip to re-fetch what it just restored.
  RETURN jsonb_build_object('table_name', v_row.table_name, 'record_id', v_row.record_id, 'restored_count', v_restored, 'record', v_row.snapshot);
END;
$$;

GRANT EXECUTE ON FUNCTION restore_deleted_record(uuid) TO authenticated;
