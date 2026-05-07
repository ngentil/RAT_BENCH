import React, { useState, useEffect, useMemo } from 'react';
import { ACC, MUT, BRD, TXT, GRN, SURF, inp, txa, btnA, btnG, btnD, sm, col, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { SL, FL } from '../ui/shared';
import { mIcon } from '../../lib/helpers';
import { upsertMachine } from '../../lib/db';

function loadClients(userId) {
  try { return JSON.parse(localStorage.getItem("rat_clients_" + userId) || "[]"); }
  catch { return []; }
}

function fmtHrs(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0 && m > 0) return h + "h " + m + "m";
  if (h > 0) return h + "h";
  return m + "m";
}

const EMPTY_FORM = { name: "", phone: "", email: "", notes: "" };

export default function CustomersTab({ machines, setMachines, session }) {
  const userId = session?.user?.id;
  const [clients, setClients] = useState(() => loadClients(userId));
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (userId) localStorage.setItem("rat_clients_" + userId, JSON.stringify(clients));
  }, [clients, userId]);

  const openNew = () => { setForm(EMPTY_FORM); setErr(""); setEditing("new"); };
  const openEdit = (c) => { setForm({ name: c.name, phone: c.phone || "", email: c.email || "", notes: c.notes || "" }); setErr(""); setEditing(c); };
  const closeModal = () => { setEditing(null); setErr(""); };

  const save = () => {
    if (!form.name.trim()) { setErr("Name is required."); return; }
    if (editing === "new") {
      const c = { ...form, name: form.name.trim(), id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      setClients(prev => [...prev, c]);
    } else {
      setClients(prev => prev.map(c => c.id === editing.id ? { ...c, ...form, name: form.name.trim() } : c));
    }
    closeModal();
  };

  const deleteClient = (id) => {
    if (!confirm("Delete this client? Machines linked to them will be unlinked.")) return;
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
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.phone || "").includes(q)
    );
  }, [clients, search]);

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

      {clients.length > 5 && (
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
        return (
          <div key={client.id} style={{ background: SURF, border: "1px solid " + BRD, borderRadius: 2, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: linked.length ? 10 : 0 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TXT }}>{client.name}</div>
                  {totalSecs > 0 && (
                    <span style={{ fontSize: 8, color: GRN, border: "1px solid " + GRN + "44", background: GRN + "11", padding: "1px 6px", borderRadius: 2 }}>
                      {fmtHrs(totalSecs)} logged
                    </span>
                  )}
                </div>
                {client.phone && <div style={{ fontSize: 9, color: MUT, marginTop: 3 }}>📞 {client.phone}</div>}
                {client.email && <div style={{ fontSize: 9, color: MUT }}>✉ {client.email}</div>}
                {client.notes && <div style={{ fontSize: 9, color: MUT, marginTop: 4, lineHeight: 1.5 }}>{client.notes}</div>}
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 10 }}>
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
        Client data is stored locally on this device. Link machines to clients to track work history per customer.
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
                <FL t="Notes" />
                <textarea style={txa} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Address, job notes, preferences…" />
              </div>
              {err && <div style={{ fontSize: 10, color: "#c94040", marginBottom: 8 }}>{err}</div>}
            </div>
            <div style={mdlF}>
              <button onClick={closeModal} style={{ ...btnG, ...sm }}>Cancel</button>
              <button onClick={save} style={{ ...btnA, ...sm }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
