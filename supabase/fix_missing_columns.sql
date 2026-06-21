-- Fix missing columns on tools and consumables tables
-- Run this once in the Supabase SQL Editor.
-- All statements use IF NOT EXISTS so it is safe to run multiple times.

-- ── tools ────────────────────────────────────────────────────────────────────
ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS brand            text,
  ADD COLUMN IF NOT EXISTS model            text,
  ADD COLUMN IF NOT EXISTS category         text,
  ADD COLUMN IF NOT EXISTS condition        text DEFAULT 'Good',
  ADD COLUMN IF NOT EXISTS purchase_date    date,
  ADD COLUMN IF NOT EXISTS purchase_price   numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS warranty_expiry  date,
  ADD COLUMN IF NOT EXISTS storage_location text,
  ADD COLUMN IF NOT EXISTS loaned_to        text,
  ADD COLUMN IF NOT EXISTS loaned_at        timestamptz,
  ADD COLUMN IF NOT EXISTS notes            text,
  ADD COLUMN IF NOT EXISTS service_log      jsonb DEFAULT '[]';

-- ── consumables ──────────────────────────────────────────────────────────────
ALTER TABLE consumables
  ADD COLUMN IF NOT EXISTS buy_price   numeric,
  ADD COLUMN IF NOT EXISTS sell_price  numeric,
  ADD COLUMN IF NOT EXISTS supplier    text,
  ADD COLUMN IF NOT EXISTS part_number text,
  ADD COLUMN IF NOT EXISTS location    text,
  ADD COLUMN IF NOT EXISTS max_quantity numeric;

-- Reload PostgREST schema cache so the new columns are immediately visible
NOTIFY pgrst, 'reload schema';
