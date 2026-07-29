import { supabase } from '../supabase';

export async function getActiveCollection(machineId) {
  // order+limit instead of maybeSingle: duplicate open collections
  // (pre-unique-constraint data) must return the newest one, not an error
  // masked as null.
  const { data, error } = await supabase
    .from('machine_collections')
    .select('*')
    .eq('machine_id', machineId)
    .is('returned_at', null)
    .order('collected_at', { ascending: false })
    .limit(1);
  if (error) { console.error('getActiveCollection:', error); return null; }
  return data?.[0] || null;
}

export async function getAllActiveCollections() {
  const { data, error } = await supabase
    .from('machine_collections')
    .select('*')
    .is('returned_at', null)
    .limit(500);
  if (error) console.error('getAllActiveCollections:', error);
  return data || [];
}

export async function createCollection({ machineId, customerName, customerPhone, customerUnknown }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('machine_collections')
    .insert({
      machine_id: machineId,
      user_id: user.id,
      customer_name: customerUnknown ? null : (customerName || null),
      customer_phone: customerUnknown ? null : (customerPhone || null),
      customer_unknown: !!customerUnknown,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function returnMachine(collectionId) {
  const { data, error } = await supabase
    .from('machine_collections')
    .update({ returned_at: new Date().toISOString() })
    .eq('id', collectionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
