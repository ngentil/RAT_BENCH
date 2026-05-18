import { supabase } from '../supabase';
import { svcToDb, svcFromDb } from './transforms';

export async function getServices(machineId) {
  const { data, error } = await supabase.from("services").select("*").eq("machine_id", machineId).order("completed_at", { ascending: false });
  if (error) { console.error("getServices:", error); return []; }
  return (data || []).map(svcFromDb);
}

export async function upsertService(machineId, s) {
  const { data: { user } } = await supabase.auth.getUser();
  const row = { ...svcToDb(machineId, s), user_id: user?.id };
  const { error } = await supabase.from("services").upsert(row, { onConflict: "id" });
  if (error) console.error("upsertService:", error);
}

export async function deleteServiceApi(id) {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) console.error("deleteService:", error);
}
