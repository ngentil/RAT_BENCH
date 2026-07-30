import React, { useState, useEffect, useMemo } from 'react';
import { MUT, BRD, SURF, TXT, GRN, ACC, btnG, sm } from '../../lib/styles';
import { SL, Empty } from '../ui/shared';
import { getAllDocuments } from '../../lib/db/billingDocuments';
import { regenerateDocument } from '../../lib/invoicePdf';
import { fmtMoney } from '../../lib/helpers';

const fmtDate = iso => new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

// Shared by the Office → Quotes and Office → Invoices tabs, parameterized by
// docType — one list UI instead of duplicating it twice for what's otherwise
// the same view over billing_documents.
function BillingDocumentsTab({ docType, machines, clients, company, active }) {
  const [docs, setDocs]   = useState([]);
  const [loaded, setLoaded] = useState(false);
  // Per-document choice of which version "Regenerate" reproduces — null (the
  // default) means the document's current state; otherwise an index into
  // its own `revisions` array (a prior state, from before some later merge).
  const [selected, setSelected] = useState({});
  const label = docType === 'quote' ? 'Quotes' : 'Invoices';

  // Same reasoning as Storage/Collected: this tab stays mounted (display:none)
  // for the whole session, so refetch on every activation, not just once.
  useEffect(() => {
    if (!active) return;
    let alive = true;
    getAllDocuments(docType).then(rows => { if (alive) { setDocs(rows); setLoaded(true); } });
    return () => { alive = false; };
  }, [active, docType]);

  const rows = useMemo(() => (
    docs.map(d => ({
      d,
      machineName: machines.find(m => m.id === d.machine_id)?.name || d.snapshot?.machineName || 'Deleted machine',
      clientName: clients.find(c => c.id === d.client_id)?.name || d.snapshot?.clientName || null,
    }))
  ), [docs, machines, clients]);

  const doRegenerate = (d) => {
    const raw = selected[d.id];
    regenerateDocument(d, company, raw != null && raw !== '' ? Number(raw) : null);
  };

  return (
    <div style={{ padding: 16, flex: 1, overflowY: "auto" }}>
      <div style={{ marginBottom: 14 }}><SL t={label} /></div>

      {!loaded && <div style={{ fontSize: 10, color: MUT }}>Loading…</div>}

      {loaded && rows.length === 0 && (
        <Empty icon="🧾" t={`No ${label.toLowerCase()} yet`} sub={`Generate a ${docType} from a machine's Bench card to see it logged here.`} />
      )}

      {rows.map(({ d, machineName, clientName }) => {
        const revisions = d.revisions || [];
        return (
          <div key={d.id} style={{ background: SURF, border: "1px solid " + BRD, borderRadius: 3, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ minWidth: 0, flex: "1 1 200px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: ACC }}>{d.doc_ref}</div>
                <div style={{ fontSize: 11, color: TXT, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{machineName}</div>
                <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
                  {clientName ? clientName + ' · ' : ''}
                  {fmtDate(d.created_at)}
                  {d.updated_at && d.updated_at !== d.created_at ? ` · updated ${fmtDate(d.updated_at)}` : ''}
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: GRN, flexShrink: 0 }}>{d.total != null ? fmtMoney(d.total) : '—'}</div>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: "1px solid " + BRD }}>
              {revisions.length > 0 && (
                <select
                  value={selected[d.id] ?? ''}
                  onChange={e => setSelected(prev => ({ ...prev, [d.id]: e.target.value }))}
                  style={{ background: "#0a0a0a", border: "1px solid " + BRD, color: TXT, fontSize: 9, padding: "6px 8px", borderRadius: 2, fontFamily: "'IBM Plex Mono',monospace" }}
                >
                  <option value="">Current ({fmtDate(d.updated_at || d.created_at)})</option>
                  {revisions.map((r, i) => (
                    <option key={i} value={i}>Version {i + 1} — superseded {fmtDate(r.archived_at)}</option>
                  ))}
                </select>
              )}
              <button onClick={() => doRegenerate(d)} style={{ ...btnG, ...sm, fontSize: 9 }}>↻ Regenerate PDF</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BillingDocumentsTab;
