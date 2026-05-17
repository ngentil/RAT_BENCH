import { supabase } from '../supabase';

// ── Depots ───────────────────────────────────────────────────────────────────

export async function getDepots() {
  const { data, error } = await supabase
    .from('depots')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function upsertDepot(depot) {
  const now = new Date().toISOString();
  const isNew = !depot.id;
  const { data, error } = await supabase
    .from('depots')
    .upsert(
      { ...depot, ...(isNew ? { created_at: now } : {}) },
      { onConflict: 'id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDepot(id) {
  const { error } = await supabase.from('depots').delete().eq('id', id);
  if (error) throw error;
}

// ── Tow Trucks ───────────────────────────────────────────────────────────────

export async function getTrucks() {
  const { data, error } = await supabase
    .from('tow_trucks')
    .select('*, depot:depots(id, name, suburb)')
    .order('plate');
  if (error) throw error;
  return data || [];
}

export async function upsertTruck(truck) {
  const now = new Date().toISOString();
  const isNew = !truck.id;
  const { depot, ...row } = truck; // strip joined relation before upsert
  const { data, error } = await supabase
    .from('tow_trucks')
    .upsert(
      { ...row, updated_at: now, ...(isNew ? { created_at: now } : {}) },
      { onConflict: 'id' }
    )
    .select('*, depot:depots(id, name, suburb)')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTruck(id) {
  const { error } = await supabase.from('tow_trucks').delete().eq('id', id);
  if (error) throw error;
}

// ── Allocation log ────────────────────────────────────────────────────────────

export async function logAllocations(features) {
  if (!features.length) return;
  const now = new Date().toISOString();
  const rows = features.map(f => {
    const p = f.properties || {};
    return {
      event_id:         String(p.eventId),
      road_name:        p.closedRoadName || null,
      suburb:           p.reference?.startIntersectionLocality || null,
      status:           p.status || null,
      description:      p.description || null,
      data:             f,
      event_created_at: p.created || null,
      last_seen:        now,
    };
  });
  const { error } = await supabase
    .from('tow_allocation_log')
    .upsert(rows, { onConflict: 'event_id', ignoreDuplicates: false });
  if (error) console.warn('logAllocations failed:', error.message);
}

export async function getRecentAllocations(hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('tow_allocation_log')
    .select('*')
    .gte('event_created_at', since)
    .order('event_created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(r => ({ ...r.data, _logMeta: { firstSeen: r.first_seen, lastSeen: r.last_seen } }));
}
