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
