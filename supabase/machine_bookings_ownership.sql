-- Machine bookings: enforce machine ownership on INSERT/UPDATE.
-- The previous policy only verified user_id = auth.uid() without confirming
-- the machine_id belongs to (or is provisioned for) the booking user,
-- allowing any user to attach a booking to any machine by UUID.
-- Run in Supabase SQL Editor.

ALTER TABLE machine_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS machine_bookings_own ON machine_bookings;

CREATE POLICY machine_bookings_own ON machine_bookings
  FOR ALL TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND (
      machine_id IN (SELECT id FROM machines WHERE user_id = auth.uid())
      OR machine_id IN (SELECT _provisioned_machine_ids(auth.uid()))
    )
  );
