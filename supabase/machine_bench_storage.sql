-- Replaces the machine `status` enum (Active/Queued/Complete) with a
-- location model: on_bench (was "Active" — actively being worked on, shown
-- in the new Bench tab instead of a kanban column) + complete (was
-- "Complete" — an orthogonal ready-for-pickup badge, not a location; a
-- machine returns to Garage when marked complete). "Queued" is dropped
-- entirely — sitting in Garage with on_bench=false already means queued,
-- there's nothing left for a separate value to distinguish.
--
-- estimated_value is new: an optional per-machine value used by the new
-- Storage tab to flag when accrued labour+parts+storage fees exceed what
-- the machine is worth.
--
-- The old `status` column is left in place, unused — vestigial, same as
-- profiles.tier/companies.tier after the earlier tier-system removal —
-- rather than dropped, since nothing reads it after this migration and
-- dropping it is pure extra risk for no benefit.
-- Run in Supabase SQL Editor.

ALTER TABLE machines ADD COLUMN IF NOT EXISTS on_bench boolean NOT NULL DEFAULT false;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS complete boolean NOT NULL DEFAULT false;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS estimated_value numeric;

-- One-time backfill from the old status column for existing rows:
--   Active   -> on_bench = true  (was being actively worked on)
--   Complete -> complete = true  (returns to Garage, badge riding along)
--   Queued / anything else -> both false (just sits in Garage)
UPDATE machines SET on_bench = true  WHERE status = 'Active'   AND NOT on_bench;
UPDATE machines SET complete = true  WHERE status = 'Complete' AND NOT complete;
