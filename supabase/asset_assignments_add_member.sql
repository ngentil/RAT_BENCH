-- Fix: add 'member' as a valid child_type so crew assignments to vehicles work.
-- The original CHECK constraint omitted 'member', causing every assign-member-to-vehicle
-- call to fail with a constraint violation.
-- Run in Supabase SQL Editor.

ALTER TABLE asset_assignments
  DROP CONSTRAINT IF EXISTS asset_assignments_child_type_check,
  ADD CONSTRAINT asset_assignments_child_type_check
    CHECK (child_type IN ('vehicle', 'tool', 'equipment', 'consumable', 'member', 'part'));

-- Also expand parent_type to include all asset types for future flexibility
ALTER TABLE asset_assignments
  DROP CONSTRAINT IF EXISTS asset_assignments_parent_type_check,
  ADD CONSTRAINT asset_assignments_parent_type_check
    CHECK (parent_type IN ('vehicle', 'tool', 'equipment', 'consumable', 'member', 'part'));
