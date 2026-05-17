import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ACC, MUT, BRD, TXT, GRN, SURF } from '../../lib/styles';
import { logAllocations, getRecentAllocations } from '../../lib/db/towing';

const API_URL = 'https://api.opendata.transport.vic.gov.au/api/opendata/roads/disruptions/unplanned/v3';
const API_KEY = 'bb7fc352-3ce6-44d2-9628-63fefb64278d';
const POLL_MS = 60_000;
const ORANGE  = '#e8870a';

const suburb = f => f.properties?.reference?.startIntersectionLocality || '';

const SORT_OPTIONS = [
  { key: 'recent',  label: 'Most Recent',     fn: (a, b) => new Date(b.properties?.created || 0) - new Date(a.properties?.created || 0) },
  { key: 'oldest',  label: 'Oldest First',    fn: (a, b) => new Date(a.properties?.created || 0) - new Date(b.properties?.created || 0) },
  { key: 'road',    label: 'Road Name (A–Z)', fn: (a, b) => (a.properties?.closedRoadName || '').localeCompare(b.properties?.closedRoadName || '') },
  { key: 'suburb',  label: 'Suburb (A–Z)',    fn: (a, b) => suburb(a).localeCompare(suburb(b)) },
  { key: 'lanes',   label: 'Lanes Impacted',  fn: (a, b) => (b.properties?.numberLanesImpacted || 0) - (a.properties?.numberLanesImpacted || 0) },
  { key: 'eventId', label: 'Event ID',        fn: (a, b) => Number(a.properties?.eventId || 0) - Number(b.properties?.eventId || 0) },
];

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-AU', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function timeIn(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return null;
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  if (h < 24)  return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d}d ${rh}h` : `${d}d`;
}

function StatusBadge({ status }) {
  const isActive = status?.toLowerCase() === 'active';
  const color = isActive ? GRN : '#555';
  return (
    <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', padding: '1px 5px', border: `1px solid ${color}55`, borderRadius: 2, color, background: color + '15', textTransform: 'uppercase' }}>
      {status || 'Unknown'}
    </span>
  );
}

function AllocationCard({ feature, fromLog }) {
  const [open, setOpen] = useState(false);
  const p       = feature.properties || {};
  const road    = p.closedRoadName || '—';
  const sub     = suburb(feature);
  const eventId = p.eventId || '—';
  const status  = p.status || '';
  const desc    = p.description || '';
  const lanes   = p.numberLanesImpacted;
  const impact  = p.impact?.impactType || '';
  const created = p.created;
  const nextDue = p.nextUpdateDue;
  const logMeta = feature._logMeta;
  const elapsed = timeIn(created);

  const borderColor = status?.toLowerCase() === 'active' ? GRN : '#333';

  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #252525', borderLeft: `3px solid ${borderColor}`, borderRadius: 2, marginBottom: 6, overflow: 'hidden' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer' }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>🚛</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{road}</span>
            <StatusBadge status={status} />
            {fromLog && status?.toLowerCase() !== 'active' && (
              <span style={{ fontSize: 7, color: MUT, border: '1px solid #2a2a2a', borderRadius: 2, padding: '1px 4px' }}>LOG</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2, flexWrap: 'wrap' }}>
            {sub && <span style={{ fontSize: 8, color: MUT }}>{sub}</span>}
            {sub && <span style={{ fontSize: 8, color: '#333' }}>·</span>}
            <span style={{ fontSize: 8, color: ACC, fontFamily: "'IBM Plex Mono',monospace" }}>#{eventId}</span>
          </div>
          {!open && (
            <div style={{ marginTop: 3, display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
              {elapsed && (
                <span style={{ fontSize: 7, color: ORANGE, border: `1px solid ${ORANGE}44`, borderRadius: 2, padding: '1px 4px', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>
                  ⏱ {elapsed}
                </span>
              )}
              {lanes != null && (
                <span style={{ fontSize: 7, color: MUT, border: '1px solid #2a2a2a', borderRadius: 2, padding: '1px 4px' }}>
                  {lanes} lane{lanes !== 1 ? 's' : ''} impacted
                </span>
              )}
              {impact && <span style={{ fontSize: 7, color: MUT, border: '1px solid #252525', borderRadius: 2, padding: '1px 4px' }}>{impact}</span>}
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <button disabled title="Coming in Phase 2"
            style={{ background: '#111', border: '1px dashed #333', borderRadius: 2, color: '#444', fontSize: 8, padding: '3px 7px', cursor: 'not-allowed', fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
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
              ['AAC Job ID',       `#${eventId}`],
              ['Status',           status || '—'],
              ['Lanes Impacted',   lanes != null ? `${lanes} lane${lanes !== 1 ? 's' : ''}` : '—'],
              ['Impact Type',      impact || '—'],
              ['Time In',          elapsed || '—'],
              ['Time Logged',      fmt(created)],
              ['Next Update Due',  fmt(nextDue)],
              ...(logMeta ? [
                ['First Seen',  fmt(logMeta.firstSeen)],
                ['Last Seen',   fmt(logMeta.lastSeen)],
              ] : []),
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

