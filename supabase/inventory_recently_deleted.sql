-- Extends Recently Deleted (recently_deleted.sql, which must be applied
-- AFTER this file too — it's the one that already includes 'inventory_items'
-- in _recently_deleted_allowed_table()'s allowlist) to cover inventory_items
-- ("Parts" in Workshop) — the one gap called out explicitly when that
-- feature first shipped. inventory_items was never in activity_log.sql's
-- original covered-tables list, so its deletes were never snapshotted at
-- all; this attaches the exact same generic trigger function
-- activity_log.sql already defines (_log_activity(), unchanged) rather than
-- duplicating it. Deliberately does NOT redefine
-- _recently_deleted_allowed_table() itself — that function has exactly one
-- owner (recently_deleted.sql) so re-running either file alone can never
-- silently clobber the other's changes to it.
--
-- inventory_items stores almost everything in one `payload` jsonb column
-- rather than flat columns like the other trashed tables — doesn't matter
-- here, to_jsonb(OLD)/jsonb_populate_record() work the same either way,
-- since they operate on the whole row generically. _log_activity() itself
-- (redefined in recently_deleted.sql) already knows to look inside
-- `payload->>'name'` for a deleted part's display label.
--
-- Requires: activity_log.sql and recently_deleted.sql already applied.
-- Run in Supabase SQL Editor.

DROP TRIGGER IF EXISTS trg_activity_log ON inventory_items;
CREATE TRIGGER trg_activity_log
  AFTER INSERT OR UPDATE OR DELETE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION _log_activity();
