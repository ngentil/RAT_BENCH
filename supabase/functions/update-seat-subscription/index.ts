// Per-seat company billing — step 2 (after create-billing-setup has attached
// a payment method via the embedded Payment Element). The owner picks a
// desired total paid-seat count; this creates the subscription on first use
// or updates its quantity thereafter (Stripe prorates automatically).
//
// paid_seats/subscription_status are written here directly (service role,
// same as the webhook) right after Stripe confirms the change, so the UI
// reflects it immediately rather than waiting on the webhook round-trip —
// the webhook remains the backstop for anything not triggered through this
// function (a renewal, a failed payment, a dashboard-side cancellation).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { initSentry } from "../_shared/sentry.ts";

const Sentry = initSentry("update-seat-subscription");
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const PRICE_SEAT = Deno.env.get("PRICE_SEAT");

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
    if (!PRICE_SEAT) {
      const msg = "update-seat-subscription: PRICE_SEAT env var not set — cannot proceed";
      console.error(msg);
      Sentry.captureMessage(msg, "error");
      return new Response(JSON.stringify({ error: "Billing is not configured yet." }), { status: 500, headers: CORS });
    }

    const { company_id, seats } = await req.json();
    if (!company_id || !Number.isInteger(seats) || seats < 0) {
      return new Response(JSON.stringify({ error: "Missing company_id or invalid seats count" }), { status: 400, headers: CORS });
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
      .select("stripe_customer_id, stripe_subscription_id, last_billing_action_at")
      .eq("id", company_id)
      .single();

    if (!company?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: "Add a payment method before setting a seat count" }), { status: 400, headers: CORS });
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

    // Never let the seat count drop below how many non-owner members are
    // actually already using one — that would silently strand them with no
    // corresponding paid seat rather than any of them losing access.
    const { data: seatsInUse } = await supabase.rpc("_paid_seats_in_use", { p_company_id: company_id });
    if (seats < (seatsInUse || 0)) {
      return new Response(
        JSON.stringify({ error: `You have ${seatsInUse} member(s) using seats — remove some first, or choose ${seatsInUse} or more.` }),
        { status: 409, headers: CORS }
      );
    }

    await supabase.rpc("_set_billing_action_at", { p_company_id: company_id });

    let subscriptionStatus = "inactive";
    let subscriptionId = company.stripe_subscription_id;

    if (seats === 0) {
      if (subscriptionId) {
        const canceled = await stripe.subscriptions.cancel(subscriptionId);
        subscriptionStatus = canceled.status;
        subscriptionId = null;
      }
    } else if (!subscriptionId) {
      // The SetupIntent from create-billing-setup attaches a payment method
      // to the customer but doesn't make it the *default* one Stripe uses
      // for subscription billing — set it explicitly, picking the most
      // recently attached card if the customer doesn't have a default yet.
      const customer = await stripe.customers.retrieve(company.stripe_customer_id) as Stripe.Customer;
      let defaultPm = customer.invoice_settings?.default_payment_method as string | undefined;
      if (!defaultPm) {
        const pms = await stripe.paymentMethods.list({ customer: company.stripe_customer_id, type: "card" });
        const latest = pms.data.sort((a, b) => b.created - a.created)[0];
        if (!latest) {
          return new Response(JSON.stringify({ error: "Add a payment method before setting a seat count" }), { status: 400, headers: CORS });
        }
        defaultPm = latest.id;
        await stripe.customers.update(company.stripe_customer_id, { invoice_settings: { default_payment_method: defaultPm } });
      }

      const sub = await stripe.subscriptions.create({
        customer: company.stripe_customer_id,
        items: [{ price: PRICE_SEAT, quantity: seats }],
        default_payment_method: defaultPm,
      });
      subscriptionId = sub.id;
      subscriptionStatus = sub.status;
    } else {
      const existing = await stripe.subscriptions.retrieve(subscriptionId);
      const updated = await stripe.subscriptions.update(subscriptionId, {
        items: [{ id: existing.items.data[0].id, quantity: seats }],
        proration_behavior: "create_prorations",
      });
      subscriptionStatus = updated.status;
    }

    await supabase.from("companies").update({
      paid_seats: seats,
      subscription_status: subscriptionStatus,
      stripe_subscription_id: subscriptionId,
    }).eq("id", company_id);

    return new Response(
      JSON.stringify({ paid_seats: seats, subscription_status: subscriptionStatus }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("update-seat-subscription error:", err);
    Sentry.captureException(err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: CORS });
  }
});
