import { supabase } from '../supabase';

export async function getVehicleAssignments(vehicleId) {
  const { data } = await supabase
    .from('vehicle_assignments')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('assigned_at', { ascending: true });
  return data || [];
}

export async function assignAsset({ vehicleId, assetType, assetId, assetName, notes }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('vehicle_assignments')
    .insert({
      vehicle_id: vehicleId,
      asset_type: assetType,
      asset_id:   assetId,
      asset_name: assetName,
      user_id:    user.id,
      notes:      notes || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function unassignAsset(id) {
  const { error } = await supabase
    .from('vehicle_assignments')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
