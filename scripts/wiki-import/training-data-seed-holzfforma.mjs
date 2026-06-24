/**
 * Holzfforma (Farmertec) chainsaw seed data.
 * Holzfforma saws are OEM-compatible clones produced by Farmertec (China).
 * All parts are interchangeable with the stated OEM model.
 *
 * Sources: Farmertec product listings, made-in-china.com spec sheets,
 * third-party retailers (Wagner's, Tri-Star Supply, Ironshop). Bore/stroke
 * cross-checked against displacement using V = π/4 × bore² × stroke.
 *
 * Run:
 *   node scripts/wiki-import/training-data-seed-holzfforma.mjs
 *   node scripts/wiki-import/training-data-seed-holzfforma.mjs --dry-run
 */

import { fetchExistingSlugs, batchInsert } from './_shared.mjs';

const args   = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

const SRC = 'Holzfforma/Farmertec spec sheets';
const SUM = 'Seeded from Farmertec product data';

const ENTRIES = [

  // ── G372XP — Husqvarna 372 XP compatible ─────────────────────────────────
  {
    make: 'Holzfforma', model: 'G372XP', type: 'Chainsaw', source: SRC, editSummary: SUM,
    specData: {
      strokeType:       '2-stroke',
      ccSize:           '70.7cc',
      boreDiameter:     '50mm',
      crankStroke:      '36mm',
      cylCount:         '1',
      coolingType:      'Air-cooled',
      fuelSystem:       'Carburettor',
      mixRatio:         '25:1',
      fuelTankCapacity: '0.825L',
      weightKg:         '6.3kg',
      idleRpm:          '2800 RPM',
      wotRpm:           '13500 RPM',
      starterType:      'Recoil only',
      chainPitchCS:     '3/8"',
      barGauge:         '.058"',
      sprocketTeethCS:  '7',
      notes: 'OEM-compatible with Husqvarna 372 XP. All cylinder, piston, carb and ignition parts interchangeable. Walbro carb fitted as standard (Zama on base model). PRO variant adds Nikasil-lined cylinder, Meteor piston and Caber rings. Bar oil tank 0.42L. Chain brake and AV system match 372 XP dimensions exactly.',
    },
  },

  // ── G372 — Husqvarna 365 compatible ──────────────────────────────────────
  {
    make: 'Holzfforma', model: 'G372', type: 'Chainsaw', source: SRC, editSummary: SUM,
    specData: {
      strokeType:       '2-stroke',
      ccSize:           '65cc',
      boreDiameter:     '50mm',
      crankStroke:      '33mm',
      cylCount:         '1',
      coolingType:      'Air-cooled',
      fuelSystem:       'Carburettor',
      mixRatio:         '25:1',
      starterType:      'Recoil only',
      chainPitchCS:     '3/8"',
      barGauge:         '.058"',
      notes: 'OEM-compatible with Husqvarna 365. Smaller-bore variant of the G372XP platform. Shares clutch cover, brake assembly, and bar-mount dimensions with G372XP. Often confused with G372XP in listings — verify cylinder bore (50mm vs 50mm, different stroke).',
    },
  },

  // ── G395XP — Husqvarna 394 XP / 395 XP compatible ────────────────────────
  {
    make: 'Holzfforma', model: 'G395XP', type: 'Chainsaw', source: SRC, editSummary: SUM,
    specData: {
      strokeType:       '2-stroke',
      ccSize:           '93.6cc',
      boreDiameter:     '55mm',
      crankStroke:      '39.5mm',
      cylCount:         '1',
      coolingType:      'Air-cooled',
      fuelSystem:       'Carburettor',
      mixRatio:         '25:1',
      weightKg:         '8.1kg',
      idleRpm:          '2800 RPM',
      wotRpm:           '12500 RPM',
      starterType:      'Recoil only',
      chainPitchCS:     '3/8"',
      barGauge:         '.063"',
      notes: 'OEM-compatible with Husqvarna 394 XP and 395 XP. Large-displacement professional bar saw. Bar lengths typically 20–36". Decompression valve fitted. Check crankshaft seals during service — a common failure point on high-hour units.',
    },
  },

  // ── G444 Blue Thunder — Stihl MS440 / 044 compatible ─────────────────────
  {
    make: 'Holzfforma', model: 'G444', type: 'Chainsaw', source: SRC, editSummary: SUM,
    specData: {
      strokeType:       '2-stroke',
      ccSize:           '70.7cc',
      boreDiameter:     '52mm',
      crankStroke:      '33mm',
      cylCount:         '1',
      coolingType:      'Air-cooled',
      fuelSystem:       'Carburettor',
      mixRatio:         '25:1',
      weightKg:         '8kg',
      idleRpm:          '2800 RPM',
      wotRpm:           '11500 RPM',
      starterType:      'Recoil only',
      chainPitchCS:     '3/8"',
      barGauge:         '.063"',
      notes: 'OEM-compatible with Stihl MS440 and 044 Magnum. "Blue Thunder" colour scheme. Bar lengths up to 32". Note: despite same displacement as G372XP (70.7cc), bore and stroke differ — 52mm × 33mm vs 50mm × 36mm. Use MS440-spec gaskets and seals.',
    },
  },

  // ── G466 Blue Thunder — Stihl MS460 / 046 compatible ─────────────────────
  {
    make: 'Holzfforma', model: 'G466', type: 'Chainsaw', source: SRC, editSummary: SUM,
    specData: {
      strokeType:       '2-stroke',
      ccSize:           '76.5cc',
      boreDiameter:     '52mm',
      crankStroke:      '36mm',
      cylCount:         '1',
      coolingType:      'Air-cooled',
      fuelSystem:       'Carburettor',
      mixRatio:         '25:1',
      fuelTankCapacity: '0.825L',
      weightKg:         '8kg',
      idleRpm:          '2800 RPM',
      wotRpm:           '11500 RPM',
      starterType:      'Recoil only',
      chainPitchCS:     '3/8"',
      barGauge:         '.063"',
      notes: 'OEM-compatible with Stihl MS460 and 046. Same 52mm bore as G444 but longer 36mm stroke for larger displacement. Decompression valve fitted. Professional-grade mid-range bar saw; suits 24–32" bars. Chain brake, bar studs and clutch all MS460-spec.',
    },
  },

  // ── G660 Blue Thunder — Stihl MS660 / 066 compatible ─────────────────────
  {
    make: 'Holzfforma', model: 'G660', type: 'Chainsaw', source: SRC, editSummary: SUM,
    specData: {
      strokeType:       '2-stroke',
      ccSize:           '91.6cc',
      boreDiameter:     '54mm',
      crankStroke:      '40mm',
      cylCount:         '1',
      coolingType:      'Air-cooled',
      fuelSystem:       'Carburettor',
      mixRatio:         '25:1',
      fuelTankCapacity: '0.825L',
      weightKg:         '8kg',
      idleRpm:          '2500 RPM',
      wotRpm:           '13500 RPM',
      starterType:      'Recoil only',
      chainPitchCS:     '3/8"',
      barGauge:         '.063"',
      notes: 'OEM-compatible with Stihl MS660 and 066. "Blue Thunder" colour scheme is the standard variant; orange-grey version also available. Bar oil tank 0.36L. Bar lengths 18–36". All MS660 cylinder/piston/carb parts fit. Very popular platform for milling and felling builds.',
    },
  },

  // ── G366 Blue Thunder — Stihl MS361 compatible ───────────────────────────
  {
    make: 'Holzfforma', model: 'G366', type: 'Chainsaw', source: SRC, editSummary: SUM,
    specData: {
      strokeType:       '2-stroke',
      ccSize:           '59cc',
      boreDiameter:     '47mm',
      crankStroke:      '34mm',
      cylCount:         '1',
      coolingType:      'Air-cooled',
      fuelSystem:       'Carburettor',
      mixRatio:         '25:1',
      fuelTankCapacity: '0.68L',
      starterType:      'Recoil only',
      chainPitchCS:     '3/8"',
      barGauge:         '.050"',
      notes: 'OEM-compatible with Stihl MS361. Mid-size professional saw; suits 16–24" bars. Lighter and nimbler than the G444/G466 family. Decompression valve fitted. All MS361 carb, filter and ignition parts interchangeable.',
    },
  },

  // ── G388 Blue Thunder — Stihl MS380 / MS381 compatible ───────────────────
  {
    make: 'Holzfforma', model: 'G388', type: 'Chainsaw', source: SRC, editSummary: SUM,
    specData: {
      strokeType:       '2-stroke',
      ccSize:           '72cc',
      boreDiameter:     '52mm',
      crankStroke:      '34mm',
      cylCount:         '1',
      coolingType:      'Air-cooled',
      fuelSystem:       'Carburettor',
      mixRatio:         '25:1',
      starterType:      'Recoil only',
      chainPitchCS:     '3/8"',
      barGauge:         '.063"',
      notes: 'OEM-compatible with Stihl 038, 038 AV, MS380 and MS381 Magnum. 52mm bore × 34mm stroke — note same bore as G444/G466 but shorter stroke. Bar lengths 16–28". All 038/MS380 series gaskets, seals, and crankshaft parts are compatible.',
    },
  },

  // ── G255 Blue Thunder — Stihl MS250 / MS230 / MS210 compatible ───────────
  {
    make: 'Holzfforma', model: 'G255', type: 'Chainsaw', source: SRC, editSummary: SUM,
    specData: {
      strokeType:       '2-stroke',
      ccSize:           '45.4cc',
      boreDiameter:     '42.5mm',
      crankStroke:      '32mm',
      cylCount:         '1',
      coolingType:      'Air-cooled',
      fuelSystem:       'Carburettor',
      mixRatio:         '25:1',
      fuelTankCapacity: '0.47L',
      weightKg:         '6.5kg',
      idleRpm:          '2800 RPM',
      wotRpm:           '12000 RPM',
      starterType:      'Recoil only',
      chainPitchCS:     '3/8" LP',
      barGauge:         '.050"',
      notes: 'OEM-compatible with Stihl MS250, MS230, and MS210 (023/025 series). Uses 3/8" low-profile (Picco) chain — .050" gauge, 55 drive links on 16" bar. Lightest Holzfforma model. All 025/MS250-series carb, clutch and chain-brake parts fit directly.',
    },
  },

  // ── G888 — Stihl MS880 / 088 compatible ──────────────────────────────────
  {
    make: 'Holzfforma', model: 'G888', type: 'Chainsaw', source: SRC, editSummary: SUM,
    specData: {
      strokeType:       '2-stroke',
      ccSize:           '121.6cc',
      boreDiameter:     '60mm',
      crankStroke:      '43mm',
      cylCount:         '1',
      coolingType:      'Air-cooled',
      fuelSystem:       'Carburettor',
      mixRatio:         '25:1',
      fuelTankCapacity: '1.3L',
      weightKg:         '11.6kg',
      idleRpm:          '2800 RPM',
      wotRpm:           '11000 RPM',
      starterType:      'Recoil only',
      chainPitchCS:     '3/8"',
      barGauge:         '.063"',
      notes: 'OEM-compatible with Stihl MS880 and 088. Largest Holzfforma model. Decompression valve essential — do not attempt cold-start without it. Bar oil tank 0.7L. Suits 28–48" bars for milling and large felling. MS880-spec pistons, rings, and bearings all fit.',
    },
  },

];

async function main() {
  console.log(`Holzfforma seed — ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Entries to process: ${ENTRIES.length}`);

  const existingSlugs = await fetchExistingSlugs();
  console.log(`Existing wiki entries: ${existingSlugs.size}`);

  const { inserted, skipped } = await batchInsert(ENTRIES, existingSlugs, { dryRun });
  console.log(`\nInserted: ${inserted}  Skipped (dup): ${skipped}`);
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
