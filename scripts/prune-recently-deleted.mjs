#!/usr/bin/env node
// Finishes what a delete started, once it's past the 72-hour Recently
// Deleted recovery window (see supabase/recently_deleted.sql and
// supabase/trash_items.sql). deleteMachineApi/deleteClientApi etc.
// deliberately stop short of deleting the actual Storage photo files at
// delete time — restoring a record with broken image links would defeat the
// whole point of "you can undo this." This is what actually deletes those
// files, once undo is no longer possible:
//
//   - activity_log '.delete' rows older than 72h: any photo URLs found in
//     the stored snapshot get removed from Storage, then the (now heavy and
//     no-longer-useful) snapshot column is nulled out. The activity_log row
//     itself is left alone — it still has its own, separate 30-day general
//     retention (prune-activity-log.mjs).
//   - trash_items rows older than 72h: if it was a photo, delete the file
//     from Storage; either way, the row itself is deleted outright (unlike
//     activity_log, there's no separate audit-trail reason to keep it).
//
// Usage:
//   node scripts/prune-recently-deleted.mjs [--dry-run]
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '')
  .replace(/\/rest\/v1\/?.*$/, '')
  .replace(/\/+$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY in the environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DRY_RUN = process.argv.includes('--dry-run');
const CUTOFF = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
const PHOTOS_BUCKET = 'photos';

function photoPathFromUrl(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('https://')) return null;
  const marker = `/object/public/${PHOTOS_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

// Every photo URL a whole-record snapshot might be holding onto — covers
// the generic `photos` array every one of these tables has, plus the two
// machines-only port-photo fields and the carb-spec gasket photos array
// that deleteMachineApi used to clean up inline before this cron existed.
function photoUrlsFromSnapshot(snapshot) {
  if (!snapshot) return [];
  const urls = [
    ...(snapshot.photos || []),
    ...(snapshot.i_p_photos || []),
    ...(snapshot.e_p_photos || []),
    ...(snapshot.carb_spec?.gasketPhotos || []),
  ];
  return urls.filter(Boolean);
}

async function removePhotos(urls) {
  const paths = urls.map(photoPathFromUrl).filter(Boolean);
  if (!paths.length) return 0;
  if (DRY_RUN) return paths.length;
  const { error } = await supabase.storage.from(PHOTOS_BUCKET).remove(paths);
  if (error) { console.warn('  photo remove failed:', error.message); return 0; }
  return paths.length;
}

async function pruneActivityLogSnapshots() {
  const { data: rows, error } = await supabase
    .from('activity_log')
    .select('id, snapshot')
    .like('action', '%.delete')
    .not('snapshot', 'is', null)
    .lt('created_at', CUTOFF)
    .limit(500);
  if (error) throw error;

  console.log(`${rows?.length || 0} expired activity_log delete-snapshot(s) to clean up.`);
  if (!rows?.length) return;

  let photosRemoved = 0;
  for (const row of rows) {
    photosRemoved += await removePhotos(photoUrlsFromSnapshot(row.snapshot));
  }
  console.log(`  ${photosRemoved} photo file(s) ${DRY_RUN ? 'would be removed' : 'removed'} from Storage.`);

  if (DRY_RUN) { console.log('  [dry-run] snapshot column left as-is.'); return; }
  const { error: updErr } = await supabase
    .from('activity_log')
    .update({ snapshot: null })
    .in('id', rows.map(r => r.id));
  if (updErr) throw updErr;
  console.log(`  Cleared snapshot on ${rows.length} row(s) (log entry itself kept, per its own 30-day retention).`);
}

async function pruneTrashItems() {
  const { data: rows, error } = await supabase
    .from('trash_items')
    .select('id, item_type, snapshot')
    .is('restored_at', null)
    .lt('created_at', CUTOFF)
    .limit(500);
  if (error) throw error;

  console.log(`${rows?.length || 0} expired trash_item(s) to clean up.`);
  if (!rows?.length) return;

  let photosRemoved = 0;
  for (const row of rows) {
    if (row.item_type === 'photos') {
      photosRemoved += await removePhotos([row.snapshot]);
    }
  }
  console.log(`  ${photosRemoved} photo file(s) ${DRY_RUN ? 'would be removed' : 'removed'} from Storage.`);

  if (DRY_RUN) { console.log('  [dry-run] no rows deleted.'); return; }
  const { error: delErr } = await supabase.from('trash_items').delete().in('id', rows.map(r => r.id));
  if (delErr) throw delErr;
  console.log(`  Deleted ${rows.length} row(s).`);
}

async function main() {
  console.log(`Recently Deleted expiry sweep${DRY_RUN ? ' (DRY RUN)' : ''} — cutoff ${CUTOFF}`);
  await pruneActivityLogSnapshots();
  await pruneTrashItems();
}

main().catch(e => { console.error(e); process.exit(1); });
