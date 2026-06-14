import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { ACC, MUT, BRD, TXT, GRN, RED, SURF, inp, sel, txa, btnA, btnG, btnD, sm, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { FL, Empty } from '../ui/shared';
import { effectiveTier } from '../../lib/gates';
import UpgradeBanner from '../ui/UpgradeBanner';
import { getInventory, saveInventoryItem, deleteInventoryItem, adjustStock } from '../../lib/db/inventory';
import { getConsumables, upsertConsumable, deleteConsumable, adjustConsumableQty } from '../../lib/db/consumables';
import LoadoutSection from '../ui/LoadoutSection';
import PhotoAdder from '../ui/PhotoAdder';
import AssetTile from '../ui/AssetTile';
import {
  CONSUMABLE_CATEGORIES, CATEGORY_GROUPS, CATEGORY_ICON, CATEGORY_COLOR,
  CATEGORY_SPECS, CATEGORY_UNITS,
} from '../../lib/consumableTypes';
import {
  PART_CATEGORIES, PART_CATEGORY_GROUPS, PART_CATEGORY_ICON,
  PART_CATEGORY_COLOR, PART_CATEGORY_SPECS, PART_CATEGORY_UNITS,
} from '../../lib/partsTypes';

const ORANGE = '#e8870a';
const BLUE   = '#3a7bd5';

const FALLBACK_UNITS = { default: 'pcs', options: ['pcs', 'L', 'mL', 'kg', 'g', 'm', 'set', 'pair', 'box', 'roll', 'sheet', 'cartridge'] };

// ── Barcode scanner ───────────────────────────────────────────────────────────
function useBarcodeScanner(onScan) {
  const buf  = useRef('');
  const last = useRef(0);
  const tmr  = useRef(null);
  useEffect(() => {
    const handle = e => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const now = Date.now();
      if (e.key === 'Enter') {
        const b = buf.current.trim();
        if (b.length >= 2) onScan(b);
        buf.current = '';
        return;
      }
      if ((now - last.current) > 80 && buf.current.length > 0) buf.current = '';
      last.current = now;
      if (e.key.length === 1) buf.current += e.key;
      if (tmr.current) clearTimeout(tmr.current);
      tmr.current = setTimeout(() => { buf.current = ''; }, 120);
    };
    window.addEventListener('keydown', handle);
    return () => { window.removeEventListener('keydown', handle); clearTimeout(tmr.current); };
  }, [onScan]);
}

// ── Colour / badge helpers ────────────────────────────────────────────────────
function qtyColor(qty, minQty, maxQty) {
  if (qty === 0)                            return RED;
  if (minQty != null && qty < minQty)       return ORANGE;
  if (maxQty != null && qty > maxQty)       return BLUE;
  return GRN;
}
function qtyLabel(qty, minQty, maxQty) {
  if (qty === 0)                            return 'OUT';
  if (minQty != null && qty < minQty)       return 'LOW';
  if (maxQty != null && qty > maxQty)       return 'OVER';
  return null;
}

// ── Spec chips ────────────────────────────────────────────────────────────────
function SpecChips({ category, spec, typeConfig }) {
  const chips = ((typeConfig?.specs || CATEGORY_SPECS)[category] || []).filter(f => spec[f.key]);
  if (!chips.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
      {chips.map(f => (
        <span key={f.key} style={{ fontSize: 7, background: '#111', border: '1px solid #252525', borderRadius: 2, padding: '2px 6px', color: MUT }}>
          <span style={{ color: TXT + '80' }}>{f.label}: </span>{spec[f.key]}
        </span>
      ))}
    </div>
  );
}

