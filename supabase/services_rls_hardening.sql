-- Services RLS hardening (sweep 17 fixes)
-- 1. Tighten WITH CHECK so INSERT/UPDATE cannot attach a service to a machine
--    the user doesn't own or isn't provisioned on.
-- 2. Add provisioned UPDATE policy so team members with edit rights can log
--    service entries on machines they're assigned to.
-- Run in Supabase SQL Editor.

-- ── SECURITY DEFINER helper (prevents RLS recursion on self-referential check) ─

CREATE OR REPLACE FUNCTION _service_owner(p_id uuid)
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT user_id FROM services WHERE id = p_id;
$$;


-- ── services_own: add machine-ownership check to WITH CHECK ───────────────────

DROP POLICY IF EXISTS services_own ON services;

CREATE POLICY services_own ON services
  FOR ALL
  USING (
    user_id    = auth.uid()
    OR machine_id IN (SELECT id FROM machines WHERE user_id = auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid()
    AND (
      machine_id IN (SELECT id FROM machines WHERE user_id = auth.uid())
      OR machine_id IN (SELECT _provisioned_machine_ids(auth.uid()))
    )
  );


-- ── services_provisioned_update: edit rights for provisioned team members ─────

DROP POLICY IF EXISTS services_provisioned_update ON services;

CREATE POLICY services_provisioned_update ON services
  FOR UPDATE TO authenticated
  USING  (machine_id IN (SELECT _editable_provisioned_machine_ids(auth.uid())))
  WITH CHECK (
    machine_id IN (SELECT _editable_provisioned_machine_ids(auth.uid()))
    AND user_id = _service_owner(id)
  );
