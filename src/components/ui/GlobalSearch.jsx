import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ACC, MUT, BRD, TXT, SURF, ovly } from '../../lib/styles';
import { machineMatchesQuery } from '../../lib/helpers';

// One search box that finds anything, anywhere — for "I don't know which
// tab this is under" (was a Vehicle unfindable? was that client's mower in
// Garage or already on the Bench?). Deliberately separate from each tab's
// own inline filter (Garage/Vehicles/Equipment/Tools/Clients all keep
// theirs) — this is only for jumping TO the right place, not for narrowing
// a list you're already looking at. Only searches what's already loaded
// client-side (machines/clients/vehicles/equipment/tools) — Workshop
// inventory ("Parts") and the Wiki aren't preloaded app-wide the same way,
// so they're deliberately out of scope here rather than adding a slower,
// separate live-query path into a component this cheap to open.
function GlobalSearch({ machines, clients, vehicles, equipment, tools, onJumpTo, onClose }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => {
    const query = q.trim();
    if (query.length < 2) return [];
    const lower = query.toLowerCase();
    const out = [];

    (machines || []).forEach(m => {
      if (machineMatchesQuery(m, query)) {
        out.push({ key: 'm:' + m.id, category: 'Machine', label: m.name || [m.make, m.model].filter(Boolean).join(' '), sub: [m.make, m.model].filter(Boolean).join(' '), jump: { tab: 'tracker', query: m.name || query } });
      }
    });
    (clients || []).forEach(c => {
      if ((c.name || '').toLowerCase().includes(lower) || (c.phone || '').includes(query) || (c.email || '').toLowerCase().includes(lower)) {
        out.push({ key: 'c:' + c.id, category: 'Client', label: c.name, sub: c.phone || c.email || '', jump: { tab: 'office', subTab: 'clients', query: c.name } });
      }
    });
    (vehicles || []).forEach(v => {
      const hay = [v.name, v.make, v.model].filter(Boolean).join(' ').toLowerCase();
      if (hay.includes(lower)) out.push({ key: 'v:' + v.id, category: 'Vehicle', label: v.name || [v.make, v.model].filter(Boolean).join(' '), sub: [v.make, v.model].filter(Boolean).join(' '), jump: { tab: 'workshop', subTab: 'vehicles', query: v.name || query } });
    });
    (equipment || []).forEach(e => {
      const hay = [e.name, e.make, e.model, e.type].filter(Boolean).join(' ').toLowerCase();
      if (hay.includes(lower)) out.push({ key: 'e:' + e.id, category: 'Equipment', label: e.name || [e.make, e.model].filter(Boolean).join(' '), sub: e.type || '', jump: { tab: 'workshop', subTab: 'equipment', query: e.name || query } });
    });
    (tools || []).forEach(t => {
      const hay = [t.name, t.brand, t.model, t.category].filter(Boolean).join(' ').toLowerCase();
      if (hay.includes(lower)) out.push({ key: 't:' + t.id, category: 'Tool', label: t.name || [t.brand, t.model].filter(Boolean).join(' '), sub: t.category || '', jump: { tab: 'workshop', subTab: 'tools', query: t.name || query } });
    });

    return out.slice(0, 40);
  }, [q, machines, clients, vehicles, equipment, tools]);

  return (
    <div style={{ ...ovly, alignItems: 'flex-start', paddingTop: '10vh' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: SURF, border: '1px solid ' + BRD, borderTop: '2px solid ' + ACC, borderRadius: 3, width: '100%', maxWidth: 440, maxHeight: '70vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: 12, borderBottom: '1px solid ' + BRD, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: MUT, fontSize: 14 }}>🔍</span>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
            placeholder="Search machines, clients, vehicles, equipment, tools…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: TXT, fontSize: 13, fontFamily: "'IBM Plex Mono',monospace" }}
          />
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: MUT, fontSize: 16, cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {q.trim().length >= 2 && results.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', fontSize: 10, color: MUT }}>No matches in machines, clients, vehicles, equipment, or tools.</div>
          )}
          {q.trim().length > 0 && q.trim().length < 2 && (
            <div style={{ padding: 20, textAlign: 'center', fontSize: 10, color: MUT }}>Keep typing…</div>
          )}
          {results.map(r => (
            <div key={r.key} onClick={() => { onJumpTo(r.jump); onClose(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderBottom: '1px solid #1a1a1a', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#161616'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: 7, color: ACC, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, border: '1px solid ' + ACC + '55', borderRadius: 2, padding: '2px 5px', flexShrink: 0 }}>{r.category}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 11, color: TXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</div>
                {r.sub && <div style={{ fontSize: 9, color: MUT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.sub}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GlobalSearch;
