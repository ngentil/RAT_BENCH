-- SECURITY DEFINER RPCs for company lifecycle
-- rpc_create_company, rpc_delete_company, join_company_by_invite
-- These are called from the client but need to bypass RLS to insert into
-- company_members and update profiles in the same transaction.
-- Run in Supabase SQL Editor.

-- ── rpc_create_company ───────────────────────────────────────────────────────
-- Creates a company, seeds the caller as owner, links their profile.
-- payload: jsonb with company fields (name, trading_name, abn, …)

-- Drop any legacy `json` overload to avoid "could not choose candidate" error
DROP FUNCTION IF EXISTS public.rpc_create_company(payload json);

CREATE OR REPLACE FUNCTION rpc_create_company(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_uid  uuid := auth.uid();
  v_id   uuid;
  v_code text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Generate a unique 8-char invite code
  v_code := upper(substring(replace(gen_random_uuid()::text, '-', '') FROM 1 FOR 8));

  INSERT INTO companies (
    name, trading_name, abn, phone, email, website,
    address, city, state, postcode, country,
    industry, logo, hourly_rate, tax_rate, tax_label,
    invite_code, created_at
  )
  VALUES (
    payload->>'name',
    NULLIF(payload->>'trading_name', ''),
    NULLIF(payload->>'abn', ''),
    NULLIF(payload->>'phone', ''),
    NULLIF(payload->>'email', ''),
    NULLIF(payload->>'website', ''),
    NULLIF(payload->>'address', ''),
    NULLIF(payload->>'city', ''),
    NULLIF(payload->>'state', ''),
    NULLIF(payload->>'postcode', ''),
    NULLIF(payload->>'country', ''),
    NULLIF(payload->>'industry', ''),
    NULLIF(payload->>'logo', ''),
    NULLIF((payload->>'hourly_rate'), '')::numeric,
    NULLIF((payload->>'tax_rate'), '')::numeric,
    NULLIF(payload->>'tax_label', ''),
    v_code,
    now()
  )
  RETURNING id INTO v_id;

  INSERT INTO company_members (company_id, user_id, role, joined_at)
  VALUES (v_id, v_uid, 'owner', now());

  UPDATE profiles SET company_id = v_id WHERE id = v_uid;

  RETURN (SELECT to_jsonb(c) FROM companies c WHERE c.id = v_id);
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_create_company(jsonb) TO authenticated;


-- ── rpc_delete_company ───────────────────────────────────────────────────────
-- Deletes a company and cleans up memberships + asset_permissions.
-- Only the company owner can call this.

CREATE OR REPLACE FUNCTION rpc_delete_company(p_company_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  -- Verify caller is the owner
  IF NOT EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = p_company_id AND user_id = v_uid AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Only the company owner can delete the company';
  END IF;

  -- Clear profiles that point to this company
  UPDATE profiles SET company_id = NULL WHERE company_id = p_company_id;

  -- Remove company-level asset_permissions
  DELETE FROM asset_permissions WHERE company_id = p_company_id;

  -- Remove all members (including owner)
  DELETE FROM company_members WHERE company_id = p_company_id;

  -- Delete the company (FK ON DELETE SET NULL handles machines/vehicles/etc.)
  DELETE FROM companies WHERE id = p_company_id;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_delete_company(uuid) TO authenticated;


-- ── join_company_by_invite ───────────────────────────────────────────────────
-- Joins the calling user to a company via an invite code.
-- Returns the company id on success.

CREATE OR REPLACE FUNCTION join_company_by_invite(invite_code_input text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_uid        uuid := auth.uid();
  v_company_id uuid;
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

  -- Upsert so re-joining after leaving doesn't error
  INSERT INTO company_members (company_id, user_id, role, joined_at)
  VALUES (v_company_id, v_uid, 'viewer', now())
  ON CONFLICT (company_id, user_id) DO NOTHING;

  UPDATE profiles SET company_id = v_company_id WHERE id = v_uid;

  RETURN v_company_id;
END;
$$;

GRANT EXECUTE ON FUNCTION join_company_by_invite(text) TO authenticated;
