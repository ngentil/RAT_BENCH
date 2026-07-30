import { supabase } from '../supabase';

// Most recent document for this machine+type — the check the regenerate
// merge-or-copy prompt runs before a Quote/Invoice is (re)generated.
export async function getLatestDocumentForMachine(machineId, docType) {
  const { data, error } = await supabase
    .from('billing_documents')
    .select('*')
    .eq('machine_id', machineId)
    .eq('doc_type', docType)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) { console.error('getLatestDocumentForMachine:', error); return null; }
  return data?.[0] || null;
}

export async function getAllDocuments(docType) {
  let query = supabase.from('billing_documents').select('*').order('created_at', { ascending: false }).limit(500);
  if (docType) query = query.eq('doc_type', docType);
  const { data, error } = await query;
  if (error) console.error('getAllDocuments:', error);
  return data || [];
}

export async function createDocument({ machineId, clientId, docType, docRef, snapshot, total }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('billing_documents')
    .insert({
      user_id: user.id,
      machine_id: machineId,
      client_id: clientId || null,
      doc_type: docType,
      doc_ref: docRef,
      snapshot: snapshot || {},
      total: total ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Merge path — refreshes an existing document's snapshot/total in place,
// keeping its original doc_ref, but archives what it held before into
// `revisions` first so an older version stays regenerable. Done via an RPC
// (not a plain client-side update) since referencing the row's own prior
// snapshot/total in the same write isn't something a REST PATCH can express
// — it needs a single atomic UPDATE ... SET revisions = revisions || ... on
// the server, or a fast merge-twice-in-a-row could still lose a revision.
export async function mergeDocument(id, { snapshot, total, clientId }) {
  const { data, error } = await supabase.rpc('merge_billing_document', {
    p_id: id,
    p_snapshot: snapshot || {},
    p_total: total ?? null,
    p_client_id: clientId || null,
  });
  if (error) throw error;
  return data;
}
