import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, TXT, GRN, RED, inp, btnA, btnG, sm } from '../../lib/styles';
import { canUse } from '../../lib/gates';
import { DEFAULT_STORAGE_TIERS, TIER_NAMES } from '../../lib/storageTiers';
import { updateCompany } from '../../lib/db';
import { parseNum } from '../../lib/helpers';

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

const FIELDS = [
  { k: 'freeDays',     label: 'Free Days',   suffix: 'd',    type: 'int' },
  { k: 'dailyRate',    label: 'Daily Rate',  prefix: '$',    type: 'float' },
  { k: 'escalateDays', label: 'Escalate At', suffix: 'd',    type: 'int' },
  { k: 'minFee',       label: 'Min Fee',     prefix: '$',    type: 'float' },
];

const lbl = { fontSize: 9, color: MUT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 };
const col = { display: "flex", flexDirection: "column" };

function StorageSettings({ profile, setProfile, company, setCompany }) {
  const canAccessStorage = canUse('storage_policy', profile, company);

  // Storage toggle
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Storage tiers
  const [tierSaving, setTierSaving] = useState(false);
  const [tierErr, setTierErr] = useState("");
  const [tierSaved, setTierSaved] = useState(false);

  const enabled = profile?.storage_policy_enabled ?? false;

  const [overrides, setOverrides] = useState(() => {
    const saved = profile?.storage_tiers ?? {};
    const init = {};
    for (const name of TIER_NAMES) {
      if (name === 'Custom') continue;
      const ov = saved[name] ?? {};
      init[name] = {
        freeDays:     ov.freeDays     !== undefined ? String(ov.freeDays)     : '',
        dailyRate:    ov.dailyRate    !== undefined ? String(ov.dailyRate)    : '',
        escalateDays: ov.escalateDays !== undefined ? String(ov.escalateDays) : '',
        minFee:       ov.minFee       !== undefined ? String(ov.minFee)       : '',
      };
    }
    return init;
  });

  // Billing rates
  const [hourlyRate, setHourlyRate] = useState(() => company?.hourly_rate != null ? String(company.hourly_rate) : "");
  const [taxRate, setTaxRate]       = useState(() => company?.tax_rate     != null ? String(company.tax_rate)    : "");
  const [taxLabel, setTaxLabel]     = useState(() => company?.tax_label    || "");
  const [billingSaving, setBillingSaving] = useState(false);
  const [billingErr, setBillingErr]       = useState("");
  const [billingSaved, setBillingSaved]   = useState(false);

  useEffect(() => {
    setHourlyRate(company?.hourly_rate != null ? String(company.hourly_rate) : "");
    setTaxRate(company?.tax_rate       != null ? String(company.tax_rate)    : "");
    setTaxLabel(company?.tax_label     || "");
  }, [company?.id]);

  const saveBillingRates = async () => {
    if (!company?.id) return;
    setBillingSaving(true); setBillingErr(""); setBillingSaved(false);
    // parseNum handles "$120" / "1,500" and rejects garbage instead of
    // silently wiping the saved rate with NaN→null
    const rate = hourlyRate !== "" ? parseNum(hourlyRate, { min: 0 }) : null;
    const tax  = taxRate    !== "" ? parseNum(taxRate,    { min: 0, max: 100 }) : null;
    if (hourlyRate !== "" && rate == null) { setBillingErr("Enter a valid hourly rate (numbers only)."); setBillingSaving(false); return; }
    if (taxRate !== "" && tax == null)     { setBillingErr("Enter a valid tax rate between 0 and 100."); setBillingSaving(false); return; }
    try {
      const updated = await updateCompany(company.id, {
        hourly_rate: rate,
        tax_rate:    tax,
        tax_label:   taxLabel.trim()   || null,
      });
      setCompany(updated);
      setBillingSaved(true); setTimeout(() => setBillingSaved(false), 2500);
    } catch (e) { setBillingErr(e.message || "Save failed."); }
    setBillingSaving(false);
  };

  const toggle = async () => {
    if (!canAccessStorage) return;
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

  const setField = (tierName, field, val) => {
    setOverrides(prev => ({ ...prev, [tierName]: { ...prev[tierName], [field]: val } }));
    setTierSaved(false);
  };

  const saveTiers = async () => {
    setTierSaving(true); setTierErr("");
    const toSave = {};
    for (const name of TIER_NAMES) {
      if (name === 'Custom') continue;
      const def = DEFAULT_STORAGE_TIERS[name];
      const ov  = overrides[name] ?? {};
      const entry = {};
      for (const { k, type } of FIELDS) {
        const raw = ov[k];
        if (raw === '' || raw === undefined) continue;
        const parsed = type === 'int' ? parseInt(raw) : parseFloat(raw);
        if (!isNaN(parsed) && parsed !== def[k]) entry[k] = parsed;
      }
      if (Object.keys(entry).length > 0) toSave[name] = entry;
    }
    const { error } = await supabase
      .from('profiles')
      .update({ storage_tiers: toSave })
      .eq('id', profile.id);
    if (error) { setTierErr(error.message); setTierSaving(false); return; }
    setProfile(prev => ({ ...prev, storage_tiers: toSave }));
    setTierSaved(true);
    setTierSaving(false);
  };

  const resetTiers = () => {
    const init = {};
    for (const name of TIER_NAMES) {
      if (name === 'Custom') continue;
      init[name] = { freeDays: '', dailyRate: '', escalateDays: '', minFee: '' };
    }
    setOverrides(init);
    setTierSaved(false);
  };

  return (
    <div>
      {/* ── Billing Rates ── */}
      <div style={{ ...secHd, marginBottom: 12 }}>Billing Rates</div>
      {!company ? (
        <div style={{ background: "#0a0a14", border: "1px solid #1a1a3a", borderRadius: 2, padding: "16px 18px", marginBottom: 24 }}>
          <div style={{ fontSize: 9, color: ACC, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Org Required</div>
          <div style={{ fontSize: 10, color: MUT, lineHeight: 1.7 }}>
            Create an organisation to set your labour rate, tax rate, and tax label.<br />
            These are used when generating invoices and job quotes.
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div style={col}><div style={lbl}>Labour Rate ($/hr)</div><input style={inp} type="number" min="0" step="0.5" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="e.g. 85" /></div>
            <div style={col}><div style={lbl}>Tax Rate (%)</div><input style={inp} type="number" min="0" max="100" step="0.5" value={taxRate} onChange={e => setTaxRate(e.target.value)} placeholder="e.g. 10" /></div>
            <div style={col}><div style={lbl}>Tax Label</div><input style={inp} value={taxLabel} onChange={e => setTaxLabel(e.target.value)} placeholder="e.g. GST" /></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={saveBillingRates} disabled={billingSaving} style={{ ...btnA, ...sm, opacity: billingSaving ? 0.6 : 1 }}>
              {billingSaving ? "Saving…" : "Save Rates"}
            </button>
            {billingSaved && <span style={{ fontSize: 9, color: GRN }}>Saved.</span>}
            {billingErr   && <span style={{ fontSize: 9, color: RED }}>{billingErr}</span>}
          </div>
        </div>
      )}

      {/* ── Storage Policy ── */}
      <div style={{ paddingTop: 20, borderTop: "1px solid #1a1a1a" }}>
        <div style={{ ...secHd, marginBottom: 12 }}>Storage Policy</div>
        {!canAccessStorage ? (
          <div style={{ background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: 2, padding: "16px 18px" }}>
            <div style={{ fontSize: 9, color: GRN, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Member Feature</div>
            <div style={{ fontSize: 10, color: MUT, lineHeight: 1.7 }}>
              Storage policy lets you track daily storage fees for machines left in your shop.<br />
              After a tier-defined free period, fees accumulate automatically. Machines overdue for pickup are flagged for sale.
            </div>
          </div>
        ) : (
          <>
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

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={secHd}>Storage Tiers</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={resetTiers} style={{ ...btnG, ...sm, fontSize: 8 }}>Reset to defaults</button>
                <button onClick={saveTiers} disabled={tierSaving} style={{ ...btnA, ...sm, fontSize: 8, opacity: tierSaving ? 0.6 : 1 }}>
                  {tierSaving ? "Saving…" : "Save Tiers"}
                </button>
              </div>
            </div>

            <div style={{ border: "1px solid " + BRD, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 1fr 1fr", background: ACC + "15", borderBottom: "1px solid " + BRD }}>
                {["Tier", ...FIELDS.map(f => f.label)].map(h => (
                  <div key={h} style={{ fontSize: 8, color: ACC, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 10px" }}>{h}</div>
                ))}
              </div>
              {TIER_NAMES.filter(n => n !== 'Custom').map((name, i) => {
                const def = DEFAULT_STORAGE_TIERS[name];
                const ov  = overrides[name] ?? {};
                return (
                  <div key={name} style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 1fr 1fr", borderBottom: i < TIER_NAMES.length - 2 ? "1px solid " + BRD : "none", background: i % 2 === 0 ? "transparent" : SURF, alignItems: "center" }}>
                    <div style={{ fontSize: 10, color: TXT, fontWeight: 700, padding: "6px 10px" }}>{name}</div>
                    {FIELDS.map(({ k, prefix, suffix, type }) => (
                      <div key={k} style={{ padding: "4px 6px", display: "flex", alignItems: "center", gap: 2 }}>
                        {prefix && <span style={{ fontSize: 9, color: MUT }}>{prefix}</span>}
                        <input
                          type="number"
                          min="0"
                          step={type === 'float' ? '0.5' : '1'}
                          value={ov[k] ?? ''}
                          placeholder={String(def[k] ?? '')}
                          onChange={e => setField(name, k, e.target.value)}
                          style={{ ...inp, fontSize: 9, padding: "3px 5px", width: "100%", minWidth: 0 }}
                        />
                        {suffix && <span style={{ fontSize: 9, color: MUT }}>{suffix}</span>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {tierErr   && <div style={{ fontSize: 9, color: RED, marginTop: 6 }}>{tierErr}</div>}
            {tierSaved && <div style={{ fontSize: 9, color: GRN, marginTop: 6 }}>Tier rates saved.</div>}

            <div style={{ fontSize: 9, color: MUT, marginTop: 10, lineHeight: 1.6 }}>
              Leave a field blank to use the default value (shown as placeholder). Tiers are assigned per visit when you book a machine in.
              Custom tier requires manual fee entry. Machines past the escalation day are flagged <span style={{ color: RED }}>for sale</span> in service reminders.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StorageSettings;
