import { supabase } from '../supabase';

export function getPref(profile, key, defaultValue) {
  const v = profile?.preferences?.[key];
  return v !== undefined && v !== null ? v : defaultValue;
}

export async function savePref(userId, key, value) {
  if (!userId) return;
  try {
    await supabase.rpc('upsert_preference', { p_user_id: userId, p_key: key, p_value: value });
  } catch (e) {
    console.warn('[savePref]', e);
  }
}

const LS_BOOL_KEYS = [
  'rat_tut', 'rat_tut_job_card', 'rat_tut_jobs', 'rat_tut_revenue',
  'rat_tut_search', 'rat_tut_clients', 'rat_form_tut', 'rat_wiki_seeded',
];
const LS_STRING_KEYS = ['tab', 'workshopTab', 'trackerSort', 'trackerView',
  'vehiclesSort', 'vehiclesView', 'toolsSort', 'toolsView',
  'equipmentSort', 'equipmentView',
];
const LS_NUMBER_KEYS = ['trackerCols', 'vehiclesCols', 'toolsCols', 'equipmentCols'];
const LS_JSON_KEYS   = ['dismissedAnns'];

export async function migrateLocalPreferences(userId, currentPrefs) {
  if (!userId) return;
  if (currentPrefs?._lsMigrated) return;

  const patch = {};
  for (const key of LS_BOOL_KEYS) {
    const v = localStorage.getItem(key);
    if (v !== null && currentPrefs?.[key] == null) patch[key] = v === '1' || v === 'true';
  }
  for (const key of LS_STRING_KEYS) {
    const v = localStorage.getItem(key);
    if (v !== null && currentPrefs?.[key] == null) patch[key] = v;
  }
  for (const key of LS_NUMBER_KEYS) {
    const v = localStorage.getItem(key);
    if (v !== null && currentPrefs?.[key] == null) { const n = Number(v); if (!isNaN(n)) patch[key] = n; }
  }
  for (const key of LS_JSON_KEYS) {
    const v = localStorage.getItem(key);
    if (v !== null && currentPrefs?.[key] == null) {
      try { patch[key] = JSON.parse(v); } catch { /* skip */ }
    }
  }

  patch._lsMigrated = true;

  if (Object.keys(patch).length > 0) {
    for (const [k, v] of Object.entries(patch)) {
      await savePref(userId, k, v);
    }
    const keysToRemove = [...LS_BOOL_KEYS, ...LS_STRING_KEYS, ...LS_NUMBER_KEYS, ...LS_JSON_KEYS];
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }
}
