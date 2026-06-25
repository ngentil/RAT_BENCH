-- Fix: drop the old `json` overload of rpc_create_company that causes
-- "Could not choose the best candidate function" error.
-- The canonical version uses `jsonb` (defined in company_rpcs.sql).
-- Run this once in the Supabase SQL Editor.

DROP FUNCTION IF EXISTS public.rpc_create_company(payload json);
