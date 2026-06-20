import { supabase } from '../supabase';
import { unassignAllByChild, syncAssignmentChildName } from './assetAssignments';
import { deletePhoto } from '../storage';

function fromDb(r) {
  return {
    id:          r.id,
    userId:      r.user_id,
    companyId:   r.company_id,
    name:        r.name,
    category:    r.category,
    brand:       r.brand        || '',
    quantity:    r.quantity     ?? 0,
    unit:        r.unit         || 'L',
    minQuantity: r.min_quantity ?? null,
    maxQuantity: r.max_quantity ?? null,
    spec:        r.spec         || {},
    buyPrice:    r.buy_price    != null ? parseFloat(r.buy_price)  : null,
    sellPrice:   r.sell_price   != null ? parseFloat(r.sell_price) : null,
    supplier:    r.supplier     || '',
    partNumber:  r.part_number  || '',
    location:    r.location     || '',
    notes:       r.notes        || '',
    photos:      r.photos       || [],
    createdAt:   r.created_at,
    updatedAt:   r.updated_at,
  };
}

export async function getConsumables() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('consumables')
    .select('*')
    .eq('user_id', user.id)
    .order('category', { ascending: true })
    .order('name',     { ascending: true });
  if (error) throw error;
  return (data || []).map(fromDb);
}

export async function upsertConsumable(item) {
  const { data: { user } } = await supabase.auth.getUser();
  const now = new Date().toISOString();
  const payload = {
    user_id:      user.id,
    company_id:   item.companyId || null,
    name:         item.name,
    category:     item.category,
    brand:        item.brand       || null,
    quantity:     item.quantity    ?? 0,
    unit:         item.unit        || 'L',
    min_quantity: item.minQuantity != null && item.minQuantity !== '' ? parseFloat(item.minQuantity) : null,
    max_quantity: item.maxQuantity != null && item.maxQuantity !== '' ? parseFloat(item.maxQuantity) : null,
    spec:         item.spec        || {},
    buy_price:    item.buyPrice    != null && item.buyPrice   !== '' ? parseFloat(item.buyPrice)    : null,
    sell_price:   item.sellPrice   != null && item.sellPrice  !== '' ? parseFloat(item.sellPrice)   : null,
    supplier:     item.supplier    || null,
    part_number:  item.partNumber  || null,
    location:     item.location    || null,
    notes:        item.notes       || null,
    photos:       item.photos      || [],
    updated_at:   now,
  };
  if (item.id) {
    const { data, error } = await supabase.from('consumables').update(payload).eq('id', item.id).select().single();
    if (error) throw error;
    await syncAssignmentChildName('consumable', item.id, item.name);
    return fromDb(data);
  } else {
    const { data, error } = await supabase.from('consumables').insert({ ...payload, created_at: now }).select().single();
    if (error) throw error;
    return fromDb(data);
  }
}

export async function deleteConsumable(id) {
  try {
    const { data } = await supabase.from('consumables').select('photos').eq('id', id).single();
    (data?.photos || []).forEach(url => deletePhoto(url));
  } catch {}
  await unassignAllByChild('consumable', id);
  const { error } = await supabase.from('consumables').delete().eq('id', id);
  if (error) throw error;
}

export async function adjustConsumableQty(id, delta) {
  const { data, error } = await supabase.rpc('adjust_consumable_qty', { p_id: id, p_delta: delta });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  // Re-fetch the full row so callers get the same shape as before
  const { data: row, error: e2 } = await supabase.from('consumables').select('*').eq('id', id).single();
  if (e2) throw e2;
  return fromDb(row);
}

// ── Permissions (asset_permissions) ─────────────────────────────────────────

export async function getConsumablePermissions(itemId) {
  const { data, error } = await supabase
    .from('asset_permissions')
    .select('*')
    .eq('asset_type', 'consumable')
    .eq('asset_id', itemId);
  if (error) throw error;
  return data || [];
}

export async function upsertConsumablePermission(itemId, userId, companyId, canEdit) {
  const { error } = await supabase.from('asset_permissions').upsert({
    asset_type: 'consumable',
    asset_id:   itemId,
    user_id:    userId,
    company_id: companyId,
    can_edit:   canEdit,
  }, { onConflict: 'asset_type,asset_id,user_id' });
  if (error) throw error;
}

export async function revokeConsumablePermission(itemId, userId) {
  const { error } = await supabase.from('asset_permissions')
    .delete()
    .eq('asset_type', 'consumable')
    .eq('asset_id', itemId)
    .eq('user_id', userId);
  if (error) throw error;
}
