-- Consumables table migration
-- Run in Supabase SQL Editor after deploying this update.

CREATE TABLE IF NOT EXISTS consumables (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id   uuid REFERENCES companies(id) ON DELETE SET NULL,
  name         text NOT NULL,
  category     text NOT NULL,
  brand        text,
  quantity     numeric DEFAULT 0,
  unit         text DEFAULT 'L',
  min_quantity numeric,
  spec         jsonb DEFAULT '{}',
  notes        text,
  photos       jsonb DEFAULT '[]',
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE consumables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consumables_own" ON consumables FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "consumables_provisioned_select" ON consumables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_permissions.asset_type = 'consumable'
        AND asset_permissions.asset_id   = consumables.id
        AND asset_permissions.user_id    = auth.uid()
    )
  );

CREATE POLICY "consumables_provisioned_update" ON consumables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_permissions.asset_type = 'consumable'
        AND asset_permissions.asset_id   = consumables.id
        AND asset_permissions.user_id    = auth.uid()
        AND asset_permissions.can_edit   = true
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON consumables TO authenticated;
GRANT ALL ON consumables TO service_role;

CREATE INDEX IF NOT EXISTS idx_consumables_user ON consumables (user_id);
