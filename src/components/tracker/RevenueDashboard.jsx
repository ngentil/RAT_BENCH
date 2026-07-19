import React, { useMemo, useState, useEffect } from 'react';
import { ACC, MUT, BRD, TXT, GRN, RED, SURF, btnA, btnG, sm } from '../../lib/styles';
import { SL } from '../ui/shared';
import TabGuide from '../ui/TabGuide';
import { getPref } from '../../lib/db/preferences';
import { mIcon, getClosedBookingFee } from '../../lib/helpers';
import { parseLocalDate, endOfLocalDay } from '../../lib/dates';
import { getTiers } from '../../lib/storageTiers';
import { getClosedBookings } from '../../lib/db/bookings';

const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Shared period filter. "week" = calendar week from Monday 00:00 local;
// custom bounds parse as LOCAL days (date-only strings parse as UTC natively,
// which excluded same-day entries for anyone east of UTC).
function inPeriod(dateStr, period, customFrom, customTo, now) {
  if (period === "all") return true;
  const d = new Date(dateStr);
  if (isNaN(d)) return false;
  if (period === "week") {
    const dow = (now.getDay() + 6) % 7; // Monday = 0
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow);
    return d >= start && d <= now;
  }
  if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  if (period === "custom") {
    if (customFrom) { const f = parseLocalDate(customFrom); if (f && d < f) return false; }
    if (customTo)   { const t = endOfLocalDay(customTo);    if (t && d > t) return false; }
    return true;
  }
  return true;
}

function fmtHrs(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0 && m > 0) return h + "h " + m + "m";
  if (h > 0) return h + "h";
  if (m > 0 && s > 0) return m + "m " + s + "s";
  if (m > 0) return m + "m";
  if (s > 0) return s + "s";
  return "<1m";
}

const PERIODS = [["week","This Week"], ["month","This Month"], ["all","All Time"], ["custom","Custom"]];

