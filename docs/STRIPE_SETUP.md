# Stripe setup — per-seat company billing + invoice add-on

This covers the one-time manual setup needed in your own Stripe and Supabase
accounts to turn on per-seat billing and the invoice add-on. None of this can
be done from inside a coding session — it's dashboard/account-level
configuration, not code.

Pricing model: the company owner's own seat is always free. Every other
member of a company (any role) costs **$10/month**. Garage, Bench, Workshop,
Clients, Revenue, Community, and Quotes stay free for everyone regardless of
billing status — Quotes never require a company and are never capped.
Invoices require a company to exist and are capped at **5 free per company
per calendar month**; the separate **Invoice Add-on** at **$20/month**
unlocks unlimited invoice generation for that company. A company can have
both subscriptions active at once, or just one, or neither.

## 1. Create the prices in Stripe

1. Stripe Dashboard → Product catalog → **Add product**.
2. Name it something like "Rat Bench — Team Seat".
3. Pricing: **Recurring**, **$10.00**, billed **monthly**.
4. Save, then open the price you just created and copy its ID (starts with
   `price_`).
5. Repeat for a second product, e.g. "Rat Bench — Invoice Add-on", **$20.00**,
   billed **monthly**, and copy its price ID too.

## 2. Set Supabase edge function secrets

These are server-side secrets for the edge functions in
`supabase/functions/` — never client env vars.

```
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set PRICE_SEAT=price_...            # the seat price ID from step 1
supabase secrets set PRICE_INVOICE_ADDON=price_...   # the invoice add-on price ID from step 1
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...   # from step 3 below
```

Use your test-mode secret key (`sk_test_...`) and test-mode price IDs first if
you want to try the flow with Stripe's test cards before going live.

## 3. Deploy the edge functions and wire up the webhook

Deploy the six functions:

```
supabase functions deploy create-billing-setup
supabase functions deploy update-seat-subscription
supabase functions deploy update-invoice-addon
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

The same webhook endpoint handles both the seat subscription and the invoice
add-on subscription — it routes each event by comparing the subscription's
price ID against `PRICE_SEAT`/`PRICE_INVOICE_ADDON`, since a company can have
both active at once under the same Stripe Customer.

## 4. Set the frontend publishable key

In your deploy environment (Netlify/Vercel/etc.) and in `.env.local` for
local dev:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_or_pk_test_...
```

This is the only Stripe value the frontend ever sees — safe to expose
client-side. Without it, `BillingSection` shows "Billing isn't configured
for this deployment yet." instead of the billing UI (both the seat and
invoicing sections).

## 5. Apply the database migrations

Run against your database (Supabase SQL Editor, or `psql`/`supabase db push`):

- `supabase/company_billing.sql` — adds the `paid_seats`/`subscription_status`/
  `last_billing_action_at` columns and the seat-gate logic in
  `join_company_by_invite()`.
- `supabase/invoice_addon_billing.sql` — adds `invoice_addon_status`/
  `invoice_addon_subscription_id`/`invoice_usage` columns and the
  `check_and_use_invoice_credit()` RPC that enforces the 5-free-per-month cap.

## Verifying it works

With test-mode keys set, use one of Stripe's test cards
(`4242 4242 4242 4242`, any future expiry, any CVC) in the in-app Payment
Element under Settings → Company → Billing. A successful seat setup should:

- Create a Stripe Customer + Subscription visible in the Stripe Dashboard.
- Update `companies.paid_seats`/`subscription_status` immediately.
- Allow exactly that many non-owner members to join via the invite code
  before further joins are blocked with a "no seats available" error.

For the invoice add-on, the same Settings → Company → Billing → Invoicing
section should let you enable it with a test card and immediately show
"Unlimited" instead of "X/5" — and generating a 6th invoice in the same month
for a company without the add-on should show the in-app paywall instead of a
PDF.
