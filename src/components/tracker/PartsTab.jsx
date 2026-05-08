import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { ACC, MUT, BRD, TXT, GRN, RED, SURF, inp, txa, btnA, btnG, btnD, sm, col, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { SL, FL } from '../ui/shared';
import { getInventory, saveInventoryItem, deleteInventoryItem, adjustStock } from '../../lib/db/inventory';

const ORANGE = '#e8870a';

// Detect barcode scanner: chars arrive < 80ms apart, ends with Enter
function useBarcodeScanner(onScan) {
  const bufRef  = useRef('');
  const lastRef = useRef(0);
  const tmrRef  = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const now  = Date.now();
      const gap  = now - lastRef.current;
      lastRef.current = now;
      if (e.key === 'Enter') {
        const buf = bufRef.current.trim();
        if (buf.length >= 2) onScan(buf);
        bufRef.current = '';
        return;
      }
      if (gap > 80 && bufRef.current.length > 0) bufRef.current = '';
      if (e.key.length === 1) bufRef.current += e.key;
      if (tmrRef.current) clearTimeout(tmrRef.current);
      tmrRef.current = setTimeout(() => { bufRef.current = ''; }, 120);
    };
    window.addEventListener('keydown', handle);
    return () => { window.removeEventListener('keydown', handle); clearTimeout(tmrRef.current); };
  }, [onScan]);
}

function QRModal({ item, onClose }) {
  const [dataUrl, setDataUrl] = useState(null);
  const text = [item.partNumber, item.name, item.brand].filter(Boolean).join(' | ');

  useEffect(() => {
    QRCode.toDataURL(text, { width: 256, margin: 2, color: { dark: '#000', light: '#fff' } }).then(setDataUrl);
  }, [text]);

  const print = () => {
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Part — ${item.name}</title>
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
          <span style={{ fontSize: 12, fontWeight: 700, color: TXT }}>Part QR Code</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: MUT, cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ ...mdlB, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {dataUrl
            ? <img src={dataUrl} alt="QR" style={{ width: 200, height: 200, borderRadius: 4 }} />
            : <div style={{ width: 200, height: 200, background: '#111', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: MUT }}>Generating…</div>
          }
          <div style={{ fontSize: 12, fontWeight: 700, color: TXT }}>{item.name}</div>
          {item.partNumber && <div style={{ fontSize: 9, color: MUT, fontFamily: "'IBM Plex Mono',monospace" }}>{item.partNumber}</div>}
          <div style={{ fontSize: 8, color: MUT, textAlign: 'center', lineHeight: 1.5 }}>Encodes: {text}</div>
        </div>
        <div style={mdlF}>
          <button onClick={onClose} style={{ ...btnG, ...sm }}>Close</button>
          <button onClick={print} disabled={!dataUrl} style={{ ...btnA, ...sm }}>🖨️ Print Label</button>
        </div>
      </div>
    </div>
  );
}

const EMPTY = { name:'', partNumber:'', brand:'', supplier:'', buyPrice:'', sellPrice:'', stockQty:'', minStock:'', location:'', notes:'' };

function ItemForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState({ ...EMPTY, ...initial });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const skuRef = useRef(null);

  const margin = f.buyPrice && f.sellPrice
    ? (((parseFloat(f.sellPrice) - parseFloat(f.buyPrice)) / parseFloat(f.sellPrice)) * 100).toFixed(0)
    : null;

  const fieldStyle = { background:'#0a0a0a', border:'1px solid #252525', color:TXT, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, padding:'6px 8px', borderRadius:2, outline:'none', boxSizing:'border-box', width:'100%' };
  const L = ({ t, scanner }) => (
    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:3 }}>
      <span style={{ fontSize:8, color:MUT, letterSpacing:'0.1em', textTransform:'uppercase' }}>{t}</span>
      {scanner && <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:7, color:ACC, letterSpacing:'0.08em' }}>
        <span style={{ width:5, height:5, borderRadius:'50%', background:ACC, display:'inline-block', boxShadow:'0 0 4px '+ACC, animation:'pulse 2s infinite', flexShrink:0 }}/>
        scan ready
      </span>}
    </div>
  );

  return (
    <div style={{ background:'#0a0f0a', border:'1px solid '+ACC+'44', borderRadius:2, padding:'14px', marginBottom:12 }}>
      <div style={{ fontSize:9, color:ACC, letterSpacing:'0.15em', textTransform:'uppercase', fontWeight:700, marginBottom:12 }}>
        {initial.id ? 'Edit Part' : 'New Part'}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <div style={{ gridColumn:'1/-1', ...col }}><L t="Part Name *"/><input style={fieldStyle} value={f.name} onChange={set('name')} placeholder="e.g. Air Filter" autoFocus/></div>
        <div style={col}>
          <L t="SKU / Part No." scanner/>
          <input ref={skuRef} style={fieldStyle} value={f.partNumber} onChange={set('partNumber')} placeholder="Focus here, then scan…"
            onFocus={e => e.target.select()}/>
        </div>
        <div style={col}><L t="Brand"/><input style={fieldStyle} value={f.brand} onChange={set('brand')} placeholder="e.g. Honda"/></div>
        <div style={col}><L t="Supplier"/><input style={fieldStyle} value={f.supplier} onChange={set('supplier')} placeholder="e.g. Repco"/></div>
        <div style={col}><L t="Location / Bin"/><input style={fieldStyle} value={f.location} onChange={set('location')} placeholder="e.g. Shelf A2"/></div>

        <div style={col}>
          <L t="Buy Price ($)"/>
          <input style={fieldStyle} type="number" min="0" step="0.01" value={f.buyPrice} onChange={set('buyPrice')} placeholder="0.00"/>
        </div>
        <div style={col}>
          <L t="Sell Price ($)"/>
          <input style={fieldStyle} type="number" min="0" step="0.01" value={f.sellPrice} onChange={set('sellPrice')} placeholder="0.00"/>
        </div>
        {margin !== null && (
          <div style={{ gridColumn:'1/-1', fontSize:9, color: Number(margin) >= 0 ? GRN : RED, marginTop:-4, marginBottom:4 }}>
            Margin: {margin}% {Number(margin) >= 0 ? '↑' : '↓'}
          </div>
        )}

        <div style={col}><L t="Stock Qty"/><input style={fieldStyle} type="number" min="0" step="1" value={f.stockQty} onChange={set('stockQty')} placeholder="0"/></div>
        <div style={col}><L t="Low Stock Alert (qty)"/><input style={fieldStyle} type="number" min="0" step="1" value={f.minStock} onChange={set('minStock')} placeholder="e.g. 2"/></div>

        <div style={{ gridColumn:'1/-1', ...col }}><L t="Notes"/><textarea style={{ ...fieldStyle, resize:'vertical', minHeight:40, lineHeight:1.5 }} value={f.notes} onChange={set('notes')} placeholder="Optional notes"/></div>
      </div>
      <div style={{ display:'flex', gap:8, marginTop:8, justifyContent:'flex-end' }}>
        <button onClick={onCancel} style={{ ...btnG, ...sm }}>Cancel</button>
        <button onClick={() => { if (f.name.trim()) onSave(f); }} style={{ ...btnA, ...sm }}>Save</button>
      </div>
    </div>
  );
}

