-- Add max_quantity (par ceiling) to consumables table
-- Run in Supabase SQL Editor.

ALTER TABLE consumables ADD COLUMN IF NOT EXISTS max_quantity numeric;
