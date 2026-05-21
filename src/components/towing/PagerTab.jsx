import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { ACC, MUT, TXT, RED } from '../../lib/styles';

const AGENCY_COLOR = {
  CFS:     '#af6a2a',
  MFS:     '#af2a2a',
  SES:     '#a89a20',
  SAAS:    '#2aaf5a',
  MEDSTAR: '#2a8faf',
};

const AGENCIES = ['CFS', 'MFS', 'SES', 'SAAS', 'MEDSTAR'];

function parseAgency(text) {
  const t = text.toUpperCase();
  if (t.includes('MEDSTAR')) return 'MEDSTAR';
  if (t.includes('SAAS'))    return 'SAAS';
  if (t.includes('MFS'))     return 'MFS';
  if (t.includes('SES'))     return 'SES';
  if (t.includes('CFS'))     return 'CFS';
  return 'OTHER';
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function timeAgo(ts) {
  const ms = Date.now() - ts;
  if (ms < 0) return null;
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m ago`;
}

function PagerCard({ item }) {
  const color = AGENCY_COLOR[item.agency] || '#444';
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #252525', borderLeft: `3px solid ${color}`, borderRadius: 2, marginBottom: 6, padding: '9px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 8, fontWeight: 700, color, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.08em', marginRight: 8 }}>
            {item.agency}
          </span>
          <span style={{ fontSize: 10, color: TXT, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1.6 }}>
            {item.text}
          </span>
        </div>
        <span style={{ fontSize: 8, color: '#7a7a7a', flexShrink: 0 }}>{timeAgo(item.ts)}</span>
      </div>
    </div>
  );
}

export default function PagerTab() {
  const [items,   setItems]   = useState([]);
  const [status,  setStatus]  = useState('connecting');
  const [filter,  setFilter]  = useState('all');
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io('https://sapaging.com', {
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionDelayMax: 30000,
      reconnectionAttempts: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setStatus('connected');
      socket.emit('hello', { ip: '', browser: navigator.userAgent, pv: 23, mv: 0 });
      socket.emit('follow_page_feed', {
        page: 'live',
        uri: 'https://sapaging.com/live?agency=ALL',
        ip: '', theme: 'advanced_pastel',
        newest: 0, oldest: 0, buffered: 0, noChanges: 0,
      });
    });

    socket.on('disconnect', () => setStatus('disconnected'));
    socket.on('connect_error', () => setStatus('error'));

    socket.on('newpage', (o) => {
      if (!o.html) return;
      const text = stripHtml(o.html);
      if (!text) return;
      setItems(prev => [{
        id:     o.id,
        text,
        agency: parseAgency(text),
        ts:     Date.now(),
      }, ...prev].slice(0, 200));
    });

    return () => { socket.disconnect(); };
  }, []);

  const visible = filter === 'all' ? items : items.filter(i => i.agency === filter);
  const counts  = {};
  items.forEach(i => { counts[i.agency] = (counts[i.agency] || 0) + 1; });

  const filters = [{ id: 'all', label: 'All' }, ...AGENCIES.map(a => ({ id: a, label: a }))];

  const statusColor = status === 'connected' ? '#2aaf5a' : status === 'connecting' ? '#a89a20' : RED;
  const statusLabel = status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting…' : 'Disconnected';

  return (
    <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: TXT, letterSpacing: '0.06em' }}>📟 Pager</div>
          <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
            <span style={{ color: statusColor, fontWeight: 700 }}>● {statusLabel}</span>
            {status === 'connected' && items.length > 0 && (
              <span style={{ marginLeft: 8 }}>{items.length} message{items.length !== 1 ? 's' : ''} this session</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
        {filters.map(f => {
          const cnt = f.id === 'all' ? items.length : (counts[f.id] || 0);
          const active = filter === f.id;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              fontSize: 8, fontWeight: 700, padding: '3px 9px', borderRadius: 2, cursor: 'pointer',
              fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.06em',
              border: `1px solid ${active ? ACC + '88' : '#2a2a2a'}`,
              color: active ? ACC : MUT,
              background: active ? ACC + '11' : '#0d0d0d',
            }}>
              {f.label}{cnt > 0 ? ` (${cnt})` : ''}
            </button>
          );
        })}
      </div>

      {status === 'error' && (
        <div style={{ padding: '16px', background: '#1a0a0a', border: '1px solid #3a1a1a', borderRadius: 3, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: RED, fontWeight: 700 }}>Could not connect to pager feed — CORS may be blocking the connection.</div>
        </div>
      )}

      {status === 'connected' && visible.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '24px 0' }}>
          Connected — waiting for messages…
        </div>
      )}

      {visible.map((item, i) => (
        <PagerCard key={item.id || i} item={item} />
      ))}

    </div>
  );
}
