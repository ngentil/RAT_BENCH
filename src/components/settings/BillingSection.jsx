import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { ACC, MUT, BRD, TXT, GRN, RED, btnA, btnG, sm } from '../../lib/styles';
import { getCompanyMembers } from '../../lib/db';
import { createBillingSetup, updateSeatSubscription, listInvoices, setSubscriptionCancellation } from '../../lib/billing';

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

// Every non-owner member of the org uses one paid seat — the owner's own
// membership never counts, matching join_company_by_invite()'s server-side
// rule (see supabase/company_billing.sql). A typed number + quick +N chips
// let an owner jump straight to e.g. 10 or 30 seats instead of clicking a
// +/- stepper that many times — the +/- stays for one-off nudges.
function SeatStepper({ value, onChange, min, quickAdds }) {
  const [text, setText] = useState(String(value));
  useEffect(() => { setText(String(value)); }, [value]);

  const commit = () => {
    const n = parseInt(text, 10);
    const clamped = Math.max(min, Number.isFinite(n) ? n : min);
    setText(String(clamped));
    if (clamped !== value) onChange(clamped);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} style={{ ...btnG, ...sm, opacity: value <= min ? 0.4 : 1 }}>−</button>
        <input
          type="number"
          inputMode="numeric"
          min={min}
          value={text}
          onChange={e => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
          style={{
            width: 56, textAlign: 'center', fontSize: 18, fontWeight: 700, color: TXT,
            fontFamily: "'IBM Plex Mono',monospace", background: '#0d0d0d', border: '1px solid #333',
            borderRadius: 2, padding: '4px 2px',
          }}
        />
        <button type="button" onClick={() => onChange(value + 1)} style={{ ...btnG, ...sm }}>+</button>
      </div>
      {quickAdds?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {quickAdds.map(n => (
            <button key={n} type="button" onClick={() => onChange(value + n)} style={{ ...btnG, ...sm, fontSize: 8, padding: '3px 8px' }}>
              +{n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// One createBillingSetup() call provides the SetupIntent client_secret AND
// the live per-seat price in the same response — deliberately not split
// into two calls, since create-billing-setup is rate-limited server-side
// (see supabase/company_billing.sql's last_billing_action_at cooldown) and
// calling it twice in quick succession would make the second call fail.
function PaymentSetup({ company, seats, onDone, onCancel }) {
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
      const setup = await createBillingSetup(company.id);
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
      await updateSeatSubscription(company.id, seats);
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
          {seats} seat{seats !== 1 ? 's' : ''} × {formatMoney(priceInfo.unitAmount, priceInfo.currency)}/mo = <span style={{ color: TXT, fontWeight: 700 }}>{formatMoney(priceInfo.unitAmount * seats, priceInfo.currency)}/mo</span>
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
          {submitting ? 'Saving…' : 'Save & Start Subscription'}
        </button>
        <button onClick={onCancel} style={{ ...btnG, ...sm }}>Cancel</button>
      </div>
    </div>
  );
}

function BillingSection({ company, setCompany }) {
  const [seatsInUse, setSeatsInUse] = useState(0);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [pendingSeats, setPendingSeats] = useState(1);
  const [seatDraft, setSeatDraft] = useState(company.paid_seats || 0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [invoices, setInvoices] = useState(null);

  useEffect(() => {
    getCompanyMembers(company.id).then(members => {
      setSeatsInUse(members.filter(m => m.role !== 'owner').length);
      setLoadingMembers(false);
    });
  }, [company.id]);

  useEffect(() => { setSeatDraft(company.paid_seats || 0); }, [company.paid_seats]);

  const openSetup = async () => {
    setErr('');
    setPendingSeats(Math.max(1, seatsInUse));
    setShowSetup(true);
  };

  const saveSeats = async () => {
    setSaving(true); setErr('');
    try {
      const result = await updateSeatSubscription(company.id, seatDraft);
      setCompany(prev => ({ ...prev, paid_seats: result.paid_seats, subscription_status: result.subscription_status }));
    } catch (e) {
      setErr(e.message || 'Could not update seats.');
    }
    setSaving(false);
  };

  const toggleCancel = async (cancel) => {
    setSaving(true); setErr('');
    try {
      const result = await setSubscriptionCancellation(company.id, cancel);
      setCompany(prev => ({ ...prev, subscription_status: cancel ? 'canceling' : prev.subscription_status, _cancelAtPeriodEnd: result.cancel_at_period_end }));
    } catch (e) {
      setErr(e.message || 'Could not update subscription.');
    }
    setSaving(false);
  };

  const loadInvoices = async () => {
    if (invoices) { setInvoices(null); return; } // toggle closed
    const list = await listInvoices(company.id).catch(() => []);
    setInvoices(list);
  };

  const hasSubscription = !!company.stripe_subscription_id || (company.paid_seats || 0) > 0;
  const isCanceling = company._cancelAtPeriodEnd;

  if (!PUBLISHABLE_KEY) {
    return (
      <div style={{ fontSize: 10, color: MUT, lineHeight: 1.7 }}>
        Billing isn't configured for this deployment yet.
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 10, color: MUT, lineHeight: 1.7, marginBottom: 14 }}>
        Your own seat is always free. Every other member of this organisation — added via an invite code — uses one paid seat at $10/month.
      </div>

      {loadingMembers ? (
        <div style={{ fontSize: 10, color: MUT }}>Loading…</div>
      ) : showSetup ? (
        <div style={{ background: '#0a0a0a', border: '1px solid ' + BRD, borderRadius: 2, padding: 14 }}>
          <div style={{ fontSize: 9, color: ACC, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Set Up Billing</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: MUT, marginBottom: 6 }}>How many additional seats do you need?</div>
            <SeatStepper value={pendingSeats} onChange={setPendingSeats} min={Math.max(1, seatsInUse)} quickAdds={[5, 10, 30]} />
          </div>
          <PaymentSetup company={company} seats={pendingSeats}
            onDone={() => { setShowSetup(false); setCompany(prev => ({ ...prev, paid_seats: pendingSeats, subscription_status: 'active' })); }}
            onCancel={() => setShowSetup(false)} />
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 7, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Seats in use</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: TXT }}>{seatsInUse} / {company.paid_seats || 0}</div>
            </div>
            <div>
              <div style={{ fontSize: 7, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Status</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: company.subscription_status === 'active' ? GRN : company.subscription_status === 'past_due' ? RED : MUT }}>
                {isCanceling ? 'Canceling' : (company.subscription_status || 'inactive')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 7, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Cost</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: TXT }}>${(company.paid_seats || 0) * 10}/mo</div>
            </div>
          </div>

          {err && <div style={{ fontSize: 10, color: RED, marginBottom: 10 }}>{err}</div>}

          {!hasSubscription ? (
            <button onClick={openSetup} style={{ ...btnA, ...sm }}>Set Up Billing</button>
          ) : (
            <>
              {(company.paid_seats || 0) > seatsInUse && (
                <div style={{ fontSize: 10, color: TXT, marginBottom: 12, background: RED + '11', border: '1px solid ' + RED + '33', borderRadius: 2, padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <span>
                    {company.paid_seats - seatsInUse} unused paid seat{company.paid_seats - seatsInUse !== 1 ? 's' : ''} — likely people who've left. Drop them to save ${(company.paid_seats - seatsInUse) * 10}/mo.
                  </span>
                  <button type="button" onClick={() => setSeatDraft(seatsInUse)} style={{ ...btnG, ...sm, fontSize: 8, color: RED, border: '1px solid ' + RED + '55' }}>
                    Drop to {seatsInUse}
                  </button>
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: MUT, marginBottom: 6 }}>Change seat count</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <SeatStepper value={seatDraft} onChange={setSeatDraft} min={seatsInUse} quickAdds={[5, 10]} />
                  <button onClick={saveSeats} disabled={saving || seatDraft === company.paid_seats} style={{ ...btnA, ...sm, opacity: saving || seatDraft === company.paid_seats ? 0.5 : 1 }}>
                    {saving ? 'Saving…' : 'Update Seats'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button onClick={loadInvoices} style={{ ...btnG, ...sm }}>{invoices ? 'Hide' : 'View'} Billing History</button>
                {isCanceling ? (
                  <button onClick={() => toggleCancel(false)} disabled={saving} style={{ ...btnG, ...sm, color: GRN, border: '1px solid ' + GRN + '55' }}>Resume Subscription</button>
                ) : (
                  <button onClick={() => toggleCancel(true)} disabled={saving} style={{ ...btnG, ...sm, color: RED, border: '1px solid ' + RED + '55' }}>Cancel Subscription</button>
                )}
              </div>

              {invoices && (
                <div style={{ border: '1px solid ' + BRD, borderRadius: 2 }}>
                  {invoices.length === 0 && <div style={{ fontSize: 10, color: MUT, padding: 12 }}>No invoices yet.</div>}
                  {invoices.map(inv => (
                    <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #1a1a1a', fontSize: 10 }}>
                      <span style={{ color: MUT }}>{new Date(inv.created * 1000).toLocaleDateString()}</span>
                      <span style={{ color: TXT }}>{formatMoney(inv.amount_paid, inv.currency)}</span>
                      <span style={{ color: inv.status === 'paid' ? GRN : MUT, textTransform: 'uppercase', fontSize: 8, letterSpacing: '0.08em' }}>{inv.status}</span>
                      {inv.hosted_invoice_url && <a href={inv.hosted_invoice_url} target="_blank" rel="noreferrer" style={{ color: ACC, fontSize: 8, textDecoration: 'none' }}>Receipt →</a>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default BillingSection;
