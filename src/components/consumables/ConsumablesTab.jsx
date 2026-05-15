import React, { useState, useEffect, useMemo } from 'react';
import { ACC, MUT, BRD, TXT, GRN, RED, SURF, inp, sel, txa, btnA, btnG, btnD, sm, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { FL, Empty } from '../ui/shared';
import { effectiveTier, atAssetLimit, assetLimit } from '../../lib/gates';
import { getConsumables, upsertConsumable, deleteConsumable, adjustConsumableQty } from '../../lib/db/consumables';
import LoadoutSection from '../ui/LoadoutSection';
import {
  CONSUMABLE_CATEGORIES, CATEGORY_GROUPS, CATEGORY_ICON, CATEGORY_COLOR,
  CATEGORY_SPECS, CATEGORY_UNITS, COMMON_CONSUMABLES,
} from '../../lib/consumableTypes';

const EMPTY_FORM = {
  name: '', category: '', brand: '', quantity: '0', unit: 'L',
  minQuantity: '', spec: {}, notes: '',
};

function qtyColor(qty, minQty) {
  if (qty === 0) return RED;
  if (minQty != null && qty < minQty) return '#e8870a';
  return GRN;
}

function qtyLabel(qty, minQty) {
  if (qty === 0) return 'OUT';
  if (minQty != null && qty < minQty) return 'LOW';
  return null;
}

function SpecChips({ category, spec }) {
  const fields = CATEGORY_SPECS[category] || [];
  const chips = fields.filter(f => spec[f.key]).map(f => ({ label: f.label, value: spec[f.key] }));
  if (!chips.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
      {chips.map(c => (
        <span key={c.label} style={{ fontSize: 7, background: '#111', border: '1px solid #252525', borderRadius: 2, padding: '2px 6px', color: MUT }}>
          <span style={{ color: TXT + '80' }}>{c.label}: </span>{c.value}
        </span>
      ))}
    </div>
  );
}

function ConsumableForm({ item, onSave, onCancel }) {
  const isEdit = !!item?.id;
  const [f, setF] = useState(item ? {
    name:        item.name        || '',
    category:    item.category    || '',
    brand:       item.brand       || '',
    quantity:    item.quantity    != null ? String(item.quantity) : '0',
    unit:        item.unit        || 'L',
    minQuantity: item.minQuantity != null ? String(item.minQuantity) : '',
    spec:        item.spec        || {},
    notes:       item.notes       || '',
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const s = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  const onCategoryChange = (cat) => {
    const unitDef = (CATEGORY_UNITS[cat] || CATEGORY_UNITS['Other']).default;
    setF(prev => ({ ...prev, category: cat, unit: unitDef, spec: {} }));
  };

  const save = async () => {
    if (!f.name.trim() || !f.category) return;
    setSaving(true);
    await onSave({
      ...item,
      ...f,
      name:        f.name.trim(),
      quantity:    parseFloat(f.quantity) || 0,
      minQuantity: f.minQuantity !== '' ? parseFloat(f.minQuantity) : null,
    });
    setSaving(false);
  };

  const specFields  = CATEGORY_SPECS[f.category]  || [];
  const unitOptions = (CATEGORY_UNITS[f.category] || CATEGORY_UNITS['Other']).options;
  const canSave     = f.name.trim() && f.category && !saving;

  return (
    <div style={ovly} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={{ ...mdl, maxWidth: 540, maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={mdlH}>
          <b style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {isEdit ? 'Edit Consumable' : 'Add Consumable'}
          </b>
          <button style={{ ...btnG, ...sm }} onClick={onCancel}>✕</button>
        </div>

        <div style={{ ...mdlB, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Category first — drives spec fields and default unit */}
          <div style={{ gridColumn: '1/-1' }}>
            <FL t="Category *" />
            <select style={sel} value={f.category} onChange={e => onCategoryChange(e.target.value)} autoFocus>
              <option value="">— select category —</option>
              {CONSUMABLE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <FL t="Name *" />
            <input style={inp} value={f.name} onChange={e => s('name', e.target.value)} placeholder="e.g. Engine Oil — 5W-30" />
          </div>

          <div>
            <FL t="Brand" />
            <input style={inp} value={f.brand} onChange={e => s('brand', e.target.value)} placeholder="e.g. Castrol, Shell" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div>
              <FL t="Quantity" />
              <input style={inp} type="number" min="0" step="0.1" value={f.quantity}
                onChange={e => s('quantity', e.target.value)} />
            </div>
            <div>
              <FL t="Unit" />
              <select style={sel} value={f.unit} onChange={e => s('unit', e.target.value)}>
                {unitOptions.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <FL t="Low-stock alert below" />
            <input style={inp} type="number" min="0" step="0.1" value={f.minQuantity}
              onChange={e => s('minQuantity', e.target.value)} placeholder={`e.g. 2 ${f.unit}`} />
          </div>

          {/* Dynamic spec fields */}
          {specFields.length > 0 && (
            <div style={{ gridColumn: '1/-1', borderTop: '1px solid #1e1e1e', paddingTop: 10 }}>
              <div style={{ fontSize: 7, color: ACC, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                Specifications
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {specFields.map(field => (
                  <div key={field.key} style={field.type === 'text' && field.key === 'fits' ? { gridColumn: '1/-1' } : {}}>
                    <FL t={field.label} />
                    {field.type === 'select' ? (
                      <select style={sel} value={f.spec[field.key] || ''}
                        onChange={e => s('spec', { ...f.spec, [field.key]: e.target.value })}>
                        <option value="">— select —</option>
                        {field.options.map(opt => <option key={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input style={inp} type={field.type === 'number' ? 'number' : 'text'}
                        value={f.spec[field.key] || ''}
                        placeholder={field.placeholder}
                        onChange={e => s('spec', { ...f.spec, [field.key]: e.target.value })} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ gridColumn: '1/-1' }}>
            <FL t="Notes" />
            <textarea style={{ ...txa, minHeight: 44 }} value={f.notes}
              onChange={e => s('notes', e.target.value)} placeholder="Storage location, supplier, part number…" />
          </div>
        </div>

        <div style={mdlF}>
          <button style={btnG} onClick={onCancel}>Cancel</button>
          <button style={{ ...btnA, opacity: canSave ? 1 : 0.4 }} disabled={!canSave} onClick={save}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Consumable'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConsumableCard({ item, onEdit, onDelete, onQtyChange, isShared }) {
  const [open, setOpen]       = useState(false);
  const [adjusting, setAdj]   = useState(false);
  const [delta, setDelta]     = useState('');
  const [adjErr, setAdjErr]   = useState('');

  const catColor = CATEGORY_COLOR[item.category] || MUT;
  const catIcon  = CATEGORY_ICON[item.category]  || '📦';
  const qColor   = qtyColor(item.quantity, item.minQuantity);
  const badge    = qtyLabel(item.quantity, item.minQuantity);

  const doAdjust = async (sign) => {
    const d = parseFloat(delta);
    if (!d || d <= 0) { setAdjErr('Enter a positive amount'); return; }
    setAdjErr('');
    const updated = await onQtyChange(item.id, sign * d);
    if (updated) { setDelta(''); setAdj(false); }
  };

  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #252525', borderLeft: `3px solid ${catColor}`, borderRadius: 2, marginBottom: 5, overflow: 'hidden' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', cursor: 'pointer' }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>{catIcon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{item.name}</span>
            {badge && (
              <span style={{ fontSize: 7, color: qColor, border: `1px solid ${qColor}55`, borderRadius: 2, padding: '1px 4px', letterSpacing: '0.1em', fontWeight: 700 }}>
                {badge}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 7, color: catColor, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{item.category}</span>
            {item.brand && <span style={{ fontSize: 7, color: MUT }}>· {item.brand}</span>}
          </div>
          {!open && <SpecChips category={item.category} spec={item.spec} />}
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: qColor, fontFamily: "'IBM Plex Mono',monospace" }}>
            {Number(item.quantity).toLocaleString()}
          </div>
          <div style={{ fontSize: 8, color: MUT }}>{item.unit}</div>
        </div>
        <span style={{ fontSize: 9, color: MUT, flexShrink: 0, marginLeft: 2 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ padding: '0 12px 12px', borderTop: '1px solid #1a1a1a' }}>

          {/* Specs */}
          <SpecChips category={item.category} spec={item.spec} />

          {/* Stock level */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 7, color: ACC, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Stock</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: qColor, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '-0.02em' }}>
                  {Number(item.quantity).toLocaleString()} {item.unit}
                </div>
                {item.minQuantity != null && (
                  <div style={{ fontSize: 8, color: MUT, marginTop: 1 }}>Alert below {item.minQuantity} {item.unit}</div>
                )}
              </div>
              {!isShared && !adjusting && (
                <button onClick={() => setAdj(true)} style={{ ...btnG, ...sm, fontSize: 8 }}>± Adjust</button>
              )}
            </div>

            {!isShared && adjusting && (
              <div style={{ marginTop: 8, background: '#0a0a0a', border: `1px solid ${ACC}33`, borderRadius: 2, padding: 10 }}>
                <div style={{ fontSize: 8, color: MUT, marginBottom: 6 }}>Amount to add or remove ({item.unit})</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input style={{ ...inp, width: 80, fontSize: 11, textAlign: 'center', fontFamily: "'IBM Plex Mono',monospace" }}
                    type="number" min="0" step="0.1" value={delta}
                    onChange={e => { setDelta(e.target.value); setAdjErr(''); }}
                    placeholder="0" autoFocus />
                  <button onClick={() => doAdjust(1)}  style={{ ...btnA, ...sm, fontSize: 8 }}>+ Add</button>
                  <button onClick={() => doAdjust(-1)} style={{ ...btnG, ...sm, fontSize: 8 }}>− Use</button>
                  <button onClick={() => { setAdj(false); setDelta(''); setAdjErr(''); }} style={{ ...btnG, ...sm, fontSize: 8 }}>Cancel</button>
                </div>
                {adjErr && <div style={{ fontSize: 8, color: RED, marginTop: 4 }}>{adjErr}</div>}
              </div>
            )}
          </div>

          {item.notes && (
            <div style={{ marginTop: 10, fontSize: 10, color: MUT, lineHeight: 1.5, background: '#0a0a0a', padding: '6px 8px', borderRadius: 2, border: '1px solid #1a1a1a' }}>
              {item.notes}
            </div>
          )}

          <LoadoutSection parentType="consumable" parentId={item.id} parentName={item.name} isShared={isShared} />

          {!isShared && (
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              <button onClick={onEdit}   style={{ ...btnG, ...sm }}>Edit</button>
              <button onClick={onDelete} style={{ ...btnD, ...sm }}>Delete</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ConsumablesTab({ session, profile, company, onGoToBilling }) {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [formItem, setFormItem]   = useState(null);
  const [search, setSearch]       = useState('');
  const [groupFilter, setGroupFilter] = useState(null);
  const [showPreset, setShowPreset]   = useState(false);
  const [presetVal, setPresetVal]     = useState('');

  const userId = session?.user?.id;
  const tier   = effectiveTier(profile, company);
  const isFree = tier === 'free';
  const limit  = assetLimit('consumables', profile, company);
  const atLimit = atAssetLimit('consumables', items.length, profile, company);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getConsumables().then(d => { setItems(d); setLoading(false); }).catch(() => setLoading(false));
  }, [userId]);

  const filtered = useMemo(() => {
    let r = items;
    if (groupFilter) {
      const grp = CATEGORY_GROUPS.find(g => g.label === groupFilter);
      if (grp) r = r.filter(i => grp.categories.includes(i.category));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(i =>
        (i.name     || '').toLowerCase().includes(q) ||
        (i.category || '').toLowerCase().includes(q) ||
        (i.brand    || '').toLowerCase().includes(q)
      );
    }
    return r;
  }, [items, groupFilter, search]);

  const lowStockCount = useMemo(() =>
    items.filter(i => i.minQuantity != null && i.quantity < i.minQuantity).length,
    [items]
  );

  const save = async (item) => {
    const saved = await upsertConsumable({ ...item, companyId: company?.id || null });
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === saved.id);
      return idx >= 0 ? prev.map(i => i.id === saved.id ? saved : i) : [saved, ...prev];
    });
    setFormItem(null);
  };

  const remove = async (id) => {
    if (!confirm('Delete this consumable?')) return;
    await deleteConsumable(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleQtyChange = async (id, delta) => {
    const updated = await adjustConsumableQty(id, delta);
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
    return updated;
  };

  const applyPreset = (val) => {
    if (!val) return;
    const preset = COMMON_CONSUMABLES[parseInt(val)];
    if (!preset) return;
    setPresetVal('');
    setShowPreset(false);
    setFormItem({ ...preset, quantity: 0, minQuantity: null, notes: '' });
  };

  // Group presets by category for the optgroup select
  const presetGroups = useMemo(() => {
    const map = {};
    COMMON_CONSUMABLES.forEach((p, i) => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push({ ...p, _idx: i });
    });
    return map;
  }, []);

  return (
    <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: TXT, letterSpacing: '0.06em' }}>📦 Consumables</div>
          <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
            {items.length} item{items.length !== 1 ? 's' : ''}
            {lowStockCount > 0 && <span style={{ color: '#e8870a', marginLeft: 8 }}>· {lowStockCount} low stock</span>}
            {isFree && <span style={{ marginLeft: 8 }}>· {items.length}/{limit} (free limit)</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {!atLimit && (
            <>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowPreset(p => !p)} style={{ ...btnG, ...sm, fontSize: 8 }}>▼ Quick Add</button>
                {showPreset && (
                  <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, zIndex: 50, background: SURF, border: '1px solid ' + BRD, borderRadius: 2, padding: 8, minWidth: 280, boxShadow: '0 4px 16px #0008' }}>
                    <div style={{ fontSize: 8, color: MUT, marginBottom: 6, letterSpacing: '0.08em' }}>SELECT A PRESET</div>
                    <select style={{ ...sel, fontSize: 9 }} value={presetVal}
                      onChange={e => applyPreset(e.target.value)}
                      size={1}>
                      <option value="">— choose a preset —</option>
                      {Object.entries(presetGroups).map(([cat, presets]) => (
                        <optgroup key={cat} label={cat}>
                          {presets.map(p => <option key={p._idx} value={p._idx}>{p.name}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <button onClick={() => setShowPreset(false)} style={{ ...btnG, ...sm, fontSize: 8, marginTop: 6, width: '100%' }}>Close</button>
                  </div>
                )}
              </div>
              <button onClick={() => setFormItem({})} style={{ ...btnA, ...sm, fontSize: 8 }}>+ Add Custom</button>
            </>
          )}
          {atLimit && (
            <div style={{ fontSize: 9, color: '#e8870a' }}>
              Limit reached ({limit}) —{' '}
              {onGoToBilling && <button onClick={onGoToBilling} style={{ background: 'none', border: 'none', color: ACC, cursor: 'pointer', fontSize: 9, textDecoration: 'underline', padding: 0 }}>upgrade</button>}
            </div>
          )}
        </div>
      </div>

      {/* Group filter bar */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
        <button onClick={() => setGroupFilter(null)}
          style={{ fontSize: 8, letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 2, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", border: '1px solid ' + ACC + '55', background: !groupFilter ? ACC + '22' : 'transparent', color: !groupFilter ? ACC : MUT }}>
          All
        </button>
        {CATEGORY_GROUPS.map(g => (
          <button key={g.label} onClick={() => setGroupFilter(groupFilter === g.label ? null : g.label)}
            style={{ fontSize: 8, letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 2, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", border: '1px solid ' + ACC + '55', background: groupFilter === g.label ? ACC + '22' : 'transparent', color: groupFilter === g.label ? ACC : MUT }}>
            {g.label}
          </button>
        ))}
      </div>

      {/* Search */}
      {items.length > 4 && (
        <input style={{ ...inp, marginBottom: 10, fontSize: 11 }} placeholder="Search consumables…"
          value={search} onChange={e => setSearch(e.target.value)} />
      )}

      {/* Content */}
      {loading && <div style={{ fontSize: 10, color: MUT, padding: '24px 0', textAlign: 'center' }}>Loading…</div>}

      {!loading && items.length === 0 && (
        <Empty icon="📦" t="No consumables yet"
          sub="Track your workshop supplies — oils, fuels, coolant, welding wire, abrasives and more. Use Quick Add for common presets." />
      )}

      {!loading && items.length > 0 && filtered.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '24px 0' }}>No consumables match your filter.</div>
      )}

      {filtered.map(item => (
        <ConsumableCard
          key={item.id}
          item={item}
          isShared={item.userId !== userId}
          onEdit={() => setFormItem(item)}
          onDelete={() => remove(item.id)}
          onQtyChange={handleQtyChange}
        />
      ))}

      {formItem !== null && (
        <ConsumableForm
          item={formItem?.id ? formItem : formItem}
          onSave={save}
          onCancel={() => setFormItem(null)}
        />
      )}
    </div>
  );
}
