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

const PRICE_IDS = {
  enthusiast: import.meta.env.VITE_STRIPE_PRICE_ENTHUSIAST,
  team:       import.meta.env.VITE_STRIPE_PRICE_PRO,
};

const PLANS = [
  {
    id: "free",
    label: "Free",
    price: "$0",
    period: "",
    features: ["Up to 30 machines","Up to 5 tools / vehicles / equipment","Wiki access","Job & service tracking","Everything you need to get started"],
    personal: true,
  },
  {
    id: "enthusiast",
    label: "Enthusiast",
    price: "$3.50",
    period: "/wk",
    features: ["Unlimited machines","Unlimited tools, vehicles & equipment","Storage policy — automated fee tracking","Escalation alerts for long-stay machines","Everything in Free","Early access to new features"],
    personal: true,
    highlight: true,
  },
  {
    id: "team",
    label: "Pro",
    price: "$10",
    period: "/wk",
    features: ["Unlimited machines","Organisation / multi-user","Access control (ACL)","Provision assets to team members","Shared machine library","Priority support","Everything in Enthusiast"],
    personal: false,
  },
];

function PlanCard({ plan, current, onUpgrade, onManage, loading }) {
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
      borderTop: "2px solid " + accentColor,
      borderRadius: 3,
      padding: "20px 14px 14px",
      position: "relative",
      boxShadow: glowShadow,
    }}>
      {plan.highlight && !isCurrent && (
        <div style={{ position: "absolute", top: -11, left: 12, background: ACC, color: "#000", fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", padding: "2px 8px", borderRadius: 2 }}>
          POPULAR
        </div>
      )}
      {isCurrent && (
        <div style={{ position: "absolute", top: -11, left: 12, background: GRN, color: "#000", fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", padding: "2px 8px", borderRadius: 2 }}>
          ✓ CURRENT
        </div>
      )}
      <div style={{ fontSize: 9, color: accentColor, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>{plan.label}</div>
      <div style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: TXT, letterSpacing: "-0.02em" }}>{price?.split("/")[0] || "$0"}</span>
        {price?.includes("/") && <span style={{ fontSize: 10, color: MUT, marginLeft: 2 }}>/{price.split("/")[1]}</span>}
        {!price && <span style={{ fontSize: 10, color: MUT }}> free forever</span>}
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 12px", fontSize: 10, lineHeight: 2 }}>
        {plan.features.map(f => (
          <li key={f} style={{ display: "flex", gap: 6, alignItems: "flex-start", color: MUT }}>
            <span style={{ color: plan.id === "free" ? MUT : GRN, flexShrink: 0, marginTop: 1 }}>✓</span>{f}
          </li>
        ))}
      </ul>
      {!plan.personal && !isCurrent && (
        <div style={{ fontSize: 8, color: MUT, marginBottom: 10, letterSpacing: "0.06em", borderTop: "1px solid #252525", paddingTop: 8 }}>
          For shops and teams
        </div>
      )}
      {!isCurrent && plan.id !== "free" && (
        <GlowBtn
          onClick={() => onUpgrade(plan.id)}
          disabled={isLoading}
          glow={ACC}
          style={{ ...btnA, ...sm, width: "100%", opacity: isLoading ? 0.6 : 1 }}
        >
          {isLoading ? "Redirecting…" : "Upgrade →"}
        </GlowBtn>
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
  const tier = effectiveTier(profile, company);

  const handleUpgrade = async (planId) => {
    setLoading(planId); setErr("");
    try {
      const price_id = PRICE_IDS[planId];
      const isOrgPlan = ["team","business"].includes(planId);

      const base = window.location.origin;
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          price_id,
          user_id: session.user.id,
          company_id: isOrgPlan && company ? company.id : null,
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
      const isOrgPlan = ["team","business"].includes(tier);
      const { data, error } = await supabase.functions.invoke("create-portal", {
        body: {
          user_id: session.user.id,
          company_id: isOrgPlan && company ? company.id : null,
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

  return (
    <div>
      <div style={{ fontSize: 9, color: MUT, marginBottom: 16, lineHeight: 1.7 }}>
        {["team","business"].includes(tier)
          ? `Your organisation is on the ${TIERS[tier]?.label} plan.`
          : `Your account is on the ${TIERS[tier]?.label} plan.`}
      </div>

      {err && <div style={{ fontSize: 10, color: RED, marginBottom: 12 }}>{err}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
        {PLANS.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            current={tier}
            onManage={handleManage}
            onUpgrade={handleUpgrade}
            loading={loading}
          />
        ))}
      </div>

      <div style={{ fontSize: 9, color: MUT, textAlign: "center", lineHeight: 1.7, borderTop: "1px solid " + BRD, paddingTop: 16 }}>
        Payments secured by Stripe. Cancel anytime.
      </div>
    </div>
  );
}

export default BillingPage;
