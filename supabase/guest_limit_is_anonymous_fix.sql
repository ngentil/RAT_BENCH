-- Fix enforce_guest_machine_limit to use auth.users.is_anonymous (non-writable column)
-- instead of raw_user_meta_data->>'is_anonymous' (user-writable via updateUser()).
-- An anonymous user could call supabase.auth.updateUser({ data: { is_anonymous: 'false' } })
-- to set the metadata field to false, bypassing the 3-machine cap and getting 5 machines
-- (falling through to the free-tier enforce_machine_limit instead).
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION enforce_guest_machine_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_is_anon boolean;
  v_count   int;
BEGIN
  -- Use is_anonymous column (set by Supabase, not user-writable via updateUser)
  SELECT is_anonymous INTO v_is_anon
  FROM auth.users WHERE id = NEW.user_id;

  IF v_is_anon IS TRUE THEN
    SELECT COUNT(*) INTO v_count
    FROM machines WHERE user_id = NEW.user_id;

    IF v_count >= 3 THEN
      RAISE EXCEPTION 'Guest machine limit reached (max 3). Create a free account to add more.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
