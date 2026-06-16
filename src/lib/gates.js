// Tier definitions
export const TIERS = {
  free:       { label: "Free",       price: null,       seats: 0,   machines: 10,       tools: 5,        vehicles: 1,        equipment: 5,        consumables: 5,        org: false, acl: false, support: false },
  enthusiast: { label: "Enthusiast", price: "$3.50/wk", seats: 0,   machines: Infinity, tools: Infinity, vehicles: Infinity, equipment: Infinity, consumables: Infinity, org: false, acl: false, support: false },
  business:   { label: "Business",   price: "$10/wk",   seats: 3,   machines: Infinity, tools: Infinity, vehicles: Infinity, equipment: Infinity, consumables: Infinity, org: true,  acl: true,  support: true  },
};

const TIER_RANK = { free: 0, enthusiast: 1, team: 1, business: 2 };

// Resolve the effective tier — returns whichever of profile or company is higher
export function effectiveTier(profile, company) {
  const p = profile?.tier || "free";
  const c = company?.tier || "free";
  return (TIER_RANK[p] ?? 0) >= (TIER_RANK[c] ?? 0) ? p : c;
}

// Feature gate check
export function canUse(feature, profile, company) {
  const tier = effectiveTier(profile, company);
  switch (feature) {
    case "unlimited_machines": return tier !== "free";
    case "org":                return tier === "business";
    case "acl":                return tier === "business";
    case "priority_support":   return tier === "business";
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
