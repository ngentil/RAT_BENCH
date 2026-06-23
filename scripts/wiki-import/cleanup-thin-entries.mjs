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

async function fetchAll(table, select) {
  const PAGE = 1000;
  const all = [];
  let lastId = null;
  while (true) {
    let q = supabase.from(table).select(select).order('id').limit(PAGE);
    if (lastId) q = q.gt('id', lastId);
    const { data, error } = await q;
    if (error) throw error;
    if (!data || !data.length) break;
    all.push(...data);
    if (data.length < PAGE) break;
    lastId = data[data.length - 1].id;
  }
  return all;
}

async function run() {
  console.log(`Min fields: ${MIN_FIELDS}  Dry run: ${DRY_RUN}`);

  // Fetch all entries, then filter out those with no current revision in JS
  console.log('Fetching wiki entries...');
  let entries;
  try {
    entries = await fetchAll('wiki_entries', 'id,slug,make,model,current_rev_id');
  } catch (err) {
    console.error('Failed to fetch entries:', err);
    process.exit(1);
  }
  entries = entries.filter(e => e.current_rev_id);
  console.log(`Total entries with a revision: ${entries.length}`);

  // Fetch all current revisions in batches of 100 IDs
  const revIds = entries.map(e => e.current_rev_id);
  const revMap = {};
  const ID_BATCH = 100;
  for (let i = 0; i < revIds.length; i += ID_BATCH) {
    const batch = revIds.slice(i, i + ID_BATCH);
    const { data: revs, error } = await supabase
      .from('wiki_revisions')
      .select('id,data')
      .in('id', batch);
    if (error) { console.error('Rev fetch error:', error); process.exit(1); }
    for (const r of revs || []) revMap[r.id] = r.data;
  }

  // Identify thin entries
  const toDelete = [];
  for (const entry of entries) {
    const data = revMap[entry.current_rev_id];
    const n = countFields(data);
    if (n < MIN_FIELDS) {
      toDelete.push({ id: entry.id, slug: entry.slug, make: entry.make, model: entry.model, fields: n });
    }
  }

  console.log(`\nEntries with < ${MIN_FIELDS} fields: ${toDelete.length}`);

  if (!toDelete.length) {
    console.log('Nothing to delete.');
    return;
  }

  for (const e of toDelete) {
    console.log(`  [${e.fields} fields] ${e.make} ${e.model} — ${e.slug}`);
  }

  if (DRY_RUN) {
    console.log('\nDry run — no deletions made.');
    return;
  }

  // Delete in batches — contributions and revisions first (FK constraints)
  const ids = toDelete.map(e => e.id);
  const DEL_BATCH = 100;
  let deleted = 0;

  for (let i = 0; i < ids.length; i += DEL_BATCH) {
    const batch = ids.slice(i, i + DEL_BATCH);

    const { error: e1 } = await supabase.from('wiki_contributions').delete().in('entry_id', batch);
    if (e1) console.warn('contributions delete warn:', e1.message);

    const { error: e2 } = await supabase.from('wiki_revisions').delete().in('entry_id', batch);
    if (e2) console.warn('revisions delete warn:', e2.message);

    const { error: e3 } = await supabase.from('wiki_entries').delete().in('id', batch);
    if (e3) { console.error('entries delete error:', e3); process.exit(1); }

    deleted += batch.length;
    console.log(`Deleted ${deleted}/${ids.length}...`);
  }

  console.log(`\nDone. Removed ${ids.length} thin wiki entries.`);
}

run().catch(e => { console.error(e); process.exit(1); });
