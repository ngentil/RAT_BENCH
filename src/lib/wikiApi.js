import { supabase } from './supabase';
// ── Wiki API ──────────────────────────────────────────────────────────────────
export function makeSlug(make, model) {
  return [make, model].join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getWikiEntryBySlug(slug) {
  const { data: entry, error } = await supabase.from("wiki_entries")
    .select("*").eq("slug", slug).single();
  if (error || !entry) return null;
  if (entry.current_rev_id) {
    const { data: rev } = await supabase.from("wiki_revisions")
      .select("*").eq("id", entry.current_rev_id).single();
    entry.currentRevision = rev || null;
  }
  return entry;
}

export async function getWikiRevisions(entryId) {
  const { data } = await supabase.from("wiki_revisions")
    .select("*").eq("entry_id", entryId).order("created_at", { ascending: false });
  return data || [];
}

export async function searchWiki(query) {
  const { data } = await supabase.from("wiki_entries")
    .select("id,slug,make,model,type,view_count")
    .or(`make.ilike.%${query}%,model.ilike.%${query}%`)
    .order("view_count", { ascending: false })
    .limit(30);
  return data || [];
}

export async function incrementViewCount(entryId) {
  await supabase.rpc("increment_wiki_views", { entry_id: entryId });
}

export async function saveWikiRevision(entryId, data, editSummary, profile) {
  const { data: rev, error } = await supabase.from("wiki_revisions").insert({
    entry_id:     entryId,
    edited_by:    profile.id,
    username:     profile.username,
    edit_summary: editSummary || "Updated specs",
    data,
  }).select().single();
  if (error) throw error;
  await supabase.from("wiki_entries")
    .update({ current_rev_id: rev.id }).eq("id", entryId);
  return rev;
}

export async function deleteWikiRevision(revId, entryId){
  const{error}=await supabase.from("wiki_revisions").delete().eq("id",revId);
  if(error) throw error;
  const{data:remaining}=await supabase.from("wiki_revisions")
    .select("id").eq("entry_id",entryId).order("created_at",{ascending:false}).limit(1);
  await supabase.from("wiki_entries").update({current_rev_id:remaining?.[0]?.id||null}).eq("id",entryId);
}

export async function deleteWikiEntry(entryId){
  await supabase.from("wiki_revisions").delete().eq("entry_id",entryId);
  await supabase.from("wiki_contributions").delete().eq("entry_id",entryId);
  const{error}=await supabase.from("wiki_entries").delete().eq("id",entryId);
  if(error) throw error;
}

export async function publishToWiki(machine, profile) {
  const slug = makeSlug(machine.make || "", machine.model || "");
  if (!slug || slug === "-") throw new Error("Machine must have a make and model to publish.");

  // Strip private/user-specific fields before storing
  const { userId, companyId, clientId, ...specData } = machine;

  // Check for existing entry
  const { data: existing } = await supabase.from("wiki_entries")
    .select("*").eq("slug", slug).single();

  if (existing) {
    // Return existing entry + current revision for merge review
    const { data: currentRev } = await supabase.from("wiki_revisions")
      .select("*").eq("id", existing.current_rev_id).single();
    return { entry: existing, currentRevision: currentRev || null, isNew: false, slug, specData };
  }

  // Create new entry
  const { data: entry, error } = await supabase.from("wiki_entries").insert({
    slug, make: machine.make, model: machine.model, type: machine.type,
    created_by: profile.id,
  }).select().single();
  if (error) throw error;

  const rev = await saveWikiRevision(entry.id, specData, "Initial publish", profile);

  await supabase.from("wiki_contributions").insert({
    entry_id: entry.id, machine_id: machine.id, user_id: profile.id,
  });

  return { entry, currentRevision: rev, isNew: true, slug, specData };
}