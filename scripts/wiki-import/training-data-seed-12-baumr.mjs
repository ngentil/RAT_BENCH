/**
 * Training-data seed 12 — Baumr-AG stationary petrol/diesel engines.
 * Sourced from the Baumr-AG "Stationary Engines" user manual (Revision 9.0),
 * covering the full 10-model applicable-models list and its grouped
 * specifications tables (163cc/196cc/210cc petrol, 389cc/407cc petrol,
 * 305cc diesel, 418cc/460cc diesel).
 *
 * node scripts/wiki-import/training-data-seed-12-baumr.mjs
 * node scripts/wiki-import/training-data-seed-12-baumr.mjs --dry-run
 */

import { fetchExistingSlugs, batchInsert } from './_shared.mjs';

const args     = process.argv.slice(2);
const dryRun   = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit    = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

const SRC = 'Baumr-AG Stationary Engines user manual (Rev 9.0)';
const SUM = 'Seeded from manufacturer user manual data';

// Shared spec-table values, grouped exactly as the manual groups them —
// individual entries below only add ccSize/model-specific notes on top.
const PETROL_SMALL = { // 163cc / 196cc / 210cc petrol
  fuelType: 'Unleaded non-ethanol petrol', fuelTankCapacity: '3.6',
  plugType: 'F7TC, F7RTC', plugGap: '0.7 to 0.8mm (0.028 to 0.032")',
  intakeValveClear: '0.15 ± 0.02', exhaustValveClear: '0.2 ± 0.02',
  oilType: 'SAE 10W-30 automotive engine oil (general use)', oilCapacity: '0.6',
};
const PETROL_LARGE = { // 389cc / 407cc petrol
  fuelType: 'Unleaded non-ethanol petrol', fuelTankCapacity: '6',
  plugType: 'F7TC, F7RTC', plugGap: '0.7 to 0.8mm (0.028 to 0.032")',
  intakeValveClear: '0.15 ± 0.02', exhaustValveClear: '0.2 ± 0.02',
  oilType: 'SAE 10W-30 automotive engine oil (general use)', oilCapacity: '1.1',
};
const DIESEL_SMALL = { // 305cc diesel
  fuelType: 'Unleaded non-bio diesel', fuelTankCapacity: '3.5',
  intakeValveClear: '0.15 ± 0.02', exhaustValveClear: '0.15 ± 0.02',
  oilType: 'SAE 10W-30 automotive engine oil (general use)', oilCapacity: '1.1',
};
const DIESEL_LARGE = { // 418cc / 460cc diesel
  fuelType: 'Unleaded non-bio diesel', fuelTankCapacity: '5.5',
  intakeValveClear: '0.15 ± 0.02', exhaustValveClear: '0.15 ± 0.02',
  oilType: 'SAE 10W-30 automotive engine oil (general use)', oilCapacity: '1.6',
};

