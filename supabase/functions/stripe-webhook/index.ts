import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const PRICE_TO_TIER: Record<string, string> = {
  [Deno.env.get("PRICE_ENTHUSIAST_MONTHLY") || ""]: "enthusiast",
  [Deno.env.get("PRICE_ENTHUSIAST_YEARLY")  || ""]: "enthusiast",
  [Deno.env.get("PRICE_TEAM")               || ""]: "team",
  [Deno.env.get("PRICE_BUSINESS")           || ""]: "business",
};

serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, sig!, Deno.env.get("STRIPE_WEBHOOK_SECRET")!);
  } catch (err) {
    console.error("Signature error:", err.message);
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  const obj = event.data.object as any;

  if (event.type === "checkout.session.completed") {
    const session = obj as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const companyId = session.metadata?.company_id;
    const customerId = session.customer as string;

    if (session.mode === "subscription") {
      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = sub.items.data[0].price.id;
      const tier = PRICE_TO_TIER[priceId] || "free";

      if (userId) {
        await supabase.from("profiles").update({
          stripe_customer_id: customerId,
          tier,
          stripe_subscription_id: sub.id,
        }).eq("id", userId);
      } else if (companyId) {
        await supabase.from("companies").update({
          stripe_customer_id: customerId,
          tier,
          stripe_subscription_id: sub.id,
        }).eq("id", companyId);
      }
    }
  } else if (event.type === "customer.subscription.updated") {
    const sub = obj as Stripe.Subscription;
    const priceId = sub.items.data[0].price.id;
    const tier = PRICE_TO_TIER[priceId] || "free";
    const customerId = sub.customer as string;
    await supabase.from("profiles").update({ tier, stripe_subscription_id: sub.id }).eq("stripe_customer_id", customerId);
    await supabase.from("companies").update({ tier, stripe_subscription_id: sub.id }).eq("stripe_customer_id", customerId);
  } else if (event.type === "customer.subscription.deleted" || event.type === "invoice.payment_failed") {
    const customerId = obj.customer as string;
    await supabase.from("profiles").update({ tier: "free", stripe_subscription_id: null }).eq("stripe_customer_id", customerId);
    await supabase.from("companies").update({ tier: "free", stripe_subscription_id: null }).eq("stripe_customer_id", customerId);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
