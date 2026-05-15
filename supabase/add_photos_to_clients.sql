-- Add photos column to clients table (safe to run multiple times)
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS photos jsonb DEFAULT '[]';
