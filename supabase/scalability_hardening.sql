-- ============================================================
-- Scalability hardening migration
-- Apply in Supabase SQL Editor
-- ============================================================

-- ── 1. Machines RLS ──────────────────────────────────────────
-- SECURITY DEFINER helpers prevent infinite RLS recursion:
-- the provisioned-machines policies query machine_permissions,
-- which may itself have policies that reference machines.
-- Running the sub-selects as DB owner (SECURITY DEFINER) breaks the cycle.

CREATE OR REPLACE FUNCTION _provisioned_machine_ids(uid uuid)
RETURNS SETOF uuid
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT machine_id FROM machine_permissions WHERE user_id = uid;
$$;

CREATE OR REPLACE FUNCTION _editable_provisioned_machine_ids(uid uuid)
RETURNS SETOF uuid
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT machine_id FROM machine_permissions
  WHERE user_id = uid AND can_edit = true;
$$;

ALTER TABLE machines ENABLE ROW LEVEL SECURITY;

-- Drop & recreate so reruns are idempotent
DROP POLICY IF EXISTS machines_own                ON machines;
DROP POLICY IF EXISTS machines_provisioned_select ON machines;
DROP POLICY IF EXISTS machines_provisioned_update ON machines;

-- Own machines: full access
CREATE POLICY machines_own ON machines
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Provisioned machines: select only (uses SECURITY DEFINER helper)
CREATE POLICY machines_provisioned_select ON machines
  FOR SELECT
  USING (id IN (SELECT _provisioned_machine_ids(auth.uid())));

-- Provisioned machines with edit rights: update allowed
CREATE POLICY machines_provisioned_update ON machines
  FOR UPDATE
  USING (id IN (SELECT _editable_provisioned_machine_ids(auth.uid())));


-- ── 2. Critical indexes ───────────────────────────────────────
-- Supabase adds a PK index automatically, but these composite/
-- single-column indexes cover the WHERE clauses used most often.

CREATE INDEX IF NOT EXISTS idx_machines_user_id       ON machines(user_id);
CREATE INDEX IF NOT EXISTS idx_machines_company_id    ON machines(company_id);
CREATE INDEX IF NOT EXISTS idx_services_machine_id    ON services(machine_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id       ON machine_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_collected_at  ON machine_bookings(collected_at);
CREATE INDEX IF NOT EXISTS idx_mperms_user_id         ON machine_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_mperms_machine_id      ON machine_permissions(machine_id);
CREATE INDEX IF NOT EXISTS idx_aperms_user_type       ON asset_permissions(user_id, asset_type);
CREATE INDEX IF NOT EXISTS idx_clients_user_id        ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id      ON inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_consumables_user_id    ON consumables(user_id);


-- ── 3. Machine limit enforcement (DB level) ───────────────────
-- Enforces the free-tier 10-machine cap at the database layer so
-- client-side gates.js cannot be bypassed via direct API calls.

CREATE OR REPLACE FUNCTION enforce_machine_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_tier   text;
  v_count  int;
BEGIN
  SELECT COALESCE(tier, 'free') INTO v_tier
  FROM profiles WHERE id = NEW.user_id;

  IF v_tier = 'free' THEN
    SELECT COUNT(*) INTO v_count
    FROM machines WHERE user_id = NEW.user_id;

    IF v_count >= 10 THEN
      RAISE EXCEPTION 'Machine limit reached: free tier allows up to 10 machines.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_machine_limit ON machines;
CREATE TRIGGER trg_machine_limit
  BEFORE INSERT ON machines
  FOR EACH ROW EXECUTE FUNCTION enforce_machine_limit();


-- ── 4. Anonymous guest machine cap (max 3) ────────────────────
-- Guest sessions use is_anonymous = true; cap them at 3 to prevent
-- throwaway-account spam filling the machines table.

CREATE OR REPLACE FUNCTION enforce_guest_machine_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_is_anon boolean;
  v_count   int;
BEGIN
  SELECT (raw_user_meta_data->>'is_anonymous')::boolean INTO v_is_anon
  FROM auth.users WHERE id = NEW.user_id;

  IF v_is_anon IS TRUE THEN
    SELECT COUNT(*) INTO v_count
    FROM machines WHERE user_id = NEW.user_id;

    IF v_count >= 3 THEN
      RAISE EXCEPTION 'Guest machine limit reached (max 3). Create a free account to add more.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_guest_machine_limit ON machines;
CREATE TRIGGER trg_guest_machine_limit
  BEFORE INSERT ON machines
  FOR EACH ROW EXECUTE FUNCTION enforce_guest_machine_limit();
