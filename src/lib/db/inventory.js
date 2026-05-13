import { supabase } from '../supabase';

const lsKey = uid => `rat_inventory_${uid}`;

function fromDb(r) {
  return {
    id:         r.id,
    name:       r.name,
    brand:      r.brand       || '',
    supplier:   r.supplier    || '',
    partNumber: r.part_number || '',
    location:   r.location    || '',
    buyPrice:   r.buy_price  != null ? String(r.buy_price)  : '',
    sellPrice:  r.sell_price != null ? String(r.sell_price) : '',
    stockQty:   r.stock_qty  != null ? String(r.stock_qty)  : '',
    minStock:   r.min_stock  != null ? String(r.min_stock)  : '',
    notes:      r.notes       || '',
    createdAt:  r.created_at,
  };
}

function toDb(userId, item) {
  return {
    user_id:     userId,
    name:        item.name,
    brand:       item.brand       || null,
    supplier:    item.supplier    || null,
    part_number: item.partNumber  || null,
    location:    item.location    || null,
    buy_price:   item.buyPrice  !== '' ? parseFloat(item.buyPrice)  || null : null,
    sell_price:  item.sellPrice !== '' ? parseFloat(item.sellPrice) || null : null,
    stock_qty:   item.stockQty  !== '' ? parseInt(item.stockQty)   || 0    : 0,
    min_stock:   item.minStock  !== '' ? parseInt(item.minStock)   || null : null,
    notes:       item.notes       || null,
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
      .select('stock_qty')
      .eq('id', itemId)
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    const newQty = Math.max(0, (Number(data?.stock_qty) || 0) + delta);
    await supabase
      .from('inventory_items')
      .update({ stock_qty: newQty, updated_at: new Date().toISOString() })
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
