-- ============================================================
-- Consolidated security fixes — July 2026 bug sweep
-- Run once in Supabase Dashboard → SQL Editor. Safe to re-run.
-- ============================================================

-- ── 1. company_members: protect the owner row, force cleanup through RPCs ────
-- cm_manage (FOR ALL) let admins demote/delete the owner row, and cm_leave let
-- members DELETE directly, skipping rpc_leave_company's cleanup (profile
-- company_id reset, permission revocation). All writes now go through the
-- SECURITY DEFINER RPCs (rpc_remove_member / rpc_leave_company / rpc_create_company).

DROP POLICY IF EXISTS cm_manage        ON company_members;
DROP POLICY IF EXISTS cm_manage_insert ON company_members;
DROP POLICY IF EXISTS cm_manage_update ON company_members;
DROP POLICY IF EXISTS cm_manage_delete ON company_members;
DROP POLICY IF EXISTS cm_leave         ON company_members;

CREATE POLICY cm_manage_insert ON company_members
  FOR INSERT TO authenticated
  WITH CHECK (_is_company_admin(company_id, auth.uid()) AND role != 'owner');

CREATE POLICY cm_manage_update ON company_members
  FOR UPDATE TO authenticated
  USING      (_is_company_admin(company_id, auth.uid()) AND role != 'owner')
  WITH CHECK (_is_company_admin(company_id, auth.uid()) AND role != 'owner');

-- No DELETE policy: removal/leaving must go through rpc_remove_member /
-- rpc_leave_company so ghost permissions and stale profile.company_id
-- can't be left behind.

-- Drift cleanup (found in prod, never in the repo): legacy permissive policies
-- that OR-override the hardening above. members_insert let any authenticated
-- user insert themselves into ANY company as ANY role (incl. owner);
-- members_delete let a member DELETE their own row directly, bypassing
-- rpc_leave_company's cleanup — the exact hole cm_leave was removed to close.
-- All membership writes go through SECURITY DEFINER RPCs, so none of these are
-- needed.
DROP POLICY IF EXISTS members_insert ON company_members;
DROP POLICY IF EXISTS members_delete ON company_members;
DROP POLICY IF EXISTS members_select ON company_members;

-- ── 2. Provisioned-machine helpers: scope company grants to live membership ──
-- Permissions granted through a company stop applying the moment the user
-- leaves (or is removed from) that company, even if the permission row was
-- never cleaned up.

CREATE OR REPLACE FUNCTION _provisioned_machine_ids(uid uuid)
RETURNS SETOF uuid
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT mp.machine_id FROM machine_permissions mp
  WHERE mp.user_id = uid
    AND (mp.company_id IS NULL OR EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = mp.company_id AND cm.user_id = uid
    ));
$$;

CREATE OR REPLACE FUNCTION _editable_provisioned_machine_ids(uid uuid)
RETURNS SETOF uuid
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT mp.machine_id FROM machine_permissions mp
  WHERE mp.user_id = uid AND mp.can_edit = true
    AND (mp.company_id IS NULL OR EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = mp.company_id AND cm.user_id = uid
    ));
$$;

-- ── 3. machine_permissions: grantee must be a member of the granting company ─

CREATE OR REPLACE FUNCTION _check_machine_perm_grantee()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.company_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = NEW.company_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Grantee is not a member of this company';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS machine_perm_grantee_check ON machine_permissions;
CREATE TRIGGER machine_perm_grantee_check
  BEFORE INSERT OR UPDATE ON machine_permissions
  FOR EACH ROW EXECUTE FUNCTION _check_machine_perm_grantee();

-- ── 4. machine_bookings: one active booking per machine ──────────────────────
-- Close older duplicates first (keep the newest open booking per machine),
-- then enforce with a partial unique index.

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY machine_id ORDER BY received_at DESC) AS rn
  FROM machine_bookings WHERE collected_at IS NULL
)
UPDATE machine_bookings SET collected_at = now()
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

CREATE UNIQUE INDEX IF NOT EXISTS machine_bookings_one_active
  ON machine_bookings (machine_id) WHERE collected_at IS NULL;

-- ── 5. update_wiki_rev_pointer: NULL created_by bypass ───────────────────────
-- On orphaned entries (author deleted → created_by NULL), `created_by != auth.uid()`
-- evaluates NULL and the permission check silently passed for everyone.

