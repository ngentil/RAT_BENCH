#!/usr/bin/env node
// One-shot: delete all wiki_entries where is_sample = true (all users).
// Usage: node scripts/wiki-import/remove-sample-entries.mjs [--dry-run]

import { supabase } from './_shared.mjs';

const DRY_RUN = process.argv.includes('--dry-run');

async function run() {
  console.log(`Dry run: ${DRY_RUN}`);

  // Fetch all sample entry IDs
  const all = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('wiki_entries')
      .select('id,slug,make,model')
      .eq('is_sample', true)
      .range(from, from + 999);
    if (error) throw error;
    if (!data?.length) break;
    all.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }

  console.log(`Sample entries found: ${all.length}`);
  if (!all.length) { console.log('Nothing to delete.'); return; }

  for (const e of all) console.log(`  ${e.make} ${e.model} — ${e.slug}`);

  if (DRY_RUN) { console.log('\nDry run — no deletions made.'); return; }

  const ids = all.map(e => e.id);
  const BATCH = 100;
  let deleted = 0;

  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    await supabase.from('wiki_contributions').delete().in('entry_id', batch);
    await supabase.from('wiki_revisions').delete().in('entry_id', batch);
    const { error } = await supabase.from('wiki_entries').delete().in('id', batch);
    if (error) { console.error('Delete error:', error); process.exit(1); }
    deleted += batch.length;
    console.log(`Deleted ${deleted}/${ids.length}...`);
  }

  console.log(`\nDone. Removed ${ids.length} sample wiki entries.`);
}

run().catch(e => { console.error(e.message || e); process.exit(1); });
