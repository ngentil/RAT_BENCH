import { supabase } from '../supabase';
import { fromDb as fromDbMachine } from './transforms';
import { fromDb as fromDbClient } from './clients';
import { fromDb as fromDbVehicle } from './vehicles';
import { fromDb as fromDbEquipment } from './equipment';
import { fromDb as fromDbTool } from './tools';
import { fromDb as fromDbConsumable } from './consumables';

// "Recently Deleted" client helpers — two underlying sources merged into one
// list (see supabase/recently_deleted.sql and supabase/trash_items.sql):
//   - whole-record deletes (machines, clients, vehicles, equipment, tools,
//     consumables, company_members) come back from list_my_recently_deleted()
//   - things embedded inside a machine's own jsonb columns (time log
//     entries, parts, photos) come back from list_my_trash_items()
// Both share the same 72-hour recovery window and the same shape once
// normalized here, so the Settings page can render one flat, newest-first
// list without caring which table something actually came from.

const WHOLE_RECORD_LABELS = {
  machines: 'Machine',
  clients: 'Client',
  vehicles: 'Vehicle',
  equipment: 'Equipment',
  tools: 'Tool',
  consumables: 'Consumable',
  company_members: 'Team member',
};

const TRASH_ITEM_LABELS = {
  time_log: 'Time entry',
  parts: 'Part',
  photos: 'Photo',
  attachments: 'Attachment',
  lighting: 'Lighting entry',
  fasteners: 'Fastener spec',
};

export async function listRecentlyDeleted() {
  const [{ data: records, error: err1 }, { data: items, error: err2 }] = await Promise.all([
    supabase.rpc('list_my_recently_deleted'),
    supabase.rpc('list_my_trash_items'),
  ]);
  if (err1) console.error('listRecentlyDeleted (records):', err1);
  if (err2) console.error('listRecentlyDeleted (items):', err2);

  const normalized = [
    ...(records || []).map(r => ({
      key: `record:${r.id}`,
      kind: 'record',
      id: r.id,
      typeLabel: WHOLE_RECORD_LABELS[r.table_name] || r.table_name,
      label: r.detail || r.record_id,
      deletedAt: r.created_at,
    })),
    ...(items || []).map(i => ({
      key: `item:${i.id}`,
      kind: 'item',
      id: i.id,
      typeLabel: TRASH_ITEM_LABELS[i.item_type] || i.item_type,
      label: i.label,
      deletedAt: i.created_at,
    })),
  ];
  normalized.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
  return normalized;
}

// The activity_log trigger that captures a delete's snapshot fires
// server-side as part of the DELETE statement itself, so the client never
// gets the resulting log row's id back directly from a plain
// supabase.from(table).delete() call — and can't just SELECT activity_log
// to find it either (it's admin-only via RLS). This is the one sanctioned
// way in: ask list_my_recently_deleted() (which the caller's own delete
// helper already needs to call right after deleting) for the newest
// still-undeleted entry matching this exact record. Used right after a
// delete succeeds, to wire that specific row's id into an Undo button.
export async function findMyRecentlyDeletedLogId(tableName, recordId) {
  const { data, error } = await supabase.rpc('list_my_recently_deleted');
  if (error) { console.error('findMyRecentlyDeletedLogId:', error); return null; }
  const match = (data || []).find(r => r.table_name === tableName && r.record_id === recordId);
  return match?.id || null;
}

// The RPC hands back the raw re-inserted row (snake_case DB columns) — this
// converts it to the shape the rest of the app actually works with, so a
// caller can push the result straight into machines/clients/etc. state.
// company_members has no fromDb() of its own (UsersTab reads it as a plain
// row already) so it's deliberately absent here — returned as-is.
const RECORD_TRANSFORMS = {
  machines: fromDbMachine,
  clients: fromDbClient,
  vehicles: fromDbVehicle,
  equipment: fromDbEquipment,
  tools: fromDbTool,
  consumables: fromDbConsumable,
};

// Restores a whole-record delete (machine/client/vehicle/equipment/tool/
// consumable/company_member). Returns {table_name, record_id, restored_count,
// record: <app-shape object, transformed via the table's own fromDb()>}.
export async function restoreDeletedRecord(logId) {
  const { data, error } = await supabase.rpc('restore_deleted_record', { p_log_id: logId });
  if (error) throw error;
  const transform = RECORD_TRANSFORMS[data.table_name];
  return { ...data, record: transform ? transform(data.record) : data.record };
}

// Restores a sub-item (time log entry / part / photo / attachment / etc)
// back into its parent machine's array. Returns {machine_id, item_type}.
export async function restoreTrashItem(id) {
  const { data, error } = await supabase.rpc('restore_trash_item', { p_id: id });
  if (error) throw error;
  return data;
}

// Logs a removed sub-item to the trash before/alongside the caller's own
// upsertMachine() save that actually removes it from the array — same
// best-effort two-step pattern already used elsewhere (e.g. inventory stock
// adjustments alongside a machine save). A failure here doesn't block the
// removal itself; it just means that one item won't have a 72h undo.
// Returns the new trash_items row's id, for wiring up an Undo button.
export async function logTrashItem({ machineId, itemType, label, snapshot }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase.from('trash_items').insert({
    user_id: user.id,
    machine_id: machineId,
    item_type: itemType,
    label,
    snapshot,
  }).select('id').single();
  if (error) throw error;
  return data.id;
}