// ── QR modal ─────────────────────────────────────────────────────────────────
function QRModal({ item, onClose }) {
  const [dataUrl, setDataUrl] = useState(null);
  const text = [item.partNumber, item.name, item.brand].filter(Boolean).join(' | ');
  useEffect(() => {
    QRCode.toDataURL(text || item.name, { width: 256, margin: 2, color: { dark: '#000', light: '#fff' } }).then(setDataUrl);
  }, [text, item.name]);
  const print = () => {
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>${item.name}</title>
    <style>body{font-family:Arial,sans-serif;text-align:center;padding:40px;max-width:320px;margin:0 auto}
    img{width:200px;height:200px;display:block;margin:0 auto 16px}
    .name{font-size:16px;font-weight:700;margin-bottom:4px}.sub{font-size:12px;color:#666;margin-bottom:4px}
    @media print{button{display:none}}</style></head><body>
    ${dataUrl ? `<img src="${dataUrl}" alt="QR"/>` : ''}
    <div class="name">${item.name}</div>
    ${item.partNumber ? `<div class="sub">${item.partNumber}</div>` : ''}
    ${item.brand ? `<div class="sub">${item.brand}</div>` : ''}
    <button onclick="window.print()" style="margin-top:20px;padding:10px 20px;background:#e8670a;color:#fff;border:none;border-radius:4px;font-size:14px;cursor:pointer">🖨️ Print</button>
    </body></html>`);
    w.document.close();
  };
  return (
    <div style={ovly} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...mdl, maxWidth: 320 }}>
        <div style={mdlH}>
          <span style={{ fontSize: 12, fontWeight: 700, color: TXT }}>QR — {item.name}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: MUT, cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ ...mdlB, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {dataUrl
            ? <img src={dataUrl} alt="QR" style={{ width: 200, height: 200, borderRadius: 4 }} />
            : <div style={{ width: 200, height: 200, background: '#111', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: MUT }}>Generating…</div>}
          <div style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{item.name}</div>
          {item.partNumber && <div style={{ fontSize: 9, color: MUT, fontFamily: "'IBM Plex Mono',monospace" }}>{item.partNumber}</div>}
          <div style={{ fontSize: 8, color: MUT, textAlign: 'center', lineHeight: 1.5 }}>Encodes: {text || item.name}</div>
        </div>
        <div style={mdlF}>
          <button onClick={onClose} style={{ ...btnG, ...sm }}>Close</button>
          <button onClick={print} disabled={!dataUrl} style={{ ...btnA, ...sm }}>🖨️ Print Label</button>
        </div>
      </div>
    </div>
  );
}

// ── Item form ─────────────────────────────────────────────────────────────────
const SORT_OPTS = [
  { k: 'name_az',  l: 'Name A → Z' },
  { k: 'name_za',  l: 'Name Z → A' },
  { k: 'category', l: 'Category' },
  { k: 'stock_lo', l: 'Stock Level (Low first)' },
  { k: 'newest',   l: 'Date Added (Newest)' },
  { k: 'oldest',   l: 'Date Added (Oldest)' },
];

const EMPTY_FORM = {
  name: '', category: '', brand: '', supplier: '', partNumber: '', location: '',
  quantity: '0', unit: 'pcs', buyPrice: '', sellPrice: '',
  minQuantity: '', maxQuantity: '', spec: {}, notes: '',
};

function ItemForm({ item, tableType, typeConfig, onSave, onCancel }) {
  const isEdit = !!item?.id;
  const initF = item?.id ? {
    name:        item.name        || '',
    category:    item.category    || '',
    brand:       item.brand       || '',
    supplier:    item.supplier    || '',
    partNumber:  item.partNumber  || '',
    location:    item.location    || '',
    quantity:    item.quantity    != null ? String(item.quantity) : '0',
    unit:        item.unit        || 'pcs',
    buyPrice:    item.buyPrice    != null ? String(item.buyPrice)  : '',
    sellPrice:   item.sellPrice   != null ? String(item.sellPrice) : '',
    minQuantity: item.minQuantity != null ? String(item.minQuantity) : '',
    maxQuantity: item.maxQuantity != null ? String(item.maxQuantity) : '',
    spec:        item.spec        || {},
    notes:       item.notes       || '',
  } : { ...EMPTY_FORM };

  const [f, setF]       = useState(initF);
  const [photos, setPhotos] = useState(item?.photos || []);
  const [saving, setSaving] = useState(false);
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  const fld = { background: '#0a0a0a', border: '1px solid #252525', color: TXT, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, padding: '6px 8px', borderRadius: 2, outline: 'none', boxSizing: 'border-box', width: '100%' };

  const tc = typeConfig || { categories: CONSUMABLE_CATEGORIES, specs: CATEGORY_SPECS, units: CATEGORY_UNITS };

  const onCategoryChange = cat => {
    const ud = (tc.units[cat] || FALLBACK_UNITS).default;
    setF(p => ({ ...p, category: cat, unit: ud, spec: {} }));
  };

  const margin = f.buyPrice && f.sellPrice
    ? (((parseFloat(f.sellPrice) - parseFloat(f.buyPrice)) / parseFloat(f.sellPrice)) * 100).toFixed(0)
    : null;

  const specFields  = tc.specs[f.category]  || [];
  const unitOptions = (tc.units[f.category] || FALLBACK_UNITS).options;
  const canSave     = f.name.trim() && !saving;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    await onSave({
      ...item,
      ...f,
      name:        f.name.trim(),
      quantity:    parseFloat(f.quantity) || 0,
      buyPrice:    f.buyPrice    !== '' ? parseFloat(f.buyPrice)    : null,
      sellPrice:   f.sellPrice   !== '' ? parseFloat(f.sellPrice)   : null,
      minQuantity: f.minQuantity !== '' ? parseFloat(f.minQuantity) : null,
      maxQuantity: f.maxQuantity !== '' ? parseFloat(f.maxQuantity) : null,
      photos,
    });
    setSaving(false);
  };

  const noun = tableType === 'part' ? 'Part' : 'Consumable';

  return (
    <div style={ovly} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={{ ...mdl, maxWidth: 560, maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={mdlH}>
          <b style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {isEdit ? `Edit ${noun}` : `Add ${noun}`}
          </b>
          <button style={{ ...btnG, ...sm }} onClick={onCancel}>✕</button>
        </div>
        <div style={{ ...mdlB, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <FL t="Category" />
            <select style={sel} value={f.category} onChange={e => onCategoryChange(e.target.value)}>
              <option value="">— no category —</option>
              {tc.categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <FL t="Name *" />
            <input style={fld} value={f.name} onChange={e => s('name', e.target.value)} placeholder="e.g. Air Filter" autoFocus />
          </div>
          <div>
            <FL t="Brand" />
            <input style={fld} value={f.brand} onChange={e => s('brand', e.target.value)} placeholder="e.g. Honda" />
          </div>
          <div>
            <FL t="Supplier" />
            <input style={fld} value={f.supplier} onChange={e => s('supplier', e.target.value)} placeholder="e.g. Repco" />
          </div>
          <div>
            <FL t="SKU / Part No." />
            <input style={fld} value={f.partNumber} onChange={e => s('partNumber', e.target.value)} placeholder="Scan or type…" />
          </div>
          <div>
            <FL t="Location / Bin" />
            <input style={fld} value={f.location} onChange={e => s('location', e.target.value)} placeholder="e.g. Shelf A2" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div>
              <FL t="Quantity" />
              <input style={fld} type="number" min="0" step="0.1" value={f.quantity} onChange={e => s('quantity', e.target.value)} />
            </div>
            <div>
              <FL t="Unit" />
              <select style={sel} value={f.unit} onChange={e => s('unit', e.target.value)}>
                {unitOptions.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div />
          <div>
            <FL t="Buy Price ($)" />
            <input style={fld} type="number" min="0" step="0.01" value={f.buyPrice} onChange={e => s('buyPrice', e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <FL t="Sell Price ($)" />
            <input style={fld} type="number" min="0" step="0.01" value={f.sellPrice} onChange={e => s('sellPrice', e.target.value)} placeholder="0.00" />
          </div>
          {margin !== null && (
            <div style={{ gridColumn: '1/-1', fontSize: 9, color: Number(margin) >= 0 ? GRN : RED, marginTop: -4 }}>
              Margin: {margin}% {Number(margin) >= 0 ? '↑' : '↓'}
            </div>
          )}
          <div>
            <FL t="Min par (reorder point)" />
            <input style={fld} type="number" min="0" step="0.1" value={f.minQuantity} onChange={e => s('minQuantity', e.target.value)} placeholder={`e.g. 2 ${f.unit}`} />
          </div>
          <div>
            <FL t="Max par (ceiling)" />
            <input style={fld} type="number" min="0" step="0.1" value={f.maxQuantity} onChange={e => s('maxQuantity', e.target.value)} placeholder={`e.g. 10 ${f.unit}`} />
          </div>
          {specFields.length > 0 && (
            <div style={{ gridColumn: '1/-1', borderTop: '1px solid #1e1e1e', paddingTop: 10 }}>
              <div style={{ fontSize: 7, color: ACC, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Specifications</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {specFields.map(field => (
                  <div key={field.key} style={field.key === 'fits' ? { gridColumn: '1/-1' } : {}}>
                    <FL t={field.label} />
                    {field.type === 'select' ? (
                      <select style={sel} value={f.spec[field.key] || ''} onChange={e => s('spec', { ...f.spec, [field.key]: e.target.value })}>
                        <option value="">— select —</option>
                        {field.options.map(opt => <option key={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input style={fld} type={field.type === 'number' ? 'number' : 'text'} value={f.spec[field.key] || ''} placeholder={field.placeholder} onChange={e => s('spec', { ...f.spec, [field.key]: e.target.value })} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ gridColumn: '1/-1' }}>
            <FL t="Notes" />
            <textarea style={{ ...txa, minHeight: 44 }} value={f.notes} onChange={e => s('notes', e.target.value)} placeholder="Storage location, supplier info, part number notes…" />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <PhotoAdder photos={photos} setPhotos={setPhotos} />
          </div>
        </div>
        <div style={mdlF}>
          <button style={btnG} onClick={onCancel}>Cancel</button>
          <button style={{ ...btnA, opacity: canSave ? 1 : 0.4 }} disabled={!canSave} onClick={save}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : `Add ${noun}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stock card ────────────────────────────────────────────────────────────────
function StockCard({ item, tableType, typeConfig, onEdit, onDelete, onQR, onQtyChange, onUpdate, isShared, usageStat }) {
  const [open, setOpen]     = useState(false);
  const [adjusting, setAdj] = useState(false);
  const [delta, setDelta]   = useState('');
  const [adjErr, setAdjErr] = useState('');
  const [setMode, setSetMode] = useState(false);
  const [setVal, setSetVal] = useState('');

  const tc2 = typeConfig || { icon: CATEGORY_ICON, color: CATEGORY_COLOR };
  const catColor = tc2.color[item.category] || MUT;
  const catIcon  = tc2.icon[item.category]  || (tableType === 'part' ? '🔩' : '📦');
  const qColor   = qtyColor(item.quantity, item.minQuantity, item.maxQuantity);
  const badge    = qtyLabel(item.quantity, item.minQuantity, item.maxQuantity);
  const margin   = item.buyPrice != null && item.sellPrice != null
    ? (((item.sellPrice - item.buyPrice) / item.sellPrice) * 100).toFixed(0) : null;

  const doAdjust = async sign => {
    const d = parseFloat(delta);
    if (!d || d <= 0) { setAdjErr('Enter a positive amount'); return; }
    setAdjErr('');
    await onQtyChange(item.id, sign * d);
    setDelta(''); setAdj(false);
  };

  const doSet = async () => {
    const nq = parseFloat(setVal);
    if (isNaN(nq) || nq < 0) return;
    await onQtyChange(item.id, nq - item.quantity);
    setSetVal(''); setSetMode(false);
  };

  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #252525', borderLeft: `3px solid ${catColor || qColor}`, borderRadius: 2, marginBottom: 5, overflow: 'hidden' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', cursor: 'pointer' }}>
        {item.photos?.[0]
          ? <img src={item.photos[0]} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 2, flexShrink: 0, border: '1px solid #252525' }} />
          : <span style={{ fontSize: 16, flexShrink: 0 }}>{catIcon}</span>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{item.name}</span>
            {badge && <span style={{ fontSize: 7, color: qColor, border: `1px solid ${qColor}55`, borderRadius: 2, padding: '1px 4px', letterSpacing: '0.1em', fontWeight: 700 }}>{badge}</span>}
            {item.partNumber && <span style={{ fontSize: 8, color: MUT, background: '#111', border: '1px solid #252525', padding: '1px 5px', borderRadius: 2, fontFamily: "'IBM Plex Mono',monospace" }}>{item.partNumber}</span>}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2, flexWrap: 'wrap' }}>
            {item.category && <span style={{ fontSize: 7, color: catColor || ACC, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{item.category}</span>}
            {item.brand && <span style={{ fontSize: 7, color: MUT }}>· {item.brand}</span>}
          </div>
          {!open && <SpecChips category={item.category} spec={item.spec || {}} typeConfig={typeConfig} />}
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: qColor, fontFamily: "'IBM Plex Mono',monospace" }}>{Number(item.quantity).toLocaleString()}</div>
          <div style={{ fontSize: 8, color: MUT }}>{item.unit || 'pcs'}</div>
        </div>
        <span style={{ fontSize: 9, color: MUT, flexShrink: 0, marginLeft: 2 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ padding: '0 12px 12px', borderTop: '1px solid #1a1a1a' }}>
          {item.photos?.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginTop: 10 }}>
              {item.photos.map((p, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={p} alt="" style={{ width: '100%', height: 72, objectFit: 'cover', borderRadius: 2, border: i === 0 ? `1px solid ${ACC}88` : '1px solid #252525', display: 'block' }} />
                  <button title={i === 0 ? 'Cover photo' : 'Set as cover'}
                    onClick={e => { e.stopPropagation(); if (i === 0 || !onUpdate) return; onUpdate({ ...item, photos: [p, ...item.photos.filter((_, j) => j !== i)] }); }}
                    style={{ position: 'absolute', top: 2, left: 2, background: i === 0 ? ACC : 'rgba(0,0,0,0.7)', border: 'none', borderRadius: 2, cursor: i === 0 ? 'default' : 'pointer', fontSize: 8, padding: '2px 4px', color: i === 0 ? '#000' : MUT, lineHeight: 1 }}>
                    {i === 0 ? '⭐' : '☆ Cover'}
                  </button>
                </div>
              ))}
            </div>
          )}
          <SpecChips category={item.category} spec={item.spec || {}} typeConfig={typeConfig} />

          {/* Stock */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 7, color: ACC, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Stock</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: qColor, fontFamily: "'IBM Plex Mono',monospace" }}>
                  {Number(item.quantity).toLocaleString()} {item.unit || 'pcs'}
                </div>
                {(item.minQuantity != null || item.maxQuantity != null) && (
                  <div style={{ fontSize: 8, color: MUT, marginTop: 1 }}>
                    {item.minQuantity != null && <span>Min {item.minQuantity}</span>}
                    {item.minQuantity != null && item.maxQuantity != null && <span style={{ margin: '0 4px' }}>·</span>}
                    {item.maxQuantity != null && <span>Max {item.maxQuantity}</span>}
                    <span style={{ marginLeft: 3 }}>{item.unit || 'pcs'}</span>
                  </div>
                )}
              </div>
              {!isShared && !adjusting && !setMode && (
                <div style={{ display: 'flex', gap: 5 }}>
                  <button onClick={() => onQtyChange(item.id, 1)} style={{ ...btnG, ...sm, fontSize: 9, color: GRN, border: '1px solid ' + GRN + '44' }}>+1</button>
                  <button onClick={() => { if (item.quantity > 0) onQtyChange(item.id, -1); }} disabled={item.quantity === 0} style={{ ...btnG, ...sm, fontSize: 9, color: item.quantity > 0 ? ORANGE : MUT, border: '1px solid ' + (item.quantity > 0 ? ORANGE + '44' : BRD), opacity: item.quantity === 0 ? 0.4 : 1 }}>−1</button>
                  <button onClick={() => setAdj(true)} style={{ ...btnG, ...sm, fontSize: 8 }}>± Adjust</button>
                  <button onClick={() => { setSetMode(true); setSetVal(String(item.quantity)); }} style={{ ...btnG, ...sm, fontSize: 8 }}>Set</button>
                </div>
              )}
            </div>
            {!isShared && adjusting && (
              <div style={{ marginTop: 8, background: '#0a0a0a', border: `1px solid ${ACC}33`, borderRadius: 2, padding: 10 }}>
                <div style={{ fontSize: 8, color: MUT, marginBottom: 6 }}>Amount to add or remove ({item.unit || 'pcs'})</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input style={{ ...inp, width: 80, fontSize: 11, textAlign: 'center' }} type="number" min="0" step="0.1" value={delta}
                    onChange={e => { setDelta(e.target.value); setAdjErr(''); }} placeholder="0" autoFocus />
                  <button onClick={() => doAdjust(1)}  style={{ ...btnA, ...sm, fontSize: 8 }}>+ Add</button>
                  <button onClick={() => doAdjust(-1)} style={{ ...btnG, ...sm, fontSize: 8 }}>− Use</button>
                  <button onClick={() => { setAdj(false); setDelta(''); setAdjErr(''); }} style={{ ...btnG, ...sm, fontSize: 8 }}>Cancel</button>
                </div>
                {adjErr && <div style={{ fontSize: 8, color: RED, marginTop: 4 }}>{adjErr}</div>}
              </div>
            )}
            {!isShared && setMode && (
              <div style={{ marginTop: 8, background: '#0a0a0a', border: `1px solid ${ACC}33`, borderRadius: 2, padding: 10 }}>
                <div style={{ fontSize: 8, color: MUT, marginBottom: 6 }}>Set exact quantity</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input style={{ ...inp, width: 80, fontSize: 14, textAlign: 'center' }} type="number" min="0" step="0.1" value={setVal} onChange={e => setSetVal(e.target.value)} autoFocus />
                  <button onClick={doSet} style={{ ...btnA, ...sm, fontSize: 8 }}>Set</button>
                  <button onClick={() => { setSetMode(false); setSetVal(''); }} style={{ ...btnG, ...sm, fontSize: 8 }}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Pricing + usage */}
          {(item.buyPrice != null || item.sellPrice != null || usageStat) && (
            <div style={{ marginTop: 10, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {item.buyPrice  != null && <span style={{ fontSize: 9, color: MUT }}>Cost <span style={{ color: TXT }}>${item.buyPrice.toFixed(2)}</span></span>}
              {item.sellPrice != null && <span style={{ fontSize: 9, color: MUT }}>Sell <span style={{ color: GRN }}>${item.sellPrice.toFixed(2)}</span></span>}
              {margin != null && <span style={{ fontSize: 9, color: Number(margin) >= 0 ? GRN : RED }}>{margin}% margin</span>}
              {usageStat?.used   > 0 && <span style={{ fontSize: 9, color: MUT }}>Used <span style={{ color: ACC }}>{usageStat.used}×</span></span>}
              {usageStat?.revenue > 0 && <span style={{ fontSize: 9, color: MUT }}>Revenue <span style={{ color: GRN }}>${usageStat.revenue.toFixed(0)}</span></span>}
            </div>
          )}

          {/* Location / supplier */}
          {(item.location || item.supplier) && (
            <div style={{ marginTop: 6, fontSize: 9, color: MUT }}>{[item.location, item.supplier].filter(Boolean).join(' · ')}</div>
          )}

          {item.notes && (
            <div style={{ marginTop: 10, fontSize: 10, color: MUT, lineHeight: 1.5, background: '#0a0a0a', padding: '6px 8px', borderRadius: 2, border: '1px solid #1a1a1a' }}>{item.notes}</div>
          )}

          {tableType === 'consumable' && (
            <LoadoutSection parentType="consumable" parentId={item.id} parentName={item.name} isShared={isShared} />
          )}

          {!isShared && (
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              <button onClick={onEdit}   style={{ ...btnG, ...sm }}>Edit</button>
              <button onClick={onQR}     style={{ ...btnG, ...sm }}>QR</button>
              <button onClick={onDelete} style={{ ...btnD, ...sm }}>Delete</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────
export default function StockItemTab({ tableType, label, machines, session, profile, company, onGoToBilling }) {
  const typeConfig = tableType === 'part' ? {
    categories: PART_CATEGORIES,
    groups:     PART_CATEGORY_GROUPS,
    icon:       PART_CATEGORY_ICON,
    color:      PART_CATEGORY_COLOR,
    specs:      PART_CATEGORY_SPECS,
    units:      PART_CATEGORY_UNITS,
  } : {
    categories: CONSUMABLE_CATEGORIES,
    groups:     CATEGORY_GROUPS,
    icon:       CATEGORY_ICON,
    color:      CATEGORY_COLOR,
    specs:      CATEGORY_SPECS,
    units:      CATEGORY_UNITS,
  };

  const userId = session?.user?.id;
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [formItem, setFormItem] = useState(null);
  const [qrItem, setQrItem]     = useState(null);
  const [search, setSearch]     = useState('');
  const [groupFilter, setGroupFilter] = useState(null);

  const [showSort, setShowSort]       = useState(false);
  const [sortBy, setSortBy]   = useState(() => localStorage.getItem(`${tableType}Sort`) || null);
  const [view, setView]       = useState(() => localStorage.getItem(`${tableType}View`) || 'list');
  const [cols, setCols]       = useState(() => parseInt(localStorage.getItem(`${tableType}Cols`) || '2'));
  const [tileOpen, setTileOpen] = useState(null);
  const [lastScan, setLastScan] = useState(null);

  const setViewP   = v => { setView(v);   localStorage.setItem(`${tableType}View`, v); };
  const setSortByP = v => { setSortBy(v); v ? localStorage.setItem(`${tableType}Sort`, v) : localStorage.removeItem(`${tableType}Sort`); };
  const setColsP   = c => { setCols(c);  localStorage.setItem(`${tableType}Cols`, String(c)); setViewP('grid'); };

  const isFree  = effectiveTier(profile, company) === 'free';
  const FREE_LIMIT = 10;
  const atLimit = isFree && items.length >= FREE_LIMIT;

  // ── Load ────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!userId) return;
    if (tableType === 'part') {
      const data = await getInventory(userId);
      setItems(data);
    } else {
      const data = await getConsumables();
      setItems(data);
    }
    setLoading(false);
  }, [userId, tableType]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  // ── Barcode scanner ─────────────────────────────────────────────────────────
  const handleScan = useCallback(sku => {
    const match = items.find(i => (i.partNumber || '').toLowerCase() === sku.toLowerCase());
    setLastScan({ sku, found: !!match, name: match?.name, ts: Date.now() });
    setSearch(sku);
    setGroupFilter(null);
  }, [items]);
  useBarcodeScanner(handleScan);
  useEffect(() => {
    if (!lastScan) return;
    const t = setTimeout(() => setLastScan(null), 4000);
    return () => clearTimeout(t);
  }, [lastScan]);

  // ── Save ────────────────────────────────────────────────────────────────────
  const save = async item => {
    if (tableType === 'part') {
      const updated = await saveInventoryItem(userId, item);
      setItems(updated);
    } else {
      const saved = await upsertConsumable({ ...item, companyId: company?.id || null });
      setItems(prev => {
        const idx = prev.findIndex(i => i.id === saved.id);
        return idx >= 0 ? prev.map(i => i.id === saved.id ? saved : i) : [saved, ...prev];
      });
    }
    setFormItem(null);
  };

  // ── Update (cover photo etc.) ───────────────────────────────────────────────
  const update = async item => {
    if (tableType === 'part') {
      const updated = await saveInventoryItem(userId, item);
      setItems(updated);
    } else {
      const saved = await upsertConsumable({ ...item, companyId: company?.id || null });
      setItems(prev => prev.map(i => i.id === saved.id ? saved : i));
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const remove = async item => {
    const noun = tableType === 'part' ? 'part' : 'consumable';
    if (!confirm(`Delete this ${noun}?`)) return;
    if (tableType === 'part') {
      const updated = await deleteInventoryItem(userId, item.id);
      setItems(updated);
    } else {
      await deleteConsumable(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
    }
  };

  // ── Qty change ──────────────────────────────────────────────────────────────
  const handleQtyChange = async (id, delta) => {
    if (tableType === 'part') {
      const updated = await adjustStock(userId, id, delta);
      setItems(updated);
    } else {
      const updatedItem = await adjustConsumableQty(id, delta);
      setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    }
  };

  // ── Usage stats from machines ───────────────────────────────────────────────
  const usageStats = useMemo(() => {
    const map = {};
    (machines || []).forEach(m => {
      (m.parts || []).forEach(p => {
        const refId = tableType === 'part' ? p.inventoryId : p.consumableId;
        if (!refId) return;
        if (!map[refId]) map[refId] = { used: 0, revenue: 0 };
        map[refId].used    += Number(p.qty) || 1;
        map[refId].revenue += (parseFloat(p.sellPrice) || 0) * (Number(p.qty) || 1);
      });
    });
    return map;
  }, [machines, tableType]);

  // ── Counts ──────────────────────────────────────────────────────────────────
  const lowCount = useMemo(() =>
    items.filter(i => i.minQuantity != null && i.quantity < i.minQuantity).length,
    [items]
  );
  const stockValue = useMemo(() =>
    items.reduce((s, i) => s + (i.buyPrice || 0) * (i.quantity || 0), 0),
    [items]
  );

  // ── Filter + sort ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = items;
    if (groupFilter) {
      const grp = typeConfig.groups.find(g => g.label === groupFilter);
      if (grp) r = r.filter(i => grp.categories.includes(i.category));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(i =>
        (i.name        || '').toLowerCase().includes(q) ||
        (i.category    || '').toLowerCase().includes(q) ||
        (i.brand       || '').toLowerCase().includes(q) ||
        (i.partNumber  || '').toLowerCase().includes(q) ||
        (i.supplier    || '').toLowerCase().includes(q)
      );
    }
    return r;
  }, [items, groupFilter, search]);

  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name_az')  return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name_za')  return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
      if (sortBy === 'stock_lo') return (a.quantity || 0) - (b.quantity || 0);
      if (sortBy === 'newest')   return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'oldest')   return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      return 0;
    });
  }, [filtered, sortBy]);

  const capped = isFree ? sorted.slice(0, FREE_LIMIT) : sorted;
  const hiddenCount = isFree ? Math.max(0, sorted.length - FREE_LIMIT) : 0;

  const icon = tableType === 'part' ? '🔩' : '📦';
  const noun = tableType === 'part' ? 'Part' : 'Consumable';

  // ── Low stock print reorder ─────────────────────────────────────────────────
  const lowItems = items.filter(i => {
    const qty = i.quantity || 0;
    const min = i.minQuantity || 0;
    return min > 0 ? qty <= min : qty === 0;
  });
  const printReorder = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Reorder List</title>
    <style>body{font-family:Arial,sans-serif;padding:32px;max-width:640px;margin:0 auto;font-size:13px}h1{font-size:18px;margin-bottom:16px}li{margin-bottom:8px;line-height:1.5}.dim{color:#777;font-size:11px}@media print{button{display:none}}</style></head>
    <body><h1>Reorder List — ${label}</h1><ul>${lowItems.map(i =>
      `<li><strong>${i.name}</strong>${i.partNumber ? ` <span class="dim">(${i.partNumber})</span>` : ''}<br><span class="dim">${[i.brand, i.supplier, `Stock: ${i.quantity || 0}${i.minQuantity != null ? ' / Min: ' + i.minQuantity : ''}`].filter(Boolean).join(' · ')}</span></li>`
    ).join('')}</ul><br><button onclick="window.print()">🖨 Print</button></body></html>`);
    w.document.close();
  };

  return (
    <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: TXT, letterSpacing: '0.06em' }}>{icon} {label}</div>
          <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
            {items.length} item{items.length !== 1 ? 's' : ''}
            {lowCount > 0 && <span style={{ color: ORANGE, marginLeft: 8 }}>· {lowCount} low stock</span>}
            {isFree && <span style={{ marginLeft: 8 }}>· {items.length}/{FREE_LIMIT} (free limit)</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {lowItems.length > 0 && (
            <button onClick={printReorder} style={{ fontSize: 8, color: ORANGE, border: '1px solid ' + ORANGE + '55', background: ORANGE + '11', padding: '2px 6px', borderRadius: 2, fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace" }}>
              {lowItems.length} LOW — Print Reorder
            </button>
          )}
          <button style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: 2, color: sortBy ? ACC : MUT, cursor: 'pointer', fontSize: 11, padding: '4px 6px' }} onClick={() => setShowSort(true)} title="Sort">⚙️</button>
          <button onClick={() => { if (view === 'list') { setColsP(2); } else if (cols < 4) { setColsP(cols + 1); } else { setViewP('list'); } }} style={{ ...btnG, ...sm, fontSize: 9, minWidth: 36 }}>
            {view === 'list' ? '☰' : `⊞${cols}`}
          </button>
          {!atLimit && (
            <button onClick={() => setFormItem({})} style={{ ...btnA, ...sm, fontSize: 8 }}>+ Add</button>
          )}
        </div>
      </div>

      {/* Summary row */}
      {items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[
            ['Items', items.length, TXT],
            ['In Stock', items.filter(i => (i.quantity || 0) > 0).length + ' / ' + items.length, GRN],
            ['Stock Value', stockValue > 0 ? '$' + stockValue.toFixed(0) : '—', ACC],
          ].map(([l, v, c]) => (
            <div key={l} style={{ background: SURF, border: '1px solid ' + BRD, borderTop: '2px solid ' + c, borderRadius: 2, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 8, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Group filter bar */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
        <button onClick={() => setGroupFilter(null)}
          style={{ fontSize: 8, letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 2, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", border: '1px solid ' + ACC + '55', background: !groupFilter ? ACC + '22' : 'transparent', color: !groupFilter ? ACC : MUT }}>
          All
        </button>
        {typeConfig.groups.map(g => (
          <button key={g.label} onClick={() => setGroupFilter(groupFilter === g.label ? null : g.label)}
            style={{ fontSize: 8, letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 2, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", border: '1px solid ' + ACC + '55', background: groupFilter === g.label ? ACC + '22' : 'transparent', color: groupFilter === g.label ? ACC : MUT }}>
            {g.label}
          </button>
        ))}
      </div>

      {/* Search */}
      {items.length > 4 && (
        <input style={{ ...inp, marginBottom: 10, fontSize: 11 }} placeholder={`Search ${label.toLowerCase()}…`}
          value={search} onChange={e => setSearch(e.target.value)} />
      )}

      {/* Barcode scan feedback */}
      {lastScan && (
        <div style={{ marginBottom: 10, fontSize: 9, padding: '5px 10px', borderRadius: 2, color: lastScan.found ? GRN : ORANGE, background: (lastScan.found ? GRN : ORANGE) + '11', border: '1px solid ' + (lastScan.found ? GRN : ORANGE) + '44' }}>
          {lastScan.found ? `✓ Found: "${lastScan.name}"` : `⚠ "${lastScan.sku}" not in ${label.toLowerCase()} — add it with + Add Custom`}
        </div>
      )}

      {isFree && items.length >= FREE_LIMIT && <UpgradeBanner text={`You're at the ${FREE_LIMIT}-${label.toLowerCase()} limit on the free plan.`} onUpgrade={onGoToBilling} marginBottom={12} />}

      {/* Loading / empty */}
      {loading && <div style={{ fontSize: 10, color: MUT, padding: '24px 0', textAlign: 'center' }}>Loading…</div>}
      {!loading && items.length === 0 && <Empty icon={icon} t={`No ${label.toLowerCase()} yet`} sub={`Track your ${label.toLowerCase()} — add items to monitor stock levels, pricing, and usage.`} />}
      {!loading && items.length > 0 && sorted.length === 0 && <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '24px 0' }}>No items match your filter.</div>}

      {/* Content — list or grid */}
      {view === 'grid' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
            {capped.map(item => (
              <AssetTile
                key={item.id}
                photo={item.photos?.[0]}
                icon={typeConfig.icon[item.category] || icon}
                accentColor={typeConfig.color[item.category] || ACC}
                name={item.name}
                sub={(item.category || '') + (item.brand ? ' · ' + item.brand : '')}
                badges={[{ l: (item.quantity || 0) + ' ' + (item.unit || 'pcs'), c: qtyColor(item.quantity, item.minQuantity, item.maxQuantity) }]}
                onClick={() => setTileOpen(item.id)}
              />
            ))}
          </div>
          {tileOpen && (() => {
            const item = capped.find(x => x.id === tileOpen);
            return item ? (
              <div style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 200, overflowY: 'auto' }}
                onClick={e => { if (e.target === e.currentTarget) setTileOpen(null); }}>
                <div style={{ maxWidth: 640, margin: '24px auto', padding: '0 8px' }}>
                  <StockCard
                    item={item} tableType={tableType} typeConfig={typeConfig} isShared={false}
                    usageStat={usageStats[item.id]}
                    onEdit={() => { setFormItem(item); setTileOpen(null); }}
                    onDelete={() => { remove(item); setTileOpen(null); }}
                    onQR={() => { setQrItem(item); setTileOpen(null); }}
                    onQtyChange={handleQtyChange}
                    onUpdate={update}
                  />
                  <button onClick={() => setTileOpen(null)} style={{ ...btnG, width: '100%', marginTop: 8, fontSize: 10 }}>Close</button>
                </div>
              </div>
            ) : null;
          })()}
        </>
      ) : (
        capped.map(item => (
          <StockCard
            key={item.id} item={item} tableType={tableType} typeConfig={typeConfig}
            isShared={false}
            usageStat={usageStats[item.id]}
            onEdit={() => setFormItem(item)}
            onDelete={() => remove(item)}
            onQR={() => setQrItem(item)}
            onQtyChange={handleQtyChange}
            onUpdate={update}
          />
        ))
      )}

      {hiddenCount > 0 && <UpgradeBanner text={`+${hiddenCount} more ${label.toLowerCase()} hidden — upgrade for unlimited`} onUpgrade={onGoToBilling} marginBottom={10} />}

      <div style={{ marginTop: 8, fontSize: 9, color: MUT, lineHeight: 1.7 }}>
        Stock is adjusted automatically when items are used on a job. Buy price = your cost, Sell price = what you charge.
      </div>

      {/* Sort modal */}
      {showSort && (
        <div style={ovly} onClick={() => setShowSort(false)}>
          <div style={{ ...mdl, maxHeight: '70vh' }} onClick={e => e.stopPropagation()}>
            <div style={mdlH}>
              <b style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sort {label}</b>
              <button style={{ ...btnG, ...sm }} onClick={() => setShowSort(false)}>✕</button>
            </div>
            <div style={{ ...mdlB, paddingTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #1a1a1a', cursor: 'pointer' }} onClick={() => setSortByP(null)}>
                <input type="radio" readOnly checked={sortBy === null} style={{ accentColor: ACC, width: 15, height: 15 }} />
                <span style={{ fontSize: 11, color: sortBy === null ? TXT : MUT, fontFamily: "'IBM Plex Mono',monospace" }}>Default order</span>
              </label>
              {SORT_OPTS.map(o => (
                <label key={o.k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #1a1a1a', cursor: 'pointer' }} onClick={() => setSortByP(o.k)}>
                  <input type="radio" readOnly checked={sortBy === o.k} style={{ accentColor: ACC, width: 15, height: 15 }} />
                  <span style={{ fontSize: 11, color: sortBy === o.k ? TXT : MUT, fontFamily: "'IBM Plex Mono',monospace" }}>{o.l}</span>
                </label>
              ))}
            </div>
            <div style={mdlF}>
              <button style={btnG} onClick={() => { setSortByP(null); setShowSort(false); }}>Reset</button>
              <button style={btnA} onClick={() => setShowSort(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Item form modal */}
      {formItem !== null && (
        <ItemForm item={formItem?.id ? formItem : formItem} tableType={tableType} typeConfig={typeConfig} onSave={save} onCancel={() => setFormItem(null)} />
      )}

      {/* QR modal */}
      {qrItem && <QRModal item={qrItem} onClose={() => setQrItem(null)} />}
    </div>
  );
}
