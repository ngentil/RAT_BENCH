// Tier definitions
export const TIERS = {
  free:        { label: "Free",        price: null,      machines: 50,       org: false, acl: false, support: false },
  enthusiast:  { label: "Enthusiast",  price: "$4.99/mo",machines: Infinity, org: false, acl: false, support: false },
  team:        { label: "Team",        price: "$29/mo",  machines: Infinity, org: true,  acl: true,  support: false },
  business:    { label: "Business",    price: "$99/mo",  machines: Infinity, org: true,  acl: true,  support: true  },
};

// Resolve the effective tier for a user — company tier takes precedence
export function effectiveTier(profile, company) {
  return company?.tier || profile?.tier || "free";
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
