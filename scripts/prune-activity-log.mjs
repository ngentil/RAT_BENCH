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
  const { count, error: countErr } = await supabase
    .from('activity_log')
    .select('id', { count: 'exact', head: true })
    .lt('created_at', CUTOFF);
  if (countErr) throw countErr;

  console.log(`${count || 0} activity_log row(s) older than ${RETENTION_DAYS} days (before ${CUTOFF}).`);

  if (DRY_RUN || !count) {
    console.log(DRY_RUN ? '[dry-run] no rows deleted.' : 'Nothing to prune.');
    return;
  }

  const { error: delErr } = await supabase.from('activity_log').delete().lt('created_at', CUTOFF);
  if (delErr) throw delErr;

  console.log(`Deleted ${count} row(s).`);
}

main().catch(e => { console.error(e); process.exit(1); });
