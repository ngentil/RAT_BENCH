-- Move user preferences from localStorage to Supabase
-- Run in Supabase SQL Editor

-- 1. Add preferences column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferences jsonb NOT NULL DEFAULT '{}';

-- 2. Atomic JSONB key upsert — merges a single key into preferences without
--    overwriting other keys (safe for concurrent calls from different tabs)
CREATE OR REPLACE FUNCTION upsert_preference(p_user_id uuid, p_key text, p_value jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF p_key NOT IN (
    'rat_tut', 'rat_tut_job_card', 'rat_tut_jobs', 'rat_tut_revenue',
    'rat_tut_search', 'rat_tut_clients', 'rat_form_tut', 'rat_wiki_seeded',
    'tab', 'workshopTab', 'trackerSort', 'trackerView',
    'vehiclesSort', 'vehiclesView', 'toolsSort', 'toolsView',
    'equipmentSort', 'equipmentView',
    'trackerCols', 'vehiclesCols', 'toolsCols', 'equipmentCols',
    'dismissedAnns', '_lsMigrated', 'last_portal_session_at'
  ) THEN
    RAISE EXCEPTION 'Forbidden preference key';
  END IF;
  UPDATE profiles
  SET preferences = preferences || jsonb_build_object(p_key, p_value)
  WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_preference(uuid, text, jsonb) TO authenticated;
