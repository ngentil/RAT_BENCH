import { supabase } from '../supabase';

export async function getNextInvoiceNumber(userId) {
  try {
    const { data, error } = await supabase.rpc('next_invoice_number', { p_user_id: userId });
    if (error) throw error;
    return data;
  } catch (e) {
    // Fallback: timestamp-based suffix so invoices still export if the RPC is
    // unavailable — unlike a random 4-digit suffix this can't collide with a
    // previously issued number.
    console.error('next_invoice_number RPC failed — using timestamp fallback:', e);
    const y = new Date().getFullYear();
    return `INV-${y}-T${Date.now().toString(36).toUpperCase()}`;
  }
}
