import { createContext, useContext } from 'react';
import { DEFAULT_FLAGS } from './db/featureFlags';

// App.jsx fetches the real values once (getFeatureFlags()) and provides
// them here — anything downstream that needs a launch flag reads it with
// useFeatureFlags() instead of prop-drilling through however many
// components sit between it and App.jsx. Defaults to DEFAULT_FLAGS so
// anything rendered before the fetch resolves (or in isolation, e.g.
// tests) still sees the correct launch-mode-on behavior rather than an
// undefined flag.
const FeatureFlagsContext = createContext(DEFAULT_FLAGS);

export const FeatureFlagsProvider = FeatureFlagsContext.Provider;

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}
