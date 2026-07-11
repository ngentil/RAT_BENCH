import { supabase } from './supabase';

// Live count of browsers currently using Rat Bench (any tab of the main app,
// or the public wiki), via a single shared Supabase Realtime Presence
// channel — a genuine concurrent-viewer count, not a synthetic one. Each
// subscriber tracks itself under a fresh random key (no persisted identity —
// just "a tab is here right now"); onCount fires with the distinct-key count
// on every join/leave. Returns an unsubscribe.
export function subscribeSitePresence(onCount) {
  const channel = supabase.channel('site-online', {
    config: { presence: { key: crypto.randomUUID() } },
  });
  channel
    .on('presence', { event: 'sync' }, () => {
      onCount(Object.keys(channel.presenceState()).length);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await channel.track({ online_at: new Date().toISOString() });
    });
  return () => supabase.removeChannel(channel);
}
