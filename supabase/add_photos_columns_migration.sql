-- Add photos + service_log columns to vehicles / tools / equipment if they
-- weren't present when the table was first created.
-- Safe to run multiple times (IF NOT EXISTS).

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS photos      jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS service_log jsonb DEFAULT '[]';

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS photos      jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS service_log jsonb DEFAULT '[]';

ALTER TABLE equipment
  ADD COLUMN IF NOT EXISTS photos      jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS service_log jsonb DEFAULT '[]';
