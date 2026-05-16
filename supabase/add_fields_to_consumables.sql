-- Add pricing, supplier, and part identification fields to consumables
-- This makes consumables feature-equivalent with inventory_items (parts).
-- Run in Supabase SQL Editor.

ALTER TABLE consumables
  ADD COLUMN IF NOT EXISTS buy_price   numeric,
  ADD COLUMN IF NOT EXISTS sell_price  numeric,
  ADD COLUMN IF NOT EXISTS supplier    text,
  ADD COLUMN IF NOT EXISTS part_number text,
  ADD COLUMN IF NOT EXISTS location    text;
