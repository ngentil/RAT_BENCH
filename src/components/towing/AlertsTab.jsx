import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ACC, MUT, BRD, TXT, RED, SURF } from '../../lib/styles';

// Proxied through Netlify function to avoid CORS block
const FEED_URL   = '/.netlify/functions/vic-emergency';
const REFRESH_MS = 60_000;

const FILTERS = [
  { id: 'all',     label: 'All' },
  { id: 'fire',    label: '🔥 Fire' },
  { id: 'medical', label: '🚑 Medical' },
  { id: 'rescue',  label: '⛑ Rescue' },
  { id: 'storm',   label: '🌩 Storm' },
  { id: 'other',   label: '⚠️ Other' },
];

const STATUS_COLOR = {
  'Emergency Warning': RED,
  'Watch and Act':     '#e8870a',
  'Advice':            '#c8a84b',
  'Under Control':     '#444',
  'Safe':              '#444',
};

function toFilter(cat1 = '') {
  const c = cat1.toLowerCase();
  if (c.includes('fire'))    return 'fire';
  if (c.includes('medic') || c.includes('ambulance')) return 'medical';
  if (c.includes('rescue') || c.includes('ses'))  return 'rescue';
  if (c.includes('storm') || c.includes('flood') || c.includes('wind')) return 'storm';
  return 'other';
}

function incidentIcon(cat1 = '') {
  return { fire: '🔥', medical: '🚑', rescue: '⛑', storm: '🌩' }[toFilter(cat1)] || '⚠️';
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-AU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
}

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

function normalise(raw) {
  if (raw.type === 'Feature' && raw.properties) {
    const p = raw.properties;
    return {
      id:        raw.id || p.id,
      category1: p.category1 || p.feedType || '',
      category2: p.category2 || p.eventType || '',
      title:     p.title || p.name || p.headline || '',
      location:  p.location || p.description || '',
      status:    p.status || '',
      created:   p.pubDate || p.created || p.updated || null,
      updated:   p.updated || p.pubDate || null,
      geometry:  raw.geometry,
    };
  }
  const lat = raw.latitude  ? parseFloat(raw.latitude)  : null;
  const lng = raw.longitude ? parseFloat(raw.longitude) : null;
  return {
    id:        String(raw.incidentNo || raw.id || Math.random()),
    category1: raw.category1 || raw.feedType || '',
    category2: raw.category2 || raw.incidentType || raw.eventType || '',
    title:     raw.name || raw.title || raw.headline || raw.sourceTitle || '',
    location:  raw.incidentLocation || (typeof raw.location === 'string' ? raw.location : (raw.location?.suburb || '')),
    status:    raw.incidentStatus || raw.status || '',
    created:   raw.originDateTime || raw.createdDt || raw.created || null,
    updated:   raw.lastUpdateDateTime || raw.lastUpdatedDt || raw.updated || null,
    geometry:  raw.geometry || (lat && lng ? { type: 'Point', coordinates: [lng, lat] } : null),
  };
}

function parseFeed(data) {
  if (data?.features)  return data.features.map(normalise);
  if (data?.results)   return (Array.isArray(data.results)   ? data.results   : Object.values(data.results)).map(normalise);
  if (Array.isArray(data)) return data.map(normalise);
  if (data?.incidents) return (Array.isArray(data.incidents) ? data.incidents : Object.values(data.incidents)).map(normalise);
  return [];
}

