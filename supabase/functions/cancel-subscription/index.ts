// Cancels (or un-cancels) a company's per-seat subscription at the end of
// the current billing period — not immediately — so the owner keeps access
// to what they've already paid for through the cycle. Toggling `cancel:
// false` on a subscription still pending period-end cancellation resumes it
// (Stripe's own semantics for cancel_at_period_end), so a change of mind
// before the period ends doesn't need a brand new subscription.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { initSentry } from "../_shared/sentry.ts";

const Sentry = initSentry("cancel-subscription");
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
    const { company_id, cancel = true } = await req.json();
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
      return new Response(JSON.stringify({ error: "Only the company owner can manage billing" }), { status: 403, headers: CORS });
    }

    const { data: company } = await supabase
      .from("companies")
      .select("stripe_subscription_id")
      .eq("id", company_id)
      .single();

    if (!company?.stripe_subscription_id) {
      return new Response(JSON.stringify({ error: "No active subscription to cancel" }), { status: 400, headers: CORS });
    }

    const sub = await stripe.subscriptions.update(company.stripe_subscription_id, {
      cancel_at_period_end: !!cancel,
    });

    await supabase.from("companies").update({ subscription_status: sub.status }).eq("id", company_id);

    return new Response(
      JSON.stringify({ cancel_at_period_end: sub.cancel_at_period_end, current_period_end: sub.current_period_end }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("cancel-subscription error:", err);
    Sentry.captureException(err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: CORS });
  }
});