CREATE OR REPLACE FUNCTION update_wiki_rev_pointer(p_entry_id uuid, p_rev_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_entry wiki_entries%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_entry FROM wiki_entries WHERE id = p_entry_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Entry not found';
  END IF;

  IF v_entry.is_sample THEN
    RETURN;
  END IF;

  IF p_rev_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM wiki_revisions WHERE id = p_rev_id AND entry_id = p_entry_id
  ) THEN
    RAISE EXCEPTION 'Revision not found for this entry';
  END IF;

  -- IS DISTINCT FROM: NULL created_by (orphaned entry) must NOT grant access
  IF v_entry.created_by IS DISTINCT FROM auth.uid()
  AND NOT EXISTS (SELECT 1 FROM wiki_revisions WHERE entry_id = p_entry_id AND edited_by = auth.uid())
  THEN
    RAISE EXCEPTION 'Forbidden — must be entry author or contributor to advance pointer';
  END IF;

  IF p_rev_id IS NOT NULL THEN
    IF v_entry.created_by IS DISTINCT FROM auth.uid()
    AND NOT EXISTS (SELECT 1 FROM wiki_revisions WHERE id = p_rev_id AND edited_by = auth.uid())
    THEN
      RAISE EXCEPTION 'Forbidden — must be the target revision author or entry author';
    END IF;
  END IF;

  IF v_entry.current_rev_id IS DISTINCT FROM p_rev_id THEN
    UPDATE wiki_entries
    SET current_rev_id = p_rev_id
    WHERE id = p_entry_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION update_wiki_rev_pointer(uuid, uuid) TO authenticated;

-- ── 6. grant_upgrade: validate tier strings ──────────────────────────────────
-- REMOVED — see supabase/remove_tier_system.sql. grant_upgrade has no
-- remaining caller (the AdminPanel Grants tab was deleted); re-running this
-- section would recreate an orphaned function.

