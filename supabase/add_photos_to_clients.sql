-- Add missing columns to clients table (safe to run multiple times)
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS notes   text,
  ADD COLUMN IF NOT EXISTS photos  jsonb DEFAULT '[]';
