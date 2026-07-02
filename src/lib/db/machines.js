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
  const row = toDb(machine);
  if (!machine.id) {
    row.user_id = user?.id;
    const { error } = await supabase.from("machines").insert(row);
    if (error) { console.error("upsertMachine:", error); throw error; }
  } else {
    // Strip user_id so ownership can't be transferred via UPDATE.
    // Use .select("id") to detect 0-row matches (new machine with pre-generated UUID)
    // and fall back to INSERT in that case.
    const { user_id: _uid, ...updateRow } = row;
    const { data: updated, error } = await supabase.from("machines").update(updateRow).eq("id", row.id).select("id");
    if (error) { console.error("upsertMachine:", error); throw error; }
    if (!updated?.length) {
      row.user_id = user?.id;
      const { error: ie } = await supabase.from("machines").insert(row);
      if (ie) { console.error("upsertMachine:", ie); throw ie; }
    }
  }
}

export async function deleteMachineApi(id) {
  // Collect photo URLs first, but do NOT delete them yet — if the row delete
  // fails the machine must come back with its photos intact.
  let urls = [];
  try {
    const [{ data: mach }, { data: svc }] = await Promise.all([
      supabase.from('machines').select('photos, i_p_photos, e_p_photos, carb_spec').eq('id', id).single(),
      supabase.from('services').select('plug_photo, job_photos').eq('machine_id', id),
    ]);
    urls = [
      ...(mach?.photos || []),
      ...(mach?.i_p_photos || []),
      ...(mach?.e_p_photos || []),
      ...(mach?.carb_spec?.gasketPhotos || []),
      ...(svc || []).flatMap(s => [...(s.job_photos || []), ...(s.plug_photo ? [s.plug_photo] : [])]),
    ];
  } catch (e) { console.warn('deleteMachine photo scan:', e); }

  // Children first — services has no ON DELETE CASCADE on machine_id.
  const { error: svcErr } = await supabase.from('services').delete().eq('machine_id', id);
  if (svcErr) { console.error('deleteMachine services:', svcErr); throw svcErr; }
  const { error } = await supabase.from('machines').delete().eq('id', id);
  if (error) { console.error('deleteMachine:', error); throw error; }

  // Row is gone — storage cleanup is now safe (best-effort).
  urls.forEach(url => deletePhoto(url));
}