export default function PartsTab({ machines, session }) {
  const userId = session?.user?.id;
  const [inv, setInv]       = useState(() => getInventory(userId));
  const [editing, setEditing] = useState(null);
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');
  const [lastScan, setLastScan] = useState(null);
  const [qrItem, setQrItem]   = useState(null);
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState('');

  const reload = () => setInv(getInventory(userId));

  const handleScan = useCallback((sku) => {
    const match = inv.find(i => (i.partNumber || '').toLowerCase() === sku.toLowerCase());
    setLastScan({ sku, found: !!match, name: match?.name, ts: Date.now() });
    setSearch(sku);
    setFilter('all');
  }, [inv]);

  useBarcodeScanner(handleScan);

  useEffect(() => {
    if (!lastScan) return;
    const t = setTimeout(() => setLastScan(null), 4000);
    return () => clearTimeout(t);
  }, [lastScan]);

  const save = (form) => {
    const updated = saveInventoryItem(userId, { ...form, id: editing?.id });
    setInv(updated);
    setEditing(null);
  };

  const del = (id) => {
    if (!confirm('Delete this part from inventory?')) return;
    setInv(deleteInventoryItem(userId, id));
  };

  const doAdjust = (delta) => {
    if (!adjustItem) return;
    setInv(adjustStock(userId, adjustItem.id, delta));
    setAdjustItem(null);
    setAdjustDelta('');
  };

  // Total stock value (cost basis)
  const stockValue = inv.reduce((s, i) => s + (parseFloat(i.buyPrice) || 0) * (Number(i.stockQty) || 0), 0);

  // Usage stats from machines
  const usageStats = useMemo(() => {
    const map = {};
    machines.forEach(m => {
      (m.parts || []).forEach(p => {
        if (p.inventoryId) {
          if (!map[p.inventoryId]) map[p.inventoryId] = { used: 0, revenue: 0 };
          map[p.inventoryId].used     += Number(p.qty) || 1;
          map[p.inventoryId].revenue  += (parseFloat(p.sellPrice) || 0) * (Number(p.qty) || 1);
        }
      });
    });
    return map;
  }, [machines]);

  const lowStock = inv.filter(i => {
    const qty = Number(i.stockQty) || 0;
    const min = Number(i.minStock) || 0;
    return min > 0 ? qty <= min : qty === 0;
  });

  const filtered = useMemo(() => {
    let list = inv;
    if (filter === 'low')    list = list.filter(i => { const q=Number(i.stockQty)||0; const m=Number(i.minStock)||0; return m>0?q<=m:q===0; });
    if (filter === 'instock') list = list.filter(i => (Number(i.stockQty)||0) > (Number(i.minStock)||0));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.partNumber||'').toLowerCase().includes(q) ||
        (i.brand||'').toLowerCase().includes(q) ||
        (i.supplier||'').toLowerCase().includes(q)
      );
    }
    return list;
  }, [inv, filter, search]);

  const lbl = { fontSize:9, color:ACC, letterSpacing:'0.15em', textTransform:'uppercase', fontWeight:700 };

  return (
    <div style={{ padding:16, flex:1, overflowY:'auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <SL t="Parts Inventory" />
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {lowStock.length > 0 && (
            <button
              onClick={() => {
                const txt = lowStock.map(i => `${i.name}${i.partNumber?' ('+i.partNumber+')':''}${i.brand?' — '+i.brand:''}${i.supplier?', '+i.supplier:''} | Stock: ${Number(i.stockQty)||0}${i.minStock?' / Min: '+i.minStock:''}`).join('\n');
                const w = window.open('', '_blank');
                if (!w) return;
                w.document.write(`<!DOCTYPE html><html><head><title>Reorder List</title><style>body{font-family:Arial,sans-serif;padding:32px;max-width:640px;margin:0 auto;font-size:13px}h1{font-size:18px;margin-bottom:16px}li{margin-bottom:8px;line-height:1.5}.dim{color:#777;font-size:11px}@media print{button{display:none}}</style></head><body><h1>Parts Reorder List</h1><ul>${lowStock.map(i=>`<li><strong>${i.name}</strong>${i.partNumber?` <span class="dim">(${i.partNumber})</span>`:''}<br><span class="dim">${[i.brand,i.supplier,`Stock: ${Number(i.stockQty)||0}`+(i.minStock?' / Min: '+i.minStock:'')].filter(Boolean).join(' · ')}</span></li>`).join('')}</ul><br><button onclick="window.print()">🖨 Print</button></body></html>`);
                w.document.close();
              }}
              style={{ fontSize:8, color:ORANGE, border:'1px solid '+ORANGE+'55', background:ORANGE+'11', padding:'2px 6px', borderRadius:2, fontWeight:700, letterSpacing:'0.1em', cursor:'pointer', fontFamily:"'IBM Plex Mono',monospace" }}
            >
              {lowStock.length} LOW — Print Reorder
            </button>
          )}
          {!editing && (
            <button onClick={() => setEditing({})} style={{ ...btnA, ...sm }}>+ Add Part</button>
          )}
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* New / edit form */}
      {editing !== null && (
        <ItemForm initial={editing} onSave={save} onCancel={() => setEditing(null)} />
      )}

      {/* Summary row */}
      {inv.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
          {[
            ['Items', inv.length],
            ['In Stock', inv.filter(i=>(Number(i.stockQty)||0)>0).length + ' / ' + inv.length],
            ['Stock Value', stockValue > 0 ? '$'+stockValue.toFixed(0) : '—'],
          ].map(([l,v]) => (
            <div key={l} style={{ background:SURF, border:'1px solid '+BRD, borderRadius:2, padding:'8px 10px', textAlign:'center' }}>
              <div style={{ fontSize:8, color:MUT, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:3 }}>{l}</div>
              <div style={{ fontSize:13, fontWeight:700, color:TXT, fontFamily:"'IBM Plex Mono',monospace" }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
        {[['all','All'], ['low','Low / Out'], ['instock','In Stock']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ ...btnG, ...sm, ...(filter===v ? { color:ACC, border:'1px solid '+ACC } : {}) }}>{l}</button>
        ))}
        {search && <button onClick={() => setSearch('')} style={{ ...btnG, ...sm, fontSize:8 }}>✕ Clear</button>}
      </div>
      {lastScan && (
        <div style={{ marginBottom:10, fontSize:9, padding:'5px 10px', borderRadius:2, color: lastScan.found ? GRN : ORANGE, background: (lastScan.found ? GRN : ORANGE)+'11', border:'1px solid '+(lastScan.found ? GRN : ORANGE)+'44' }}>
          {lastScan.found ? `✓ Found: "${lastScan.name}"` : `⚠ "${lastScan.sku}" not in inventory — add it with + Add Part`}
        </div>
      )}

      {inv.length === 0 && !editing && (
        <div style={{ fontSize:10, color:MUT, lineHeight:1.7, padding:'32px 0', textAlign:'center' }}>
          <div style={{ fontSize:22, marginBottom:10 }}>🔩</div>
          No parts in inventory yet.<br/>Add parts here, then use them against machines on the Jobs tab.
        </div>
      )}

      {filtered.map(item => {
        const qty      = Number(item.stockQty) || 0;
        const minQty   = Number(item.minStock) || 0;
        const isOut    = qty === 0;
        const isLow    = !isOut && minQty > 0 && qty <= minQty;
        const qtyColor = isOut ? RED : isLow ? ORANGE : GRN;
        const usage    = usageStats[item.id];
        const margin   = item.buyPrice && item.sellPrice
          ? (((parseFloat(item.sellPrice) - parseFloat(item.buyPrice)) / parseFloat(item.sellPrice)) * 100).toFixed(0)
          : null;

        return (
          <div key={item.id} style={{ background:SURF, border:'1px solid '+(isOut ? RED+'44' : isLow ? ORANGE+'44' : BRD), borderRadius:2, padding:'12px 14px', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
              {/* Stock level badge */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0, minWidth:36 }}>
                <div style={{ fontSize:18, fontWeight:900, color:qtyColor, fontFamily:"'IBM Plex Mono',monospace", lineHeight:1 }}>{qty}</div>
                <div style={{ fontSize:7, color:qtyColor, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                  {isOut ? 'OUT' : isLow ? 'LOW' : 'STOCK'}
                </div>
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:TXT }}>{item.name}</span>
                  {item.partNumber && (
                    <span style={{ fontSize:8, color:MUT, background:'#111', border:'1px solid #252525', padding:'1px 5px', borderRadius:2, fontFamily:"'IBM Plex Mono',monospace" }}>
                      {item.partNumber}
                    </span>
                  )}
                </div>
                <div style={{ fontSize:9, color:MUT, marginBottom:4 }}>
                  {[item.brand, item.supplier, item.location].filter(Boolean).join(' · ')}
                </div>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  {item.buyPrice  && <span style={{ fontSize:9, color:MUT }}>Cost <span style={{ color:TXT }}>${parseFloat(item.buyPrice).toFixed(2)}</span></span>}
                  {item.sellPrice && <span style={{ fontSize:9, color:MUT }}>Sell <span style={{ color:GRN }}>${parseFloat(item.sellPrice).toFixed(2)}</span></span>}
                  {margin !== null && <span style={{ fontSize:9, color: Number(margin)>=0 ? GRN : RED }}>{margin}% margin</span>}
                  {usage && <span style={{ fontSize:9, color:MUT }}>Used <span style={{ color:ACC }}>{usage.used}×</span></span>}
                  {usage?.revenue > 0 && <span style={{ fontSize:9, color:MUT }}>Revenue <span style={{ color:GRN }}>${usage.revenue.toFixed(0)}</span></span>}
                </div>
                {item.notes && <div style={{ fontSize:9, color:MUT, marginTop:4, lineHeight:1.5 }}>{item.notes}</div>}
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:5, flexShrink:0 }}>
                <div style={{ display:'flex', gap:5 }}>
                  <button onClick={() => setEditing(item)} style={{ ...btnG, ...sm, fontSize:8 }}>Edit</button>
                  <button onClick={() => setQrItem(item)} style={{ ...btnG, ...sm, fontSize:8 }}>QR</button>
                  <button onClick={() => del(item.id)} style={{ ...btnD }}>Del</button>
                </div>
                <div style={{ display:'flex', gap:5 }}>
                  <button
                    onClick={() => { setInv(adjustStock(userId, item.id, 1)); }}
                    style={{ ...btnG, ...sm, fontSize:10, padding:'2px 8px', color:GRN, border:'1px solid '+GRN+'44' }}
                    title="Add 1 to stock"
                  >+1</button>
                  <button
                    onClick={() => { if (qty > 0) setInv(adjustStock(userId, item.id, -1)); }}
                    disabled={qty === 0}
                    style={{ ...btnG, ...sm, fontSize:10, padding:'2px 8px', color: qty>0 ? ORANGE : MUT, border:'1px solid '+(qty>0 ? ORANGE+'44' : BRD), opacity: qty===0 ? 0.4 : 1 }}
                    title="Remove 1 from stock"
                  >−1</button>
                  <button
                    onClick={() => { setAdjustItem(item); setAdjustDelta(''); }}
                    style={{ ...btnG, ...sm, fontSize:8 }}
                    title="Set exact stock level"
                  >Set</button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && inv.length > 0 && (
        <div style={{ fontSize:10, color:MUT, textAlign:'center', padding:'24px 0' }}>No parts match.</div>
      )}

      <div style={{ marginTop:8, fontSize:9, color:MUT, lineHeight:1.7 }}>
        Stock is deducted automatically when parts are used against a machine on the Jobs tab. Buy price = your cost, Sell price = what you charge the customer.
      </div>

      {qrItem && <QRModal item={qrItem} onClose={() => setQrItem(null)} />}

      {/* Stock adjustment modal */}
      {adjustItem && (
        <div style={ovly} onClick={e => { if (e.target===e.currentTarget) setAdjustItem(null); }}>
          <div style={{ ...mdl, maxWidth:280 }}>
            <div style={mdlH}>
              <span style={{ fontSize:12, fontWeight:700, color:TXT }}>Set Stock — {adjustItem.name}</span>
              <button onClick={() => setAdjustItem(null)} style={{ background:'none', border:'none', color:MUT, cursor:'pointer', fontSize:16 }}>✕</button>
            </div>
            <div style={mdlB}>
              <div style={{ fontSize:10, color:MUT, marginBottom:8 }}>Current stock: {Number(adjustItem.stockQty)||0}</div>
              <FL t="New stock quantity" />
              <input
                style={{ ...inp, fontSize:18, textAlign:'center', fontFamily:"'IBM Plex Mono',monospace" }}
                type="number" min="0" step="1"
                value={adjustDelta}
                onChange={e => setAdjustDelta(e.target.value)}
                autoFocus
              />
            </div>
            <div style={mdlF}>
              <button onClick={() => setAdjustItem(null)} style={{ ...btnG, ...sm }}>Cancel</button>
              <button
                onClick={() => {
                  const newQty = parseInt(adjustDelta);
                  if (!isNaN(newQty) && newQty >= 0) {
                    const delta = newQty - (Number(adjustItem.stockQty) || 0);
                    setInv(adjustStock(userId, adjustItem.id, delta));
                  }
                  setAdjustItem(null);
                }}
                style={{ ...btnA, ...sm }}
              >
                Set Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
