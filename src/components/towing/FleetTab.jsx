import React, { useState, useEffect, useCallback } from 'react';
import { ACC, MUT, BRD, TXT, GRN, RED, SURF, inp, sel, txa, btnA, btnG, btnD, sm, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { FL } from '../ui/shared';
import { getDepots, upsertDepot, deleteDepot, getTrucks, upsertTruck, deleteTruck } from '../../lib/db/towing';

const ORANGE = '#e8870a';

const STATUS_OPTIONS = ['available', 'on job', 'unavailable'];

function statusColor(s) {
  if (s === 'available')   return GRN;
  if (s === 'on job')      return ORANGE;
  if (s === 'unavailable') return RED;
  return MUT;
}

function StatusBadge({ status }) {
  const c = statusColor(status);
  return (
    <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', padding: '1px 5px', border: `1px solid ${c}55`, borderRadius: 2, color: c, background: c + '15', textTransform: 'uppercase' }}>
      {status}
    </span>
  );
}

// ── Depot form modal ──────────────────────────────────────────────────────────
function DepotForm({ depot, onSave, onCancel }) {
  const [name,   setName]   = useState(depot?.name   || '');
  const [suburb, setSuburb] = useState(depot?.suburb || '');
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');
  const fld = { background: '#0a0a0a', border: '1px solid #252525', color: TXT, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, padding: '6px 8px', borderRadius: 2, outline: 'none', boxSizing: 'border-box', width: '100%' };

  const save = async () => {
    if (!name.trim()) { setErr('Name required'); return; }
    setSaving(true); setErr('');
    try { await onSave({ ...depot, name: name.trim(), suburb: suburb.trim() }); }
    catch (e) { setErr(e.message); }
    setSaving(false);
  };

  return (
    <div style={ovly} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={{ ...mdl, maxWidth: 400 }}>
        <div style={mdlH}>
          <b style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{depot?.id ? 'Edit Depot' : 'Add Depot'}</b>
          <button style={{ ...btnG, ...sm }} onClick={onCancel}>✕</button>
        </div>
        <div style={{ ...mdlB, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div><FL t="Depot Name *" /><input style={fld} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. North Depot" autoFocus /></div>
          <div><FL t="Suburb" /><input style={fld} value={suburb} onChange={e => setSuburb(e.target.value)} placeholder="e.g. Campbellfield" /></div>
          {err && <div style={{ fontSize: 9, color: RED }}>{err}</div>}
        </div>
        <div style={mdlF}>
          <button style={btnG} onClick={onCancel}>Cancel</button>
          <button style={{ ...btnA, opacity: saving || !name.trim() ? 0.4 : 1 }} disabled={saving || !name.trim()} onClick={save}>
            {saving ? 'Saving…' : depot?.id ? 'Save Changes' : 'Add Depot'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Truck form modal ──────────────────────────────────────────────────────────
function TruckForm({ truck, depots, onSave, onCancel }) {
  const [plate,   setPlate]   = useState(truck?.plate   || '');
  const [depotId, setDepotId] = useState(truck?.depot_id || (depots[0]?.id || ''));
  const [status,  setStatus]  = useState(truck?.status  || 'available');
  const [notes,   setNotes]   = useState(truck?.notes   || '');
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState('');
  const fld = { background: '#0a0a0a', border: '1px solid #252525', color: TXT, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, padding: '6px 8px', borderRadius: 2, outline: 'none', boxSizing: 'border-box', width: '100%' };

  const save = async () => {
    if (!plate.trim()) { setErr('Plate required'); return; }
    if (!depotId)      { setErr('Select a depot'); return; }
    setSaving(true); setErr('');
    try {
      await onSave({ ...truck, plate: plate.trim().toUpperCase(), depot_id: depotId, status, notes: notes.trim() || null });
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  return (
    <div style={ovly} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={{ ...mdl, maxWidth: 440 }}>
        <div style={mdlH}>
          <b style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{truck?.id ? 'Edit Truck' : 'Add Truck'}</b>
          <button style={{ ...btnG, ...sm }} onClick={onCancel}>✕</button>
        </div>
        <div style={{ ...mdlB, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <FL t="Plate *" />
            <input style={fld} value={plate} onChange={e => setPlate(e.target.value)} placeholder="TOW XXX" autoFocus />
          </div>
          <div>
            <FL t="Depot *" />
            <select style={{ ...sel, width: '100%' }} value={depotId} onChange={e => setDepotId(e.target.value)}>
              <option value="">— select depot —</option>
              {depots.map(d => <option key={d.id} value={d.id}>{d.name}{d.suburb ? ` — ${d.suburb}` : ''}</option>)}
            </select>
          </div>
          <div>
            <FL t="Status" />
            <select style={{ ...sel, width: '100%' }} value={status} onChange={e => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <FL t="Notes" />
            <textarea style={{ ...txa, minHeight: 56 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes…" />
          </div>
          {err && <div style={{ fontSize: 9, color: RED }}>{err}</div>}
        </div>
        <div style={mdlF}>
          <button style={btnG} onClick={onCancel}>Cancel</button>
          <button style={{ ...btnA, opacity: saving || !plate.trim() || !depotId ? 0.4 : 1 }} disabled={saving || !plate.trim() || !depotId} onClick={save}>
            {saving ? 'Saving…' : truck?.id ? 'Save Changes' : 'Add Truck'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Fleet tab ────────────────────────────────────────────────────────────
export default function FleetTab() {
  const [depots,  setDepots]  = useState([]);
  const [trucks,  setTrucks]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState('');

  const [depotForm, setDepotForm] = useState(null); // null | {} | depot obj
  const [truckForm, setTruckForm] = useState(null); // null | {} | truck obj

  const load = useCallback(async () => {
    try {
      const [ds, ts] = await Promise.all([getDepots(), getTrucks()]);
      setDepots(ds);
      setTrucks(ts);
      setErr('');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaveDepot = async (depot) => {
    const saved = await upsertDepot(depot);
    setDepots(prev => {
      const idx = prev.findIndex(d => d.id === saved.id);
      return idx >= 0 ? prev.map(d => d.id === saved.id ? saved : d) : [...prev, saved];
    });
    setDepotForm(null);
  };

  const handleDeleteDepot = async (depot) => {
    const hasTrucks = trucks.some(t => t.depot_id === depot.id);
    if (hasTrucks) { alert('Remove all trucks from this depot first.'); return; }
    if (!confirm(`Delete depot "${depot.name}"?`)) return;
    await deleteDepot(depot.id);
    setDepots(prev => prev.filter(d => d.id !== depot.id));
  };

  const handleSaveTruck = async (truck) => {
    const saved = await upsertTruck(truck);
    setTrucks(prev => {
      const idx = prev.findIndex(t => t.id === saved.id);
      return idx >= 0 ? prev.map(t => t.id === saved.id ? saved : t) : [...prev, saved];
    });
    setTruckForm(null);
  };

  const handleDeleteTruck = async (truck) => {
    if (!confirm(`Delete truck ${truck.plate}?`)) return;
    await deleteTruck(truck.id);
    setTrucks(prev => prev.filter(t => t.id !== truck.id));
  };

  const trucksByDepot = depots.map(d => ({
    depot: d,
    trucks: trucks.filter(t => t.depot_id === d.id),
  }));
  const unassigned = trucks.filter(t => !t.depot_id);

  const available = trucks.filter(t => t.status === 'available').length;
  const onJob     = trucks.filter(t => t.status === 'on job').length;

  return (
    <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: TXT, letterSpacing: '0.06em' }}>🚛 Fleet</div>
          <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
            {trucks.length} truck{trucks.length !== 1 ? 's' : ''}
            {available > 0 && <span style={{ color: GRN, marginLeft: 8 }}>· {available} available</span>}
            {onJob > 0     && <span style={{ color: ORANGE, marginLeft: 8 }}>· {onJob} on job</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setDepotForm({})} style={{ ...btnG, ...sm, fontSize: 8 }}>+ Depot</button>
          <button onClick={() => setTruckForm({})} style={{ ...btnA, ...sm, fontSize: 8 }} disabled={depots.length === 0} title={depots.length === 0 ? 'Add a depot first' : ''}>+ Truck</button>
        </div>
      </div>

      {err && <div style={{ fontSize: 9, color: RED, marginBottom: 12 }}>{err}</div>}

      {loading && <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '32px 0' }}>Loading fleet…</div>}

      {!loading && depots.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: '32px 0', lineHeight: 1.8 }}>
          No depots yet.<br />
          <button onClick={() => setDepotForm({})} style={{ ...btnA, ...sm, marginTop: 8 }}>Add First Depot</button>
        </div>
      )}

      {trucksByDepot.map(({ depot, trucks: dTrucks }) => (
        <div key={depot.id} style={{ marginBottom: 16 }}>
          {/* Depot header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, borderLeft: `2px solid ${ACC}`, paddingLeft: 8 }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, color: TXT }}>{depot.name}</span>
              {depot.suburb && <span style={{ fontSize: 8, color: MUT, marginLeft: 6 }}>{depot.suburb}</span>}
              <span style={{ fontSize: 8, color: MUT, marginLeft: 8 }}>{dTrucks.length} truck{dTrucks.length !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setDepotForm(depot)} style={{ ...btnG, ...sm, fontSize: 8 }}>Edit</button>
              <button onClick={() => handleDeleteDepot(depot)} style={{ ...btnD, ...sm, fontSize: 8 }}>Delete</button>
            </div>
          </div>

          {/* Trucks in this depot */}
          {dTrucks.length === 0 && (
            <div style={{ fontSize: 9, color: MUT, padding: '8px 10px', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 2, marginBottom: 4 }}>
              No trucks assigned to this depot.
            </div>
          )}
          {dTrucks.map(truck => (
            <TruckRow key={truck.id} truck={truck} onEdit={() => setTruckForm(truck)} onDelete={() => handleDeleteTruck(truck)} />
          ))}

          <button
            onClick={() => setTruckForm({ depot_id: depot.id })}
            style={{ fontSize: 8, color: MUT, border: '1px dashed #2a2a2a', borderRadius: 2, background: 'transparent', padding: '4px 10px', cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", marginTop: 4 }}>
            + Add truck to {depot.name}
          </button>
        </div>
      ))}

      {unassigned.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 8, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, borderLeft: '2px solid #444', paddingLeft: 8 }}>Unassigned ({unassigned.length})</div>
          {unassigned.map(truck => (
            <TruckRow key={truck.id} truck={truck} onEdit={() => setTruckForm(truck)} onDelete={() => handleDeleteTruck(truck)} />
          ))}
        </div>
      )}

      {depotForm !== null && (
        <DepotForm
          depot={depotForm?.id ? depotForm : undefined}
          onSave={handleSaveDepot}
          onCancel={() => setDepotForm(null)}
        />
      )}

      {truckForm !== null && (
        <TruckForm
          truck={truckForm?.id ? truckForm : truckForm}
          depots={depots}
          onSave={handleSaveTruck}
          onCancel={() => setTruckForm(null)}
        />
      )}
    </div>
  );
}

function TruckRow({ truck, onEdit, onDelete }) {
  const sc = statusColor(truck.status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#0d0d0d', border: '1px solid #252525', borderLeft: `3px solid ${sc}`, borderRadius: 2, marginBottom: 4 }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>🚛</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: TXT, fontFamily: "'IBM Plex Mono',monospace" }}>{truck.plate}</span>
          <StatusBadge status={truck.status} />
        </div>
        {truck.notes && <div style={{ fontSize: 8, color: MUT, marginTop: 2 }}>{truck.notes}</div>}
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button onClick={onEdit}   style={{ ...btnG, ...sm, fontSize: 8 }}>Edit</button>
        <button onClick={onDelete} style={{ ...btnD, ...sm, fontSize: 8 }}>Delete</button>
      </div>
    </div>
  );
}
