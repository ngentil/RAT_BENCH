-- Machine Provisioning ACL
-- Allows machine owners to share machines with other users (Team+ feature)

CREATE TABLE IF NOT EXISTS machine_permissions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  can_edit   boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(machine_id, user_id)
);

ALTER TABLE machine_permissions ENABLE ROW LEVEL SECURITY;

-- Provisioned user can see their own permissions; machine owner can see all for their machines
CREATE POLICY "machine_perms_select" ON machine_permissions
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM machines WHERE id = machine_id AND user_id = auth.uid())
  );

-- Only machine owner can grant / modify / revoke
CREATE POLICY "machine_perms_insert" ON machine_permissions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM machines WHERE id = machine_id AND user_id = auth.uid())
  );

CREATE POLICY "machine_perms_update" ON machine_permissions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM machines WHERE id = machine_id AND user_id = auth.uid())
  );

CREATE POLICY "machine_perms_delete" ON machine_permissions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM machines WHERE id = machine_id AND user_id = auth.uid())
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON machine_permissions TO authenticated;