function AlertCard({ inc }) {
  const [open, setOpen] = useState(false);
  const borderColor = STATUS_COLOR[inc.status] || '#333';
  const ago = timeAgo(inc.created);

  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #252525', borderLeft: `3px solid ${borderColor}`, borderRadius: 2, marginBottom: 6, overflow: 'hidden' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px', cursor: 'pointer' }}>
        <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{incidentIcon(inc.category1)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{inc.title || inc.category1 || 'Incident'}</span>
            {inc.status && (
              <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', padding: '1px 5px', border: `1px solid ${borderColor}55`, borderRadius: 2, color: borderColor, textTransform: 'uppercase' }}>
                {inc.status}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 2 }}>
            {inc.location && <span style={{ fontSize: 8, color: MUT }}>{inc.location}</span>}
            {inc.category2 && <><span style={{ fontSize: 8, color: '#333' }}>·</span><span style={{ fontSize: 8, color: MUT }}>{inc.category2}</span></>}
            {ago && <><span style={{ fontSize: 8, color: '#333' }}>·</span><span style={{ fontSize: 8, color: '#7a7a7a' }}>{ago}</span></>}
          </div>
        </div>
        <span style={{ fontSize: 8, color: MUT, flexShrink: 0, marginTop: 2 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ padding: '0 12px 12px', borderTop: '1px solid #1a1a1a' }}>
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              ['Category',  inc.category1 || '—'],
              ['Type',      inc.category2 || '—'],
              ['Status',    inc.status    || '—'],
              ['Reported',  fmtDate(inc.created)],
              ...(inc.updated && inc.updated !== inc.created ? [['Updated', fmtDate(inc.updated)]] : []),
              ...(inc.geometry?.coordinates ? [['Coordinates', `${inc.geometry.coordinates[1]?.toFixed(4)}, ${inc.geometry.coordinates[0]?.toFixed(4)}`]] : []),
            ].map(([label, val]) => (
              <div key={label} style={{ background: SURF, border: '1px solid ' + BRD, borderRadius: 2, padding: '5px 8px' }}>
                <div style={{ fontSize: 7, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 1 }}>{label}</div>
                <div style={{ fontSize: 10, color: TXT, fontFamily: "'IBM Plex Mono',monospace", wordBreak: 'break-word' }}>{val}</div>
              </div>
            ))}
          </div>
          {inc.geometry?.coordinates && (
            <a
              href={`https://www.google.com/maps?q=${inc.geometry.coordinates[1]},${inc.geometry.coordinates[0]}`}
              target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 8, color: '#5a7a9a', border: '1px solid #1e2e3e', borderRadius: 2, padding: '4px 8px', textDecoration: 'none', background: '#0a1520' }}
            >
              📍 Open in Google Maps
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function AlertsTab() {
  const [incidents,  setIncidents]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [err,        setErr]        = useState('');
  const [errDetail,  setErrDetail]  = useState('');
  const [filter,     setFilter]     = useState('all');
  const [lastFetch,  setLastFetch]  = useState(null);
  const [countdown,  setCountdown]  = useState(REFRESH_MS / 1000);
  const timerRef = useRef(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(FEED_URL);
      const rawText = await res.text();
      if (!res.ok) {
        setErr(`HTTP ${res.status} from proxy`);
        setErrDetail(rawText.slice(0, 300));
        setLoading(false);
        return;
      }
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        setErr('Response was not valid JSON');
        setErrDetail(rawText.slice(0, 300));
        setLoading(false);
        return;
      }
      const parsed = parseFeed(data).filter(inc =>
        !inc.title.toUpperCase().includes('TEST')
      );
      setIncidents(parsed);
      setErr('');
      setErrDetail('');
      setLastFetch(new Date());
      setCountdown(REFRESH_MS / 1000);
    } catch (e) {
      setErr(e.message);
      setErrDetail('');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchAlerts();
    const poll = setInterval(fetchAlerts, REFRESH_MS);
    return () => clearInterval(poll);
  }, [fetchAlerts]);

  useEffect(() => {
    timerRef.current = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timerRef.current);
  }, [lastFetch]);

  const visible = filter === 'all'
    ? incidents
    : incidents.filter(inc => toFilter(inc.category1) === filter);

  const counts = {};
  incidents.forEach(inc => {
    const f = toFilter(inc.category1);
    counts[f] = (counts[f] || 0) + 1;
  });

  return (
    <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: TXT, letterSpacing: '0.06em' }}>🚨 Emergency Alerts</div>
          <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
            {loading
              ? 'Loading…'
              : err
                ? <span style={{ color: RED }}>{err}</span>
                : `${incidents.length} active incident${incidents.length !== 1 ? 's' : ''} · VicEmergency`
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
            onClick={fetchAlerts}
            style={{ fontSize: 8, fontWeight: 700, padding: '3px 9px', borderRadius: 2, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.06em', border: '1px solid #2a2a2a', color: MUT, background: '#0d0d0d' }}
          >
            ↺ Refresh
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
          const cnt = f.id === 'all' ? incidents.length : (counts[f.id] || 0);
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

      {loading && <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '32px 0' }}>Loading VicEmergency feed…</div>}
      {!loading && err && (
        <div style={{ padding: '16px', background: '#1a0a0a', border: '1px solid #3a1a1a', borderRadius: 3, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: RED, marginBottom: 6, fontWeight: 700 }}>Could not load alerts: {err}</div>
          {errDetail && (
            <div style={{ fontSize: 9, color: '#884040', fontFamily: "'IBM Plex Mono',monospace", wordBreak: 'break-all', whiteSpace: 'pre-wrap', lineHeight: 1.5, background: '#0d0000', padding: '8px', borderRadius: 2, marginBottom: 6 }}>
              {errDetail}
            </div>
          )}
          <div style={{ fontSize: 9, color: MUT }}>Proxy: {FEED_URL}</div>
        </div>
      )}
      {!loading && !err && visible.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '24px 0' }}>
          {filter === 'all' ? 'No active incidents in Victoria.' : `No ${filter} incidents right now.`}
        </div>
      )}
      {!loading && !err && visible.map((inc, i) => (
        <AlertCard key={inc.id || i} inc={inc} />
      ))}

      {!loading && !err && (
        <div style={{ marginTop: 16, fontSize: 8, color: '#333', textAlign: 'center', lineHeight: 1.7 }}>
          VicEmergency · State of Victoria · refreshes every 60s
        </div>
      )}
    </div>
  );
}
