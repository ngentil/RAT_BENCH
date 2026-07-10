import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, SURF, TXT } from '../../lib/styles';
import { getMyThreads } from '../../lib/marketplace';

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  return Math.floor(s / 86400) + "d";
}

function MarketplaceInbox({ profile, onOpenThread, refreshKey }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMyThreads(profile.id).then(data => {
      if (!cancelled) { setThreads(data); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [profile.id, refreshKey]);

  if (loading) return <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "24px 0" }}>Loading…</div>;

  if (threads.length === 0) {
    return (
      <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "32px 0" }}>
        <div style={{ fontSize: 22, marginBottom: 10 }}>💬</div>
        No conversations yet.
      </div>
    );
  }

  return (
    <div>
      {threads.map(t => {
        const unread = t.lastMessage && t.lastMessage.sender_id !== profile.id && !t.lastMessage.read_at;
        const otherName = t.otherParty?.username || t.otherParty?.display_name || "User";
        return (
          <div key={t.id} onClick={() => onOpenThread(t.id)} style={{ background: SURF, border: "1px solid " + BRD, borderLeft: "3px solid " + (unread ? ACC : BRD), padding: "10px 12px", borderRadius: 2, cursor: "pointer", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{otherName}</span>
              {t.lastMessage && <span style={{ fontSize: 8, color: MUT }}>{timeAgo(t.lastMessage.created_at)}</span>}
            </div>
            <div style={{ fontSize: 9, color: ACC, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.listing?.title || "Listing removed"}</div>
            <div style={{ fontSize: 10, color: unread ? TXT : MUT, fontWeight: unread ? 700 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {t.lastMessage ? t.lastMessage.body : "No messages yet"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MarketplaceInbox;
