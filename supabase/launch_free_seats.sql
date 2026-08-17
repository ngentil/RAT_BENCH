-- Launch mode: every company gets a free floor of seats beyond the owner,
-- no purchase required. A brand-new company starts at paid_seats = 0, which
-- without this means the owner can't add a single teammate without paying
-- — see company_billing.sql's join_company_by_invite(). This redefines
-- that one function to check GREATEST(paid_seats, _free_seat_cap())
-- instead of paid_seats alone; a company that's actually paid for more
-- than the free cap keeps whatever larger number it paid for.
--
-- Deliberately a separate file rather than editing company_billing.sql in
-- place — same layering convention as inventory_recently_deleted.sql
-- extending recently_deleted.sql.
--
-- IMPORTANT — _free_seat_cap() ownership: this file's version hardcodes
-- 10. If launch_flags_admin.sql is ALSO applied (recommended — it's what
-- makes this toggleable from the Admin Panel's Flags tab instead of
-- requiring a SQL deploy to flip), that file redefines _free_seat_cap()
-- again to read from the feature_flags table instead (returning 0 — fully
-- paid-only, matching the original company_billing.sql behavior — whenever
-- the admin turns the free_seats flag off). Once you're using the Admin
-- Panel toggle, do NOT re-run this file alone afterward — it would
-- silently revert _free_seat_cap() back to the hardcoded 10, undoing
-- whatever the admin toggle is actually set to. Re-run
-- launch_flags_admin.sql (or both, in that order) instead.
--
-- Requires: company_billing.sql already applied.
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION _free_seat_cap()
RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT 10;
$$;

CREATE OR REPLACE FUNCTION join_company_by_invite(invite_code_input text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_uid        uuid := auth.uid();
  v_company_id uuid;
  v_paid_seats integer;
  v_in_use     integer;
  v_already_member boolean;
BEGIN
  SELECT id, paid_seats INTO v_company_id, v_paid_seats
  FROM companies
  WHERE invite_code = upper(trim(invite_code_input))
  FOR UPDATE;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  -- Prevent joining if already a member of a different company
  IF EXISTS (
    SELECT 1 FROM company_members
    WHERE user_id = v_uid AND company_id != v_company_id
  ) THEN
    RAISE EXCEPTION 'Leave your current organisation before joining another';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM company_members WHERE company_id = v_company_id AND user_id = v_uid
  ) INTO v_already_member;

  -- Only a genuinely new member consumes a seat — rejoining after leaving
  -- (or an ON CONFLICT no-op below) doesn't need a fresh seat check.
  IF NOT v_already_member THEN
    v_in_use := _paid_seats_in_use(v_company_id);
    IF v_in_use >= GREATEST(v_paid_seats, _free_seat_cap()) THEN
      RAISE EXCEPTION 'This organisation has no available seats — ask the owner to free one up before you can join';
    END IF;
  END IF;

  INSERT INTO company_members (company_id, user_id, role, joined_at)
  VALUES (v_company_id, v_uid, 'viewer', now())
  ON CONFLICT (company_id, user_id) DO NOTHING;

  UPDATE profiles SET company_id = v_company_id WHERE id = v_uid;

  RETURN v_company_id;
END;
$$;

GRANT EXECUTE ON FUNCTION join_company_by_invite(text) TO authenticated;
