#!/usr/bin/env node
// Finds wiki entries with duplicate make+model and deletes all but the best.
// "Best" = most non-empty spec fields, then highest view count, then most recent.
//
// Usage:
//   node scripts/wiki-import/cleanup-duplicates.mjs [--dry-run]

import { supabase } from './_shared.mjs';

const DRY_RUN = process.argv.includes('--dry-run');

function countFields(data) {
  if (!data || typeof data !== 'object') return 0;
  return Object.values(data).filter(v => v !== null && v !== undefined && v !== '' && v !== false).length;
}

async function fetchAll(table, select, filters = []) {
  const PAGE = 1000;
  const all = [];
  let from = 0;
  while (true) {
    let q = supabase.from(table).select(select).range(from, from + PAGE - 1);
    for (const [col, val] of filters) q = q.eq(col, val);
    const { data, error } = await q;
    if (error) throw error;
    if (!data?.length) break;
    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

async function run() {
  console.log(`Duplicate cleanup — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);

  console.log('Fetching wiki entries...');
  const entries = await fetchAll(
    'wiki_entries',
    'id,slug,make,model,current_rev_id,view_count,created_at',
  );
  console.log(`Total entries: ${entries.length}`);

  // Group by normalised make+model key
  const groups = {};
  for (const e of entries) {
    const key = `${(e.make || '').trim().toLowerCase()}|||${(e.model || '').trim().toLowerCase()}`;
    (groups[key] ??= []).push(e);
  }

  const dupGroups = Object.values(groups).filter(g => g.length > 1);
  console.log(`Duplicate groups: ${dupGroups.length}`);
  if (!dupGroups.length) { console.log('No duplicates found.'); return; }

  // Fetch revision field counts for all entries in dup groups
  const dupEntries = dupGroups.flat();
  const revIds = dupEntries.map(e => e.current_rev_id).filter(Boolean);
  const revMap = {};
  const BATCH = 100;
  for (let i = 0; i < revIds.length; i += BATCH) {
    const { data, error } = await supabase
      .from('wiki_revisions')
      .select('id,data')
      .in('id', revIds.slice(i, i + BATCH));
    if (error) throw error;
    for (const r of data || []) revMap[r.id] = r.data;
  }

  // For each group: pick winner, collect losers
  const toDelete = [];

  for (const group of dupGroups) {
    const scored = group.map(e => ({
      ...e,
      fields: countFields(revMap[e.current_rev_id]),
    })).sort((a, b) =>
      b.fields - a.fields ||
      (b.view_count || 0) - (a.view_count || 0) ||
      new Date(b.created_at) - new Date(a.created_at)
    );

    const [winner, ...losers] = scored;
    console.log(`\n  KEEP  [${winner.fields} fields, ${winner.view_count || 0} views] ${winner.make} ${winner.model} — ${winner.slug}`);
    for (const l of losers) {
      console.log(`  DEL   [${l.fields} fields, ${l.view_count || 0} views] ${l.make} ${l.model} — ${l.slug}`);
      toDelete.push(l);
    }
  }

  console.log(`\nEntries to delete: ${toDelete.length}`);
  if (DRY_RUN) { console.log('Dry run — no deletions made.'); return; }

  const DEL_BATCH = 100;
  let deleted = 0;
  const ids = toDelete.map(e => e.id);

  for (let i = 0; i < ids.length; i += DEL_BATCH) {
    const batch = ids.slice(i, i + DEL_BATCH);
    await supabase.from('wiki_contributions').delete().in('entry_id', batch);
    await supabase.from('wiki_revisions').delete().in('entry_id', batch);
    const { error } = await supabase.from('wiki_entries').delete().in('id', batch);
    if (error) { console.error('Delete error:', error); process.exit(1); }
    deleted += batch.length;
    console.log(`Deleted ${deleted}/${ids.length}...`);
  }

  console.log(`\nDone. Removed ${ids.length} duplicate wiki entries.`);
}

run().catch(e => { console.error(e.message || e); process.exit(1); });
