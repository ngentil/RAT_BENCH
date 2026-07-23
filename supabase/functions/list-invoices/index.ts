// Returns recent invoices for a company's Stripe customer, for the in-app
// Billing history list — the only Stripe-hosted link involved is each
// invoice's own PDF/receipt (hosted_invoice_url), which is the normal,
// expected place a receipt link goes; everything else about billing stays
// in-app.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { initSentry } from "../_shared/sentry.ts";

const Sentry = initSentry("list-invoices");
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const ALLOWED_ORIGINS = ["https://www.ratbench.net", "https://ratbench.net"];

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

    const { data: membership } = await supabase
      .from("company_members")
      .select("role")
      .eq("company_id", company_id)
      .eq("user_id", user.id)
      .single();
    if (!membership || membership.role !== "owner") {
      return new Response(JSON.stringify({ error: "Only the company owner can view billing" }), { status: 403, headers: CORS });
    }

    const { data: company } = await supabase
      .from("companies")
      .select("stripe_customer_id")
      .eq("id", company_id)
      .single();

    if (!company?.stripe_customer_id) {
      return new Response(JSON.stringify({ invoices: [] }), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const invoices = await stripe.invoices.list({ customer: company.stripe_customer_id, limit: 24 });

    return new Response(
      JSON.stringify({
        invoices: invoices.data.map(inv => ({
          id: inv.id,
          created: inv.created,
          amount_paid: inv.amount_paid,
          currency: inv.currency,
          status: inv.status,
          hosted_invoice_url: inv.hosted_invoice_url,
        })),
      }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("list-invoices error:", err);
    Sentry.captureException(err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: CORS });
  }
});
