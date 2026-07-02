import { supabase } from '../supabase';
import { svcToDb, svcFromDb } from './transforms';

export async function getServices(machineId) {
  const { data, error } = await supabase.from("services").select("*").eq("machine_id", machineId).order("completed_at", { ascending: false }).limit(500);
  if (error) { console.error("getServices:", error); return []; }
  return (data || []).map(svcFromDb);
}

export async function upsertService(machineId, s) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const row = svcToDb(machineId, s);
  if (!row.id) {
    const { error } = await supabase.from("services").insert({ ...row, user_id: user.id });
    if (error) { console.error("upsertService insert:", error); throw error; }
  } else {
    const { data: updated, error } = await supabase.from("services").update(row).eq("id", row.id).select("id");
    if (error) { console.error("upsertService update:", error); throw error; }
    if (!updated?.length) {
      // 0 rows updated: either a new entry (client-generated id, normal path)
      // or a row hidden by RLS — the PK violation distinguishes the two.
      const { error: ie } = await supabase.from("services").insert({ ...row, user_id: user.id });
      if (ie) {
        console.error("upsertService insert:", ie);
        if (ie.code === "23505") throw new Error("You don't have permission to edit this service entry.");
        throw ie;
      }
    }
  }
}

export async function deleteServiceApi(id) {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) { console.error("deleteService:", error); throw error; }
}
