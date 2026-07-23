// Keeps companies.paid_seats / subscription_status / stripe_subscription_id
// in sync for lifecycle events not directly triggered through our own
// update-seat-subscription calls — a renewal, a failed payment, or a
// cancellation/refund done from the Stripe Dashboard directly. This is the
// reconciliation backstop, not the primary write path (update-seat-subscription
// already writes optimistically on its own synchronous Stripe API response).
//
// Deliberately does NOT remove any existing company_members on payment
// failure or cancellation — losing access to people you've already added is
// a much harsher, more surprising outcome than just being unable to add more
// until the subscription is current again. The join_company_by_invite() seat
// gate already stops NEW joins once paid_seats reflects the lapsed state.
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

serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, sig!, Deno.env.get("STRIPE_WEBHOOK_SECRET")!);
  } catch (err) {
    console.error("Signature error:", err.message);
    // Not captured to Sentry — fires on every replay/probe attempt, which
    // would be noisy for something that isn't actually an app-side bug.
    return new Response("Webhook signature verification failed.", { status: 400 });
  }

  try {
    const obj = event.data.object as any;

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
      const sub = obj as Stripe.Subscription;
      const customerId = sub.customer as string;
      const quantity = sub.items.data[0]?.quantity ?? 0;

      await supabase.from("companies").update({
        paid_seats: ["active", "trialing", "past_due"].includes(sub.status) ? quantity : 0,
        subscription_status: sub.status,
        stripe_subscription_id: sub.id,
      }).eq("stripe_customer_id", customerId);

    } else if (event.type === "customer.subscription.deleted") {
      const sub = obj as Stripe.Subscription;
      const customerId = sub.customer as string;

      await supabase.from("companies").update({
        paid_seats: 0,
        subscription_status: "canceled",
        stripe_subscription_id: null,
      }).eq("stripe_customer_id", customerId);

    } else if (event.type === "invoice.payment_failed") {
      const customerId = obj.customer as string;
      // Seats stay as-is — Stripe's own retry/dunning schedule decides when
      // (or if) this actually becomes customer.subscription.deleted.
      await supabase.from("companies").update({ subscription_status: "past_due" }).eq("stripe_customer_id", customerId);
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
