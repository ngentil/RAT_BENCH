import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, SURF, TXT, RED, btnA, btnG, inp, txa, col, dvdr } from '../../lib/styles';
import { createListing } from '../../lib/marketplace';
import { getInventory } from '../../lib/db/inventory';
import { getConsumables } from '../../lib/db/consumables';
import { getTools } from '../../lib/db/tools';
import { getEquipment } from '../../lib/db/equipment';
import MachineTile from '../machine/MachineTile';

// Parts/Consumables are fungible stock sold by the unit, so they need a
// quantity step; Machines/Tools/Equipment are one-of-a-kind physical items —
// a listing sells the whole thing, no quantity involved.
const KINDS = [
  { id: 'machine',    label: '📋 Machine',    sub: 'From your Garage' },
  { id: 'part',       label: '🔩 Part',       sub: 'Surplus stock' },
  { id: 'tool',       label: '🔧 Tool',       sub: 'A physical tool' },
  { id: 'consumable', label: '📦 Consumable', sub: 'Surplus stock' },
  { id: 'equipment',  label: '⚙️ Equipment',  sub: 'A physical unit' },
];
const STOCK_KINDS = new Set(['part', 'consumable']);

function nameOf(kind, item) {
  if (kind === 'machine') return item.name || [item.make, item.model].filter(Boolean).join(' ');
  if (kind === 'equipment') return item.name || [item.make, item.model].filter(Boolean).join(' ');
  return item.name;
}

