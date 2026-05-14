import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, TXT, GRN, RED, btnA, btnG, sm } from '../../lib/styles';
import { canUse } from '../../lib/gates';
import { STORAGE_TIERS, TIER_NAMES } from '../../lib/storageTiers';

const secHd = { borderLeft: "2px solid " + ACC, paddingLeft: 8, fontSize: 10, color: TXT, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 };

function Toggle({ checked, onChange, disabled }) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 36, height: 20, borderRadius: 10, cursor: disabled ? "default" : "pointer",
        background: checked ? ACC : "#2a2a2a", border: "1px solid " + (checked ? ACC : BRD),
        position: "relative", transition: "background 0.15s", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 2, left: checked ? 17 : 2, width: 14, height: 14,
        borderRadius: "50%", background: "#fff", transition: "left 0.15s",
      }} />
    </div>
  );
}

function StorageSettings({ profile, setProfile, company }) {
  const canAccess = canUse('storage_policy', profile, company);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const enabled = profile?.storage_policy_enabled ?? false;

  const toggle = async () => {
    if (!canAccess) return;
    setSaving(true); setErr("");
    const next = !enabled;
    const { error } = await supabase
      .from('profiles')
      .update({ storage_policy_enabled: next })
      .eq('id', profile.id);
    if (error) { setErr(error.message); setSaving(false); return; }
    setProfile(prev => ({ ...prev, storage_policy_enabled: next }));
    setSaving(false);
  };

  if (!canAccess) {
    return (
      <div style={{ background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: 2, padding: "16px 18px", marginTop: 4 }}>
        <div style={{ fontSize: 9, color: GRN, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Enthusiast Feature</div>
        <div style={{ fontSize: 10, color: MUT, lineHeight: 1.7 }}>
          Storage policy lets you track daily storage fees for machines left in your shop.<br />
          After a tier-defined free period, fees accumulate automatically. Machines overdue for pickup are flagged for sale.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ background: SURF, border: "1px solid " + BRD, borderRadius: 2, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: TXT, fontWeight: 700, marginBottom: 3 }}>Enable Storage Policy</div>
            <div style={{ fontSize: 9, color: MUT, lineHeight: 1.6, maxWidth: 320 }}>
              When enabled, a "Book In" button appears on each machine card. Storage fees accumulate after the tier's free period.
            </div>
          </div>
          <Toggle checked={enabled} onChange={toggle} disabled={saving} />
        </div>
        {err && <div style={{ fontSize: 9, color: RED, marginTop: 8 }}>{err}</div>}
      </div>

      <div style={secHd}>Storage Tiers</div>
      <div style={{ border: "1px solid " + BRD, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", background: ACC + "15", borderBottom: "1px solid " + BRD }}>
          {["Tier", "Free Days", "Daily Rate", "Escalate At", "Min Fee"].map(h => (
            <div key={h} style={{ fontSize: 8, color: ACC, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 10px" }}>{h}</div>
          ))}
        </div>
        {TIER_NAMES.filter(t => t !== "Custom").map((name, i) => {
          const t = STORAGE_TIERS[name];
          return (
            <div key={name} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", borderBottom: i < TIER_NAMES.length - 2 ? "1px solid " + BRD : "none", background: i % 2 === 0 ? "transparent" : SURF }}>
              <div style={{ fontSize: 10, color: TXT, fontWeight: 700, padding: "8px 10px" }}>{name}</div>
              <div style={{ fontSize: 10, color: MUT, padding: "8px 10px" }}>{t.freeDays}d</div>
              <div style={{ fontSize: 10, color: ACC, padding: "8px 10px" }}>${t.dailyRate}/day</div>
              <div style={{ fontSize: 10, color: MUT, padding: "8px 10px" }}>{t.escalateDays}d</div>
              <div style={{ fontSize: 10, color: MUT, padding: "8px 10px" }}>${t.minFee}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 9, color: MUT, marginTop: 10, lineHeight: 1.6 }}>
        Tiers are assigned per visit when you book a machine in. Custom tier requires manual fee entry.
        Machines past the escalation day are flagged <span style={{ color: RED }}>for sale</span> in service reminders.
      </div>
    </div>
  );
}

export default StorageSettings;
