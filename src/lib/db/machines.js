import { supabase } from '../supabase';
import { toDb, fromDb } from './transforms';
import { deletePhoto } from '../storage';

export async function getMachines() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Fetch own machines and permission list in parallel
  const [{ data: own, error }, { data: perms }] = await Promise.all([
    supabase.from("machines").select("*").order("created_at", { ascending: false }).limit(500),
    supabase.from("machine_permissions").select("machine_id").eq("user_id", user.id),
  ]);
  if (error) { console.error("getMachines:", error); return []; }

  let provisioned = [];
  if (perms?.length) {
    const ids = perms.map(p => p.machine_id);
    const { data } = await supabase.from("machines").select("*").in("id", ids);
    provisioned = data || [];
  }

  const seen = new Set();
  return [...(own || []), ...provisioned]
    .filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; })
    .map(fromDb);
}

export async function getMachinePermissions(machineId) {
  const { data } = await supabase.from("machine_permissions").select("*").eq("machine_id", machineId);
  return data || [];
}

export async function upsertMachinePermission(machineId, userId, companyId, canEdit) {
  const { error } = await supabase.from("machine_permissions")
    .upsert({ machine_id: machineId, user_id: userId, company_id: companyId, can_edit: canEdit }, { onConflict: "machine_id,user_id" });
  if (error) throw error;
}

export async function revokeMachinePermission(machineId, userId) {
  const { error } = await supabase.from("machine_permissions").delete().eq("machine_id", machineId).eq("user_id", userId);
  if (error) throw error;
}

export async function upsertMachine(machine) {
  const { data: { user } } = await supabase.auth.getUser();
  const row = { ...toDb(machine), user_id: user?.id };
  const isNew = !machine.id;
  const { error } = await supabase.from("machines").upsert(row, { onConflict: "id" });
  if (error) { console.error("upsertMachine:", error); throw error; }
}

export async function deleteMachineApi(id) {
  try {
    const [{ data: mach }, { data: svc }] = await Promise.all([
      supabase.from('machines').select('photos, i_p_photos, e_p_photos').eq('id', id).single(),
      supabase.from('services').select('plug_photo, job_photos').eq('machine_id', id),
    ]);
    const urls = [
      ...(mach?.photos || []),
      ...(mach?.i_p_photos || []),
      ...(mach?.e_p_photos || []),
      ...(svc || []).flatMap(s => [...(s.job_photos || []), ...(s.plug_photo ? [s.plug_photo] : [])]),
    ];
    urls.forEach(url => deletePhoto(url));
  } catch (e) { console.warn('deleteMachine photo cleanup:', e); }
  const { error } = await supabase.from('machines').delete().eq('id', id);
  if (error) console.error("deleteMachine:", error);
}
