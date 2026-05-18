import { supabase } from '../supabase';

export async function getNextInvoiceNumber(userId) {
  try {
    const { data, error } = await supabase.rpc('next_invoice_number', { p_user_id: userId });
    if (error) throw error;
    return data;
  } catch {
    console.warn('[invoices] RPC unavailable — using local fallback. Invoice numbers may not be unique across devices.');
    const key = `rat_inv_seq_${userId}`;
    const n = (parseInt(localStorage.getItem(key) || '0') || 0) + 1;
    localStorage.setItem(key, String(n));
    return `INV-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`;
  }
}
