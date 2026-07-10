import React, { useState, useEffect, useRef } from 'react';
import { ACC, MUT, BRD, SURF, TXT, btnA, btnG, inp } from '../../lib/styles';
import {
  getThreadById, getThreadMessages, sendMessage, markThreadRead, subscribeToThread,
} from '../../lib/marketplace';

function ThreadView({ threadId, profile, onBack, onListingSelect }) {
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getThreadById(threadId, profile.id).then(t => { if (!cancelled) setThread(t); });
    getThreadMessages(threadId).then(data => { if (!cancelled) setMessages(data); });
    markThreadRead(threadId, profile.id).catch(() => {});
    const unsubscribe = subscribeToThread(threadId, (msg) => {
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
      if (msg.sender_id !== profile.id) markThreadRead(threadId, profile.id).catch(() => {});
    });
    return () => { cancelled = true; unsubscribe(); };
  }, [threadId, profile.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  const submit = async () => {
    const text = body.trim();
    if (!text) return;
    setSending(true);
    try {
      const msg = await sendMessage(threadId, profile.id, text);
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
      setBody("");
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

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={body}
          onChange={e => setBody(e.target.value)}
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
