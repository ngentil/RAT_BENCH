import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PORTAL_COOLDOWN_MS = 30_000;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { user_id, company_id, return_url } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "Missing user_id" }), { status: 400, headers: CORS });
    }

    // Verify the caller is who they claim to be
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: CORS });
    }
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: CORS });
    }
    if (user.id !== user_id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: CORS });
    }

    // If billing for a company, verify the caller is a member
    if (company_id) {
      const { data: membership } = await supabase
        .from("company_members")
        .select("user_id")
        .eq("company_id", company_id)
        .eq("user_id", user_id)
        .single();
      if (!membership) {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: CORS });
      }
    }

    // Fetch profile once for rate-limit check and stripe_customer_id
    const { data: profData } = await supabase
      .from("profiles")
      .select("preferences, stripe_customer_id")
      .eq("id", user_id)
      .single();

    const prefs = (profData?.preferences as Record<string, string>) ?? {};
    const lastPortal = prefs.last_portal_session_at;
    if (lastPortal && Date.now() - new Date(lastPortal).getTime() < PORTAL_COOLDOWN_MS) {
      return new Response(
        JSON.stringify({ error: "Too many requests — please wait before retrying" }),
        { status: 429, headers: CORS }
      );
    }

    let customerId: string | null = null;

    if (company_id) {
      const { data: co } = await supabase.from("companies").select("stripe_customer_id").eq("id", company_id).single();
      customerId = co?.stripe_customer_id ?? null;
    }

    if (!customerId) {
      customerId = profData?.stripe_customer_id ?? null;
    }

    if (!customerId) {
      return new Response(JSON.stringify({ error: "No billing account found" }), { status: 404, headers: CORS });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: return_url || "https://www.ratbench.net/",
    });

    // Stamp last portal session time to rate-limit repeated calls
    await supabase.from("profiles").update({
      preferences: { ...prefs, last_portal_session_at: new Date().toISOString() },
    }).eq("id", user_id);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
});
