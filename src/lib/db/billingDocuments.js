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
// keeping its original doc_ref. Leaves everything else (id, created_at) untouched.
export async function updateDocument(id, patch) {
  const { data, error } = await supabase
    .from('billing_documents')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
