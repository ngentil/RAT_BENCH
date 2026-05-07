import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, TXT, GRN, RED, btnA, btnG, sm } from '../../lib/styles';
import { TIERS, effectiveTier } from '../../lib/gates';

const PRICE_IDS = {
  enthusiast_monthly: import.meta.env.VITE_STRIPE_PRICE_ENTHUSIAST_MONTHLY,
  enthusiast_yearly:  import.meta.env.VITE_STRIPE_PRICE_ENTHUSIAST_YEARLY,
  team:               import.meta.env.VITE_STRIPE_PRICE_TEAM,
  business:           import.meta.env.VITE_STRIPE_PRICE_BUSINESS,
};

const PLANS = [
  {
    id: "free",
    label: "Free",
    price: "$0",
    period: "",
    features: ["Up to 50 machines","Wiki access","Job tracker","Community support"],
    personal: true,
  },
  {
    id: "enthusiast",
    label: "Enthusiast",
    priceMonthly: "$4.99",
    priceYearly: "$12",
    period: "/mo",
    periodYearly: "/yr",
    features: ["Unlimited machines","Everything in Free","Early access to new features"],
    personal: true,
    highlight: true,
  },
  {
    id: "team",
    label: "Team",
    price: "$29",
    period: "/mo",
    features: ["Unlimited machines","Organisation / multi-user","Access control (ACL)","Shared machine library","Everything in Enthusiast"],
    personal: false,
  },
  {
    id: "business",
    label: "Business",
    price: "$99",
    period: "/mo",
    features: ["Everything in Team","Parts tracker","Priority support","API access (coming soon)"],
    personal: false,
  },
];

function PlanCard({ plan, current, billing, onUpgrade, onManage, loading }) {
  const isCurrent = plan.id === current;
  const price = plan.id === "enthusiast" && billing === "yearly"
    ? plan.priceYearly + plan.periodYearly
    : (plan.price || plan.priceMonthly) + (plan.period || "");
  const isLoading = loading === plan.id;

  return (
    <div style={{
      background: SURF,
      border: "1px solid " + (isCurrent ? ACC : plan.highlight ? ACC + "55" : BRD),
      borderRadius: 3,
      padding: "16px 14px",
      position: "relative",
    }}>
      {plan.highlight && !isCurrent && (
        <div style={{ position: "absolute", top: -10, left: 14, background: ACC, color: "#000", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 2 }}>
          POPULAR
        </div>
      )}
      {isCurrent && (
        <div style={{ position: "absolute", top: -10, left: 14, background: GRN, color: "#000", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 2 }}>
          CURRENT PLAN
        </div>
      )}
      <div style={{ fontSize: 11, color: ACC, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{plan.label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: TXT, marginBottom: 12 }}>
        {price || "$0"}
        {!price && <span style={{ fontSize: 11, color: MUT }}> forever</span>}
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 14px", fontSize: 10, color: MUT, lineHeight: 2 }}>
        {plan.features.map(f => (
          <li key={f} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
            <span style={{ color: GRN, flexShrink: 0 }}>✓</span>{f}
          </li>
        ))}
      </ul>
      {!isCurrent && plan.id !== "free" && (
        <button
          onClick={() => onUpgrade(plan.id)}
          disabled={isLoading}
          style={{ ...btnA, ...sm, width: "100%", opacity: isLoading ? 0.6 : 1 }}
        >
          {isLoading ? "Redirecting…" : "Upgrade"}
        </button>
      )}
      {isCurrent && plan.id !== "free" && (
        <button
          onClick={() => onManage(plan.id)}
          disabled={isLoading}
          style={{ ...btnG, ...sm, width: "100%", opacity: isLoading ? 0.6 : 1 }}
        >
          {isLoading ? "Redirecting…" : "Manage / Cancel"}
        </button>
      )}
    </div>
  );
}

function BillingPage({ profile, company, session }) {
  const [billing, setBilling] = useState("monthly");
  const [loading, setLoading] = useState(null);
  const [err, setErr] = useState("");
  const tier = effectiveTier(profile, company);

  const handleUpgrade = async (planId) => {
    setLoading(planId); setErr("");
    try {
      const priceKey = planId === "enthusiast"
        ? (billing === "yearly" ? "enthusiast_yearly" : "enthusiast_monthly")
        : planId;
      const price_id = PRICE_IDS[priceKey];
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
          return_url: base + "/",
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

      <div style={{ display: "flex", gap: 4, marginBottom: 20, alignItems: "center" }}>
        <button onClick={() => setBilling("monthly")} style={{ ...btnG, ...sm, ...(billing === "monthly" ? { background: ACC, color: "#000", border: "1px solid " + ACC } : {}) }}>Monthly</button>
        <button onClick={() => setBilling("yearly")} style={{ ...btnG, ...sm, ...(billing === "yearly" ? { background: ACC, color: "#000", border: "1px solid " + ACC } : {}) }}>Yearly</button>
        {billing === "yearly" && <span style={{ fontSize: 9, color: GRN, marginLeft: 4 }}>Enthusiast saves ~80% vs monthly</span>}
      </div>

      {err && <div style={{ fontSize: 10, color: RED, marginBottom: 12 }}>{err}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {PLANS.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            current={tier}
            billing={billing}
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
