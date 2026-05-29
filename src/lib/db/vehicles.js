import { supabase } from '../supabase';

function toDb(v) {
  return {
    id:          v.id,
    user_id:     v.userId,
    company_id:  v.companyId || null,
    name:        v.name,
    make:        v.make        || null,
    model:       v.model       || null,
    year:        v.year        ? parseInt(v.year) : null,
    type:        v.type        || null,
    rego:        v.rego        || null,
    vin:         v.vin         || null,
    colour:      v.colour      || null,
    fuel_type:   v.fuelType    || null,
    odometer:    v.odometer    != null ? parseFloat(v.odometer) : null,
    status:      v.status      || 'Active',
    notes:       v.notes       || null,
    photos:      v.photos      || [],
    service_log: v.serviceLog  || [],
    updated_at:  new Date().toISOString(),
  };
}

function fromDb(r) {
  return {
    id:          r.id,
    userId:      r.user_id,
    companyId:   r.company_id,
    name:        r.name,
    make:        r.make,
    model:       r.model,
    year:        r.year,
    type:        r.type,
    rego:        r.rego,
    vin:         r.vin,
    colour:      r.colour,
    fuelType:    r.fuel_type,
    odometer:    r.odometer,
    status:      r.status || 'Active',
    notes:       r.notes,
    photos:      r.photos      || [],
    serviceLog:  r.service_log || [],
    createdAt:   r.created_at,
    updatedAt:   r.updated_at,
  };
}

export async function getVehicles() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: own }, { data: perms }] = await Promise.all([
    supabase.from('vehicles').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(500),
    supabase.from('asset_permissions').select('asset_id')
      .eq('user_id', user.id).eq('asset_type', 'vehicle'),
  ]);

  let provisioned = [];
  if (perms?.length) {
    const ids = perms.map(p => p.asset_id);
    const { data } = await supabase.from('vehicles').select('*').in('id', ids);
    provisioned = data || [];
  }

  const seen = new Set();
  return [...(own || []), ...provisioned]
    .filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; })
    .map(fromDb);
}

export async function upsertVehicle(vehicle) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const row = { ...toDb(vehicle), user_id: user.id };
  const isNew = !row.id;
  if (isNew) delete row.id;

  if (isNew) {
    // Insert: get back only the id to avoid large-row response issues
    const { data, error } = await supabase.from('vehicles').insert(row).select('id').single();
    if (error) throw error;
    return fromDb({ ...row, id: data.id, created_at: row.updated_at });
  } else {
    // Update: no round-trip select needed — reconstruct from what we sent
    const { error } = await supabase.from('vehicles').update(row).eq('id', row.id);
    if (error) throw error;
    return fromDb(row);
  }
}

export async function deleteVehicle(id) {
  const { error } = await supabase.from('vehicles').delete().eq('id', id);
  if (error) throw error;
}

// ── Permissions ──────────────────────────────────────────────────────────────

export async function getVehiclePermissions(vehicleId) {
  const { data, error } = await supabase
    .from('asset_permissions')
    .select('*')
    .eq('asset_type', 'vehicle')
    .eq('asset_id', vehicleId);
  if (error) throw error;
  return data || [];
}

export async function upsertVehiclePermission(vehicleId, userId, companyId, canEdit) {
  const { error } = await supabase.from('asset_permissions').upsert({
    asset_type: 'vehicle',
    asset_id:   vehicleId,
    user_id:    userId,
    company_id: companyId,
    can_edit:   canEdit,
  }, { onConflict: 'asset_type,asset_id,user_id' });
  if (error) throw error;
}

export async function revokeVehiclePermission(vehicleId, userId) {
  const { error } = await supabase.from('asset_permissions')
    .delete()
    .eq('asset_type', 'vehicle')
    .eq('asset_id', vehicleId)
    .eq('user_id', userId);
  if (error) throw error;
}
