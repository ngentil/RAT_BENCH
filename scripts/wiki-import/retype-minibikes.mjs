#!/usr/bin/env node
// One-off fix: two existing wiki entries (Coleman CT200U-EX Mini Bike, Baja
// MB200 Mini Bike — both from training-data-seed-9.mjs) were seeded typed
// "Motorcycle" because "Mini Bike" didn't exist as a machine type yet. Now
// that it does (see machineTypes.js), these two are the closest thing the
// wiki already had to the new training-data-seed-13-minibikes.mjs content
// and should be retyped to match, or a user browsing the wiki by type would
// see the same category of bike split across "Motorcycle" and "Mini Bike"
// for no real reason. Scoped to exactly these two known slugs — not a
// generic reconciliation pass (see reconcile-types.mjs for that, which reads
// from a different curated file this content isn't part of).
//
// Usage:
//   node scripts/wiki-import/retype-minibikes.mjs [--dry-run]

import { supabase } from './_shared.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const SLUGS = ['coleman-ct200u-ex-mini-bike', 'baja-mb200-mini-bike'];
const CORRECT_TYPE = 'Mini Bike';

async function run() {
  console.log(`Mini Bike retype — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);

  const { data: rows, error } = await supabase
    .from('wiki_entries')
    .select('id, slug, type, make, model')
    .in('slug', SLUGS);
  if (error) throw error;

  if (!rows?.length) {
    console.log('No matching entries found (not seeded yet, or already renamed) — nothing to do.');
    return;
  }

  const drifted = rows.filter(r => r.type !== CORRECT_TYPE);
  if (!drifted.length) {
    console.log('Already correctly typed — nothing to do.');
    return;
  }

  drifted.forEach(r => console.log(`  ${r.type} -> ${CORRECT_TYPE}   ${r.make} ${r.model}  [${r.slug}]`));

  if (DRY_RUN) { console.log('\nDry run — no updates made.'); return; }

  const { error: updErr } = await supabase
    .from('wiki_entries')
    .update({ type: CORRECT_TYPE })
    .in('id', drifted.map(r => r.id));
  if (updErr) throw updErr;

  console.log(`\nDone. Corrected type on ${drifted.length} entries.`);
}

run().catch(e => { console.error(e.message || e); process.exit(1); });
