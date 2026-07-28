-- Activity log — a dmesg-style feed of "every action, by anyone" for the
-- admin panel: every create/update/delete across the app's main data
-- tables (via one generic trigger, reused across each table) PLUS Supabase
-- Auth's own login/logout/signup/etc. events (mirrored in via a trigger on
-- auth.audit_log_entries), so both land in one single, single-order,
-- Realtime-subscribable table.
--
-- Run in Supabase SQL Editor. After running, double-check Database →
-- Replication in the dashboard shows `activity_log` enabled for Realtime —
-- the ALTER PUBLICATION below does this via SQL, but the two other
-- Realtime-enabled tables in this project (machines, marketplace_messages)
-- have no equivalent SQL anywhere in this repo, meaning they were turned on
-- via the dashboard toggle by hand — if the ALTER PUBLICATION statement
-- below errors or silently no-ops on your project, use the toggle instead.

CREATE TABLE IF NOT EXISTS activity_log (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Postgres freezes now() for the whole transaction, so several rows
  -- inserted together (e.g. cascading trigger effects) can share the exact
  -- same created_at — seq is a strictly-increasing tiebreaker so ordering
  -- by (created_at, seq) is always well-defined, never ambiguous.
  seq         bigserial   NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  actor_id    uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,                    -- snapshot — survives actor_id going null on account deletion
  action      text        NOT NULL,    -- '<table>.create' / '<table>.update' / '<table>.delete' / 'auth.<event>'
  table_name  text,                    -- null for auth.* rows
  record_id   text,                    -- stored as text since ids vary in type across tables
  company_id  uuid,                    -- denormalized, nullable — lets the UI scope/filter by org later
  detail      text,                    -- short human-readable summary
  source      text        NOT NULL DEFAULT 'trigger' CHECK (source IN ('trigger', 'auth'))
);

CREATE INDEX IF NOT EXISTS idx_activity_log_created_at  ON activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_action       ON activity_log (action);
CREATE INDEX IF NOT EXISTS idx_activity_log_actor_email  ON activity_log (actor_email);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS activity_log_admin_read ON activity_log;

-- Append-only, same as admin_audit_log: no INSERT/UPDATE/DELETE policy at
-- all — every write happens through the SECURITY DEFINER trigger functions
-- below, which run as the DB owner and bypass RLS entirely. This SELECT
-- policy is also what Supabase Realtime's postgres_changes subscription
-- checks before delivering a row to a subscribed client, so a non-admin's
-- live-feed subscription simply never receives anything.
CREATE POLICY activity_log_admin_read ON activity_log
  FOR SELECT TO authenticated
  USING (auth.email() IN ('nathan.gentil.ai@gmail.com', 'nathan.gentil@gmail.com'));

-- service_role bypasses RLS but — per the exact lesson learned fixing the
-- wiki photo-points cron (wiki_photo_points_service_role_fix.sql) — still
-- needs the base table GRANT to touch the table at all. Needed by
-- scripts/prune-activity-log.mjs (the daily retention job).
GRANT SELECT, DELETE ON activity_log TO service_role;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
EXCEPTION
  WHEN duplicate_object THEN NULL;  -- already added — re-running this file is safe
  WHEN undefined_object  THEN NULL; -- publication doesn't exist on this instance — use the dashboard toggle instead
END $$;


