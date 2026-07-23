// Per-seat company billing — step 1 of 2 (see update-seat-subscription for
// step 2). Ensures a Stripe Customer exists for the company and returns a
// SetupIntent client_secret so the frontend can mount Stripe's embedded
// Payment Element directly inside the Billing tab (dark-themed to match the
// app) — deliberately not Stripe Checkout or the hosted Billing Portal, so
// collecting a card never leaves ratbench.net.
//
// Also returns the current seat price's live unit amount/currency (fetched
// from Stripe rather than hardcoded) so the UI never silently drifts out of
// sync with whatever the Price object actually charges.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { initSentry } from "../_shared/sentry.ts";

const Sentry = initSentry("create-billing-setup");
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
      const msg = "create-billing-setup: PRICE_SEAT env var not set — cannot proceed";
      console.error(msg);
      Sentry.captureMessage(msg, "error");
      return new Response(JSON.stringify({ error: "Billing is not configured yet." }), { status: 500, headers: CORS });
    }

    const { company_id } = await req.json();
    if (!company_id) {
      return new Response(JSON.stringify({ error: "Missing company_id" }), { status: 400, headers: CORS });
    }

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: CORS });
    }
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: CORS });
    }

    // Only the company owner manages billing — matches CompanySettings.jsx's
    // existing precedent, where company-level settings/danger-zone actions
    // are already owner-only despite an "isAdmin" variable name.
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
      .select("stripe_customer_id, name, last_billing_action_at")
      .eq("id", company_id)
      .single();

    if (company?.last_billing_action_at) {
      const elapsed = Date.now() - new Date(company.last_billing_action_at).getTime();
      if (elapsed < BILLING_ACTION_COOLDOWN_MS) {
        return new Response(
          JSON.stringify({ error: "Please wait a moment before trying again." }),
          { status: 429, headers: CORS }
        );
      }
    }
    await supabase.rpc("_set_billing_action_at", { p_company_id: company_id });

    let customerId = company?.stripe_customer_id || undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({ name: company?.name, metadata: { company_id } });
      customerId = customer.id;
      await supabase.from("companies").update({ stripe_customer_id: customerId }).eq("id", company_id);
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: "off_session", // reused later for the recurring per-seat subscription
    });

    const price = await stripe.prices.retrieve(PRICE_SEAT);

    return new Response(
      JSON.stringify({
        client_secret: setupIntent.client_secret,
        unit_amount: price.unit_amount,
        currency: price.currency,
      }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-billing-setup error:", err);
    Sentry.captureException(err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: CORS });
  }
});
