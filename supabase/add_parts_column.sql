-- Run in Supabase Dashboard → SQL Editor

ALTER TABLE machines
  ADD COLUMN IF NOT EXISTS parts jsonb NOT NULL DEFAULT '[]'::jsonb;
