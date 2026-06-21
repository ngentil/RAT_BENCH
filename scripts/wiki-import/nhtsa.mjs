/**
 * Import vehicles and motorcycles from the NHTSA VPIC API into the RAT BENCH wiki.
 *
 * Free, no API key. Covers cars, trucks, motorcycles, ATVs.
 * Creates skeleton entries (make + model + type) — engine specs come from
 * user contributions or other import scripts.
 *
 * Usage:
 *   node scripts/wiki-import/nhtsa.mjs
 *   node scripts/wiki-import/nhtsa.mjs --type motorcycle   # only motorcycles
 *   node scripts/wiki-import/nhtsa.mjs --dry-run           # preview counts only
 */

import { supabase, makeSlug, delay, fetchExistingSlugs, batchInsert } from './_shared.mjs';

const BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

// NHTSA vehicle type name → RAT BENCH machine type
const TYPE_MAP = {
  'Motorcycle':                              'Motorcycle',
  'Passenger Car':                           'Vehicle',
  'Multipurpose Passenger Vehicle (MPV)':    'Vehicle',
  'Truck ':                                  'Vehicle',
  'Truck':                                   'Vehicle',
  'Off Road Vehicle':                        'Quad Bike',
  'Incomplete Vehicle':                      'Vehicle',
  'Low Speed Vehicle (LSV)':                 'Vehicle',
  'Bus':                                     'Vehicle',
  'Trailer':                                 'Custom',
  'Snowmobile':                              'Custom',
};

// Vehicle types to import (NHTSA type name)
const IMPORT_TYPES = [
  'Motorcycle',
  'Passenger Car',
  'Multipurpose Passenger Vehicle (MPV)',
  'Truck',
  'Off Road Vehicle',
];

// Parse CLI args
const args = process.argv.slice(2);
const dryRun   = args.includes('--dry-run');
const onlyType = args.find(a => a.startsWith('--type='))?.split('=')[1]
               || (args.includes('--type') ? args[args.indexOf('--type') + 1] : null);

async function vpicGet(path) {
  const res = await fetch(`${BASE}/${path}?format=json`);
  if (!res.ok) throw new Error(`NHTSA HTTP ${res.status}: ${path}`);
  const json = await res.json();
  return json.Results || [];
}

async function getMakesForType(vehicleType) {
  const encoded = encodeURIComponent(vehicleType);
  return vpicGet(`GetMakesForVehicleType/${encoded}`);
}

async function getModelsForMake(makeId) {
  return vpicGet(`GetModelsForMakeId/${makeId}`);
}

async function run() {
  console.log(`\n🚗  NHTSA Wiki Import${dryRun ? ' (DRY RUN)' : ''}`);
  console.log('Fetching existing wiki slugs…');
  const existingSlugs = await fetchExistingSlugs();
  console.log(`  ${existingSlugs.size} entries already in wiki\n`);

  const typesToRun = onlyType
    ? IMPORT_TYPES.filter(t => t.toLowerCase().includes(onlyType.toLowerCase()))
    : IMPORT_TYPES;

  let totalInserted = 0;
  let totalSkipped  = 0;

  for (const vehicleType of typesToRun) {
    const ratType = TYPE_MAP[vehicleType] || 'Vehicle';
    console.log(`\n── ${vehicleType} → "${ratType}" ──`);

    const makes = await getMakesForType(vehicleType);
    console.log(`  ${makes.length} makes found`);

    let typeInserted = 0;
    let typeSkipped  = 0;

    for (let i = 0; i < makes.length; i++) {
      const make = makes[i];
      const makeName = make.MakeName?.trim();
      if (!makeName) continue;

      let models;
      try {
        models = await getModelsForMake(make.MakeId);
      } catch (e) {
        console.error(`  ⚠ Failed models for ${makeName}: ${e.message}`);
        await delay(500);
        continue;
      }

      if (!models.length) {
        await delay(80);
        continue;
      }

      const rows = models
        .filter(m => m.Model_Name?.trim())
        .map(m => ({
          make:        makeName,
          model:       m.Model_Name.trim(),
          type:        ratType,
          specData:    {},
          editSummary: 'Imported from NHTSA VPIC',
          source:      'NHTSA',
        }));

      const result = await batchInsert(rows, existingSlugs, { dryRun });
      typeInserted += result.inserted;
      typeSkipped  += result.skipped;

      if ((i + 1) % 50 === 0) {
        console.log(`  [${i + 1}/${makes.length} makes] +${typeInserted} new, ${typeSkipped} skipped`);
      }

      await delay(120); // ~8 req/sec — well within NHTSA limits
    }

    console.log(`  ✓ ${vehicleType}: ${typeInserted} inserted, ${typeSkipped} skipped`);
    totalInserted += typeInserted;
    totalSkipped  += typeSkipped;
  }

  console.log(`\n✅  Done: ${totalInserted} total inserted, ${totalSkipped} skipped\n`);
}

run().catch(e => { console.error(e); process.exit(1); });
