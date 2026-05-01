// Display-only unit conversion. All values stored internally as metric.
// Never store the result of these functions — only use them in display strings.

export const isImperial = (units) => units === "imperial";

export const fmtPressure = (kPa, units) =>
  isImperial(units) ? `${(kPa * 0.14504).toFixed(1)} PSI` : `${kPa} kPa`;

export const fmtSpeed = (ms, units) =>
  isImperial(units) ? `${(ms * 3.281).toFixed(1)} ft/s` : `${ms.toFixed(1)} m/s`;

export const fmtLength = (m, units) =>
  isImperial(units) ? `${(m * 3.281).toFixed(2)} ft` : `${m.toFixed(2)} m`;

export const fmtVolume = (L, units) =>
  isImperial(units) ? `${(L * 0.2642).toFixed(2)} US gal` : `${L} L`;

export const fmtSmallVolume = (mL, units) =>
  isImperial(units) ? `${(mL * 0.033814).toFixed(1)} fl oz` : `${mL} mL`;

export const fmtSpring = (Nmm, units) =>
  isImperial(units) ? `${(Nmm * 5.7102).toFixed(1)} lbf/in` : `${Nmm} N/mm`;

export const fmtForce = (tonnes, units) =>
  isImperial(units) ? `${(tonnes * 1.10231).toFixed(2)} short tons` : `${tonnes} t`;
