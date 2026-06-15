import React, { useState, useEffect, useMemo } from 'react';
import { ACC, MUT, BRD, TXT, GRN, RED, SURF, inp, sel, txa, btnA, btnG, btnD, sm, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import UpgradeBanner from '../ui/UpgradeBanner';
import { SL, FL, Empty } from '../ui/shared';
import PhotoAdder from '../ui/PhotoAdder';
import { effectiveTier, atAssetLimit, assetLimit } from '../../lib/gates';
import { getEquipment, upsertEquipment, deleteEquipmentItem } from '../../lib/db/equipment';
import { fmtDate } from '../../lib/helpers';
import LoadoutSection from '../ui/LoadoutSection';
import AssetTile from '../ui/AssetTile';

const EQUIPMENT_TYPES = ["Excavator","Loader","Skid Steer","Forklift","Compressor","Generator","Pressure Washer","Trailer","Tractor","Mower (Commercial)","Chainsaw","Chipper","Stump Grinder","Other"];
const STATUSES        = ["Active","Inactive","In Service","Project","Sold"];

const STATUS_COL = { Active: "#3d9e50", "In Service": "#e8870a", Inactive: "#5a5a5a", Project: "#3a7bd5", Sold: "#c94040" };

const EQUIP_SORT_OPTS = [
  { k: 'name_az', l: 'Name A → Z' },
  { k: 'name_za', l: 'Name Z → A' },
  { k: 'status',  l: 'Status' },
  { k: 'type',    l: 'Equipment Type' },
  { k: 'newest',  l: 'Date Added (Newest)' },
  { k: 'oldest',  l: 'Date Added (Oldest)' },
  { k: 'hours_hi',l: 'Hours (Highest)' },
];



const TYPE_ICONS = { Excavator:'⛏️', Loader:'🚜', 'Skid Steer':'🚜', Forklift:'🔧', Compressor:'💨', Generator:'⚡', 'Pressure Washer':'💧', Trailer:'🚛', Tractor:'🚜', 'Mower (Commercial)':'🌿', Chainsaw:'🪚', Chipper:'🌳', 'Stump Grinder':'🌱', Other:'⚙️' };

const EMPTY_FORM = {
  name: '', make: '', model: '', year: '', type: '',
  serialNo: '', hours: '', location: '', status: 'Active', notes: '', photos: [],
};

function EquipmentForm({ item, onSave, onCancel }) {
  const isEdit = !!item?.id;
  const [f, setF] = useState(item ? {
    name:     item.name     || '',
    make:     item.make     || '',
    model:    item.model    || '',
    year:     item.year     ? String(item.year) : '',
    type:     item.type     || '',
    serialNo: item.serialNo || '',
    hours:    item.hours    != null ? String(item.hours) : '',
    location: item.location || '',
    status:   item.status   || 'Active',
    notes:    item.notes    || '',
    photos:   item.photos   || [],
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const s = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    if (!f.name.trim()) return;
    setSaving(true);
    await onSave({ ...item, ...f, name: f.name.trim(), year: f.year ? parseInt(f.year) : null, hours: f.hours !== '' ? parseFloat(f.hours) : null });
    setSaving(false);
  };

  return (
    <div style={ovly} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={{ ...mdl, maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={mdlH}>
          <b style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {isEdit ? 'Edit Equipment' : 'Add Equipment'}
          </b>
          <button style={{ ...btnG, ...sm }} onClick={onCancel}>✕</button>
        </div>
        <div style={{ ...mdlB, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <FL t="Name *" />
            <input style={inp} value={f.name} onChange={e => s('name', e.target.value)} placeholder="e.g. Mini Excavator" autoFocus />
          </div>
          <div><FL t="Make" /><input style={inp} value={f.make} onChange={e => s('make', e.target.value)} placeholder="e.g. Kubota" /></div>
          <div><FL t="Model" /><input style={inp} value={f.model} onChange={e => s('model', e.target.value)} placeholder="e.g. U17" /></div>
          <div>
            <FL t="Type" />
            <select style={sel} value={f.type} onChange={e => s('type', e.target.value)}>
              <option value="">— select —</option>
              {EQUIPMENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><FL t="Year" /><input style={inp} type="number" min="1900" max="2099" value={f.year} onChange={e => s('year', e.target.value)} placeholder="e.g. 2021" /></div>
          <div><FL t="Serial / Asset No." /><input style={inp} value={f.serialNo} onChange={e => s('serialNo', e.target.value)} placeholder="e.g. KU17-00123" /></div>
          <div><FL t="Hours" /><input style={inp} type="number" min="0" step="0.1" value={f.hours} onChange={e => s('hours', e.target.value)} placeholder="0" /></div>
          <div><FL t="Location" /><input style={inp} value={f.location} onChange={e => s('location', e.target.value)} placeholder="e.g. Site 2, Yard" /></div>
          <div>
            <FL t="Status" />
            <select style={sel} value={f.status} onChange={e => s('status', e.target.value)}>
              {STATUSES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <FL t="Notes" />
            <textarea style={{ ...txa, minHeight: 50 }} value={f.notes} onChange={e => s('notes', e.target.value)} placeholder="e.g. Next service at 500 hrs, blade change overdue" />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <PhotoAdder photos={f.photos} setPhotos={ps => s('photos', typeof ps === 'function' ? ps(f.photos) : ps)} label="Photos" />
          </div>
        </div>
        <div style={mdlF}>
          <button style={btnG} onClick={onCancel}>Cancel</button>
          <button style={{ ...btnA, opacity: f.name.trim() && !saving ? 1 : 0.4 }} disabled={!f.name.trim() || saving} onClick={save}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Equipment'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EquipmentCard({ item, onEdit, onDelete, onUpdate, isShared }) {
  const [open, setOpen] = useState(false);
  const [addSvc, setAddSvc] = useState(false);
  const [svcForm, setSvcForm] = useState({ date: new Date().toISOString().slice(0, 10), notes: '', cost: '', hours: '' });
  const [photoIdx, setPhotoIdx] = useState(null);

  const statusColor = STATUS_COL[item.status] || MUT;

  const addServiceEntry = async () => {
    if (!svcForm.notes.trim()) return;
    const entry = { id: crypto.randomUUID(), date: svcForm.date, notes: svcForm.notes.trim(), cost: parseFloat(svcForm.cost) || 0, hours: svcForm.hours ? parseFloat(svcForm.hours) : null };
    await onUpdate({ ...item, serviceLog: [...(item.serviceLog || []), entry] });
    setAddSvc(false);
    setSvcForm({ date: new Date().toISOString().slice(0, 10), notes: '', cost: '', hours: '' });
  };

  const removeSvcEntry = async (id) => {
    if (!confirm('Remove this entry?')) return;
    await onUpdate({ ...item, serviceLog: (item.serviceLog || []).filter(e => e.id !== id) });
  };

  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #252525', borderLeft: '3px solid ' + (isShared ? ACC + '55' : statusColor), borderRadius: 2, marginBottom: 6 }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', cursor: 'pointer' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14 }}>{TYPE_ICONS[item.type] || '⚙️'}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{item.name}</span>
            {item.status && (
              <span style={{ fontSize: 7, color: statusColor, border: '1px solid ' + statusColor + '44', borderRadius: 2, padding: '1px 4px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
                {item.status}
              </span>
            )}
            {item.type && (
              <span style={{ fontSize: 7, color: ACC, border: '1px solid ' + ACC + '44', borderRadius: 2, padding: '1px 4px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
                {item.type}
              </span>
            )}
            {isShared && (
              <span style={{ fontSize: 7, color: ACC, border: '1px solid ' + ACC + '55', borderRadius: 2, padding: '1px 4px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
                Shared
              </span>
            )}
          </div>
          <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
            {[item.year, item.make, item.model].filter(Boolean).join(' ')}
            {item.serialNo && <span style={{ marginLeft: 6, color: ACC + '99' }}>{item.serialNo}</span>}
            {item.location && <span style={{ marginLeft: 6, color: MUT }}>· {item.location}</span>}
          </div>
        </div>
        {item.photos?.[0] && (
          <img src={item.photos[0]} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
        )}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {item.hours != null && (
            <div style={{ fontSize: 9, color: TXT, fontFamily: "'IBM Plex Mono',monospace" }}>
              {Number(item.hours).toLocaleString()} hrs
            </div>
          )}
          {item.serviceLog?.length > 0 && (
            <div style={{ fontSize: 7, color: MUT, marginTop: 1 }}>{item.serviceLog.length} svc</div>
          )}
        </div>
        <span style={{ fontSize: 9, color: MUT, flexShrink: 0, marginLeft: 4 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="card-expand" style={{ padding: '0 12px 12px', borderTop: '1px solid #1a1a1a' }}>
          {item.photos?.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginTop: 10 }}>
              {item.photos.map((p, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={p} alt="" onClick={() => setPhotoIdx(i)}
                    style={{ width: '100%', height: 72, objectFit: 'cover', borderRadius: 2, border: i === 0 ? '1px solid ' + ACC + '88' : '1px solid #252525', cursor: 'pointer', display: 'block' }} />
                  <button
                    title={i === 0 ? 'Cover photo' : 'Set as cover'}
                    onClick={e => { e.stopPropagation(); if (i === 0) return; const reordered = [p, ...item.photos.filter((_, j) => j !== i)]; onUpdate({ ...item, photos: reordered }); }}
                    style={{ position: 'absolute', top: 2, left: 2, background: i === 0 ? ACC : 'rgba(0,0,0,0.7)', border: 'none', borderRadius: 2, cursor: i === 0 ? 'default' : 'pointer', fontSize: 8, padding: '1px 3px', color: i === 0 ? '#000' : MUT, lineHeight: 1 }}>
                    {i === 0 ? '⭐' : '☆ Cover'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {item.notes && (
            <div style={{ marginTop: 8, fontSize: 10, color: MUT, lineHeight: 1.5, background: '#0a0a0a', padding: '6px 8px', borderRadius: 2, border: '1px solid #1a1a1a' }}>
              {item.notes}
            </div>
          )}

          {/* Service log */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 7, color: ACC, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
              Service Log {item.serviceLog?.length > 0 && `(${item.serviceLog.length})`}
            </div>
            {(item.serviceLog || []).map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0', borderBottom: '1px solid #1a1a1a', borderLeft: '2px solid ' + ACC + '33', paddingLeft: 10, marginLeft: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: ACC + '66', flexShrink: 0, marginTop: 3 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 8, color: MUT }}>
                    {fmtDate(e.date)}
                    {e.hours != null && <span style={{ marginLeft: 6, color: ACC + '88' }}>{e.hours} hrs</span>}
                  </div>
                  <div style={{ fontSize: 10, color: TXT, marginTop: 2, lineHeight: 1.4 }}>{e.notes}</div>
                  {e.cost > 0 && <div style={{ fontSize: 8, color: GRN, marginTop: 2 }}>${Number(e.cost).toFixed(2)}</div>}
                </div>
                {!isShared && <button onClick={() => removeSvcEntry(e.id)} style={{ background: 'none', border: 'none', color: MUT, cursor: 'pointer', fontSize: 11, padding: 0, lineHeight: 1 }}>✕</button>}
              </div>
            ))}
            {!isShared && (addSvc ? (
              <div style={{ background: '#0a0a0a', border: '1px solid ' + ACC + '44', borderRadius: 2, padding: 10, marginTop: 6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                  <div><FL t="Date" /><input style={inp} type="date" value={svcForm.date} onChange={e => setSvcForm(f => ({ ...f, date: e.target.value }))} /></div>
                  <div><FL t="Hours at service" /><input style={inp} type="number" min="0" step="0.1" value={svcForm.hours} onChange={e => setSvcForm(f => ({ ...f, hours: e.target.value }))} placeholder="0" /></div>
                  <div><FL t="Cost ($)" /><input style={inp} type="number" min="0" step="0.01" value={svcForm.cost} onChange={e => setSvcForm(f => ({ ...f, cost: e.target.value }))} placeholder="0.00" /></div>
                  <div style={{ gridColumn: '1/-1' }}><FL t="Notes *" /><textarea style={{ ...txa, minHeight: 40 }} value={svcForm.notes} onChange={e => setSvcForm(f => ({ ...f, notes: e.target.value }))} autoFocus /></div>
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button onClick={() => setAddSvc(false)} style={{ ...btnG, ...sm }}>Cancel</button>
                  <button onClick={addServiceEntry} disabled={!svcForm.notes.trim()} style={{ ...btnA, ...sm, opacity: svcForm.notes.trim() ? 1 : 0.4 }}>Add</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddSvc(true)} style={{ ...btnG, width: '100%', marginTop: 6, fontSize: 9 }}>+ Log Service</button>
            ))}
          </div>

          <LoadoutSection parentType="equipment" parentId={item.id} parentName={item.name} isShared={isShared} />

          {!isShared && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 12 }}>
              <button onClick={onEdit} style={{cursor:"pointer",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",padding:"9px 14px",borderRadius:6,fontFamily:"'IBM Plex Mono',monospace",boxShadow:"0 1px 0 rgba(255,255,255,0.08) inset",width:"100%",boxSizing:"border-box",background:"linear-gradient(180deg,#1a4d8f,#0f2d5c)",color:"#a8cff8",border:"1px solid #2a6bcc"}}>Edit Equipment</button>
              <button onClick={onDelete} style={{cursor:"pointer",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",padding:"9px 14px",borderRadius:6,fontFamily:"'IBM Plex Mono',monospace",boxShadow:"0 1px 0 rgba(255,255,255,0.08) inset",width:"100%",boxSizing:"border-box",background:"linear-gradient(180deg,#6a0f0f,#3c0707)",color:"#ff8080",border:"1px solid #cc2020"}}>Delete</button>
            </div>
          )}
        </div>
      )}

      {photoIdx !== null && (
        <div style={{ position: 'fixed', inset: 0, background: '#000d', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setPhotoIdx(null)}>
          <img src={item.photos[photoIdx]} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 2 }}
            onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

export default function EquipmentTab({ equipment, setEquipment, session, profile, company, onGoToBilling }) {
  const [loading, setLoading] = useState(!equipment?.length);
  const [err, setErr] = useState('');
  const [formItem, setFormItem] = useState(null);
  const [search, setSearch]    = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('equipmentSort') || null);
  const [view, setView] = useState(() => localStorage.getItem('equipmentView') || 'list');
  const [cols, setCols] = useState(() => parseInt(localStorage.getItem('equipmentCols') || '2'));
  const [tileOpen, setTileOpen] = useState(null);
  const userId = session?.user?.id;

  const setViewP = v => { setView(v); localStorage.setItem('equipmentView', v); };
  const setSortByP = v => { setSortBy(v); v ? localStorage.setItem('equipmentSort', v) : localStorage.removeItem('equipmentSort'); };
  const setColsP = c => { setCols(c); localStorage.setItem('equipmentCols', String(c)); setViewP('grid'); };

  const isFree  = effectiveTier(profile, company) === 'free';
  const limit   = assetLimit('equipment', profile, company);
  const atLimit = atAssetLimit('equipment', equipment?.length ?? 0, profile, company);

  useEffect(() => {
    setLoading(true);
    getEquipment().then(items => { setEquipment(items); setLoading(false); }).catch(() => { setErr('Failed to load equipment. Refresh to try again.'); setLoading(false); });
  }, [userId]);

  const activeTypes = useMemo(() => {
    const seen = new Set((equipment || []).map(e => e.type).filter(Boolean));
    return EQUIPMENT_TYPES.filter(t => seen.has(t));
  }, [equipment]);

  const filtered = useMemo(() => {
    let r = equipment || [];
    if (typeFilter) r = r.filter(e => e.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(e =>
        (e.name     || '').toLowerCase().includes(q) ||
        (e.make     || '').toLowerCase().includes(q) ||
        (e.model    || '').toLowerCase().includes(q) ||
        (e.serialNo || '').toLowerCase().includes(q) ||
        (e.location || '').toLowerCase().includes(q)
      );
    }
    return r;
  }, [equipment, search, typeFilter]);

  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name_az') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name_za') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'status') { const o = ['Active','In Service','Project','Inactive','Sold']; return o.indexOf(a.status||'Active') - o.indexOf(b.status||'Active'); }
      if (sortBy === 'type') return (a.type||'').localeCompare(b.type||'');
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'hours_hi') return (b.hours||0) - (a.hours||0);
      return 0;
    });
  }, [filtered, sortBy]);

  const save = async (item) => {
    const saved = await upsertEquipment(item);
    setEquipment(prev => {
      const idx = prev.findIndex(e => e.id === saved.id);
      return idx >= 0 ? prev.map(e => e.id === saved.id ? saved : e) : [saved, ...prev];
    });
    setFormItem(null);
  };

  const update = async (item) => {
    const saved = await upsertEquipment(item);
    setEquipment(prev => prev.map(e => e.id === saved.id ? saved : e));
  };

  const remove = async (id) => {
    if (!confirm('Delete this equipment?')) return;
    await deleteEquipmentItem(id);
    setEquipment(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div style={{ padding: 16, flex: 1 }}>
      {atLimit && <UpgradeBanner text={`You're at the ${limit}-item equipment limit on the free plan.`} onUpgrade={onGoToBilling} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SL t="Equipment" />
          <span style={{ fontSize: 8, color: MUT, letterSpacing: '0.06em' }}>
            {(equipment || []).length} item{(equipment || []).length !== 1 ? 's' : ''}
          </span>
          {isFree && <span style={{ fontSize: 8, color: atLimit ? RED : MUT, letterSpacing: '0.06em' }}>{(equipment || []).length}/{limit}</span>}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button style={{ ...btnG, color: sortBy ? ACC : MUT }} onClick={() => setShowSort(true)} title="Sort">⚙️</button>
          <button onClick={() => { if (view === 'list') { setColsP(2); } else if (cols < 4) { setColsP(cols + 1); } else { setViewP('list'); } }} style={{ ...btnG, minWidth: 36 }}>{view === 'list' ? '☰' : `⊞${cols}`}</button>
          <button
            onClick={() => setFormItem({})}
            disabled={atLimit}
            style={{ ...btnA, opacity: atLimit ? 0.4 : 1 }}
            title={atLimit ? `Upgrade to add more than ${limit} equipment items` : undefined}
          >
            + Add Equipment
          </button>
        </div>
      </div>

      {(equipment||[]).length > 0 && (
        <div style={{display:'flex',gap:16,marginBottom:10,paddingBottom:10,borderBottom:'1px solid #1a1a1a'}}>
          {[
            {label:'Active', value:(equipment||[]).filter(e=>e.status==='Active').length, col:GRN},
            {label:'In Service', value:(equipment||[]).filter(e=>e.status==='In Service').length, col:ACC},
            {label:'Total hrs', value:Math.round((equipment||[]).reduce((s,e)=>s+(e.hours||0),0)).toLocaleString(), col:TXT},
          ].filter(s=>Number(s.value)>0||s.label==='Total hrs').map(s=>(
            <div key={s.label}>
              <div style={{fontSize:9,color:MUT,letterSpacing:'0.1em',textTransform:'uppercase'}}>{s.label}</div>
              <div style={{fontSize:12,fontWeight:700,color:s.col,fontFamily:"'IBM Plex Mono',monospace"}}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {(equipment||[]).length > 0 && (
        <input style={{ ...inp, marginBottom: 8, fontSize: 11 }} placeholder="Search equipment…" value={search} onChange={e => setSearch(e.target.value)} />
      )}

      {activeTypes.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {activeTypes.map(t => (
            <button key={t} onClick={() => setTypeFilter(typeFilter === t ? null : t)}
              style={{ fontSize: 8, letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 2, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", border: '1px solid ' + ACC + '55', background: typeFilter === t ? ACC + '22' : 'transparent', color: typeFilter === t ? ACC : MUT }}>
              {t}
            </button>
          ))}
        </div>
      )}

      {err && <div style={{ fontSize: 10, color: RED, padding: '12px 0', textAlign: 'center' }}>{err}</div>}
      {loading && <div style={{ fontSize: 10, color: MUT, padding: '24px 0', textAlign: 'center' }}>Loading…</div>}

      {!loading && (equipment || []).length === 0 && (
        <Empty icon="⚙️" t="No equipment yet" sub="Track your equipment fleet — excavators, compressors, trailers, generators and more." />
      )}
      {!loading && (equipment || []).length > 0 && sorted.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '24px 0' }}>No equipment matches your filter.</div>
      )}

      {view === 'grid' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
            {sorted.map(item => (
              <AssetTile
                key={item.id}
                photo={item.photos?.[0]}
                icon="⚙️"
                accentColor={STATUS_COL[item.status] || MUT}
                name={item.name}
                sub={[item.make, item.model].filter(Boolean).join(' ') || item.type}
                badges={[
                  item.status && { l: item.status, c: STATUS_COL[item.status] || MUT },
                  item.hours != null && { l: item.hours + 'h', c: MUT },
                ].filter(Boolean)}
                onClick={() => setTileOpen(item.id)}
              />
            ))}
          </div>
          {tileOpen && (() => {
            const item = sorted.find(x => x.id === tileOpen);
            return item ? (
              <div style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 200, overflowY: 'auto' }}
                onClick={e => { if (e.target === e.currentTarget) setTileOpen(null); }}>
                <div style={{ maxWidth: 640, margin: '24px auto', padding: '0 8px' }}>
                  <EquipmentCard
                    item={item}
                    isShared={item.userId !== userId}
                    onEdit={() => { setFormItem(item); setTileOpen(null); }}
                    onDelete={() => { remove(item.id); setTileOpen(null); }}
                    onUpdate={update}
                  />
                  <button onClick={() => setTileOpen(null)} style={{ ...btnG, width: '100%', marginTop: 8, fontSize: 10 }}>Close</button>
                </div>
              </div>
            ) : null;
          })()}
        </>
      ) : (
        sorted.map(item => (
          <EquipmentCard
            key={item.id}
            item={item}
            isShared={item.userId !== userId}
            onEdit={() => setFormItem(item)}
            onDelete={() => remove(item.id)}
            onUpdate={update}
          />
        ))
      )}

      {showSort && (
        <div style={ovly} onClick={() => setShowSort(false)}>
          <div style={{ ...mdl, maxHeight: '70vh' }} onClick={e => e.stopPropagation()}>
            <div style={mdlH}>
              <b style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sort Equipment</b>
              <button style={{ ...btnG, ...sm }} onClick={() => setShowSort(false)}>✕</button>
            </div>
            <div style={{ ...mdlB, paddingTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #1a1a1a', cursor: 'pointer' }} onClick={() => setSortByP(null)}>
                <input type="radio" readOnly checked={sortBy === null} style={{ accentColor: ACC, width: 15, height: 15 }} />
                <span style={{ fontSize: 11, color: sortBy === null ? TXT : MUT, fontFamily: "'IBM Plex Mono',monospace" }}>Default order</span>
              </label>
              {EQUIP_SORT_OPTS.map(o => (
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

      {formItem !== null && (
        <EquipmentForm
          item={formItem?.id ? formItem : null}
          onSave={save}
          onCancel={() => setFormItem(null)}
        />
      )}
    </div>
  );
}
