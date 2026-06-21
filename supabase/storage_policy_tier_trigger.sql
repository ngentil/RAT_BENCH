-- Enforce server-side tier check before allowing writes to storage policy columns.
-- storage_policy_enabled and storage_tiers are in the column-level GRANT UPDATE
-- on profiles, so any authenticated user could call supabase.from('profiles')
-- .update({storage_policy_enabled: true}) directly to bypass the free-tier gate.
-- This trigger rejects the update at the DB level if the user's current tier is free.
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION enforce_storage_policy_tier()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    NEW.storage_policy_enabled IS DISTINCT FROM OLD.storage_policy_enabled
    OR NEW.storage_tiers IS DISTINCT FROM OLD.storage_tiers
  )
  AND COALESCE(OLD.tier, 'free') = 'free' THEN
    RAISE EXCEPTION 'Storage policy requires enthusiast or higher tier';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_storage_policy_tier ON profiles;
CREATE TRIGGER trg_storage_policy_tier
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION enforce_storage_policy_tier();
