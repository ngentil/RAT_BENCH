# Activity log setup — Live Log admin tab

One-time setup for the "every action, by anyone" admin feed (Settings →
Admin → Live Log).

## 1. Apply the migration

Run `supabase/activity_log.sql` in the Supabase SQL Editor. This creates the
`activity_log` table, attaches a generic audit trigger to the app's main
data tables (machines, vehicles, equipment, tools, consumables, wiki
entries/revisions, services, machine bookings, company members, marketplace
listings, clients), mirrors Supabase Auth's own login/logout/signup events
in via a trigger on `auth.audit_log_entries`, and adds the
`admin_list_activity` RPC the Live Log tab reads from.

## 2. Confirm Realtime is enabled for `activity_log`

The migration tries `ALTER PUBLICATION supabase_realtime ADD TABLE
activity_log` itself, but the two other Realtime-enabled tables in this
project (`machines`, `marketplace_messages`) have no equivalent SQL
anywhere in this repo — they were switched on by hand via the dashboard.
After running the migration, check **Database → Replication** in the
Supabase dashboard and make sure `activity_log` is toggled on. Without
this, the Live tab still works (it falls back to nothing but the initial
load) but new rows won't appear without a manual refresh.

## 3. Verify the auth-event mirroring against your real project

`auth.audit_log_entries`'s `payload` jsonb shape (the exact key names for
the action/actor) is not a stable public API and can vary slightly by
GoTrue version. After deploying, log in and out once on the real site and
check Live Log actually shows `auth.login` / `auth.logout` rows with the
right email attached. If the action or actor fields don't show up as
expected, inspect a raw row with:

```sql
select payload from auth.audit_log_entries order by created_at desc limit 5;
```

and adjust the key names read in `_mirror_auth_event()` in
`supabase/activity_log.sql` to match.

## 4. Retention pruning

`.github/workflows/prune-activity-log.yml` runs daily and deletes rows
older than 30 days via `scripts/prune-activity-log.mjs`. It reuses the same
`SUPABASE_URL` / `SUPABASE_SERVICE_KEY` GitHub Actions secrets the existing
wiki photo-points workflow already depends on — nothing new to configure if
that one's already set up. Change `--days=30` in the workflow file to
adjust how much history stays browsable.

## Verifying it works

Once deployed: perform a few actions as a normal user (add a machine, edit
a wiki entry, log out and back in), then open Settings → Admin → Live Log
as an admin account. The Live tab should show them within a second or two
without refreshing; Browse/Search should find them under today's date.
