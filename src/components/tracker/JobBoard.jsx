import React, { useState, useEffect } from 'react';
import { upsertMachine } from '../../lib/db';
import { getInventory, adjustStock } from '../../lib/db/inventory';
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

function nextInvoiceNumber(userId) {
  const key = `rat_inv_seq_${userId}`;
  const n = (parseInt(localStorage.getItem(key) || '0') || 0) + 1;
  localStorage.setItem(key, String(n));
  return `INV-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`;
}

function exportInvoice(machine, company, userId, docType = 'invoice') {
  const log   = machine.timeLog || [];
  const parts = machine.parts   || [];
  if (!log.length && !parts.length) return;

  // Load linked client from localStorage
  const clients = (() => { try { return JSON.parse(localStorage.getItem(`rat_clients_${userId}`) || '[]'); } catch { return []; } })();
  const client  = machine.clientId ? clients.find(c => c.id === machine.clientId) : null;

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
    : nextInvoiceNumber(userId);

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
    return `<tr>
      <td>${escHtml(e.jobLabel && e.jobLabel !== 'Job' ? e.jobLabel.slice(0, 80) : 'General work')}</td>
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
    ${co.logo ? `<img class="co-logo" src="${co.logo}" alt=""/>` : ''}
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

  const win = window.open('', '_blank');
  if (!win) { alert('Please allow popups to export.'); return; }
  win.document.write(html);
  win.document.close();
}

const timerSel = {
  width: "100%", background: "#111", border: "1px solid #333", borderRadius: 2,
  color: TXT, fontSize: 10, padding: "5px 6px", fontFamily: "'IBM Plex Mono',monospace",
  cursor: "pointer",
};

const BILL_STATUS = {
  logged:   { label: "Logged",   color: "#5a5a5a" },
  quoted:   { label: "Quoted",   color: "#4a9eff" },
  invoiced: { label: "Invoiced", color: "#3d9e50" },
};

function TimeLogSection({ machine, company, userId, onUpdate }) {
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

  const cycleBillStatus = async (entryId) => {
    const order = ["logged", "quoted", "invoiced"];
    const updated = {
      ...machine,
      timeLog: machine.timeLog.map(e => {
        if (e.id !== entryId) return e;
        const cur = e.billStatus || "logged";
        const next = order[(order.indexOf(cur) + 1) % order.length];
        return { ...e, billStatus: next };
      }),
    };
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
        <button onClick={() => exportInvoice(machine, company, userId, 'quote')} style={{ ...btnG, ...sm, fontSize: 8 }}>Quote</button>
        <button onClick={() => exportInvoice(machine, company, userId, 'invoice')} style={{ ...btnA, ...sm, fontSize: 8 }}>Invoice</button>
      </div>
      {expanded && (
        <div style={{ marginTop: 8 }}>
          {log.map((entry, idx) => {
            const bs = BILL_STATUS[entry.billStatus || "logged"];
            return (
              <div
                key={entry.id || idx}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #181818" }}
              >
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
            );
          })}
        </div>
      )}
    </div>
  );
}

function PartsSection({ machine, onUpdate, userId }) {
  const [mode, setMode]     = useState(null); // null | "inv" | "standalone"
  const [inv, setInv]       = useState(() => getInventory(userId));
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null); // inventory item
  const [qty, setQty]       = useState("1");
  const [saForm, setSaForm] = useState({ name:"", partNumber:"", brand:"", qty:"1", buyPrice:"", sellPrice:"", notes:"" });
  const parts = machine.parts || [];

  const totalRevenue = parts.reduce((s,p)=>(s+(parseFloat(p.sellPrice)||0)*(Number(p.qty)||1)),0);
  const totalCost    = parts.reduce((s,p)=>(s+(parseFloat(p.buyPrice)||0)*(Number(p.qty)||1)),0);

  const inpS = { background:"#0a0a0a", border:"1px solid #252525", color:TXT, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, padding:"6px 8px", borderRadius:2, outline:"none", boxSizing:"border-box", width:"100%" };
  const L = ({ t }) => <div style={{ fontSize:8, color:MUT, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:3 }}>{t}</div>;

  const filteredInv = inv.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.partNumber||"").toLowerCase().includes(search.toLowerCase())
  );

  const useFromInventory = async () => {
    if (!selected) return;
    const useQty = Math.max(1, parseInt(qty) || 1);
    const entry = {
      id: crypto.randomUUID(),
      inventoryId: selected.id,
      name: selected.name,
      partNumber: selected.partNumber || "",
      brand: selected.brand || "",
      qty: useQty,
      buyPrice: parseFloat(selected.buyPrice) || 0,
      sellPrice: parseFloat(selected.sellPrice) || 0,
      usedAt: new Date().toISOString(),
    };
    const updated = { ...machine, parts: [...parts, entry] };
    onUpdate(updated);
    await upsertMachine(updated);
    setInv(adjustStock(userId, selected.id, -useQty));
    setMode(null); setSelected(null); setQty("1"); setSearch("");
  };

  const addStandalone = async () => {
    if (!saForm.name.trim()) return;
    const entry = { ...saForm, id: crypto.randomUUID(), qty: parseInt(saForm.qty)||1, buyPrice: parseFloat(saForm.buyPrice)||0, sellPrice: parseFloat(saForm.sellPrice)||0, usedAt: new Date().toISOString() };
    const updated = { ...machine, parts: [...parts, entry] };
    onUpdate(updated);
    await upsertMachine(updated);
    setMode(null); setSaForm({ name:"", partNumber:"", brand:"", qty:"1", buyPrice:"", sellPrice:"", notes:"" });
  };

  const remove = async (idx) => {
    if (!confirm("Remove this part usage? Stock will be returned if it came from inventory.")) return;
    const p = parts[idx];
    const updated = { ...machine, parts: parts.filter((_,i) => i !== idx) };
    onUpdate(updated);
    await upsertMachine(updated);
    if (p.inventoryId) setInv(adjustStock(userId, p.inventoryId, Number(p.qty) || 1));
  };

  return (
    <div style={{ marginTop:8 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ fontSize:9, color:ACC, letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:700 }}>
          Parts Used {parts.length > 0 && `(${parts.length})`}
          {totalRevenue > 0 && <span style={{ color:GRN, marginLeft:8 }}>${totalRevenue.toFixed(2)}</span>}
          {totalCost > 0 && totalRevenue > 0 && <span style={{ color:MUT, marginLeft:4, fontSize:8 }}>cost ${totalCost.toFixed(2)}</span>}
        </div>
        {!mode && (
          <div style={{ display:"flex", gap:5 }}>
            {inv.length > 0 && <button onClick={() => setMode("inv")} style={{ ...btnA, ...sm, fontSize:8 }}>Use from Inventory</button>}
            <button onClick={() => setMode("standalone")} style={{ ...btnG, ...sm, fontSize:8 }}>+ One-off</button>
          </div>
        )}
      </div>

      {/* Inventory picker */}
      {mode === "inv" && (
        <div style={{ background:"#0a0f0a", border:"1px solid "+ACC+"44", borderRadius:2, padding:"10px 12px", marginBottom:8 }}>
          <div style={{ fontSize:9, color:ACC, letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>Use from Inventory</div>
          <input style={{ ...inpS, marginBottom:8 }} placeholder="Search inventory…" value={search} onChange={e=>setSearch(e.target.value)} autoFocus/>
          <div style={{ maxHeight:160, overflowY:"auto", marginBottom:8 }}>
            {filteredInv.map(i => {
              const stockQty = Number(i.stockQty) || 0;
              return (
                <div key={i.id} onClick={() => { setSelected(i); setSearch(""); }}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 8px", borderRadius:2, cursor:"pointer", background: selected?.id===i.id ? ACC+"22" : "transparent", border:"1px solid "+(selected?.id===i.id ? ACC+"55" : "transparent"), marginBottom:3 }}>
                  <div>
                    <div style={{ fontSize:10, color:TXT, fontWeight:700 }}>{i.name}</div>
                    <div style={{ fontSize:8, color:MUT }}>{[i.brand, i.partNumber].filter(Boolean).join(" · ")}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:10, color:stockQty>0?GRN:RED, fontWeight:700 }}>{stockQty} in stock</div>
                    {i.sellPrice && <div style={{ fontSize:8, color:MUT }}>${parseFloat(i.sellPrice).toFixed(2)} ea</div>}
                  </div>
                </div>
              );
            })}
            {filteredInv.length === 0 && <div style={{ fontSize:9, color:MUT, padding:8 }}>No matching items.</div>}
          </div>
          {selected && (
            <div style={{ display:"flex", gap:8, alignItems:"center", padding:"8px", background:"#111", borderRadius:2, marginBottom:8 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, color:TXT, fontWeight:700 }}>{selected.name}</div>
                <div style={{ fontSize:8, color:MUT }}>Cost ${(parseFloat(selected.buyPrice)||0).toFixed(2)} · Sell ${(parseFloat(selected.sellPrice)||0).toFixed(2)}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ fontSize:8, color:MUT }}>Qty</div>
                <input style={{ ...inpS, width:50, textAlign:"center" }} type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)}/>
              </div>
            </div>
          )}
          <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
            <button onClick={() => { setMode(null); setSelected(null); setSearch(""); }} style={{ ...btnG, ...sm }}>Cancel</button>
            <button onClick={useFromInventory} disabled={!selected} style={{ ...btnA, ...sm, opacity: selected?1:0.4 }}>Use Part</button>
          </div>
        </div>
      )}

      {/* Standalone one-off */}
      {mode === "standalone" && (
        <div style={{ background:"#0a0a0a", border:"1px solid "+ACC, borderRadius:2, padding:"10px 12px", marginBottom:8 }}>
          <div style={{ fontSize:9, color:ACC, letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>One-off Part</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
            <div style={{ gridColumn:"1/-1" }}><L t="Name *"/><input style={inpS} value={saForm.name} onChange={e=>setSaForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Air filter" autoFocus/></div>
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
            <button onClick={() => setMode(null)} style={{ ...btnG, ...sm }}>Cancel</button>
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
                {Number(p.qty)>1 && <span style={{ fontSize:8, color:MUT, flexShrink:0 }}>×{p.qty}</span>}
                {p.partNumber && <span style={{ fontSize:8, color:MUT, flexShrink:0, fontFamily:"'IBM Plex Mono',monospace", background:"#111", padding:"1px 4px", borderRadius:2 }}>{p.partNumber}</span>}
                {p.inventoryId && <span style={{ fontSize:7, color:ACC, letterSpacing:"0.06em" }}>INV</span>}
              </div>
              {(rev > 0 || cost > 0) && (
                <div style={{ fontSize:8, color:MUT }}>
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
  const [mode, setMode] = useState("countdown");

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
    const updated = { ...machine, jobTimer: { ...t, ...updates } };
    onUpdate(updated);
    await upsertMachine(updated);
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
      jobLabel: t.jobLabel || "",
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

  const remaining = t.duration > 0 ? Math.max(0, t.duration - display) : 0;
  const pct = t.duration > 0 ? remaining / t.duration : 1;
  const isExpired = t.duration > 0 && display >= t.duration && t.status === "running";
  const glowColor = t.status === "done" ? GRN : pct > 0.5 ? GRN : pct > 0.2 ? ORANGE : RED;

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
    const tabStyle = (active) => ({
      padding: "2px 8px", fontSize: 8, fontWeight: 700, letterSpacing: "0.07em",
      textTransform: "uppercase", cursor: "pointer", border: "1px solid #333", fontFamily: "'IBM Plex Mono',monospace",
      background: active ? ACC : "none", color: active ? "#000" : MUT,
    });
    return (
      <div style={{ marginTop: 10, padding: "10px 12px", background: "#0d0d0d", border: "1px solid #252525", borderRadius: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", flex: 1 }}>Job Timer</div>
          <button onClick={() => setMode("countdown")} style={{ ...tabStyle(mode === "countdown"), borderRadius: "2px 0 0 2px", borderRight: "none" }}>↓ Countdown</button>
          <button onClick={() => setMode("countup")}   style={{ ...tabStyle(mode === "countup"),   borderRadius: "0 2px 2px 0" }}>↑ Count Up</button>
        </div>
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
        {mode === "countdown" ? (
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
        ) : (
          <button onClick={handleStart} style={{ ...btnA, ...sm }}>▶ Start</button>
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

function JobBoard({ machines, setMachines, profile, company, session, onGoToBilling }) {
  const tier = effectiveTier(profile, company);
  const timerLocked = tier === "free";

  const updateM = (updated) => setMachines(prev => prev.map(x => x.id === updated.id ? updated : x));
  const updateStatus = async (m, status) => { const u = { ...m, status }; await upsertMachine(u); setMachines(prev => prev.map(x => x.id === m.id ? u : x)); };
  const updateRage = async (m, rage) => { const u = { ...m, rage }; await upsertMachine(u); setMachines(prev => prev.map(x => x.id === m.id ? u : x)); };
  const groups = STATUSES.map(s => ({ status: s, items: machines.filter(m => (m.status || "Active") === s) }));

  return (
    <div style={{ padding: 16, flex: 1 }}>
      <SL t="Job Board" />
      {machines.length === 0 && <Empty icon="🗂" t="No machines yet" sub="Add machines from the Tracker tab, then manage their jobs, parts, and timers here." />}
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
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 2 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: TXT }}>{m.name}</div>
                    {(m.timeLog?.length > 0) && (() => {
                      const totalSecs = m.timeLog.reduce((s, e) => s + (e.seconds || 0), 0);
                      return (
                        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: GRN, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1 }}>{fmtDuration(totalSecs)}</div>
                          <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.06em", marginTop: 2 }}>TIME LOGGED</div>
                        </div>
                      );
                    })()}
                  </div>
                  <div style={{ fontSize: 9, color: MUT, marginBottom: 8 }}>{[m.source, m.make, m.model].filter(Boolean).join("  ·  ")}</div>
                  {m.notes && <div style={{ fontSize: 11, color: "#777", lineHeight: 1.5, marginBottom: 8 }}>{m.notes}</div>}
                  <JobTimer machine={m} onUpdate={updateM} locked={timerLocked} onGoToBilling={onGoToBilling} />
                  <TimeLogSection machine={m} company={company} userId={session?.user?.id} onUpdate={updateM} />
                  <PartsSection machine={m} onUpdate={updateM} userId={session?.user?.id} />
                  <Divider />
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {STATUSES.filter(s => s !== status).map(s => (
                      <button key={s} onClick={() => updateStatus(m, s)} style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 9px", borderRadius: 2, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace", background: SBG_[s], color: SCOL[s], border: "1px solid " + SCOL[s] + "55" }}>
                        → {s}
                      </button>
                    ))}
                  </div>
                  {(m.timeLog?.length >= 5) && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Rage Factor</div>
                      <SkullRating value={m.rage || 0} onChange={r => updateRage(m, r)} />
                    </div>
                  )}
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
