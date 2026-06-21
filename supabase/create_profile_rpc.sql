-- SECURITY DEFINER RPC for creating a profile when no INSERT policy exists.
-- The profiles table relies on a DB trigger for regular email signups, but
-- anonymous (guest) users are not covered by that trigger. This RPC runs as
-- the DB owner so it can INSERT without needing a client-side INSERT policy.
-- Idempotent: if the profile already exists it is returned unchanged.
--
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION create_my_profile(
  p_username    text    DEFAULT NULL,
  p_display_name text   DEFAULT NULL
)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid      uuid := auth.uid();
  v_username text;
  v_existing profiles;
BEGIN
  -- Return existing profile unchanged (idempotent)
  SELECT * INTO v_existing FROM profiles WHERE id = v_uid;
  IF FOUND THEN
    RETURN NEXT v_existing;
    RETURN;
  END IF;

  -- Sanitise and default username
  v_username := lower(trim(coalesce(p_username, '')));
  v_username := regexp_replace(v_username, '[^a-z0-9_]', '', 'g');
  v_username := left(v_username, 20);
  IF v_username = '' THEN
    v_username := 'user_' || substring(replace(v_uid::text, '-', ''), 1, 6);
  END IF;

  RETURN QUERY
    INSERT INTO profiles (id, username, display_name)
    VALUES (
      v_uid,
      v_username,
      NULLIF(trim(coalesce(p_display_name, '')), '')
    )
    ON CONFLICT (id) DO UPDATE
      SET id = EXCLUDED.id   -- no-op; makes RETURNING work if row was just inserted
    RETURNING *;
END;
$$;

GRANT EXECUTE ON FUNCTION create_my_profile(text, text) TO authenticated;
