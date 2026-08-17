import { supabase } from '../supabase';

// Launch-mode toggles, DB-backed via the feature_flags table (see
// supabase/launch_flags_admin.sql) so they're flippable from the Admin
// Panel's Flags tab at runtime — no code change or redeploy needed. These
// defaults are the fallback if the table can't be read for any reason
// (offline, RLS misconfigured, row missing) — they match exactly what
// Rat Bench launches with, so a read failure never accidentally exposes a
// paywall or hidden feature that's supposed to be off/free.
export const DEFAULT_FLAGS = {
  wiki: false,          // Wiki tab hidden
  marketplace: false,   // Marketplace + Messages hidden
  invoicesFree: true,   // invoices free & uncapped
  freeSeatCap: 10,       // free team seats beyond the owner, no purchase needed
};

const KEYS = ['community', 'wiki', 'marketplace', 'invoices_free', 'free_seats'];

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
  const freeSeatsOn = byKey.free_seats?.enabled ?? true;
  return {
    wiki: communityOn && (byKey.wiki?.enabled ?? DEFAULT_FLAGS.wiki),
    marketplace: communityOn && (byKey.marketplace?.enabled ?? DEFAULT_FLAGS.marketplace),
    invoicesFree: byKey.invoices_free?.enabled ?? DEFAULT_FLAGS.invoicesFree,
    // 0 when the flag's off — matches _free_seat_cap()'s SQL side, which
    // then makes GREATEST(paid_seats, 0) a no-op and restores the original
    // paid-only seat model exactly.
    freeSeatCap: freeSeatsOn ? (byKey.free_seats?.value ?? DEFAULT_FLAGS.freeSeatCap) : 0,
  };
}
