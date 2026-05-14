-- Assets Migration: vehicles, equipment, tools, asset_permissions
-- Run this entire block in the Supabase SQL Editor.
-- Order matters: asset_permissions must exist before the RLS policies on
-- vehicles/equipment/tools can reference it.

-- ─────────────────────────────────────────────
-- 1. asset_permissions (create first)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_permissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type  text NOT NULL,   -- 'vehicle' | 'equipment' | 'tool'
  asset_id    uuid NOT NULL,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id  uuid NOT NULL,
  can_edit    boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (asset_type, asset_id, user_id)
);

ALTER TABLE asset_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "asset_permissions_org_read" ON asset_permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM company_members
      WHERE company_members.company_id = asset_permissions.company_id
        AND company_members.user_id    = auth.uid()
    )
  );

CREATE POLICY "asset_permissions_org_manage" ON asset_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM company_members
      WHERE company_members.company_id = asset_permissions.company_id
        AND company_members.user_id    = auth.uid()
        AND company_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_members
      WHERE company_members.company_id = asset_permissions.company_id
        AND company_members.user_id    = auth.uid()
        AND company_members.role IN ('owner', 'admin')
    )
  );

-- ─────────────────────────────────────────────
-- 2. vehicles
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id  uuid REFERENCES companies(id) ON DELETE SET NULL,
  name        text NOT NULL,
  make        text,
  model       text,
  year        int,
  type        text,
  rego        text,
  vin         text,
  colour      text,
  fuel_type   text,
  odometer    numeric,
  status      text DEFAULT 'Active',
  notes       text,
  photos      jsonb DEFAULT '[]',
  service_log jsonb DEFAULT '[]',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicles_own" ON vehicles FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "vehicles_provisioned_select" ON vehicles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_permissions.asset_type = 'vehicle'
        AND asset_permissions.asset_id   = vehicles.id
        AND asset_permissions.user_id    = auth.uid()
    )
  );

CREATE POLICY "vehicles_provisioned_update" ON vehicles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_permissions.asset_type = 'vehicle'
        AND asset_permissions.asset_id   = vehicles.id
        AND asset_permissions.user_id    = auth.uid()
        AND asset_permissions.can_edit   = true
    )
  );

-- ─────────────────────────────────────────────
-- 3. equipment
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS equipment (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id  uuid REFERENCES companies(id) ON DELETE SET NULL,
  name        text NOT NULL,
  make        text,
  model       text,
  year        int,
  type        text,
  serial_no   text,
  hours       numeric,
  location    text,
  status      text DEFAULT 'Active',
  notes       text,
  photos      jsonb DEFAULT '[]',
  service_log jsonb DEFAULT '[]',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "equipment_own" ON equipment FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "equipment_provisioned_select" ON equipment FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_permissions.asset_type = 'equipment'
        AND asset_permissions.asset_id   = equipment.id
        AND asset_permissions.user_id    = auth.uid()
    )
  );

CREATE POLICY "equipment_provisioned_update" ON equipment FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_permissions.asset_type = 'equipment'
        AND asset_permissions.asset_id   = equipment.id
        AND asset_permissions.user_id    = auth.uid()
        AND asset_permissions.can_edit   = true
    )
  );

-- ─────────────────────────────────────────────
-- 4. tools
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tools (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id       uuid REFERENCES companies(id) ON DELETE SET NULL,
  name             text NOT NULL,
  brand            text,
  model            text,
  category         text,
  condition        text DEFAULT 'Good',
  purchase_date    date,
  purchase_price   numeric DEFAULT 0,
  warranty_expiry  date,
  storage_location text,
  loaned_to        text,
  loaned_at        timestamptz,
  notes            text,
  photos           jsonb DEFAULT '[]',
  service_log      jsonb DEFAULT '[]',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tools_own" ON tools FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tools_provisioned_select" ON tools FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_permissions.asset_type = 'tool'
        AND asset_permissions.asset_id   = tools.id
        AND asset_permissions.user_id    = auth.uid()
    )
  );

CREATE POLICY "tools_provisioned_update" ON tools FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM asset_permissions
      WHERE asset_permissions.asset_type = 'tool'
        AND asset_permissions.asset_id   = tools.id
        AND asset_permissions.user_id    = auth.uid()
        AND asset_permissions.can_edit   = true
    )
  );
