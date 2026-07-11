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

const MEMBER_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ENTHUSIAST;

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
    price: "$3.50",
    period: "/wk",
    features: ["Unlimited machines, tools, vehicles & equipment","Storage policy — automated fee tracking & escalation alerts","Publish & edit specs on the community Wiki","Sell on the Marketplace","Organisation / multi-user (3 seats included, more at $2/wk each)","Access control per machine & asset","Priority support","Early access to new features"],
    highlight: true,
  },
];

function PlanCard({ plan, current, onUpgrade, onManage, loading, orgToggle }) {
  const isCurrent = plan.id === current;
  const price = plan.price + (plan.period || "");
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
      <div style={{ marginBottom: 16, display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: TXT, letterSpacing: "-0.02em", lineHeight: 1 }}>{price?.split("/")[0] || "$0"}</span>
        {price?.includes("/") && <span style={{ fontSize: 12, color: MUT }}>/{price.split("/")[1]}</span>}
        {plan.id === "free" && <span style={{ fontSize: 11, color: MUT }}>forever</span>}
      </div>
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
            onClick={() => onUpgrade(plan.id)}
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
  const tier = effectiveTier(profile, company);
  // Legacy subscribers can be stored as "business"/"team" as well as
  // "enthusiast" — all three are the same single paid plan now, so normalize
  // to the one plan id that actually exists in PLANS below.
  const planTier = tier === "free" ? "free" : "enthusiast";
  // The org itself already pays (rather than tie-broken through effectiveTier,
  // which would call it "enthusiast" either way once both are the same tier).
  const orgIsBilled = !!(company?.tier && company.tier !== "free");

  const handleUpgrade = async (planId) => {
    setLoading(planId); setErr("");
    try {
      const base = window.location.origin;
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          price_id: MEMBER_PRICE_ID,
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
