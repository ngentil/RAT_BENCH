#!/usr/bin/env node
// Deletes wiki entries whose current revision has fewer than MIN_FIELDS non-empty data points.
// Usage: node scripts/wiki-import/cleanup-thin-entries.mjs [--dry-run] [--min=N]
// Default: --min=10

const MIN_FIELDS = (() => {
  const arg = process.argv.find(a => a.startsWith('--min='));
  return arg ? parseInt(arg.split('=')[1], 10) : 10;
})();
const DRY_RUN = process.argv.includes('--dry-run');

const BASE = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const KEY  = process.env.SUPABASE_SERVICE_KEY || '';

if (!BASE || !KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const HEADERS = {
  'apikey': KEY,
  'Authorization': `Bearer ${KEY}`,
  'Content-Type': 'application/json',
};

async function get(path) {
  const url = `${BASE}/rest/v1/${path}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GET ${path} → ${res.status}: ${body}`);
  }
  return res.json();
}

async function del(path) {
  const url = `${BASE}/rest/v1/${path}`;
  const res = await fetch(url, { method: 'DELETE', headers: HEADERS });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DELETE ${path} → ${res.status}: ${body}`);
  }
}

async function fetchAll(table, columns) {
  const PAGE = 1000;
  const all = [];
  let from = 0;
  while (true) {
    const data = await get(`${table}?select=${columns}&order=id&limit=${PAGE}&offset=${from}`);
    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

function countFields(data) {
  if (!data || typeof data !== 'object') return 0;
  return Object.values(data).filter(v => v !== null && v !== undefined && v !== '').length;
}

async function run() {
  console.log(`Min fields: ${MIN_FIELDS}  Dry run: ${DRY_RUN}`);

  console.log('Fetching wiki entries...');
  const entries = (await fetchAll('wiki_entries', 'id,slug,make,model,current_rev_id'))
    .filter(e => e.current_rev_id);
  console.log(`Total entries with a revision: ${entries.length}`);

  // Fetch revision data in batches using PostgREST in() filter
  const revMap = {};
  const ID_BATCH = 100;
  const revIds = entries.map(e => e.current_rev_id);
  for (let i = 0; i < revIds.length; i += ID_BATCH) {
    const batch = revIds.slice(i, i + ID_BATCH);
    const data = await get(`wiki_revisions?select=id,data&id=in.(${batch.join(',')})`);
    for (const r of data) revMap[r.id] = r.data;
  }

  // Find thin entries
  const toDelete = entries.filter(e => {
    const n = countFields(revMap[e.current_rev_id]);
    return n < MIN_FIELDS;
  }).map(e => ({
    ...e,
    fields: countFields(revMap[e.current_rev_id]),
  }));

  console.log(`\nEntries with < ${MIN_FIELDS} fields: ${toDelete.length}`);
  if (!toDelete.length) { console.log('Nothing to delete.'); return; }

  for (const e of toDelete) {
    console.log(`  [${e.fields} fields] ${e.make} ${e.model} — ${e.slug}`);
  }

  if (DRY_RUN) { console.log('\nDry run — no deletions made.'); return; }

  const ids = toDelete.map(e => e.id);
  const DEL_BATCH = 100;
  let deleted = 0;

  for (let i = 0; i < ids.length; i += DEL_BATCH) {
    const batch = ids.slice(i, i + DEL_BATCH);
    const idList = batch.join(',');
    await del(`wiki_contributions?entry_id=in.(${idList})`);
    await del(`wiki_revisions?entry_id=in.(${idList})`);
    await del(`wiki_entries?id=in.(${idList})`);
    deleted += batch.length;
    console.log(`Deleted ${deleted}/${ids.length}...`);
  }

  console.log(`\nDone. Removed ${ids.length} thin wiki entries.`);
}

run().catch(e => { console.error(e.message || e); process.exit(1); });
