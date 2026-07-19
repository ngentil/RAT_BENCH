-- Admin-only RPCs: list users, set tier, deactivate user.
-- All three check auth.email() server-side — cannot be bypassed client-side.
-- Run in Supabase SQL Editor.

-- ─── admin_list_users ────────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS admin_list_users(text, int, int);

CREATE OR REPLACE FUNCTION admin_list_users(
  p_search text DEFAULT '',
  p_limit  int  DEFAULT 50,
  p_offset int  DEFAULT 0
)
RETURNS TABLE (
  id              uuid,
  email           text,
  display_name    text,
  username        text,
  tier            text,
  created_at      timestamptz,
  last_sign_in_at timestamptz,
  machine_count   bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF auth.email() NOT IN ('nathan.gentil.ai@gmail.com', 'nathan.gentil@gmail.com') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    p.display_name,
    p.username,
    COALESCE(p.tier, 'free') AS tier,
    u.created_at,
    u.last_sign_in_at,
    COUNT(m.id) AS machine_count
  FROM auth.users u
  LEFT JOIN profiles p ON p.id = u.id
  LEFT JOIN machines m ON m.user_id = u.id
  WHERE (
    p_search = '' OR
    u.email       ILIKE '%' || p_search || '%' OR
    p.username    ILIKE '%' || p_search || '%' OR
    p.display_name ILIKE '%' || p_search || '%'
  )
  GROUP BY u.id, u.email, p.display_name, p.username, p.tier, u.created_at, u.last_sign_in_at
  ORDER BY u.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- ─── admin_set_tier ──────────────────────────────────────────────────────────
-- REMOVED — see supabase/remove_tier_system.sql. No paid tier left to set;
-- AdminPanel's tier picker was deleted. Do not re-run this section.

DROP FUNCTION IF EXISTS admin_set_tier(text, text);

CREATE OR REPLACE FUNCTION admin_set_tier(p_email text, p_tier text)
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

  IF p_tier NOT IN ('free', 'enthusiast', 'team', 'business') THEN
    RETURN jsonb_build_object('error', 'Invalid tier — must be free/enthusiast/team/business');
  END IF;

  SELECT id INTO v_uid FROM auth.users WHERE email = p_email LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'User not found');
  END IF;

  UPDATE profiles SET tier = p_tier WHERE id = v_uid;

  INSERT INTO admin_audit_log (action, target_email, detail)
  VALUES ('set_tier', p_email, 'Tier set to ' || p_tier);

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- ─── admin_deactivate_user ───────────────────────────────────────────────────

DROP FUNCTION IF EXISTS admin_deactivate_user(text);

CREATE OR REPLACE FUNCTION admin_deactivate_user(p_email text)
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

  SELECT id INTO v_uid FROM auth.users WHERE email = p_email LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'User not found');
  END IF;

  UPDATE profiles
  SET tier                   = 'free',
      stripe_subscription_id = NULL
  WHERE id = v_uid;

  INSERT INTO admin_audit_log (action, target_email, detail)
  VALUES ('deactivate', p_email, 'Reset to free tier');

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION admin_list_users(text, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_set_tier(text, text)       TO authenticated;
GRANT EXECUTE ON FUNCTION admin_deactivate_user(text)      TO authenticated;
