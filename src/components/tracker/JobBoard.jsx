import React, { useState, useEffect } from 'react';
import { upsertMachine } from '../../lib/db';
import { ACC, MUT, BRD, SURF, TXT, GRN, RED, btnG, btnA, sm } from '../../lib/styles';
import { STATUSES, SCOL, SBG_ } from '../../lib/constants';
import { SL, Empty, SkullRating, Divider } from '../ui/shared';
import { mIcon } from '../../lib/helpers';
import StatusBadge from '../ui/StatusBadge';

const ORANGE = "#e8a20a";

function parseDuration(h, m) {
  return (parseInt(h) || 0) * 3600 + (parseInt(m) || 0) * 60;
}

function fmt(secs) {
  const neg = secs < 0;
  const abs = Math.abs(secs);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const base = h > 0
    ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`
    : `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  return (neg ? "-" : "") + base;
}

function JobTimer({ machine, onUpdate }) {
  const t = machine.jobTimer || { duration: 0, elapsed: 0, startedAt: null, status: "idle" };

  const getElapsed = () => {
    if (t.status === "running" && t.startedAt) {
      return t.elapsed + Math.floor((Date.now() - new Date(t.startedAt).getTime()) / 1000);
    }
    return t.elapsed || 0;
  };

  const [display, setDisplay] = useState(getElapsed);
  const [hours, setHours] = useState("");
  const [mins, setMins] = useState("");

  useEffect(() => {
    setDisplay(getElapsed());
    if (t.status !== "running") return;
    const iv = setInterval(() => setDisplay(getElapsed()), 1000);
    return () => clearInterval(iv);
  }, [t.status, t.startedAt, t.elapsed]);

  const save = async (updates) => {
    const updated = { ...machine, jobTimer: { ...t, ...updates } };
    onUpdate(updated);
    await upsertMachine(updated);
  };

  const handleStart = async () => {
    if (t.status === "idle" && !t.duration) {
      const dur = parseDuration(hours, mins);
      if (!dur) return;
      await save({ duration: dur, elapsed: 0, startedAt: new Date().toISOString(), status: "running" });
    } else {
      await save({ startedAt: new Date().toISOString(), status: "running" });
    }
  };

  const handlePause = async () => {
    await save({ elapsed: getElapsed(), startedAt: null, status: "paused" });
  };

  const handleStop = async () => {
    await save({ duration: 0, elapsed: 0, startedAt: null, status: "idle" });
    setHours(""); setMins("");
  };

  const handleFinish = async () => {
    const updated = { ...machine, status: "Complete", jobTimer: { ...t, elapsed: getElapsed(), startedAt: null, status: "done" } };
    onUpdate(updated);
    await upsertMachine(updated);
  };

  const remaining = t.duration - display;
  const pct = t.duration > 0 ? remaining / t.duration : 1;
  const glowColor = t.status === "done" ? GRN : pct > 0.5 ? GRN : pct > 0.2 ? ORANGE : RED;
  const isOverdue = remaining < 0 && t.status === "running";

  if (t.status === "idle" && !t.duration) {
    return (
      <div style={{ marginTop: 10, padding: "10px 12px", background: "#0d0d0d", border: "1px solid #252525", borderRadius: 2 }}>
        <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Job Timer</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="number" min="0" max="99" placeholder="0"
              value={hours} onChange={e => setHours(e.target.value)}
              style={{ width: 44, background: "#111", border: "1px solid #333", borderRadius: 2, color: TXT, fontSize: 11, padding: "4px 6px", fontFamily: "'IBM Plex Mono',monospace", textAlign: "center" }}
            />
            <span style={{ fontSize: 9, color: MUT }}>h</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="number" min="0" max="59" placeholder="0"
              value={mins} onChange={e => setMins(e.target.value)}
              style={{ width: 44, background: "#111", border: "1px solid #333", borderRadius: 2, color: TXT, fontSize: 11, padding: "4px 6px", fontFamily: "'IBM Plex Mono',monospace", textAlign: "center" }}
            />
            <span style={{ fontSize: 9, color: MUT }}>m</span>
          </div>
          <button onClick={handleStart} disabled={!hours && !mins} style={{ ...btnA, ...sm, opacity: (!hours && !mins) ? 0.4 : 1 }}>▶ Start</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 10, padding: "10px 12px", background: "#0d0d0d", border: `1px solid ${glowColor}44`, borderRadius: 2, boxShadow: `0 0 10px ${glowColor}22` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {t.status === "done" ? "Completed" : t.status === "paused" ? "Paused" : isOverdue ? "Overdue" : "Time Remaining"}
        </div>
        {t.status !== "done" && (
          <div style={{
            fontSize: 26, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace",
            color: glowColor,
            textShadow: `0 0 10px ${glowColor}88`,
            animation: isOverdue ? "pulse 1s infinite" : "none",
          }}>
            {t.status === "paused" ? fmt(remaining) : fmt(remaining)}
          </div>
        )}
        {t.status === "done" && (
          <div style={{ fontSize: 11, color: GRN, fontWeight: 700, letterSpacing: "0.08em" }}>✓ JOB COMPLETE</div>
        )}
      </div>
      {t.status !== "done" && t.duration > 0 && (
        <div style={{ height: 3, background: "#1a1a1a", borderRadius: 2, marginBottom: 10, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 2,
            width: `${Math.max(0, Math.min(100, (remaining / t.duration) * 100))}%`,
            background: glowColor,
            boxShadow: `0 0 6px ${glowColor}`,
            transition: "width 1s linear, background 0.5s",
          }} />
        </div>
      )}
      {t.status !== "done" && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {t.status === "running" && <button onClick={handlePause} style={{ ...btnG, ...sm }}>⏸ Pause</button>}
          {t.status === "paused"  && <button onClick={handleStart} style={{ ...btnA, ...sm }}>▶ Resume</button>}
          <button onClick={handleStop} style={{ ...btnG, ...sm }}>⏹ Reset</button>
          <button onClick={handleFinish} style={{ ...btnA, ...sm, background: GRN, borderColor: GRN, color: "#000" }}>✓ Finish Job</button>
        </div>
      )}
    </div>
  );
}

