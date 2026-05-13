import { supabase } from '../supabase';

const lsKey = uid => `rat_tools_${uid}`;

function fromDb(r) {
  const p = r.payload || {};
  return {
    id:              r.id,
    name:            p.name            || '',
    brand:           p.brand           || '',
    model:           p.model           || '',
    category:        p.category        || '',
    condition:       p.condition       || 'Good',
    purchaseDate:    p.purchaseDate    || '',
    purchasePrice:   p.purchasePrice   || 0,
    warrantyExpiry:  p.warrantyExpiry  || '',
    storageLocation: p.storageLocation || '',
    notes:           p.notes           || '',
    loanedTo:        p.loanedTo        || null,
    loanedAt:        p.loanedAt        || null,
    serviceLog:      p.serviceLog      || [],
    photos:          p.photos          || [],
    createdAt:       r.created_at,
  };
}

function toDb(userId, tool) {
  return {
    user_id: userId,
    payload: {
      name:            tool.name,
      brand:           tool.brand            || null,
      model:           tool.model            || null,
      category:        tool.category         || null,
      condition:       tool.condition        || null,
      purchaseDate:    tool.purchaseDate     || null,
      purchasePrice:   tool.purchasePrice    || null,
      warrantyExpiry:  tool.warrantyExpiry   || null,
      storageLocation: tool.storageLocation  || null,
      notes:           tool.notes            || null,
      loanedTo:        tool.loanedTo         || null,
      loanedAt:        tool.loanedAt         || null,
      serviceLog:      tool.serviceLog       || [],
      photos:          tool.photos           || [],
    },
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
