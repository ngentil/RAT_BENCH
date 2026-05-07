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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { user_id, company_id, return_url } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "Missing user_id" }), { status: 400, headers: CORS });
    }

    let customerId: string | null = null;

    if (company_id) {
      const { data } = await supabase.from("companies").select("stripe_customer_id").eq("id", company_id).single();
      customerId = data?.stripe_customer_id ?? null;
    }

    if (!customerId) {
      const { data } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user_id).single();
      customerId = data?.stripe_customer_id ?? null;
    }

    if (!customerId) {
      return new Response(JSON.stringify({ error: "No billing account found" }), { status: 404, headers: CORS });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: return_url || "https://www.ratbench.net/",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
});
