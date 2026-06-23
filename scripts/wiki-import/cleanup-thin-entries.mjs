#!/usr/bin/env node
// Deletes wiki entries whose current revision has fewer than MIN_FIELDS non-empty data points.
// Usage: node scripts/wiki-import/cleanup-thin-entries.mjs [--dry-run] [--min=N]
// Default: --min=10

import { createClient } from '@supabase/supabase-js';

const MIN_FIELDS = (() => {
  const arg = process.argv.find(a => a.startsWith('--min='));
  return arg ? parseInt(arg.split('=')[1], 10) : 10;
})();
const DRY_RUN = process.argv.includes('--dry-run');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

function countFields(data) {
  if (!data || typeof data !== 'object') return 0;
  return Object.values(data).filter(v => v !== null && v !== undefined && v !== '').length;
}

async function run() {
  console.log(`Min fields: ${MIN_FIELDS}  Dry run: ${DRY_RUN}`);

  // Fetch all entries that have a current revision
  let offset = 0;
  const PAGE = 500;
  const toDelete = [];

  while (true) {
    const { data: entries, error } = await supabase
      .from('wiki_entries')
      .select('id,slug,make,model,current_rev_id')
      .not('current_rev_id', 'is', null)
      .range(offset, offset + PAGE - 1);

    if (error) { console.error('Fetch error:', error); process.exit(1); }
    if (!entries?.length) break;

    // Fetch revision data for this page in one query
    const revIds = entries.map(e => e.current_rev_id);
    const { data: revs, error: revErr } = await supabase
      .from('wiki_revisions')
      .select('id,data')
      .in('id', revIds);

    if (revErr) { console.error('Rev fetch error:', revErr); process.exit(1); }

    const revMap = Object.fromEntries((revs || []).map(r => [r.id, r.data]));

    for (const entry of entries) {
      const data = revMap[entry.current_rev_id];
      const n = countFields(data);
      if (n < MIN_FIELDS) {
        toDelete.push({ id: entry.id, slug: entry.slug, make: entry.make, model: entry.model, fields: n });
      }
    }

    if (entries.length < PAGE) break;
    offset += PAGE;
  }

  console.log(`\nEntries with < ${MIN_FIELDS} fields: ${toDelete.length}`);

  if (!toDelete.length) {
    console.log('Nothing to delete.');
    return;
  }

  // Print what will be deleted
  for (const e of toDelete) {
    console.log(`  [${e.fields} fields] ${e.make} ${e.model} — ${e.slug}`);
  }

  if (DRY_RUN) {
    console.log('\nDry run — no deletions made.');
    return;
  }

  // Delete in batches — must delete revisions and contributions before entries (FK)
  const ids = toDelete.map(e => e.id);
  const BATCH = 100;
  let deleted = 0;

  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);

    const { error: e1 } = await supabase.from('wiki_contributions').delete().in('entry_id', batch);
    if (e1) console.warn('contributions delete warn:', e1.message);

    const { error: e2 } = await supabase.from('wiki_revisions').delete().in('entry_id', batch);
    if (e2) console.warn('revisions delete warn:', e2.message);

    const { error: e3, count } = await supabase.from('wiki_entries').delete().in('id', batch);
    if (e3) { console.error('entries delete error:', e3); process.exit(1); }

    deleted += batch.length;
    console.log(`Deleted ${deleted}/${ids.length}...`);
  }

  console.log(`\nDone. Removed ${ids.length} thin wiki entries.`);
}

run().catch(e => { console.error(e); process.exit(1); });
