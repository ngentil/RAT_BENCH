import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, SURF, TXT, BG, btnG, sm } from '../../lib/styles';
import { getWikiLeaderboard } from '../../lib/wiki';
import { WikiHeader } from './WikiEntryPage';

const MEDAL = ['🥇', '🥈', '🥉'];

function WikiLeaderboard({ embedded = false, onBack, onlineCount, onNavigate }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getWikiLeaderboard(20).then(r => { if (alive) { setRows(r); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const body = (
    <div style={embedded ? { padding: "4px 0" } : { maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>
      {embedded && <button onClick={onBack} style={{ ...btnG, ...sm, fontSize: 9, marginBottom: 12 }}>← Wiki</button>}
      <div style={{ fontSize: 9, color: ACC, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Top Contributors</div>
      {loading && <div style={{ fontSize: 10, color: MUT }}>Loading…</div>}
      {!loading && rows.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "32px 0" }}>
          No opted-in contributors yet. Push a machine or fix a spec to be first.
        </div>
      )}
      {rows.map((r, i) => (
        <div key={r.user_id} style={{ display: "flex", alignItems: "center", gap: 10, background: SURF, border: "1px solid " + BRD, borderRadius: 2, padding: "10px 14px", marginBottom: 6 }}>
          <div style={{ width: 26, fontSize: 14, textAlign: "center", flexShrink: 0 }}>{MEDAL[i] || (i + 1)}</div>
          <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: TXT, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {r.display_name || r.username || "Anonymous"}
          </div>
          <div style={{ fontSize: 13, color: ACC, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace" }}>{r.points}</div>
        </div>
      ))}
      <div style={{ fontSize: 8, color: MUT, marginTop: 14, lineHeight: 1.6 }}>
        Opt-in only — shown for contributors who've chosen to appear here in Settings → Profile.
      </div>
    </div>
  );

  if (embedded) return body;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TXT, fontFamily: "'IBM Plex Mono',monospace" }}>
      <WikiHeader title="Top Contributors" subtitle="Rat Bench Wiki" backHref="/" backLabel="← Wiki" onlineCount={onlineCount} onNavigate={onNavigate} />
      {body}
    </div>
  );
}

export default WikiLeaderboard;
