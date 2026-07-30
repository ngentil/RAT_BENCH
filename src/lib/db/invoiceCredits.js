import { supabase } from '../supabase';

// Atomically checks entitlement and consumes one invoice credit for the
// current calendar month (see supabase/invoice_addon_billing.sql). Must be
// called before every action that changes an invoice's total/content —
// first-time generation, "New Copy", AND "Merge into existing" all count,
// since a merge brings in genuinely new billable hours/parts even though it
// reuses the old invoice number. Only Office's "Regenerate PDF" (re-rendering
// an already-stored snapshot with zero content change) never calls this.
export async function checkAndUseInvoiceCredit(companyId) {
  const { data, error } = await supabase.rpc('check_and_use_invoice_credit', { p_company_id: companyId });
  if (error) throw error;
  return data;
}
