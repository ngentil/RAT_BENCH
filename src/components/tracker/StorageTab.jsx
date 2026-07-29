import React, { useState, useEffect, useMemo } from 'react';
import { MUT, BRD, SURF, TXT, GRN, RED, btnA, sm } from '../../lib/styles';
import { SL, Empty } from '../ui/shared';
import { getAllActiveBookings, collectMachine } from '../../lib/db/bookings';
import { getTiers } from '../../lib/storageTiers';
import { getStorageStatus, mIcon } from '../../lib/helpers';
import { toastError } from '../../lib/toast';

const qtyOf = p => (p.qty == null || p.qty === '') ? 1 : (Number(p.qty) || 0);
const fmt$  = n => `$${(n || 0).toFixed(2)}`;

function StorageTab({ machines, profile, company, active }) {
  const [bookings, setBookings] = useState([]);
  const [loaded, setLoaded]     = useState(false);

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

  const doCollect = async (row) => {
    try {
      await collectMachine(row.b.id);
      setBookings(prev => prev.filter(b => b.id !== row.b.id));
    } catch (e) {
      console.error("collectMachine:", e);
      toastError("Couldn't mark as collected — check connection");
    }
  };

  return (
    <div style={{ padding: 16, flex: 1, overflowY: "auto" }}>
      <div style={{ marginBottom: 14 }}><SL t="Storage" /></div>

      {!loaded && <div style={{ fontSize: 10, color: MUT }}>Loading…</div>}

      {loaded && rows.length === 0 && (
        <Empty icon="📦" t="Nothing in storage" sub="Book a machine in from the Garage tab to start tracking it here." />
      )}

      {rows.map(row => {
        const { m, storageStatus, labourOwed, partsOwed, storageOwed, totalOwed, value, exceeds } = row;
        return (
          <div key={m.id} style={{ background: SURF, border: "1px solid " + (exceeds ? RED + "55" : BRD), borderRadius: 3, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{mIcon(m.type)}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                  <div style={{ fontSize: 9, color: MUT }}>
                    {row.b.storage_tier} tier · {storageStatus.daysIn}d in storage
                    {storageStatus.escalated && <span style={{ color: RED, fontWeight: 700, marginLeft: 6 }}>⚠ FOR SALE</span>}
                  </div>
                </div>
              </div>
              <button style={{ ...btnA, ...sm, flexShrink: 0 }} onClick={() => doCollect(row)}>✓ Collected</button>
            </div>

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
