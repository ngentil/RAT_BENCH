-- Extended admin_get_stats RPC
-- Run in Supabase SQL Editor to replace the existing function.

DROP FUNCTION IF EXISTS admin_get_stats();

CREATE OR REPLACE FUNCTION admin_get_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT jsonb_build_object(
    -- Core counts
    'total_users',      (SELECT COUNT(*) FROM profiles),
    'new_this_week',    (SELECT COUNT(*) FROM profiles WHERE created_at >= now() - interval '7 days'),
    'new_this_month',   (SELECT COUNT(*) FROM profiles WHERE created_at >= now() - interval '30 days'),
    'active_last_7d',   (SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at >= now() - interval '7 days'),
    'active_last_30d',  (SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at >= now() - interval '30 days'),
    'total_machines',   (SELECT COUNT(*) FROM machines),

    -- Grants
    'grants_pending',   (SELECT COUNT(*) FROM upgrade_grants WHERE redeemed_at IS NULL AND expires_at > now()),
    'grants_redeemed',  (SELECT COUNT(*) FROM upgrade_grants WHERE redeemed_at IS NOT NULL),

    -- Users by tier
    'by_tier', (
      SELECT COALESCE(jsonb_object_agg(tier, cnt), '{}'::jsonb)
      FROM (
        SELECT COALESCE(tier, 'free') AS tier, COUNT(*) AS cnt
        FROM profiles
        GROUP BY 1
      ) x
    ),

    -- Machines by type
    'machines_by_type', (
      SELECT COALESCE(jsonb_object_agg(mtype, cnt), '{}'::jsonb)
      FROM (
        SELECT COALESCE(type, 'unknown') AS mtype, COUNT(*) AS cnt
        FROM machines
        GROUP BY 1
        ORDER BY cnt DESC
      ) x
    ),

    -- Signups per day — last 14 days (for sparkline trend)
    'signups_by_day', (
      SELECT COALESCE(
        jsonb_agg(jsonb_build_object('date', day::text, 'count', cnt) ORDER BY day),
        '[]'::jsonb
      )
      FROM (
        SELECT date_trunc('day', created_at AT TIME ZONE 'UTC')::date AS day, COUNT(*) AS cnt
        FROM profiles
        WHERE created_at >= now() - interval '14 days'
        GROUP BY 1
      ) x
    )
  )
$$;
