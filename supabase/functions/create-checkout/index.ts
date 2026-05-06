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
    const { price_id, user_id, company_id, success_url, cancel_url } = await req.json();

    if (!price_id || !user_id) {
      return new Response(JSON.stringify({ error: "Missing price_id or user_id" }), { status: 400, headers: CORS });
    }

    // Get or create Stripe customer
    let customerId: string | undefined;

    if (company_id) {
      const { data: company } = await supabase.from("companies").select("stripe_customer_id, name").eq("id", company_id).single();
      customerId = company?.stripe_customer_id || undefined;
      if (!customerId) {
        const customer = await stripe.customers.create({ name: company?.name, metadata: { company_id } });
        customerId = customer.id;
        await supabase.from("companies").update({ stripe_customer_id: customerId }).eq("id", company_id);
      }
    } else {
      const { data: profile } = await supabase.from("profiles").select("stripe_customer_id, display_name, username").eq("id", user_id).single();
      customerId = profile?.stripe_customer_id || undefined;
      if (!customerId) {
        const customer = await stripe.customers.create({ name: profile?.display_name || profile?.username, metadata: { user_id } });
        customerId = customer.id;
        await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user_id);
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: success_url || "https://www.ratbench.net/?billing=success",
      cancel_url: cancel_url || "https://www.ratbench.net/?billing=cancelled",
      metadata: { user_id, company_id: company_id || "" },
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
});
