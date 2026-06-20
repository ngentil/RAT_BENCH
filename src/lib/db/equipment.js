import { supabase } from '../supabase';
import { unassignAllByChild, syncAssignmentChildName } from './assetAssignments';

function toDb(e) {
  return {
    id:          e.id,
    user_id:     e.userId,
    company_id:  e.companyId  || null,
    name:        e.name,
    make:        e.make       || null,
    model:       e.model      || null,
    year:        e.year       ? parseInt(e.year) : null,
    type:        e.type       || null,
    serial_no:   e.serialNo   || null,
    hours:       e.hours      != null ? parseFloat(e.hours) : null,
    location:    e.location   || null,
    status:      e.status     || 'Active',
    notes:       e.notes      || null,
    photos:      e.photos     || [],
    service_log: e.serviceLog || [],
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
    serialNo:    r.serial_no,
    hours:       r.hours,
    location:    r.location,
    status:      r.status || 'Active',
    notes:       r.notes,
    photos:      r.photos      || [],
    serviceLog:  r.service_log || [],
    createdAt:   r.created_at,
    updatedAt:   r.updated_at,
  };
}

export async function getEquipment() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: own }, { data: perms }] = await Promise.all([
    supabase.from('equipment').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(500),
    supabase.from('asset_permissions').select('asset_id')
      .eq('user_id', user.id).eq('asset_type', 'equipment'),
  ]);

  let provisioned = [];
  if (perms?.length) {
    const ids = perms.map(p => p.asset_id);
    const { data } = await supabase.from('equipment').select('*').in('id', ids);
    provisioned = data || [];
  }

  const seen = new Set();
  return [...(own || []), ...provisioned]
    .filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; })
    .map(fromDb);
}

export async function upsertEquipment(item) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const row = { ...toDb(item), user_id: user.id };
  const isNew = !row.id;
  if (isNew) delete row.id;

  if (isNew) {
    const { data, error } = await supabase.from('equipment').insert(row).select('id').single();
    if (error) throw error;
    return fromDb({ ...row, id: data.id, created_at: row.updated_at });
  } else {
    const { error } = await supabase.from('equipment').update(row).eq('id', row.id);
    if (error) throw error;
    await syncAssignmentChildName('equipment', row.id, row.name);
    return fromDb(row);
  }
}

export async function deleteEquipmentItem(id) {
  await unassignAllByChild('equipment', id);
  const { error } = await supabase.from('equipment').delete().eq('id', id);
  if (error) throw error;
}

// ── Permissions ──────────────────────────────────────────────────────────────

export async function getEquipmentPermissions(equipmentId) {
  const { data, error } = await supabase
    .from('asset_permissions')
    .select('*')
    .eq('asset_type', 'equipment')
    .eq('asset_id', equipmentId);
  if (error) throw error;
  return data || [];
}

export async function upsertEquipmentPermission(equipmentId, userId, companyId, canEdit) {
  const { error } = await supabase.from('asset_permissions').upsert({
    asset_type: 'equipment',
    asset_id:   equipmentId,
    user_id:    userId,
    company_id: companyId,
    can_edit:   canEdit,
  }, { onConflict: 'asset_type,asset_id,user_id' });
  if (error) throw error;
}

export async function revokeEquipmentPermission(equipmentId, userId) {
  const { error } = await supabase.from('asset_permissions')
    .delete()
    .eq('asset_type', 'equipment')
    .eq('asset_id', equipmentId)
    .eq('user_id', userId);
  if (error) throw error;
}
