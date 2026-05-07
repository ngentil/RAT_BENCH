import React, { useState, useEffect } from 'react';
import { upsertMachine } from '../../lib/db';
import { ACC, MUT, BRD, SURF, TXT, GRN, RED, btnG, btnA, sm } from '../../lib/styles';
import { STATUSES, SCOL, SBG_ } from '../../lib/constants';
import { SL, Empty, SkullRating, Divider } from '../ui/shared';
import { mIcon } from '../../lib/helpers';
import StatusBadge from '../ui/StatusBadge';
import { effectiveTier } from '../../lib/gates';

const ORANGE = "#e8a20a";

const COMMON_JOBS = [
  "Diagnosis / Assessment",
  "Tune-up / Service",
  "Oil & Filter Change",
  "Carburetor Clean / Rebuild",
  "Air Filter / Fuel Filter",
  "Blade Service / Sharpen",
  "Deck / Belt Service",
  "Drive System",
  "Ignition / Spark Plugs",
  "Electrical / Charging",
  "Starter / Recoil",
  "Fuel System",
  "Exhaust / Muffler",
  "Repair / Rebuild",
  "Fabrication",
];

function getJobOptions(machine) {
  const seen = new Set();
  const opts = [];
  const add = (value, label) => {
    if (!value || seen.has(value)) return;
    seen.add(value);
    opts.push({ value, label: label || value });
  };
  if (machine.notes) {
    const trimmed = machine.notes.slice(0, 55) + (machine.notes.length > 55 ? "…" : "");
    add(machine.notes.slice(0, 120), `📋 ${trimmed}`);
  }
  (machine.attachments || []).forEach(a => {
    const label = a.description || a.type || a.name;
    if (label) add(label, `🔧 ${label}`);
  });
  (machine.lighting || []).forEach(l => {
    const loc = l.location === "Other" ? (l.locationOther || "Light") : l.location;
    if (loc) add(`Lighting: ${loc}`, `💡 Lighting: ${loc}`);
  });
  if (machine.majorServiceInterval) add("Major Service", "🛠 Major Service");
  COMMON_JOBS.forEach(j => add(j, j));
  return opts;
}

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

