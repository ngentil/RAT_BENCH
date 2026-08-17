import { createContext, useContext } from 'react';
import { DEFAULT_FLAGS } from './db/featureFlags';

// App.jsx fetches the real values once (getFeatureFlags()) and provides
// them here — everything downstream that needs a launch flag (BillingSection,
// UsersTab, etc.) reads it with useFeatureFlags() instead of prop-drilling
// through Settings/CompanySettings/UsersTab's whole chain. Defaults to
// DEFAULT_FLAGS so anything rendered before the fetch resolves (or in
// isolation, e.g. tests) still sees the correct launch-mode-on behavior
// rather than an undefined flag.
const FeatureFlagsContext = createContext(DEFAULT_FLAGS);

export const FeatureFlagsProvider = FeatureFlagsContext.Provider;

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}
