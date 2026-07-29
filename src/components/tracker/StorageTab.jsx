import React, { useState, useEffect, useMemo } from 'react';
import { MUT, BRD, SURF, TXT, GRN, RED, ACC, inp, btnA, btnG, sm } from '../../lib/styles';
import { SL, Empty } from '../ui/shared';
import { upsertMachine } from '../../lib/db';
import { getAllActiveBookings, collectMachine } from '../../lib/db/bookings';
import { createCollection } from '../../lib/db/collections';
import { getTiers } from '../../lib/storageTiers';
import { getStorageStatus, mIcon } from '../../lib/helpers';
import { toastError } from '../../lib/toast';

const qtyOf = p => (p.qty == null || p.qty === '') ? 1 : (Number(p.qty) || 0);
const fmt$  = n => `$${(n || 0).toFixed(2)}`;

const emptyCollectForm = { name: "", phone: "", unknown: false };

function StorageTab({ machines, setMachines, profile, company, active }) {
  const [bookings, setBookings] = useState([]);
  const [loaded, setLoaded]     = useState(false);
  const [collectFormRow, setCollectFormRow] = useState(null); // booking id whose Collected form is open
  const [collectForm, setCollectForm]       = useState(emptyCollectForm);
  const [collectErr, setCollectErr]         = useState("");

  // Like every other Workshop sub-tab this stays mounted (display:none) for
  // the whole session rather than unmounting on tab switch — a mount-only
  // fetch would go stale the moment a machine gets booked into storage from
  // elsewhere. Refetching on every activation keeps it current without
  // polling while it's not even visible.
  useEffect(() => {
    if (!active) return;
    let alive = true;
    getAllActiveBookings().then(rows => { if (alive) { setBookings(rows); setLoaded(true); } });
    return () => { alive = false; };
  }, [active]);

  const activeTiers = useMemo(() => getTiers(profile?.storage_tiers), [profile?.storage_tiers]);
  const rateRaw    = parseFloat(company?.hourly_rate);
  const hourlyRate = Number.isFinite(rateRaw) ? rateRaw : null;

  // Each booked machine's combined owed — labour + parts (unbilled only, same
  // definition JobBoard/CustomersTab already use for "what would this invoice
  // charge") + accrued storage fee — checked against its estimated value so
  // an abandoned machine racking up fees shows up at a glance.
  const rows = useMemo(() => (
    bookings.map(b => {
      const m = machines.find(x => x.id === b.machine_id);
      if (!m) return null;
      const storageStatus = getStorageStatus(b, activeTiers);
      const unbilledLog   = (m.timeLog || []).filter(e => (e.billStatus || 'logged') !== 'invoiced');
      const unbilledParts = (m.parts   || []).filter(p => (p.billStatus || 'logged') !== 'invoiced');
      const labourOwed = hourlyRate !== null
        ? unbilledLog.reduce((s, e) => s + ((e.seconds || 0) / 3600) * hourlyRate, 0)
        : 0;
      const partsOwed  = unbilledParts.reduce((s, p) => s + (parseFloat(p.sellPrice) || 0) * qtyOf(p), 0);
      const storageOwed = storageStatus.accrued || 0;
      const totalOwed   = labourOwed + partsOwed + storageOwed;
      const value   = (m.estimatedValue != null && m.estimatedValue !== '') ? parseFloat(m.estimatedValue) : null;
      const exceeds = value != null && totalOwed > value;
      return { m, b, storageStatus, labourOwed, partsOwed, storageOwed, totalOwed, value, exceeds };
    }).filter(Boolean).sort((a, b) => b.totalOwed - a.totalOwed)
  ), [bookings, machines, activeTiers, hourlyRate]);

  // toBench sends it straight onto the Bench instead of parking it back in
  // Garage — for when the reason it's being pulled from storage is to start
  // work on it right away.
  const doCollect = async (row, toBench) => {
    try {
      await collectMachine(row.b.id);
      if (toBench) {
        const u = { ...row.m, onBench: true };
        await upsertMachine(u);
        setMachines(prev => prev.map(x => x.id === u.id ? u : x));
      }
      setBookings(prev => prev.filter(b => b.id !== row.b.id));
    } catch (e) {
      console.error("collectMachine:", e);
      toastError("Couldn't move out of storage — check connection");
    }
  };

  // A customer taking the machine away is a third destination, distinct from
  // Garage/Bench — onBench is already false here so it doesn't need touching,
  // unlike the toBench branch above. Creates the collection record BEFORE
  // closing the storage booking (not after) — if it were the other way
  // around and this insert failed, the booking would already be closed with
  // no collection record to show for it, so the machine would silently fall
  // back to Garage instead of staying visibly in Storage where the retry
  // button still is.
  const doMarkCollected = async (row) => {
    setCollectErr("");
    try {
      await createCollection({
        machineId: row.m.id,
        customerName: collectForm.name,
        customerPhone: collectForm.phone,
        customerUnknown: collectForm.unknown,
      });
      await collectMachine(row.b.id);
      setBookings(prev => prev.filter(b => b.id !== row.b.id));
      setCollectFormRow(null);
      setCollectForm(emptyCollectForm);
    } catch (e) {
      console.error("markCollected:", e);
      setCollectErr(e?.message || "Couldn't mark as collected — check connection");
    }
  };

  return (
    <div style={{ padding: 16, flex: 1, overflowY: "auto" }}>
      <div style={{ marginBottom: 14 }}><SL t="Storage" /></div>

      {!loaded && <div style={{ fontSize: 10, color: MUT }}>Loading…</div>}

      {loaded && rows.length === 0 && (
        <Empty icon="📦" t="Nothing in storage" sub="Move a machine to Storage from the Garage tab to start tracking it here." />
      )}

      {rows.map(row => {
        const { m, storageStatus, labourOwed, partsOwed, storageOwed, totalOwed, value, exceeds } = row;
        return (
          <div key={m.id} style={{ background: SURF, border: "1px solid " + (exceeds ? RED + "55" : BRD), borderRadius: 3, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: "1 1 160px" }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{mIcon(m.type)}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                  <div style={{ fontSize: 9, color: MUT }}>
                    {row.b.storage_tier} tier · {storageStatus.daysIn}d in storage
                    {storageStatus.escalated && <span style={{ color: RED, fontWeight: 700, marginLeft: 6 }}>⚠ FOR SALE</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", marginLeft: "auto" }}>
                <button style={{ ...btnG, ...sm }} onClick={() => doCollect(row, false)} title="Move back to Garage">← Garage</button>
                <button style={{ ...btnA, ...sm }} onClick={() => doCollect(row, true)} title="Move straight onto the Bench">🔧 Bench</button>
                <button style={{ ...btnG, ...sm, color: ACC, borderColor: ACC + "55" }} onClick={() => { setCollectFormRow(row.b.id); setCollectForm(emptyCollectForm); setCollectErr(""); }} title="Customer has taken the machine">📦 Collected</button>
              </div>
            </div>

            {collectFormRow === row.b.id && (
              <div style={{ background: "#0a0a0a", border: "1px solid " + BRD, borderRadius: 2, padding: "10px 12px", marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Who's picking it up?</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                  <input placeholder="Customer name" value={collectForm.name} disabled={collectForm.unknown}
                    onChange={e => setCollectForm(f => ({ ...f, name: e.target.value }))}
                    style={{ ...inp, fontSize: 12, padding: "8px 10px", opacity: collectForm.unknown ? 0.4 : 1 }} />
                  <input placeholder="Customer phone" value={collectForm.phone} disabled={collectForm.unknown}
                    onChange={e => setCollectForm(f => ({ ...f, phone: e.target.value }))}
                    style={{ ...inp, fontSize: 12, padding: "8px 10px", opacity: collectForm.unknown ? 0.4 : 1 }} />
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <input type="checkbox" checked={collectForm.unknown}
                      onChange={e => setCollectForm(f => ({ ...f, unknown: e.target.checked, name: "", phone: "" }))}
                      style={{ width: 16, height: 16, accentColor: ACC, cursor: "pointer", flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: MUT }}>Unknown — not sure who picked it up</span>
                  </label>
                </div>
                {collectErr && <div style={{ fontSize: 9, color: RED, marginBottom: 10 }}>{collectErr}</div>}
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={{ ...btnG, ...sm }} onClick={() => { setCollectFormRow(null); setCollectForm(emptyCollectForm); setCollectErr(""); }}>Cancel</button>
                  <button style={{ ...btnA, ...sm }} onClick={() => doMarkCollected(row)}>✓ Confirm Collected</button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 10, color: MUT, marginBottom: exceeds ? 8 : 0 }}>
              <span>Labour <span style={{ color: TXT, fontFamily: "'IBM Plex Mono',monospace" }}>{fmt$(labourOwed)}</span></span>
              <span>Parts <span style={{ color: TXT, fontFamily: "'IBM Plex Mono',monospace" }}>{fmt$(partsOwed)}</span></span>
              <span>Storage <span style={{ color: TXT, fontFamily: "'IBM Plex Mono',monospace" }}>{fmt$(storageOwed)}</span></span>
              <span style={{ marginLeft: "auto", fontWeight: 700 }}>Total Owed <span style={{ color: exceeds ? RED : GRN, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{fmt$(totalOwed)}</span></span>
              {value != null && <span>Value <span style={{ color: TXT, fontFamily: "'IBM Plex Mono',monospace" }}>{fmt$(value)}</span></span>}
            </div>

            {exceeds && (
              <div style={{ fontSize: 10, fontWeight: 700, color: RED, background: RED + "18", border: "1px solid " + RED + "44", borderRadius: 2, padding: "6px 10px", letterSpacing: "0.04em" }}>
                ⚠ Owed exceeds this machine's estimated value by {fmt$(totalOwed - value)}
              </div>
            )}
            {value == null && (
              <div style={{ fontSize: 9, color: "#555", fontStyle: "italic" }}>Set an Estimated Value on this machine (Edit Machine) to see an owed-vs-value check.</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StorageTab;
