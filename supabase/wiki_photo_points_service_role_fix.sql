-- Fix: the daily "Wiki Photo Points" scheduled workflow
-- (award-photo-survival-points.mjs, run by .github/workflows/wiki-points.yml)
-- has been failing every run with "permission denied for table
-- wiki_entry_photos" (Postgres 42501).
--
-- Root cause: wiki_photos.sql / wiki_points.sql only granted SELECT/INSERT/
-- DELETE to `authenticated` and SELECT to `anon` on wiki_entry_photos, and
-- SELECT to `authenticated` on wiki_points_ledger. Unlike several other
-- tables in this project (asset_assignments, consumables, inventory_items,
-- vehicle_assignments — see their own migrations), neither ever added the
-- explicit `GRANT ... TO service_role` this Supabase project requires for
-- service-role scripts/cron jobs to read/write a table — service_role here
-- does not implicitly get table access the way it bypasses RLS.
--
-- The script needs to SELECT from wiki_entry_photos and INSERT into
-- wiki_points_ledger (both using SUPABASE_SERVICE_KEY), so both grants are
-- added here. RLS itself is unaffected — service_role already bypasses RLS
-- once it has the underlying table grant, same as every other service_role
-- table in this project.
--
-- Run in Supabase SQL Editor.

GRANT SELECT ON wiki_entry_photos TO service_role;
GRANT INSERT, SELECT ON wiki_points_ledger TO service_role;
