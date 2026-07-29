import React, { useState, useMemo } from 'react';
import { ACC, MUT, BRD, RED, inp, btnA, btnG } from '../../lib/styles';
import { getTiers, TIER_NAMES } from '../../lib/storageTiers';
import { createBooking } from '../../lib/db/bookings';
import { upsertMachine } from '../../lib/db';

// Moves a machine into Storage from wherever it currently lives — Garage or
// Bench. Always clears onBench as part of the same write (harmless if it
// was already false, e.g. from Garage) so a machine can never end up
// simultaneously "on the Bench" and "in Storage" no matter which card
// triggered it. Shared between MachineCard (Garage) and JobCard (Bench)
// rather than duplicated, since it's one real flow with real state, not
// a few boilerplate lines.
function MoveToStoragePanel({ machine, profile, onUpdate, onBooked }) {
  const [showForm, setShowForm] = useState(false);
  // storageEnabled defaults OFF — moving a machine into storage shouldn't
  // silently start a daily charge unless deliberately opted into per visit.
  const [form, setForm] = useState({ storageTier: "Bench", receivedAt: "", storageEnabled: false, storageFeeOverride: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const activeTiers = useMemo(() => getTiers(profile?.storage_tiers), [profile?.storage_tiers]);

  const openForm = (ev) => {
    ev.stopPropagation();
    const now = new Date();
    const pad = n => String(n).padStart(2, "0");
    setForm(f => ({ ...f, receivedAt: now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()) + "T" + pad(now.getHours()) + ":" + pad(now.getMinutes()) }));
    setShowForm(true);
  };

  const doBookIn = async () => {
    setSaving(true); setErr("");
    try {
      await createBooking({
        machineId: machine.id,
        storageTier: form.storageTier,
        receivedAt: form.receivedAt ? new Date(form.receivedAt).toISOString() : undefined,
        storageEnabled: form.storageEnabled,
        storageFeeOverride: form.storageFeeOverride ? parseFloat(form.storageFeeOverride) : undefined,
        notes: form.notes || undefined,
      });
      const u = { ...machine, onBench: false };
      await upsertMachine(u);
      onUpdate(u);
      onBooked?.(machine.id);
      setShowForm(false);
      setForm({ storageTier: "Bench", receivedAt: "", storageEnabled: false, storageFeeOverride: "", notes: "" });
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  if (!showForm) {
    return (
      <button style={{ width: "100%", background: "none", border: "1px solid " + BRD, borderRadius: 3, padding: "16px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUT, fontSize: 12, minHeight: 56 }} onClick={openForm}>
        <span style={{ fontSize: 28, lineHeight: 1 }}>🗄️</span>
        Move to Storage
      </button>
    );
  }

  return (
    <div style={{ background: "#0a0a0a", border: "1px solid " + BRD, borderRadius: 3, padding: "16px 14px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 9, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Storage Tier</div>
          <select value={form.storageTier} onChange={e => setForm(f => ({ ...f, storageTier: e.target.value }))} style={{ ...inp, fontSize: 13, padding: "12px 10px", minHeight: 48 }}>
            {TIER_NAMES.map(t => <option key={t} value={t}>{t}{activeTiers[t]?.dailyRate != null ? " — $" + activeTiers[t].dailyRate + "/day after " + activeTiers[t].freeDays + "d free" : ""}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 9, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Received</div>
          <input type="datetime-local" value={form.receivedAt} onChange={e => setForm(f => ({ ...f, receivedAt: e.target.value }))} style={{ ...inp, fontSize: 13, padding: "12px 10px", minHeight: 48 }} />
        </div>
        {form.storageTier === "Custom" && (
          <div>
            <div style={{ fontSize: 9, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Custom Daily Rate ($)</div>
            <input type="number" min="0" step="0.01" value={form.storageFeeOverride} onChange={e => setForm(f => ({ ...f, storageFeeOverride: e.target.value }))} placeholder="0.00" style={{ ...inp, fontSize: 13, padding: "12px 10px", minHeight: 48 }} />
          </div>
        )}
        <div>
          <div style={{ fontSize: 9, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Notes</div>
          <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional" style={{ ...inp, fontSize: 13, padding: "12px 10px", minHeight: 48 }} />
        </div>
      </div>
      <label htmlFor={"se-" + machine.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", cursor: "pointer", borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", marginBottom: 14 }}>
        <input type="checkbox" id={"se-" + machine.id} checked={form.storageEnabled} onChange={e => setForm(f => ({ ...f, storageEnabled: e.target.checked }))} style={{ width: 22, height: 22, accentColor: ACC, cursor: "pointer", flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: MUT }}>Charge storage for this machine</span>
      </label>
      {err && <div style={{ fontSize: 9, color: RED, marginBottom: 10 }}>{err}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button style={{ ...btnA, width: "100%", padding: "14px", fontSize: 12, minHeight: 50, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={doBookIn} disabled={saving}>
          <span style={{ fontSize: 20 }}>🗄️</span>{saving ? "Saving…" : "Move to Storage"}
        </button>
        <button style={{ ...btnG, width: "100%", padding: "12px", fontSize: 11, minHeight: 44 }} onClick={() => { setShowForm(false); setErr(""); }}>Cancel</button>
      </div>
    </div>
  );
}

export default MoveToStoragePanel;
