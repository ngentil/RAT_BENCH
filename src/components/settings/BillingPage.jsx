import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, GRN, RED, btnG, sm } from '../../lib/styles';

// Rat Bench dropped its paid Member tier — every feature is free for every
// account now (see the comment in lib/gates.js). This page used to be a
// plan-picker; the only thing left to surface here is a way for anyone who
// subscribed before that change to manage/cancel their now-unnecessary
// Stripe subscription. hasLegacySub is a display-only heuristic (raw tier
// value, not effectiveTier() which always reports "enthusiast" now) — it
// just decides whether that option is worth showing at all.
function BillingPage({ profile, company, session }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const hasLegacySub = !!(profile?.tier && profile.tier !== "free") || !!(company?.tier && company.tier !== "free");
  const orgIsBilled = !!(company?.tier && company.tier !== "free");

  const handleManage = async () => {
    setLoading(true); setErr("");
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
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ background: SURF, border: "1px solid " + BRD, borderLeft: "3px solid " + GRN, borderRadius: 2, padding: "18px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: GRN, marginBottom: 6 }}>Rat Bench is free — no subscription required.</div>
        <div style={{ fontSize: 11, color: MUT, lineHeight: 1.7 }}>
          Unlimited machines, the Wiki, the Marketplace, team seats — every feature is available to every account at no cost. There's no paid plan to upgrade to.
        </div>
      </div>

      {err && <div style={{ fontSize: 10, color: RED, marginBottom: 12 }}>{err}</div>}

      {hasLegacySub && (
        <button onClick={handleManage} disabled={loading} style={{ ...btnG, ...sm, opacity: loading ? 0.6 : 1 }}>
          {loading ? "Redirecting…" : "Manage a previous subscription"}
        </button>
      )}
    </div>
  );
}

export default BillingPage;
