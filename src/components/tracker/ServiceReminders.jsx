import React, { useMemo, useState } from 'react';
import { ACC, MUT, BRD, TXT, GRN, RED, SURF, inp, btnA, btnG, btnD, sm, col, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { SL, FL } from '../ui/shared';
import { mIcon } from '../../lib/helpers';
import { upsertMachine } from '../../lib/db';

const ORANGE = "#e8870a";

function totalLoggedHours(machine) {
  return (machine.timeLog || []).reduce((s, e) => s + (e.seconds || 0), 0) / 3600;
}

function getMachineReminders(machine) {
  const totalHrs = totalLoggedHours(machine);
  const lastDate = machine.lastServiceDate;
  const lastOdo  = parseFloat(machine.lastServiceOdo) || 0;
  const items    = [];

  function addItem(label, interval, unit) {
    if (!interval) return;
    const n = parseFloat(interval);
    if (!n || isNaN(n)) return;
    const isHours = !unit || unit === "hours";

    if (isHours) {
      const dueAt  = lastOdo > 0 ? lastOdo + n : n;
      const pct    = Math.min(totalHrs / dueAt, 1.2);
      const overdue = totalHrs >= dueAt;
      items.push({ label, current: totalHrs.toFixed(1) + "h logged", due: lastOdo > 0 ? "due at " + dueAt.toFixed(0) + "h" : "every " + n + "h", pct: Math.min(pct, 1), overdue, dueSoon: pct >= 0.8 && !overdue });
    } else {
      if (!lastDate) {
        items.push({ label, current: "no service date set", due: "every " + n + "mo", pct: 0, overdue: false, dueSoon: false, noDate: true });
        return;
      }
      const daysSince = Math.floor((Date.now() - new Date(lastDate)) / 86400000);
      const dueDays   = n * 30;
      const pct       = Math.min(daysSince / dueDays, 1.2);
      const overdue   = daysSince >= dueDays;
      items.push({ label, current: daysSince + "d since service", due: "every " + n + "mo", pct: Math.min(pct, 1), overdue, dueSoon: pct >= 0.8 && !overdue });
    }
  }

  addItem("Oil Change",    machine.oilChangeInterval,   machine.oilChangeUnit);
  addItem("Filter",        machine.filterInterval,       machine.filterIntervalUnit);
  addItem("Major Service", machine.majorServiceInterval, machine.majorServiceUnit);

  return items;
}

function ServiceModal({ machine, onSave, onClose }) {
  const currentHrs = totalLoggedHours(machine).toFixed(1);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [odo,  setOdo]  = useState(currentHrs);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await onSave({ lastServiceDate: date, lastServiceOdo: parseFloat(odo) || 0, lastServiceNotes: notes });
    setSaving(false);
    onClose();
  };

  return (
    <div style={ovly} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...mdl, maxWidth: 340 }}>
        <div style={mdlH}>
          <span style={{ fontSize: 12, fontWeight: 700, color: TXT }}>Mark Serviced — {machine.name}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ ...mdlB, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={col}>
            <FL t="Service Date" />
            <input style={inp} type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div style={col}>
            <FL t={`Hours at Service (current: ${currentHrs}h)`} />
            <input style={inp} type="number" min="0" step="0.1" value={odo} onChange={e => setOdo(e.target.value)} />
          </div>
          <div style={col}>
            <FL t="Notes (optional)" />
            <input style={inp} placeholder="e.g. Changed oil, new spark plug" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
        <div style={mdlF}>
          <button onClick={onClose} style={{ ...btnG, ...sm }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ ...btnA, ...sm, opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving…" : "✓ Mark Serviced"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ServiceReminders({ machines, setMachines }) {
  const [filter,      setFilter]      = useState("all");
  const [servicingId, setServicingId] = useState(null);

  const machineData = useMemo(() =>
    machines
      .map(m => ({ machine: m, items: getMachineReminders(m) }))
      .filter(({ items }) => items.length > 0),
  [machines]);

  const filtered = useMemo(() => {
    if (filter === "overdue")  return machineData.filter(({ items }) => items.some(i => i.overdue));
    if (filter === "due_soon") return machineData.filter(({ items }) => items.some(i => i.dueSoon || i.overdue));
    return machineData;
  }, [machineData, filter]);

  const overdueCount = machineData.filter(({ items }) => items.some(i => i.overdue)).length;
  const dueSoonCount = machineData.filter(({ items }) => items.some(i => i.dueSoon)).length;
  const okCount      = machineData.filter(({ items }) => !items.some(i => i.overdue || i.dueSoon)).length;

  const markServiced = async (machine, data) => {
    const updated = { ...machine, ...data };
    await upsertMachine(updated);
    setMachines(prev => prev.map(m => m.id === machine.id ? updated : m));
  };

  const servicingMachine = servicingId ? machines.find(m => m.id === servicingId) : null;

  return (
    <div style={{ padding: 16, flex: 1, overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <SL t="Service Reminders" />
        <div style={{ display: "flex", gap: 6 }}>
          {overdueCount > 0 && (
            <span style={{ fontSize: 8, color: RED, border: "1px solid " + RED + "55", background: RED + "11", padding: "2px 6px", borderRadius: 2, fontWeight: 700, letterSpacing: "0.1em" }}>
              {overdueCount} OVERDUE
            </span>
          )}
          {dueSoonCount > 0 && (
            <span style={{ fontSize: 8, color: ORANGE, border: "1px solid " + ORANGE + "55", background: ORANGE + "11", padding: "2px 6px", borderRadius: 2, fontWeight: 700, letterSpacing: "0.1em" }}>
              {dueSoonCount} DUE SOON
            </span>
          )}
          {okCount > 0 && !overdueCount && !dueSoonCount && (
            <span style={{ fontSize: 8, color: GRN, border: "1px solid " + GRN + "55", background: GRN + "11", padding: "2px 6px", borderRadius: 2, fontWeight: 700, letterSpacing: "0.1em" }}>
              ALL OK
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[["all","All"], ["due_soon","Due / Overdue"], ["overdue","Overdue Only"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ ...btnG, ...sm, ...(filter === v ? { color: ACC, border: "1px solid " + ACC } : {}) }}>
            {l}
          </button>
        ))}
      </div>

      {machineData.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, lineHeight: 1.7, padding: "32px 0", textAlign: "center" }}>
          <div style={{ fontSize: 22, marginBottom: 10 }}>🔔</div>
          No service intervals configured.<br />
          Add oil change, filter, or service intervals in the machine form under Service History.
        </div>
      )}

      {filtered.map(({ machine, items }) => {
        const hasAlert = items.some(i => i.overdue || i.dueSoon);
        return (
          <div key={machine.id} style={{ background: SURF, border: "1px solid " + (items.some(i=>i.overdue) ? RED+"44" : items.some(i=>i.dueSoon) ? ORANGE+"44" : BRD), borderRadius: 2, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{mIcon(machine.type)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: TXT }}>{machine.name}</div>
                <div style={{ fontSize: 9, color: MUT }}>
                  {[machine.make, machine.model, machine.year || null].filter(Boolean).join(" · ")}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                {machine.lastServiceDate && (
                  <div style={{ fontSize: 8, color: MUT, textAlign: "right" }}>
                    <div>last service</div>
                    <div style={{ color: TXT }}>{new Date(machine.lastServiceDate).toLocaleDateString()}</div>
                  </div>
                )}
                <button
                  onClick={() => setServicingId(machine.id)}
                  style={{ ...btnA, ...sm, fontSize: 8, background: hasAlert ? undefined : "#1a2a1a", borderColor: hasAlert ? undefined : GRN + "55" }}
                >
                  ✓ Mark Serviced
                </button>
              </div>
            </div>

            {items.map((item, idx) => {
              const dotColor = item.overdue ? RED : item.dueSoon ? ORANGE : item.noDate ? MUT : GRN;
              return (
                <div key={idx} style={{ marginBottom: idx < items.length - 1 ? 10 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                      <span style={{ fontSize: 10, color: TXT, fontWeight: 700 }}>{item.label}</span>
                      {item.overdue  && <span style={{ fontSize: 8, color: RED,    fontWeight: 700, letterSpacing: "0.1em" }}>OVERDUE</span>}
                      {item.dueSoon && !item.overdue && <span style={{ fontSize: 8, color: ORANGE, fontWeight: 700, letterSpacing: "0.1em" }}>DUE SOON</span>}
                    </div>
                    <span style={{ fontSize: 8, color: MUT }}>{item.due}</span>
                  </div>
                  {!item.noDate && (
                    <div style={{ height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden", marginBottom: 3 }}>
                      <div style={{ height: "100%", borderRadius: 2, transition: "width 0.3s", width: (item.pct * 100) + "%", background: item.overdue ? RED : item.dueSoon ? ORANGE : GRN }} />
                    </div>
                  )}
                  <div style={{ fontSize: 8, color: MUT }}>{item.current}</div>
                </div>
              );
            })}
          </div>
        );
      })}

      {filtered.length === 0 && machineData.length > 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "24px 0" }}>No machines match this filter.</div>
      )}

      <div style={{ marginTop: 16, fontSize: 9, color: MUT, lineHeight: 1.7 }}>
        Hours-based intervals use total job timer time logged. Set service intervals and last service date in the machine form.
      </div>

      {servicingMachine && (
        <ServiceModal
          machine={servicingMachine}
          onSave={data => markServiced(servicingMachine, data)}
          onClose={() => setServicingId(null)}
        />
      )}
    </div>
  );
}
