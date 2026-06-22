/**
 * Shared utilities for RAT BENCH wiki bulk import scripts.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_KEY env vars.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Env: read root .env if env vars not already set ───────────────────────────
function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch {}
}
loadEnv();

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '')
  .replace(/\/rest\/v1\/?.*$/, '')  // strip /rest/v1/ and anything after
  .replace(/\/+$/, '');             // strip trailing slashes
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env or environment.');
  process.exit(1);
}

console.log('Connecting to:', SUPABASE_URL);

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ── Slug ───────────────────────────────────────────────────────────────────────
export function makeSlug(make, model) {
  return [make, model].join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Delay ─────────────────────────────────────────────────────────────────────
export const delay = ms => new Promise(r => setTimeout(r, ms));

// ── Chunk array ───────────────────────────────────────────────────────────────
export function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ── Fetch existing slugs (to skip duplicates) ─────────────────────────────────
export async function fetchExistingSlugs() {
  const slugs = new Set();
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('wiki_entries')
      .select('slug')
      .range(from, from + step - 1);
    if (error) throw error;
    if (!data?.length) break;
    data.forEach(r => slugs.add(r.slug));
    if (data.length < step) break;
    from += step;
  }
  return slugs;
}

/**
 * Batch insert wiki entries + initial revisions.
 * Automatically skips slugs that already exist.
 *
 * rows: Array of {
 *   make, model, type,          — entry fields
 *   specData: {},               — revision data JSON
 *   editSummary: string,        — e.g. "Imported from NHTSA"
 *   source: string,             — label for logging
 * }
 *
 * existingSlugs: Set<string>  — pass result of fetchExistingSlugs()
 */
export async function batchInsert(rows, existingSlugs, { dryRun = false } = {}) {
  // Deduplicate within this batch + against DB
  const seen = new Set();
  const fresh = rows.filter(r => {
    const slug = makeSlug(r.make, r.model);
    if (existingSlugs.has(slug) || seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });

  if (fresh.length === 0) return { inserted: 0, skipped: rows.length };

  if (dryRun) {
    console.log(`  [dry-run] would insert ${fresh.length} entries`);
    return { inserted: 0, skipped: rows.length - fresh.length };
  }

  let inserted = 0;

  for (const batch of chunk(fresh, 500)) {
    // 1. Insert wiki_entries
    const entryRows = batch.map(r => ({
      slug:       makeSlug(r.make, r.model),
      make:       r.make,
      model:      r.model,
      type:       r.type || 'Custom',
      created_by: null,
      is_sample:  false,
    }));

    const { data: entries, error: entryErr } = await supabase
      .from('wiki_entries')
      .insert(entryRows)
      .select('id, slug');

    if (entryErr) {
      console.error('  Entry insert error:', entryErr.message);
      continue;
    }

    const slugToId = Object.fromEntries(entries.map(e => [e.slug, e.id]));

    // 2. Insert wiki_revisions
    const revRows = batch
      .map(r => {
        const id = slugToId[makeSlug(r.make, r.model)];
        if (!id) return null;
        return {
          entry_id:     id,
          edited_by:    null,
          username:     'RAT BENCH Import',
          edit_summary: r.editSummary || ('Imported from ' + (r.source || 'external database')),
          data:         { make: r.make, model: r.model, type: r.type, ...r.specData },
        };
      })
      .filter(Boolean);

    const { data: revs, error: revErr } = await supabase
      .from('wiki_revisions')
      .insert(revRows)
      .select('id, entry_id');

    if (revErr) {
      console.error('  Revision insert error:', revErr.message);
      continue;
    }

    // 3. Link current_rev_id on each entry
    const updates = revs.map(rev =>
      supabase.from('wiki_entries').update({ current_rev_id: rev.id }).eq('id', rev.entry_id)
    );
    await Promise.all(updates);

    // Mark slugs as existing so caller can track state
    entries.forEach(e => existingSlugs.add(e.slug));

    inserted += entries.length;
    process.stdout.write(`  ✓ ${inserted} inserted so far\r`);
  }

  process.stdout.write('\n');
  return { inserted, skipped: rows.length - fresh.length };
}
