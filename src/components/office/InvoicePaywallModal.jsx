import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { ACC, MUT, TXT, RED, btnA, btnG, sm, ovly, mdl, mdlH, mdlB } from '../../lib/styles';
import { createInvoiceAddonSetup, setInvoiceAddonActive } from '../../lib/billing';

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
let stripePromise;
function getStripe() {
  if (!PUBLISHABLE_KEY) return null;
  if (!stripePromise) stripePromise = loadStripe(PUBLISHABLE_KEY);
  return stripePromise;
}

function formatMoney(amount, currency) {
  if (amount == null) return '—';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: (currency || 'usd').toUpperCase() }).format(amount / 100);
}

// Mirrors BillingSection.jsx's PaymentSetup, adapted for the invoice add-on:
// a single fixed-quantity subscription rather than a seat count, and
// setInvoiceAddonActive(true) instead of updateSeatSubscription on submit.
// Exported so BillingSection's own Invoicing section can reuse the same
// Stripe Elements mount/submit flow rather than duplicating it.
export function InvoiceAddonPaymentSetup({ company, onDone, onCancel }) {
  const elementsRef = useRef(null);
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [priceInfo, setPriceInfo] = useState(null);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const setup = await createInvoiceAddonSetup(company.id);
      if (cancelled) return;
      setPriceInfo({ unitAmount: setup.unit_amount, currency: setup.currency });
      const s = await getStripe();
      if (cancelled || !s) return;
      const el = s.elements({
        clientSecret: setup.client_secret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: ACC,
            colorBackground: '#0a0a0a',
            colorText: TXT,
            colorDanger: RED,
            fontFamily: "'IBM Plex Mono', monospace",
            borderRadius: '2px',
          },
        },
      });
      const payment = el.create('payment');
      payment.mount(elementsRef.current);
      setStripe(s);
      setElements(el);
      setReady(true);
    })().catch(e => setErr(e.message || 'Could not load the payment form.'));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company.id]);

  const submit = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true); setErr('');
    try {
      const { error } = await stripe.confirmSetup({ elements, redirect: 'if_required' });
      if (error) throw new Error(error.message);
      await setInvoiceAddonActive(company.id, true);
      onDone();
    } catch (e) {
      setErr(e.message || 'Could not save your payment method.');
    }
    setSubmitting(false);
  };

  return (
    <div>
      {priceInfo && (
        <div style={{ fontSize: 10, color: MUT, marginBottom: 10, lineHeight: 1.7 }}>
          Business Plan × {formatMoney(priceInfo.unitAmount, priceInfo.currency)}/mo
        </div>
      )}
      <div style={{ position: 'relative', marginBottom: 12, minHeight: ready ? 'auto' : 90 }}>
        {!ready && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 10, color: MUT }}>Loading payment form…</span>
          </div>
        )}
        {/* Stripe Elements mounts directly into this node via the DOM API, bypassing
            React — it must never have React-rendered children or reconciliation
            breaks once Stripe's mount replaces this node's contents. */}
        <div ref={elementsRef} />
      </div>
      {err && <div style={{ fontSize: 10, color: RED, marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={submit} disabled={!ready || submitting} style={{ ...btnA, ...sm, opacity: !ready || submitting ? 0.6 : 1 }}>
          {submitting ? 'Saving…' : 'Subscribe & Unlock'}
        </button>
        <button onClick={onCancel} style={{ ...btnG, ...sm }}>Back</button>
      </div>
    </div>
  );
}

// Shown when checkAndUseInvoiceCredit() returns allowed:false — the company
// has used its 5 free invoices this calendar month and has no active add-on.
// Quotes, and every other tab in the app, are completely unaffected by this;
// the copy says so explicitly since that's the whole point of how this gate
// was scoped (see supabase/invoice_addon_billing.sql).
function InvoicePaywallModal({ company, usage, onClose, onUnlocked }) {
  const [showPayment, setShowPayment] = useState(false);

  if (!PUBLISHABLE_KEY) {
    return (
      <div style={ovly} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={mdl}>
          <div style={mdlH}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TXT, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Invoice Limit Reached</div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: MUT, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
          <div style={mdlB}>
            <div style={{ fontSize: 10, color: MUT, lineHeight: 1.7 }}>Billing isn't configured for this deployment yet.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={ovly} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={mdl}>
        <div style={mdlH}>
          <div style={{ fontSize: 11, fontWeight: 700, color: TXT, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {showPayment ? 'Unlock Unlimited Invoices' : 'Free Invoice Limit Reached'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: MUT, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
        <div style={mdlB}>
          {showPayment ? (
            <InvoiceAddonPaymentSetup
              company={company}
              onDone={() => { onUnlocked(); }}
              onCancel={() => setShowPayment(false)}
            />
          ) : (
            <>
              <div style={{ fontSize: 10, color: TXT, lineHeight: 1.7, marginBottom: 12 }}>
                You've used all {usage?.cap ?? 5} free invoices this month for this organisation
                {usage?.used != null ? ` (${usage.used}/${usage.cap ?? 5})` : ''}. Quotes stay free and
                uncapped — this only affects generating or updating an Invoice.
              </div>
              <div style={{ fontSize: 10, color: MUT, lineHeight: 1.7, marginBottom: 16 }}>
                Everything else — Garage, Bench, Workshop, Clients, Revenue, Community, and Quotes — is
                completely unaffected. Your free invoice count resets at the start of next month.
              </div>
              <div style={{ fontSize: 10, color: TXT, lineHeight: 1.7, marginBottom: 16 }}>
                The <span style={{ color: ACC, fontWeight: 700 }}>Business plan</span> ($20/month) unlocks
                unlimited invoice generation for this organisation, plus the full Office suite.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowPayment(true)} style={{ ...btnA, ...sm }}>Upgrade to Business ($20/mo)</button>
                <button onClick={onClose} style={{ ...btnG, ...sm }}>Maybe Later</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default InvoicePaywallModal;
