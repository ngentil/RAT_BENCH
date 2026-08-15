#!/usr/bin/env node
// Deletes activity_log rows older than the retention window so the table
// (and the admin Live Log tab's searchable history) doesn't grow unbounded.
// Runs daily via .github/workflows/prune-activity-log.yml.
//
// Usage:
//   node scripts/prune-activity-log.mjs [--days=30] [--dry-run]

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
const daysArg = process.argv.find(a => a.startsWith('--days='));
const RETENTION_DAYS = daysArg ? parseInt(daysArg.split('=')[1], 10) : 30;
const CUTOFF = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

async function main() {
  // .is('snapshot', null) excludes a '.delete' row whose Recently Deleted
  // snapshot hasn't been cleared yet (see prune-recently-deleted.mjs, which
  // runs 30 min later and also uses a 30-day window now that both retention
  // periods match). Without this, this run — 30 min *earlier* in the same
  // day — could hard-delete a still-undo-eligible row before that sweep
  // ever sees it, permanently orphaning any Storage photos its snapshot
  // referenced. Every non-delete row already has a null snapshot anyway, so
  // this only ever excludes exactly the rows that genuinely need the other
  // script to run first.
  const { count, error: countErr } = await supabase
    .from('activity_log')
    .select('id', { count: 'exact', head: true })
    .lt('created_at', CUTOFF)
    .is('snapshot', null);
  if (countErr) throw countErr;

  console.log(`${count || 0} activity_log row(s) older than ${RETENTION_DAYS} days (before ${CUTOFF}).`);

  if (DRY_RUN || !count) {
    console.log(DRY_RUN ? '[dry-run] no rows deleted.' : 'Nothing to prune.');
    return;
  }

  const { error: delErr } = await supabase.from('activity_log').delete().lt('created_at', CUTOFF).is('snapshot', null);
  if (delErr) throw delErr;

  console.log(`Deleted ${count} row(s).`);
}

main().catch(e => { console.error(e); process.exit(1); });
