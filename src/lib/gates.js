// Tier definitions
//
// One paid tier covers everything — it used to be split Enthusiast ($3.50/wk,
// solo features) vs Business ($10/wk, + team/org features), but the split
// never really served a pricing purpose here: the payment itself exists to
// keep community features (wiki publishing, marketplace, etc.) from being
// spammed by disposable accounts, and to give paying members a sense of
// actually belonging to something — not to upsell power users. So paying
// once unlocks everything, including team/org features.
//
// "business"/"team" are kept below as legacy synonyms for the same single
// paid tier — existing subscribers on those old values keep everything they
// already had, nothing is migrated or downgraded. Going forward, checkout
// only ever issues "enthusiast".
export const TIERS = {
  free:       { label: "Free",   price: null,       seats: 0, machines: 5,       tools: 5,        vehicles: 1,        equipment: 5,        consumables: 5,        org: false, acl: false, support: false },
  enthusiast: { label: "Member", price: "$3.50/wk", seats: 3, machines: Infinity, tools: Infinity, vehicles: Infinity, equipment: Infinity, consumables: Infinity, org: true,  acl: true,  support: true  },
  business:   { label: "Member", price: "$3.50/wk", seats: 3, machines: Infinity, tools: Infinity, vehicles: Infinity, equipment: Infinity, consumables: Infinity, org: true,  acl: true,  support: true  },
};
TIERS.team = TIERS.business;

const TIER_RANK = { free: 0, enthusiast: 1, team: 1, business: 1 };

// Resolve the effective tier — returns whichever of profile or company is higher
export function effectiveTier(profile, company) {
  const p = profile?.tier || "free";
  const c = company?.tier || "free";
  return (TIER_RANK[p] ?? 0) >= (TIER_RANK[c] ?? 0) ? p : c;
}

// Feature gate check — any paid tier (whichever legacy value it's stored as)
// unlocks every gated feature; there's nothing left that's paid-tier-specific.
export function canUse(feature, profile, company) {
  const tier = effectiveTier(profile, company);
  switch (feature) {
    case "unlimited_machines": return tier !== "free";
    case "org":                return tier !== "free";
    case "acl":                return tier !== "free";
    case "priority_support":   return tier !== "free";
    case "storage_policy":     return tier !== "free";
    default:                   return true;
  }
}

// Machine limit for the current tier
export function machineLimit(profile, company) {
  const tier = effectiveTier(profile, company);
  return TIERS[tier]?.machines ?? 10;
}

// Whether the user has hit their machine limit
export function atMachineLimit(machineCount, profile, company) {
  return machineCount >= machineLimit(profile, company);
}

// Asset limit for tools / vehicles / equipment / consumables
export function assetLimit(assetType, profile, company) {
  const tier = effectiveTier(profile, company);
  return TIERS[tier]?.[assetType] ?? 5;
}

export function atAssetLimit(assetType, count, profile, company) {
  return count >= assetLimit(assetType, profile, company);
}

// Seat limit for business tier (included seats; extra seats are add-ons)
export function seatLimit(profile, company) {
  const tier = effectiveTier(profile, company);
  return TIERS[tier]?.seats ?? 0;
}
