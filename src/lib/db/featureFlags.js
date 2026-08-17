import { supabase } from '../supabase';

// Launch-mode toggles, DB-backed via the feature_flags table (see
// supabase/launch_flags_admin.sql) so they're flippable from the Admin
// Panel's Flags tab at runtime — no code change or redeploy needed. These
// defaults are the fallback if the table can't be read for any reason
// (offline, RLS misconfigured, row missing) — they match exactly what
// Rat Bench launches with, so a read failure never accidentally exposes a
// hidden feature that's supposed to be off.
//
// invoices_free/free_seats were removed here (see
// supabase/remove_paywall_system.sql) once the paywall UI/RPCs they gated
// were deleted outright rather than left dormant — Rat Bench is free with
// no plan to reintroduce per-seat or per-invoice billing; monetization is
// planned via marketplace ads/sponsored listings instead, a separate
// system with no flag of its own yet.
export const DEFAULT_FLAGS = {
  wiki: false,          // Wiki tab hidden
  marketplace: false,   // Marketplace + Messages hidden
};

const KEYS = ['community', 'wiki', 'marketplace'];

// Every consumer (App.jsx's context provider, main.jsx's pre-render check
// for the public wiki/marketplace routes) calls this the same way — a
// plain one-shot fetch, not a realtime subscription. An admin's toggle
// takes effect for a session on its next load, same as the rest of this
// app's session-scoped profile/company data.
//
// `community` is a pure master switch, folded into wiki/marketplace here
// rather than exposed as its own field — every consumer already just reads
// flags.wiki/flags.marketplace, so this is the one place "community off
// overrides both regardless of their own switch" needs to be known at all.
export async function getFeatureFlags() {
  const { data, error } = await supabase.from('feature_flags').select('key,enabled,value').in('key', KEYS);
  if (error || !data) return DEFAULT_FLAGS;

  const byKey = Object.fromEntries(data.map(r => [r.key, r]));
  const communityOn = byKey.community?.enabled ?? true;
  return {
    wiki: communityOn && (byKey.wiki?.enabled ?? DEFAULT_FLAGS.wiki),
    marketplace: communityOn && (byKey.marketplace?.enabled ?? DEFAULT_FLAGS.marketplace),
  };
}
