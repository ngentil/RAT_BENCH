# Stripe setup — per-seat company billing

This covers the one-time manual setup needed in your own Stripe and Supabase
accounts to turn on per-seat billing. None of this can be done from inside a
coding session — it's dashboard/account-level configuration, not code.

Pricing model: the company owner's own seat is always free. Every other
member of a company (any role) costs **$10/month**. Tracker, Wiki, and
Marketplace stay free for everyone regardless of billing status.

## 1. Create the seat price in Stripe

1. Stripe Dashboard → Product catalog → **Add product**.
2. Name it something like "Rat Bench — Team Seat".
3. Pricing: **Recurring**, **$10.00**, billed **monthly**.
4. Save, then open the price you just created and copy its ID (starts with
   `price_`).

## 2. Set Supabase edge function secrets

These are server-side secrets for the edge functions in
`supabase/functions/` — never client env vars.

```
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set PRICE_SEAT=price_...   # the price ID from step 1
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...   # from step 3 below
```

Use your test-mode secret key (`sk_test_...`) and a test-mode price ID first
if you want to try the flow with Stripe's test cards before going live.

## 3. Deploy the edge functions and wire up the webhook

Deploy the five functions:

```
supabase functions deploy create-billing-setup
supabase functions deploy update-seat-subscription
supabase functions deploy cancel-subscription
supabase functions deploy list-invoices
supabase functions deploy stripe-webhook
```

Then, in the Stripe Dashboard → Developers → Webhooks → **Add endpoint**:

- Endpoint URL: `https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook`
- Events to send: `customer.subscription.created`, `customer.subscription.updated`,
  `customer.subscription.deleted`, `invoice.payment_failed`
- After creating it, copy the **Signing secret** (`whsec_...`) and set it as
  `STRIPE_WEBHOOK_SECRET` (step 2) — redeploy `stripe-webhook` after setting it.

## 4. Set the frontend publishable key

In your deploy environment (Netlify/Vercel/etc.) and in `.env.local` for
local dev:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_or_pk_test_...
```

This is the only Stripe value the frontend ever sees — safe to expose
client-side. Without it, `BillingSection` shows "Billing isn't configured
for this deployment yet." instead of the billing UI.

## 5. Apply the database migration

Run `supabase/company_billing.sql` against your database (Supabase SQL
Editor, or `psql`/`supabase db push`) — adds the `paid_seats`/
`subscription_status`/`last_billing_action_at` columns and the seat-gate
logic in `join_company_by_invite()`.

## Verifying it works

With test-mode keys set, use one of Stripe's test cards
(`4242 4242 4242 4242`, any future expiry, any CVC) in the in-app Payment
Element under Settings → Company → Billing. A successful setup should:

- Create a Stripe Customer + Subscription visible in the Stripe Dashboard.
- Update `companies.paid_seats`/`subscription_status` immediately.
- Allow exactly that many non-owner members to join via the invite code
  before further joins are blocked with a "no seats available" error.
