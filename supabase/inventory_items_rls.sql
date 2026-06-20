-- RLS for inventory_items (parts / workshop stock)
-- inventory_items was created without RLS — any authenticated user could read all rows.
-- Run in Supabase SQL Editor.

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inventory_own ON inventory_items;

-- Full access for the owner (user_id is set on insert/update in inventory.js)
CREATE POLICY inventory_own ON inventory_items
  FOR ALL TO authenticated
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON inventory_items TO authenticated;
GRANT ALL ON inventory_items TO service_role;
