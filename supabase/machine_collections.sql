-- "Collected" tracking: a machine picked up by (or handed to) a customer
-- straight out of Storage. Mirrors machine_bookings' open/closed pattern
-- (received_at/collected_at there -> collected_at/returned_at here) so a
-- machine can cycle through Collected the same way it cycles through
-- Storage — this is deliberately not a one-way trip, matching the rest of
-- the Garage/Bench/Storage model.
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS machine_collections (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id        uuid NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collected_at      timestamptz NOT NULL DEFAULT now(),
  customer_name     text,
  customer_phone    text,
  customer_unknown  boolean NOT NULL DEFAULT false,
  returned_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE machine_collections ENABLE ROW LEVEL SECURITY;

-- Ownership enforced on INSERT/UPDATE from day one (machine_bookings only
-- got this after a follow-up fix — writing it correctly here instead of
-- repeating that history): user_id must be the caller AND the machine
-- must actually belong to (or be provisioned for) that caller, so a
-- collection can't be attached to an arbitrary machine_id by guessing a UUID.
DROP POLICY IF EXISTS machine_collections_own ON machine_collections;
CREATE POLICY machine_collections_own ON machine_collections
  FOR ALL TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND (
      machine_id IN (SELECT id FROM machines WHERE user_id = auth.uid())
      OR machine_id IN (SELECT _provisioned_machine_ids(auth.uid()))
    )
  );

-- Company-provisioned users can also read collections for machines they
-- can see (same helper machine_bookings_provisioned.sql already relies on).
DROP POLICY IF EXISTS machine_collections_provisioned_select ON machine_collections;
CREATE POLICY machine_collections_provisioned_select ON machine_collections
  FOR SELECT TO authenticated
  USING (machine_id IN (SELECT _provisioned_machine_ids(auth.uid())));

-- Partial index for fast active-collection lookups, same pattern as
-- idx_bookings_machine_open.
CREATE INDEX IF NOT EXISTS idx_collections_machine_open
  ON machine_collections (machine_id)
  WHERE returned_at IS NULL;