function fmtDuration(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function exportInvoice(machine, company) {
  const log = machine.timeLog || [];
  if (!log.length) return;

  const rate = company?.hourly_rate ? parseFloat(company.hourly_rate) : null;
  const taxRate = company?.tax_rate ? parseFloat(company.tax_rate) : null;
  const taxLabel = company?.tax_label || "GST";
  const co = company || {};

  const totalSecs = log.reduce((s, e) => s + (e.seconds || 0), 0);
  const totalHrs = totalSecs / 3600;
  const subtotal = rate !== null ? totalHrs * rate : null;
  const tax = (subtotal !== null && taxRate) ? subtotal * taxRate / 100 : null;
  const total = subtotal !== null ? subtotal + (tax || 0) : null;
  const fmt$ = n => n !== null ? `$${n.toFixed(2)}` : '—';

  const lineItemsHtml = log.map(entry => {
    const hrs = (entry.seconds || 0) / 3600;
    const amount = rate !== null ? hrs * rate : null;
    return `<tr>
      <td>${escHtml(entry.jobLabel || 'Job')}</td>
      <td style="white-space:nowrap">${fmtDuration(entry.seconds || 0)}<span style="color:#aaa;font-size:11px;margin-left:6px">(${hrs.toFixed(2)} hrs)</span></td>
      <td style="white-space:nowrap;color:#888">${rate !== null ? `$${rate.toFixed(2)}/hr` : '—'}</td>
      <td class="amount">${fmt$(amount)}</td>
    </tr>`;
  }).join('');

  const coAddress = [co.address, co.city, co.state, co.postcode, co.country].filter(Boolean).join(', ');
  const coDetail = [co.abn ? `ABN: ${co.abn}` : null, co.phone, co.email].filter(Boolean).join('  ·  ');
  const machineLine = [machine.source, machine.make, machine.model].filter(Boolean).join(' · ');
  const invoiceRef = `${(machine.name || 'INV').replace(/\s+/g,'-').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Invoice — ${escHtml(machine.name)}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;background:#fff;color:#111;padding:48px;max-width:860px;margin:0 auto;font-size:13px}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;gap:24px}
.co-logo{width:64px;height:64px;object-fit:cover;border-radius:4px;margin-bottom:10px;display:block}
.co-name{font-size:20px;font-weight:700;margin-bottom:6px}
.co-detail{font-size:11px;color:#555;line-height:1.8}
.inv-label{font-size:48px;font-weight:900;color:#e8670a;letter-spacing:-0.02em;line-height:1}
.inv-meta{font-size:12px;color:#666;margin-top:10px;text-align:right;line-height:2}
hr{border:none;border-top:2px solid #111;margin:24px 0}
.machine-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;gap:16px}
.machine-name{font-size:17px;font-weight:700;margin-bottom:4px}
.machine-sub{font-size:11px;color:#666}
.total-time{text-align:right;flex-shrink:0}
.total-time-label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px}
.total-time-val{font-size:22px;font-weight:700}
.total-time-hrs{font-size:11px;color:#aaa;margin-top:2px}
table{width:100%;border-collapse:collapse;margin-bottom:16px}
th{background:#f5f5f5;padding:10px 12px;font-size:10px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:#444;border-bottom:1px solid #ccc;text-align:left}
td{padding:10px 12px;border-bottom:1px solid #eee;vertical-align:top}
.amount{text-align:right;font-family:monospace}
.totals-wrap{display:flex;justify-content:flex-end;margin-bottom:8px}
.totals{width:280px;border-collapse:collapse}
.totals td{padding:8px 12px;font-size:13px;border:none}
.totals .subtotal td{color:#555}
.totals .tax-row td{color:#888;font-size:11px}
.totals .grand td{font-size:16px;font-weight:700;border-top:2px solid #111;padding-top:12px}
.no-rate-note{font-size:10px;color:#bbb;text-align:right;margin-bottom:24px}
.footer{margin-top:48px;font-size:11px;color:#ccc;text-align:center;border-top:1px solid #eee;padding-top:20px}
.print-btn{position:fixed;bottom:24px;right:24px;background:#e8670a;color:#fff;border:none;padding:13px 24px;font-size:14px;font-weight:700;border-radius:4px;cursor:pointer;box-shadow:0 4px 16px rgba(232,103,10,0.35)}
@media print{.print-btn{display:none}body{padding:24px}}
</style>
</head>
<body>
<div class="header">
  <div>
    ${co.logo ? `<img class="co-logo" src="${co.logo}" alt=""/>` : ''}
    <div class="co-name">${escHtml(co.name || 'Invoice')}</div>
    ${co.trading_name ? `<div style="font-size:12px;color:#888;margin-bottom:6px">${escHtml(co.trading_name)}</div>` : ''}
    <div class="co-detail">
      ${coDetail ? escHtml(coDetail) + '<br/>' : ''}
      ${coAddress ? escHtml(coAddress) : ''}
    </div>
  </div>
  <div style="text-align:right;flex-shrink:0">
    <div class="inv-label">INVOICE</div>
    <div class="inv-meta">
      Date: ${new Date().toLocaleDateString('en-AU',{day:'2-digit',month:'long',year:'numeric'})}<br/>
      Ref: ${escHtml(invoiceRef)}
    </div>
  </div>
</div>
<hr/>
<div class="machine-row">
  <div>
    <div class="machine-name">${escHtml(machine.name)}</div>
    ${machineLine ? `<div class="machine-sub">${escHtml(machineLine)}</div>` : ''}
  </div>
  <div class="total-time">
    <div class="total-time-label">Total Time</div>
    <div class="total-time-val">${fmtDuration(totalSecs)}</div>
    <div class="total-time-hrs">${totalHrs.toFixed(2)} hrs</div>
  </div>
</div>
<table>
  <thead>
    <tr>
      <th>Job / Task</th>
      <th>Duration</th>
      <th>Rate</th>
      <th class="amount">Amount</th>
    </tr>
  </thead>
  <tbody>
    ${lineItemsHtml}
  </tbody>
</table>
<div class="totals-wrap">
  <table class="totals">
    <tbody>
      ${subtotal !== null ? `<tr class="subtotal"><td>Subtotal</td><td class="amount">${fmt$(subtotal)}</td></tr>` : ''}
      ${tax !== null ? `<tr class="tax-row"><td>${escHtml(taxLabel)} ${taxRate}%</td><td class="amount">${fmt$(tax)}</td></tr>` : ''}
      <tr class="grand">
        <td>${total !== null ? 'Total' : 'Total Hours'}</td>
        <td class="amount">${total !== null ? fmt$(total) : fmtDuration(totalSecs)}</td>
      </tr>
    </tbody>
  </table>
</div>
${!rate ? '<div class="no-rate-note">Set a Labour Rate in Company Settings → Billing Rates to calculate amounts.</div>' : ''}
<div class="footer">Generated by Rat Bench &middot; ratbench.net</div>
<button class="print-btn" onclick="window.print()">🖨️ Print / Save PDF</button>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) { alert("Please allow popups to export the invoice."); return; }
  win.document.write(html);
  win.document.close();
}

const timerSel = {
  width: "100%", background: "#111", border: "1px solid #333", borderRadius: 2,
  color: TXT, fontSize: 10, padding: "5px 6px", fontFamily: "'IBM Plex Mono',monospace",
  cursor: "pointer",
};

function TimeLogSection({ machine, company, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const log = machine.timeLog || [];
  if (!log.length) return null;

  const totalSecs = log.reduce((s, e) => s + (e.seconds || 0), 0);

  const removeEntry = async (entryId) => {
    if (!confirm("Remove this time entry?")) return;
    const updated = { ...machine, timeLog: machine.timeLog.filter(e => e.id !== entryId) };
    onUpdate(updated);
    await upsertMachine(updated);
  };

  return (
    <div style={{ marginTop: 8, padding: "8px 10px", background: "#0a0a0a", border: "1px solid #1e1e1e", borderRadius: 2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          onClick={() => setExpanded(x => !x)}
          style={{ fontSize: 9, color: MUT, cursor: "pointer", userSelect: "none" }}
        >
          {expanded ? "▼" : "▶"}
        </span>
        <span
          onClick={() => setExpanded(x => !x)}
          style={{ fontSize: 9, color: GRN, letterSpacing: "0.06em", flex: 1, cursor: "pointer" }}
        >
          {log.length} session{log.length !== 1 ? "s" : ""} · {fmtDuration(totalSecs)} total
        </span>
        <button
          onClick={() => exportInvoice(machine, company)}
          style={{ ...btnA, ...sm, fontSize: 8 }}
        >
          Export Invoice
        </button>
      </div>
      {expanded && (
        <div style={{ marginTop: 8 }}>
          {log.map((entry, idx) => (
            <div
              key={entry.id || idx}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #181818" }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, color: TXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {entry.jobLabel || "Job"}
                </div>
                <div style={{ fontSize: 8, color: MUT, marginTop: 1 }}>
                  {new Date(entry.completedAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: GRN, fontFamily: "'IBM Plex Mono',monospace" }}>
                  {fmtDuration(entry.seconds || 0)}
                </span>
                <button
                  onClick={() => removeEntry(entry.id)}
                  style={{ background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 11, lineHeight: 1, padding: "0 2px" }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function JobTimer({ machine, onUpdate, locked, onGoToBilling }) {
  const t = machine.jobTimer || { duration: 0, elapsed: 0, startedAt: null, status: "idle", jobLabel: "" };

  const getElapsed = () => {
    if (t.status === "running" && t.startedAt) {
      return t.elapsed + Math.floor((Date.now() - new Date(t.startedAt).getTime()) / 1000);
    }
    return t.elapsed || 0;
  };

  const [display, setDisplay] = useState(getElapsed);
  const [hours, setHours] = useState("");
  const [mins, setMins] = useState("");
  const [jobLabel, setJobLabel] = useState(t.jobLabel || "");
  const [customLabel, setCustomLabel] = useState("");

  const jobOptions = getJobOptions(machine);
  const isCustom = jobLabel === "__custom__";
  const effectiveLabel = isCustom ? customLabel : jobLabel;

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
      await save({ duration: dur, elapsed: 0, startedAt: new Date().toISOString(), status: "running", jobLabel: effectiveLabel });
    } else {
      await save({ startedAt: new Date().toISOString(), status: "running" });
    }
  };

  const handlePause = async () => {
    await save({ elapsed: getElapsed(), startedAt: null, status: "paused" });
  };

  const handleStop = async () => {
    await save({ duration: 0, elapsed: 0, startedAt: null, status: "idle", jobLabel: "" });
    setHours(""); setMins(""); setJobLabel(""); setCustomLabel("");
  };

  const handleFinish = async () => {
    const elapsed = getElapsed();
    const newEntry = {
      id: crypto.randomUUID(),
      jobLabel: t.jobLabel || "Job",
      seconds: elapsed,
      completedAt: new Date().toISOString(),
    };
    const updated = {
      ...machine,
      status: "Complete",
      timeLog: [...(machine.timeLog || []), newEntry],
      jobTimer: { duration: 0, elapsed: 0, startedAt: null, status: "idle", jobLabel: "" },
    };
    onUpdate(updated);
    await upsertMachine(updated);
    setHours(""); setMins(""); setJobLabel(""); setCustomLabel("");
  };

  // Migrate legacy "done" state: allow logging the saved elapsed time
  const handleLogAndReset = async () => {
    const newEntry = {
      id: crypto.randomUUID(),
      jobLabel: t.jobLabel || "Job",
      seconds: t.elapsed || 0,
      completedAt: new Date().toISOString(),
    };
    const updated = {
      ...machine,
      timeLog: [...(machine.timeLog || []), newEntry],
      jobTimer: { duration: 0, elapsed: 0, startedAt: null, status: "idle", jobLabel: "" },
    };
    onUpdate(updated);
    await upsertMachine(updated);
  };

  const remaining = t.duration - display;
  const pct = t.duration > 0 ? remaining / t.duration : 1;
  const glowColor = t.status === "done" ? GRN : pct > 0.5 ? GRN : pct > 0.2 ? ORANGE : RED;
  const isOverdue = remaining < 0 && t.status === "running";

  if (locked) {
    return (
      <div style={{ marginTop: 10, padding: "10px 12px", background: "#0d0d0d", border: "1px solid #252525", borderRadius: 2 }}>
        <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Job Timer</div>
        <div style={{ fontSize: 10, color: MUT, lineHeight: 1.6, marginBottom: 8 }}>🔒 Job timers require an Enthusiast subscription.</div>
        {onGoToBilling && <button onClick={onGoToBilling} style={{ ...btnA, ...sm, fontSize: 8 }}>Upgrade</button>}
      </div>
    );
  }

  // Legacy "done" state — show log + reset prompt
  if (t.status === "done") {
    return (
      <div style={{ marginTop: 10, padding: "10px 12px", background: "#0d0d0d", border: `1px solid ${GRN}44`, borderRadius: 2 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase" }}>Completed</div>
          <div style={{ fontSize: 11, color: GRN, fontWeight: 700, letterSpacing: "0.08em" }}>✓ JOB COMPLETE</div>
        </div>
        {t.jobLabel && <div style={{ fontSize: 9, color: ACC, marginBottom: 8 }}>{t.jobLabel}</div>}
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={handleLogAndReset} style={{ ...btnA, ...sm, background: GRN, borderColor: GRN, color: "#000" }}>Log time & reset</button>
        </div>
      </div>
    );
  }

  if (t.status === "idle" && !t.duration) {
    return (
      <div style={{ marginTop: 10, padding: "10px 12px", background: "#0d0d0d", border: "1px solid #252525", borderRadius: 2 }}>
        <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Job Timer</div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.08em", marginBottom: 4 }}>JOB / TASK</div>
          <select style={timerSel} value={jobLabel} onChange={e => setJobLabel(e.target.value)}>
            <option value="">— select or leave blank —</option>
            {jobOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
            <option value="__custom__">✏️ Custom…</option>
          </select>
          {isCustom && (
            <input
              style={{ ...timerSel, marginTop: 4 }}
              placeholder="Describe the job…"
              value={customLabel}
              onChange={e => setCustomLabel(e.target.value)}
            />
          )}
        </div>
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: t.jobLabel ? 2 : 8 }}>
        <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {t.status === "paused" ? "Paused" : isOverdue ? "Overdue" : "Time Remaining"}
        </div>
        <div style={{
          fontSize: 26, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace",
          color: glowColor,
          textShadow: `0 0 10px ${glowColor}88`,
          animation: isOverdue ? "pulse 1s infinite" : "none",
        }}>
          {fmt(remaining)}
        </div>
      </div>
      {t.jobLabel && (
        <div style={{ fontSize: 9, color: ACC, letterSpacing: "0.06em", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {t.jobLabel}
        </div>
      )}
      {t.duration > 0 && (
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
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {t.status === "running" && <button onClick={handlePause} style={{ ...btnG, ...sm }}>⏸ Pause</button>}
        {t.status === "paused"  && <button onClick={handleStart} style={{ ...btnA, ...sm }}>▶ Resume</button>}
        <button onClick={handleStop} style={{ ...btnG, ...sm }}>⏹ Reset</button>
        <button onClick={handleFinish} style={{ ...btnA, ...sm, background: GRN, borderColor: GRN, color: "#000" }}>✓ Finish Job</button>
      </div>
    </div>
  );
}

function JobBoard({ machines, setMachines, profile, company, onGoToBilling }) {
  const tier = effectiveTier(profile, company);
  const timerLocked = tier === "free";

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
                  <JobTimer machine={m} onUpdate={updateM} locked={timerLocked} onGoToBilling={onGoToBilling} />
                  <TimeLogSection machine={m} company={company} onUpdate={updateM} />
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
