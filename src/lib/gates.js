// Tier definitions
export const TIERS = {
  free:        { label: "Free",        price: null,        machines: 10,       tools: 5,        vehicles: 5,        equipment: 5,        consumables: 10,       org: false, acl: false, support: false },
  enthusiast:  { label: "Enthusiast",  price: "$3.50/wk",  machines: Infinity, tools: Infinity, vehicles: Infinity, equipment: Infinity, consumables: Infinity, org: false, acl: false, support: false },
  team:        { label: "Pro",         price: "$10/wk",    machines: Infinity, tools: Infinity, vehicles: Infinity, equipment: Infinity, consumables: Infinity, org: true,  acl: true,  support: true  },
  business:    { label: "Pro",         price: "$10/wk",    machines: Infinity, tools: Infinity, vehicles: Infinity, equipment: Infinity, consumables: Infinity, org: true,  acl: true,  support: true  },
};

const TIER_RANK = { free: 0, enthusiast: 1, team: 2, business: 2 };

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
    case "org":                return ["team","business"].includes(tier);
    case "acl":                return ["team","business"].includes(tier);
    case "priority_support":   return ["team","business"].includes(tier);
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
  const limit = machineLimit(profile, company);
  return machineCount >= limit;
}

// Asset limit for tools / vehicles / equipment
export function assetLimit(assetType, profile, company) {
  const tier = effectiveTier(profile, company);
  return TIERS[tier]?.[assetType] ?? 5;
}

export function atAssetLimit(assetType, count, profile, company) {
  return count >= assetLimit(assetType, profile, company);
}
