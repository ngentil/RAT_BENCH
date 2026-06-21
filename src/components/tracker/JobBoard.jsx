import React, { useState, useEffect, useMemo } from 'react';
import TabGuide from '../ui/TabGuide';
import { getPref, savePref } from '../../lib/db/preferences';
import { upsertMachine } from '../../lib/db';
import { getInventory, adjustStock } from '../../lib/db/inventory';
import { getConsumables, adjustConsumableQty } from '../../lib/db/consumables';
import { getNextInvoiceNumber } from '../../lib/db/invoices';
import { ACC, MUT, BRD, SURF, TXT, GRN, RED, btnG, btnA, sm, inp } from '../../lib/styles';
import { STATUSES, SCOL, SBG_ } from '../../lib/constants';
import { SL, SkullRating, Divider } from '../ui/shared';
import { mIcon } from '../../lib/helpers';
import StatusBadge from '../ui/StatusBadge';
import { effectiveTier } from '../../lib/gates';
import UpgradeBanner from '../ui/UpgradeBanner';

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
function safeImgSrc(url) {
  const s = String(url || '');
  return (s.startsWith('data:image/') || /^https?:\/\//.test(s)) ? escHtml(s) : '';
}

async function exportInvoice(machine, company, clients, userId, docType = 'invoice') {
  const log   = machine.timeLog || [];
  const parts = machine.parts   || [];
  if (!log.length && !parts.length) return;

  // Open window synchronously during user interaction to avoid popup blocker
  const win = window.open('', '_blank');
  if (!win) { alert('Please allow popups to export.'); return; }

  const client = machine.clientId ? (clients||[]).find(c => c.id === machine.clientId) : null;

  const rate     = company?.hourly_rate ? parseFloat(company.hourly_rate) : null;
  const taxRate  = company?.tax_rate    ? parseFloat(company.tax_rate)    : null;
  const taxLabel = company?.tax_label   || 'Tax';
  const co       = company || {};

  const totalSecs      = log.reduce((s, e) => s + (e.seconds || 0), 0);
  const totalHrs       = totalSecs / 3600;
  const labourSubtotal = rate !== null ? totalHrs * rate : null;
  const partsSubtotal  = parts.reduce((s, p) => s + (parseFloat(p.sellPrice) || 0) * (Number(p.qty) || 1), 0);
  const subtotal       = labourSubtotal !== null ? labourSubtotal + partsSubtotal : (partsSubtotal > 0 ? partsSubtotal : null);
  const tax            = subtotal !== null && taxRate ? subtotal * taxRate / 100 : null;
  const total          = subtotal !== null ? subtotal + (tax || 0) : null;
  const fmt$           = n => `$${(n || 0).toFixed(2)}`;

  const isQuote  = docType === 'quote';
  const docLabel = isQuote ? 'QUOTE' : 'INVOICE';
  const docRef   = isQuote
    ? `QT-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-5)}`
    : await getNextInvoiceNumber(userId);

  const coAddress  = [co.address, co.city, co.state, co.postcode, co.country].filter(Boolean).join(', ');
  const coContact  = [co.abn ? `ABN ${co.abn}` : null, co.phone, co.email].filter(Boolean).join('  ·  ');
  const machineSub = [machine.year, machine.make, machine.model, machine.serial ? `S/N ${machine.serial}` : null].filter(Boolean).join(' · ');

  const clientHtml = client ? `
    <div class="bill-to">
      <div class="bill-to-label">Bill To</div>
      <div class="bill-to-name">${escHtml(client.name)}</div>
      ${client.company  ? `<div class="bill-to-line">${escHtml(client.company)}</div>`  : ''}
      ${client.email    ? `<div class="bill-to-line">${escHtml(client.email)}</div>`    : ''}
      ${client.phone    ? `<div class="bill-to-line">${escHtml(client.phone)}</div>`    : ''}
      ${client.address  ? `<div class="bill-to-line">${escHtml(client.address)}</div>` : ''}
    </div>` : '';

  const labourRows = log.map(e => {
    const hrs    = (e.seconds || 0) / 3600;
    const amount = rate !== null ? hrs * rate : null;
    const label  = e.jobLabel && e.jobLabel !== 'Job' ? e.jobLabel.slice(0, 80) : 'General work';
    const notes  = e.sessionNotes ? `<div style="font-size:11px;color:#777;margin-top:2px">${escHtml(e.sessionNotes)}</div>` : '';
    return `<tr>
      <td>${escHtml(label)}${notes}</td>
      <td class="num">${fmtDuration(e.seconds || 0)} <span class="dim">(${hrs.toFixed(2)} hrs)</span></td>
      <td class="num">${rate !== null ? `$${rate.toFixed(2)}/hr` : '—'}</td>
      <td class="num">${amount !== null ? fmt$(amount) : '—'}</td>
    </tr>`;
  }).join('');

  const partsRows = parts.map(p => {
    const sell = parseFloat(p.sellPrice) || 0;
    const qty  = Number(p.qty) || 1;
    return `<tr>
      <td>${escHtml(p.name)}${p.brand      ? ` <span class="dim">${escHtml(p.brand)}</span>`      : ''}
          ${p.partNumber ? ` <span class="dim">${escHtml(p.partNumber)}</span>` : ''}</td>
      <td class="num">${qty}</td>
      <td class="num">${sell > 0 ? fmt$(sell) : '—'}</td>
      <td class="num">${sell > 0 ? fmt$(sell * qty) : '—'}</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${docLabel} — ${escHtml(machine.name)}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;background:#fff;color:#111;padding:48px;max-width:820px;margin:0 auto;font-size:13px;line-height:1.5}
.top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;gap:32px}
.co-side{flex:1}
.co-logo{width:56px;height:56px;object-fit:cover;border-radius:3px;margin-bottom:10px;display:block}
.co-name{font-size:18px;font-weight:700;margin-bottom:4px}
.co-sub{font-size:11px;color:#666;line-height:1.8}
.doc-side{text-align:right;flex-shrink:0}
.doc-type{font-size:44px;font-weight:900;color:#e8670a;letter-spacing:-0.02em;line-height:1;margin-bottom:10px}
.doc-meta{font-size:11px;color:#555;line-height:2}
.doc-meta strong{color:#111}
.divider{border:none;border-top:2px solid #111;margin:24px 0}
.mid{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;gap:24px}
.bill-to{flex:1}
.bill-to-label{font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#999;margin-bottom:6px}
.bill-to-name{font-size:14px;font-weight:700;margin-bottom:3px}
.bill-to-line{font-size:12px;color:#555}
.machine-side{text-align:right}
.machine-label{font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#999;margin-bottom:6px}
.machine-name{font-size:14px;font-weight:700;margin-bottom:3px}
.machine-sub{font-size:11px;color:#777}
.section-head{font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#555;margin:28px 0 10px}
table{width:100%;border-collapse:collapse;margin-bottom:4px}
th{background:#f7f7f7;padding:9px 12px;font-size:9px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:#555;border-bottom:2px solid #e0e0e0;text-align:left}
th.num,td.num{text-align:right}
td{padding:9px 12px;border-bottom:1px solid #f0f0f0;font-size:12px;vertical-align:top}
.dim{color:#aaa;font-size:10px}
.totals-wrap{display:flex;justify-content:flex-end;margin-top:16px}
.totals{width:260px}
.totals td{padding:6px 12px;font-size:12px;border:none;color:#555}
.totals .grand td{font-size:15px;font-weight:700;color:#111;border-top:2px solid #111;padding-top:10px;margin-top:4px}
.footer-note{margin-top:16px;font-size:11px;color:#aaa;text-align:right}
.footer{margin-top:48px;padding-top:16px;border-top:1px solid #eee;font-size:10px;color:#ccc;text-align:center}
.print-btn{position:fixed;bottom:24px;right:24px;background:#e8670a;color:#fff;border:none;padding:12px 22px;font-size:13px;font-weight:700;border-radius:4px;cursor:pointer;box-shadow:0 4px 16px rgba(232,103,10,0.3)}
@media print{.print-btn{display:none}body{padding:20px}}
</style>
</head>
<body>

<div class="top">
  <div class="co-side">
    ${co.logo && safeImgSrc(co.logo) ? `<img class="co-logo" src="${safeImgSrc(co.logo)}" alt=""/>` : ''}
    <div class="co-name">${escHtml(co.name || 'My Business')}</div>
    ${co.trading_name ? `<div class="co-sub" style="margin-bottom:2px">${escHtml(co.trading_name)}</div>` : ''}
    <div class="co-sub">
      ${coContact  ? escHtml(coContact)  + '<br/>' : ''}
      ${coAddress  ? escHtml(coAddress)            : ''}
    </div>
  </div>
  <div class="doc-side">
    <div class="doc-type">${docLabel}</div>
    <div class="doc-meta">
      <strong>${escHtml(docRef)}</strong><br/>
      ${isQuote ? 'Date' : 'Invoice Date'}: ${new Date().toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' })}<br/>
      ${isQuote ? '' : `Due: On receipt`}
    </div>
  </div>
</div>

<hr class="divider"/>

<div class="mid">
  ${clientHtml || '<div></div>'}
  <div class="machine-side">
    <div class="machine-label">${isQuote ? 'For' : 'Re'}</div>
    <div class="machine-name">${escHtml(machine.name)}</div>
    ${machineSub ? `<div class="machine-sub">${escHtml(machineSub)}</div>` : ''}
  </div>
</div>

${log.length ? `
<div class="section-head">Labour</div>
<table>
  <thead><tr><th>Description</th><th>Duration</th><th>Rate</th><th class="num">Amount</th></tr></thead>
  <tbody>${labourRows}</tbody>
</table>` : ''}

${parts.length ? `
<div class="section-head">Parts &amp; Materials</div>
<table>
  <thead><tr><th>Part</th><th class="num">Qty</th><th class="num">Unit Price</th><th class="num">Amount</th></tr></thead>
  <tbody>${partsRows}</tbody>
</table>` : ''}

<div class="totals-wrap">
  <table class="totals">
    <tbody>
      ${labourSubtotal !== null ? `<tr><td>Labour</td><td style="text-align:right">${fmt$(labourSubtotal)}</td></tr>` : ''}
      ${partsSubtotal  > 0      ? `<tr><td>Parts</td><td style="text-align:right">${fmt$(partsSubtotal)}</td></tr>`  : ''}
      ${tax !== null            ? `<tr><td>${escHtml(taxLabel)} (${taxRate}%)</td><td style="text-align:right">${fmt$(tax)}</td></tr>` : ''}
      <tr class="grand"><td>${total !== null ? 'Total' : 'Total Time'}</td><td style="text-align:right">${total !== null ? fmt$(total) : fmtDuration(totalSecs)}</td></tr>
    </tbody>
  </table>
</div>

${!rate ? '<div class="footer-note">Set a Labour Rate in Settings → Company to calculate amounts.</div>' : ''}
<div class="footer">Generated by Rat Bench · ratbench.net</div>
<button class="print-btn" onclick="window.print()">🖨️ Print / Save PDF</button>
</body>
</html>`;

  win.document.write(html);
  win.document.close();
}

const timerSel = {
  width: "100%", background: "#0a0a0a", border: "1px solid " + BRD, borderRadius: 3,
  color: TXT, fontSize: 13, padding: "12px 10px", fontFamily: "'IBM Plex Mono',monospace",
  cursor: "pointer", outline: "none",
};

const BILL_STATUS = {
  logged:   { label: "Logged",   color: "#5a5a5a" },
  quoted:   { label: "Quoted",   color: "#4a9eff" },
  invoiced: { label: "Invoiced", color: "#3d9e50" },
};

function TimeLogSection({ machine, company, clients, userId, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const log = machine.timeLog || [];
  if (!log.length) return null;

  const totalSecs = log.reduce((s, e) => s + (e.seconds || 0), 0);

  const removeEntry = async (entryId) => {
    if (!confirm("Remove this time entry?")) return;
    const updated = { ...machine, timeLog: machine.timeLog.filter(e => e.id !== entryId) };
    onUpdate(updated);
    await upsertMachine(updated);
  };

  const cycleBillStatus = async (entryId) => {
    const order = ["logged", "quoted", "invoiced"];
    const updated = {
      ...machine,
      timeLog: (machine.timeLog || []).map(e => {
        if (e.id !== entryId) return e;
        const cur = e.billStatus || "logged";
        const next = order[(order.indexOf(cur) + 1) % order.length];
        return { ...e, billStatus: next };
      }),
    };
    onUpdate(updated);
    await upsertMachine(updated);
  };

  const saveNotes = async (entryId, notes) => {
    const updated = {
      ...machine,
      timeLog: (machine.timeLog || []).map(e => e.id === entryId ? { ...e, sessionNotes: notes.trim() } : e),
    };
    onUpdate(updated);
    await upsertMachine(updated);
    setEditingNotes(null);
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
        <button onClick={() => exportInvoice(machine, company, clients, userId, 'quote')} style={{ ...btnG, padding: "11px 18px", fontSize: 11, borderRadius: 3 }}>Quote</button>
        <button onClick={() => exportInvoice(machine, company, clients, userId, 'invoice')} style={{ ...btnA, padding: "11px 18px", fontSize: 11, borderRadius: 3 }}>Invoice</button>
      </div>
      {expanded && (
        <div style={{ marginTop: 8 }}>
          {log.map((entry, idx) => {
            const bs = BILL_STATUS[entry.billStatus || "logged"];
            const isEditingNote = editingNotes === entry.id;
            return (
              <div key={entry.id || idx} style={{ padding: "6px 0", borderBottom: "1px solid #181818" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: TXT, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.jobLabel && entry.jobLabel !== "Job" ? entry.jobLabel.slice(0, 60) : "General work"}
                    </div>
                    <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
                      {new Date(entry.completedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => cycleBillStatus(entry.id)}
                      title="Click to cycle: Logged → Quoted → Invoiced"
                      style={{
                        background: "none", border: "1px solid " + bs.color + "55",
                        color: bs.color, fontSize: 7, padding: "2px 5px", borderRadius: 2,
                        cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace",
                        fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                      }}
                    >
                      {bs.label}
                    </button>
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
                {isEditingNote ? (
                  <div style={{ marginTop: 4 }}>
                    <textarea
                      autoFocus
                      style={{ width: "100%", background: "#0a0a0a", border: "1px solid " + BRD, color: TXT, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, padding: "5px 7px", borderRadius: 2, resize: "vertical", minHeight: 48, boxSizing: "border-box", outline: "none", lineHeight: 1.5 }}
                      value={noteDraft}
                      onChange={e => setNoteDraft(e.target.value)}
                      placeholder="What was done this session…"
                    />
                    <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                      <button onClick={() => saveNotes(entry.id, noteDraft)} style={{ ...btnA, ...sm, fontSize: 8 }}>Save</button>
                      <button onClick={() => setEditingNotes(null)} style={{ ...btnG, ...sm, fontSize: 8 }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => { setEditingNotes(entry.id); setNoteDraft(entry.sessionNotes || ""); }}
                    style={{ marginTop: 3, fontSize: 9, color: entry.sessionNotes ? MUT : "#2a2a2a", cursor: "pointer", lineHeight: 1.5, fontStyle: entry.sessionNotes ? "normal" : "italic" }}
                    title="Click to add session notes"
                  >
                    {entry.sessionNotes || "+ add notes"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PartsSection({ machine, onUpdate, userId }) {
  const [mode, setMode]           = useState(null); // null | "inv" | "standalone"
  const [pickerSource, setPickerSource] = useState("part"); // "part" | "consumable"
  const [inv, setInv]             = useState([]);
  const [cons, setCons]           = useState([]);
  const [search, setSearch]       = useState("");
  const [saving, setSaving]       = useState(false);

  useEffect(() => { getInventory(userId).then(setInv); }, [userId]);
  useEffect(() => { getConsumables().then(setCons); }, []);

  const [selected, setSelected]   = useState(null);
  const [qty, setQty]             = useState("1");
  const [saForm, setSaForm]       = useState({ name:"", partNumber:"", brand:"", qty:"1", buyPrice:"", sellPrice:"", notes:"" });
  const [saSuggestions, setSaSuggestions] = useState([]);
  const [saMatchedInvId, setSaMatchedInvId] = useState(null);
  const parts = machine.parts || [];

  const totalRevenue = parts.reduce((s,p)=>(s+(parseFloat(p.sellPrice)||0)*(Number(p.qty)||1)),0);
  const totalCost    = parts.reduce((s,p)=>(s+(parseFloat(p.buyPrice)||0)*(Number(p.qty)||1)),0);

  const inpS = { background:"#0a0a0a", border:"1px solid #252525", color:TXT, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, padding:"6px 8px", borderRadius:2, outline:"none", boxSizing:"border-box", width:"100%" };
  const L = ({ t }) => <div style={{ fontSize:10, color:MUT, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:3 }}>{t}</div>;

  // Combined search list for the picker
  const pickerList = pickerSource === "part" ? inv : cons;
  const filteredPickerList = pickerList.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.partNumber||"").toLowerCase().includes(search.toLowerCase())
  );

  // Legacy: also search inv for standalone suggestions
  const filteredInv = inv.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.partNumber||"").toLowerCase().includes(search.toLowerCase())
  );

  const useFromInventory = async () => {
    if (!selected || saving) return;
    const useQty = Math.max(1, parseInt(qty) || 1);
    const entry = {
      id: crypto.randomUUID(),
      sourceType: pickerSource,
      ...(pickerSource === "part" ? { inventoryId: selected.id } : { consumableId: selected.id }),
      name: selected.name,
      partNumber: selected.partNumber || "",
      brand: selected.brand || "",
      qty: useQty,
      buyPrice: parseFloat(selected.buyPrice) || 0,
      sellPrice: parseFloat(selected.sellPrice) || 0,
      usedAt: new Date().toISOString(),
    };
    const original = machine;
    const updated = { ...machine, parts: [...parts, entry] };
    setSaving(true);
    onUpdate(updated);
    let machineSaved = false;
    try {
      await upsertMachine(updated);
      machineSaved = true;
      if (pickerSource === "part") {
        setInv(await adjustStock(userId, selected.id, -useQty));
      } else {
        const updatedItem = await adjustConsumableQty(selected.id, -useQty);
        setCons(prev => prev.map(c => c.id === updatedItem.id ? updatedItem : c));
      }
      setMode(null); setSelected(null); setQty("1"); setSearch("");
    } catch (e) {
      console.error("useFromInventory:", e);
      if (machineSaved) await upsertMachine(original).catch(() => {});
      onUpdate(original);
    } finally {
      setSaving(false);
    }
  };

  const addStandalone = async () => {
    if (!saForm.name.trim() || saving) return;
    const entry = { ...saForm, id: crypto.randomUUID(), qty: parseInt(saForm.qty)||1, buyPrice: parseFloat(saForm.buyPrice)||0, sellPrice: parseFloat(saForm.sellPrice)||0, usedAt: new Date().toISOString() };
    if (saMatchedInvId) { entry.inventoryId = saMatchedInvId; entry.sourceType = "part"; }
    const original = machine;
    const updated = { ...machine, parts: [...parts, entry] };
    setSaving(true);
    onUpdate(updated);
    try {
      await upsertMachine(updated);
      if (saMatchedInvId) setInv(await adjustStock(userId, saMatchedInvId, -(parseInt(saForm.qty)||1)));
      setMode(null); setSaForm({ name:"", partNumber:"", brand:"", qty:"1", buyPrice:"", sellPrice:"", notes:"" }); setSaSuggestions([]); setSaMatchedInvId(null);
    } catch (e) {
      console.error("addStandalone:", e);
      onUpdate(original);
    } finally {
      setSaving(false);
    }
  };

  const onSaNameChange = (val) => {
    setSaForm(f => ({ ...f, name: val }));
    setSaMatchedInvId(null);
    if (val.trim().length < 2) { setSaSuggestions([]); return; }
    const q = val.toLowerCase();
    setSaSuggestions(inv.filter(i => i.name.toLowerCase().includes(q) || (i.partNumber||"").toLowerCase().includes(q)).slice(0, 6));
  };

  const pickSaSuggestion = (i) => {
    setSaForm(f => ({ ...f, name: i.name, partNumber: i.partNumber||"", brand: i.brand||"", buyPrice: i.buyPrice ? String(parseFloat(i.buyPrice).toFixed(2)) : f.buyPrice, sellPrice: i.sellPrice ? String(parseFloat(i.sellPrice).toFixed(2)) : f.sellPrice }));
    setSaSuggestions([]);
    setSaMatchedInvId(i.id);
  };

  const remove = async (idx) => {
    if (!confirm("Remove this part usage? Stock will be returned if it came from inventory.")) return;
    const p = parts[idx];
    const original = machine;
    const updated = { ...machine, parts: parts.filter((_,i) => i !== idx) };
    onUpdate(updated);
    try {
      await upsertMachine(updated);
      const sourceType = p.sourceType || (p.inventoryId ? "part" : null);
      if (sourceType === "consumable" && p.consumableId) {
        const updatedItem = await adjustConsumableQty(p.consumableId, Number(p.qty) || 1);
        setCons(prev => prev.map(c => c.id === updatedItem.id ? updatedItem : c));
      } else if (p.inventoryId) {
        setInv(await adjustStock(userId, p.inventoryId, Number(p.qty) || 1));
      }
    } catch (e) {
      console.error("remove part:", e);
      onUpdate(original);
    }
  };

  return (
    <div style={{ marginTop:8 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ fontSize:9, color:ACC, letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:700 }}>
          Parts &amp; Consumables {parts.length > 0 && `(${parts.length})`}
          {totalRevenue > 0 && <span style={{ color:GRN, marginLeft:8 }}>${totalRevenue.toFixed(2)}</span>}
          {totalCost > 0 && totalRevenue > 0 && <span style={{ color:MUT, marginLeft:4, fontSize:10 }}>cost ${totalCost.toFixed(2)}</span>}
        </div>
        {!mode && (
          <div style={{ display:"flex", gap:5 }}>
            {(inv.length > 0 || cons.length > 0) && <button onClick={() => { setMode("inv"); setSearch(""); setSelected(null); }} style={{ ...btnA, ...sm, fontSize:10 }}>Use from Stock</button>}
            <button onClick={() => setMode("standalone")} style={{ ...btnG, ...sm, fontSize:10 }}>+ One-off</button>
          </div>
        )}
      </div>

      {/* Stock picker */}
      {mode === "inv" && (
        <div style={{ background:"#0a0f0a", border:"1px solid "+ACC+"44", borderRadius:2, padding:"10px 12px", marginBottom:8 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
            <div style={{ fontSize:9, color:ACC, letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:700 }}>Use from Stock</div>
            <div style={{ display:"flex", gap:0 }}>
              {[["part","🔩 Parts"],["consumable","📦 Consumables"]].map(([v,l], i) => (
                <button key={v} onClick={() => { setPickerSource(v); setSearch(""); setSelected(null); }}
                  style={{ ...btnG, ...sm, fontSize:10, borderRadius: i===0?"2px 0 0 2px":"0 2px 2px 0", borderRight: i===0?"none":undefined, ...(pickerSource===v?{background:ACC+"18",color:ACC}:{}) }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <input style={{ ...inpS, marginBottom:8 }} placeholder={pickerSource==="part"?"Search parts…":"Search consumables…"} value={search} onChange={e=>setSearch(e.target.value)} autoFocus/>
          <div style={{ maxHeight:160, overflowY:"auto", marginBottom:8 }}>
            {filteredPickerList.map(i => {
              const stockQty = pickerSource === "part" ? (Number(i.stockQty) || 0) : (Number(i.quantity) || 0);
              return (
                <div key={i.id} onClick={() => { setSelected(i); setSearch(""); }}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 8px", borderRadius:2, cursor:"pointer", background: selected?.id===i.id ? ACC+"22" : "transparent", border:"1px solid "+(selected?.id===i.id ? ACC+"55" : "transparent"), marginBottom:3 }}>
                  <div>
                    <div style={{ fontSize:10, color:TXT, fontWeight:700 }}>{i.name}</div>
                    <div style={{ fontSize:10, color:MUT }}>{[i.category, i.brand, i.partNumber].filter(Boolean).join(" · ")}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:10, color:stockQty>0?GRN:RED, fontWeight:700 }}>{stockQty} {pickerSource==="part"?"in stock":i.unit||"in stock"}</div>
                    {i.sellPrice && <div style={{ fontSize:10, color:MUT }}>${parseFloat(i.sellPrice).toFixed(2)} ea</div>}
                  </div>
                </div>
              );
            })}
            {filteredPickerList.length === 0 && <div style={{ fontSize:9, color:MUT, padding:8 }}>No matching items.</div>}
          </div>
          {selected && (
            <div style={{ display:"flex", gap:8, alignItems:"center", padding:"8px", background:"#0a0a0a", borderRadius:2, marginBottom:8 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, color:TXT, fontWeight:700 }}>{selected.name}</div>
                <div style={{ fontSize:10, color:MUT }}>Cost ${(parseFloat(selected.buyPrice)||0).toFixed(2)} · Sell ${(parseFloat(selected.sellPrice)||0).toFixed(2)}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ fontSize:10, color:MUT }}>Qty</div>
                <input style={{ ...inpS, width:50, textAlign:"center" }} type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)}/>
              </div>
            </div>
          )}
          <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
            <button onClick={() => { setMode(null); setSelected(null); setSearch(""); }} style={{ ...btnG, ...sm }}>Cancel</button>
            <button onClick={useFromInventory} disabled={!selected} style={{ ...btnA, ...sm, opacity: selected?1:0.4 }}>Use {pickerSource === "part" ? "Part" : "Consumable"}</button>
          </div>
        </div>
      )}

      {/* Standalone one-off */}
      {mode === "standalone" && (
        <div style={{ background:"#0a0a0a", border:"1px solid "+ACC, borderRadius:2, padding:"10px 12px", marginBottom:8 }}>
          <div style={{ fontSize:9, color:ACC, letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>One-off Part</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
            <div style={{ gridColumn:"1/-1" }}>
              <L t="Name *"/>
              <div style={{ position:"relative" }}>
                <input style={inpS} value={saForm.name} onChange={e=>onSaNameChange(e.target.value)} placeholder="e.g. Air filter" autoFocus onBlur={()=>setTimeout(()=>setSaSuggestions([]),150)}/>
                {saMatchedInvId && (() => { const i=inv.find(x=>x.id===saMatchedInvId); const s=Number(i?.stockQty)||0; return i ? <span style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",fontSize:10,color:s>0?GRN:RED,letterSpacing:"0.06em",pointerEvents:"none"}}>{s} in stock</span> : null; })()}
                {saSuggestions.length > 0 && (
                  <div style={{ position:"absolute", top:"100%", left:0, right:0, background:SURF, border:"1px solid "+ACC+"55", borderRadius:2, zIndex:50, maxHeight:180, overflowY:"auto" }}>
                    {saSuggestions.map(i => {
                      const stockQty = Number(i.stockQty)||0;
                      return (
                        <div key={i.id} onMouseDown={()=>pickSaSuggestion(i)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 10px", cursor:"pointer", borderBottom:"1px solid " + BRD }}
                          onMouseEnter={e=>e.currentTarget.style.background=BRD} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <div>
                            <div style={{ fontSize:10, color:TXT, fontWeight:700 }}>{i.name}</div>
                            {(i.brand||i.partNumber) && <div style={{ fontSize:10, color:MUT }}>{[i.brand,i.partNumber].filter(Boolean).join(" · ")}</div>}
                          </div>
                          <div style={{ textAlign:"right", flexShrink:0, marginLeft:10 }}>
                            <div style={{ fontSize:9, color:stockQty>0?GRN:RED, fontWeight:700 }}>{stockQty} in stock</div>
                            {i.sellPrice && <div style={{ fontSize:10, color:MUT }}>${parseFloat(i.sellPrice).toFixed(2)} ea</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div><L t="SKU"/><input style={inpS} value={saForm.partNumber} onChange={e=>setSaForm(f=>({...f,partNumber:e.target.value}))} placeholder="e.g. 17211-Z0T"/></div>
            <div><L t="Brand"/><input style={inpS} value={saForm.brand} onChange={e=>setSaForm(f=>({...f,brand:e.target.value}))} placeholder="e.g. Honda"/></div>
            <div><L t="Qty"/><input style={inpS} type="number" min="1" value={saForm.qty} onChange={e=>setSaForm(f=>({...f,qty:e.target.value}))}/></div>
            <div/>
            <div><L t="Buy Price ($)"/><input style={inpS} type="number" min="0" step="0.01" value={saForm.buyPrice} onChange={e=>setSaForm(f=>({...f,buyPrice:e.target.value}))} placeholder="0.00"/></div>
            <div><L t="Sell Price ($)"/><input style={inpS} type="number" min="0" step="0.01" value={saForm.sellPrice} onChange={e=>setSaForm(f=>({...f,sellPrice:e.target.value}))} placeholder="0.00"/></div>
            {saForm.buyPrice && saForm.sellPrice && (() => {
              const bp = parseFloat(saForm.buyPrice), sp = parseFloat(saForm.sellPrice);
              const margin = sp > 0 ? (((sp - bp) / sp) * 100).toFixed(0) : null;
              const profit = ((sp - bp) * (parseInt(saForm.qty)||1)).toFixed(2);
              return margin !== null ? (
                <div style={{ gridColumn:"1/-1", fontSize:9, color: Number(margin)>=0 ? GRN : RED, marginTop:-2 }}>
                  Margin {margin}% · Profit ${profit} {Number(margin)>=0?"↑":"↓"}
                </div>
              ) : null;
            })()}
          </div>
          <div style={{ display:"flex", gap:6, marginTop:8, justifyContent:"flex-end" }}>
            <button onClick={() => { setMode(null); setSaSuggestions([]); setSaMatchedInvId(null); }} style={{ ...btnG, ...sm }}>Cancel</button>
            <button onClick={addStandalone} style={{ ...btnA, ...sm }}>Add</button>
          </div>
        </div>
      )}

      {parts.map((p, idx) => {
        const rev  = (parseFloat(p.sellPrice)||0) * (Number(p.qty)||1);
        const cost = (parseFloat(p.buyPrice)||0)  * (Number(p.qty)||1);
        return (
          <div key={p.id||idx} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0", borderBottom:"1px solid #181818" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ fontSize:10, color:TXT, fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</span>
                {Number(p.qty)>1 && <span style={{ fontSize:10, color:MUT, flexShrink:0 }}>×{p.qty}</span>}
                {p.partNumber && <span style={{ fontSize:10, color:MUT, flexShrink:0, fontFamily:"'IBM Plex Mono',monospace", background: SURF, padding:"1px 4px", borderRadius:2, border:"1px solid " + BRD }}>{p.partNumber}</span>}
                {(p.sourceType === "consumable" || p.consumableId) && <span style={{ fontSize:9, color:"#3a7bd5", letterSpacing:"0.06em" }}>CONS</span>}
                {(p.sourceType === "part" || (!p.sourceType && p.inventoryId)) && <span style={{ fontSize:9, color:ACC, letterSpacing:"0.06em" }}>INV</span>}
              </div>
              {(rev > 0 || cost > 0) && (
                <div style={{ fontSize:10, color:MUT }}>
                  {cost > 0 && <span>Cost ${cost.toFixed(2)}</span>}
                  {rev > 0  && <span style={{ color:GRN }}>{cost>0?" · ":""}Sell ${rev.toFixed(2)}</span>}
                  {rev > 0 && cost > 0 && <span style={{ color: rev-cost>=0?"#3d9e50":"#c94040" }}> ({rev-cost>=0?"+":""}${(rev-cost).toFixed(2)})</span>}
                </div>
              )}
            </div>
            <button onClick={() => remove(idx)} style={{ background:"none", border:"none", color:MUT, cursor:"pointer", fontSize:11, lineHeight:1, padding:"0 2px", flexShrink:0 }}>✕</button>
          </div>
        );
      })}
    </div>
  );
}

function JobTimer({ machine, onUpdate, locked, onGoToBilling }) {
  const t = machine.jobTimers?.[0] || { duration: 0, elapsed: 0, startedAt: null, status: "idle", jobLabel: "" };

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
  const [mode, setMode] = useState("countdown");
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const jobOptions = getJobOptions(machine);
  const isCustom = jobLabel === "__custom__";
  const effectiveLabel = isCustom ? customLabel : jobLabel;

  useEffect(() => {
    const clamp = (e) => t.duration > 0 ? Math.min(e, t.duration) : e;
    setDisplay(clamp(getElapsed()));
    if (t.status !== "running") return;
    const iv = setInterval(() => {
      const e = getElapsed();
      if (t.duration > 0 && e >= t.duration) {
        setDisplay(t.duration);
        clearInterval(iv);
      } else {
        setDisplay(e);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [t.status, t.startedAt, t.elapsed, t.duration]);

  const save = async (updates) => {
    const original = machine;
    const updated = { ...machine, jobTimers: [{ ...t, ...updates }] };
    setSaving(true);
    onUpdate(updated);
    try {
      await upsertMachine(updated);
    } catch (e) {
      console.error("timer save:", e);
      onUpdate(original);
    } finally {
      setSaving(false);
    }
  };

  const handleStart = async () => {
    if (t.status === "idle" && !t.duration) {
      if (mode === "countup") {
        await save({ duration: 0, elapsed: 0, startedAt: new Date().toISOString(), status: "running", jobLabel: effectiveLabel });
      } else {
        const dur = parseDuration(hours, mins);
        if (!dur) return;
        await save({ duration: dur, elapsed: 0, startedAt: new Date().toISOString(), status: "running", jobLabel: effectiveLabel });
      }
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

  const handleManualLog = async () => {
    const secs = parseDuration(hours, mins);
    if (!secs) return;
    const newEntry = {
      id: crypto.randomUUID(),
      jobLabel: effectiveLabel,
      seconds: secs,
      completedAt: manualDate ? new Date(manualDate + "T12:00:00").toISOString() : new Date().toISOString(),
      manual: true,
    };
    const updated = { ...machine, timeLog: [...(machine.timeLog || []), newEntry] };
    onUpdate(updated);
    await upsertMachine(updated);
    setHours(""); setMins(""); setJobLabel(""); setCustomLabel("");
    setManualDate(new Date().toISOString().slice(0, 10));
  };

  const handleFinish = async () => {
    const elapsed = getElapsed();
    const newEntry = {
      id: crypto.randomUUID(),
      jobLabel: t.jobLabel || "",
      seconds: elapsed,
      completedAt: new Date().toISOString(),
    };
    const updated = {
      ...machine,
      status: "Complete",
      timeLog: [...(machine.timeLog || []), newEntry],
      jobTimers: [],
    };
    onUpdate(updated);
    await upsertMachine(updated);
    setHours(""); setMins(""); setJobLabel(""); setCustomLabel("");
  };

  // Migrate legacy "done" state: allow logging the saved elapsed time
  const handleLogAndReset = async () => {
    const newEntry = {
      id: crypto.randomUUID(),
      jobLabel: t.jobLabel || "",
      seconds: t.elapsed || 0,
      completedAt: new Date().toISOString(),
    };
    const updated = {
      ...machine,
      timeLog: [...(machine.timeLog || []), newEntry],
      jobTimers: [],
    };
    onUpdate(updated);
    await upsertMachine(updated);
  };

  const remaining = t.duration > 0 ? Math.max(0, t.duration - display) : 0;
  const pct = t.duration > 0 ? remaining / t.duration : 1;
  const isExpired = t.duration > 0 && display >= t.duration && t.status === "running";
  const glowColor = t.status === "done" ? GRN : pct > 0.5 ? GRN : pct > 0.2 ? ORANGE : RED;

  if (locked) {
    return (
      <div style={{ marginTop: 10 }}>
        <UpgradeBanner text="Job timers require an Enthusiast subscription." onUpgrade={onGoToBilling} />
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
    const modeBtn = (key, label) => (
      <button key={key} onClick={() => setMode(key)} style={{ flex: 1, padding: "14px 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", border: "none", fontFamily: "'IBM Plex Mono',monospace", background: mode === key ? ACC+"22" : "transparent", color: mode === key ? ACC : "#555", borderBottom: "2px solid " + (mode === key ? ACC : "transparent") }}>
        {label}
      </button>
    );
    return (
      <div style={{ marginTop: 10, padding: "12px", background: "#0d0d0d", border: "1px solid #252525", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ display: "flex", margin: "-12px -12px 14px", borderBottom: "1px solid #252525" }}>
          {modeBtn("countdown", "↓ Countdown")}
          <div style={{ width: 1, background: "#252525", flexShrink: 0 }} />
          {modeBtn("countup", "↑ Count Up")}
          <div style={{ width: 1, background: "#252525", flexShrink: 0 }} />
          {modeBtn("manual", "✎ Log")}
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: MUT, letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase" }}>Job / Task</div>
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
        {mode === "manual" ? (
          <div>
            <div style={{ fontSize: 9, color: MUT, letterSpacing: "0.08em", marginBottom: 10, textTransform: "uppercase" }}>Log Time Without Timer</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                <input type="number" min="0" max="99" placeholder="0" value={hours} onChange={e => setHours(e.target.value)}
                  style={{ flex: 1, background: "#0a0a0a", border: "1px solid " + BRD, borderRadius: 3, color: TXT, fontSize: 20, padding: "10px 0", fontFamily: "'IBM Plex Mono',monospace", textAlign: "center", outline: "none" }} />
                <span style={{ fontSize: 12, color: MUT }}>h</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                <input type="number" min="0" max="59" placeholder="0" value={mins} onChange={e => setMins(e.target.value)}
                  style={{ flex: 1, background: "#0a0a0a", border: "1px solid " + BRD, borderRadius: 3, color: TXT, fontSize: 20, padding: "10px 0", fontFamily: "'IBM Plex Mono',monospace", textAlign: "center", outline: "none" }} />
                <span style={{ fontSize: 12, color: MUT }}>m</span>
              </div>
            </div>
            <input type="date" value={manualDate} onChange={e => setManualDate(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", background: "#0a0a0a", border: "1px solid " + BRD, borderRadius: 3, color: MUT, fontSize: 13, padding: "11px 10px", fontFamily: "'IBM Plex Mono',monospace", outline: "none", marginBottom: 10 }} />
            <button onClick={handleManualLog} disabled={!hours && !mins} style={{ ...btnA, width: "100%", padding: "14px", fontSize: 13, borderRadius: 3, opacity: (!hours && !mins) ? 0.4 : 1 }}>+ Log Time</button>
          </div>
        ) : mode === "countdown" ? (
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                <input type="number" min="0" max="99" placeholder="0" value={hours} onChange={e => setHours(e.target.value)}
                  style={{ flex: 1, background: "#0a0a0a", border: "1px solid " + BRD, borderRadius: 3, color: TXT, fontSize: 20, padding: "10px 0", fontFamily: "'IBM Plex Mono',monospace", textAlign: "center", outline: "none" }} />
                <span style={{ fontSize: 12, color: MUT }}>h</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                <input type="number" min="0" max="59" placeholder="0" value={mins} onChange={e => setMins(e.target.value)}
                  style={{ flex: 1, background: "#0a0a0a", border: "1px solid " + BRD, borderRadius: 3, color: TXT, fontSize: 20, padding: "10px 0", fontFamily: "'IBM Plex Mono',monospace", textAlign: "center", outline: "none" }} />
                <span style={{ fontSize: 12, color: MUT }}>m</span>
              </div>
            </div>
            <button onClick={handleStart} disabled={!hours && !mins} style={{ ...btnA, width: "100%", padding: "14px", fontSize: 13, borderRadius: 3, opacity: (!hours && !mins) ? 0.4 : 1 }}>▶ Start</button>
          </div>
        ) : (
          <button onClick={handleStart} style={{ ...btnA, width: "100%", padding: "14px", fontSize: 13, borderRadius: 3 }}>▶ Start</button>
        )}
      </div>
    );
  }

  const isCountUp = t.duration === 0;
  const displayColor = isCountUp ? GRN : (isExpired ? RED : glowColor);

  return (
    <div style={{ marginTop: 10, padding: "10px 12px", background: "#0d0d0d", border: `1px solid ${displayColor}44`, borderRadius: 2, boxShadow: `0 0 10px ${displayColor}22` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: t.jobLabel ? 2 : 8 }}>
        <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {t.status === "paused" ? "Paused" : isCountUp ? "Elapsed" : isExpired ? "Time Up — Finish Job" : "Time Remaining"}
        </div>
        <div style={{
          fontSize: 26, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace",
          color: displayColor,
          textShadow: `0 0 10px ${displayColor}88`,
        }}>
          {isCountUp ? fmt(display) : fmt(remaining)}
        </div>
      </div>
      {t.jobLabel && (
        <div style={{ fontSize: 9, color: ACC, letterSpacing: "0.06em", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {t.jobLabel}
        </div>
      )}
      {!isCountUp && t.duration > 0 && (
        <div style={{ height: 3, background: BRD, borderRadius: 2, marginBottom: 10, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 2,
            width: `${Math.max(0, Math.min(100, (remaining / t.duration) * 100))}%`,
            background: glowColor,
            boxShadow: `0 0 6px ${glowColor}`,
            transition: "width 1s linear, background 0.5s",
          }} />
        </div>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {t.status === "running" && <button onClick={handlePause} disabled={saving} style={{ ...btnG, flex: 1, padding: "13px", fontSize: 12, borderRadius: 3, opacity: saving ? 0.5 : 1 }}>⏸ Pause</button>}
        {t.status === "paused"  && <button onClick={handleStart} disabled={saving} style={{ ...btnA, flex: 1, padding: "13px", fontSize: 12, borderRadius: 3, opacity: saving ? 0.5 : 1 }}>▶ Resume</button>}
        <button onClick={handleStop} disabled={saving} style={{ ...btnG, padding: "13px 16px", fontSize: 12, borderRadius: 3, opacity: saving ? 0.5 : 1 }}>⏹ Reset</button>
        <button onClick={handleFinish} disabled={saving} style={{ ...btnA, flex: 2, padding: "13px", fontSize: 13, borderRadius: 3, background: GRN, borderColor: GRN, color: "#000", fontWeight: 700, opacity: saving ? 0.5 : 1 }}>✓ Finish Job</button>
      </div>
    </div>
  );
}

function MachineNotes({ machine, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(machine.notes || "");
  const inpS = { background: "#0a0a0a", border: "1px solid #252525", color: TXT, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, padding: "6px 8px", borderRadius: 2, outline: "none", width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: 50, lineHeight: 1.5 };

  if (editing) {
    return (
      <div style={{ marginBottom: 10 }}>
        <textarea style={{ ...inpS, fontSize: 13, padding: "12px", minHeight: 80 }} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Job notes…" autoFocus />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={() => { onSave(draft); setEditing(false); }} style={{ ...btnA, flex: 1, padding: "13px", fontSize: 12, borderRadius: 3 }}>Save</button>
          <button onClick={() => { setDraft(machine.notes || ""); setEditing(false); }} style={{ ...btnG, flex: 1, padding: "13px", fontSize: 12, borderRadius: 3 }}>Cancel</button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 10 }}>
      {machine.notes
        ? <div style={{ fontSize: 12, color: TXT, lineHeight: 1.6, cursor: "pointer", opacity: 0.8, padding: "10px 0" }} onClick={() => setEditing(true)} title="Click to edit notes">{machine.notes}</div>
        : <button onClick={() => setEditing(true)} style={{ ...btnA, width: "100%", padding: "13px", fontSize: 12, borderRadius: 3 }}>✏ Notes</button>}
    </div>
  );
}

const STATUS_COLOR = {
  "Active": ACC,
  "Queued": GRN,
  "Complete": MUT,
};

function JobCard({ m, status, timerLocked, partsLocked, clientMap, clients, company, session, profile, onUpdate, onUpdateStatus, onUpdateRage, onGoToBilling }) {
  const [open, setOpen] = useState(false);
  const [jobGuide, setJobGuide] = useState(() => !getPref(profile, "rat_tut_job_card", false));
  const dismissJobGuide = () => { setJobGuide(false); savePref(profile?.id, "rat_tut_job_card", true); };

  const totalSecs   = (m.timeLog||[]).reduce((s, e) => s + (e.seconds||0), 0);
  const partsCount  = (m.parts||[]).length;
  const due         = m.dueDate ? new Date(m.dueDate) : null;
  const isOverdue   = due && due < new Date();
  const isRunning   = m.jobTimers?.[0]?.status === "running";
  const hourlyRate  = company?.hourly_rate ? parseFloat(company.hourly_rate) : null;
  const partsTotal  = (m.parts||[]).reduce((s,p) => s + (parseFloat(p.sellPrice)||0)*(Number(p.qty)||1), 0);
  const labourTotal = hourlyRate ? (totalSecs / 3600) * hourlyRate : null;
  const grandTotal  = partsTotal + (labourTotal || 0);

  return (
    <div style={{ background: "#0d0d0d", border: "1px solid " + (timerLocked ? "#1a1a1a" : "#252525"), borderLeft: "3px solid " + (STATUS_COLOR[status] || MUT), borderRadius: 2, marginBottom: 5, overflow: "hidden", opacity: timerLocked ? 0.65 : 1 }}>
      {/* Collapsed header — poster style */}
      <div onClick={() => setOpen(o => !o)} style={{ cursor: "pointer", userSelect: "none" }}>

        {/* Hero photo / icon placeholder */}
        {m.photos?.[0]
          ? <div style={{ position: "relative" }}>
              <img src={m.photos[0]} alt="" style={{ width: "100%", height: 170, objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "65%", background: "linear-gradient(to bottom, transparent, #0d0d0d)", pointerEvents: "none" }} />
            </div>
          : <div style={{ width: "100%", height: 120, background: "#0e0e0e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, borderBottom: "1px solid #1a1a1a" }}>{mIcon(m.type)}</div>}

        {/* Info panel */}
        <div style={{ padding: "10px 12px 12px" }}>

          {/* Icon + name row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            {m.photos?.[0] && <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2, lineHeight: 1 }}>{mIcon(m.type)}</span>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                <div className={isRunning ? "loading-rat" : undefined} style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 700, color: timerLocked ? MUT : TXT, lineHeight: 1.25 }}>
                  {m.name}
                  {isRunning && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: GRN, boxShadow: "0 0 6px " + GRN, marginLeft: 7, verticalAlign: "middle" }} />}
                </div>
                <span style={{ fontSize: 10, color: "#555", flexShrink: 0, marginTop: 2, userSelect: "none" }}>{open ? "▲" : "▼"}</span>
              </div>
              {[m.source, m.make, m.model].filter(Boolean).length > 0 &&
                <div style={{ fontSize: 11, color: MUT, marginTop: 3, lineHeight: 1.4 }}>
                  {[m.source, m.make, m.model].filter(Boolean).join(" · ")}
                </div>}
              {m.type && <div style={{ fontSize: 9, color: "#555", marginTop: 2, letterSpacing: "0.06em", textTransform: "uppercase" }}>{m.type}</div>}
            </div>
          </div>

          {/* Badges — full width below info */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 9, flexWrap: "wrap" }}>
            {m.priority && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 3, letterSpacing: "0.08em",
                background: m.priority === "High" ? RED + "18" : m.priority === "Medium" ? ACC + "18" : MUT + "18",
                color:      m.priority === "High" ? RED      : m.priority === "Medium" ? ACC      : MUT }}>
                {m.priority}
              </span>
            )}
            {m.clientId && clientMap[m.clientId] && <span style={{ fontSize: 9, color: ACC }}>👤 {clientMap[m.clientId]}</span>}
            {due && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: isOverdue ? "#e87a0a" : "#4a9eff" }}>{isOverdue ? "⚠ OVERDUE" : "DUE"} {due.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</span>}
          </div>

          {/* Stats */}
          {(totalSecs > 0 || grandTotal > 0 || partsCount > 0) && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              {totalSecs > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: GRN, fontFamily: "'IBM Plex Mono',monospace" }}>{fmtDuration(totalSecs)}</span>}
              {grandTotal > 0 && <span style={{ fontSize: 9, color: ACC, fontFamily: "'IBM Plex Mono',monospace" }}>${grandTotal.toFixed(0)}</span>}
              {partsCount > 0 && <span style={{ fontSize: 9, color: MUT }}>{partsCount} item{partsCount !== 1 ? "s" : ""}</span>}
            </div>
          )}

        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div className="card-expand" style={{ padding: "0 14px 16px", borderTop: "1px solid #1a1a1a" }}>
          {jobGuide && (
            <div style={{ background: "#0a0f0a", border: "1px solid #1a2a1a", borderRadius: 2, padding: "10px 12px", margin: "10px 0 8px" }}>
              <div style={{ fontSize: 9, color: GRN, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Job Card</div>
              <div style={{ fontSize: 9, color: MUT, lineHeight: 2 }}>
                <span style={{ color: TXT }}>✏ Notes</span> — save job notes for this machine<br/>
                <span style={{ color: TXT }}>Timer</span> — countdown, count up, or log time manually<br/>
                <span style={{ color: TXT }}>Parts</span> — add stock items used on this job<br/>
                <span style={{ color: TXT }}>Status buttons</span> — move the job between Active · Queued · Complete
              </div>
              <button onClick={dismissJobGuide} style={{ marginTop: 8, background: "none", border: "none", color: "#444", fontSize: 8, cursor: "pointer", padding: 0, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: "0.05em" }}>got it</button>
            </div>
          )}
          <MachineNotes machine={m} onSave={async notes => { const u = { ...m, notes }; onUpdate(u); await upsertMachine(u); }} />
          {!timerLocked && <JobTimer machine={m} onUpdate={onUpdate} locked={false} onGoToBilling={onGoToBilling} />}
          {!timerLocked && <TimeLogSection machine={m} company={company} clients={clients} userId={session?.user?.id} onUpdate={onUpdate} />}
          {!partsLocked && <PartsSection machine={m} onUpdate={onUpdate} userId={session?.user?.id} />}
          {timerLocked && <UpgradeBanner text="Timer & parts log unlocks on Enthusiast." onUpgrade={onGoToBilling} marginBottom={0} />}
          {grandTotal > 0 && (
            <div style={{ marginTop: 10, padding: "8px 10px", background: "#0a0f0a", border: "1px solid #1e2e1e", borderRadius: 2, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 8, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>Cost Summary</span>
              {labourTotal != null && <span style={{ fontSize: 9, color: MUT }}>Labour <span style={{ color: GRN, fontFamily: "'IBM Plex Mono',monospace" }}>${labourTotal.toFixed(0)}</span></span>}
              {labourTotal == null && totalSecs > 0 && <span style={{ fontSize: 9, color: MUT }}>Labour <span style={{ color: MUT }}>—</span></span>}
              {partsTotal > 0 && <span style={{ fontSize: 9, color: MUT }}>Stock <span style={{ color: GRN, fontFamily: "'IBM Plex Mono',monospace" }}>${partsTotal.toFixed(0)}</span></span>}
              <span style={{ fontSize: 10, fontWeight: 700, color: GRN, fontFamily: "'IBM Plex Mono',monospace", marginLeft: "auto" }}>Total ${grandTotal.toFixed(0)}</span>
            </div>
          )}
          <Divider />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {STATUSES.filter(s => s !== status).map(s => (
              <button key={s} onClick={() => onUpdateStatus(m, s)} style={{ flex: 1, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "14px 10px", borderRadius: 3, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace", background: SBG_[s], color: SCOL[s], border: "1px solid " + SCOL[s] + "55" }}>
                → {s}
              </button>
            ))}
          </div>
          {(m.timeLog?.length >= 5) && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Rage Factor</div>
              <SkullRating value={m.rage || 0} onChange={r => onUpdateRage(m, r)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function JobBoard({ machines, setMachines, profile, company, session, clients, onGoToBilling }) {
  const tier = effectiveTier(profile, company);
  const isFree = tier === "free";
  const FREE_LIMIT = 3;
  const [jobSearch, setJobSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const clientMap = useMemo(() => Object.fromEntries((clients||[]).map(c => [c.id, c.name])), [clients]);

  const visibleMachines = useMemo(() => {
    let list = machines;
    if (statusFilter) list = list.filter(m => (m.status || "Active") === statusFilter);
    if (!jobSearch.trim()) return list;
    const q = jobSearch.toLowerCase();
    return list.filter(m =>
      (m.name||"").toLowerCase().includes(q) ||
      (m.make||"").toLowerCase().includes(q) ||
      (m.model||"").toLowerCase().includes(q) ||
      (m.clientId && (clientMap[m.clientId]||"").toLowerCase().includes(q))
    );
  }, [machines, jobSearch, statusFilter, clientMap]);

  const updateM = (updated) => setMachines(prev => prev.map(x => x.id === updated.id ? updated : x));
  const updateStatus = async (m, status) => { const u = { ...m, status }; await upsertMachine(u); setMachines(prev => prev.map(x => x.id === m.id ? u : x)); };
  const updateRage = async (m, rage) => { const u = { ...m, rage }; await upsertMachine(u); setMachines(prev => prev.map(x => x.id === m.id ? u : x)); };
  const groups = STATUSES.map(s => ({ status: s, items: visibleMachines.filter(m => (m.status || "Active") === s) }));

  const orderedAll = groups.flatMap(g => g.items);
  const cappedIds = isFree ? new Set(orderedAll.slice(0, FREE_LIMIT).map(m => m.id)) : null;
  const freeIdxMap = isFree ? Object.fromEntries(orderedAll.slice(0, FREE_LIMIT).map((m, i) => [m.id, i])) : {};
  const cappedGroups = isFree
    ? groups.map(g => ({ ...g, items: g.items.filter(m => cappedIds.has(m.id)) }))
    : groups;
  const hiddenCount = isFree ? Math.max(0, orderedAll.length - FREE_LIMIT) : 0;

  const totalHrsAll  = machines.reduce((s, m) => s + (m.timeLog||[]).reduce((a,e)=>a+(e.seconds||0),0)/3600, 0);
  const totalRevAll  = machines.reduce((s, m) => s + (m.parts||[]).reduce((a,p)=>a+(parseFloat(p.sellPrice)||0)*(Number(p.qty)||1),0), 0);
  const rate         = company?.hourly_rate || 0;
  const labourRevAll = totalHrsAll * rate;
  const runningTimer = machines.find(m => m.jobTimers?.[0]?.status === "running");

  return (
    <div style={{ padding: 16, flex: 1, overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <SL t="Job Board" />
        {machines.length > 0 && (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {runningTimer && (
              <span style={{ fontSize: 8, color: GRN, fontWeight: 700, letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: GRN, boxShadow: "0 0 4px " + GRN, display: "inline-block" }} />
                RUNNING
              </span>
            )}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: GRN, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1 }}>{totalHrsAll.toFixed(1)}h</div>
              <div style={{ fontSize: 7, color: MUT, letterSpacing: "0.06em" }}>LOGGED</div>
            </div>
            {(labourRevAll > 0 || totalRevAll > 0) && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: ACC, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1 }}>${(labourRevAll + totalRevAll).toFixed(0)}</div>
                <div style={{ fontSize: 7, color: MUT, letterSpacing: "0.06em" }}>GROSS REV</div>
              </div>
            )}
          </div>
        )}
      </div>
      <TabGuide storageKey="rat_tut_jobs" variant="info" title="your job board" lines={["start a timer from any machine card in Tracker","time + parts log here automatically"]} userId={profile?.id} initialDone={getPref(profile,"rat_tut_jobs",false)} />
      {machines.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
          <div style={{ fontSize: 12, color: ACC, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>No machines yet</div>
          <div style={{ fontSize: 10, color: MUT, lineHeight: 1.6 }}>Add machines from the Tracker tab, then manage their jobs, parts, and timers here.</div>
        </div>
      )}
      {machines.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <input style={{ ...inp, marginBottom: 8, fontSize: 11 }} placeholder="Filter by machine name, make, or client…" value={jobSearch} onChange={e => setJobSearch(e.target.value)} />
          <div style={{ display: "flex", gap: 0 }}>
            {["", ...STATUSES].map((s, i, arr) => {
              const isActive = statusFilter === s;
              return (
                <button key={s || "all"} onClick={() => setStatusFilter(s)} style={{ ...btnG, ...sm,
                  borderRadius: i === 0 ? "2px 0 0 2px" : i === arr.length - 1 ? "0 2px 2px 0" : "0",
                  borderRight: i < arr.length - 1 ? "none" : undefined,
                  background: isActive ? (s ? STATUS_COLOR[s] + "22" : ACC + "18") : "none",
                  color: isActive ? (s ? STATUS_COLOR[s] : ACC) : MUT,
                  boxShadow: isActive ? ("inset 0 0 0 1px " + (s ? STATUS_COLOR[s] + "99" : ACC)) : "none",
                }}>
                  {s || "All"}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {isFree && machines.length > 0 && (
        <UpgradeBanner label="Free Plan" text={`Showing ${Math.min(machines.length, FREE_LIMIT)} of ${machines.length} machines. First machine has full timer & parts access.`} onUpgrade={onGoToBilling} />
      )}
      {cappedGroups.map(({ status, items }) => items.length === 0 ? null : (
        <div key={status} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <StatusBadge status={status} />
            <span style={{ fontSize: 9, color: ACC, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>{status}</span>
            <span style={{ fontSize: 9, color: MUT }}>{items.length} machine{items.length !== 1 ? "s" : ""}</span>
          </div>
          {items.map(m => {
            const freeIdx = isFree ? (freeIdxMap[m.id] ?? 0) : -1;
            const locked = isFree && freeIdx > 0;
            return (
              <JobCard key={m.id} m={m} status={status} timerLocked={locked} partsLocked={locked}
                clientMap={clientMap} clients={clients} company={company} session={session} profile={profile}
                onUpdate={updateM} onUpdateStatus={updateStatus} onUpdateRage={updateRage}
                onGoToBilling={onGoToBilling} />
            );
          })}
        </div>
      ))}
      {hiddenCount > 0 && <UpgradeBanner text={`+${hiddenCount} more machine${hiddenCount !== 1 ? "s" : ""} hidden — upgrade to see all jobs`} onUpgrade={onGoToBilling} marginBottom={8} />}
    </div>
  );
}

export default JobBoard;
