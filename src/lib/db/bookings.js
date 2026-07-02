import { supabase } from '../supabase';

export async function getActiveBooking(machineId) {
  // order+limit instead of maybeSingle: duplicate open bookings (pre-unique-
  // constraint data) must return the newest one, not an error masked as null.
  const { data, error } = await supabase
    .from('machine_bookings')
    .select('*')
    .eq('machine_id', machineId)
    .is('collected_at', null)
    .order('received_at', { ascending: false })
    .limit(1);
  if (error) { console.error('getActiveBooking:', error); return null; }
  return data?.[0] || null;
}

export async function getAllActiveBookings() {
  const { data, error } = await supabase
    .from('machine_bookings')
    .select('*')
    .is('collected_at', null)
    .limit(500);
  if (error) console.error('getAllActiveBookings:', error);
  return data || [];
}

export async function getClosedBookings() {
  const { data, error } = await supabase
    .from('machine_bookings')
    .select('*')
    .not('collected_at', 'is', null)
    .order('collected_at', { ascending: false })
    .limit(500);
  if (error) console.error('getClosedBookings:', error);
  return data || [];
}

export async function getBookingHistory(machineId) {
  const { data, error } = await supabase
    .from('machine_bookings')
    .select('*')
    .eq('machine_id', machineId)
    .order('received_at', { ascending: false })
    .limit(200);
  if (error) console.error('getBookingHistory:', error);
  return data || [];
}

export async function createBooking({ machineId, storageTier, receivedAt, storageEnabled, storageFeeOverride, notes }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const existing = await getActiveBooking(machineId);
  if (existing) throw new Error('This machine already has an active booking');
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
