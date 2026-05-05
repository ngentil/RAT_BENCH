import { supabase } from '../supabase';

export async function getMyCompany(companyId) {
  if (!companyId) return null;
  const { data, error } = await supabase.from("companies").select("*").eq("id", companyId).single();
  if (error) { console.error("[getMyCompany]", error); return null; }
  return data;
}

export async function createCompany(ownerId, fields) {
  const { data, error } = await supabase.rpc("rpc_create_company", { payload: fields });
  if (error) throw error;
  return data;
}

export async function updateCompany(companyId, fields) {
  const { data, error } = await supabase.from("companies").update(fields).eq("id", companyId).select().single();
  if (error) throw error;
  return data;
}

export async function joinCompanyByCode(code) {
  const { data, error } = await supabase.rpc("join_company_by_invite", { invite_code_input: code.trim() });
  if (error) throw new Error("Invalid invite code — check and try again.");
  return data;
}

export async function leaveCompany(companyId, userId) {
  await supabase.from("company_members").delete().eq("company_id", companyId).eq("user_id", userId);
  await supabase.from("profiles").update({ company_id: null }).eq("id", userId);
}

export async function getCompanyMembers(companyId) {
  const { data: members } = await supabase.from("company_members").select("*").eq("company_id", companyId);
  if (!members?.length) return [];
  const { data: profiles } = await supabase.from("profiles").select("id, username, display_name").in("id", members.map(m => m.user_id));
  const pm = {};
  (profiles || []).forEach(p => { pm[p.id] = p; });
  return members.map(m => ({ ...m, profile: pm[m.user_id] || {} }));
}

export async function removeMember(companyId, userId) {
  const { error } = await supabase.rpc("rpc_remove_member", { p_company_id: companyId, p_user_id: userId });
  if (error) throw error;
}

export async function deleteCompany(companyId) {
  const { error } = await supabase.rpc("rpc_delete_company", { p_company_id: companyId });
  if (error) throw error;
}

export async function regenerateInviteCode(companyId) {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  const { data, error } = await supabase.from("companies").update({ invite_code: code }).eq("id", companyId).select().single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, fields) {
  const { data, error } = await supabase.from("profiles").update(fields).eq("id", userId).select().single();
  if (error) throw error;
  return data;
}
