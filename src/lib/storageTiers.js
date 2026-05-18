export const DEFAULT_STORAGE_TIERS = {
  Bench:          { label: "Bench",       freeDays: 30, dailyRate: 1,  escalateDays: 90, minFee: 5   },
  Small:          { label: "Small",       freeDays: 21, dailyRate: 3,  escalateDays: 60, minFee: 15  },
  Medium:         { label: "Medium",      freeDays: 14, dailyRate: 5,  escalateDays: 45, minFee: 25  },
  Large:          { label: "Large",       freeDays: 10, dailyRate: 10, escalateDays: 30, minFee: 50  },
  "Extra Large":  { label: "Extra Large", freeDays: 7,  dailyRate: 20, escalateDays: 21, minFee: 100 },
  Custom:         { label: "Custom",      freeDays: null, dailyRate: null, escalateDays: null, minFee: null },
};

export const TIER_NAMES = Object.keys(DEFAULT_STORAGE_TIERS);

// Merge user-saved overrides (profiles.storage_tiers) over defaults
export function getTiers(customTiers) {
  if (!customTiers) return DEFAULT_STORAGE_TIERS;
  const merged = {};
  for (const name of TIER_NAMES) {
    merged[name] = { ...DEFAULT_STORAGE_TIERS[name], ...(customTiers[name] || {}) };
  }
  return merged;
}

// Backward-compat alias
export const STORAGE_TIERS = DEFAULT_STORAGE_TIERS;
