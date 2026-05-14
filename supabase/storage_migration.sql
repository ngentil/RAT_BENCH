-- Storage Policy migration
-- Run in Supabase SQL Editor after deploying this update

-- 1. Add global storage toggle to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS storage_policy_enabled boolean NOT NULL DEFAULT false;

-- 2. Create machine_bookings table
CREATE TABLE IF NOT EXISTS machine_bookings (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id           uuid NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  user_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id           uuid REFERENCES companies(id) ON DELETE SET NULL,
  storage_tier         text NOT NULL DEFAULT 'Bench',
  received_at          timestamptz NOT NULL DEFAULT now(),
  collected_at         timestamptz,
  storage_fee_override numeric,
  storage_enabled      boolean NOT NULL DEFAULT true,
  notes                text,
  created_at           timestamptz DEFAULT now()
);

-- 3. Enable Row Level Security
ALTER TABLE machine_bookings ENABLE ROW LEVEL SECURITY;

-- 4. RLS policy: users own their own bookings
CREATE POLICY "own" ON machine_bookings
  FOR ALL USING (user_id = auth.uid());

-- 5. Partial index for fast active-booking lookups
CREATE INDEX IF NOT EXISTS idx_bookings_machine_open
  ON machine_bookings (machine_id)
  WHERE collected_at IS NULL;
