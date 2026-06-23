#!/usr/bin/env node
// Deletes wiki entries whose current revision has fewer than MIN_FIELDS non-empty data points.
// Usage: node scripts/wiki-import/cleanup-thin-entries.mjs [--dry-run] [--min=N]
// Default: --min=10

import { supabase } from './_shared.mjs';

const MIN_FIELDS = (() => {
  const arg = process.argv.find(a => a.startsWith('--min='));
  return arg ? parseInt(arg.split('=')[1], 10) : 10;
})();
const DRY_RUN = process.argv.includes('--dry-run');

function countFields(data) {
  if (!data || typeof data !== 'object') return 0;
  return Object.values(data).filter(v => v !== null && v !== undefined && v !== '').length;
}

async function fetchAll(table, select) {
  const PAGE = 1000;
  const all = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase.from(table).select(select).range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;
    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

async function run() {
  console.log(`Min fields: ${MIN_FIELDS}  Dry run: ${DRY_RUN}`);

  console.log('Fetching wiki entries...');
  const entries = (await fetchAll('wiki_entries', 'id,slug,make,model,current_rev_id'))
    .filter(e => e.current_rev_id);
  console.log(`Total entries with a revision: ${entries.length}`);

  // Fetch revision data in batches
  const revMap = {};
  const BATCH = 100;
  const revIds = entries.map(e => e.current_rev_id);
  for (let i = 0; i < revIds.length; i += BATCH) {
    const batch = revIds.slice(i, i + BATCH);
    const { data, error } = await supabase.from('wiki_revisions').select('id,data').in('id', batch);
    if (error) throw error;
    for (const r of data || []) revMap[r.id] = r.data;
  }

  // Identify thin entries
  const toDelete = entries
    .map(e => ({ ...e, fields: countFields(revMap[e.current_rev_id]) }))
    .filter(e => e.fields < MIN_FIELDS);

  console.log(`\nEntries with < ${MIN_FIELDS} fields: ${toDelete.length}`);
  if (!toDelete.length) { console.log('Nothing to delete.'); return; }

  for (const e of toDelete) {
    console.log(`  [${e.fields} fields] ${e.make} ${e.model} — ${e.slug}`);
  }

  if (DRY_RUN) { console.log('\nDry run — no deletions made.'); return; }

  const ids = toDelete.map(e => e.id);
  const DEL = 100;
  let deleted = 0;

  for (let i = 0; i < ids.length; i += DEL) {
    const batch = ids.slice(i, i + DEL);
    await supabase.from('wiki_contributions').delete().in('entry_id', batch);
    await supabase.from('wiki_revisions').delete().in('entry_id', batch);
    const { error } = await supabase.from('wiki_entries').delete().in('id', batch);
    if (error) { console.error('Delete error:', error); process.exit(1); }
    deleted += batch.length;
    console.log(`Deleted ${deleted}/${ids.length}...`);
  }

  console.log(`\nDone. Removed ${ids.length} thin wiki entries.`);
}

run().catch(e => { console.error(e.message || e); process.exit(1); });
