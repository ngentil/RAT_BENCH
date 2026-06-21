import React, { useState, useEffect, useMemo } from 'react';
import { ACC, MUT, BRD, TXT, GRN, RED, SURF, inp, sel, txa, btnA, btnG, btnD, sm, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import UpgradeBanner from '../ui/UpgradeBanner';
import { SL, FL, Empty } from '../ui/shared';
import { getPref, savePref } from '../../lib/db/preferences';
import PhotoAdder from '../ui/PhotoAdder';
import { effectiveTier, atAssetLimit, assetLimit } from '../../lib/gates';
import { getVehicles, upsertVehicle, deleteVehicle } from '../../lib/db/vehicles';
import { deletePhoto } from '../../lib/storage';
import { getAssignedTo, assignAsset, unassignAsset } from '../../lib/db/assetAssignments';
import { getCompanyMembers } from '../../lib/db/users';
import LoadoutSection from '../ui/LoadoutSection';
import ServiceModal from '../ui/ServiceModal';
import { fmtDT, fmtDate } from '../../lib/helpers';
import AssetTile from '../ui/AssetTile';

const VEHICLE_TYPES = ["Car","Truck","Van","SUV","Ute","Motorcycle","Scooter","Trailer","Boat","Other"];
const FUEL_TYPES    = ["Petrol","Diesel","LPG","Electric","Hybrid","Other"];
const STATUSES      = ["Active","Inactive","Project","Sold"];

const COND_COL = { Active: "#3d9e50", Project: "#e8870a", Inactive: "#5a5a5a", Sold: "#c94040" };

const TYPE_ICON = { Car: '🚗', Truck: '🚚', Van: '🚐', SUV: '🚙', Ute: '🛻', Motorcycle: '🏍️', Scooter: '🛵', Trailer: '🚛', Boat: '⛵', Other: '🚗' };

const VEHICLE_SORT_OPTS = [
  { k: 'name_az', l: 'Name A → Z' },
  { k: 'name_za', l: 'Name Z → A' },
  { k: 'status',  l: 'Status' },
  { k: 'type',    l: 'Vehicle Type' },
  { k: 'newest',  l: 'Date Added (Newest)' },
  { k: 'oldest',  l: 'Date Added (Oldest)' },
  { k: 'odo_hi',  l: 'Odometer (Highest)' },
  { k: 'odo_lo',  l: 'Odometer (Lowest)' },
];

function fmtOdo(n, units) {
  if (n == null) return null;
  return Number(n).toLocaleString() + (units === 'imperial' ? ' mi' : ' km');
}

const EMPTY_FORM = {
  name: '', make: '', model: '', year: '', type: '', rego: '', vin: '',
  colour: '', fuelType: '', odometer: '', status: 'Active', notes: '', photos: [],
};

function VehicleForm({ vehicle, onSave, onCancel, units }) {
  const isEdit = !!vehicle?.id;
  const [f, setF] = useState(vehicle ? {
    name:      vehicle.name      || '',
    make:      vehicle.make      || '',
    model:     vehicle.model     || '',
    year:      vehicle.year      ? String(vehicle.year) : '',
    type:      vehicle.type      || '',
    rego:      vehicle.rego      || '',
    vin:       vehicle.vin       || '',
    colour:    vehicle.colour    || '',
    fuelType:  vehicle.fuelType  || '',
    odometer:  vehicle.odometer  != null ? String(vehicle.odometer) : '',
    status:    vehicle.status    || 'Active',
    notes:     vehicle.notes     || '',
    photos:    vehicle.photos    || [],
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');

  const s = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    if (!f.name.trim()) return;
    setSaving(true);
    setSaveErr('');
    try {
      await onSave({ ...vehicle, ...f, name: f.name.trim(), year: f.year ? parseInt(f.year) : null, odometer: f.odometer !== '' ? parseFloat(f.odometer) : null });
    } catch (e) {
      setSaveErr(e?.message || 'Save failed. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={ovly} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={{ ...mdl, maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={mdlH}>
          <b style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
          </b>
          <button style={{ ...btnG, ...sm }} onClick={onCancel}>✕</button>
        </div>
        <div style={{ ...mdlB, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <FL t="Name *" />
            <input style={inp} value={f.name} onChange={e => s('name', e.target.value)} placeholder="e.g. Work Ute" autoFocus />
          </div>
          <div><FL t="Make" /><input style={inp} value={f.make} onChange={e => s('make', e.target.value)} placeholder="e.g. Toyota" /></div>
          <div><FL t="Model" /><input style={inp} value={f.model} onChange={e => s('model', e.target.value)} placeholder="e.g. HiLux" /></div>
          <div>
            <FL t="Type" />
            <select style={sel} value={f.type} onChange={e => s('type', e.target.value)}>
              <option value="">— select —</option>
              {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><FL t="Year" /><input style={inp} type="number" min="1900" max="2099" value={f.year} onChange={e => s('year', e.target.value)} placeholder="e.g. 2019" /></div>
          <div><FL t="Rego / Plate" /><input style={inp} value={f.rego} onChange={e => s('rego', e.target.value.toUpperCase())} placeholder="e.g. ABC123" /></div>
          <div><FL t="Colour" /><input style={inp} value={f.colour} onChange={e => s('colour', e.target.value)} placeholder="e.g. White" /></div>
          <div>
            <FL t="Fuel Type" />
            <select style={sel} value={f.fuelType} onChange={e => s('fuelType', e.target.value)}>
              <option value="">— select —</option>
              {FUEL_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><FL t={`Odometer (${units === 'imperial' ? 'mi' : 'km'})`} /><input style={inp} type="number" min="0" value={f.odometer} onChange={e => s('odometer', e.target.value)} placeholder="0" /></div>
          <div>
            <FL t="Status" />
            <select style={sel} value={f.status} onChange={e => s('status', e.target.value)}>
              {STATUSES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <FL t="VIN" />
            <input style={inp} value={f.vin} onChange={e => s('vin', e.target.value.toUpperCase())} placeholder="17-character VIN" maxLength={17} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <FL t="Notes" />
            <textarea style={{ ...txa, minHeight: 50 }} value={f.notes} onChange={e => s('notes', e.target.value)} placeholder="e.g. Lifted 50mm, bullbar, tow pack" />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <PhotoAdder photos={f.photos} setPhotos={ps => s('photos', typeof ps === 'function' ? ps(f.photos) : ps)} label="Photos" />
          </div>
        </div>
        {saveErr && (
          <div style={{ margin: '0 16px 8px', padding: '8px 10px', background: '#2a0a0a', border: '1px solid #c9404044', borderRadius: 2, fontSize: 9, color: RED, lineHeight: 1.5 }}>
            {saveErr}
          </div>
        )}
        <div style={mdlF}>
          <button style={btnG} onClick={onCancel}>Cancel</button>
          <button style={{ ...btnA, opacity: f.name.trim() && !saving ? 1 : 0.4 }} disabled={!f.name.trim() || saving} onClick={save}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Vehicle'}
          </button>
        </div>
      </div>
    </div>
  );
}

function VehicleMemberSection({ vehicle, company, isShared }) {
  const [members, setMembers] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!company?.id || !vehicle?.id) return;
    let alive = true;
    setLoading(true);
    Promise.all([
      getCompanyMembers(company.id),
      getAssignedTo('vehicle', vehicle.id),
    ]).then(([mems, asgn]) => {
      if (!alive) return;
      setMembers(mems);
      setAssigned(asgn.filter(a => a.child_type === 'member'));
      setLoading(false);
    }).catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [company?.id, vehicle?.id]);

  if (!company) return null;

  const assignedIds = new Set(assigned.map(a => a.child_id));
  const available = members.filter(m => !assignedIds.has(m.user_id));

  const doAssign = async (member) => {
    const name = member.profile?.display_name || member.profile?.username || member.user_id;
    const a = await assignAsset({
      parentType: 'vehicle', parentId: vehicle.id, parentName: vehicle.name,
      childType: 'member', childId: member.user_id, childName: name,
    });
    setAssigned(prev => [...prev, a]);
  };

  const doUnassign = async (id) => {
    await unassignAsset(id);
    setAssigned(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 7, color: ACC, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
          Org Members {assigned.length > 0 && `(${assigned.length})`}
        </div>
        {!isShared && !showPicker && (
          <button onClick={() => setShowPicker(true)} style={{ ...btnG, ...sm, fontSize: 8 }}>+ Assign</button>
        )}
        {!isShared && showPicker && (
          <button onClick={() => setShowPicker(false)} style={{ ...btnG, ...sm, fontSize: 8 }}>Done</button>
        )}
      </div>

      {loading && <div style={{ fontSize: 9, color: MUT }}>Loading…</div>}

      {!loading && assigned.length === 0 && !showPicker && (
        <div style={{ fontSize: 9, color: MUT, fontStyle: 'italic' }}>No members assigned.</div>
      )}

      {assigned.map(a => (
        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', borderBottom: '1px solid #1a1a1a' }}>
          <span style={{ fontSize: 13 }}>👤</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: TXT, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.child_name}</div>
            <div style={{ fontSize: 8, color: MUT }}>member</div>
          </div>
          {!isShared && (
            <button onClick={() => doUnassign(a.id)}
              style={{ background: 'none', border: 'none', color: MUT, cursor: 'pointer', fontSize: 11, padding: '0 2px', lineHeight: 1 }}>✕</button>
          )}
        </div>
      ))}

      {showPicker && (
        <div style={{ background: '#0a0a0a', border: '1px solid ' + ACC + '33', borderRadius: 2, padding: 10, marginTop: 6 }}>
          {members.length === 0
            ? <div style={{ fontSize: 9, color: MUT, fontStyle: 'italic' }}>No members yet.</div>
            : available.length === 0
              ? <div style={{ fontSize: 9, color: MUT, fontStyle: 'italic' }}>All members already assigned.</div>
              : available.map(m => {
                  const name = m.profile?.display_name || m.profile?.username || m.user_id;
                  return (
                    <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #181818' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, color: TXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          👤 {name}
                        </div>
                      </div>
                      <button onClick={() => doAssign(m)}
                        style={{ ...btnA, ...sm, fontSize: 8, flexShrink: 0, marginLeft: 8 }}>+ Add</button>
                    </div>
                  );
                })
          }
        </div>
      )}
    </div>
  );
}

function VehicleCard({ vehicle, onEdit, onDelete, onUpdate, isShared, units, company, isFree }) {
  const [open, setOpen] = useState(false);
  const [showSvc, setShowSvc] = useState(false);
  const [editSvc, setEditSvc] = useState(null);
  const [photoIdx, setPhotoIdx] = useState(null);

  const statusColor = COND_COL[vehicle.status] || MUT;

  const saveSvcEntry = async (entry) => {
    const log = vehicle.serviceLog || [];
    const updated = log.find(e => e.id === entry.id)
      ? log.map(e => e.id === entry.id ? entry : e)
      : [entry, ...log];
    try {
      await onUpdate({ ...vehicle, serviceLog: updated });
      setShowSvc(false);
      setEditSvc(null);
    } catch { alert("Save failed — check your connection."); }
  };

  const removeSvcEntry = async (id) => {
    if (!confirm('Remove this entry?')) return;
    const entry = (vehicle.serviceLog || []).find(e => e.id === id);
    if (entry?.plugPhoto) deletePhoto(entry.plugPhoto);
    (entry?.jobPhotos || []).forEach(url => deletePhoto(url));
    await onUpdate({ ...vehicle, serviceLog: (vehicle.serviceLog || []).filter(e => e.id !== id) });
  };

  return (
    <div style={{ background: '#0d0d0d', border: '1px solid ' + (isShared ? ACC + '55' : '#252525'), borderRadius: 2, marginBottom: 6 }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', cursor: 'pointer' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{vehicle.name}</span>
            {vehicle.status && (
              <span style={{ fontSize: 7, color: statusColor, border: '1px solid ' + statusColor + '44', borderRadius: 2, padding: '1px 4px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
                {vehicle.status}
              </span>
            )}
            {vehicle.type && (
              <span style={{ fontSize: 7, color: ACC, border: '1px solid ' + ACC + '44', borderRadius: 2, padding: '1px 4px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
                {vehicle.type}
              </span>
            )}
            {isShared && (
              <span style={{ fontSize: 7, color: ACC, border: '1px solid ' + ACC + '55', borderRadius: 2, padding: '1px 4px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
                Shared
              </span>
            )}
          </div>
          <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
            {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ')}
            {vehicle.rego && <span style={{ marginLeft: 6, color: ACC + '99' }}>{vehicle.rego}</span>}
            {vehicle.colour && <span style={{ marginLeft: 6, color: MUT }}>· {vehicle.colour}</span>}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {vehicle.odometer != null && (
            <div style={{ fontSize: 9, color: TXT, fontFamily: "'IBM Plex Mono',monospace" }}>
              {fmtOdo(vehicle.odometer, units)}
            </div>
          )}
          {vehicle.serviceLog?.length > 0 && (
            <div style={{ fontSize: 7, color: MUT, marginTop: 1 }}>{vehicle.serviceLog.length} svc</div>
          )}
        </div>
        {vehicle.photos?.[0] && (
          <img src={vehicle.photos[0]} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 2, flexShrink: 0, border: '1px solid #252525' }} />
        )}
        <span style={{ fontSize: 9, color: MUT, flexShrink: 0, marginLeft: 4 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="card-expand" style={{ padding: '0 12px 12px', borderTop: '1px solid #1a1a1a' }}>
          {vehicle.photos?.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginTop: 10 }}>
              {vehicle.photos.map((p, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={p} alt="" onClick={() => setPhotoIdx(i)}
                    style={{ width: '100%', height: 72, objectFit: 'cover', borderRadius: 2, border: i === 0 ? '1px solid ' + ACC + '88' : '1px solid #252525', cursor: 'pointer', display: 'block' }} />
                  <button
                    title={i === 0 ? 'Cover photo' : 'Set as cover'}
                    onClick={e => { e.stopPropagation(); if (i === 0) return; const reordered = [p, ...vehicle.photos.filter((_, j) => j !== i)]; onUpdate({ ...vehicle, photos: reordered }); }}
                    style={{ position: 'absolute', top: 2, left: 2, background: i === 0 ? ACC : 'rgba(0,0,0,0.7)', border: 'none', borderRadius: 2, cursor: i === 0 ? 'default' : 'pointer', fontSize: 8, padding: '1px 3px', color: i === 0 ? '#000' : MUT, lineHeight: 1 }}>
                    {i === 0 ? '⭐' : '☆ Cover'}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
            {vehicle.fuelType && <div><div style={{ fontSize: 7, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Fuel</div><div style={{ fontSize: 10, color: TXT }}>{vehicle.fuelType}</div></div>}
            {vehicle.vin && <div><div style={{ fontSize: 7, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>VIN</div><div style={{ fontSize: 9, color: TXT, fontFamily: "'IBM Plex Mono',monospace", wordBreak: 'break-all' }}>{vehicle.vin}</div></div>}
          </div>

          {vehicle.notes && (
            <div style={{ marginTop: 8, fontSize: 10, color: MUT, lineHeight: 1.5, background: '#0a0a0a', padding: '6px 8px', borderRadius: 2, border: '1px solid #1a1a1a' }}>
              {vehicle.notes}
            </div>
          )}

          {/* Service log */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ borderLeft: '2px solid ' + ACC, paddingLeft: 8 }}>
                <SL t={'Service History' + (vehicle.serviceLog?.length > 0 ? ` (${vehicle.serviceLog.length})` : '')} />
              </div>
              {!isShared && (
                <button style={{ ...btnA, ...sm }} onClick={e => { e.stopPropagation(); setShowSvc(true); }}>+ Log</button>
              )}
            </div>
            {(vehicle.serviceLog || []).length === 0 && (
              <div style={{ fontSize: 9, color: MUT, fontStyle: 'italic' }}>No entries yet.</div>
            )}
            {(vehicle.serviceLog || []).map(e => (
              <div key={e.id} style={{ position: 'relative', paddingLeft: 18, marginBottom: 14 }}>
                <div style={{ position: 'absolute', left: 0, top: 4, width: 7, height: 7, borderRadius: '50%', background: ACC, border: '2px solid #0d0d0d', boxSizing: 'border-box' }} />
                <div style={{ fontSize: 9, color: MUT, marginBottom: 2 }}>
                  {e.completedAt ? fmtDT(e.completedAt) : fmtDate(e.date)}
                </div>
                {e.types?.length > 0 && (
                  <div style={{ fontSize: 13, fontWeight: 700, color: TXT, marginBottom: 3 }}>{e.types.join('  ·  ')}</div>
                )}
                {e.notes && <div style={{ fontSize: 11, color: '#888', lineHeight: 1.5, marginBottom: 5 }}>{e.notes}</div>}
                {e.plugPhoto && (
                  <div style={{ marginBottom: 6 }}>
                    <FL t="Spark Plug" />
                    <img src={e.plugPhoto} alt="" style={{ borderRadius: 2, maxWidth: '100%', maxHeight: 130, objectFit: 'cover', border: '1px solid ' + BRD, display: 'block' }} />
                  </div>
                )}
                {e.jobPhotos?.length > 0 && (
                  <div style={{ marginBottom: 6 }}>
                    <FL t={'Job Photos (' + e.jobPhotos.length + ')'} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                      {e.jobPhotos.map((p, i) => (
                        <img key={i} src={p} alt="" style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 2, border: '1px solid ' + BRD, display: 'block' }} />
                      ))}
                    </div>
                  </div>
                )}
                {!isShared && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <button style={{ ...btnG, ...sm }} onClick={() => setEditSvc(e)}>Edit</button>
                    <button style={{ ...btnD, ...sm }} onClick={() => removeSvcEntry(e.id)}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <LoadoutSection parentType="vehicle" parentId={vehicle.id} parentName={vehicle.name} isShared={isShared} maxItems={isFree ? 5 : Infinity} />
          <VehicleMemberSection vehicle={vehicle} company={company} isShared={isShared} />


          {!isShared && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 12 }}>
              <button onClick={onEdit}   style={{...btnA,width:"100%",padding:"9px 14px"}}>Edit Vehicle</button>
              <button onClick={onDelete} style={{...btnA,width:"100%",padding:"9px 14px",background:RED}}>Delete</button>
            </div>
          )}
        </div>
      )}

      {(showSvc || editSvc) && (
        <ServiceModal
          machine={{ id: vehicle.id, name: vehicle.name, type: vehicle.type || 'Vehicle', strokeType: vehicle.fuelType === 'Diesel' ? 'Diesel' : vehicle.fuelType === 'Electric' ? 'Electric' : '' }}
          existing={editSvc}
          onSave={saveSvcEntry}
          onClose={() => { setShowSvc(false); setEditSvc(null); }}
        />
      )}

      {photoIdx !== null && (
        <div style={{ position: 'fixed', inset: 0, background: '#000d', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setPhotoIdx(null)}>
          <img src={vehicle.photos[photoIdx]} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 2 }}
            onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

export default function VehiclesTab({ vehicles, setVehicles, session, profile, company, onGoToBilling }) {
  const [loading, setLoading]   = useState(!vehicles?.length);
  const [formVehicle, setFormVehicle] = useState(null);
  const [search, setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState(() => getPref(profile, 'vehiclesSort', null));
  const [view, setView] = useState(() => getPref(profile, 'vehiclesView', 'list'));
  const [cols, setCols] = useState(() => getPref(profile, 'vehiclesCols', 2));
  const [tileOpen, setTileOpen] = useState(null);
  const userId = session?.user?.id;
  const units  = profile?.units || 'metric';

  const setViewP = v => { setView(v); savePref(profile?.id, 'vehiclesView', v); };
  const setSortByP = v => { setSortBy(v); savePref(profile?.id, 'vehiclesSort', v ?? null); };
  const setColsP = c => { setCols(c); savePref(profile?.id, 'vehiclesCols', c); setViewP('grid'); };

  const isFree  = effectiveTier(profile, company) === 'free';
  const limit   = assetLimit('vehicles', profile, company);
  const atLimit = atAssetLimit('vehicles', vehicles?.length ?? 0, profile, company);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getVehicles()
      .then(vs => { if (alive) { setVehicles(vs); setLoading(false); } })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [userId]);

  const totalOdo = useMemo(() => (vehicles || []).reduce((s, v) => s + (v.odometer || 0), 0), [vehicles]);

  const activeTypes = useMemo(() => {
    const seen = new Set((vehicles || []).map(v => v.type).filter(Boolean));
    return VEHICLE_TYPES.filter(t => seen.has(t));
  }, [vehicles]);

  const filtered = useMemo(() => {
    let r = vehicles || [];
    if (typeFilter) r = r.filter(v => v.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(v =>
        (v.name  || '').toLowerCase().includes(q) ||
        (v.make  || '').toLowerCase().includes(q) ||
        (v.model || '').toLowerCase().includes(q) ||
        (v.rego  || '').toLowerCase().includes(q)
      );
    }
    return r;
  }, [vehicles, search, typeFilter]);

  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name_az') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name_za') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'status') { const o = ['Active','Project','Inactive','Sold']; return o.indexOf(a.status) - o.indexOf(b.status); }
      if (sortBy === 'type') return (a.type || '').localeCompare(b.type || '');
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'odo_hi') return (b.odometer || 0) - (a.odometer || 0);
      if (sortBy === 'odo_lo') return (a.odometer || 0) - (b.odometer || 0);
      return 0;
    });
  }, [filtered, sortBy]);

  const save = async (vehicle) => {
    const saved = await upsertVehicle(vehicle);
    setVehicles(prev => {
      const idx = prev.findIndex(v => v.id === saved.id);
      return idx >= 0 ? prev.map(v => v.id === saved.id ? saved : v) : [saved, ...prev];
    });
    setFormVehicle(null);
  };

  const update = async (vehicle) => {
    try {
      const saved = await upsertVehicle(vehicle);
      setVehicles(prev => prev.map(v => v.id === saved.id ? saved : v));
    } catch (e) {
      console.error('Vehicle update failed:', e);
      throw e;
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this vehicle?')) return;
    const v = vehicles.find(x => x.id === id);
    (v?.photos || []).forEach(url => deletePhoto(url));
    await deleteVehicle(id);
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div style={{ padding: 16, flex: 1 }}>
      {atLimit && <UpgradeBanner text={`You're at the ${limit}-vehicle limit on the free plan.`} onUpgrade={onGoToBilling} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: TXT, letterSpacing: '0.06em' }}>🚗 Vehicles</div>
          <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
            {(vehicles || []).length} vehicle{(vehicles || []).length !== 1 ? 's' : ''}
            {isFree && <span style={{ marginLeft: 8, color: atLimit ? RED : MUT }}>· {(vehicles || []).length}/{limit} (free limit)</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button style={{ ...btnG, color: sortBy ? ACC : MUT, alignSelf: 'stretch' }} onClick={() => setShowSort(true)} title="Sort">⚙️</button>
          <button onClick={() => { if (view === 'list') { setColsP(2); } else if (cols < 4) { setColsP(cols + 1); } else { setViewP('list'); } }} style={{ ...btnG, minWidth: 36, alignSelf: 'stretch' }}>{view === 'list' ? '☰' : `⊞${cols}`}</button>
          <button
            onClick={() => setFormVehicle({})}
            disabled={atLimit}
            style={{ ...btnA, opacity: atLimit ? 0.4 : 1, minHeight: 44, display: 'flex', alignItems: 'center' }}
            title={atLimit ? `Upgrade to add more than ${limit} vehicles` : undefined}
          >
            + Add
          </button>
        </div>
      </div>

      {(vehicles || []).length > 4 && (
        <input style={{ ...inp, marginBottom: 8, fontSize: 11 }} placeholder="Search vehicles…" value={search} onChange={e => setSearch(e.target.value)} />
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

      {loading && <div style={{ fontSize: 10, color: MUT, padding: '24px 0', textAlign: 'center' }}>Loading…</div>}

      {!loading && (vehicles || []).length === 0 && (
        <Empty icon="🚗" t="No vehicles yet" sub="Track your fleet — cars, utes, motorbikes, trailers. Add service history and keep odometers up to date." />
      )}
      {!loading && (vehicles || []).length > 0 && sorted.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '24px 0' }}>No vehicles match your filter.</div>
      )}

      {view === 'grid' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
            {sorted.map(v => (
              <AssetTile
                key={v.id}
                photo={v.photos?.[0]}
                icon={TYPE_ICON[v.type] || '🚗'}
                accentColor={COND_COL[v.status] || MUT}
                name={v.name}
                sub={[v.year, v.make, v.model].filter(Boolean).join(' ')}
                badges={[
                  v.status && { l: v.status, c: COND_COL[v.status] || MUT },
                  v.type && { l: v.type, c: ACC },
                ].filter(Boolean)}
                onClick={() => setTileOpen(v.id)}
              />
            ))}
          </div>
          {tileOpen && (() => {
            const v = sorted.find(x => x.id === tileOpen);
            return v ? (
              <div style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 200, overflowY: 'auto' }}
                onClick={e => { if (e.target === e.currentTarget) setTileOpen(null); }}>
                <div style={{ maxWidth: 640, margin: '24px auto', padding: '0 8px' }}>
                  <VehicleCard
                    vehicle={v}
                    isShared={v.userId !== userId}
                    units={units}
                    company={company}
                    isFree={isFree}
                    onEdit={() => { setFormVehicle(v); setTileOpen(null); }}
                    onDelete={() => { remove(v.id); setTileOpen(null); }}
                    onUpdate={update}
                  />
                  <button onClick={() => setTileOpen(null)} style={{ ...btnG, width: '100%', marginTop: 8, fontSize: 10 }}>Close</button>
                </div>
              </div>
            ) : null;
          })()}
        </>
      ) : (
        sorted.map(v => (
          <VehicleCard
            key={v.id}
            vehicle={v}
            isShared={v.userId !== userId}
            units={units}
            company={company}
            isFree={isFree}
            onEdit={() => setFormVehicle(v)}
            onDelete={() => remove(v.id)}
            onUpdate={update}
          />
        ))
      )}

      {showSort && (
        <div style={ovly} onClick={() => setShowSort(false)}>
          <div style={{ ...mdl, maxHeight: '70vh' }} onClick={e => e.stopPropagation()}>
            <div style={mdlH}>
              <b style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sort Vehicles</b>
              <button style={{ ...btnG, ...sm }} onClick={() => setShowSort(false)}>✕</button>
            </div>
            <div style={{ ...mdlB, paddingTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #1a1a1a', cursor: 'pointer' }} onClick={() => setSortByP(null)}>
                <input type="radio" readOnly checked={sortBy === null} style={{ accentColor: ACC, width: 15, height: 15 }} />
                <span style={{ fontSize: 11, color: sortBy === null ? TXT : MUT, fontFamily: "'IBM Plex Mono',monospace" }}>Default order</span>
              </label>
              {VEHICLE_SORT_OPTS.map(o => (
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

      {formVehicle !== null && (
        <VehicleForm
          vehicle={formVehicle?.id ? formVehicle : null}
          onSave={save}
          onCancel={() => setFormVehicle(null)}
          units={units}
        />
      )}
    </div>
  );
}
