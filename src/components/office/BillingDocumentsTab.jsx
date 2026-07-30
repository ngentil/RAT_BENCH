import React, { useState, useEffect, useMemo } from 'react';
import { MUT, BRD, SURF, TXT, GRN, ACC } from '../../lib/styles';
import { SL, Empty } from '../ui/shared';
import { getAllDocuments } from '../../lib/db/billingDocuments';
import { fmtMoney } from '../../lib/helpers';

// Shared by the Office → Quotes and Office → Invoices tabs, parameterized by
// docType — one list UI instead of duplicating it twice for what's otherwise
// the same view over billing_documents.
function BillingDocumentsTab({ docType, machines, clients, active }) {
  const [docs, setDocs]   = useState([]);
  const [loaded, setLoaded] = useState(false);
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

  return (
    <div style={{ padding: 16, flex: 1, overflowY: "auto" }}>
      <div style={{ marginBottom: 14 }}><SL t={label} /></div>

      {!loaded && <div style={{ fontSize: 10, color: MUT }}>Loading…</div>}

      {loaded && rows.length === 0 && (
        <Empty icon="🧾" t={`No ${label.toLowerCase()} yet`} sub={`Generate a ${docType} from a machine's Bench card to see it logged here.`} />
      )}

      {rows.map(({ d, machineName, clientName }) => (
        <div key={d.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap", background: SURF, border: "1px solid " + BRD, borderRadius: 3, padding: "12px 14px", marginBottom: 8 }}>
          <div style={{ minWidth: 0, flex: "1 1 200px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: ACC }}>{d.doc_ref}</div>
            <div style={{ fontSize: 11, color: TXT, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{machineName}</div>
            <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
              {clientName ? clientName + ' · ' : ''}
              {new Date(d.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
              {d.updated_at && d.updated_at !== d.created_at ? ` · updated ${new Date(d.updated_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
            </div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: GRN, flexShrink: 0 }}>{d.total != null ? fmtMoney(d.total) : '—'}</div>
        </div>
      ))}
    </div>
  );
}

export default BillingDocumentsTab;
