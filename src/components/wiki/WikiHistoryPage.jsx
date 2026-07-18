import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, SURF, TXT, GRN, RED, BG, btnG, btnA, sm } from '../../lib/styles';
import { getWikiEntryBySlug, getWikiRevisions, revertToRevision, WIKI_FIELD_LABELS, getVerificationsForRevisions, submitWikiVerification } from '../../lib/wiki';
import { WikiHeader } from './WikiEntryPage';
import { navClick } from '../../lib/helpers';

function WikiHistoryPage({ slug, profile, onlineCount, onNavigate }) {
  const [revs, setRevs] = useState([]);
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reverting, setReverting] = useState(null); // rev id being reverted
  const [revertErr, setRevertErr] = useState("");
  const [revertOk, setRevertOk] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [verifications, setVerifications] = useState({}); // { [revisionId]: rows[] }
  const [votingOn, setVotingOn] = useState(null); // rev id currently submitting a vote
  const [voteErr, setVoteErr] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true); setNotFound(false);
    (async () => {
      const e = await getWikiEntryBySlug(slug);
      if (!alive) return;
      if (e) {
        setEntry(e);
        const r = await getWikiRevisions(e.id);
        if (!alive) return;
        setRevs(r);
        getVerificationsForRevisions(r.map(x => x.id)).then(v => { if (alive) setVerifications(v); });
      } else {
        setNotFound(true);
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [slug]);

  const vote = async (rev, choice) => {
    if (!profile) return;
    setVotingOn(rev.id); setVoteErr("");
    try {
      await submitWikiVerification(rev.id, choice);
      const updated = await getVerificationsForRevisions(revs.map(x => x.id));
      setVerifications(updated);
    } catch (e) {
      setVoteErr(e.message);
    }
    setVotingOn(null);
  };

  const doRevert = async (rev) => {
    if (!profile) return;
    const author = rev.edited_by === null && rev.username ? `${rev.username} (retired)` : rev.username || "unknown";
    if (!confirm(`Revert to revision from ${new Date(rev.created_at).toLocaleDateString()} by ${author}?`)) return;
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

  if (notFound) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <div style={{ fontSize: 11, color: MUT, fontFamily: "'IBM Plex Mono',monospace" }}>Entry not found.</div>
      <a href="/" onClick={navClick(onNavigate, "/")} style={{ fontSize: 10, color: ACC, fontFamily: "'IBM Plex Mono',monospace" }}>← Back to wiki</a>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TXT, fontFamily: "'IBM Plex Mono',monospace" }}>
      <WikiHeader
        title={entry ? `${entry.make} ${entry.model}` : "History"}
        subtitle="Revision History"
        backHref={"/" + slug}
        backLabel="← Entry"
        onlineCount={onlineCount}
        onNavigate={onNavigate}
      />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>
        {revertOk && <div style={{ fontSize: 10, color: GRN, marginBottom: 12, padding: "8px 12px", background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: 2 }}>{revertOk}</div>}
        {revertErr && <div style={{ fontSize: 10, color: RED, marginBottom: 12 }}>{revertErr}</div>}
        {voteErr && <div style={{ fontSize: 10, color: RED, marginBottom: 12 }}>{voteErr}</div>}

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
                  <div style={{ fontSize: 9, color: r.edited_by === null ? "#555" : MUT }}>
                    {r.username || "unknown"}
                    {r.edited_by === null && r.username && " · user retired"}
                  </div>
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
              {(() => {
                const votes = verifications[r.id] || [];
                const confirms = votes.filter(v => v.vote === 'confirm').length;
                const disputes = votes.filter(v => v.vote === 'dispute').length;
                const myVote = profile && votes.find(v => v.verifier_id === profile.id)?.vote;
                const isOwn = profile && r.edited_by === profile.id;
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, paddingTop: 8, borderTop: "1px solid " + BRD, flexWrap: "wrap" }}>
                    {disputes >= 3 && (
                      <span style={{ fontSize: 8, color: RED, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, border: "1px solid " + RED + "55", padding: "2px 6px", borderRadius: 2 }}>⚠ Disputed</span>
                    )}
                    <span style={{ fontSize: 9, color: GRN }}>✓ {confirms}</span>
                    <span style={{ fontSize: 9, color: RED }}>✕ {disputes}</span>
                    {profile && !isOwn && (
                      <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                        <button onClick={() => vote(r, 'confirm')} disabled={votingOn === r.id} style={{ ...btnG, ...sm, fontSize: 8, color: myVote === 'confirm' ? GRN : undefined, opacity: votingOn === r.id ? 0.5 : 1 }}>
                          {myVote === 'confirm' ? '✓ Confirmed' : 'Confirm'}
                        </button>
                        <button onClick={() => vote(r, 'dispute')} disabled={votingOn === r.id} style={{ ...btnG, ...sm, fontSize: 8, color: myVote === 'dispute' ? RED : undefined, opacity: votingOn === r.id ? 0.5 : 1 }}>
                          {myVote === 'dispute' ? '✕ Disputed' : 'Dispute'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WikiHistoryPage;
