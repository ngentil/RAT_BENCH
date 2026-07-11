import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, TXT, GRN, RED, btnA, btnG, sm } from '../../lib/styles';
import { TIERS, effectiveTier } from '../../lib/gates';

function GlowBtn({ onClick, disabled, style, glow, children }) {
  const [hov, setHov] = useState(false);
  const [active, setActive] = useState(false);
  const glowColor = glow || ACC;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        ...style,
        boxShadow: hov ? `0 0 14px ${glowColor}77, 0 0 5px ${glowColor}55` : "none",
        transform: active ? "scale(0.95)" : "scale(1)",
        transition: "box-shadow 0.15s ease, transform 0.1s ease",
      }}
    >
      {children}
    </button>
  );
}

// Same single "Member" tier at three billing cadences — see the price-to-tier
// mapping in supabase/functions/stripe-webhook, which maps all three back to
// "enthusiast". Each less-frequent option must be an unambiguous discount, not
// just "correct" under a precise 52/12-weeks-per-month conversion nobody
// actually does in their head — $15/mo (the exact 4.33x-weekly figure) reads
// as a worse deal than weekly against the obvious "$3.50 x 4 = $14" napkin
// math, so there'd be no reason to ever pick it. $13.50/mo beats both that
// napkin math AND the precise weekly-equivalent ($15.17); $145/yr is ~10% off
// paying monthly all year ($162).
// VITE_STRIPE_PRICE_BUSINESS is the actual live weekly price despite the
// name — leftover from an older build's tier naming that was never cleaned
// up. Kept as the primary source rather than renamed in Netlify, with a
// couple of fallbacks for whenever that naming does get tidied up.
const PERIODS = [
  { id: "weekly",  label: "Weekly",  price: "$3.50",  per: "/wk", priceId: import.meta.env.VITE_STRIPE_PRICE_BUSINESS || import.meta.env.VITE_STRIPE_PRICE_MEMBER_WEEKLY || import.meta.env.VITE_STRIPE_PRICE_ENTHUSIAST },
  { id: "monthly", label: "Monthly", price: "$13.50", per: "/mo", priceId: import.meta.env.VITE_STRIPE_PRICE_ENTHUSIAST_MONTHLY },
  { id: "annual",  label: "Annual",  price: "$145",   per: "/yr", priceId: import.meta.env.VITE_STRIPE_PRICE_ENTHUSIAST_YEARLY, badge: "Save 10%" },
];

// One paid tier covers everything — see the comment in lib/gates.js for why
// (community-spam prevention + "you've got skin in the game", not an upsell
// ladder). Team/org features are included, not a separate paywall.
const PLANS = [
  {
    id: "free",
    label: "Free",
    price: "$0",
    period: "",
    features: ["Up to 5 machines","Up to 5 tools / equipment / consumables","1 vehicle in your workshop","Wiki access","Jobs & timers on your first 3 machines","Everything you need to get started"],
  },
  {
    id: "enthusiast",
    label: "Member",
    features: ["Unlimited machines, tools, vehicles & equipment","Storage policy — automated fee tracking & escalation alerts","Publish & edit specs on the community Wiki","Sell & message on the Marketplace","Organisation / multi-user (3 seats included, more at $2/wk each)","Access control per machine & asset","Priority support","Early access to new features"],
    highlight: true,
  },
];