-- ── Generic trigger: fires on every INSERT/UPDATE/DELETE on a covered table ──

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
BEGIN
  v_actor_id := auth.uid();
  IF v_actor_id IS NOT NULL THEN
    SELECT email INTO v_actor_email FROM auth.users WHERE id = v_actor_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    v_new := to_jsonb(OLD);
  ELSE
    v_new := to_jsonb(NEW);
  END IF;
  -- Not every covered table has a surrogate `id` — company_members uses a
  -- composite (company_id, user_id) key — so fall back to user_id as the
  -- next most identifying reference rather than leaving record_id blank.
  v_record_id  := COALESCE(v_new->>'id', v_new->>'user_id');
  v_company_id := NULLIF(v_new->>'company_id', '')::uuid;

  IF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD);
    -- Which top-level columns actually differ, ignoring pure timestamp churn.
    SELECT array_agg(e.key ORDER BY e.key) INTO v_changed
    FROM jsonb_each(to_jsonb(NEW)) e
    WHERE v_old->e.key IS DISTINCT FROM e.value
      AND e.key NOT IN ('updated_at', 'created_at');

    IF v_changed IS NULL THEN
      RETURN NEW; -- nothing meaningful changed (e.g. only updated_at bumped) — skip logging
    END IF;

    -- Special-case the common jsonb photo-array columns so a photo add/remove
    -- reads as "added a photo" rather than an opaque "(photos)" column diff.
    IF v_changed = ARRAY['photos'] THEN
      DECLARE
        v_before int := COALESCE(jsonb_array_length(v_old->'photos'), 0);
        v_after  int := COALESCE(jsonb_array_length(v_new->'photos'), 0);
      BEGIN
        v_detail := COALESCE(v_new->>'name', v_new->>'title', left(v_record_id, 8))
          || ' — ' || CASE WHEN v_after > v_before THEN 'added a photo' WHEN v_after < v_before THEN 'removed a photo' ELSE 'reordered photos' END;
      END;
    ELSE
      v_detail := COALESCE(v_new->>'name', v_new->>'title', v_new->>'edit_summary', v_new->>'role', left(v_record_id, 8))
        || ' (' || array_to_string(v_changed, ', ') || ')';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_detail := COALESCE(v_new->>'name', v_new->>'title', v_new->>'role', left(v_record_id, 8));
  ELSE -- INSERT
    v_detail := COALESCE(v_new->>'name', v_new->>'title', v_new->>'edit_summary', v_new->>'role', left(v_record_id, 8));
  END IF;

  INSERT INTO activity_log (actor_id, actor_email, action, table_name, record_id, company_id, detail, source)
  VALUES (
    v_actor_id, v_actor_email,
    TG_TABLE_NAME || '.' || lower(TG_OP::text),
    TG_TABLE_NAME, v_record_id, v_company_id, v_detail, 'trigger'
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach to every table whose changes count as a real user action. Add more
-- tables later by repeating the DROP+CREATE TRIGGER pair — the function
-- itself needs no changes since it reads columns generically via jsonb.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'machines', 'vehicles', 'equipment', 'tools', 'consumables',
    'wiki_entries', 'wiki_revisions', 'services', 'machine_bookings',
    'company_members', 'marketplace_listings', 'clients'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_activity_log ON %I', t);
    EXECUTE format(
      'CREATE TRIGGER trg_activity_log AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION _log_activity()',
      t
    );
  END LOOP;
END $$;


-- ── Auth events: mirror Supabase Auth's own audit_log_entries into the same feed ──
--
-- auth.audit_log_entries is populated automatically by Supabase Auth
-- (GoTrue) for every login/logout/signup/password-reset/etc. — nothing to
-- instrument, it already exists. Its `payload` jsonb shape (specifically the
-- exact key names for action/actor) is not a stable public API and can vary
-- slightly by GoTrue version, so this extracts defensively and should be
-- spot-checked against a real login/logout on your actual project once
-- deployed — see docs/ACTIVITY_LOG_SETUP.md.
CREATE OR REPLACE FUNCTION _mirror_auth_event() RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_action text := NEW.payload->>'action';
  v_actor_id uuid;
  v_actor_email text;
BEGIN
  -- Token refresh fires constantly in the background for every open session
  -- and isn't a user-initiated action — pure noise in a feed meant to be
  -- human-read, so it's the one thing explicitly excluded rather than
  -- maintaining a fragile include-list of every other action name.
  IF v_action IN ('token_refreshed', 'token_revoked') THEN
    RETURN NEW;
  END IF;

  BEGIN
    v_actor_id := NULLIF(NEW.payload->>'actor_id', '')::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    v_actor_id := NULL;
  END;
  v_actor_email := COALESCE(NEW.payload->>'actor_username', NEW.payload->>'traits');

  INSERT INTO activity_log (actor_id, actor_email, action, detail, source)
  VALUES (v_actor_id, v_actor_email, 'auth.' || COALESCE(v_action, 'unknown'), v_actor_email, 'auth');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mirror_auth_event ON auth.audit_log_entries;
CREATE TRIGGER trg_mirror_auth_event
  AFTER INSERT ON auth.audit_log_entries
  FOR EACH ROW EXECUTE FUNCTION _mirror_auth_event();


-- ── Admin RPC: paginated/filterable read, mirrors admin_list_users' conventions ──

DROP FUNCTION IF EXISTS admin_list_activity(timestamptz, timestamptz, text, text, int, int);

CREATE OR REPLACE FUNCTION admin_list_activity(
  p_since  timestamptz DEFAULT NULL,
  p_until  timestamptz DEFAULT NULL,
  p_search text        DEFAULT '',
  p_action text        DEFAULT '',
  p_limit  int         DEFAULT 200,
  p_offset int         DEFAULT 0
)
RETURNS TABLE (
  id          uuid,
  seq         bigint,
  created_at  timestamptz,
  actor_email text,
  action      text,
  table_name  text,
  record_id   text,
  detail      text,
  source      text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF auth.email() NOT IN ('nathan.gentil.ai@gmail.com', 'nathan.gentil@gmail.com') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT a.id, a.seq, a.created_at, a.actor_email, a.action, a.table_name, a.record_id, a.detail, a.source
  FROM activity_log a
  WHERE (p_since IS NULL OR a.created_at >= p_since)
    AND (p_until IS NULL OR a.created_at < p_until)
    AND (p_action = '' OR a.action ILIKE p_action || '%')
    AND (
      p_search = '' OR
      a.actor_email ILIKE '%' || p_search || '%' OR
      a.detail       ILIKE '%' || p_search || '%' OR
      a.action       ILIKE '%' || p_search || '%'
    )
  -- created_at alone can tie within one transaction (Postgres freezes now()
  -- for its duration) — seq is a strictly-increasing tiebreaker.
  ORDER BY a.created_at DESC, a.seq DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_list_activity(timestamptz, timestamptz, text, text, int, int) TO authenticated;
