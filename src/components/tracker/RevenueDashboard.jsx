import React, { useMemo, useState } from 'react';
import { ACC, MUT, BRD, TXT, GRN, RED, SURF, btnA, btnG, sm } from '../../lib/styles';
import { SL } from '../ui/shared';
import { effectiveTier } from '../../lib/gates';
import { mIcon } from '../../lib/helpers';

const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function fmtHrs(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0 && m > 0) return h + "h " + m + "m";
  if (h > 0) return h + "h";
  if (m > 0) return m + "m";
  return "<1m";
}

const PERIODS = [["week","This Week"], ["month","This Month"], ["all","All Time"]];

export default function RevenueDashboard({ machines, company, profile, onGoToBilling }) {
  const [period, setPeriod] = useState("month");

  const tier = effectiveTier(profile, company);
  if (tier === "free") {
    return (
      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center" }}>
        <div style={{ fontSize: 28 }}>📊</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: TXT }}>Revenue Dashboard</div>
        <div style={{ fontSize: 10, color: MUT, maxWidth: 280, lineHeight: 1.7 }}>
          Track billable hours, revenue, and work sessions across all machines. Available on the Enthusiast plan and above.
        </div>
        <button onClick={onGoToBilling} style={{ ...btnA, ...sm, color: "#fff" }}>
          View Plans
        </button>
      </div>
    );
  }

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

  const now = new Date();
  const filtered = useMemo(() => {
    return allEntries.filter(e => {
      const d = new Date(e.completedAt);
      if (period === "week")  return (now - d) <= 7 * 86400000;
      if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [allEntries, period]);

  const totalSecs  = filtered.reduce((s, e) => s + (e.seconds || 0), 0);
  const totalHrs   = totalSecs / 3600;
  const rate       = company?.hourly_rate || 0;
  const taxRate    = company?.tax_rate || 0;
  const taxLabel   = company?.tax_label || "Tax";
  const revenue    = totalHrs * rate;
  const tax        = revenue * (taxRate / 100);

  const byMachine = useMemo(() => {
    const map = {};
    for (const e of filtered) {
      if (!map[e.machineId]) map[e.machineId] = { name: e.machineName, type: e.machineType, secs: 0, sessions: 0 };
      map[e.machineId].secs += e.seconds || 0;
      map[e.machineId].sessions++;
    }
    return Object.values(map).sort((a, b) => b.secs - a.secs);
  }, [filtered]);

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <SL t="Revenue" />
        <div style={{ display: "flex", gap: 6 }}>
          {PERIODS.map(([v,l]) => (
            <button key={v} onClick={() => setPeriod(v)} style={{ ...btnG, ...sm, ...(period === v ? { color: ACC, border: "1px solid " + ACC } : {}) }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <div style={{ background: SURF, border: "1px solid " + BRD, borderRadius: 2, padding: "12px 14px" }}>
          <div style={{ fontSize: 9, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Hours Logged</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: GRN, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1 }}>{totalHrs.toFixed(1)}<span style={{ fontSize: 12 }}>h</span></div>
          <div style={{ fontSize: 8, color: MUT, marginTop: 4 }}>{filtered.length} session{filtered.length !== 1 ? "s" : ""}</div>
        </div>

        {rate > 0 ? (
          <div style={{ background: SURF, border: "1px solid " + BRD, borderRadius: 2, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Gross Revenue</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: ACC, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1 }}>${revenue.toFixed(0)}</div>
            {taxRate > 0
              ? <div style={{ fontSize: 8, color: MUT, marginTop: 4 }}>+{taxLabel} ${tax.toFixed(0)} = ${(revenue + tax).toFixed(0)} inc.</div>
              : <div style={{ fontSize: 8, color: MUT, marginTop: 4 }}>${(rate).toFixed(0)}/hr labour rate</div>
            }
          </div>
        ) : (
          <div style={{ background: SURF, border: "1px solid " + BRD, borderRadius: 2, padding: "12px 14px", display: "flex", alignItems: "center" }}>
            <div style={{ fontSize: 9, color: MUT, lineHeight: 1.6 }}>
              Set a Labour Rate in <span style={{ color: TXT }}>Settings → Company</span> to see revenue.
            </div>
          </div>
        )}
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
                    <span style={{ fontSize: 10, color: GRN, fontWeight: 700 }}>{fmtHrs(m.secs)}</span>
                    {rate > 0 && <span style={{ fontSize: 9, color: MUT }}> · ${(hrs * rate).toFixed(0)}</span>}
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