function PeriodPicker({ period, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
      {PERIODS.map(p => {
        const active = p.id === period;
        return (
          <button key={p.id} onClick={() => onChange(p.id)} style={{
            flex: 1, position: "relative", background: active ? ACC + "1a" : "none",
            border: "1px solid " + (active ? ACC : BRD), color: active ? ACC : MUT,
            fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
            textTransform: "uppercase", padding: "6px 4px", borderRadius: 2, cursor: "pointer",
          }}>
            {p.label}
            {p.badge && <span style={{ position: "absolute", top: -8, right: -4, background: GRN, color: "#000", fontSize: 7, fontWeight: 700, padding: "1px 4px", borderRadius: 2 }}>{p.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}

function PlanCard({ plan, current, onUpgrade, onManage, loading, orgToggle, period, onPeriodChange }) {
  const isCurrent = plan.id === current;
  const isMember = plan.id === "enthusiast";
  const activePeriod = isMember ? PERIODS.find(p => p.id === period) : null;
  const price = isMember ? activePeriod.price + activePeriod.per : plan.price + (plan.period || "");
  const isLoading = loading === plan.id;

  const accentColor = isCurrent ? GRN : plan.highlight ? ACC : BRD;
  const glowShadow  = isCurrent ? `0 0 18px ${GRN}33, 0 0 4px ${GRN}22`
                    : plan.highlight ? `0 0 18px ${ACC}33, 0 0 4px ${ACC}22`
                    : "none";

  return (
    <div className="plan-card" style={{
      background: SURF,
      border: "1px solid " + accentColor,
      borderTop: "3px solid " + accentColor,
      borderRadius: 4,
      padding: "22px 18px 18px",
      position: "relative",
      boxShadow: glowShadow,
    }}>
      {plan.highlight && !isCurrent && (
        <div style={{ position: "absolute", top: -11, left: 14, background: ACC, color: "#000", fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", padding: "2px 10px", borderRadius: 2 }}>
          BECOME A MEMBER
        </div>
      )}
      {isCurrent && (
        <div style={{ position: "absolute", top: -11, left: 14, background: GRN, color: "#000", fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", padding: "2px 10px", borderRadius: 2 }}>
          ✓ CURRENT PLAN
        </div>
      )}
      <div style={{ fontSize: 10, color: accentColor, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>{plan.label}</div>
      {isMember && isCurrent ? (
        // Which cadence (weekly/monthly/annual) a current subscriber is
        // actually on isn't tracked locally — only Stripe knows — so this
        // avoids showing a $-figure that might not match their real price.
        <div style={{ marginBottom: 16, fontSize: 12, color: MUT }}>Active — see Manage Billing for your exact price and renewal date.</div>
      ) : (
        <div style={{ marginBottom: isMember ? 6 : 16, display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: TXT, letterSpacing: "-0.02em", lineHeight: 1 }}>{price?.split("/")[0] || "$0"}</span>
          {price?.includes("/") && <span style={{ fontSize: 12, color: MUT }}>/{price.split("/")[1]}</span>}
          {plan.id === "free" && <span style={{ fontSize: 11, color: MUT }}>forever</span>}
        </div>
      )}
      {isMember && !isCurrent && <PeriodPicker period={period} onChange={onPeriodChange} />}
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", fontSize: 11, lineHeight: 1.8 }}>
        {plan.features.map(f => (
          <li key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", color: MUT, paddingBottom: 2 }}>
            <span style={{ color: plan.id === "free" ? MUT : GRN, flexShrink: 0, marginTop: 2, fontSize: 10 }}>✓</span>{f}
          </li>
        ))}
      </ul>
      {!isCurrent && plan.id !== "free" && (
        <>
          <GlowBtn
            onClick={() => onUpgrade(activePeriod)}
            disabled={isLoading}
            glow={ACC}
            style={{ ...btnA, ...sm, width: "100%", opacity: isLoading ? 0.6 : 1 }}
          >
            {isLoading ? "Redirecting…" : "Become a Member →"}
          </GlowBtn>
          {orgToggle}
        </>
      )}
      {isCurrent && plan.id !== "free" && (
        <GlowBtn
          onClick={() => onManage(plan.id)}
          disabled={isLoading}
          glow={RED}
          style={{ ...btnG, ...sm, width: "100%", opacity: isLoading ? 0.6 : 1 }}
        >
          {isLoading ? "Redirecting…" : "Manage / Cancel"}
        </GlowBtn>
      )}
    </div>
  );
}

function BillingPage({ profile, company, session }) {
  const [loading, setLoading] = useState(null);
  const [err, setErr] = useState("");
  const [billViaOrg, setBillViaOrg] = useState(false);
  const [period, setPeriod] = useState("monthly");
  const tier = effectiveTier(profile, company);
  // Legacy subscribers can be stored as "business"/"team" as well as
  // "enthusiast" — all three are the same single paid plan now, so normalize
  // to the one plan id that actually exists in PLANS below.
  const planTier = tier === "free" ? "free" : "enthusiast";
  // The org itself already pays (rather than tie-broken through effectiveTier,
  // which would call it "enthusiast" either way once both are the same tier).
  const orgIsBilled = !!(company?.tier && company.tier !== "free");

  const handleUpgrade = async (chosenPeriod) => {
    setLoading("enthusiast"); setErr("");
    try {
      const base = window.location.origin;
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          price_id: chosenPeriod.priceId,
          user_id: session.user.id,
          company_id: billViaOrg && company ? company.id : null,
          success_url: base + "/?billing=success",
          cancel_url: base + "/?billing=cancelled",
        },
      });
      if (error || !data?.url) throw new Error(error?.message || "Failed to create checkout session");
      window.location.href = data.url;
    } catch (e) {
      setErr(e.message);
      setLoading(null);
    }
  };

  const handleManage = async () => {
    setLoading("manage"); setErr("");
    try {
      const base = window.location.origin;
      const { data, error } = await supabase.functions.invoke("create-portal", {
        body: {
          user_id: session.user.id,
          company_id: orgIsBilled ? company.id : null,
          return_url: base + "/?billing=managed",
        },
      });
      if (error || !data?.url) throw new Error(error?.message || "Failed to open billing portal");
      window.location.href = data.url;
    } catch (e) {
      setErr(e.message);
      setLoading(null);
    }
  };

  const orgToggle = company && !orgIsBilled && (
    <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 9, color: MUT, cursor: "pointer" }}>
      <input type="checkbox" checked={billViaOrg} onChange={e => setBillViaOrg(e.target.checked)} style={{ accentColor: ACC }} />
      Bill this to my organisation instead of me personally
    </label>
  );

  return (
    <div>
      <div style={{ fontSize: 10, color: MUT, marginBottom: 20, lineHeight: 1.7 }}>
        {orgIsBilled
          ? `Your organisation is on the ${TIERS[tier]?.label} plan.`
          : `Your account is on the ${TIERS[tier]?.label} plan.`}
      </div>

      {err && <div style={{ fontSize: 10, color: RED, marginBottom: 12 }}>{err}</div>}

      <div className="billing-grid">
        {PLANS.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            current={planTier}
            onManage={handleManage}
            onUpgrade={handleUpgrade}
            loading={loading}
            orgToggle={plan.id === "enthusiast" ? orgToggle : null}
            period={period}
            onPeriodChange={setPeriod}
          />
        ))}
      </div>

      <div style={{ fontSize: 9, color: MUT, textAlign: "center", lineHeight: 1.7, borderTop: "1px solid " + BRD, paddingTop: 16 }}>
        Membership isn't about unlocking more features for power users — it's what keeps the Wiki and Marketplace free of spam accounts, and it means everyone in the community actually has something invested in it. Payments secured by Stripe. Cancel anytime.
      </div>
    </div>
  );
}

export default BillingPage;
