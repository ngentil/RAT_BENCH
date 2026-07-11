import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { initSentry } from "../_shared/sentry.ts";

const Sentry = initSentry("stripe-webhook");
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Weekly/monthly/annual are all the same single paid "Member" tier — just a
// different billing cadence — so all three map to "enthusiast". PRICE_PRO is
// kept mapped to "business" (rather than removed) purely so existing
// Business subscribers' renewal events keep resolving to a known tier
// instead of falling through to the "unmapped price → free" branch below.
const PRICE_TO_TIER: Record<string, string> = {
  [Deno.env.get("PRICE_ENTHUSIAST")         || ""]: "enthusiast",
  [Deno.env.get("PRICE_ENTHUSIAST_MONTHLY") || ""]: "enthusiast",
  [Deno.env.get("PRICE_ENTHUSIAST_ANNUAL")  || ""]: "enthusiast",
  [Deno.env.get("PRICE_PRO")                || ""]: "business",
};

serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, sig!, Deno.env.get("STRIPE_WEBHOOK_SECRET")!);
  } catch (err) {
    console.error("Signature error:", err.message);
    // Deliberately not captured as an exception — this fires on every replay
    // attempt / bad actor probe, which would be noisy. A signature failure on
    // an event Stripe itself sent (vs. a forged request) is rare enough that
    // if it matters, the surrounding pattern of 400s in Stripe's own webhook
    // logs is the better place to notice it.
    return new Response("Webhook signature verification failed.", { status: 400 });
  }

  // Everything past signature verification is a real Stripe event — an
  // unhandled failure here (e.g. a Supabase update failing) means a customer
  // paid and their tier silently never updated, so this whole block reports
  // to Sentry rather than only console.error-ing into a log nobody's watching.
  try {
    const obj = event.data.object as any;

    if (event.type === "checkout.session.completed") {
      const session = obj as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const companyId = session.metadata?.company_id;
      const customerId = session.customer as string;

      if (session.mode === "subscription") {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = sub.items.data[0].price.id;
        if (!(priceId in PRICE_TO_TIER)) {
          const msg = `[stripe-webhook] Unknown price ID: ${priceId} — defaulting to free. Check PRICE_ENTHUSIAST / PRICE_PRO env vars.`;
          console.error(msg);
          Sentry.captureMessage(msg, "error");
        }
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
      const customerId = sub.customer as string;

      if (sub.status === "active" || sub.status === "trialing") {
        const priceId = sub.items.data[0].price.id;
        if (!(priceId in PRICE_TO_TIER)) {
          const msg = `[stripe-webhook] Unknown price ID: ${priceId} — defaulting to free. Check PRICE_ENTHUSIAST / PRICE_PRO env vars.`;
          console.error(msg);
          Sentry.captureMessage(msg, "error");
        }
        const tier = PRICE_TO_TIER[priceId] || "free";
        await supabase.from("profiles").update({ tier, stripe_subscription_id: sub.id }).eq("stripe_customer_id", customerId);
        await supabase.from("companies").update({ tier, stripe_subscription_id: sub.id }).eq("stripe_customer_id", customerId);
      } else {
        // past_due, incomplete, unpaid, paused → downgrade immediately
        await supabase.from("profiles").update({ tier: "free" }).eq("stripe_customer_id", customerId);
        await supabase.from("companies").update({ tier: "free" }).eq("stripe_customer_id", customerId);
      }
    } else if (event.type === "customer.subscription.deleted" || event.type === "invoice.payment_failed") {
      const customerId = obj.customer as string;
      await supabase.from("profiles").update({ tier: "free", stripe_subscription_id: null }).eq("stripe_customer_id", customerId);
      await supabase.from("companies").update({ tier: "free", stripe_subscription_id: null }).eq("stripe_customer_id", customerId);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error("stripe-webhook error:", err);
    Sentry.captureException(err, { extra: { eventType: event.type, eventId: event.id } });
    // Non-2xx tells Stripe to retry the event later rather than treating a
    // one-off DB hiccup as permanently processed and never trying again.
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
});
