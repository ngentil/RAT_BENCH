import React, { useMemo, useState, useEffect } from 'react';
import { ACC, MUT, BRD, TXT, GRN, RED, SURF, inp, btnA, btnG, btnD, sm, col, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { SL, FL } from '../ui/shared';
import { mIcon, getStorageStatus } from '../../lib/helpers';
import { daysSinceLocal } from '../../lib/dates';
import { toastError } from '../../lib/toast';
import UpgradeBanner from '../ui/UpgradeBanner';
import { upsertMachine } from '../../lib/db';
import { canUse, effectiveTier } from '../../lib/gates';
import { getAllActiveBookings } from '../../lib/db/bookings';
import { getConsumables } from '../../lib/db/consumables';
import { CATEGORY_ICON } from '../../lib/consumableTypes';

const ORANGE = "#e8870a";
const BLUE   = "#3a7bd5";

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
      const remaining = dueAt - totalHrs;
      const remStr = overdue ? (totalHrs - dueAt).toFixed(1) + "h overdue" : remaining.toFixed(1) + "h remaining";
      items.push({ label, current: totalHrs.toFixed(1) + "h logged", due: "due at " + dueAt.toFixed(0) + "h", rem: remStr, pct: Math.min(pct, 1), overdue, dueSoon: pct >= 0.8 && !overdue });
    } else {
      if (!lastDate) {
        items.push({ label, current: "no service date set", due: "every " + n + "mo", pct: 0, overdue: false, dueSoon: false, noDate: true });
        return;
      }
      const daysSince = daysSinceLocal(lastDate) ?? 0;
      const dueDays   = n * 30;
      const pct       = Math.min(daysSince / dueDays, 1.2);
      const overdue   = daysSince >= dueDays;
      const remDays   = dueDays - daysSince;
      const remStr    = overdue ? (daysSince - dueDays) + "d overdue" : remDays + "d remaining";
      items.push({ label, current: daysSince + "d since service", due: "every " + n + "mo", rem: remStr, pct: Math.min(pct, 1), overdue, dueSoon: pct >= 0.8 && !overdue });
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
    try {
      await onSave({ lastServiceDate: date, lastServiceOdo: parseFloat(odo) || 0, lastServiceNotes: notes });
      onClose();
    } catch (e) {
      console.error("mark serviced:", e);
      toastError("Didn't save — check connection and try again");
    }
    setSaving(false);
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

export default function ServiceReminders({ machines, setMachines, profile, company, onGoToBilling }) {
  const [filter,      setFilter]      = useState("all");
  const [servicingId, setServicingId] = useState(null);
  const [activeBookings, setActiveBookings] = useState([]);
  const [consumables,   setConsumables]   = useState([]);

  const isFree = effectiveTier(profile, company) === "free";
  const storagePolicyEnabled = canUse('storage_policy', profile, company) && !!(profile?.storage_policy_enabled);

  useEffect(() => {
    if (!storagePolicyEnabled) return;
    getAllActiveBookings().then(bs => setActiveBookings(bs || []));
  }, [storagePolicyEnabled]);

  useEffect(() => {
    getConsumables().then(d => setConsumables(d || []));
  }, []);

  const stockAlerts = useMemo(() =>
    consumables
      .filter(c =>
        (c.minQuantity != null && c.quantity < c.minQuantity) ||
        (c.maxQuantity != null && c.quantity > c.maxQuantity)
      )
      .map(c => ({
        ...c,
        isLow:   c.minQuantity != null && c.quantity < c.minQuantity,
        isOver:  c.maxQuantity != null && c.quantity > c.maxQuantity,
      })),
  [consumables]);

  const filteredStockAlerts = useMemo(() => {
    if (filter === "overdue")  return stockAlerts.filter(a => a.isLow);
    if (filter === "due_soon") return stockAlerts.filter(a => a.isLow || a.isOver);
    return stockAlerts;
  }, [stockAlerts, filter]);

  const bookingByMachineId = useMemo(() => {
    const map = {};
    activeBookings.forEach(b => { map[b.machine_id] = b; });
    return map;
  }, [activeBookings]);

  const machineData = useMemo(() =>
    machines
      .map(m => {
        const items = getMachineReminders(m);
        if (storagePolicyEnabled) {
          const bk = bookingByMachineId[m.id];
          const st = bk ? getStorageStatus(bk) : null;
          if (st?.escalated) {
            items.push({ label: "Storage — Flagged for sale", current: st.daysIn + "d in shop", due: "escalated at " + (bk.storage_tier || "Bench") + " tier", rem: "$" + st.accrued.toFixed(0) + " accrued", pct: 1, overdue: true, dueSoon: false });
          } else if (st?.active && st.freeDaysLeft === 0) {
            items.push({ label: "Storage — Billing active", current: st.daysIn + "d in shop", due: bk.storage_tier + " tier", rem: "$" + st.accrued.toFixed(0) + " accrued · $" + st.dailyRate + "/day", pct: 0.9, overdue: false, dueSoon: true });
          }
        }
        return { machine: m, items };
      })
      .filter(({ items }) => items.length > 0),
  [machines, storagePolicyEnabled, bookingByMachineId]);

  const filtered = useMemo(() => {
    if (filter === "overdue")  return machineData.filter(({ items }) => items.some(i => i.overdue));
    if (filter === "due_soon") return machineData.filter(({ items }) => items.some(i => i.dueSoon || i.overdue));
    return machineData;
  }, [machineData, filter]);

  // Free tier: 1 machine, 1 reminder item
  const cappedFiltered = isFree ? filtered.slice(0, 1).map(d => ({ ...d, items: d.items.slice(0, 1) })) : filtered;
  const hiddenMachines = isFree ? Math.max(0, filtered.length - 1) : 0;
  const hiddenItems    = isFree && filtered[0] ? Math.max(0, filtered[0].items.length - 1) : 0;

  const machineOverdueCount = machineData.filter(({ items }) => items.some(i => i.overdue)).length;
  const machineDueSoonCount = machineData.filter(({ items }) => items.some(i => i.dueSoon)).length;
  const okCount             = machineData.filter(({ items }) => !items.some(i => i.overdue || i.dueSoon)).length;
  const stockLowCount  = stockAlerts.filter(a => a.isLow).length;
  const stockOverCount = stockAlerts.filter(a => a.isOver && !a.isLow).length;
  const overdueCount   = machineOverdueCount + stockLowCount;
  const dueSoonCount   = machineDueSoonCount + stockOverCount;

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
          {okCount > 0 && !overdueCount && !dueSoonCount && stockAlerts.length === 0 && (
            <span style={{ fontSize: 8, color: GRN, border: "1px solid " + GRN + "55", background: GRN + "11", padding: "2px 6px", borderRadius: 2, fontWeight: 700, letterSpacing: "0.1em" }}>
              ALL OK
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 14 }}>
        {[["all","All"], ["due_soon","Due / Overdue"], ["overdue","Overdue Only"]].map(([v,l], idx, arr) => {
          const isFirst = idx === 0;
          const isLast  = idx === arr.length - 1;
          const isActive = filter === v;
          return (
            <button key={v} onClick={() => setFilter(v)} style={{ ...btnG, ...sm, borderRadius: isFirst ? "2px 0 0 2px" : isLast ? "0 2px 2px 0" : 0, borderRight: isLast ? undefined : "none", ...(isActive ? { background: ACC+"18", color: ACC, border: "1px solid "+ACC, borderRight: isLast ? "1px solid "+ACC : "none" } : {}) }}>
              {l}
            </button>
          );
        })}
      </div>

      {machineData.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, lineHeight: 1.7, padding: "32px 0", textAlign: "center" }}>
          <div style={{ fontSize: 22, marginBottom: 10 }}>🔔</div>
          No service intervals configured.<br />
          Add oil change, filter, or service intervals in the machine form under Service History.
        </div>
      )}

      {isFree && machineData.length > 0 && <UpgradeBanner text="Upgrade to track service reminders across all your machines." onUpgrade={onGoToBilling} />}

      {cappedFiltered.map(({ machine, items }) => {
        const hasAlert = items.some(i => i.overdue || i.dueSoon);
        const totalHrs = totalLoggedHours(machine);
        return (
          <div key={machine.id} style={{ background: SURF, border: "1px solid " + (items.some(i=>i.overdue) ? RED+"44" : items.some(i=>i.dueSoon) ? ORANGE+"44" : BRD), borderLeft: "3px solid " + (items.some(i=>i.overdue) ? RED : items.some(i=>i.dueSoon) ? ORANGE : GRN), borderRadius: 2, padding: "12px 14px", marginBottom: 10, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{mIcon(machine.type)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: TXT }}>{machine.name}</div>
                <div style={{ fontSize: 9, color: MUT }}>
                  {[machine.make, machine.model, machine.year || null].filter(Boolean).join(" · ")}
                </div>
                {totalHrs > 0 && <div style={{ fontSize: 8, color: GRN, marginTop: 2 }}>{totalHrs.toFixed(1)}h total logged</div>}
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
                    <div style={{ height: 5, background: "#1a1a1a", borderRadius: 2, overflow: "hidden", marginBottom: 3 }}>
                      <div style={{ height: "100%", borderRadius: 2, transition: "width 0.3s", width: (item.pct * 100) + "%", background: item.overdue ? RED : item.dueSoon ? ORANGE : GRN, boxShadow: item.overdue ? "0 0 6px "+RED+"88" : item.dueSoon ? "0 0 6px "+ORANGE+"88" : "0 0 6px "+GRN+"44" }} />
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 8, color: MUT }}>{item.current}</div>
                    {item.rem && <div style={{ fontSize: 8, color: item.overdue ? RED : item.dueSoon ? ORANGE : MUT, fontWeight: item.overdue || item.dueSoon ? 700 : 400 }}>{item.rem}</div>}
                  </div>
                </div>
              );
            })}

            {hiddenItems > 0 && <UpgradeBanner text={`+${hiddenItems} more interval${hiddenItems !== 1 ? "s" : ""} — upgrade to see all`} onUpgrade={onGoToBilling} marginBottom={0} />}
          </div>
        );
      })}

      {hiddenMachines > 0 && <UpgradeBanner text={`+${hiddenMachines} more machine${hiddenMachines !== 1 ? "s" : ""} with service reminders`} onUpgrade={onGoToBilling} marginBottom={10} />}

      {filtered.length === 0 && machineData.length > 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "24px 0" }}>No machines match this filter.</div>
      )}

      {filteredStockAlerts.length > 0 && (
        <div style={{ marginTop: cappedFiltered.length > 0 ? 20 : 0 }}>
          <div style={{ fontSize: 9, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
            📦 Stock Alerts
          </div>
          {filteredStockAlerts.map(c => {
            const icon  = CATEGORY_ICON[c.category] || '📦';
            const color = c.isLow ? RED : BLUE;
            const badge = c.quantity === 0 ? 'OUT' : c.isLow ? 'LOW' : 'OVER';
            const parNote = c.isLow && c.minQuantity != null
              ? `min ${c.minQuantity} ${c.unit}`
              : c.isOver && c.maxQuantity != null
              ? `max ${c.maxQuantity} ${c.unit}`
              : '';
            return (
              <div key={c.id} style={{ background: SURF, border: "1px solid " + color + "33", borderLeft: "3px solid " + color, borderRadius: 2, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{c.name}</span>
                    <span style={{ fontSize: 7, color, border: "1px solid " + color + "55", borderRadius: 2, padding: "1px 4px", letterSpacing: "0.1em", fontWeight: 700 }}>{badge}</span>
                  </div>
                  <div style={{ fontSize: 8, color: MUT, marginTop: 2 }}>
                    {c.category}{c.brand ? " · " + c.brand : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "'IBM Plex Mono',monospace" }}>
                    {Number(c.quantity).toLocaleString()} {c.unit}
                  </div>
                  {parNote && <div style={{ fontSize: 8, color: MUT }}>{parNote}</div>}
                </div>
              </div>
            );
          })}
        </div>
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
