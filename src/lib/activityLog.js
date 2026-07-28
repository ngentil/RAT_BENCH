import { supabase } from './supabase';

// Admin-only activity log — every create/update/delete across the app's
// main data tables plus Supabase Auth's own login/logout/signup events, all
// merged into one feed by supabase/activity_log.sql. admin_list_activity
// itself re-checks auth.email() server-side, so this is safe to call from
// any client; a non-admin caller just gets an error back.
export async function listActivity({ since, until, search = '', action = '', limit = 200, offset = 0 } = {}) {
  const { data, error } = await supabase.rpc('admin_list_activity', {
    p_since: since || null,
    p_until: until || null,
    p_search: search,
    p_action: action,
    p_limit: limit,
    p_offset: offset,
  });
  if (error) throw error;
  return data || [];
}

// Realtime — new activity_log rows as they're written, mirroring App.jsx's
// machines-sync channel. RLS on activity_log gates this the same way it
// gates a plain SELECT, so a non-admin's subscription just never receives
// anything even though the channel itself opens fine.
export function subscribeToActivity(onInsert) {
  const channel = supabase
    .channel('activity-log-live')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, (payload) => onInsert(payload.new))
    .subscribe();
  return () => supabase.removeChannel(channel);
}