const ENTRIES = [
  {
    make: 'Baumr-AG', model: 'PFX163', type: 'Standalone Engine', source: SRC, editSummary: SUM,
    specData: {
      strokeType: '4-stroke', ccSize: '163cc', cylCount: '1', coolingType: 'Air-cooled',
      fuelSystem: 'Carburettor', starterType: 'Recoil (pull-start)',
      ...PETROL_SMALL,
      notes: 'Base of the PFX petrol range. Single-cylinder general-purpose engine — common on water pumps, small generators and go-karts. fuelSystem/coolingType inferred (no EFI or liquid-cooling mentioned anywhere in the manual).',
    },
  },
  {
    make: 'Baumr-AG', model: 'ST196', type: 'Standalone Engine', source: SRC, editSummary: SUM,
    specData: {
      strokeType: '4-stroke', ccSize: '196cc', cylCount: '1', coolingType: 'Air-cooled',
      fuelSystem: 'Carburettor', starterType: 'Recoil (pull-start)',
      ...PETROL_SMALL,
      notes: '"ST" line — same 163/196/210cc spec table as the PFX equivalents in this displacement class, distinguished mainly by cowl/frame styling (red engine cover vs PFX\'s black). fuelSystem/coolingType inferred.',
    },
  },
  {
    make: 'Baumr-AG', model: 'PFX210', type: 'Standalone Engine', source: SRC, editSummary: SUM,
    specData: {
      strokeType: '4-stroke', ccSize: '210cc', cylCount: '1', coolingType: 'Air-cooled',
      fuelSystem: 'Carburettor', starterType: 'Recoil (pull-start)',
      ...PETROL_SMALL,
      notes: 'Largest of the 163/196/210cc single-cylinder petrol group. fuelSystem/coolingType inferred.',
    },
  },
  {
    make: 'Baumr-AG', model: 'ST389', type: 'Standalone Engine', source: SRC, editSummary: SUM,
    specData: {
      strokeType: '4-stroke', ccSize: '389cc', cylCount: '1', coolingType: 'Air-cooled',
      fuelSystem: 'Carburettor', starterType: 'Recoil (pull-start)',
      ...PETROL_LARGE,
      notes: 'Bigger-bore "ST" petrol engine — shares the 389/407cc spec table with PFX407. fuelSystem/coolingType inferred.',
    },
  },
  {
    make: 'Baumr-AG', model: 'PFX407', type: 'Standalone Engine', source: SRC, editSummary: SUM,
    specData: {
      strokeType: '4-stroke', ccSize: '407cc', cylCount: '1', coolingType: 'Air-cooled',
      fuelSystem: 'Carburettor', starterType: 'Recoil (pull-start)',
      ...PETROL_LARGE,
      notes: 'Largest single-cylinder petrol engine in the range. fuelSystem/coolingType inferred.',
    },
  },
  {
    make: 'Baumr-AG', model: 'SX450E', type: 'Standalone Engine', source: SRC, editSummary: SUM,
    specData: {
      strokeType: '4-stroke', ccSize: '448cc', cylCount: '1', coolingType: 'Air-cooled',
      fuelSystem: 'Carburettor', starterType: 'Recoil or electric ("E" suffix)',
      ...PETROL_LARGE,
      notes: 'The manual\'s petrol specifications table only goes up to "389cc/407cc" as a group — this is the largest petrol model at 448cc and isn\'t explicitly covered by name in that table, so its fuel tank/plug/valve-clearance/oil figures are the 389/407cc group\'s values carried over as the closest documented match, not a distinct spec block of their own; treat as an approximation pending a dedicated spec sheet. "E" suffix denotes electric start (manual\'s Parts Identification section shows a Starter Motor + Electric Start Module fitted "electric start models" only).',
    },
  },
  {
    make: 'Baumr-AG', model: 'RX305', type: 'Standalone Engine', source: SRC, editSummary: SUM,
    specData: {
      strokeType: '4-stroke', ccSize: '305cc', cylCount: '1', coolingType: 'Air-cooled',
      fuelSystem: 'Diesel injection pump', starterType: 'Recoil (pull-start) + decompression lever',
      ...DIESEL_SMALL,
      notes: '"RX" diesel line, 305cc. Decompression lever eases recoil starting on a diesel\'s higher compression. fuelSystem/coolingType inferred.',
    },
  },
  {
    make: 'Baumr-AG', model: 'PFX305', type: 'Standalone Engine', source: SRC, editSummary: SUM,
    specData: {
      strokeType: '4-stroke', ccSize: '305cc', cylCount: '1', coolingType: 'Air-cooled',
      fuelSystem: 'Diesel injection pump', starterType: 'Recoil (pull-start) + decompression lever',
      ...DIESEL_SMALL,
      notes: 'Same 305cc diesel spec table as RX305 — "PFX" vs "RX" naming distinguishes the frame/cowl line, not the powerplant. fuelSystem/coolingType inferred.',
    },
  },
  {
    make: 'Baumr-AG', model: 'PFX419', type: 'Standalone Engine', source: SRC, editSummary: SUM,
    specData: {
      strokeType: '4-stroke', ccSize: '418cc', cylCount: '1', coolingType: 'Air-cooled',
      fuelSystem: 'Diesel injection pump', starterType: 'Recoil (pull-start) + decompression lever',
      ...DIESEL_LARGE,
      notes: 'Smaller of the two big-bore diesels (418/460cc spec group). fuelSystem/coolingType inferred.',
    },
  },
  {
    make: 'Baumr-AG', model: 'RX460E', type: 'Standalone Engine', source: SRC, editSummary: SUM,
    specData: {
      strokeType: '4-stroke', ccSize: '460cc', cylCount: '1', coolingType: 'Air-cooled',
      fuelSystem: 'Diesel injection pump', starterType: 'Recoil or electric ("E" suffix) + decompression lever',
      ...DIESEL_LARGE,
      notes: 'Largest engine in the manual\'s whole applicable-models list. "E" suffix denotes electric start. fuelSystem/coolingType inferred.',
    },
  },
];

async function run() {
  console.log(`\n🔧  Baumr-AG Stationary Engines Seed${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`    ${ENTRIES.length} entries`);

  const slice = ENTRIES.slice(0, limit);

  console.log('\nFetching existing wiki slugs…');
  const existingSlugs = await fetchExistingSlugs();
  console.log(`  ${existingSlugs.size} entries already in wiki\n`);

  const result = await batchInsert(slice, existingSlugs, { dryRun });
  console.log(`\n✅  Done: ${result.inserted} inserted, ${result.skipped} skipped\n`);
}

run().catch(e => { console.error(e); process.exit(1); });
