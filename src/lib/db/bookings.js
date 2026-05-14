import { supabase } from '../supabase';

export async function getActiveBooking(machineId) {
  const { data } = await supabase
    .from('machine_bookings')
    .select('*')
    .eq('machine_id', machineId)
    .is('collected_at', null)
    .maybeSingle();
  return data || null;
}

export async function getAllActiveBookings() {
  const { data } = await supabase
    .from('machine_bookings')
    .select('*')
    .is('collected_at', null);
  return data || [];
}

export async function getBookingHistory(machineId) {
  const { data } = await supabase
    .from('machine_bookings')
    .select('*')
    .eq('machine_id', machineId)
    .order('received_at', { ascending: false });
  return data || [];
}

export async function createBooking({ machineId, storageTier, receivedAt, storageEnabled, storageFeeOverride, notes }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('machine_bookings')
    .insert({
      machine_id: machineId,
      user_id: user.id,
      storage_tier: storageTier || 'Bench',
      received_at: receivedAt || new Date().toISOString(),
      storage_enabled: storageEnabled !== false,
      storage_fee_override: storageFeeOverride || null,
      notes: notes || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function collectMachine(bookingId) {
  const { data, error } = await supabase
    .from('machine_bookings')
    .update({ collected_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBooking(id, patch) {
  const { data, error } = await supabase
    .from('machine_bookings')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
