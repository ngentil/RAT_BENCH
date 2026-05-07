import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { ACC, MUT, BRD, TXT, GRN, SURF, inp, btnA, btnG, btnD, sm, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { SL } from '../ui/shared';
import { mIcon } from '../../lib/helpers';

const PART_STATUS = {
  needed:  { label: "Needed",  color: "#e8870a" },
  ordered: { label: "Ordered", color: "#4a9eff" },
  fitted:  { label: "Fitted",  color: "#3d9e50" },
};

// Detect barcode scanner: chars arrive < 50ms apart, ends with Enter, length >= 3
function useBarcodeScanner(onScan, enabled) {
  const bufRef  = useRef('');
  const tmrRef  = useRef(null);
  const lastRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const handle = (e) => {
      // Don't intercept when user is actively typing in an input
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const now = Date.now();
      const gap = now - lastRef.current;
      lastRef.current = now;

      if (e.key === 'Enter') {
        const buf = bufRef.current.trim();
        if (buf.length >= 3) onScan(buf);
        bufRef.current = '';
        if (tmrRef.current) clearTimeout(tmrRef.current);
        return;
      }

      // If gap is large (> 80ms) and buffer has content, it's human typing → reset
      if (gap > 80 && bufRef.current.length > 0) bufRef.current = '';

      if (e.key.length === 1) bufRef.current += e.key;

      if (tmrRef.current) clearTimeout(tmrRef.current);
      tmrRef.current = setTimeout(() => { bufRef.current = ''; }, 120);
    };
    window.addEventListener('keydown', handle);
    return () => {
      window.removeEventListener('keydown', handle);
      if (tmrRef.current) clearTimeout(tmrRef.current);
    };
  }, [onScan, enabled]);
}

