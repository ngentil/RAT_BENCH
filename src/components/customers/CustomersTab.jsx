import React, { useState, useMemo } from 'react';
import { ACC, MUT, BRD, TXT, GRN, RED, SURF, inp, txa, btnA, btnG, btnD, sm, col, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { SL, FL } from '../ui/shared';
import { mIcon, getStorageStatus } from '../../lib/helpers';
import { upsertMachine, upsertClient, deleteClientApi } from '../../lib/db';
import { effectiveTier, canUse } from '../../lib/gates';
import { getActiveBooking } from '../../lib/db/bookings';
import PhotoAdder from '../ui/PhotoAdder';

function fmtHrs(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0 && m > 0) return h + "h " + m + "m";
  if (h > 0) return h + "h";
  return m + "m";
}

const EMPTY_FORM = { name: "", phone: "", email: "", address: "", notes: "", photos: [] };

function escHtml(s) {
  return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function fmtMoney(n) { return "$" + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,","); }

async function exportClientInvoice(client, linked, company, storagePolicyEnabled) {
  const rate = company?.hourly_rate || 0;
  const taxRate = company?.tax_rate || 0;
  const taxLabel = company?.tax_label || "Tax";
  const currencySymbol = company?.currency || "$";
  const companyName = company?.name || "Repair Shop";
  const companyPhone = company?.phone || "";
  const companyEmail = company?.email || "";

  let rows = "";
  let labourTotal = 0, partsTotal = 0, partsCost = 0;

  linked.forEach(m => {
    const mLabel = `${m.name}${m.make ? " — " + m.make : ""}${m.model ? " " + m.model : ""}`;
    rows += `<tr><td colspan="3" style="background:#f5f5f5;font-weight:700;font-size:13px;padding:8px 10px;border-top:2px solid #ddd">${escHtml(mLabel)}</td></tr>`;

    (m.timeLog || []).filter(e => e.completedAt).forEach(e => {
      const hrs = (e.seconds || 0) / 3600;
      const amount = hrs * rate;
      labourTotal += amount;
      const label = e.jobLabel && e.jobLabel !== "Job" ? e.jobLabel : "General work";
      const notes = e.sessionNotes ? `<div style="font-size:11px;color:#777;margin-top:2px">${escHtml(e.sessionNotes)}</div>` : "";
      const date = new Date(e.completedAt).toLocaleDateString();
      rows += `<tr><td style="padding:6px 10px">${escHtml(label)}${notes}<div style="font-size:10px;color:#aaa">${date}</div></td><td style="padding:6px 10px;text-align:right">${hrs.toFixed(2)}h × ${currencySymbol}${rate}/hr</td><td style="padding:6px 10px;text-align:right;font-weight:600">${currencySymbol}${amount.toFixed(2)}</td></tr>`;
    });

    (m.parts || []).forEach(p => {
      const qty = Number(p.qty) || 1;
      const sell = (parseFloat(p.sellPrice) || 0) * qty;
      const buy = (parseFloat(p.buyPrice) || 0) * qty;
      partsTotal += sell;
      partsCost += buy;
      const date = p.usedAt || p.addedAt ? new Date(p.usedAt || p.addedAt).toLocaleDateString() : "";
      rows += `<tr><td style="padding:6px 10px">${escHtml(p.name || "Part")}<div style="font-size:10px;color:#aaa">${date ? date + " · " : ""}${escHtml(p.partNumber || "")}</div></td><td style="padding:6px 10px;text-align:right">Qty ${qty}</td><td style="padding:6px 10px;text-align:right;font-weight:600">${currencySymbol}${sell.toFixed(2)}</td></tr>`;
    });
  });

  let storageTotal = 0;
  if (storagePolicyEnabled) {
    for (const m of linked) {
      const bk = await getActiveBooking(m.id);
      const st = getStorageStatus(bk);
      if (st.active && st.accrued > 0) storageTotal += st.accrued;
    }
  }

  const subtotal = labourTotal + partsTotal + storageTotal;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice — ${escHtml(client.name)}</title>
  <style>body{font-family:Arial,sans-serif;max-width:760px;margin:40px auto;color:#111;font-size:13px}
  h1{font-size:22px;margin:0}table{width:100%;border-collapse:collapse;margin-top:20px}
  td,th{border-bottom:1px solid #eee;vertical-align:top}th{background:#111;color:#fff;padding:8px 10px;text-align:left;font-size:11px;letter-spacing:0.08em;text-transform:uppercase}
  .total-row td{font-weight:700;font-size:15px;border-top:2px solid #111;border-bottom:none}
  @media print{button{display:none}}</style></head><body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px">
    <div><h1>${escHtml(companyName)}</h1>${companyPhone ? `<div style="color:#777;margin-top:4px">${escHtml(companyPhone)}</div>` : ""}${companyEmail ? `<div style="color:#777">${escHtml(companyEmail)}</div>` : ""}</div>
    <div style="text-align:right"><div style="font-size:22px;font-weight:700">INVOICE</div><div style="color:#777;margin-top:4px">${new Date().toLocaleDateString()}</div></div>
  </div>
  <div style="background:#f9f9f9;border:1px solid #eee;border-radius:4px;padding:14px 18px;margin-bottom:20px">
    <div style="font-size:10px;color:#777;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px">Bill To</div>
    <div style="font-weight:700;font-size:15px">${escHtml(client.name)}</div>
    ${client.address ? `<div style="color:#555;margin-top:3px;white-space:pre-line">${escHtml(client.address)}</div>` : ""}
    ${client.phone ? `<div style="color:#555;margin-top:3px">📞 ${escHtml(client.phone)}</div>` : ""}
    ${client.email ? `<div style="color:#555">✉ ${escHtml(client.email)}</div>` : ""}
  </div>
  <table><thead><tr><th>Description</th><th style="text-align:right">Details</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>${rows}
  ${labourTotal > 0 ? `<tr><td colspan="2" style="padding:8px 10px;text-align:right;color:#777">Labour</td><td style="padding:8px 10px;text-align:right;font-weight:600">${currencySymbol}${labourTotal.toFixed(2)}</td></tr>` : ""}
  ${partsTotal > 0 ? `<tr><td colspan="2" style="padding:8px 10px;text-align:right;color:#777">Parts</td><td style="padding:8px 10px;text-align:right;font-weight:600">${currencySymbol}${partsTotal.toFixed(2)}</td></tr>` : ""}
  ${storageTotal > 0 ? `<tr><td colspan="2" style="padding:8px 10px;text-align:right;color:#777">Storage fees</td><td style="padding:8px 10px;text-align:right;font-weight:600">${currencySymbol}${storageTotal.toFixed(2)}</td></tr>` : ""}
  ${taxRate > 0 ? `<tr><td colspan="2" style="padding:8px 10px;text-align:right;color:#777">${escHtml(taxLabel)} (${taxRate}%)</td><td style="padding:8px 10px;text-align:right;font-weight:600">${currencySymbol}${tax.toFixed(2)}</td></tr>` : ""}
  <tr class="total-row"><td colspan="2" style="padding:10px 10px;text-align:right">Total</td><td style="padding:10px 10px;text-align:right">${currencySymbol}${total.toFixed(2)}</td></tr>
  </tbody></table>
  <div style="margin-top:30px;text-align:center"><button onclick="window.print()" style="background:#111;color:#fff;border:none;padding:10px 24px;border-radius:4px;font-size:13px;cursor:pointer">Print / Save PDF</button></div>
  </body></html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

export default function CustomersTab({ machines, setMachines, clients, setClients, session, company, profile, onGoToBilling }) {
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [err, setErr] = useState("");

  const isFree = effectiveTier(profile, company) === "free";
  const storagePolicyEnabled = canUse('storage_policy', profile, company) && !!(profile?.storage_policy_enabled);

  const openNew = () => { setForm(EMPTY_FORM); setErr(""); setEditing("new"); };
  const openEdit = (c) => { setForm({ name: c.name, phone: c.phone || "", email: c.email || "", address: c.address || "", notes: c.notes || "", photos: c.photos || [] }); setErr(""); setEditing(c); };

  const updateClient = async (c) => {
    await upsertClient(c).catch(() => {});
    setClients(prev => prev.map(x => x.id === c.id ? c : x));
  };
  const closeModal = () => { setEditing(null); setErr(""); setSaving(false); };

  const save = async () => {
    if (!form.name.trim()) { setErr("Name is required."); return; }
    setSaving(true);
    try {
      if (editing === "new") {
        const c = { ...form, name: form.name.trim(), address: form.address.trim(), photos: form.photos || [], id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        await upsertClient(c);
        setClients(prev => [...prev, c]);
      } else {
        const c = { ...editing, ...form, name: form.name.trim(), address: form.address.trim(), photos: form.photos || [] };
        await upsertClient(c);
        setClients(prev => prev.map(x => x.id === c.id ? c : x));
      }
      closeModal();
    } catch (e) { setErr("Save failed: " + e.message); setSaving(false); }
  };

  const deleteClient = async (id) => {
    if (!confirm("Delete this client? Machines linked to them will be unlinked.")) return;
    await deleteClientApi(id).catch(() => {});
    setClients(prev => prev.filter(c => c.id !== id));
    const toUnlink = machines.filter(m => m.clientId === id);
    toUnlink.forEach(m => {
      const updated = { ...m, clientId: null };
      upsertMachine(updated).catch(() => {});
      setMachines(prev => prev.map(x => x.id === m.id ? updated : x));
    });
  };

  const linkMachine = async (clientId, machineId) => {
    if (!machineId) return;
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return;
    const updated = { ...machine, clientId };
    await upsertMachine(updated).catch(() => {});
    setMachines(prev => prev.map(m => m.id === machineId ? updated : m));
  };

  const unlinkMachine = async (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return;
    const updated = { ...machine, clientId: null };
    await upsertMachine(updated).catch(() => {});
    setMachines(prev => prev.map(m => m.id === machineId ? updated : m));
  };

  const filtered = useMemo(() => {
    if (isFree) return [];
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.phone || "").includes(q)
    );
  }, [clients, search, isFree]);

  if (isFree) {
    return (
      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center" }}>
        <div style={{ fontSize: 28 }}>👤</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: TXT }}>Clients</div>
        <div style={{ fontSize: 10, color: MUT, maxWidth: 280, lineHeight: 1.7 }}>
          Link machines to clients, track work history per customer, and generate client reports. Available on the Enthusiast plan and above.
        </div>
        {onGoToBilling && <button onClick={onGoToBilling} style={{ ...btnA, ...sm }}>View Plans</button>}
      </div>
    );
  }

  const getLinked = (clientId) => machines.filter(m => m.clientId === clientId);
  const unlinked = machines.filter(m => !m.clientId);

  return (
    <div style={{ padding: 16, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <SL t="Clients" />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 9, color: MUT }}>{clients.length} client{clients.length !== 1 ? "s" : ""}</span>
          <button onClick={openNew} style={{ ...btnA, ...sm }}>+ Add Client</button>
        </div>
      </div>

      {clients.length > 0 && (
        <input
          style={{ ...inp, marginBottom: 12, fontSize: 11 }}
          placeholder="Search clients…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      )}

      {clients.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, lineHeight: 1.7, padding: "32px 0", textAlign: "center" }}>
          <div style={{ fontSize: 22, marginBottom: 10 }}>👤</div>
          No clients yet.<br />
          Add clients and link machines to track work history per customer.
        </div>
      )}

      {filtered.map(client => {
        const linked = getLinked(client.id);
        const totalSecs = linked.flatMap(m => m.timeLog || []).reduce((s, e) => s + (e.seconds || 0), 0);
        const totalPartsRev = linked.flatMap(m => m.parts || []).reduce((s, p) => s + (parseFloat(p.sellPrice) || 0) * (Number(p.qty) || 1), 0);
        const rate = company?.hourly_rate || 0;
        const labourRev = (totalSecs / 3600) * rate;
        const totalRev = labourRev + totalPartsRev;
        return (
          <div key={client.id} style={{ background: SURF, border: "1px solid " + BRD, borderLeft: "3px solid " + ACC, borderRadius: 2, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: linked.length ? 10 : 0 }}>
              {client.photos?.[0] && (
                <img src={client.photos[0]} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 2, flexShrink: 0, border: "1px solid #252525", marginRight: 10, marginTop: 1 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TXT }}>{client.name}</div>
                  {totalSecs > 0 && (
                    <span style={{ fontSize: 8, color: GRN, border: "1px solid " + GRN + "44", background: GRN + "11", padding: "1px 6px", borderRadius: 2 }}>
                      {fmtHrs(totalSecs)} logged
                    </span>
                  )}
                  {totalRev > 0 && rate > 0 && (
                    <span style={{ fontSize: 8, color: ACC, border: "1px solid " + ACC + "44", background: ACC + "11", padding: "1px 6px", borderRadius: 2 }}>
                      ${totalRev.toFixed(0)} revenue
                    </span>
                  )}
                </div>
                {client.phone && <div style={{ fontSize: 9, color: MUT, marginTop: 3 }}>📞 {client.phone}</div>}
                {client.email && <div style={{ fontSize: 9, color: MUT }}>✉ {client.email}</div>}
                {client.address && <div style={{ fontSize: 9, color: MUT, marginTop: 2, lineHeight: 1.5, whiteSpace: "pre-line" }}>📍 {client.address}</div>}
                {client.notes && <div style={{ fontSize: 9, color: MUT, marginTop: 4, lineHeight: 1.5 }}>{client.notes}</div>}
                {client.photos?.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginTop: 8 }}>
                    {client.photos.map((p, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img src={p} alt="" style={{ width: "100%", height: 56, objectFit: "cover", borderRadius: 2, border: i === 0 ? "1px solid " + ACC + "88" : "1px solid #252525", display: "block" }} />
                        <button
                          title={i === 0 ? "Cover photo" : "Set as cover"}
                          onClick={e => { e.stopPropagation(); if (i === 0) return; updateClient({ ...client, photos: [p, ...client.photos.filter((_, j) => j !== i)] }); }}
                          style={{ position: "absolute", top: 2, left: 2, background: i === 0 ? ACC : "rgba(0,0,0,0.7)", border: "none", borderRadius: 2, cursor: i === 0 ? "default" : "pointer", fontSize: 8, padding: "2px 4px", color: i === 0 ? "#000" : MUT, lineHeight: 1 }}>
                          {i === 0 ? "⭐" : "☆ Cover"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {linked.length > 0 && <button onClick={() => exportClientInvoice(client, linked, company, storagePolicyEnabled)} style={{ ...btnG, ...sm }}>Invoice</button>}
                <button onClick={() => openEdit(client)} style={{ ...btnG, ...sm }}>Edit</button>
                <button onClick={() => deleteClient(client.id)} style={{ ...btnD }}>Del</button>
              </div>
            </div>

            {linked.length > 0 && (
              <div style={{ marginBottom: 8, paddingTop: linked.length ? 8 : 0, borderTop: linked.length ? "1px solid " + BRD : "none" }}>
                <div style={{ fontSize: 8, color: ACC, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>
                  Machines ({linked.length})
                </div>
                {linked.map(m => {
                  const mSecs = (m.timeLog || []).reduce((s, e) => s + (e.seconds || 0), 0);
                  return (
                    <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #181818" }}>
                      <span style={{ fontSize: 14 }}>{mIcon(m.type)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, color: TXT, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                        {m.make && <div style={{ fontSize: 8, color: MUT }}>{m.make} {m.model || ""}</div>}
                      </div>
                      {mSecs > 0 && <span style={{ fontSize: 8, color: GRN, flexShrink: 0 }}>{fmtHrs(mSecs)}</span>}
                      <button
                        onClick={() => unlinkMachine(m.id)}
                        style={{ ...btnD, fontSize: 7, padding: "2px 6px", flexShrink: 0 }}
                      >
                        Unlink
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {unlinked.length > 0 && (
              <select
                defaultValue=""
                style={{
                  width: "100%", background: "#0a0a0a", border: "1px solid " + BRD, color: MUT,
                  fontSize: 9, padding: "5px 8px", borderRadius: 2, fontFamily: "'IBM Plex Mono',monospace",
                  cursor: "pointer",
                }}
                onChange={e => { linkMachine(client.id, e.target.value); e.target.value = ""; }}
              >
                <option value="">+ Link a machine…</option>
                {unlinked.map(m => (
                  <option key={m.id} value={m.id}>{mIcon(m.type)} {m.name}</option>
                ))}
              </select>
            )}
          </div>
        );
      })}

      {filtered.length === 0 && clients.length > 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "24px 0" }}>No clients match your search.</div>
      )}

      <div style={{ marginTop: 8, fontSize: 8, color: MUT, lineHeight: 1.6 }}>
        Client data syncs with your account across all devices.
      </div>

      {editing !== null && (
        <div style={ovly} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={mdl}>
            <div style={mdlH}>
              <span style={{ fontSize: 12, fontWeight: 700, color: TXT }}>{editing === "new" ? "New Client" : "Edit Client"}</span>
              <button onClick={closeModal} style={{ background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            <div style={mdlB}>
              <div style={col}>
                <FL t="Name *" />
                <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Client or business name" autoFocus />
              </div>
              <div style={col}>
                <FL t="Phone" />
                <input style={inp} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+61 4xx xxx xxx" />
              </div>
              <div style={col}>
                <FL t="Email" />
                <input style={inp} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="client@example.com" />
              </div>
              <div style={col}>
                <FL t="Address" />
                <textarea style={{ ...txa, minHeight: 48 }} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street, suburb, postcode…" />
              </div>
              <div style={col}>
                <FL t="Notes" />
                <textarea style={txa} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Address, job notes, preferences…" />
              </div>
              <div style={col}>
                <PhotoAdder photos={form.photos || []} setPhotos={ps => setForm(f => ({ ...f, photos: typeof ps === 'function' ? ps(f.photos || []) : ps }))} />
              </div>
              {err && <div style={{ fontSize: 10, color: "#c94040", marginBottom: 8 }}>{err}</div>}
            </div>
            <div style={mdlF}>
              <button onClick={closeModal} style={{ ...btnG, ...sm }} disabled={saving}>Cancel</button>
              <button onClick={save} style={{ ...btnA, ...sm, opacity: saving ? 0.6 : 1 }} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
