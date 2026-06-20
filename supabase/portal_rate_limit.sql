-- Internal helper for the create-portal edge function to atomically stamp
-- last_portal_session_at without going through the upsert_preference allowlist.
-- NOT granted to authenticated — only callable by service_role (edge functions).
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION _set_portal_session_at(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET preferences = preferences || jsonb_build_object('last_portal_session_at', now()::text)
  WHERE id = p_user_id;
END;
$$;

-- Intentionally no GRANT to authenticated — service_role bypasses GRANT EXECUTE.
-- This prevents users from calling _set_portal_session_at directly to reset
-- the rate-limit timestamp.
