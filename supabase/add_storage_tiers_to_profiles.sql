ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS storage_tiers jsonb DEFAULT '{}';
