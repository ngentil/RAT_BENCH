-- Upgrade grant RPCs: grant_upgrade, revoke_upgrade, apply_pending_upgrade
-- grant_upgrade and revoke_upgrade are admin-only.
-- apply_pending_upgrade is called by the user from ProfileSettings.
--
-- REMOVED — see supabase/remove_tier_system.sql. The paid-tier system (and
-- every UI path that called these three functions) was deleted; do not
-- re-run this file, it would recreate them as orphaned dead code. Kept only
-- as a historical record of what the grant/redeem flow used to do.
--
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS upgrade_grants (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text        NOT NULL,
  code        text        NOT NULL UNIQUE,
  tier        text        NOT NULL,
  expires_at  timestamptz NOT NULL,
  redeemed_at timestamptz,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pending_code            text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pending_tier            text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pending_code_expires_at timestamptz;

-- ─── grant_upgrade ───────────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS grant_upgrade(text, text);

CREATE OR REPLACE FUNCTION grant_upgrade(p_email text, p_tier text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid  uuid;
  v_code text;
  v_exp  timestamptz := now() + interval '48 hours';
BEGIN
  IF auth.email() NOT IN ('nathan.gentil.ai@gmail.com', 'nathan.gentil@gmail.com') THEN
    RETURN jsonb_build_object('error', 'Access denied');
  END IF;

  v_code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  INSERT INTO upgrade_grants (email, code, tier, expires_at)
  VALUES (p_email, v_code, p_tier, v_exp);

  SELECT id INTO v_uid FROM auth.users WHERE email = p_email LIMIT 1;
  IF v_uid IS NOT NULL THEN
    UPDATE profiles
    SET pending_code            = v_code,
        pending_tier            = p_tier,
        pending_code_expires_at = v_exp
    WHERE id = v_uid;
  END IF;

  INSERT INTO admin_audit_log (action, target_email, detail)
  VALUES ('grant', p_email, 'Issued ' || p_tier || ' upgrade code ' || v_code);

  RETURN jsonb_build_object('ok', true, 'code', v_code);
END;
$$;

-- ─── revoke_upgrade ──────────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS revoke_upgrade(text);

CREATE OR REPLACE FUNCTION revoke_upgrade(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
BEGIN
  IF auth.email() NOT IN ('nathan.gentil.ai@gmail.com', 'nathan.gentil@gmail.com') THEN
    RETURN jsonb_build_object('error', 'Access denied');
  END IF;

  UPDATE upgrade_grants
  SET expires_at = now() - interval '1 second'
  WHERE email = p_email AND redeemed_at IS NULL;

  SELECT id INTO v_uid FROM auth.users WHERE email = p_email LIMIT 1;
  IF v_uid IS NOT NULL THEN
    UPDATE profiles
    SET pending_code            = NULL,
        pending_tier            = NULL,
        pending_code_expires_at = NULL
    WHERE id = v_uid;
  END IF;

  INSERT INTO admin_audit_log (action, target_email, detail)
  VALUES ('revoke', p_email, 'Pending upgrade revoked');

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- ─── apply_pending_upgrade ───────────────────────────────────────────────────

DROP FUNCTION IF EXISTS apply_pending_upgrade();

CREATE OR REPLACE FUNCTION apply_pending_upgrade()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid      uuid       := auth.uid();
  v_code     text;
  v_tier     text;
  v_exp      timestamptz;
  v_grant_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  SELECT pending_code, pending_tier, pending_code_expires_at
  INTO   v_code, v_tier, v_exp
  FROM   profiles
  WHERE  id = v_uid
  FOR UPDATE;

  IF v_code IS NULL OR v_tier IS NULL THEN
    RETURN jsonb_build_object('error', 'No pending upgrade');
  END IF;

  IF v_exp IS NULL OR v_exp < now() THEN
    RETURN jsonb_build_object('error', 'Upgrade code has expired');
  END IF;

  -- Atomically claim the grant — prevents two concurrent callers both seeing
  -- redeemed_at IS NULL and both succeeding.
  UPDATE upgrade_grants
  SET redeemed_at = now()
  WHERE code        = v_code
    AND tier        = v_tier
    AND redeemed_at IS NULL
    AND expires_at  > now()
  RETURNING id INTO v_grant_id;

  IF v_grant_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Code is no longer valid');
  END IF;

  UPDATE profiles
  SET tier                    = v_tier,
      pending_code            = NULL,
      pending_tier            = NULL,
      pending_code_expires_at = NULL
  WHERE id = v_uid;

  INSERT INTO admin_audit_log (action, target_email, detail)
  SELECT 'apply_upgrade', u.email, 'Code ' || v_code || ' applied → ' || v_tier
  FROM   auth.users u
  WHERE  u.id = v_uid;

  RETURN jsonb_build_object('ok', true, 'tier', v_tier);
END;
$$;

GRANT EXECUTE ON FUNCTION grant_upgrade(text, text)     TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_upgrade(text)          TO authenticated;
GRANT EXECUTE ON FUNCTION apply_pending_upgrade()       TO authenticated;
