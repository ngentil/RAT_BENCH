import { supabase } from '../supabase';
import { svcToDb, svcFromDb } from './transforms';

export async function getServices(machineId) {
  const { data, error } = await supabase.from("services").select("*").eq("machine_id", machineId).order("completed_at", { ascending: false });
  if (error) { console.error("getServices:", error); return []; }
  return (data || []).map(svcFromDb);
}

export async function upsertService(machineId, s) {
  const { data: { user } } = await supabase.auth.getUser();
  const row = svcToDb(machineId, s);
  const isNew = !row.id;
  if (isNew) {
    const { error } = await supabase.from("services").insert({ ...row, user_id: user?.id });
    if (error) console.error("upsertService insert:", error);
  } else {
    const { error } = await supabase.from("services").update(row).eq("id", row.id);
    if (error) console.error("upsertService update:", error);
  }
}

export async function deleteServiceApi(id) {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) console.error("deleteService:", error);
}
