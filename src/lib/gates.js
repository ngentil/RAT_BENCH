// Tier definitions
export const TIERS = {
  free:        { label: "Free",        price: null,      machines: 50,       org: false, acl: false, support: false },
  enthusiast:  { label: "Enthusiast",  price: "$4.99/mo",machines: Infinity, org: false, acl: false, support: false },
  team:        { label: "Team",        price: "$29/mo",  machines: Infinity, org: true,  acl: true,  support: false },
  business:    { label: "Business",    price: "$99/mo",  machines: Infinity, org: true,  acl: true,  support: true  },
};

const TIER_RANK = { free: 0, enthusiast: 1, team: 2, business: 3 };

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
    case "priority_support":   return tier === "business";
    default:                   return true;
  }
}

// Machine limit for the current tier
export function machineLimit(profile, company) {
  const tier = effectiveTier(profile, company);
  return TIERS[tier]?.machines ?? 50;
}

// Whether the user has hit their machine limit
export function atMachineLimit(machineCount, profile, company) {
  const limit = machineLimit(profile, company);
  return machineCount >= limit;
}