CREATE OR REPLACE FUNCTION grant_upgrade(p_email text, p_tier text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid  uuid;
  v_code text;
  v_exp  timestamptz := now() + interval '48 hours';
BEGIN
  IF auth.email() NOT IN ('nathan.gentil.ai@gmail.com', 'nathan.gentil@gmail.com') THEN
    RETURN jsonb_build_object('error', 'Access denied');
  END IF;

  IF p_tier NOT IN ('enthusiast', 'team', 'business') THEN
    RETURN jsonb_build_object('error', 'Invalid tier — must be enthusiast, team, or business');
  END IF;

  v_code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  INSERT INTO upgrade_grants (email, code, tier, expires_at)
  VALUES (p_email, v_code, p_tier, v_exp);

  SELECT id INTO v_uid FROM auth.users WHERE email = p_email LIMIT 1;
  IF v_uid IS NOT NULL THEN
    UPDATE profiles
    SET pending_code            = v_code,
        pending_tier            = p_tier,
        pending_code_expires_at = v_exp
    WHERE id = v_uid;
  END IF;

  INSERT INTO admin_audit_log (action, target_email, detail)
  VALUES ('grant', p_email, 'Issued ' || p_tier || ' upgrade code ' || v_code);

  RETURN jsonb_build_object('ok', true, 'code', v_code);
END;
$$;

-- ── 7. admin_delete_user: self-delete guard + upgrade_grants cleanup ─────────

CREATE OR REPLACE FUNCTION admin_delete_user(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email text;
BEGIN
  IF auth.email() NOT IN ('nathan.gentil.ai@gmail.com', 'nathan.gentil@gmail.com') THEN
    RETURN jsonb_build_object('error', 'Access denied');
  END IF;

  IF p_user_id = auth.uid() THEN
    RETURN jsonb_build_object('error', 'Refusing to delete the calling admin account');
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'User not found');
  END IF;

  UPDATE companies SET tier = 'free', stripe_subscription_id = NULL
  WHERE id IN (
    SELECT company_id FROM company_members
    WHERE user_id = p_user_id AND role = 'owner'
  )
  AND NOT EXISTS (
    SELECT 1 FROM company_members cm2
    WHERE cm2.company_id = companies.id
      AND cm2.user_id   != p_user_id
      AND cm2.role = 'owner'
  );

  DELETE FROM company_members    WHERE user_id = p_user_id;
  DELETE FROM machine_permissions WHERE user_id = p_user_id;
  DELETE FROM asset_permissions   WHERE user_id = p_user_id;

  DELETE FROM services         WHERE machine_id IN (SELECT id FROM machines WHERE user_id = p_user_id);
  DELETE FROM machine_bookings WHERE machine_id IN (SELECT id FROM machines WHERE user_id = p_user_id);

  DELETE FROM machines        WHERE user_id = p_user_id;
  DELETE FROM clients         WHERE user_id = p_user_id;
  DELETE FROM inventory_items WHERE user_id = p_user_id;
  DELETE FROM vehicles        WHERE user_id = p_user_id;
  DELETE FROM equipment       WHERE user_id = p_user_id;
  DELETE FROM tools           WHERE user_id = p_user_id;
  DELETE FROM consumables     WHERE user_id = p_user_id;

  UPDATE wiki_entries       SET created_by = NULL WHERE created_by = p_user_id;
  UPDATE wiki_revisions     SET edited_by  = NULL WHERE edited_by  = p_user_id;
  UPDATE wiki_contributions SET user_id    = NULL WHERE user_id    = p_user_id;

  DELETE FROM asset_assignments WHERE user_id = p_user_id;
  DELETE FROM upgrade_grants    WHERE email = v_email;

  DELETE FROM profiles   WHERE id = p_user_id;
  DELETE FROM auth.users WHERE id = p_user_id;

  INSERT INTO admin_audit_log (action, target_email, detail)
  VALUES ('delete_user', COALESCE(v_email, 'guest:' || p_user_id::text), 'permanently deleted');

  RETURN jsonb_build_object('ok', true);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION admin_delete_user(uuid) TO authenticated;

-- ── 8. rpc_delete_company: clean machine_permissions too ─────────────────────

CREATE OR REPLACE FUNCTION rpc_delete_company(p_company_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = p_company_id AND user_id = v_uid AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Only the company owner can delete the company';
  END IF;

  UPDATE profiles SET company_id = NULL WHERE company_id = p_company_id;

  DELETE FROM asset_permissions   WHERE company_id = p_company_id;
  DELETE FROM machine_permissions WHERE company_id = p_company_id;
  DELETE FROM company_members     WHERE company_id = p_company_id;

  DELETE FROM companies WHERE id = p_company_id;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_delete_company(uuid) TO authenticated;

-- ── 9. rpc_update_company: allow clearing fields ─────────────────────────────
-- COALESCE(payload->>'x', x) treated an empty string as a real value AND made
-- clearing a field to NULL impossible. Present-key semantics: a key present in
-- the payload replaces the column ('' clears it); an absent key leaves it alone.

CREATE OR REPLACE FUNCTION rpc_update_company(p_company_id uuid, payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = p_company_id AND user_id = v_uid AND role IN ('owner', 'admin')
  ) THEN
    RAISE EXCEPTION 'Only an owner or admin can update company details';
  END IF;

  UPDATE companies SET
    name         = CASE WHEN payload ? 'name' THEN COALESCE(NULLIF(payload->>'name', ''), name) ELSE name END,
    trading_name = CASE WHEN payload ? 'trading_name' THEN NULLIF(payload->>'trading_name', '') ELSE trading_name END,
    abn          = CASE WHEN payload ? 'abn'          THEN NULLIF(payload->>'abn', '')          ELSE abn          END,
    phone        = CASE WHEN payload ? 'phone'        THEN NULLIF(payload->>'phone', '')        ELSE phone        END,
    email        = CASE WHEN payload ? 'email'        THEN NULLIF(payload->>'email', '')        ELSE email        END,
    website      = CASE WHEN payload ? 'website'      THEN NULLIF(payload->>'website', '')      ELSE website      END,
    address      = CASE WHEN payload ? 'address'      THEN NULLIF(payload->>'address', '')      ELSE address      END,
    city         = CASE WHEN payload ? 'city'         THEN NULLIF(payload->>'city', '')         ELSE city         END,
    state        = CASE WHEN payload ? 'state'        THEN NULLIF(payload->>'state', '')        ELSE state        END,
    postcode     = CASE WHEN payload ? 'postcode'     THEN NULLIF(payload->>'postcode', '')     ELSE postcode     END,
    country      = CASE WHEN payload ? 'country'      THEN NULLIF(payload->>'country', '')      ELSE country      END,
    industry     = CASE WHEN payload ? 'industry'     THEN NULLIF(payload->>'industry', '')     ELSE industry     END,
    logo         = CASE WHEN payload ? 'logo'         THEN NULLIF(payload->>'logo', '')         ELSE logo         END,
    hourly_rate  = CASE WHEN payload ? 'hourly_rate'  THEN NULLIF(payload->>'hourly_rate', '')::numeric ELSE hourly_rate END,
    tax_rate     = CASE WHEN payload ? 'tax_rate'     THEN NULLIF(payload->>'tax_rate', '')::numeric    ELSE tax_rate    END,
    tax_label    = CASE WHEN payload ? 'tax_label'    THEN NULLIF(payload->>'tax_label', '')    ELSE tax_label    END,
    invite_code  = CASE WHEN payload ? 'invite_code'  THEN COALESCE(NULLIF(payload->>'invite_code', ''), invite_code) ELSE invite_code END
  WHERE id = p_company_id;

  RETURN (SELECT to_jsonb(c) FROM companies c WHERE c.id = p_company_id);
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_update_company(uuid, jsonb) TO authenticated;
