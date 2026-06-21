import { supabase } from '../supabase';
import { unassignAllByChild, syncAssignmentChildName } from './assetAssignments';
import { deletePhoto } from '../storage';

function toDb(t) {
  return {
    id:               t.id,
    user_id:          t.userId,
    company_id:       t.companyId       || null,
    name:             t.name,
    brand:            t.brand           || null,
    model:            t.model           || null,
    category:         t.category        || null,
    condition:        t.condition       || 'Good',
    purchase_date:    t.purchaseDate    || null,
    purchase_price:   t.purchasePrice   != null ? parseFloat(t.purchasePrice) : 0,
    warranty_expiry:  t.warrantyExpiry  || null,
    storage_location: t.storageLocation || null,
    loaned_to:        t.loanedTo        || null,
    loaned_at:        t.loanedAt        || null,
    notes:            t.notes           || null,
    photos:           t.photos          || [],
    service_log:      t.serviceLog      || [],
    updated_at:       new Date().toISOString(),
  };
}

function fromDb(r) {
  return {
    id:              r.id,
    userId:          r.user_id,
    companyId:       r.company_id,
    name:            r.name,
    brand:           r.brand,
    model:           r.model,
    category:        r.category,
    condition:       r.condition       || 'Good',
    purchaseDate:    r.purchase_date,
    purchasePrice:   r.purchase_price  || 0,
    warrantyExpiry:  r.warranty_expiry,
    storageLocation: r.storage_location,
    loanedTo:        r.loaned_to,
    loanedAt:        r.loaned_at,
    notes:           r.notes,
    photos:          r.photos          || [],
    serviceLog:      r.service_log     || [],
    createdAt:       r.created_at,
    updatedAt:       r.updated_at,
  };
}

// One-time migration from localStorage → Supabase.
// Called once on first load; clears the localStorage key afterward.
async function migrateLocalTools(userId) {
  const lsKey = `rat_tools_${userId}`;
  let local = [];
  try { local = JSON.parse(localStorage.getItem(lsKey) || '[]'); } catch { return; }
  if (!local.length) return;

  const rows = local.map(t => ({
    ...toDb({ ...t, userId }),
  }));

  await supabase.from('tools').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
  localStorage.removeItem(lsKey);
}

export async function getTools() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  await migrateLocalTools(user.id);

  const [{ data: own }, { data: perms }] = await Promise.all([
    supabase.from('tools').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(500),
    supabase.from('asset_permissions').select('asset_id')
      .eq('user_id', user.id).eq('asset_type', 'tool'),
  ]);

  let provisioned = [];
  if (perms?.length) {
    const ids = perms.map(p => p.asset_id);
    const { data } = await supabase.from('tools').select('*').in('id', ids);
    provisioned = data || [];
  }

  const seen = new Set();
  return [...(own || []), ...provisioned]
    .filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; })
    .map(fromDb);
}

export async function saveToolItem(tool) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const row = { ...toDb({ ...tool, userId: user.id }) };
  const isNew = !row.id;
  if (isNew) delete row.id;

  if (isNew) {
    const { data, error } = await supabase.from('tools').insert(row).select('id').single();
    if (error) throw error;
    return fromDb({ ...row, id: data.id, created_at: row.updated_at });
  } else {
    const { user_id: _uid, ...updateRow } = row;
    const { error } = await supabase.from('tools').update(updateRow).eq('id', row.id);
    if (error) throw error;
    await syncAssignmentChildName('tool', row.id, row.name);
    return fromDb(row);
  }
}

export async function deleteToolItem(id) {
  const { data } = await supabase.from('tools').select('photos, service_log').eq('id', id).single();
  (data?.photos || []).forEach(url => deletePhoto(url));
  (data?.service_log || []).forEach(entry => {
    if (entry.plugPhoto) deletePhoto(entry.plugPhoto);
    (entry.jobPhotos || []).forEach(url => deletePhoto(url));
  });
  await unassignAllByChild('tool', id);
  await supabase.from('asset_permissions').delete().eq('asset_type', 'tool').eq('asset_id', id);
  const { error } = await supabase.from('tools').delete().eq('id', id);
  if (error) throw error;
}

// ── Permissions ──────────────────────────────────────────────────────────────

export async function getToolPermissions(toolId) {
  const { data, error } = await supabase
    .from('asset_permissions')
    .select('*')
    .eq('asset_type', 'tool')
    .eq('asset_id', toolId);
  if (error) throw error;
  return data || [];
}

export async function upsertToolPermission(toolId, userId, companyId, canEdit) {
  const { error } = await supabase.from('asset_permissions').upsert({
    asset_type: 'tool',
    asset_id:   toolId,
    user_id:    userId,
    company_id: companyId,
    can_edit:   canEdit,
  }, { onConflict: 'asset_type,asset_id,user_id' });
  if (error) throw error;
}

export async function revokeToolPermission(toolId, userId) {
  const { error } = await supabase.from('asset_permissions')
    .delete()
    .eq('asset_type', 'tool')
    .eq('asset_id', toolId)
    .eq('user_id', userId);
  if (error) throw error;
}
