import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, SURF, TXT, GRN, RED, BG, btnG, btnA, sm } from '../../lib/styles';
import { getWikiEntryBySlug, getWikiRevisions, revertToRevision, WIKI_FIELD_LABELS } from '../../lib/wiki';
import { WikiHeader } from './WikiEntryPage';

function WikiHistoryPage({ slug, profile }) {
  const [revs, setRevs] = useState([]);
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reverting, setReverting] = useState(null); // rev id being reverted
  const [revertErr, setRevertErr] = useState("");
  const [revertOk, setRevertOk] = useState("");

  useEffect(() => {
    (async () => {
      const e = await getWikiEntryBySlug(slug);
      if (e) {
        setEntry(e);
        const r = await getWikiRevisions(e.id);
        setRevs(r);
      }
      setLoading(false);
    })();
  }, [slug]);

  const doRevert = async (rev) => {
    if (!profile) return;
    if (!confirm(`Revert to revision from ${new Date(rev.created_at).toLocaleDateString()} by ${rev.username || "unknown"}?`)) return;
    setReverting(rev.id); setRevertErr(""); setRevertOk("");
    try {
      const newRev = await revertToRevision(entry.id, rev, profile);
      // Re-fetch revisions so new revert appears at top
      const updated = await getWikiRevisions(entry.id);
      setRevs(updated);
      setEntry(e => ({ ...e, current_rev_id: newRev.id }));
      setRevertOk("Reverted successfully.");
    } catch (e) {
      setRevertErr(e.message);
    }
    setReverting(null);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 10, color: MUT, fontFamily: "'IBM Plex Mono',monospace" }}>Loading…</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TXT, fontFamily: "'IBM Plex Mono',monospace" }}>
      <WikiHeader
        title={entry ? `${entry.make} ${entry.model}` : "History"}
        subtitle="Revision History"
        backHref={"/" + slug}
        backLabel="← Entry"
      />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>
        {revertOk && <div style={{ fontSize: 10, color: GRN, marginBottom: 12, padding: "8px 12px", background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: 2 }}>{revertOk}</div>}
        {revertErr && <div style={{ fontSize: 10, color: RED, marginBottom: 12 }}>{revertErr}</div>}

        {revs.length === 0 && <div style={{ fontSize: 10, color: MUT, textAlign: "center", marginTop: 40 }}>No revisions yet.</div>}
        {revs.map((r, i) => {
          const isCurrent = r.id === entry?.current_rev_id || i === 0;
          const fieldLabel = r.field_key ? (WIKI_FIELD_LABELS[r.field_key] || r.field_key) : null;
          return (
            <div key={r.id} style={{ background: SURF, border: "1px solid " + (isCurrent ? ACC + "44" : BRD), padding: "12px 16px", borderRadius: 2, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: TXT, marginBottom: 3 }}>{r.edit_summary || "No summary"}</div>
                  {fieldLabel && (
                    <div style={{ fontSize: 9, color: MUT, marginBottom: 4, fontFamily: "'IBM Plex Mono',monospace" }}>
                      <span style={{ color: ACC }}>{fieldLabel}</span>
                      {r.old_value != null && r.old_value !== "" && (
                        <> &nbsp;<span style={{ color: RED, textDecoration: "line-through" }}>{r.old_value}</span></>
                      )}
                      {r.new_value != null && r.new_value !== "" && (
                        <> → <span style={{ color: GRN }}>{r.new_value}</span></>
                      )}
                    </div>
                  )}
                  <div style={{ fontSize: 9, color: MUT }}>{r.username || "unknown"}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  {isCurrent && <div style={{ fontSize: 8, color: ACC, letterSpacing: "0.08em", textTransform: "uppercase" }}>Current</div>}
                  <div style={{ fontSize: 9, color: MUT }}>{new Date(r.created_at).toLocaleDateString()}</div>
                  <div style={{ fontSize: 9, color: MUT }}>{new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  {profile && !isCurrent && (
                    <button
                      onClick={() => doRevert(r)}
                      disabled={reverting === r.id}
                      style={{ ...btnG, ...sm, fontSize: 8, marginTop: 2, opacity: reverting === r.id ? 0.5 : 1 }}
                    >
                      {reverting === r.id ? "Reverting…" : "Revert"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WikiHistoryPage;
