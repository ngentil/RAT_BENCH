import React, { useState, useEffect, useCallback } from 'react';
import { ACC, MUT, BRD, TXT, GRN, RED, SURF } from '../../lib/styles';

const API_URL = 'https://api.opendata.transport.vic.gov.au/api/opendata/roads/disruptions/unplanned/v3';
const API_KEY = 'bb7fc352-3ce6-44d2-9628-63fefb64278d';
const POLL_MS = 60_000;

const ORANGE = '#e8870a';

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-AU', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function StatusBadge({ status }) {
  const isActive = status?.toLowerCase() === 'active';
  const color = isActive ? GRN : '#555';
  return (
    <span style={{
      fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', padding: '1px 5px',
      border: `1px solid ${color}55`, borderRadius: 2, color,
      background: color + '15', textTransform: 'uppercase',
    }}>
      {status || 'Unknown'}
    </span>
  );
}

function AllocationCard({ feature }) {
  const [open, setOpen] = useState(false);
  const p = feature.properties || {};
  const road    = p.closedRoadName || '—';
  const suburb  = p.reference?.startIntersectionLocality || '';
  const eventId = p.eventId || '—';
  const status  = p.status || '';
  const desc    = p.description || '';
  const lanes   = p.numberLanesImpacted;
  const impact  = p.impact?.impactType || '';
  const created = p.created;
  const nextDue = p.nextUpdateDue;

  const borderColor = status?.toLowerCase() === 'active' ? GRN : '#444';

  return (
    <div style={{
      background: '#0d0d0d', border: '1px solid #252525',
      borderLeft: `3px solid ${borderColor}`,
      borderRadius: 2, marginBottom: 6, overflow: 'hidden',
    }}>
      <div onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer' }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>🚛</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{road}</span>
            <StatusBadge status={status} />
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2, flexWrap: 'wrap' }}>
            {suburb && <span style={{ fontSize: 8, color: MUT }}>{suburb}</span>}
            {suburb && eventId && <span style={{ fontSize: 8, color: '#333' }}>·</span>}
            <span style={{ fontSize: 8, color: ACC, fontFamily: "'IBM Plex Mono',monospace" }}>#{eventId}</span>
          </div>
          {!open && lanes != null && (
            <div style={{ marginTop: 3, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 7, color: ORANGE, border: `1px solid ${ORANGE}44`, borderRadius: 2, padding: '1px 4px' }}>
                {lanes} lane{lanes !== 1 ? 's' : ''} impacted
              </span>
              {impact && <span style={{ fontSize: 7, color: MUT, border: '1px solid #252525', borderRadius: 2, padding: '1px 4px' }}>{impact}</span>}
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          {/* Assign Truck stub — Phase 2 */}
          <button
            disabled
            title="Coming in Phase 2"
            style={{
              background: '#111', border: '1px dashed #333', borderRadius: 2,
              color: '#444', fontSize: 8, padding: '3px 7px', cursor: 'not-allowed',
              fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.06em',
              display: 'block', marginBottom: 4,
            }}>
            🚛 Assign Truck
          </button>
          <span style={{ fontSize: 8, color: MUT }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {open && (
        <div style={{ padding: '0 12px 12px', borderTop: '1px solid #1a1a1a' }}>
          {desc && (
            <div style={{ marginTop: 10, fontSize: 10, color: MUT, lineHeight: 1.6, background: '#0a0a0a', padding: '6px 8px', borderRadius: 2, border: '1px solid #1a1a1a' }}>
              {desc}
            </div>
          )}

          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              ['AAC Job ID', `#${eventId}`],
              ['Status', status || '—'],
              ['Lanes Impacted', lanes != null ? `${lanes} lane${lanes !== 1 ? 's' : ''}` : '—'],
              ['Impact Type', impact || '—'],
              ['Time Logged', fmt(created)],
              ['Next Update Due', fmt(nextDue)],
            ].map(([label, val]) => (
              <div key={label} style={{ background: SURF, border: '1px solid ' + BRD, borderRadius: 2, padding: '6px 8px' }}>
                <div style={{ fontSize: 7, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 10, color: TXT, fontFamily: "'IBM Plex Mono',monospace", wordBreak: 'break-all' }}>{val}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 10, padding: '8px 10px', border: '1px dashed #2a2a2a', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🚛</span>
            <div>
              <div style={{ fontSize: 8, color: '#444', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Assign Truck</div>
              <div style={{ fontSize: 8, color: '#333', marginTop: 1 }}>Fleet assignment coming in Phase 2</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TowAllocationsTab() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState('');
  const [lastFetch, setLastFetch] = useState(null);
  const [countdown, setCountdown] = useState(POLL_MS / 1000);

  const fetchAllocations = useCallback(async () => {
    try {
      const res = await fetch(API_URL, { headers: { KeyId: API_KEY } });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      const filtered = (data.features || []).filter(
        f => f.properties?.source?.sourceName === 'TowAllocation'
      );
      setFeatures(filtered);
      setErr('');
      setLastFetch(new Date());
      setCountdown(POLL_MS / 1000);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllocations();
    const poll = setInterval(fetchAllocations, POLL_MS);
    return () => clearInterval(poll);
  }, [fetchAllocations]);

  // countdown ticker
  useEffect(() => {
    const t = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : POLL_MS / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const active   = features.filter(f => f.properties?.status?.toLowerCase() === 'active');
  const inactive = features.filter(f => f.properties?.status?.toLowerCase() !== 'active');

  return (
    <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: TXT, letterSpacing: '0.06em' }}>🚛 Tow Allocations</div>
          <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
            VicRoads feed · {features.length} allocation{features.length !== 1 ? 's' : ''}
            {active.length > 0 && <span style={{ color: GRN, marginLeft: 8 }}>· {active.length} active</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {lastFetch && (
            <span style={{ fontSize: 8, color: MUT }}>
              Updated {lastFetch.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              {' · '}next in {countdown}s
            </span>
          )}
          <button
            onClick={fetchAllocations}
            style={{ fontSize: 8, color: ACC, border: `1px solid ${ACC}44`, background: ACC + '11', padding: '3px 8px', borderRadius: 2, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Summary strip */}
      {features.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[
            ['Total', features.length, TXT],
            ['Active', active.length, GRN],
            ['Inactive', inactive.length, MUT],
          ].map(([l, v, c]) => (
            <div key={l} style={{ background: SURF, border: '1px solid ' + BRD, borderTop: `2px solid ${c}`, borderRadius: 2, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 8, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {err && (
        <div style={{ marginBottom: 12, fontSize: 9, padding: '8px 12px', borderRadius: 2, color: ORANGE, background: ORANGE + '11', border: `1px solid ${ORANGE}44`, lineHeight: 1.6 }}>
          ⚠ Feed error: {err}
          <br />
          <span style={{ color: MUT }}>Check browser console — CORS may require a proxy for cross-origin requests.</span>
        </div>
      )}

      {loading && !err && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '32px 0' }}>Loading feed…</div>
      )}

      {!loading && !err && features.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '32px 0', lineHeight: 1.8 }}>
          No tow allocations in the feed.<br />
          <span style={{ fontSize: 8 }}>Feed updates every 60 seconds.</span>
        </div>
      )}

      {active.length > 0 && (
        <>
          <div style={{ fontSize: 8, color: GRN, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6, borderLeft: `2px solid ${GRN}`, paddingLeft: 6 }}>
            Active ({active.length})
          </div>
          {active.map((f, i) => <AllocationCard key={f.properties?.eventId || i} feature={f} />)}
          {inactive.length > 0 && <div style={{ marginTop: 12 }} />}
        </>
      )}

      {inactive.length > 0 && (
        <>
          <div style={{ fontSize: 8, color: MUT, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6, borderLeft: '2px solid #444', paddingLeft: 6 }}>
            Inactive ({inactive.length})
          </div>
          {inactive.map((f, i) => <AllocationCard key={f.properties?.eventId || i} feature={f} />)}
        </>
      )}
    </div>
  );
}
