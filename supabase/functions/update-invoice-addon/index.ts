// Invoice add-on billing — a simple on/off toggle rather than a quantity
// (unlike per-seat billing, there's only ever one unit of this per company).
// Requires create-billing-setup(product:"invoice_addon") to have already
// attached a payment method.
//
// active:true creates the subscription on first use, or un-cancels it if a
// prior cancellation was still pending at period end (Stripe's own
// cancel_at_period_end:false semantics — same resume trick cancel-subscription
// uses for seats). active:false cancels at period end, not immediately, so
// the company keeps unlimited invoices through what they've already paid for
// — mirrors cancel-subscription's non-immediate cancellation for seats.
//
// invoice_addon_status/invoice_addon_subscription_id are written here
// directly right after Stripe confirms, same optimistic-write-then-webhook-
// backstop pattern as update-seat-subscription.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { initSentry } from "../_shared/sentry.ts";

const Sentry = initSentry("update-invoice-addon");
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const PRICE_INVOICE_ADDON = Deno.env.get("PRICE_INVOICE_ADDON");

const ALLOWED_ORIGINS = ["https://www.ratbench.net", "https://ratbench.net"];
const BILLING_ACTION_COOLDOWN_MS = 5_000;

function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

serve(async (req) => {
  const CORS = corsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    if (!PRICE_INVOICE_ADDON) {
      const msg = "update-invoice-addon: PRICE_INVOICE_ADDON env var not set — cannot proceed";
      console.error(msg);
      Sentry.captureMessage(msg, "error");
      return new Response(JSON.stringify({ error: "Billing is not configured yet." }), { status: 500, headers: CORS });
    }

    const { company_id, active } = await req.json();
    if (!company_id || typeof active !== "boolean") {
      return new Response(JSON.stringify({ error: "Missing company_id or invalid active flag" }), { status: 400, headers: CORS });
    }

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: CORS });
    }
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: CORS });
    }

    const { data: membership } = await supabase
      .from("company_members")
      .select("role")
      .eq("company_id", company_id)
      .eq("user_id", user.id)
      .single();
    if (!membership || membership.role !== "owner") {
      return new Response(JSON.stringify({ error: "Only the company owner can manage billing" }), { status: 403, headers: CORS });
    }

    const { data: company } = await supabase
      .from("companies")
      .select("stripe_customer_id, invoice_addon_subscription_id, last_billing_action_at")
      .eq("id", company_id)
      .single();

    if (!company?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: "Add a payment method before enabling the invoice add-on" }), { status: 400, headers: CORS });
    }

    if (company.last_billing_action_at) {
      const elapsed = Date.now() - new Date(company.last_billing_action_at).getTime();
      if (elapsed < BILLING_ACTION_COOLDOWN_MS) {
        return new Response(
          JSON.stringify({ error: "Please wait a moment before trying again." }),
          { status: 429, headers: CORS }
        );
      }
    }
    await supabase.rpc("_set_billing_action_at", { p_company_id: company_id });

    let subscriptionStatus = "inactive";
    let subscriptionId = company.invoice_addon_subscription_id;
    let cancelAtPeriodEnd = false;

    if (!active) {
      if (subscriptionId) {
        const updated = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
        subscriptionStatus = updated.status;
        cancelAtPeriodEnd = updated.cancel_at_period_end;
      }
    } else if (!subscriptionId) {
      // Same default-payment-method resolution as update-seat-subscription —
      // the SetupIntent attaches a payment method but doesn't make it the
      // customer's default for subscription billing.
      const customer = await stripe.customers.retrieve(company.stripe_customer_id) as Stripe.Customer;
      let defaultPm = customer.invoice_settings?.default_payment_method as string | undefined;
      if (!defaultPm) {
        const pms = await stripe.paymentMethods.list({ customer: company.stripe_customer_id, type: "card" });
        const latest = pms.data.sort((a, b) => b.created - a.created)[0];
        if (!latest) {
          return new Response(JSON.stringify({ error: "Add a payment method before enabling the invoice add-on" }), { status: 400, headers: CORS });
        }
        defaultPm = latest.id;
        await stripe.customers.update(company.stripe_customer_id, { invoice_settings: { default_payment_method: defaultPm } });
      }

      const sub = await stripe.subscriptions.create({
        customer: company.stripe_customer_id,
        items: [{ price: PRICE_INVOICE_ADDON, quantity: 1 }],
        default_payment_method: defaultPm,
      });
      subscriptionId = sub.id;
      subscriptionStatus = sub.status;
    } else {
      // Already has a subscription — this is a resume after a pending
      // period-end cancellation (Stripe's own un-cancel semantics).
      const updated = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false });
      subscriptionStatus = updated.status;
      cancelAtPeriodEnd = updated.cancel_at_period_end;
    }

    await supabase.from("companies").update({
      invoice_addon_status: subscriptionStatus,
      invoice_addon_subscription_id: subscriptionId,
    }).eq("id", company_id);

    return new Response(
      JSON.stringify({ invoice_addon_status: subscriptionStatus, cancel_at_period_end: cancelAtPeriodEnd }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("update-invoice-addon error:", err);
    Sentry.captureException(err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: CORS });
  }
});
