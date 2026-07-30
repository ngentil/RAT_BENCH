import React, { useState, useEffect, useMemo } from 'react';
import { MUT, BRD, SURF, TXT, GRN, ACC, btnA, btnG, sm } from '../../lib/styles';
import { SL, Empty } from '../ui/shared';
import { upsertMachine } from '../../lib/db';
import { getAllActiveCollections, returnMachine } from '../../lib/db/collections';
import { mIcon } from '../../lib/helpers';
import { toastError } from '../../lib/toast';
import MoveToStoragePanel from '../machine/MoveToStoragePanel';

function CollectedTab({ machines, setMachines, profile, active }) {
  const [collections, setCollections] = useState([]);
  const [loaded, setLoaded]           = useState(false);

  // Same reasoning as StorageTab: stays mounted (display:none) for the whole
  // session, so refetch on every activation rather than once on mount.
  useEffect(() => {
    if (!active) return;
    let alive = true;
    getAllActiveCollections().then(rows => { if (alive) { setCollections(rows); setLoaded(true); } });
    return () => { alive = false; };
  }, [active]);

  const rows = useMemo(() => (
    collections.map(c => {
      const m = machines.find(x => x.id === c.machine_id);
      if (!m) return null;
      return { m, c };
    }).filter(Boolean).sort((a, b) => new Date(b.c.collected_at) - new Date(a.c.collected_at))
  ), [collections, machines]);

  // toBench sends it straight onto the Bench instead of parking it back in
  // Garage — same "not final" pattern as Storage's own exit choice.
  const doReturn = async (row, toBench) => {
    try {
      await returnMachine(row.c.id);
      if (toBench) {
        const u = { ...row.m, onBench: true };
        await upsertMachine(u);
        setMachines(prev => prev.map(x => x.id === u.id ? u : x));
      }
      setCollections(prev => prev.filter(c => c.id !== row.c.id));
    } catch (e) {
      console.error("returnMachine:", e);
      toastError("Couldn't bring the machine back — check connection");
    }
  };

  // MoveToStoragePanel only knows how to create a new booking — closing out
  // the Collected record it's leaving is this tab's own extra step, fired
  // only once the new booking is confirmed to exist (mirrors doMarkCollected
  // in StorageTab: don't touch the record you're leaving until the new one
  // is safely created, so a failure here doesn't orphan the machine).
  const closeCollectionAfter = (row) => async () => {
    try {
      await returnMachine(row.c.id);
      setCollections(prev => prev.filter(c => c.id !== row.c.id));
    } catch (e) {
      console.error("returnMachine (post-rebooking):", e);
      toastError("Moved to Storage, but couldn't clear the Collected record — check connection");
    }
  };

  return (
    <div style={{ padding: 16, flex: 1, overflowY: "auto" }}>
      <div style={{ marginBottom: 14 }}><SL t="Collected" /></div>

      {!loaded && <div style={{ fontSize: 10, color: MUT }}>Loading…</div>}

      {loaded && rows.length === 0 && (
        <Empty icon="🚚" t="Nothing collected" sub="Mark a machine Collected from the Storage tab to track it here." />
      )}

      {rows.map(row => {
        const { m, c } = row;
        return (
          <div key={m.id} style={{ background: SURF, border: "1px solid " + BRD, borderRadius: 3, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: "1 1 160px" }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{mIcon(m.type)}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                  <div style={{ fontSize: 9, color: MUT }}>Collected {new Date(c.collected_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  <div style={{ fontSize: 10, marginTop: 3 }}>
                    {c.customer_unknown
                      ? <span style={{ fontStyle: "italic", color: "#666" }}>Unknown customer</span>
                      : (c.customer_name || c.customer_phone)
                        ? <span style={{ color: GRN }}>{[c.customer_name, c.customer_phone].filter(Boolean).join(' · ')}</span>
                        : <span style={{ fontStyle: "italic", color: "#666" }}>No contact info given</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", marginLeft: "auto" }}>
                <button style={{ ...btnG, ...sm }} onClick={() => doReturn(row, false)} title="Back to Garage">← Garage</button>
                <button style={{ ...btnA, ...sm }} onClick={() => doReturn(row, true)} title="Straight to the Bench">🔧 Bench</button>
              </div>
            </div>

            {!!profile?.storage_policy_enabled && (
              <>
                <div style={{ borderLeft: "2px solid " + ACC, paddingLeft: 8, marginBottom: 8, fontSize: 9, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Or back into storage
                </div>
                <MoveToStoragePanel
                  machine={m}
                  profile={profile}
                  onUpdate={u => setMachines(prev => prev.map(x => x.id === u.id ? u : x))}
                  onBooked={closeCollectionAfter(row)}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default CollectedTab;
