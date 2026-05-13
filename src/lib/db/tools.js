import { supabase } from '../supabase';

const lsKey = uid => `rat_tools_${uid}`;

function fromDb(r) {
  return {
    id:              r.id,
    name:            r.name,
    brand:           r.brand            || '',
    model:           r.model            || '',
    category:        r.category         || '',
    condition:       r.condition        || 'Good',
    purchaseDate:    r.purchase_date    || '',
    purchasePrice:   r.purchase_price   || 0,
    warrantyExpiry:  r.warranty_expiry  || '',
    storageLocation: r.storage_location || '',
    notes:           r.notes            || '',
    loanedTo:        r.loaned_to        || null,
    loanedAt:        r.loaned_at        || null,
    serviceLog:      r.service_log      || [],
    photos:          r.photos           || [],
    createdAt:       r.created_at,
  };
}

function toDb(userId, tool) {
  return {
    user_id:          userId,
    name:             tool.name,
    brand:            tool.brand            || null,
    model:            tool.model            || null,
    category:         tool.category         || null,
    condition:        tool.condition        || null,
    purchase_date:    tool.purchaseDate     || null,
    purchase_price:   tool.purchasePrice    || null,
    warranty_expiry:  tool.warrantyExpiry   || null,
    storage_location: tool.storageLocation  || null,
    notes:            tool.notes            || null,
    loaned_to:        tool.loanedTo         || null,
    loaned_at:        tool.loanedAt         || null,
    service_log:      tool.serviceLog       || [],
    photos:           tool.photos           || [],
  };
}

export async function getTools(userId) {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const tools = (data || []).map(fromDb);
    localStorage.setItem(lsKey(userId), JSON.stringify(tools));
    return tools;
  } catch {
    try { return JSON.parse(localStorage.getItem(lsKey(userId)) || '[]'); } catch { return []; }
  }
}

export async function saveToolItem(userId, tool) {
  const now = new Date().toISOString();
  const isNew = !tool.id;
  const id = tool.id || crypto.randomUUID();
  try {
    await supabase.from('tools').upsert(
      { ...toDb(userId, tool), id, updated_at: now, ...(isNew ? { created_at: now } : {}) },
      { onConflict: 'id' }
    );
  } catch (e) { console.warn('saveToolItem Supabase failed:', e); }
  return getTools(userId);
}

export async function deleteToolItem(userId, toolId) {
  try {
    await supabase.from('tools').delete().eq('id', toolId).eq('user_id', userId);
  } catch (e) { console.warn('deleteToolItem Supabase failed:', e); }
  return getTools(userId);
}

export async function migrateLocalTools(userId) {
  if (!userId) return;
  const key = lsKey(userId);
  let local = [];
  try { local = JSON.parse(localStorage.getItem(key) || '[]'); } catch { return; }
  if (!local.length) return;
  try {
    for (const t of local) await saveToolItem(userId, { ...t, id: t.id || crypto.randomUUID() });
    localStorage.removeItem(key);
  } catch (e) { console.warn('Tool migration failed — localStorage preserved:', e); }
}
