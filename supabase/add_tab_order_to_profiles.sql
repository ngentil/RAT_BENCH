ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tab_order jsonb DEFAULT '{}';
