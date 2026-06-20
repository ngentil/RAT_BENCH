import { supabase } from '../supabase';
import { unassignAllByChild, syncAssignmentChildName } from './assetAssignments';
import { deletePhoto } from '../storage';


function fromDb(r) {
  const p = r.payload || {};
  const stockQty = p.stockQty != null ? Number(p.stockQty) : 0;
  const minQty   = p.minQuantity != null ? Number(p.minQuantity) : (p.minStock != null ? Number(p.minStock) : null);
  return {
    id:          r.id,
    name:        p.name        || '',
    brand:       p.brand       || '',
    supplier:    p.supplier    || '',
    partNumber:  p.partNumber  || '',
    location:    p.location    || '',
    buyPrice:    p.buyPrice    != null ? parseFloat(p.buyPrice)  : null,
    sellPrice:   p.sellPrice   != null ? parseFloat(p.sellPrice) : null,
    stockQty:    String(stockQty),
    minStock:    minQty != null ? String(minQty) : '',
    quantity:    stockQty,
    unit:        p.unit        || 'pcs',
    category:    p.category    || '',
    spec:        p.spec        || {},
    minQuantity: minQty,
    maxQuantity: p.maxQuantity != null ? Number(p.maxQuantity) : null,
    notes:       p.notes       || '',
    photos:      p.photos      || [],
    createdAt:   r.created_at,
  };
}

function toDb(userId, item) {
  const qty     = item.quantity    != null ? Number(item.quantity)    : (item.stockQty  !== '' ? parseInt(item.stockQty)  || 0 : 0);
  const minQty  = item.minQuantity != null ? Number(item.minQuantity) : (item.minStock   !== '' ? parseFloat(item.minStock) || null : null);
  const maxQty  = item.maxQuantity != null ? Number(item.maxQuantity) : null;
  const buyP    = item.buyPrice    != null && item.buyPrice !== '' ? parseFloat(item.buyPrice)  || null : null;
  const sellP   = item.sellPrice   != null && item.sellPrice !== '' ? parseFloat(item.sellPrice) || null : null;
  return {
    user_id: userId,
    payload: {
      name:        item.name,
      brand:       item.brand       || null,
      supplier:    item.supplier    || null,
      partNumber:  item.partNumber  || null,
      location:    item.location    || null,
      buyPrice:    buyP,
      sellPrice:   sellP,
      stockQty:    qty,
      minStock:    minQty,
      quantity:    qty,
      unit:        item.unit        || 'pcs',
      category:    item.category    || null,
      spec:        item.spec        || {},
      minQuantity: minQty,
      maxQuantity: maxQty,
      notes:       item.notes       || null,
      photos:      item.photos      || [],
    },
  };
}

export async function getInventoryItems() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) return [];
  return getInventory(user.id);
}

export async function getInventory(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(fromDb);
}

export async function saveInventoryItem(userId, item) {
  const now = new Date().toISOString();
  const isNew = !item.id;
  const id = item.id || crypto.randomUUID();
  try {
    const { user_id: _uid, ...updateRow } = toDb(userId, item);
    if (isNew) {
      await supabase.from('inventory_items').insert(
        { user_id: userId, ...updateRow, id, created_at: now, updated_at: now }
      );
    } else {
      await supabase.from('inventory_items').update(
        { ...updateRow, updated_at: now }
      ).eq('id', id);
      if (item.name) await syncAssignmentChildName('part', id, item.name);
    }
  } catch (e) { console.warn('saveInventoryItem Supabase failed:', e); }
  return getInventory(userId);
}

export async function deleteInventoryItem(userId, itemId) {
  try {
    const { data } = await supabase.from('inventory_items').select('payload').eq('id', itemId).eq('user_id', userId).single();
    (data?.payload?.photos || []).forEach(url => deletePhoto(url));
    await unassignAllByChild('part', itemId);
    await supabase.from('inventory_items').delete().eq('id', itemId).eq('user_id', userId);
  } catch (e) { console.warn('deleteInventoryItem Supabase failed:', e); }
  return getInventory(userId);
}

// delta: negative to deduct (use), positive to restock
export async function adjustStock(userId, itemId, delta) {
  try {
    const { data, error } = await supabase.rpc('adjust_inventory_stock', { p_item_id: itemId, p_delta: delta });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
  } catch (e) { console.warn('adjustStock Supabase failed:', e); }
  return getInventory(userId);
}

// ── Permissions ──────────────────────────────────────────────────────────────

export async function getInventoryPermissions(itemId) {
  const { data, error } = await supabase
    .from('asset_permissions')
    .select('*')
    .eq('asset_type', 'part')
    .eq('asset_id', itemId);
  if (error) throw error;
  return data || [];
}

export async function upsertInventoryPermission(itemId, userId, companyId, canEdit) {
  const { error } = await supabase.from('asset_permissions').upsert({
    asset_type: 'part',
    asset_id:   itemId,
    user_id:    userId,
    company_id: companyId,
    can_edit:   canEdit,
  }, { onConflict: 'asset_type,asset_id,user_id' });
  if (error) throw error;
}

export async function revokeInventoryPermission(itemId, userId) {
  const { error } = await supabase.from('asset_permissions')
    .delete()
    .eq('asset_type', 'part')
    .eq('asset_id', itemId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function migrateLocalInventory(userId) {
  if (!userId) return;
  const key = lsKey(userId);
  let local = [];
  try { local = JSON.parse(localStorage.getItem(key) || '[]'); } catch { return; }
  if (!local.length) return;
  try {
    for (const item of local) await saveInventoryItem(userId, { ...item, id: item.id || crypto.randomUUID() });
    localStorage.removeItem(key);
  } catch (e) { console.warn('Inventory migration failed — localStorage preserved:', e); }
}
