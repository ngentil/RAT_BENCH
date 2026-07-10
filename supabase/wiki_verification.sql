-- Community verification of wiki corrections: any authenticated user (other
-- than the editor) can confirm or dispute a revision. 3 confirms pays the
-- editor a +2 bonus, exactly once per revision, enforced by
-- wiki_points_ledger's unique index. Disputes are tracked and surfaced (a
-- "disputed" marker on the revision) as a quality signal, but deliberately
-- carry no points penalty — someone flagging a correction they believe is
-- wrong is still trying to improve the wiki, not something to discipline.
-- Requires supabase/wiki_points.sql (wiki_points_ledger) and
-- supabase/wiki_revisions_rls_helper.sql (_wiki_entry_visible).
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS wiki_revision_verifications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id   uuid NOT NULL REFERENCES wiki_revisions(id) ON DELETE CASCADE,
  verifier_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote          text NOT NULL CHECK (vote IN ('confirm','dispute')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (revision_id, verifier_id)
);

CREATE INDEX IF NOT EXISTS idx_wiki_rev_verif_revision ON wiki_revision_verifications(revision_id);
CREATE INDEX IF NOT EXISTS idx_wiki_rev_verif_verifier ON wiki_revision_verifications(verifier_id);

ALTER TABLE wiki_revision_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wiki_rev_verif_select ON wiki_revision_verifications;

CREATE POLICY wiki_rev_verif_select ON wiki_revision_verifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wiki_revisions r
      WHERE r.id = revision_id AND _wiki_entry_visible(r.entry_id, (select auth.uid()))
    )
  );

GRANT SELECT ON wiki_revision_verifications TO authenticated, anon;
GRANT EXECUTE ON FUNCTION _wiki_entry_visible(uuid, uuid) TO anon; -- idempotent; already granted by wiki_revisions_anon_fix.sql
-- No direct INSERT grant — votes (and the payouts they trigger) only happen
-- through submit_wiki_verification(), so vote counts and points can't drift apart.

CREATE OR REPLACE FUNCTION submit_wiki_verification(p_revision_id uuid, p_vote text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rev      wiki_revisions%ROWTYPE;
  v_confirms int;
  v_disputes int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_vote NOT IN ('confirm','dispute') THEN
    RAISE EXCEPTION 'Invalid vote';
  END IF;

  SELECT * INTO v_rev FROM wiki_revisions WHERE id = p_revision_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Revision not found';
  END IF;

  IF v_rev.edited_by = auth.uid() THEN
    RAISE EXCEPTION 'Cannot verify your own revision';
  END IF;

  -- Verifier floor: must have earned at least one point of their own first.
  -- Blunts the obvious case of brand-new throwaway accounts rubber-stamping
  -- a friend's edit — doesn't need to be heavier than this up front.
  IF NOT EXISTS (SELECT 1 FROM wiki_points_ledger WHERE user_id = auth.uid() AND points > 0) THEN
    RAISE EXCEPTION 'Make at least one contribution before verifying others'' work';
  END IF;

  INSERT INTO wiki_revision_verifications (revision_id, verifier_id, vote)
  VALUES (p_revision_id, auth.uid(), p_vote)
  ON CONFLICT (revision_id, verifier_id) DO UPDATE SET vote = EXCLUDED.vote, created_at = now();

  SELECT COUNT(*) FILTER (WHERE vote = 'confirm') INTO v_confirms
  FROM wiki_revision_verifications WHERE revision_id = p_revision_id;
  SELECT COUNT(*) FILTER (WHERE vote = 'dispute') INTO v_disputes
  FROM wiki_revision_verifications WHERE revision_id = p_revision_id;

  IF v_confirms >= 3 AND v_rev.edited_by IS NOT NULL THEN
    INSERT INTO wiki_points_ledger (user_id, entry_id, ref_table, ref_id, action, points)
    VALUES (v_rev.edited_by, v_rev.entry_id, 'wiki_revisions', p_revision_id, 'verified_bonus', 2)
    ON CONFLICT (user_id, ref_table, ref_id, action) DO NOTHING;
  END IF;

  -- Disputes are tracked (v_disputes, returned below) and shown as a
  -- "disputed" marker in the UI, but deliberately never cost the editor
  -- points — no penalty side to this system.

  RETURN jsonb_build_object('confirms', v_confirms, 'disputes', v_disputes);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_wiki_verification(uuid, text) TO authenticated;
