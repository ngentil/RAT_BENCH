-- Towing Allocations: admin-only tables
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS depots (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  suburb     text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE depots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "depots_admin_only" ON depots
  FOR ALL USING (auth.email() = 'nathan.gentil.ai@gmail.com')
  WITH CHECK (auth.email() = 'nathan.gentil.ai@gmail.com');

CREATE TABLE IF NOT EXISTS tow_trucks (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate             text NOT NULL,
  depot_id          uuid REFERENCES depots(id) ON DELETE SET NULL,
  status            text NOT NULL DEFAULT 'available', -- available / on job / unavailable
  notes             text,
  assigned_event_id text,  -- Phase 2: eventId from VicRoads feed
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

ALTER TABLE tow_trucks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tow_trucks_admin_only" ON tow_trucks
  FOR ALL USING (auth.email() = 'nathan.gentil.ai@gmail.com')
  WITH CHECK (auth.email() = 'nathan.gentil.ai@gmail.com');

-- Grant table access to authenticated role (RLS handles restriction)
GRANT SELECT, INSERT, UPDATE, DELETE ON depots     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tow_trucks TO authenticated;