export default function RevenueDashboard({ machines, company, profile }) {
  const [period, setPeriod] = useState("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [closedBookings, setClosedBookings] = useState([]);

  const storagePolicyEnabled = !!(profile?.storage_policy_enabled);

  useEffect(() => {
    if (!storagePolicyEnabled) return;
    getClosedBookings().then(bs => setClosedBookings(bs || []));
  }, [storagePolicyEnabled]);

  const allEntries = useMemo(() =>
    machines.flatMap(m =>
      (m.timeLog || []).map(e => ({
        ...e,
        machineId: m.id,
        machineName: m.name,
        machineType: m.type,
      }))
    ).filter(e => e.completedAt)
     .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)),
  [machines]);

  // Re-evaluate period windows every minute so a dashboard left open doesn't
  // show stale week/month boundaries.
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNowTick(Date.now()), 60000);
    return () => clearInterval(iv);
  }, []);
  const now = new Date(nowTick);

  const filtered = useMemo(() => {
    return allEntries.filter(e => inPeriod(e.completedAt, period, customFrom, customTo, now));
  }, [allEntries, period, customFrom, customTo, nowTick]);

  const rate       = parseFloat(company?.hourly_rate) || 0;
  const taxRate    = parseFloat(company?.tax_rate) || 0;
  const taxLabel   = company?.tax_label || "Tax";
  const totalSecs  = filtered.reduce((s, e) => s + (e.seconds || 0), 0);
  const totalHrs   = totalSecs / 3600;
  const labourRev  = totalHrs * rate;

  const { partsRev, partsCost } = useMemo(() => {
    let rev = 0, cost = 0;
    machines.forEach(m => {
      (m.parts || []).forEach(p => {
        const usedAt = p.usedAt || p.addedAt;
        // Undated legacy parts can't be placed in a window, but they belong in All Time
        if (usedAt) { if (!inPeriod(usedAt, period, customFrom, customTo, now)) return; }
        else if (period !== "all") return;
        const qty = (p.qty == null || p.qty === '') ? 1 : (Number(p.qty) || 0);
        rev  += (parseFloat(p.sellPrice) || 0) * qty;
        cost += (parseFloat(p.buyPrice)  || 0) * qty;
      });
    });
    return { partsRev: rev, partsCost: cost };
  }, [machines, period, customFrom, customTo, nowTick]);

  const filteredBookings = useMemo(() => {
    if (!storagePolicyEnabled) return [];
    return closedBookings.filter(b => inPeriod(b.collected_at, period, customFrom, customTo, now));
  }, [closedBookings, period, customFrom, customTo, storagePolicyEnabled, nowTick]);

  // Same tiers the customer was actually charged with — not the defaults
  const activeTiers = useMemo(() => getTiers(profile?.storage_tiers), [profile?.storage_tiers]);

  const { storageRev, storageByMachineId } = useMemo(() => {
    let rev = 0;
    const byMid = {};
    for (const b of filteredBookings) {
      const fee = getClosedBookingFee(b, activeTiers);
      rev += fee;
      if (fee > 0) byMid[b.machine_id] = (byMid[b.machine_id] || 0) + fee;
    }
    return { storageRev: rev, storageByMachineId: byMid };
  }, [filteredBookings, activeTiers]);

  const totalRevenue = labourRev + partsRev + storageRev;
  const tax          = totalRevenue * (taxRate / 100);
  const grossProfit  = labourRev + partsRev + storageRev - partsCost;

  const byMachine = useMemo(() => {
    const map = {};
    for (const e of filtered) {
      if (!map[e.machineId]) map[e.machineId] = { name: e.machineName, type: e.machineType, secs: 0, sessions: 0, storageRev: 0 };
      map[e.machineId].secs += e.seconds || 0;
      map[e.machineId].sessions++;
    }
    for (const [mid, sRev] of Object.entries(storageByMachineId)) {
      if (map[mid]) {
        map[mid].storageRev = sRev;
      } else {
        const machine = machines.find(m => m.id === mid);
        if (machine) map[mid] = { name: machine.name, type: machine.type, secs: 0, sessions: 0, storageRev: sRev };
      }
    }
    return Object.values(map).sort((a, b) => b.secs - a.secs);
  }, [filtered, storageByMachineId, machines]);

  const byDow = useMemo(() => {
    const days = [0,0,0,0,0,0,0];
    for (const e of filtered) {
      days[new Date(e.completedAt).getDay()] += (e.seconds || 0);
    }
    return days;
  }, [filtered]);
  const maxDow = Math.max(...byDow, 1);

  const lbl = { fontSize: 9, color: ACC, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 };

  return (
    <div style={{ padding: 16, flex: 1, overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10 }}>
        <SL t="Revenue" />
        <div style={{ display: "flex", gap: 0, flexShrink: 0 }}>
          {PERIODS.map(([v,l], i) => (
            <button key={v} onClick={() => setPeriod(v)} style={{ ...btnG, ...sm, borderRadius: i === 0 ? "2px 0 0 2px" : i === PERIODS.length-1 ? "0 2px 2px 0" : 0, borderRight: i < PERIODS.length-1 ? "none" : undefined, ...(period === v ? { background: ACC+"18", color: ACC } : {}) }}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <TabGuide storageKey="rat_tut_revenue" variant="info" title="your revenue" lines={["log jobs with time + parts in Garage","earnings flow here — filter by week · month · all"]} userId={profile?.id} initialDone={getPref(profile,"rat_tut_revenue",false)} />

      {period === "custom" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
          <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
            style={{ background: "#0a0a0a", border: "1px solid #252525", color: TXT, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, padding: "5px 8px", borderRadius: 2, outline: "none" }} />
          <span style={{ fontSize: 9, color: MUT }}>to</span>
          <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
            style={{ background: "#0a0a0a", border: "1px solid #252525", color: TXT, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, padding: "5px 8px", borderRadius: 2, outline: "none" }} />
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <div style={{ background: SURF, border: "1px solid " + BRD, borderTop: "2px solid " + GRN, borderRadius: 2, padding: "12px 14px", boxShadow: "0 0 12px " + GRN + "18" }}>
          <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Hours Logged</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: GRN, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1, letterSpacing: "-0.02em" }}>{totalHrs.toFixed(1)}<span style={{ fontSize: 12, color: MUT }}>h</span></div>
          <div style={{ fontSize: 8, color: MUT, marginTop: 4 }}>{filtered.length} session{filtered.length !== 1 ? "s" : ""}</div>
        </div>

        {rate > 0 ? (
          <div style={{ background: SURF, border: "1px solid " + BRD, borderTop: "2px solid " + ACC, borderRadius: 2, padding: "12px 14px", boxShadow: "0 0 12px " + ACC + "18" }}>
            <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Gross Revenue</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: ACC, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1, letterSpacing: "-0.02em" }}>${totalRevenue.toFixed(0)}</div>
            {taxRate > 0
              ? <div style={{ fontSize: 8, color: MUT, marginTop: 4 }}>+{taxLabel} ${tax.toFixed(0)} = ${(totalRevenue + tax).toFixed(0)} inc.</div>
              : <div style={{ fontSize: 8, color: MUT, marginTop: 4 }}>${rate.toFixed(0)}/hr</div>
            }
          </div>
        ) : (
          <div style={{ background: SURF, border: "1px solid " + BRD, borderTop: "2px solid #333", borderRadius: 2, padding: "12px 14px", display: "flex", alignItems: "center" }}>
            <div style={{ fontSize: 9, color: MUT, lineHeight: 1.6 }}>
              Set a Labour Rate in <span style={{ color: TXT }}>Settings → Company</span> to see revenue.
            </div>
          </div>
        )}

        {partsRev > 0 && (
          <div style={{ background: SURF, border: "1px solid " + BRD, borderTop: "2px solid " + ACC, borderRadius: 2, padding: "12px 14px", boxShadow: "0 0 12px " + ACC + "18" }}>
            <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Parts &amp; Consumables</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: ACC, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1, letterSpacing: "-0.02em" }}>${partsRev.toFixed(0)}</div>
            <div style={{ fontSize: 8, color: MUT, marginTop: 4 }}>Stock Cost ${partsCost.toFixed(0)}</div>
          </div>
        )}

        {storageRev > 0 && (
          <div style={{ background: SURF, border: "1px solid " + BRD, borderTop: "2px solid " + ACC, borderRadius: 2, padding: "12px 14px", boxShadow: "0 0 12px " + ACC + "18" }}>
            <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Storage Revenue</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: ACC, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1, letterSpacing: "-0.02em" }}>${storageRev.toFixed(0)}</div>
            <div style={{ fontSize: 8, color: MUT, marginTop: 4 }}>{filteredBookings.length} collected booking{filteredBookings.length !== 1 ? "s" : ""}</div>
          </div>
        )}

        {(grossProfit > 0 || partsCost > 0) && (() => {
          const profitColor = grossProfit >= 0 ? GRN : RED;
          const label = [labourRev > 0 && "Labour", partsRev > 0 && "Parts", storageRev > 0 && "Storage"].filter(Boolean).join(" + ") + (partsCost > 0 ? " − Cost" : "");
          return (
            <div style={{ background: SURF, border: "1px solid " + BRD, borderTop: "2px solid " + profitColor, borderRadius: 2, padding: "12px 14px", boxShadow: "0 0 12px " + profitColor + "18" }}>
              <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Gross Profit</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: profitColor, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1, letterSpacing: "-0.02em" }}>${grossProfit.toFixed(0)}</div>
              <div style={{ fontSize: 8, color: MUT, marginTop: 4 }}>{label}</div>
            </div>
          );
        })()}
      </div>

      {/* By machine */}
      {byMachine.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={lbl}>By Machine</div>
          {byMachine.map((m, i) => {
            const hrs = m.secs / 3600;
            const pct = totalSecs > 0 ? m.secs / totalSecs : 0;
            return (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13 }}>{mIcon(m.type)}</span>
                    <span style={{ fontSize: 10, color: TXT, fontWeight: 700 }}>{m.name}</span>
                    <span style={{ fontSize: 8, color: MUT }}>{m.sessions} session{m.sessions !== 1 ? "s" : ""}</span>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {m.secs > 0 && <span style={{ fontSize: 10, color: GRN, fontWeight: 700 }}>{fmtHrs(m.secs)}</span>}
                    {rate > 0 && m.secs > 0 && <span style={{ fontSize: 9, color: MUT }}> · ${(hrs * rate).toFixed(0)}</span>}
                    {m.storageRev > 0 && <span style={{ fontSize: 9, color: ACC, marginLeft: m.secs > 0 ? 6 : 0 }}>🏚 ${m.storageRev.toFixed(0)}</span>}
                  </div>
                </div>
                <div style={{ height: 3, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: ACC, borderRadius: 2, width: (pct * 100) + "%" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Day of week chart */}
      {filtered.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={lbl}>Activity by Day</div>
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 60 }}>
            {byDow.map((secs, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{
                  width: "100%", borderRadius: 2,
                  background: secs > 0 ? ACC : "#1a1a1a",
                  height: secs > 0 ? Math.max(secs / maxDow * 46, 4) : 2,
                  transition: "height 0.3s",
                }} />
                <div style={{ fontSize: 7, color: secs > 0 ? MUT : "#2a2a2a", letterSpacing: "0.05em" }}>{DOW[i]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      {filtered.length > 0 && (
        <div>
          <div style={lbl}>Recent Sessions</div>
          {filtered.slice(0, 15).map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + BRD }}>
              <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                <div style={{ fontSize: 10, color: TXT, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.machineName}</div>
                <div style={{ fontSize: 9, color: MUT }}>
                  {e.jobLabel && e.jobLabel !== "Job" ? e.jobLabel.slice(0, 40) : "General work"}{" · "}
                  {new Date(e.completedAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 10, color: GRN, fontWeight: 700 }}>{fmtHrs(e.seconds || 0)}</div>
                {rate > 0 && <div style={{ fontSize: 9, color: MUT }}>${((e.seconds || 0) / 3600 * rate).toFixed(0)}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "32px 0" }}>
          <div style={{ fontSize: 22, marginBottom: 10 }}>📊</div>
          No sessions recorded {period === "week" ? "this week" : period === "month" ? "this month" : "yet"}.<br />
          Use the Job Timer on the Jobs tab to log work sessions.
        </div>
      )}
    </div>
  );
}
