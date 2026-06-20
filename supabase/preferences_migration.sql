-- Move user preferences from localStorage to Supabase
-- Run in Supabase SQL Editor

-- 1. Add preferences column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferences jsonb NOT NULL DEFAULT '{}';

-- 2. Atomic JSONB key upsert — merges a single key into preferences without
--    overwriting other keys (safe for concurrent calls from different tabs)
CREATE OR REPLACE FUNCTION upsert_preference(p_user_id uuid, p_key text, p_value jsonb)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE profiles
  SET preferences = preferences || jsonb_build_object(p_key, p_value)
  WHERE id = p_user_id;
$$;

GRANT EXECUTE ON FUNCTION upsert_preference(uuid, text, jsonb) TO authenticated;
