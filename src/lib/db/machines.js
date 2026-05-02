import { supabase } from '../supabase';
import { toDb, fromDb } from './transforms';

export async function getMachines() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from("machines").select("*").order("created_at", { ascending: false });
  if (error) { console.error("getMachines:", error); return []; }
  return (data || []).map(fromDb);
}

export async function upsertMachine(machine) {
  const { data: { user } } = await supabase.auth.getUser();
  const row = { ...toDb(machine), user_id: user?.id };
  const { error } = await supabase.from("machines").upsert(row, { onConflict: "id" });
  if (error) { console.error("upsertMachine:", error); throw error; }
}

export async function deleteMachineApi(id) {
  const { error } = await supabase.from("machines").delete().eq("id", id);
  if (error) console.error("deleteMachine:", error);
}
