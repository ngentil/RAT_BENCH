#!/usr/bin/env node
// Awards +1 to a wiki photo's uploader once it has survived 30 days without
// being reported/hidden — paid on a delay rather than at upload time, so
// there's no incentive to spam-upload and move on before anyone checks.
//
// Idempotent: wiki_points_ledger has a unique index on
// (user_id, ref_table, ref_id, action), so re-running this against a photo
// that already got paid just hits a unique-violation (23505) and is skipped
// — safe to run daily via the scheduled workflow or by hand.
//
// Usage:
//   node scripts/wiki-import/award-photo-survival-points.mjs [--dry-run]

import { supabase } from './_shared.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

async function main() {
  const { data: photos, error } = await supabase
    .from('wiki_entry_photos')
    .select('id, entry_id, uploaded_by, created_at')
    .eq('status', 'live')
    .lte('created_at', THIRTY_DAYS_AGO)
    .not('uploaded_by', 'is', null);

  if (error) throw error;

  console.log(`Found ${photos?.length || 0} live photo(s) older than 30 days.`);

  let awarded = 0;
  let alreadyPaid = 0;

  for (const photo of photos || []) {
    if (DRY_RUN) {
      console.log(`  [dry-run] would award +1 to ${photo.uploaded_by} for photo ${photo.id}`);
      continue;
    }

    const { error: insErr } = await supabase.from('wiki_points_ledger').insert({
      user_id: photo.uploaded_by,
      entry_id: photo.entry_id,
      ref_table: 'wiki_entry_photos',
      ref_id: photo.id,
      action: 'photo_survived',
      points: 1,
    });

    if (insErr) {
      if (insErr.code === '23505') { alreadyPaid++; continue; }
      console.error(`  insert error for photo ${photo.id}:`, insErr.message);
      continue;
    }

    awarded++;
  }

  console.log(`Done. Awarded: ${awarded}, already paid: ${alreadyPaid}.`);
}

main().catch(e => { console.error(e); process.exit(1); });
