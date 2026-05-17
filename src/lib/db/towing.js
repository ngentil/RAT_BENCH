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
