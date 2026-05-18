-- Add driver details and weekly availability schedule to tow_trucks
ALTER TABLE tow_trucks
  ADD COLUMN IF NOT EXISTS da_number   text,
  ADD COLUMN IF NOT EXISTS driver_name text,
  ADD COLUMN IF NOT EXISTS schedule    jsonb DEFAULT '{}'::jsonb;

-- schedule shape:
-- {
--   "days":   { "mon": true, "tue": true, "wed": true, "thu": true, "fri": true, "sat": false, "sun": false },
--   "nights": { "mon": false, "tue": false, "wed": true, "thu": false, "fri": false, "sat": false, "sun": false }
-- }
