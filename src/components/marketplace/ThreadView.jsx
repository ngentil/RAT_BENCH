import React, { useState, useEffect, useRef } from 'react';
import { ACC, MUT, BRD, SURF, TXT, RED, btnA, btnG, inp } from '../../lib/styles';
import {
  getThreadById, getThreadMessages, sendMessage, markThreadRead, subscribeToThread,
} from '../../lib/marketplace';

// Dedupe-by-id + re-sort by created_at — a realtime INSERT event can arrive
// out of order relative to another in-flight message (two rapid sends whose
// network round trips overlap), so appending naively can leave the on-screen
// order wrong until the component remounts and re-fetches.
const mergeMessages = (prev, incoming) => {
  const byId = new Map(prev.map(m => [m.id, m]));
  incoming.forEach(m => byId.set(m.id, m));
  return [...byId.values()].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
};

// Safety-net poll — Realtime is best-effort, not guaranteed delivery, and a
// fully blocked websocket (corporate firewall, etc.) never reaches
// 'SUBSCRIBED' at all, so a reconnect-triggered refetch alone can't cover
// that case. This just re-fetches on a slow interval regardless of channel
// status, so a stuck connection degrades to "up to 15s of lag" instead of
// "missing messages forever."
const POLL_MS = 15000;

function ThreadView({ threadId, profile, onBack, onListingSelect }) {
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const refetch = () => getThreadMessages(threadId).then(data => {
      if (!cancelled) setMessages(prev => mergeMessages(prev, data));
    }).catch(() => {});

    getThreadById(threadId, profile.id).then(t => { if (!cancelled) setThread(t); });
    refetch();
    markThreadRead(threadId, profile.id).catch(() => {});

    const unsubscribe = subscribeToThread(
      threadId,
      (msg) => {
        setMessages(prev => mergeMessages(prev, [msg]));
        if (msg.sender_id !== profile.id) markThreadRead(threadId, profile.id).catch(() => {});
      },
      // Re-fetch on every (re)subscribe — closes both the initial fetch/
      // subscribe race window and any gap left by a dropped-then-restored
      // websocket, since Realtime doesn't replay missed events on its own.
      (status) => { if (status === 'SUBSCRIBED') refetch(); },
    );

    const pollId = setInterval(refetch, POLL_MS);

    return () => { cancelled = true; unsubscribe(); clearInterval(pollId); };
  }, [threadId, profile.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  const submit = async () => {
    const text = body.trim();
    if (!text) return;
    setSending(true);
    setSendError(null);
    try {
      const msg = await sendMessage(threadId, profile.id, text);
      setMessages(prev => mergeMessages(prev, [msg]));
      setBody("");
    } catch (e) {
      // Keep the drafted text in place (nothing lost) and surface the
      // failure — previously this rejected silently, so a send could fail
      // with no indication beyond the button quietly re-enabling.
      setSendError(e.message || 'Message failed to send — try again.');
    } finally {
      setSending(false);
    }
  };

  if (!thread) return <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "24px 0" }}>Loading…</div>;

  const otherName = thread.otherParty?.username || thread.otherParty?.display_name || "User";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "70vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <button onClick={onBack} style={btnG}>← Back</button>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: TXT }}>{otherName}</div>
          {thread.listing && (
            <div onClick={() => onListingSelect(thread.listing.id)} style={{ fontSize: 9, color: ACC, cursor: "pointer" }}>{thread.listing.title}</div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", border: "1px solid " + BRD, borderRadius: 2, padding: 10, marginBottom: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        {messages.length === 0 && <div style={{ fontSize: 10, color: MUT, textAlign: "center", marginTop: 20 }}>Say hello 👋</div>}
        {messages.map(m => {
          const mine = m.sender_id === profile.id;
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "80%", background: mine ? ACC : SURF, color: mine ? "#fff" : TXT, border: mine ? "none" : "1px solid " + BRD, borderRadius: 2, padding: "6px 10px", fontSize: 11, lineHeight: 1.5, wordBreak: "break-word" }}>
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {sendError && <div style={{ fontSize: 9, color: RED, marginBottom: 6 }}>⚠ {sendError}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={body}
          onChange={e => { setBody(e.target.value); if (sendError) setSendError(null); }}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder="Write a message…"
          maxLength={2000}
          style={{ ...inp, flex: 1 }}
        />
        <button disabled={sending || !body.trim()} onClick={submit} style={btnA}>Send</button>
      </div>
    </div>
  );
}

export default ThreadView;
