import React, { useState, useEffect, useMemo } from 'react';
import { ACC, MUT, TXT, inp, btnA, btnG, sm } from '../../lib/styles';
import { getAssignedTo, getAssignedIn, assignAsset, unassignAsset } from '../../lib/db/assetAssignments';
import { getVehicles } from '../../lib/db/vehicles';
import { getTools } from '../../lib/db/tools';
import { getEquipment } from '../../lib/db/equipment';
import { getConsumables } from '../../lib/db/consumables';

const TYPE_ICON   = { vehicle: '🚗', tool: '🔧', equipment: '⚙️', consumable: '📦' };
const TYPE_LABEL  = { vehicle: 'Vehicle', tool: 'Tool', equipment: 'Equipment', consumable: 'Consumable' };
const TYPE_PLURAL = { vehicle: 'Vehicles', tool: 'Tools', equipment: 'Equipment', consumable: 'Consumables' };
const ALL_TYPES   = ['vehicle', 'tool', 'equipment', 'consumable'];

const FETCHERS = {
  vehicle:    getVehicles,
  tool:       getTools,
  equipment:  getEquipment,
  consumable: getConsumables,
};

// Returns display name for a fetched item based on its type
function itemName(type, item) {
  return item.name || item.make || '(unnamed)';
}

export default function LoadoutSection({ parentType, parentId, parentName, isShared }) {
  const [assignedTo, setAssignedTo]   = useState([]);   // what's assigned TO this item
  const [assignedIn, setAssignedIn]   = useState([]);   // what this item is assigned IN
  const [loaded, setLoaded]           = useState(false);
  const [showPicker, setShowPicker]   = useState(false);
  const [pickerTab, setPickerTab]     = useState(null); // set on first open
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerLoading, setPickerLoading] = useState(false);
  // data cache: { vehicle: [...] | null, tool: [...] | null, ... }
  const [cache, setCache] = useState({ vehicle: null, tool: null, equipment: null, consumable: null });

  useEffect(() => {
    if (!parentId) return;
    Promise.all([
      getAssignedTo(parentType, parentId),
      getAssignedIn(parentType, parentId),
    ]).then(([to, in_]) => {
      setAssignedTo(to);
      setAssignedIn(in_);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [parentType, parentId]);

  // Picker types: all types; exclude assigning an item to itself (same type + same id)
  const pickerTypes = ALL_TYPES;

  const openPicker = async (type) => {
    const t = type || pickerTypes.find(t => t !== parentType) || pickerTypes[0];
    setPickerTab(t);
    setShowPicker(true);
    await loadType(t);
  };

  const loadType = async (type) => {
    if (cache[type] !== null) return;
    setPickerLoading(true);
    try {
      const data = await FETCHERS[type]();
      setCache(prev => ({ ...prev, [type]: data || [] }));
    } catch {
      setCache(prev => ({ ...prev, [type]: [] }));
    }
    setPickerLoading(false);
  };

  const switchTab = async (type) => {
    setPickerTab(type);
    setPickerSearch('');
    await loadType(type);
  };

  const assignedIds = useMemo(() => {
    const s = new Set();
    assignedTo.forEach(a => s.add(a.child_type + ':' + a.child_id));
    return s;
  }, [assignedTo]);

  const pickerItems = useMemo(() => {
    if (!pickerTab) return [];
    const pool = cache[pickerTab] || [];
    const q = pickerSearch.toLowerCase();
    return pool.filter(item => {
      // exclude self
      if (item.id === parentId && pickerTab === parentType) return false;
      // exclude already assigned
      if (assignedIds.has(pickerTab + ':' + item.id)) return false;
      // search
      if (q && !(item.name || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [pickerTab, cache, assignedIds, pickerSearch, parentId, parentType]);

  const doAssign = async (childType, item) => {
    const a = await assignAsset({
      parentType,
      parentId,
      parentName: parentName || '',
      childType,
      childId:    item.id,
      childName:  itemName(childType, item),
    });
    setAssignedTo(prev => [...prev, a]);
  };

  const doUnassign = async (id) => {
    await unassignAsset(id);
    setAssignedTo(prev => prev.filter(a => a.id !== id));
  };

  const closePicker = () => { setShowPicker(false); setPickerSearch(''); };

  const poolSize = pickerTab ? (cache[pickerTab] || []).length : 0;
  const emptyMsg = pickerSearch
    ? 'No matches.'
    : poolSize === 0
      ? `No ${TYPE_PLURAL[pickerTab]?.toLowerCase()} added yet — add some from the ${TYPE_PLURAL[pickerTab]?.toLowerCase()} tab.`
      : `All ${TYPE_PLURAL[pickerTab]?.toLowerCase()} already assigned to this item.`;

  return (
    <div style={{ marginTop: 12 }}>
      {/* ── Assigned Items ─────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 7, color: ACC, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
          Loadout {loaded && assignedTo.length > 0 && `(${assignedTo.length})`}
        </div>
        {!isShared && !showPicker && (
          <button onClick={() => openPicker(null)} style={{ ...btnG, ...sm, fontSize: 8 }}>+ Assign</button>
        )}
        {!isShared && showPicker && (
          <button onClick={closePicker} style={{ ...btnG, ...sm, fontSize: 8 }}>Done</button>
        )}
      </div>

      {loaded && assignedTo.length === 0 && !showPicker && (
        <div style={{ fontSize: 9, color: MUT, fontStyle: 'italic' }}>Nothing assigned.</div>
      )}

      {assignedTo.map(a => (
        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', borderBottom: '1px solid #1a1a1a' }}>
          <span style={{ fontSize: 13 }}>{TYPE_ICON[a.child_type]}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: TXT, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.child_name}</div>
            <div style={{ fontSize: 8, color: MUT, textTransform: 'capitalize' }}>{a.child_type}</div>
          </div>
          {!isShared && (
            <button onClick={() => doUnassign(a.id)}
              style={{ background: 'none', border: 'none', color: MUT, cursor: 'pointer', fontSize: 11, padding: '0 2px', lineHeight: 1 }}>✕</button>
          )}
        </div>
      ))}

      {/* ── Picker ─────────────────────────────────── */}
      {showPicker && (
        <div style={{ background: '#0a0a0a', border: '1px solid ' + ACC + '33', borderRadius: 2, padding: 10, marginTop: 6 }}>
          {/* Type tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 8, flexWrap: 'wrap' }}>
            {pickerTypes.map((type, i) => {
              const isFirst = i === 0;
              const isLast  = i === pickerTypes.length - 1;
              const active  = pickerTab === type;
              return (
                <button key={type} onClick={() => switchTab(type)}
                  style={{ ...btnG, ...sm, fontSize: 8,
                    borderRadius: isFirst ? '2px 0 0 2px' : isLast ? '0 2px 2px 0' : '0',
                    borderRight: isLast ? undefined : 'none',
                    ...(active ? { background: ACC + '18', color: ACC, border: '1px solid ' + ACC } : {}),
                  }}>
                  {TYPE_ICON[type]} {TYPE_PLURAL[type]}
                </button>
              );
            })}
          </div>

          <input
            style={{ ...inp, fontSize: 10, padding: '5px 8px', marginBottom: 6 }}
            placeholder={`Search ${TYPE_PLURAL[pickerTab]?.toLowerCase()}…`}
            value={pickerSearch}
            onChange={e => setPickerSearch(e.target.value)}
          />

          {pickerLoading && <div style={{ fontSize: 9, color: MUT, padding: '8px 0' }}>Loading…</div>}

          {!pickerLoading && pickerItems.length === 0 && (
            <div style={{ fontSize: 9, color: MUT, fontStyle: 'italic', padding: '6px 0' }}>{emptyMsg}</div>
          )}

          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
            {pickerItems.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #181818' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: TXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {itemName(pickerTab, item)}
                  </div>
                  {(item.brand || item.make || item.category || item.type) && (
                    <div style={{ fontSize: 8, color: MUT }}>
                      {item.brand || item.make || ''}{(item.category || item.type) ? ' · ' + (item.category || item.type) : ''}
                    </div>
                  )}
                </div>
                <button onClick={() => doAssign(pickerTab, item)}
                  style={{ ...btnA, ...sm, fontSize: 8, flexShrink: 0, marginLeft: 8 }}>+ Add</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Assigned To (reverse) ──────────────────── */}
      {loaded && assignedIn.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 7, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Assigned to</div>
          {assignedIn.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
              <span style={{ fontSize: 12 }}>{TYPE_ICON[a.parent_type]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9, color: TXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.parent_name || `(${a.parent_type})`}
                </div>
                <div style={{ fontSize: 7, color: MUT, textTransform: 'capitalize' }}>{a.parent_type}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
