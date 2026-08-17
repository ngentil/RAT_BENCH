-- Re-adds a member-count cap to companies — purely an abuse-prevention
-- lever now, not a paywall. The seat cap disappeared entirely when
-- remove_paywall_system.sql restored join_company_by_invite() to its
-- unrestricted pre-billing form (deleting the paywall meant deleting the
-- cap concept along with it, not just the payment requirement behind it),
-- and unlimited team members turned out not to be what was actually
-- wanted — just unlimited for free.
--
-- Toggleable from the Admin Panel's Flags tab (reuses the existing
-- feature_flags table/UI, same as community/wiki/marketplace) rather than
-- a hardcoded constant — flip it off entirely for genuinely unlimited
-- members, or change the number, both with no redeploy. Defaults to
-- enabled=true, value=10, matching the free-seat-cap number chosen
-- earlier this session before it was removed along with the rest of the
-- paywall.
--
-- This is join_company_by_invite()'s third redefinition this session
-- (company_billing.sql's original paid-seat gate -> launch_free_seats.sql's
-- GREATEST(paid_seats, free_cap) floor -> remove_paywall_system.sql's fully
-- unrestricted form -> this file's flat member cap, unrelated to
-- paid_seats/billing at all now). _paid_seats_in_use() is reused unchanged
-- for the actual count despite its now-inaccurate name — deliberately not
-- renamed, since this is a same-day, low-risk reuse of existing, already-
-- verified logic (it just counts non-owner members) and a rename earns
-- nothing functional.
--
-- Requires: company_billing.sql (_paid_seats_in_use()) and
-- remove_paywall_system.sql already applied.
-- Run in Supabase SQL Editor.

INSERT INTO feature_flags (key, label, enabled, value) VALUES
  ('member_cap', 'Team member limit (per company)', true, 10)
ON CONFLICT (key) DO NOTHING;

-- NULL means uncapped (flag off) — deliberately not 0, which would mean
-- "cap at zero members," the opposite of what "off" should do.
CREATE OR REPLACE FUNCTION _member_cap()
RETURNS integer LANGUAGE sql STABLE AS $$
  SELECT CASE WHEN COALESCE((SELECT enabled FROM feature_flags WHERE key = 'member_cap'), true)
    THEN COALESCE((SELECT value FROM feature_flags WHERE key = 'member_cap'), 10)
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION join_company_by_invite(invite_code_input text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_uid        uuid := auth.uid();
  v_company_id uuid;
  v_cap        integer := _member_cap();
  v_already_member boolean;
BEGIN
  SELECT id INTO v_company_id
  FROM companies
  WHERE invite_code = upper(trim(invite_code_input));

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

  -- Only a genuinely new member counts against the cap — rejoining after
  -- leaving (or an ON CONFLICT no-op below) doesn't need a fresh check.
  IF NOT v_already_member AND v_cap IS NOT NULL THEN
    IF _paid_seats_in_use(v_company_id) >= v_cap THEN
      RAISE EXCEPTION 'This organisation has reached its member limit — ask the owner to free up a spot before you can join';
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
