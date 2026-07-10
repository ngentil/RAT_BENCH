-- Marketplace: sell a Tracker machine to other users.
--
-- Listings snapshot the machine's data at listing time (make/model/type/
-- year/photos) rather than live-referencing it — same reasoning as the
-- wiki's publish flow: a listing must survive the underlying machine being
-- edited or deleted from the seller's Tracker. machine_id is kept as an
-- optional pointer back (ON DELETE SET NULL) purely for "list again" /
-- provenance, never read for display.
--
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS marketplace_listings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  machine_id  uuid REFERENCES machines(id) ON DELETE SET NULL,
  title       text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  description text CHECK (description IS NULL OR char_length(description) <= 4000),
  price       numeric CHECK (price IS NULL OR price >= 0),
  make        text,
  model       text,
  type        text,
  year        text,
  photos      jsonb NOT NULL DEFAULT '[]',
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold','removed')),
  location    text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status, created_at DESC);

ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_listings_select ON marketplace_listings;
DROP POLICY IF EXISTS marketplace_listings_insert ON marketplace_listings;
DROP POLICY IF EXISTS marketplace_listings_update ON marketplace_listings;
DROP POLICY IF EXISTS marketplace_listings_delete ON marketplace_listings;

-- SELECT: active listings are public (browsable by anon, like the wiki) —
-- a seller can also always see their own regardless of status.
CREATE POLICY marketplace_listings_select ON marketplace_listings
  FOR SELECT
  USING (status = 'active' OR seller_id = (select auth.uid()));

-- INSERT: any authenticated user, only attributing the listing to themselves.
CREATE POLICY marketplace_listings_insert ON marketplace_listings
  FOR INSERT TO authenticated
  WITH CHECK (seller_id = (select auth.uid()));

-- UPDATE: only the seller (price/description/status/photos edits, marking sold).
CREATE POLICY marketplace_listings_update ON marketplace_listings
  FOR UPDATE TO authenticated
  USING (seller_id = (select auth.uid()))
  WITH CHECK (seller_id = (select auth.uid()));

-- DELETE: seller can remove their own listing outright. The app UI prefers
-- status='removed' (a soft delete) so message threads tied to it keep their
-- history for both parties — hard delete is offered for the seller's own
-- data-ownership rights, matching wiki_author_delete.sql's precedent, not as
-- the primary UI action.
CREATE POLICY marketplace_listings_delete ON marketplace_listings
  FOR DELETE TO authenticated
  USING (seller_id = (select auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listings TO authenticated;
GRANT SELECT ON marketplace_listings TO anon;