// ── Main tab ──────────────────────────────────────────────────────────────────
export default function TowAllocationsTab() {
  const [allFeatures,  setAllFeatures]  = useState([]);
  const [liveIds,      setLiveIds]      = useState(new Set());
  const [loading,      setLoading]      = useState(true);
  const [err,          setErr]          = useState('');
  const [lastFetch,    setLastFetch]    = useState(null);
  const [countdown,    setCountdown]    = useState(POLL_MS / 1000);
  const [sortBy,       setSortBy]       = useState('recent');
  const [showSort,     setShowSort]     = useState(false);
  const sortRef = useRef(null);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = e => { if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Merge helper — live features win over logged ones for same eventId; no sort (sort state handles it)
  const mergeFeatures = (live, logged) => {
    const map = new Map();
    logged.forEach(f => { if (f.properties?.eventId) map.set(String(f.properties.eventId), f); });
    live.forEach(f   => { if (f.properties?.eventId) map.set(String(f.properties.eventId), f); });
    return [...map.values()];
  };

  useEffect(() => {
    getRecentAllocations(24)
      .then(logged => {
        setAllFeatures(prev => mergeFeatures([], [...prev, ...logged]));
        setLoading(false);
      })
      .catch(e => {
        console.warn('getRecentAllocations:', e.message);
        setLoading(false);
      });
  }, []);

  const fetchAllocations = useCallback(async () => {
    try {
      const res = await fetch(API_URL, { headers: { KeyID: API_KEY } });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      const all  = data.data?.features || data.features || [];
      const live = all.filter(f => f.properties?.source?.sourceName === 'TowAllocation');
      if (live[0]) console.log('[TowFeed] sample TowAllocation props:', JSON.stringify(live[0].properties).slice(0, 600));
      setLiveIds(new Set(live.map(f => String(f.properties?.eventId))));
      logAllocations(live).catch(e => console.warn('logAllocations:', e));
      setAllFeatures(prev => mergeFeatures(live, prev));
      setErr('');
      setLastFetch(new Date());
      setCountdown(POLL_MS / 1000);
    } catch (e) {
      setErr(e.message);
    }
  }, []);

  useEffect(() => {
    fetchAllocations();
    const poll = setInterval(fetchAllocations, POLL_MS);
    return () => clearInterval(poll);
  }, [fetchAllocations]);

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : POLL_MS / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const sortFn      = SORT_OPTIONS.find(o => o.key === sortBy)?.fn;
  const sorted      = [...allFeatures].sort(sortFn);
  const active      = sorted.filter(f => f.properties?.status?.toLowerCase() === 'active');
  const inactive    = sorted.filter(f => f.properties?.status?.toLowerCase() !== 'active');
  const currentSort = SORT_OPTIONS.find(o => o.key === sortBy);

  return (
    <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: TXT, letterSpacing: '0.06em' }}>🚛 Tow Allocations</div>
          <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
            VicRoads feed · last 24 hrs · {allFeatures.length} allocation{allFeatures.length !== 1 ? 's' : ''}
            {active.length > 0 && <span style={{ color: GRN, marginLeft: 8 }}>· {active.length} active</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {lastFetch && (
            <span style={{ fontSize: 8, color: MUT }}>
              Live {lastFetch.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              {' · '}next in {countdown}s
            </span>
          )}

          {/* Sort picker */}
          <div ref={sortRef} style={{ position: 'relative' }}>
            <button onClick={() => setShowSort(s => !s)}
              style={{ fontSize: 8, color: showSort ? ACC : MUT, border: `1px solid ${showSort ? ACC + '66' : '#2a2a2a'}`, background: showSort ? ACC + '11' : '#0d0d0d', padding: '3px 8px', borderRadius: 2, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              ⇅ {currentSort?.label}
            </button>
            {showSort && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 50, background: '#111', border: '1px solid #2a2a2a', borderRadius: 2, minWidth: 160, boxShadow: '0 4px 16px #000a' }}>
                {SORT_OPTIONS.map(opt => (
                  <div key={opt.key} onClick={() => { setSortBy(opt.key); setShowSort(false); }}
                    style={{ padding: '7px 12px', fontSize: 9, color: opt.key === sortBy ? ACC : TXT, background: opt.key === sortBy ? ACC + '11' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid #1a1a1a', fontFamily: "'IBM Plex Mono',monospace" }}>
                    <span style={{ color: opt.key === sortBy ? ACC : '#333', width: 8 }}>{opt.key === sortBy ? '✓' : ''}</span>
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={fetchAllocations}
            style={{ fontSize: 8, color: ACC, border: `1px solid ${ACC}44`, background: ACC + '11', padding: '3px 8px', borderRadius: 2, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Summary strip */}
      {allFeatures.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[
            ['24h Total', allFeatures.length, TXT],
            ['Active',    active.length,      GRN],
            ['Inactive',  inactive.length,    MUT],
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
          ⚠ Live feed error: {err}
          <br />
          <span style={{ color: MUT }}>Showing logged history. Feed updates every 60 seconds.</span>
        </div>
      )}

      {loading && allFeatures.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '32px 0' }}>Loading…</div>
      )}

      {!loading && allFeatures.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '32px 0', lineHeight: 1.8 }}>
          No tow allocations in the last 24 hours.<br />
          <span style={{ fontSize: 8 }}>Feed updates every 60 seconds.</span>
        </div>
      )}

      {active.length > 0 && (
        <>
          <div style={{ fontSize: 8, color: GRN, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6, borderLeft: `2px solid ${GRN}`, paddingLeft: 6 }}>
            Active ({active.length})
          </div>
          {active.map((f, i) => (
            <AllocationCard key={f.properties?.eventId || i} feature={f} fromLog={!liveIds.has(String(f.properties?.eventId))} />
          ))}
          {inactive.length > 0 && <div style={{ marginTop: 12 }} />}
        </>
      )}

      {inactive.length > 0 && (
        <>
          <div style={{ fontSize: 8, color: MUT, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6, borderLeft: '2px solid #444', paddingLeft: 6 }}>
            Inactive / Historical ({inactive.length})
          </div>
          {inactive.map((f, i) => (
            <AllocationCard key={f.properties?.eventId || i} feature={f} fromLog={!liveIds.has(String(f.properties?.eventId))} />
          ))}
        </>
      )}
    </div>
  );
}
