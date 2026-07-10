-- Community points for the wiki: an append-only ledger, not a mutable counter
-- on the profile. A user's total is SUM(points) — which matters the moment a
-- "verified" correction turns out to be wrong and needs to be clawed back
-- without touching a shared column other actions also write to.
--
-- Every row is written by a SECURITY DEFINER RPC below, never directly by a
-- client — a client can read their own history but can never insert an
-- arbitrary point value for themselves. The unique index is the idempotency
-- backstop: the same (user, ref row, action) can only ever be paid once.
--
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS wiki_points_ledger (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id    uuid REFERENCES wiki_entries(id) ON DELETE SET NULL,
  ref_table   text NOT NULL,
  ref_id      uuid NOT NULL,
  action      text NOT NULL,
  points      int  NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wiki_points_user ON wiki_points_ledger(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_wiki_points_award
  ON wiki_points_ledger(user_id, ref_table, ref_id, action);

ALTER TABLE wiki_points_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wiki_points_ledger_select ON wiki_points_ledger;

-- Users see only their own history (raw per-action rows are more granular
-- than most people want public); admins can see everything for moderation.
-- Cross-user aggregates for the leaderboard go through get_wiki_leaderboard()
-- instead, which is the only place opt-in visibility is enforced.
CREATE POLICY wiki_points_ledger_select ON wiki_points_ledger
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin_user());

GRANT SELECT ON wiki_points_ledger TO authenticated;
-- Deliberately no INSERT/UPDATE/DELETE grant to authenticated.

-- ── Rate limit ───────────────────────────────────────────────────────────────
-- Caps how many scoring actions count per user per day. Actions beyond the
-- cap still save (the underlying entry/revision/photo/vote always succeeds)
-- — they just stop paying out, so there's no reward for a grind session.
CREATE OR REPLACE FUNCTION _wiki_points_rate_limited(p_uid uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT COUNT(*) >= 5
  FROM wiki_points_ledger
  WHERE user_id = p_uid
    AND points > 0
    AND created_at >= date_trunc('day', now());
$$;

-- ── Award: pushing a new machine to the wiki ─────────────────────────────────
CREATE OR REPLACE FUNCTION award_wiki_push_points(p_entry_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_entry wiki_entries%ROWTYPE;
  v_id    uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'not authenticated');
  END IF;

  SELECT * INTO v_entry FROM wiki_entries WHERE id = p_entry_id;
  IF NOT FOUND OR v_entry.created_by IS DISTINCT FROM auth.uid() THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'not the entry author');
  END IF;

  IF _wiki_points_rate_limited(auth.uid()) THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'daily limit reached');
  END IF;

  INSERT INTO wiki_points_ledger (user_id, entry_id, ref_table, ref_id, action, points)
  VALUES (auth.uid(), p_entry_id, 'wiki_entries', p_entry_id, 'push', 1)
  ON CONFLICT (user_id, ref_table, ref_id, action) DO NOTHING
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'already awarded');
  END IF;

  RETURN jsonb_build_object('awarded', true, 'points', 1);
END;
$$;

GRANT EXECUTE ON FUNCTION award_wiki_push_points(uuid) TO authenticated;

-- ── Award: correcting specs on an existing entry ─────────────────────────────
CREATE OR REPLACE FUNCTION award_wiki_edit_points(p_revision_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_rev wiki_revisions%ROWTYPE;
  v_id  uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'not authenticated');
  END IF;

  SELECT * INTO v_rev FROM wiki_revisions WHERE id = p_revision_id;
  IF NOT FOUND OR v_rev.edited_by IS DISTINCT FROM auth.uid() THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'not the revision author');
  END IF;

  IF _wiki_points_rate_limited(auth.uid()) THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'daily limit reached');
  END IF;

  INSERT INTO wiki_points_ledger (user_id, entry_id, ref_table, ref_id, action, points)
  VALUES (auth.uid(), v_rev.entry_id, 'wiki_revisions', p_revision_id, 'edit', 1)
  ON CONFLICT (user_id, ref_table, ref_id, action) DO NOTHING
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'already awarded');
  END IF;

  RETURN jsonb_build_object('awarded', true, 'points', 1);
END;
$$;

GRANT EXECUTE ON FUNCTION award_wiki_edit_points(uuid) TO authenticated;

-- ── My total ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_my_wiki_points()
RETURNS bigint
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT COALESCE(SUM(points), 0) FROM wiki_points_ledger WHERE user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION get_my_wiki_points() TO authenticated;
