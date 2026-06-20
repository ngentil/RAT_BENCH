import { supabase } from '../supabase';

export async function getNextInvoiceNumber(userId) {
  const { data, error } = await supabase.rpc('next_invoice_number', { p_user_id: userId });
  if (error) throw error;
  return data;
}