function QRModal({ part, onClose }) {
  const [dataUrl, setDataUrl] = useState(null);
  const text = [part.partNumber, part.name, part.brand].filter(Boolean).join(' | ');

  useEffect(() => {
    QRCode.toDataURL(text, { width: 256, margin: 2, color: { dark: '#000', light: '#fff' } })
      .then(setDataUrl);
  }, [text]);

  const print = () => {
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Part QR — ${part.name}</title>
    <style>body{font-family:Arial,sans-serif;text-align:center;padding:40px;max-width:320px;margin:0 auto}
    img{width:200px;height:200px;display:block;margin:0 auto 16px}
    .name{font-size:16px;font-weight:700;margin-bottom:4px}
    .sub{font-size:12px;color:#666;margin-bottom:4px}
    @media print{button{display:none}}
    </style></head><body>
    ${dataUrl ? `<img src="${dataUrl}" alt="QR"/>` : ''}
    <div class="name">${part.name}</div>
    ${part.partNumber ? `<div class="sub">${part.partNumber}</div>` : ''}
    ${part.brand ? `<div class="sub">${part.brand}</div>` : ''}
    <button onclick="window.print()" style="margin-top:20px;padding:10px 20px;background:#e8670a;color:#fff;border:none;border-radius:4px;font-size:14px;cursor:pointer">🖨️ Print</button>
    </body></html>`);
    w.document.close();
  };

  return (
    <div style={ovly} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...mdl, maxWidth: 320 }}>
        <div style={mdlH}>
          <span style={{ fontSize: 12, fontWeight: 700, color: TXT }}>Part QR Code</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: MUT, cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ ...mdlB, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          {dataUrl
            ? <img src={dataUrl} alt="QR" style={{ width: 200, height: 200, display: 'block', borderRadius: 4 }} />
            : <div style={{ width: 200, height: 200, background: '#111', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: MUT }}>Generating…</div>
          }
          <div style={{ fontSize: 11, fontWeight: 700, color: TXT, textAlign: 'center' }}>{part.name}</div>
          {part.partNumber && <div style={{ fontSize: 9, color: MUT, fontFamily: "'IBM Plex Mono',monospace" }}>{part.partNumber}</div>}
          {part.brand && <div style={{ fontSize: 9, color: MUT }}>{part.brand}</div>}
          <div style={{ fontSize: 8, color: MUT, textAlign: 'center', lineHeight: 1.5 }}>
            Scan encodes: {text}
          </div>
        </div>
        <div style={mdlF}>
          <button onClick={onClose} style={{ ...btnG, ...sm }}>Close</button>
          <button onClick={print} disabled={!dataUrl} style={{ ...btnA, ...sm }}>🖨️ Print</button>
        </div>
      </div>
    </div>
  );
}

export default function PartsTab({ machines }) {
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');
  const [scanActive, setScanActive] = useState(true); // scanner always listening
  const [lastScan, setLastScan]   = useState(null);   // { sku, found, ts }
  const [qrPart, setQrPart]       = useState(null);
  const skuInputRef               = useRef(null);

  const allParts = useMemo(() =>
    machines.flatMap(m =>
      (m.parts || []).map(p => ({ ...p, machineName: m.name, machineType: m.type, machineId: m.id }))
    ).sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0)),
  [machines]);

  const handleScan = useCallback((sku) => {
    const match = allParts.find(p =>
      (p.partNumber || '').toLowerCase() === sku.toLowerCase() ||
      (p.name || '').toLowerCase() === sku.toLowerCase()
    );
    setLastScan({ sku, found: !!match, machineName: match?.machineName, partName: match?.name, ts: Date.now() });
    setSearch(sku);
    setFilter('all');
  }, [allParts]);

  useBarcodeScanner(handleScan, scanActive);

  // Also handle Enter on the SKU input field
  const handleSkuKey = (e) => {
    if (e.key === 'Enter' && e.target.value.trim().length >= 1) {
      handleScan(e.target.value.trim());
    }
  };

  const filtered = useMemo(() => {
    let list = allParts;
    if (filter !== 'all') list = list.filter(p => (p.status || 'needed') === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.partNumber || '').toLowerCase().includes(q) ||
        p.machineName.toLowerCase().includes(q) ||
        (p.supplier || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [allParts, filter, search]);

  const counts = useMemo(() => {
    const c = { needed: 0, ordered: 0, fitted: 0 };
    allParts.forEach(p => { const s = p.status || 'needed'; c[s] = (c[s] || 0) + 1; });
    return c;
  }, [allParts]);

  const totalValue = filtered.reduce((s, p) => s + (parseFloat(p.unitCost) || 0) * (parseInt(p.qty) || 1), 0);

  // Clear scan feedback after 4s
  useEffect(() => {
    if (!lastScan) return;
    const t = setTimeout(() => setLastScan(null), 4000);
    return () => clearTimeout(t);
  }, [lastScan]);

  return (
    <div style={{ padding: 16, flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <SL t="Parts" />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {counts.needed > 0 && (
            <span style={{ fontSize: 8, color: '#e8870a', border: '1px solid #e8870a55', background: '#e8870a11', padding: '2px 6px', borderRadius: 2, fontWeight: 700, letterSpacing: '0.1em' }}>
              {counts.needed} NEEDED
            </span>
          )}
          {counts.ordered > 0 && (
            <span style={{ fontSize: 8, color: '#4a9eff', border: '1px solid #4a9eff55', background: '#4a9eff11', padding: '2px 6px', borderRadius: 2, fontWeight: 700, letterSpacing: '0.1em' }}>
              {counts.ordered} ORDERED
            </span>
          )}
        </div>
      </div>

      {/* SKU / Barcode search row */}
      <div style={{ background: '#0a0f0a', border: '1px solid ' + ACC + '33', borderRadius: 2, padding: '10px 12px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
            background: ACC,
            boxShadow: '0 0 6px ' + ACC,
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ fontSize: 9, color: ACC, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
            Scanner Active
          </span>
          <span style={{ fontSize: 8, color: MUT, marginLeft: 2 }}>— scan a barcode or type a SKU below</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            ref={skuInputRef}
            style={{ ...inp, flex: 1, fontSize: 13, letterSpacing: '0.08em' }}
            placeholder="Scan barcode / type SKU + Enter…"
            onKeyDown={handleSkuKey}
            onChange={e => {
              // Live search as user types (scanner pastes everything instantly)
              setSearch(e.target.value);
            }}
          />
          <button
            onClick={() => { if (skuInputRef.current) skuInputRef.current.focus(); }}
            style={{ ...btnG, ...sm, flexShrink: 0 }}
          >
            Focus
          </button>
        </div>
        {lastScan && (
          <div style={{
            marginTop: 8, fontSize: 9, padding: '5px 8px', borderRadius: 2,
            color: lastScan.found ? GRN : '#e8870a',
            background: lastScan.found ? GRN + '11' : '#e8870a11',
            border: '1px solid ' + (lastScan.found ? GRN : '#e8870a') + '44',
          }}>
            {lastScan.found
              ? `✓ Found: "${lastScan.partName}" on ${lastScan.machineName}`
              : `⚠ SKU "${lastScan.sku}" not found — add it from the Jobs tab`}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {[['all', 'All'], ['needed', 'Needed'], ['ordered', 'Ordered'], ['fitted', 'Fitted']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ ...btnG, ...sm, ...(filter === v ? { color: ACC, border: '1px solid ' + ACC } : {}) }}>
            {l}{v !== 'all' && counts[v] > 0 ? ` (${counts[v]})` : ''}
          </button>
        ))}
        {search && (
          <button onClick={() => setSearch('')} style={{ ...btnG, ...sm, color: MUT, fontSize: 8 }}>
            ✕ Clear search
          </button>
        )}
      </div>

      {allParts.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, lineHeight: 1.7, padding: '32px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 22, marginBottom: 10 }}>🔩</div>
          No parts tracked yet.<br />
          Add parts to machines on the Jobs tab.
        </div>
      )}

      {filtered.length > 0 && totalValue > 0 && (
        <div style={{ fontSize: 9, color: MUT, marginBottom: 10 }}>
          {filtered.length} part{filtered.length !== 1 ? 's' : ''}
          <span style={{ color: GRN }}> · ${totalValue.toFixed(2)} total value</span>
        </div>
      )}

      {filtered.map((p, i) => {
        const st    = PART_STATUS[p.status || 'needed'];
        const cost  = (parseFloat(p.unitCost) || 0) * (parseInt(p.qty) || 1);
        const isHit = lastScan?.found && (p.partNumber || '').toLowerCase() === lastScan.sku.toLowerCase();
        return (
          <div key={p.id || i} style={{
            background: isHit ? '#0a1a0a' : SURF,
            border: '1px solid ' + (isHit ? GRN + '88' : BRD),
            borderRadius: 2, padding: '10px 12px', marginBottom: 8,
            transition: 'border-color 0.3s',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{p.name}</span>
                  {p.partNumber && (
                    <span style={{ fontSize: 8, color: MUT, fontFamily: "'IBM Plex Mono',monospace", background: '#111', border: '1px solid #252525', padding: '1px 5px', borderRadius: 2 }}>
                      {p.partNumber}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 9, color: MUT, marginBottom: 4 }}>
                  {[p.brand, p.supplier, (parseInt(p.qty) || 1) > 1 ? `×${p.qty}` : null].filter(Boolean).join(' · ')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12 }}>{mIcon(p.machineType)}</span>
                  <span style={{ fontSize: 9, color: MUT }}>{p.machineName}</span>
                </div>
                {p.notes && <div style={{ fontSize: 9, color: MUT, marginTop: 4, lineHeight: 1.5 }}>{p.notes}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                <span style={{
                  fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: st.color, border: '1px solid ' + st.color + '55', background: st.color + '11',
                  padding: '2px 6px', borderRadius: 2,
                }}>
                  {st.label}
                </span>
                {cost > 0 && (
                  <span style={{ fontSize: 11, color: GRN, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>
                    ${cost.toFixed(2)}
                  </span>
                )}
                <button
                  onClick={() => setQrPart(p)}
                  title="Generate QR code for this part"
                  style={{ ...btnG, ...sm, fontSize: 8, padding: '2px 7px' }}
                >
                  QR
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && allParts.length > 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '24px 0' }}>
          No parts match — try clearing the search or changing the filter.
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 9, color: MUT, lineHeight: 1.7 }}>
        Add parts to machines on the Jobs tab. Scanner listens globally when no input is focused.
      </div>

      {qrPart && <QRModal part={qrPart} onClose={() => setQrPart(null)} />}
    </div>
  );
}
