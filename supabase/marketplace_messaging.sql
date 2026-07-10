-- Marketplace messaging: one thread per (listing, buyer) pair. A marketplace
-- conversation is inherently buyer<->seller, not a group chat, so this is
-- deliberately two fixed participants rather than a generic N-party model —
-- simpler, and it's what every real marketplace (eBay, Facebook Marketplace,
-- Gumtree) actually does.
--
-- Delivery is realtime via Supabase Realtime (same mechanism the app's
-- existing machines-sync live-update already uses) — the client subscribes
-- to INSERTs on marketplace_messages filtered by thread_id, no polling.
--
-- Requires supabase/marketplace_listings.sql.
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS marketplace_threads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  buyer_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, buyer_id)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_threads_buyer  ON marketplace_threads(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_threads_seller ON marketplace_threads(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_threads_listing ON marketplace_threads(listing_id);

ALTER TABLE marketplace_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_threads_select ON marketplace_threads;

CREATE POLICY marketplace_threads_select ON marketplace_threads
  FOR SELECT TO authenticated
  USING (buyer_id = (select auth.uid()) OR seller_id = (select auth.uid()));

GRANT SELECT ON marketplace_threads TO authenticated;
-- No direct INSERT grant — threads are only created via
-- get_or_create_marketplace_thread() below, so the buyer/seller pairing and
-- the "can't message your own listing" rule are enforced in one place and
-- can't be bypassed or raced into a duplicate thread.

CREATE TABLE IF NOT EXISTS marketplace_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id   uuid NOT NULL REFERENCES marketplace_threads(id) ON DELETE CASCADE,
  sender_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body        text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_messages_thread ON marketplace_messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_messages_sender ON marketplace_messages(sender_id);

ALTER TABLE marketplace_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_messages_select ON marketplace_messages;
DROP POLICY IF EXISTS marketplace_messages_insert ON marketplace_messages;
DROP POLICY IF EXISTS marketplace_messages_update ON marketplace_messages;

CREATE POLICY marketplace_messages_select ON marketplace_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_threads t
      WHERE t.id = thread_id
        AND (t.buyer_id = (select auth.uid()) OR t.seller_id = (select auth.uid()))
    )
  );

-- INSERT: any thread participant can post directly (no RPC needed — unlike
-- thread creation there's no dedup/pairing logic to protect here, same
-- "collaborative direct insert" pattern the wiki uses for revisions).
CREATE POLICY marketplace_messages_insert ON marketplace_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM marketplace_threads t
      WHERE t.id = thread_id
        AND (t.buyer_id = (select auth.uid()) OR t.seller_id = (select auth.uid()))
    )
  );

-- UPDATE: read receipts only. Column-restricted to read_at so a participant
-- can mark the OTHER person's messages read, but can never edit message
-- content (their own or anyone else's).
CREATE POLICY marketplace_messages_update ON marketplace_messages
  FOR UPDATE TO authenticated
  USING (
    sender_id != (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM marketplace_threads t
      WHERE t.id = thread_id
        AND (t.buyer_id = (select auth.uid()) OR t.seller_id = (select auth.uid()))
    )
  )
  WITH CHECK (
    sender_id != (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM marketplace_threads t
      WHERE t.id = thread_id
        AND (t.buyer_id = (select auth.uid()) OR t.seller_id = (select auth.uid()))
    )
  );

GRANT SELECT, INSERT ON marketplace_messages TO authenticated;
REVOKE UPDATE ON marketplace_messages FROM authenticated;
GRANT UPDATE (read_at) ON marketplace_messages TO authenticated;

-- ── get_or_create_marketplace_thread ─────────────────────────────────────────
-- Atomic get-or-create so a buyer can only ever have one thread per listing,
-- even under a double-click race — the unique index is the actual
-- enforcement, ON CONFLICT just makes the second caller a no-op read instead
-- of an error.
CREATE OR REPLACE FUNCTION get_or_create_marketplace_thread(p_listing_id uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing marketplace_listings%ROWTYPE;
  v_thread_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_listing FROM marketplace_listings WHERE id = p_listing_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;

  IF v_listing.seller_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot message your own listing';
  END IF;

  IF v_listing.status != 'active' THEN
    -- Existing threads on a since-sold/removed listing stay fully readable
    -- (SELECT policy doesn't care about listing status) — this only blocks
    -- starting a brand-new conversation on a dead listing.
    SELECT id INTO v_thread_id FROM marketplace_threads
    WHERE listing_id = p_listing_id AND buyer_id = auth.uid();
    IF v_thread_id IS NOT NULL THEN
      RETURN v_thread_id;
    END IF;
    RAISE EXCEPTION 'This listing is no longer active';
  END IF;

  INSERT INTO marketplace_threads (listing_id, buyer_id, seller_id)
  VALUES (p_listing_id, auth.uid(), v_listing.seller_id)
  ON CONFLICT (listing_id, buyer_id) DO NOTHING
  RETURNING id INTO v_thread_id;

  IF v_thread_id IS NULL THEN
    SELECT id INTO v_thread_id FROM marketplace_threads
    WHERE listing_id = p_listing_id AND buyer_id = auth.uid();
  END IF;

  RETURN v_thread_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_or_create_marketplace_thread(uuid) TO authenticated;

-- ── Unread count ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_my_marketplace_unread_count()
RETURNS bigint
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM marketplace_messages m
  JOIN marketplace_threads t ON t.id = m.thread_id
  WHERE (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    AND m.sender_id != auth.uid()
    AND m.read_at IS NULL;
$$;

GRANT EXECUTE ON FUNCTION get_my_marketplace_unread_count() TO authenticated;
