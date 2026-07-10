-- Opt-in wiki contributor leaderboard. Off by default — a user's raw points
-- history stays private to them (see wiki_points.sql's RLS); this column is
-- the only thing that makes their total visible to anyone else, and only via
-- get_wiki_leaderboard() below, never a direct cross-user query.
--
-- IMPORTANT: org_and_profiles_rls.sql column-restricts UPDATE/SELECT on
-- `profiles` by re-issuing the *complete* allowed column list every time it
-- runs. This file repeats that full list plus wiki_leaderboard_opt_in rather
-- than only adding the new column — re-running this file must not revoke
-- access to columns another file already granted. If a future migration
-- adds another profiles column, do the same here: full list, not a diff.
-- Run in Supabase SQL Editor.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wiki_leaderboard_opt_in boolean NOT NULL DEFAULT false;

REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (
  display_name, username, units, default_status, tab_order, preferences,
  storage_policy_enabled, storage_tiers, wiki_leaderboard_opt_in
) ON profiles TO authenticated;

REVOKE SELECT ON profiles FROM authenticated;
GRANT SELECT (
  id, display_name, username, units, default_status, tab_order, preferences,
  storage_policy_enabled, storage_tiers, tier, company_id, created_at, wiki_leaderboard_opt_in
) ON profiles TO authenticated;

CREATE OR REPLACE FUNCTION get_wiki_leaderboard(p_limit int DEFAULT 20)
RETURNS TABLE (
  user_id      uuid,
  display_name text,
  username     text,
  points       bigint
)
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT l.user_id, p.display_name, p.username, SUM(l.points) AS points
  FROM wiki_points_ledger l
  JOIN profiles p ON p.id = l.user_id
  WHERE p.wiki_leaderboard_opt_in = true
  GROUP BY l.user_id, p.display_name, p.username
  HAVING SUM(l.points) > 0
  ORDER BY points DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION get_wiki_leaderboard(int) TO authenticated, anon;
