import { supabase } from './supabase';

// Per-seat company billing. Every call here goes through a Supabase edge
// function (never a direct Stripe call from the browser except the Stripe.js
// Elements confirmation itself, which only ever sees card details — the
// secret key stays server-side). See docs/STRIPE_SETUP.md for the one-time
// Stripe Dashboard configuration this depends on.

async function invoke(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    // Edge functions return a JSON body with `error` on non-2xx — supabase-js
    // surfaces that as error.context in some versions and not others, so
    // fall back to whatever message is available rather than a bare "non-2xx".
    let message = error.message;
    try { const body = await error.context?.json?.(); if (body?.error) message = body.error; } catch { /* ignore */ }
    throw new Error(message || 'Something went wrong. Please try again.');
  }
  return data;
}

// Ensures a Stripe customer exists for the company and returns a SetupIntent
// client_secret for mounting the embedded Payment Element, plus the live
// per-seat price (so the UI never shows a stale hardcoded number).
export function createBillingSetup(companyId) {
  return invoke('create-billing-setup', { company_id: companyId });
}

// Sets the company's total desired paid-seat count — creates the
// subscription on first use, updates its quantity thereafter.
export function updateSeatSubscription(companyId, seats) {
  return invoke('update-seat-subscription', { company_id: companyId, seats });
}

export function listInvoices(companyId) {
  return invoke('list-invoices', { company_id: companyId }).then(d => d?.invoices || []);
}

// cancel=true schedules cancellation at period end; cancel=false undoes a
// pending cancellation (resumes normal renewal) before the period ends.
export function setSubscriptionCancellation(companyId, cancel) {
  return invoke('cancel-subscription', { company_id: companyId, cancel });
}
