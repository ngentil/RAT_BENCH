/**
 * Training-data seed 13 — Mini Bikes, following the addition of "Mini Bike"
 * as its own machine type (grouped in the MOTO category in machineTypes.js).
 * Four widely-documented, real-world models spanning the category: a modern
 * budget 196cc trail bike, a classic Honda kids'/collector minibike, a
 * modern youth 80cc pit bike, and a classic Chinese-clone 97cc "doodle bug"
 * style bike. Specs verified against manufacturer/parts-retailer listings
 * and owner's manual excerpts — see per-entry notes for anything
 * approximated (e.g. where a private-label engine shares its architecture
 * with a documented Honda GX-series engine) rather than directly confirmed.
 *
 * node scripts/wiki-import/training-data-seed-13-minibikes.mjs
 * node scripts/wiki-import/training-data-seed-13-minibikes.mjs --dry-run
 */

import { fetchExistingSlugs, batchInsert } from './_shared.mjs';

const args     = process.argv.slice(2);
const dryRun   = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit    = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

const SRC = 'RAT BENCH Training Seed';
const SUM = 'Seeded from manufacturer/parts-retailer spec data';

const ENTRIES = [
  {
    make: 'Coleman', model: 'CT200U Trail', type: 'Mini Bike', source: SRC, editSummary: SUM,
    specData: {
      strokeType: '4-stroke', ccSize: '196cc', cylCount: '1', valveTrain: 'Pushrod (OHV)',
      boreDiameter: '68', crankStroke: '54', compressionRatio: '8.5',
      coolingType: 'Air-cooled', fuelSystem: 'Carburettor', fuelTankCapacity: '3.6',
      plugType: 'Torch F7RTC / Champion RN9YC',
      starterType: 'Recoil only', transType: 'Automatic', clutchType: 'Centrifugal',
      tyreFront: 'AT19x7-8', tyreRear: 'AT19x7-8',
      dryWeight: '61',
      notes: 'The most common modern budget trail mini bike — sold through Camping World/Academy/Tractor Supply etc. Engine is a 196cc air-cooled OHV single sharing the Honda GX200 architecture (68×54mm bore/stroke is the standard for that displacement/architecture; compression ratio 8.5:1 carried over from the GX200 family as the closest documented match — Coleman itself doesn\'t publish a compression figure). Ground clearance 5.5", load capacity 200 lbs. Fully automatic — no clutch lever or gear shifter, twist-and-go. Distinct trim from the wiki\'s existing "CT200U-EX" entry — same base 196cc clone engine architecture, but Trail is the original/base model rather than the later EX upgrade.',
    },
  },
  {
    make: 'Honda', model: 'Z50R', type: 'Mini Bike', source: SRC, editSummary: SUM,
    specData: {
      strokeType: '4-stroke', ccSize: '49cc', cylCount: '1', valveTrain: 'OHC',
      boreDiameter: '39', crankStroke: '41.4', compressionRatio: '8.8',
      coolingType: 'Air-cooled', fuelSystem: 'Carburettor', fuelTankCapacity: '3',
      plugType: 'NGK CR6HSA',
      starterType: 'Kickstart',
      transType: '3-speed semi-automatic (foot-shift, no clutch lever)', gearCount: '3',
      forkType: 'Telescopic fork', rearShockType: 'Twin shock',
      frontBrake: 'Drum', rearBrake: 'Drum',
      tyreFront: '3.50-8', tyreRear: '3.50-8',
      dryWeight: '49.5',
      notes: 'Classic Honda "Monkey Bike" lineage kids\'/collector minibike, produced 1979–1999 — one of the most common vintage minibikes still in active repair today. Rated ~1.95 bhp @ 5000 rpm. Kickstart only (no recoil cord, no electric start) — right-side foot lever. Specs given are the widely-cited common figures across the model run; exact valve clearances and torque values varied slightly by production year, check the specific year\'s manual for a full rebuild.',
    },
  },
  {
    make: 'Monster Moto', model: 'MM-B80', type: 'Mini Bike', source: SRC, editSummary: SUM,
    specData: {
      strokeType: '4-stroke', ccSize: '79.5cc', cylCount: '1', valveTrain: 'Pushrod (OHV)',
      coolingType: 'Air-cooled', fuelSystem: 'Carburettor', fuelTankCapacity: '1.1',
      starterType: 'Recoil only', transType: 'Automatic', clutchType: 'Centrifugal',
      rearBrake: 'Disc',
      tyreFront: '14x5.7-6', tyreRear: '14x5.7-6',
      notes: 'Modern youth/entry-level pit bike, badged Lifan 80cc engine (2.5 hp). Automatic, no-shift centrifugal clutch — twist-and-go. Rear disc brake only (cable-actuated, hand lever) — no front brake fitted on this model, worth flagging to a rider used to a front brake. Tyres are 15 psi pneumatic off-road, steel rims. Factory-rated top speed ~23 mph.',
    },
  },
  {
    make: 'Baja', model: 'Doodle Bug DB30', type: 'Mini Bike', source: SRC, editSummary: SUM,
    specData: {
      strokeType: '4-stroke', ccSize: '97cc', cylCount: '1', valveTrain: 'OHC',
      boreDiameter: '56', crankStroke: '40', compressionRatio: '8.5',
      coolingType: 'Air-cooled', fuelSystem: 'Carburettor',
      starterType: 'Recoil only', transType: 'Automatic', clutchType: 'Centrifugal',
      frontBrake: 'Disc', rearBrake: 'Disc',
      tyreFront: '145/70-6', tyreRear: '145/70-6',
      dryWeight: '33.6',
      notes: 'Also sold/rebadged as the Baja Blitz, Dirt Bug and Racer — same 97cc, 2.8hp engine, different frame/cowl styling. Engine shares the Honda GX100 architecture (56×40mm bore/stroke, 8.5:1 compression is the documented GX100 figure) under private-label branding, not a direct Honda part. Most DB30s run front + rear disc brakes; a small number of early-VIN-prefix units (LYOY/L0FG) shipped with a rear drum instead — confirm which is fitted before ordering brake parts. Top speed factory-rated ~30 mph. Distinct, smaller model from the wiki\'s existing 196cc "MB200 Mini Bike" entry — DB30 is Baja\'s ~97cc entry-level line, not the same product.',
    },
  },
];

async function run() {
  console.log(`\n🏍️  Mini Bikes Training Seed${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`    ${ENTRIES.length} entries`);

  const slice = ENTRIES.slice(0, limit);

  console.log('\nFetching existing wiki slugs…');
  const existingSlugs = await fetchExistingSlugs();
  console.log(`  ${existingSlugs.size} entries already in wiki\n`);

  const result = await batchInsert(slice, existingSlugs, { dryRun });
  console.log(`\n✅  Done: ${result.inserted} inserted, ${result.skipped} skipped\n`);
}

run().catch(e => { console.error(e); process.exit(1); });
