-- Run in Supabase Dashboard → SQL Editor
-- Adds chipper and stump grinder spec columns to the machines table

ALTER TABLE machines
  ADD COLUMN IF NOT EXISTS chipper_spec       jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stump_grinder_spec jsonb DEFAULT NULL;
