import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ACC, MUT, TXT, RED } from '../../lib/styles';
import { supabase } from '../../lib/supabase';

const REFRESH_MS = 30_000;
const WINDOW_MS  = 2 * 60 * 60 * 1000;

const REGION_COLOR = {
  north_west_metro: '#4a7aaf',
  eastern_metro:    '#4aaf7a',
  southern_metro:   '#af874a',
};

const REGION_LABEL = {
  north_west_metro: 'North/West',
  eastern_metro:    'East',
  southern_metro:   'South',
};

const FILTERS = [
  { id: 'all',              label: 'All' },
  { id: 'north_west_metro', label: 'North/West' },
  { id: 'eastern_metro',    label: 'East' },
  { id: 'southern_metro',   label: 'South' },
];

function timeAgo(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const ms = Date.now() - d.getTime();
  if (ms < 0) return null;
  const m = Math.floor(ms / 60000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m ago`;
}

function TranscriptCard({ item }) {
  const borderColor = REGION_COLOR[item.channel] || '#333';
  const ago = timeAgo(item.recorded_at);

  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #252525', borderLeft: `3px solid ${borderColor}`, borderRadius: 2, marginBottom: 6, padding: '9px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 10, color: TXT, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1.6, flex: 1 }}>
          {item.transcript}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
          {ago && <span style={{ fontSize: 8, color: '#7a7a7a' }}>{ago}</span>}
          {item.duration_s != null && (
            <span style={{ fontSize: 7, color: MUT, fontFamily: "'IBM Plex Mono',monospace", padding: '1px 4px', border: '1px solid #2a2a2a', borderRadius: 2 }}>
              {Math.round(item.duration_s)}s
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AlertsTab() {
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [err,       setErr]       = useState('');
  const [filter,    setFilter]    = useState('all');
  const [lastFetch, setLastFetch] = useState(null);
  const [countdown, setCountdown] = useState(REFRESH_MS / 1000);
  const timerRef = useRef(null);

  const fetchTranscripts = useCallback(async () => {
    try {
      const since = new Date(Date.now() - WINDOW_MS).toISOString();
      const { data, error } = await supabase
        .from('radio_transcripts')
        .select('*')
        .gte('recorded_at', since)
        .order('recorded_at', { ascending: false })
        .limit(200);
      if (error) throw new Error(error.message);
      setItems(data || []);
      setErr('');
      setLastFetch(new Date());
      setCountdown(REFRESH_MS / 1000);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTranscripts();
    const poll = setInterval(fetchTranscripts, REFRESH_MS);
    return () => clearInterval(poll);
  }, [fetchTranscripts]);

  useEffect(() => {
    timerRef.current = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timerRef.current);
  }, [lastFetch]);

  const visible = filter === 'all' ? items : items.filter(i => i.channel === filter);

  const counts = {};
  items.forEach(i => { counts[i.channel] = (counts[i.channel] || 0) + 1; });

  return (
    <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: TXT, letterSpacing: '0.06em' }}>🚨 Alerts</div>
          <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
            {loading
              ? 'Loading…'
              : err
                ? <span style={{ color: RED }}>{err}</span>
                : `${items.length} call${items.length !== 1 ? 's' : ''} · last 2 hours`
            }
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {lastFetch && (
            <span style={{ fontSize: 8, color: '#444', fontFamily: "'IBM Plex Mono',monospace" }}>
              refresh in {countdown}s
            </span>
          )}
          <button
            onClick={fetchTranscripts}
            style={{ fontSize: 8, fontWeight: 700, padding: '3px 9px', borderRadius: 2, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.06em', border: '1px solid #2a2a2a', color: MUT, background: '#0d0d0d' }}
          >
            ↺ Refresh
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
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
              {f.label} {cnt > 0 && `(${cnt})`}
            </button>
          );
        })}
      </div>

      {loading && <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '32px 0' }}>Loading…</div>}
      {!loading && err && (
        <div style={{ padding: '16px', background: '#1a0a0a', border: '1px solid #3a1a1a', borderRadius: 3, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: RED, fontWeight: 700 }}>Could not load alerts: {err}</div>
        </div>
      )}
      {!loading && !err && visible.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '24px 0' }}>
          {filter === 'all'
            ? 'No dispatch calls in the last 2 hours.'
            : `No ${REGION_LABEL[filter] || filter} calls right now.`
          }
        </div>
      )}
      {!loading && !err && visible.map((item, i) => (
        <TranscriptCard key={item.id || i} item={item} />
      ))}

    </div>
  );
}
