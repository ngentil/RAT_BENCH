-- Run in Supabase Dashboard → SQL Editor
-- Adds all jsonb columns that may be missing from the machines table

ALTER TABLE machines
  ADD COLUMN IF NOT EXISTS parts          jsonb  NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS time_log       jsonb  NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS job_timer      jsonb           DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lighting       jsonb  NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS belts          jsonb  NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS batteries      jsonb  NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS bearings       jsonb  NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hyd_rams       jsonb  NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS attachments    jsonb  NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_sections jsonb          DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS carb_spec      jsonb           DEFAULT NULL;
