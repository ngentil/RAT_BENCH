import { supabase } from '../supabase';

export async function getNextInvoiceNumber(userId) {
  try {
    const { data, error } = await supabase.rpc('next_invoice_number', { p_user_id: userId });
    if (error) throw error;
    return data;
  } catch {
    // Fallback: year + random suffix so invoices still export if RPC is unavailable
    const y = new Date().getFullYear();
    return `INV-${y}-${Math.floor(Math.random() * 9000 + 1000)}`;
  }
}
