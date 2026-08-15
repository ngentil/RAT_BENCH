import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, TXT, btnA, sm } from '../../lib/styles';
import { listRecentlyDeleted, restoreDeletedRecord, restoreTrashItem } from '../../lib/db';
import { toastError, toastSuccess } from '../../lib/toast';

function relativeTime(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Settings → Recently Deleted — the "slow path" undo. The toast shown right
// after a delete (src/lib/toast.js's toastUndo) is the fast path for
// catching a mistake in the first few seconds; this page is for anything
// missed, browsable for up to 72 hours (see supabase/recently_deleted.sql
// and supabase/trash_items.sql for where the underlying data actually
// lives — nothing here is a separate store of its own).
function RecentlyDeletedSettings({ machines, setMachines, clients, setClients }) {
  const [items, setItems] = useState(null);
  const [restoring, setRestoring] = useState(null);

  const load = () => { listRecentlyDeleted().then(setItems); };
  useEffect(load, []);

  const restore = async (item) => {
    setRestoring(item.key);
    try {
      if (item.kind === 'record') {
        const { record, table_name } = await restoreDeletedRecord(item.id);
        if (record && table_name === 'machines' && setMachines) setMachines(prev => [record, ...prev]);
        if (record && table_name === 'clients' && setClients) setClients(prev => [record, ...prev]);
        toastSuccess(`${item.typeLabel} restored`);
      } else {
        // Sub-items (time log/parts/photos) restore back onto their parent
        // machine server-side — that machine isn't necessarily the one
        // showing on screen right now, so this deliberately doesn't try to
        // live-patch `machines` state here; opening it in Garage/Bench next
        // will show it fresh either way.
        await restoreTrashItem(item.id);
        toastSuccess(`${item.typeLabel} restored`);
      }
      setItems(prev => prev.filter(x => x.key !== item.key));
    } catch (e) {
      toastError("Couldn't restore — " + e.message);
    }
    setRestoring(null);
  };

  return (
    <div>
      <div style={{ fontSize: 10, color: MUT, lineHeight: 1.7, marginBottom: 14 }}>
        Anything you delete — a machine, a client, a time entry, a part, a photo — lands here for 72 hours before it's
        gone for good. Restore it anytime before then.
      </div>

      {items === null && <div style={{ fontSize: 10, color: MUT }}>Loading…</div>}

      {items?.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px 16px' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🗑️</div>
          <div style={{ fontSize: 10, color: MUT }}>Nothing here — anything you delete shows up for 72 hours.</div>
        </div>
      )}

      {items?.length > 0 && (
        <div style={{ border: '1px solid ' + BRD, borderRadius: 2 }}>
          {items.map(item => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 12px', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 8, color: ACC, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>{item.typeLabel}</div>
                <div style={{ fontSize: 11, color: TXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</div>
                <div style={{ fontSize: 9, color: MUT }}>deleted {relativeTime(item.deletedAt)}</div>
              </div>
              <button
                onClick={() => restore(item)}
                disabled={restoring === item.key}
                style={{ ...btnA, ...sm, flexShrink: 0, opacity: restoring === item.key ? 0.5 : 1 }}
              >
                {restoring === item.key ? 'Restoring…' : '↺ Restore'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentlyDeletedSettings;