function ItemRow({ kind, item, onClick }) {
  const available = STOCK_KINDS.has(kind) ? Math.max(0, (item.quantity || 0) - (item.reservedQty || 0)) : null;
  return (
    <div onClick={() => (available === null || available > 0) && onClick()}
      style={{
        background: SURF, border: '1px solid ' + BRD, borderRadius: 2, padding: '10px 12px', marginBottom: 6,
        cursor: available === 0 ? 'not-allowed' : 'pointer', opacity: available === 0 ? 0.45 : 1,
      }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{nameOf(kind, item)}</div>
      <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
        {[item.brand, item.category, item.model].filter(Boolean).join(' · ')}
      </div>
      {available !== null && (
        <div style={{ fontSize: 9, color: available > 0 ? ACC : RED, marginTop: 4 }}>
          {available > 0
            ? `${available} ${item.unit || 'pcs'} available to sell (${item.quantity} in stock${item.reservedQty ? `, ${item.reservedQty} reserved` : ''})`
            : `None available — all ${item.quantity} in stock reserved for your workshop`}
        </div>
      )}
    </div>
  );
}

function SellForm({ machines, profile, onCreated, onCancel }) {
  const [kind, setKind] = useState(null);
  const [items, setItems] = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const [item, setItem] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [qty, setQty] = useState('1');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!kind || kind === 'machine') return;
    setLoadingItems(true);
    const loaders = {
      part: () => getInventory(profile.id),
      consumable: getConsumables,
      // Already-sold tools/equipment are listed (and hidden) via the Sold
      // Items tab's Relist action, not a brand-new listing here.
      tool: () => getTools().then(ts => ts.filter(t => !t.soldAt)),
      equipment: () => getEquipment().then(es => es.filter(e => !e.soldAt)),
    };
    loaders[kind]().then(data => { setItems(data); setLoadingItems(false); });
  }, [kind, profile.id]);

  const pickItem = (it) => {
    setItem(it);
    setTitle(nameOf(kind, it) || '');
    if (STOCK_KINDS.has(kind)) setQty('1');
  };

  const available = item && STOCK_KINDS.has(kind) ? Math.max(0, (item.quantity || 0) - (item.reservedQty || 0)) : null;

  const submit = async () => {
    if (!title.trim()) { setError('Give the listing a title.'); return; }
    let quantity = null;
    if (STOCK_KINDS.has(kind)) {
      quantity = parseInt(qty, 10);
      if (!quantity || quantity < 1) { setError('Enter a quantity of at least 1.'); return; }
      if (quantity > available) { setError(`Only ${available} available to sell.`); return; }
    }
    setSaving(true); setError(null);
    try {
      const listing = await createListing(kind, item, {
        title: title.trim(),
        description: description.trim() || null,
        price: price === '' ? null : Number(price),
        location: location.trim() || null,
        quantity,
      }, profile.id);
      onCreated(listing);
    } catch (e) {
      setError(e.message || "Couldn't create the listing.");
    } finally {
      setSaving(false);
    }
  };

  // Step 0 — what are you selling?
  if (!kind) {
    return (
      <div>
        <div style={{ fontSize: 10, color: MUT, marginBottom: 12 }}>What are you selling?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 12 }}>
          {KINDS.map(k => (
            <div key={k.id} onClick={() => setKind(k.id)}
              style={{ background: SURF, border: '1px solid ' + BRD, borderRadius: 2, padding: '14px 10px', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TXT }}>{k.label}</div>
              <div style={{ fontSize: 8, color: MUT, marginTop: 3 }}>{k.sub}</div>
            </div>
          ))}
        </div>
        <button onClick={onCancel} style={btnG}>Cancel</button>
      </div>
    );
  }

  // Step 1 — pick the specific item
  if (!item) {
    return (
      <div>
        <div style={{ fontSize: 10, color: MUT, marginBottom: 12 }}>
          Which {KINDS.find(k => k.id === kind).label.replace(/^\S+\s/, '').toLowerCase()} are you selling?{' '}
          <span onClick={() => setKind(null)} style={{ color: ACC, cursor: 'pointer' }}>change</span>
        </div>
        {kind === 'machine' ? (
          machines.length === 0
            ? <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '24px 0' }}>No machines in your Garage yet.</div>
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, alignItems: 'start', marginBottom: 12 }}>
                {machines.map(m => <MachineTile key={m.id} machine={m} onClick={() => pickItem(m)} />)}
              </div>
            )
        ) : loadingItems ? (
          <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '24px 0' }}>Loading…</div>
        ) : !items?.length ? (
          <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '24px 0' }}>Nothing there yet.</div>
        ) : (
          <div style={{ marginBottom: 12 }}>
            {items.map(it => <ItemRow key={it.id} kind={kind} item={it} onClick={() => pickItem(it)} />)}
          </div>
        )}
        <button onClick={onCancel} style={btnG}>Cancel</button>
      </div>
    );
  }

  // Step 2 — listing details
  return (
    <div>
      <div style={{ fontSize: 10, color: MUT, marginBottom: 12 }}>
        Listing <span style={{ color: TXT }}>{nameOf(kind, item)}</span>{' '}
        <span onClick={() => setItem(null)} style={{ color: ACC, cursor: 'pointer' }}>change</span>
      </div>

      <div style={col}>
        <label style={{ fontSize: 9, color: MUT, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} style={inp} maxLength={120} />
      </div>

      {STOCK_KINDS.has(kind) && (
        <div style={col}>
          <label style={{ fontSize: 9, color: MUT, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quantity to sell</label>
          <input value={qty} onChange={e => setQty(e.target.value.replace(/[^0-9]/g, ''))} style={inp} inputMode="numeric" />
          <div style={{ fontSize: 9, color: available > 0 ? MUT : RED, marginTop: 4 }}>
            {available} {item.unit || 'pcs'} available to sell ({item.quantity} in stock{item.reservedQty ? `, ${item.reservedQty} reserved for your workshop` : ''})
          </div>
        </div>
      )}

      <div style={col}>
        <label style={{ fontSize: 9, color: MUT, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Price ($, optional)</label>
        <input value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9.]/g, ''))} style={inp} inputMode="decimal" placeholder="e.g. 250" />
      </div>

      <div style={col}>
        <label style={{ fontSize: 9, color: MUT, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Location (optional)</label>
        <input value={location} onChange={e => setLocation(e.target.value)} style={inp} placeholder="e.g. Brisbane, QLD" maxLength={80} />
      </div>

      <div style={col}>
        <label style={{ fontSize: 9, color: MUT, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description (optional)</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} style={txa} maxLength={4000} placeholder="Condition, known issues, what's included…" />
      </div>

      {error && <div style={{ fontSize: 10, color: RED, marginBottom: 10 }}>{error}</div>}

      <div style={dvdr} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button disabled={saving || (STOCK_KINDS.has(kind) && available <= 0)} onClick={submit} style={btnA}>{saving ? 'Publishing…' : 'Publish Listing'}</button>
        <button onClick={onCancel} style={btnG}>Cancel</button>
      </div>
    </div>
  );
}

export default SellForm;
