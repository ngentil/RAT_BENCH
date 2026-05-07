import React, { useMemo, useState } from 'react';
import { ACC, MUT, BRD, TXT, GRN, RED, SURF, inp, btnG, sm } from '../../lib/styles';
import { SL } from '../ui/shared';
import { mIcon } from '../../lib/helpers';

const PART_STATUS = {
  needed:  { label: "Needed",  color: "#e8870a" },
  ordered: { label: "Ordered", color: "#4a9eff" },
  fitted:  { label: "Fitted",  color: "#3d9e50" },
};

export default function PartsTab({ machines }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const allParts = useMemo(() =>
    machines.flatMap(m =>
      (m.parts || []).map(p => ({ ...p, machineName: m.name, machineType: m.type, machineId: m.id }))
    ).sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0)),
  [machines]);

  const filtered = useMemo(() => {
    let list = allParts;
    if (filter !== "all") list = list.filter(p => (p.status || "needed") === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q) ||
        (p.partNumber || "").toLowerCase().includes(q) ||
        p.machineName.toLowerCase().includes(q) ||
        (p.supplier || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [allParts, filter, search]);

  const counts = useMemo(() => {
    const c = { needed: 0, ordered: 0, fitted: 0 };
    allParts.forEach(p => { c[p.status || "needed"] = (c[p.status || "needed"] || 0) + 1; });
    return c;
  }, [allParts]);

  const totalValue = filtered.reduce((s, p) => s + (parseFloat(p.unitCost) || 0) * (parseInt(p.qty) || 1), 0);

  return (
    <div style={{ padding: 16, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <SL t="Parts" />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {counts.needed > 0 && (
            <span style={{ fontSize: 8, color: "#e8870a", border: "1px solid #e8870a55", background: "#e8870a11", padding: "2px 6px", borderRadius: 2, fontWeight: 700, letterSpacing: "0.1em" }}>
              {counts.needed} NEEDED
            </span>
          )}
          {counts.ordered > 0 && (
            <span style={{ fontSize: 8, color: "#4a9eff", border: "1px solid #4a9eff55", background: "#4a9eff11", padding: "2px 6px", borderRadius: 2, fontWeight: 700, letterSpacing: "0.1em" }}>
              {counts.ordered} ORDERED
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {[["all","All"], ["needed","Needed"], ["ordered","Ordered"], ["fitted","Fitted"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ ...btnG, ...sm, ...(filter === v ? { color: ACC, border: "1px solid " + ACC } : {}) }}>
            {l}{v !== "all" && counts[v] > 0 ? ` (${counts[v]})` : ""}
          </button>
        ))}
      </div>

      {allParts.length > 5 && (
        <input
          style={{ ...inp, marginBottom: 12, fontSize: 11 }}
          placeholder="Search parts, machines, suppliers…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      )}

      {allParts.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, lineHeight: 1.7, padding: "32px 0", textAlign: "center" }}>
          <div style={{ fontSize: 22, marginBottom: 10 }}>🔩</div>
          No parts tracked yet.<br />
          Add parts to machines on the Jobs tab.
        </div>
      )}

      {totalValue > 0 && (
        <div style={{ fontSize: 9, color: MUT, marginBottom: 10 }}>
          Showing {filtered.length} part{filtered.length !== 1 ? "s" : ""}
          {totalValue > 0 && <span style={{ color: GRN }}> · ${totalValue.toFixed(2)} total value</span>}
        </div>
      )}

      {filtered.map((p, i) => {
        const st = PART_STATUS[p.status || "needed"];
        const cost = (parseFloat(p.unitCost) || 0) * (parseInt(p.qty) || 1);
        return (
          <div key={p.id || i} style={{ background: SURF, border: "1px solid " + BRD, borderRadius: 2, padding: "10px 12px", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{p.name}</span>
                  {p.partNumber && <span style={{ fontSize: 8, color: MUT }}>{p.partNumber}</span>}
                </div>
                <div style={{ fontSize: 9, color: MUT, marginBottom: 4 }}>
                  {[p.brand, p.supplier, (parseInt(p.qty) || 1) > 1 ? `×${p.qty}` : null].filter(Boolean).join(" · ")}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12 }}>{mIcon(p.machineType)}</span>
                  <span style={{ fontSize: 9, color: MUT }}>{p.machineName}</span>
                </div>
                {p.notes && <div style={{ fontSize: 9, color: MUT, marginTop: 4, lineHeight: 1.5 }}>{p.notes}</div>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                <span style={{
                  fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  color: st.color, border: "1px solid " + st.color + "55", background: st.color + "11",
                  padding: "2px 6px", borderRadius: 2,
                }}>
                  {st.label}
                </span>
                {cost > 0 && <span style={{ fontSize: 11, color: GRN, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>${cost.toFixed(2)}</span>}
              </div>
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && allParts.length > 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "24px 0" }}>
          No parts match this filter.
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 9, color: MUT, lineHeight: 1.7 }}>
        Add and manage parts per machine on the Jobs tab. Parts with a cost are included in invoice exports.
      </div>
    </div>
  );
}
