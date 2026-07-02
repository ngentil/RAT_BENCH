import { supabase } from '../supabase';
import { deletePhoto } from '../storage';

function fromDb(r) {
  return {
    id:        r.id,
    name:      r.name,
    phone:     r.phone     || "",
    email:     r.email     || "",
    address:   r.address   || "",
    notes:     r.notes     || "",
    photos:    r.photos    || [],
    createdAt: r.created_at,
  };
}

export async function getClients() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) { console.error("getClients:", error); return []; }
  return (data || []).map(fromDb);
}

export async function upsertClient(client) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const payload = {
    name:    client.name,
    phone:   client.phone   || null,
    email:   client.email   || null,
    address: client.address || null,
    notes:   client.notes   || null,
    photos:  client.photos  || [],
  };
  if (!client.id) {
    const { error } = await supabase.from("clients").insert({ ...payload, user_id: user.id });
    if (error) { console.error("upsertClient:", error); throw error; }
  } else {
    const { data: updated, error } = await supabase.from("clients").update(payload).eq("id", client.id).select("id");
    if (error) { console.error("upsertClient:", error); throw error; }
    if (!updated?.length) {
      const { error: ie } = await supabase.from("clients").insert({ ...payload, id: client.id, user_id: user.id });
      if (ie) { console.error("upsertClient insert:", ie); throw ie; }
    }
  }
}

export async function deleteClientApi(id) {
  let photos = [];
  try {
    const { data } = await supabase.from('clients').select('photos').eq('id', id).single();
    photos = data?.photos || [];
  } catch {}
  // Row first — a failed delete must not leave the surviving client with 404 photos
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) { console.error("deleteClient:", error); throw error; }
  photos.forEach(url => deletePhoto(url));
}

// One-time migration: pushes any clients stored in localStorage up to Supabase.
// Safe to call on every startup — exits immediately if nothing to migrate.
export async function migrateLocalClients(userId) {
  if (!userId) return;
  const key = `rat_clients_${userId}`;
  let local = [];
  try { local = JSON.parse(localStorage.getItem(key) || "[]"); } catch { return; }
  if (!local.length) return;
  try {
    for (const c of local) {
      await upsertClient({ ...c, id: c.id || crypto.randomUUID() });
    }
    localStorage.removeItem(key);
    console.log(`Migrated ${local.length} client(s) from localStorage to Supabase.`);
  } catch (e) {
    console.warn("Client migration failed — localStorage data preserved:", e);
  }
}
