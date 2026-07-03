-- Run in Supabase Dashboard → SQL Editor
-- Adds columns for machine fields that MachineForm collects but the machines
-- table never had — until now these were silently discarded on every save:
--   due_date              job due date (DUE/OVERDUE badges)
--   compression_ratio     engine compression ratio (numeric spec, distinct from `compression`)
--   total_load_watts      electrical charging-section load figure
--   ground_contact_length tracked-machine ground pressure input
--   outboard_spec         all 13 outboard motor fields (shaft length, prop, gear oil, …)
--   last_service_notes    notes from the Mark Serviced modal

ALTER TABLE machines
  ADD COLUMN IF NOT EXISTS due_date              date  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS compression_ratio     text  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS total_load_watts      text  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ground_contact_length text  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS outboard_spec         jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_service_notes    text  DEFAULT NULL;
