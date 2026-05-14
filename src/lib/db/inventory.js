import { supabase } from '../supabase';

const lsKey = uid => `rat_inventory_${uid}`;

function fromDb(r) {
  const p = r.payload || {};
  return {
    id:         r.id,
    name:       p.name       || '',
    brand:      p.brand      || '',
    supplier:   p.supplier   || '',
    partNumber: p.partNumber || '',
    location:   p.location   || '',
    buyPrice:   p.buyPrice  != null ? String(p.buyPrice)  : '',
    sellPrice:  p.sellPrice != null ? String(p.sellPrice) : '',
    stockQty:   p.stockQty  != null ? String(p.stockQty)  : '',
    minStock:   p.minStock  != null ? String(p.minStock)  : '',
    notes:      p.notes      || '',
    createdAt:  r.created_at,
  };
}

function toDb(userId, item) {
  return {
    user_id: userId,
    payload: {
      name:       item.name,
      brand:      item.brand      || null,
      supplier:   item.supplier   || null,
      partNumber: item.partNumber || null,
      location:   item.location   || null,
      buyPrice:   item.buyPrice  !== '' ? parseFloat(item.buyPrice)  || null : null,
      sellPrice:  item.sellPrice !== '' ? parseFloat(item.sellPrice) || null : null,
      stockQty:   item.stockQty  !== '' ? parseInt(item.stockQty)   || 0    : 0,
      minStock:   item.minStock  !== '' ? parseInt(item.minStock)   || null : null,
      notes:      item.notes      || null,
    },
  };
}

export async function getInventory(userId) {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    const items = (data || []).map(fromDb);
    localStorage.setItem(lsKey(userId), JSON.stringify(items));
    return items;
  } catch {
    try { return JSON.parse(localStorage.getItem(lsKey(userId)) || '[]'); } catch { return []; }
  }
}

export async function saveInventoryItem(userId, item) {
  const now = new Date().toISOString();
  const isNew = !item.id;
  const id = item.id || crypto.randomUUID();
  try {
    await supabase.from('inventory_items').upsert(
      { ...toDb(userId, item), id, updated_at: now, ...(isNew ? { created_at: now } : {}) },
      { onConflict: 'id' }
    );
  } catch (e) { console.warn('saveInventoryItem Supabase failed:', e); }
  return getInventory(userId);
}

export async function deleteInventoryItem(userId, itemId) {
  try {
    await supabase.from('inventory_items').delete().eq('id', itemId).eq('user_id', userId);
  } catch (e) { console.warn('deleteInventoryItem Supabase failed:', e); }
  return getInventory(userId);
}

// delta: negative to deduct (use), positive to restock
export async function adjustStock(userId, itemId, delta) {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('payload')
      .eq('id', itemId)
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    const p = data?.payload || {};
    const newQty = Math.max(0, (Number(p.stockQty) || 0) + delta);
    await supabase
      .from('inventory_items')
      .update({ payload: { ...p, stockQty: newQty }, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .eq('user_id', userId);
  } catch (e) { console.warn('adjustStock Supabase failed:', e); }
  return getInventory(userId);
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
