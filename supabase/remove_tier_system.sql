-- Removes the DB-level remnants of the old paid-tier system now that the
-- client no longer has any concept of a "free" vs "paid" tier — gates.js,
-- the AdminPanel tier picker/Grants tab, the Profile pending-upgrade
-- redemption flow, and the Stripe checkout/portal/webhook edge functions
-- were all deleted from the app. Two things here were still ACTIVELY
-- enforcing the old free-tier caps at the database layer even though the
-- client-side gate had already been bypassed — those are the important
-- part of this migration, since without them any new signup (whose
-- profiles.tier is NULL/'free' by default, since nothing sets it anymore)
-- would still get a real "Machine limit reached" or "Storage policy
-- requires enthusiast or higher tier" error.
--
-- Deliberately NOT touched here: the guest (anonymous-session) machine cap
-- (enforce_guest_machine_limit / trg_guest_machine_limit) — that's a
-- separate, still-wanted limitation, unrelated to the paid tier.
-- Also NOT touched: the profiles.tier / companies.tier columns themselves,
-- admin_deactivate_user (still used by the admin panel's Deactivate
-- button), and the announcements.tier_filter column — all now-vestigial
-- but harmless, and dropping columns other still-live code paths reference
-- is a needless, irreversible risk for no remaining functional benefit.
-- Run in Supabase SQL Editor.

-- ── Machine-limit tier gate (DB level) ──────────────────────────────────────
-- Was blocking any account whose tier resolves to 'free' at 5 machines.
DROP TRIGGER IF EXISTS trg_machine_limit ON machines;
DROP FUNCTION IF EXISTS enforce_machine_limit();

-- ── Storage-policy tier gate (DB level) ─────────────────────────────────────
-- Was rejecting storage_policy_enabled/storage_tiers writes for 'free' tier.
DROP TRIGGER IF EXISTS trg_storage_policy_tier ON profiles;
DROP FUNCTION IF EXISTS enforce_storage_policy_tier();

-- ── Orphaned tier-management RPCs ───────────────────────────────────────────
-- No UI anywhere calls any of these anymore (AdminPanel's tier picker and
-- Grants tab, and ProfileSettings' pending-upgrade redemption block, were
-- all removed from the client).
DROP FUNCTION IF EXISTS admin_set_tier(text, text);
DROP FUNCTION IF EXISTS grant_upgrade(text, text);
DROP FUNCTION IF EXISTS revoke_upgrade(text);
DROP FUNCTION IF EXISTS apply_pending_upgrade();
