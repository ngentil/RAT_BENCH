#!/usr/bin/env node
// Force-corrects wiki_entries.type drift for every slug curated in
// supabase/wiki_seed_all.sql — the canonical (slug -> type) mapping lives in
// that file's own INSERT statements, which this script parses directly so
// there's exactly one source of truth to maintain.
//
// Why this is needed: the seed file's enrich-or-create pattern
// ("IF v_entry IS NULL THEN INSERT ... END IF") only sets `type` on a
// BRAND-NEW row. If a slug already existed (e.g. from the old Wikipedia bulk
// import, or from an earlier seed batch) the INSERT is skipped and the
// pre-existing type is left untouched forever — only the revision/spec data
// gets enriched. That's how curated Standalone Engines have shown up live
// under "Custom", "Go-kart", "Lawnmower", "Ride-on Mower" and similar wrong
// categories: the slug matched, so only the type update was silently missed.
//
// This script re-derives the correct type for every curated slug straight
// from the seed file (no hardcoded list to keep in sync by hand) and
// corrects any live row whose type has drifted. Scoped ONLY to slugs this
// project curates — never touches other user-submitted wiki content.
//
// Usage:
//   node scripts/wiki-import/reconcile-types.mjs [--dry-run]

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { supabase, chunk } from './_shared.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const SEED_FILE = resolve(process.cwd(), 'supabase/wiki_seed_all.sql');

function loadCanonicalTypes() {
  const sql = readFileSync(SEED_FILE, 'utf8');
  const re = /VALUES \('([^']+)','[^']+','[^']+','([^']+)',/g;
  const bySlug = new Map(); // first occurrence wins; a slug's type never
                            // legitimately changes between batches in this file
  let m;
  while ((m = re.exec(sql))) {
    const [, slug, type] = m;
    if (!bySlug.has(slug)) bySlug.set(slug, type);
  }
  return bySlug;
}

async function fetchAllEntries() {
  const all = [];
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('wiki_entries')
      .select('id,slug,type,make,model')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;
    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

async function run() {
  console.log(`Type reconciliation — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);

  const canonical = loadCanonicalTypes();
  console.log(`Canonical (slug -> type) pairs in seed file: ${canonical.size}`);

  console.log('Fetching live wiki entries...');
  const entries = await fetchAllEntries();
  const bySlug = new Map(entries.map(e => [e.slug, e]));

  const drifted = [];
  for (const [slug, correctType] of canonical) {
    const row = bySlug.get(slug);
    if (row && row.type !== correctType) {
      drifted.push({ ...row, correctType });
    }
  }

  console.log(`Drifted rows: ${drifted.length}`);
  if (!drifted.length) { console.log('Nothing to fix.'); return; }

  for (const d of drifted) {
    console.log(`  ${d.type} -> ${d.correctType}   ${d.make} ${d.model}  [${d.slug}]`);
  }

  if (DRY_RUN) { console.log('\nDry run — no updates made.'); return; }

  // Group by target type so each batch is a single UPDATE ... WHERE id IN (...)
  const byTargetType = new Map();
  for (const d of drifted) {
    (byTargetType.get(d.correctType) ?? byTargetType.set(d.correctType, []).get(d.correctType)).push(d.id);
  }

  let fixed = 0;
  for (const [type, ids] of byTargetType) {
    for (const batch of chunk(ids, 200)) {
      const { error } = await supabase.from('wiki_entries').update({ type }).in('id', batch);
      if (error) { console.error(`Update error for type "${type}":`, error.message); process.exit(1); }
      fixed += batch.length;
    }
  }

  console.log(`\nDone. Corrected type on ${fixed} entries.`);
}

run().catch(e => { console.error(e.message || e); process.exit(1); });