function JobBoard({ machines, setMachines }) {
  const updateM = (updated) => setMachines(prev => prev.map(x => x.id === updated.id ? updated : x));
  const updateStatus = async (m, status) => { const u = { ...m, status }; await upsertMachine(u); setMachines(prev => prev.map(x => x.id === m.id ? u : x)); };
  const updateRage = async (m, rage) => { const u = { ...m, rage }; await upsertMachine(u); setMachines(prev => prev.map(x => x.id === m.id ? u : x)); };
  const groups = STATUSES.map(s => ({ status: s, items: machines.filter(m => (m.status || "Active") === s) }));

  return (
    <div style={{ padding: 16, flex: 1 }}>
      <SL t="Job Board" />
      {machines.length === 0 && <Empty t="No machines yet" />}
      {groups.map(({ status, items }) => items.length === 0 ? null : (
        <div key={status} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <StatusBadge status={status} />
            <span style={{ fontSize: 9, color: MUT, letterSpacing: "0.1em" }}>{items.length} machine{items.length !== 1 ? "s" : ""}</span>
          </div>
          {items.map(m => (
            <div key={m.id} style={{ background: SURF, border: "1px solid " + BRD, borderRadius: 3, marginBottom: 8, padding: "13px 14px" }}>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: 17 }}>{mIcon(m.type)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TXT, marginBottom: 2 }}>{m.name}</div>
                  <div style={{ fontSize: 9, color: MUT, marginBottom: 8 }}>{[m.source, m.make, m.model].filter(Boolean).join("  ·  ")}</div>
                  {m.notes && <div style={{ fontSize: 11, color: "#777", lineHeight: 1.5, marginBottom: 8 }}>{m.notes}</div>}
                  <SkullRating value={m.rage || 0} onChange={r => updateRage(m, r)} />
                  <JobTimer machine={m} onUpdate={updateM} />
                  <Divider />
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {STATUSES.filter(s => s !== status).map(s => (
                      <button key={s} onClick={() => updateStatus(m, s)} style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 9px", borderRadius: 2, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace", background: SBG_[s], color: SCOL[s], border: "1px solid " + SCOL[s] + "55" }}>
                        → {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default JobBoard;
