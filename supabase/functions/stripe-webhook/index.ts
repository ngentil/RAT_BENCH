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

async function setTier(customerId: string, tier: string, subscriptionId: string) {
  // Try profile first, then company
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (profile) {
    await supabase.from("profiles").update({ tier, stripe_subscription_id: subscriptionId }).eq("id", profile.id);
    return;
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (company) {
    await supabase.from("companies").update({ tier, stripe_subscription_id: subscriptionId }).eq("id", company.id);
  }
}

async function clearTier(customerId: string) {
  await supabase.from("profiles").update({ tier: "free", stripe_subscription_id: null }).eq("stripe_customer_id", customerId);
  await supabase.from("companies").update({ tier: "free", stripe_subscription_id: null }).eq("stripe_customer_id", customerId);
}

serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, Deno.env.get("STRIPE_WEBHOOK_SECRET")!);
  } catch (err) {
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  const obj = event.data.object as any;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = obj as Stripe.Checkout.Session;
      if (session.mode === "subscription") {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = sub.items.data[0].price.id;
        const tier = PRICE_TO_TIER[priceId] || "free";
        // Store customer id on profile/company
        const userId = session.metadata?.user_id;
        const companyId = session.metadata?.company_id;
        if (userId) {
          await supabase.from("profiles").update({ stripe_customer_id: session.customer as string }).eq("id", userId);
        }
        if (companyId) {
          await supabase.from("companies").update({ stripe_customer_id: session.customer as string }).eq("id", companyId);
        }
        await setTier(session.customer as string, tier, sub.id);
      }
      break;
    }
    case "customer.subscription.updated": {
      const sub = obj as Stripe.Subscription;
      const priceId = sub.items.data[0].price.id;
      const tier = PRICE_TO_TIER[priceId] || "free";
      await setTier(sub.customer as string, tier, sub.id);
      break;
    }
    case "customer.subscription.deleted": {
      await clearTier(obj.customer as string);
      break;
    }
    case "invoice.payment_failed": {
      // Optionally downgrade to free on payment failure
      await clearTier(obj.customer as string);
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
