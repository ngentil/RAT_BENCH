import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ACC, MUT, BRD, TXT, RED, SURF } from '../../lib/styles';

const API_URL  = 'https://api.opendata.transport.vic.gov.au/api/opendata/roads/disruptions/unplanned/v3';
const API_KEY  = import.meta.env.VITE_VICROADS_KEY || 'bb7fc352-3ce6-44d2-9628-63fefb64278d';
const REFRESH_MS  = 60_000;
const WINDOW_MS   = 24 * 60 * 60 * 1000;

const FILTERS = [
  { id: 'all',       label: 'All' },
  { id: 'accident',  label: '💥 Accident' },
  { id: 'breakdown', label: '🚗 Breakdown' },
  { id: 'flood',     label: '🌊 Flooding' },
  { id: 'damage',    label: '🛣 Road Damage' },
  { id: 'other',     label: '⚠️ Other' },
];

const STATUS_COLOR = {
  ACTIVE:   '#e8870a',
  REOPENED: '#c8a84b',
  CLOSED:   '#444',
};

function toFilter(sub = '') {
  const s = sub.toLowerCase();
  if (s.includes('accident') || s.includes('collision')) return 'accident';
  if (s.includes('breakdown') || s.includes('stationary')) return 'breakdown';
  if (s.includes('flood')) return 'flood';
  if (s.includes('damage')) return 'damage';
  return 'other';
}

function incidentIcon(sub = '') {
  return { accident: '💥', breakdown: '🚗', flood: '🌊', damage: '🛣' }[toFilter(sub)] || '⚠️';
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
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m ago`;
}

function normalise(f) {
  const p = f.properties || {};
  const coords = f.geometry?.type === 'Point'
    ? f.geometry.coordinates
    : (f.geometry?.coordinates?.[0]?.[0] || null);
  return {
    id:       String(p.eventId || f.id || ''),
    subType:  p.eventSubType || p.eventType || '',
    title:    p.closedRoadName || p.description || 'Road Disruption',
    location: p.reference?.startIntersectionLocality || p.startIntersection || '',
    status:   p.status || '',
    updated:  p.lastUpdated || null,
    geometry: coords ? { type: 'Point', coordinates: coords } : null,
  };
}

function IncidentCard({ inc }) {
  const [open, setOpen] = useState(false);
  const borderColor = STATUS_COLOR[inc.status] || '#333';
  const ago = timeAgo(inc.updated);

  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #252525', borderLeft: `3px solid ${borderColor}`, borderRadius: 2, marginBottom: 6, overflow: 'hidden' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px', cursor: 'pointer' }}>
        <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{incidentIcon(inc.subType)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{inc.title}</span>
            {inc.status && (
              <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', padding: '1px 5px', border: `1px solid ${borderColor}55`, borderRadius: 2, color: borderColor, textTransform: 'uppercase' }}>
                {inc.status}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 2 }}>
            {inc.location && <span style={{ fontSize: 8, color: MUT }}>{inc.location}</span>}
            {inc.subType && <><span style={{ fontSize: 8, color: '#333' }}>·</span><span style={{ fontSize: 8, color: MUT }}>{inc.subType}</span></>}
            {ago && <><span style={{ fontSize: 8, color: '#333' }}>·</span><span style={{ fontSize: 8, color: '#7a7a7a' }}>{ago}</span></>}
          </div>
        </div>
        <span style={{ fontSize: 8, color: MUT, flexShrink: 0, marginTop: 2 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ padding: '0 12px 12px', borderTop: '1px solid #1a1a1a' }}>
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              ['Type',    inc.subType || '—'],
              ['Status',  inc.status  || '—'],
              ['Updated', fmtDate(inc.updated)],
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

export default function TrafficTab() {
  const [incidents,  setIncidents]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [err,        setErr]        = useState('');
  const [filter,     setFilter]     = useState('all');
  const [lastFetch,  setLastFetch]  = useState(null);
  const [countdown,  setCountdown]  = useState(REFRESH_MS / 1000);
  const timerRef = useRef(null);

  const fetchTraffic = useCallback(async () => {
    try {
      const res = await fetch(API_URL, { headers: { KeyID: API_KEY } });
      if (!res.ok) {
        setErr(`HTTP ${res.status} from VicRoads`);
        setLoading(false);
        return;
      }
      const data = await res.json();
      const features = data?.data?.features || data?.features || [];
      const cutoff = Date.now() - WINDOW_MS;

      // Deduplicate by eventId, keep most-recently-updated feature per event
      const byId = new Map();
      for (const f of features) {
        const inc = normalise(f);
        const t = inc.updated ? new Date(inc.updated).getTime() : 0;
        const existing = byId.get(inc.id);
        const et = existing?.updated ? new Date(existing.updated).getTime() : 0;
        if (!existing || t > et) byId.set(inc.id, inc);
      }

      const all = [...byId.values()]
        .filter(inc => {
          if (!inc.updated) return true;
          const t = new Date(inc.updated).getTime();
          return isNaN(t) || t > cutoff;
        })
        .sort((a, b) => {
          const ta = a.updated ? new Date(a.updated).getTime() : 0;
          const tb = b.updated ? new Date(b.updated).getTime() : 0;
          return tb - ta;
        });

      setIncidents(all);
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
    fetchTraffic();
    const poll = setInterval(fetchTraffic, REFRESH_MS);
    return () => clearInterval(poll);
  }, [fetchTraffic]);

  useEffect(() => {
    timerRef.current = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timerRef.current);
  }, [lastFetch]);

  const visible = filter === 'all'
    ? incidents
    : incidents.filter(inc => toFilter(inc.subType) === filter);

  const counts = {};
  incidents.forEach(inc => {
    const f = toFilter(inc.subType);
    counts[f] = (counts[f] || 0) + 1;
  });

  return (
    <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: TXT, letterSpacing: '0.06em' }}>🚦 Traffic Incidents</div>
          <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
            {loading
              ? 'Loading…'
              : err
                ? <span style={{ color: RED }}>{err}</span>
                : `${incidents.length} incident${incidents.length !== 1 ? 's' : ''} · last 24h · VicRoads`
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
            onClick={fetchTraffic}
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

      {loading && <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '32px 0' }}>Loading VicRoads feed…</div>}
      {!loading && err && (
        <div style={{ padding: '16px', background: '#1a0a0a', border: '1px solid #3a1a1a', borderRadius: 3, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: RED, fontWeight: 700 }}>Could not load traffic: {err}</div>
        </div>
      )}
      {!loading && !err && visible.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '24px 0' }}>
          No {filter === 'all' ? '' : filter + ' '}traffic incidents in the last 24 hours.
        </div>
      )}
      {!loading && !err && visible.map((inc, i) => (
        <IncidentCard key={inc.id || i} inc={inc} />
      ))}

      {!loading && !err && (
        <div style={{ marginTop: 16, fontSize: 8, color: '#333', textAlign: 'center', lineHeight: 1.7 }}>
          VicRoads Open Data · last 24 hours · refreshes every 60s
        </div>
      )}
    </div>
  );
}
