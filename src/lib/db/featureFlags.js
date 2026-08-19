import { supabase } from '../supabase';

// Launch-mode toggles, DB-backed via the feature_flags table (see
// supabase/launch_flags_admin.sql) so they're flippable from the Admin
// Panel's Flags tab at runtime — no code change or redeploy needed. These
// defaults are the fallback if the table can't be read for any reason
// (offline, RLS misconfigured, row missing) — they match exactly what
// Rat Bench launches with, so a read failure never accidentally exposes a
// hidden feature that's supposed to be off, or an uncapped one that's
// supposed to have a limit.
//
// invoices_free/free_seats were removed here (see
// supabase/launch_flags_admin.sql) once the paywall UI/RPCs they gated
// were deleted outright rather than left dormant — Rat Bench is free with
// no plan to reintroduce per-seat or per-invoice billing; monetization is
// planned via marketplace ads/sponsored listings instead, a separate
// system with no flag of its own yet. member_cap (also
// supabase/launch_flags_admin.sql) came back separately, same day —
// deleting the paywall had deleted the member-limit concept along with
// it, which turned out not to be intended; this is a plain
// abuse-prevention cap, not tied to billing in any way.
export const DEFAULT_FLAGS = {
  wiki: false,          // Wiki tab hidden
  marketplace: false,   // Marketplace + Messages hidden
  memberCap: 10,         // null = uncapped
};

// community and member_cap drive their own special-cased computation below
// (master switch / numeric cap) rather than becoming a plain flags.<key>
// boolean — every other row in feature_flags does become flags.<key>
// automatically, straight off its own `enabled` column and whatever key an
// admin gave it (built-in or added later via "+ New Flag"). This is what
// lets a brand new feature's flag show up here with zero changes to this
// file — see CLAUDE.md's "adding a new feature" note for the one step that
// still can't be automatic (a component actually checking its own flag).
const SPECIAL_KEYS = ['community', 'member_cap'];

// Every consumer (App.jsx's context provider, main.jsx's pre-render check
// for the public wiki/marketplace routes, UsersTab's member-limit display)
// calls this the same way — a plain one-shot fetch, not a realtime
// subscription. An admin's toggle takes effect for a session on its next
// load, same as the rest of this app's session-scoped profile/company data.
//
// `community` is a pure master switch, folded into every other flag here
// rather than exposed as its own field — every consumer already just reads
// flags.<key> directly, so this is the one place "community off overrides
// everything else regardless of its own switch" needs to be known at all.
export async function getFeatureFlags() {
  const { data, error } = await supabase.from('feature_flags').select('key,enabled,value');
  if (error || !data) return DEFAULT_FLAGS;

  const byKey = Object.fromEntries(data.map(r => [r.key, r]));
  const communityOn = byKey.community?.enabled ?? true;
  const memberCapOn = byKey.member_cap?.enabled ?? true;

  const base = { ...DEFAULT_FLAGS };
  for (const row of data) {
    if (SPECIAL_KEYS.includes(row.key)) continue;
    base[row.key] = communityOn && row.enabled;
  }
  // null when the flag's off — matches _member_cap()'s SQL side, which then
  // skips the cap check in join_company_by_invite() entirely.
  base.memberCap = memberCapOn ? (byKey.member_cap?.value ?? DEFAULT_FLAGS.memberCap) : null;

  // Per-user beta overrides (supabase/user_feature_flags.sql) — an admin can
  // flip any flag on (or off) for a hand-picked tester even while the
  // global flag (and the community master switch) says otherwise, to trial
  // a feature before public launch. RLS self-scopes the read to the
  // caller's own rows, so this is safe to run unconditionally, including
  // for a logged-out visitor (no session = no rows = base flags stand
  // as-is).
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return base;

  const { data: overrides } = await supabase.from('user_feature_flags').select('flag_key,enabled').eq('user_id', session.user.id);
  if (!overrides?.length) return base;

  const result = { ...base };
  for (const r of overrides) result[r.flag_key] = r.enabled;
  return result;
}
