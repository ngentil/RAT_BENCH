// Keeps companies.paid_seats / subscription_status / stripe_subscription_id
// (and, for the invoice add-on, invoice_addon_status / invoice_addon_subscription_id)
// in sync for lifecycle events not directly triggered through our own
// update-seat-subscription / update-invoice-addon calls — a renewal, a
// failed payment, or a cancellation/refund done from the Stripe Dashboard
// directly. This is the reconciliation backstop, not the primary write path
// (both edge functions already write optimistically on their own synchronous
// Stripe API response).
//
// A company can have both a seat subscription and an invoice add-on
// subscription active at once, sharing one stripe_customer_id — so events
// are routed by comparing the subscription's price id against PRICE_SEAT /
// PRICE_INVOICE_ADDON, not just matched by customer, to make sure the right
// pair of columns gets updated.
//
// Deliberately does NOT remove any existing company_members on payment
// failure or cancellation — losing access to people you've already added is
// a much harsher, more surprising outcome than just being unable to add more
// until the subscription is current again. The join_company_by_invite() seat
// gate already stops NEW joins once paid_seats reflects the lapsed state.
// Likewise, a lapsed invoice add-on just lets the monthly cap start applying
// again — it never deletes anything already generated.
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
const PRICE_SEAT = Deno.env.get("PRICE_SEAT");
const PRICE_INVOICE_ADDON = Deno.env.get("PRICE_INVOICE_ADDON");

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
      const priceId = sub.items.data[0]?.price?.id;
      const quantity = sub.items.data[0]?.quantity ?? 0;

      if (priceId === PRICE_INVOICE_ADDON) {
        await supabase.from("companies").update({
          invoice_addon_status: sub.status,
          invoice_addon_subscription_id: sub.id,
        }).eq("stripe_customer_id", customerId);
      } else {
        // Default to the seat subscription — matches the pre-existing
        // behavior for anything that isn't recognized as the invoice add-on.
        await supabase.from("companies").update({
          paid_seats: ["active", "trialing", "past_due"].includes(sub.status) ? quantity : 0,
          subscription_status: sub.status,
          stripe_subscription_id: sub.id,
        }).eq("stripe_customer_id", customerId);
      }

    } else if (event.type === "customer.subscription.deleted") {
      const sub = obj as Stripe.Subscription;
      const customerId = sub.customer as string;
      const priceId = sub.items.data[0]?.price?.id;

      if (priceId === PRICE_INVOICE_ADDON) {
        await supabase.from("companies").update({
          invoice_addon_status: "canceled",
          invoice_addon_subscription_id: null,
        }).eq("stripe_customer_id", customerId);
      } else {
        await supabase.from("companies").update({
          paid_seats: 0,
          subscription_status: "canceled",
          stripe_subscription_id: null,
        }).eq("stripe_customer_id", customerId);
      }

    } else if (event.type === "invoice.payment_failed") {
      const customerId = obj.customer as string;
      const priceId = obj.lines?.data?.[0]?.price?.id;
      // Seats/add-on both stay as-is otherwise — Stripe's own retry/dunning
      // schedule decides when (or if) this actually becomes
      // customer.subscription.deleted.
      if (priceId === PRICE_INVOICE_ADDON) {
        await supabase.from("companies").update({ invoice_addon_status: "past_due" }).eq("stripe_customer_id", customerId);
      } else {
        await supabase.from("companies").update({ subscription_status: "past_due" }).eq("stripe_customer_id", customerId);
      }
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
