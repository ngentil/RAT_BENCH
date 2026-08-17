-- Launch mode: every company gets a free floor of seats beyond the owner,
-- no purchase required (see src/lib/launchFlags.js's FREE_SEAT_CAP — keep
-- this file's _free_seat_cap() in sync with that constant if it changes).
-- A brand-new company starts at paid_seats = 0, which without this means
-- the owner can't add a single teammate without paying — see
-- company_billing.sql's join_company_by_invite(). This redefines that one
-- function to check GREATEST(paid_seats, _free_seat_cap()) instead of
-- paid_seats alone; a company that's actually paid for more than the free
-- cap keeps whatever larger number it paid for.
--
-- Deliberately a separate file rather than editing company_billing.sql in
-- place — same layering convention as inventory_recently_deleted.sql
-- extending recently_deleted.sql. Set _free_seat_cap() back to 0 (or delete
-- this file and re-run company_billing.sql) to fully restore the original
-- paid-only behavior once seat billing comes back.
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
