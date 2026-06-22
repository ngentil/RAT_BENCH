/**
 * Training-data seed for power equipment not covered by free databases.
 * Covers: Stihl, Husqvarna, Echo, Honda GX, Briggs & Stratton, Kawasaki FX/FJ,
 * Kohler Command/Courage, Poulan Pro, Redmax, Shindaiwa, Tanaka, Yamaha outboards.
 *
 * Run:
 *   node scripts/wiki-import/training-data-seed.mjs
 *   node scripts/wiki-import/training-data-seed.mjs --dry-run
 *   node scripts/wiki-import/training-data-seed.mjs --limit=50
 */

import { fetchExistingSlugs, batchInsert } from './_shared.mjs';

const args     = process.argv.slice(2);
const dryRun   = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit    = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

const SRC  = 'RAT BENCH Training Seed';
const SUM  = 'Seeded from manufacturer service manual data';

// ─────────────────────────────────────────────────────────────────────────────
// ENTRIES
// ─────────────────────────────────────────────────────────────────────────────
const ENTRIES = [

  // ── STIHL — Chainsaws ──────────────────────────────────────────────────────
  {
    make:'Stihl', model:'MS 170', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'30.1cc', boreDiameter:'37mm', crankStroke:'28mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.25L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Entry-level consumer saw. Bar oil tank: 0.145L. Common faults: clogged spark arrestor screen, cracked primer bulb, worn AV buffers. Decompression valve not fitted — use pull-start technique only. Carb model Zama C1Q-S236. Do not bore above 37.5mm without replacing piston.',
    },
  },
  {
    make:'Stihl', model:'MS 180', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'31.8cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.25L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Shares body with MS 170 but larger cylinder. Bar oil: 0.145L. Carb Zama C1Q-S269/S270. Very common in DIY market — chain brake spring and oil pump worm gear are the two most frequent replacements.',
    },
  },
  {
    make:'Stihl', model:'MS 211', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'35.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.31L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
    },
  },
  {
    make:'Stihl', model:'MS 231', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'40.6cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.47L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Replaced MS 230. Farm/property saw. Bar oil: 0.26L. Ematic bar lubrication system standard.',
    },
  },
  {
    make:'Stihl', model:'MS 251', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'45.6cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.47L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Replaced MS 250. Easy2Start (E) variant has additional spring in recoil. Bar oil: 0.26L.',
    },
  },
  {
    make:'Stihl', model:'MS 271', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'50.2cc', boreDiameter:'46mm', crankStroke:'30.1mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.51L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', wotRpm:'14100 RPM (no load)', starterType:'Recoil',
      notes:'Farm Boss class. Bar oil: 0.26L. Carb Zama C1Q-S255. Common leak: oil pump cover O-ring. Handles up to 20 in bar. Anti-vibration system with four-point mounting.',
    },
  },
  {
    make:'Stihl', model:'MS 291', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'55.5cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.51L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Farm/property use. Handles 18–20 in bar comfortably. Bar oil: 0.32L.',
    },
  },
  {
    make:'Stihl', model:'MS 311', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'59.0cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.51L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
    },
  },
  {
    make:'Stihl', model:'MS 362', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'59.0cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.51L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Pro-spec version of 59cc class. M-Tronic (M) variant available. Advanced anti-vibration system. Air Injection pre-cleaner system extends filter life 5×. Bar oil: 0.32L.',
    },
  },
  {
    make:'Stihl', model:'MS 391', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'64.1cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.65L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Handles up to 25 in bar. Bar oil: 0.32L. Chain brake uses inertia trigger. Popular in arboriculture.',
    },
  },
  {
    make:'Stihl', model:'MS 441', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'70.7cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.85L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2500 RPM', starterType:'Recoil (with decompression valve)',
      notes:'Pro felling saw. M-Tronic and C (wrap handle) variants. Bar oil: 0.52L. Decompression valve — always activate before cold start. Air Injection system standard. Power: 4.0 kW.',
    },
  },
  {
    make:'Stihl', model:'MS 461', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'76.5cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.85L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2500 RPM', starterType:'Recoil (with decompression valve)',
      notes:'Magnesium crankcase reduces weight. Power: 4.4 kW. Handles up to 36 in bar. Bar oil: 0.52L.',
    },
  },
  {
    make:'Stihl', model:'MS 500i', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'79.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Electronic fuel injection (Stihl iQ)',
      mixRatio:'50:1', fuelTankCapacity:'0.85L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2500 RPM', starterType:'Recoil (with decompression valve)',
      notes:'First Stihl chainsaw with electronic injection. Injection system requires Stihl diagnostic tool (ISTA) for throttle body calibration and sensor fault reading. Power: 5.0 kW. Do NOT use inline carb tools — injection rail is pressurised. Bar oil: 0.52L.',
    },
  },
  {
    make:'Stihl', model:'MS 660', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'91.6cc', boreDiameter:'54mm', crankStroke:'40mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.85L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2500 RPM', starterType:'Recoil (with decompression valve)',
      notes:'Magnum pro felling saw, widely used in timber industry. Power: 5.2 kW. Bar oil: 0.52L. Decompression valve — critical to prevent pull-cord arm injury. Common failure: oil pump drive worm; replace every top-end rebuild. Carb: Walbro HD-18. Accepts up to 36 in bar.',
    },
  },
  {
    make:'Stihl', model:'MS 661', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'91.1cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor (M-Tronic option)',
      mixRatio:'50:1', fuelTankCapacity:'0.85L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2500 RPM', starterType:'Recoil (with decompression valve)',
      notes:'Successor to MS 660. M-Tronic variant (MS 661 M) features electronic carburetor management — adjusts automatically for altitude, temperature, and fuel quality. Power: 5.4 kW.',
    },
  },
  {
    make:'Stihl', model:'MS 880', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'121.6cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'1.35L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2200 RPM', starterType:'Recoil (with decompression valve)',
      notes:'Largest production Stihl chainsaw. Power: 6.4 kW. Designed for extreme timber and milling. Bar oil: 1.0L. Minimum bar length: 25 in. Weight: 9.8 kg without bar.',
    },
  },

  // ── STIHL — Trimmers ──────────────────────────────────────────────────────
  {
    make:'Stihl', model:'FS 38', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'27.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.23L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Entry trimmer. Straight shaft. Zama C1Q-S68G carb common. Primer bulb location on rear handle — common crack point from UV exposure.',
    },
  },
  {
    make:'Stihl', model:'FS 45', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'27.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.23L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
    },
  },
  {
    make:'Stihl', model:'FS 55', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'27.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.23L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Step up from FS 45 with larger head options. Accepts full range of Stihl FS accessories via gear head.',
    },
  },
  {
    make:'Stihl', model:'FS 90', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'28.4cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor (4-MIX)',
      mixRatio:'50:1 (4-MIX — premix is the engine lubricant)',
      fuelTankCapacity:'0.33L',
      plugType:'NGK CMR6H', plugGap:'0.50mm',
      idleRpm:'2500 RPM', starterType:'Recoil',
      notes:'4-MIX engine: genuine 4-stroke cycle, no separate oil sump — premixed fuel lubricates valve train via crankcase mist. Do NOT run on unmixed fuel or engine will seize. Power: 1.0 kW. Smoother and quieter than 2-stroke class. Common fault: clogged intake valve due to carbon from premix — decarbonize every 150 hrs.',
    },
  },
  {
    make:'Stihl', model:'FS 111', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'36.3cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor (4-MIX)',
      mixRatio:'50:1 (4-MIX)', fuelTankCapacity:'0.37L',
      plugType:'NGK CMR6H', plugGap:'0.50mm',
      idleRpm:'2500 RPM', starterType:'Recoil',
      notes:'Professional 4-MIX trimmer. Power: 1.3 kW. Same 4-MIX note as FS 90 — premix lubricates valve gear. Valve clearance check: Intake 0.10mm, Exhaust 0.15mm every 200 hrs.',
    },
  },
  {
    make:'Stihl', model:'FS 131', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'36.3cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor (4-MIX)',
      mixRatio:'50:1 (4-MIX)', fuelTankCapacity:'0.37L',
      plugType:'NGK CMR6H', plugGap:'0.50mm',
      idleRpm:'2500 RPM', starterType:'Recoil',
      notes:'High-torque 4-MIX commercial trimmer. Power: 1.3 kW. Bike handle configuration standard.',
    },
  },
  {
    make:'Stihl', model:'FS 250', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'40.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.55L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Heavy-duty 2-stroke brush cutter. Power: 1.7 kW. Designed for clearing heavy scrub with blade or metal brush attachment.',
    },
  },

  // ── STIHL — Blowers ───────────────────────────────────────────────────────
  {
    make:'Stihl', model:'BG 56', type:'Blower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'27.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.41L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Handheld blower. Max air velocity: 64 m/s. Zama C1Q series carb.',
    },
  },
  {
    make:'Stihl', model:'BG 86', type:'Blower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'27.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.41L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Higher-output version of BG 56. Max air velocity: 73 m/s. Anti-clog filter system.',
    },
  },
  {
    make:'Stihl', model:'BR 350', type:'Blower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'63.3cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'1.5L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Professional backpack blower. Max air velocity: 73 m/s. Padded harness.',
    },
  },
  {
    make:'Stihl', model:'BR 450', type:'Blower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'63.3cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'1.73L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Professional backpack blower. Max air velocity: 82 m/s. Power: 3.0 kW.',
    },
  },
  {
    make:'Stihl', model:'BR 600', type:'Blower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'64.8cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor (4-MIX)',
      mixRatio:'50:1 (4-MIX)', fuelTankCapacity:'1.73L',
      plugType:'NGK CMR6H', plugGap:'0.50mm',
      idleRpm:'2500 RPM', starterType:'Recoil',
      notes:'4-MIX backpack blower. Power: 3.1 kW. Max air velocity: 86 m/s. Very low emissions — often used in noise/emission-sensitive areas. Same 4-MIX premix requirement as FS 90.',
    },
  },

  // ── STIHL — Cut-off Saws ─────────────────────────────────────────────────
  {
    make:'Stihl', model:'TS 410', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'66.7cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.83L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil (with decompression valve)',
      notes:'Cut-off saw (abrasive disc or diamond blade). Power: 2.8 kW. Water attachment port for wet cutting. Guard and spindle assembly: check for disc flange torque (M10 bolt, 25 Nm). Air filter is critical — masonry dust destroys piston rings quickly without proper maintenance.',
    },
  },
  {
    make:'Stihl', model:'TS 420', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'66.7cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.83L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil (with decompression valve)',
      notes:'Larger disc capacity than TS 410 (350mm vs 300mm blade). Otherwise shares engine and most parts. Water connection standard.',
    },
  },

  // ── HUSQVARNA — Chainsaws ─────────────────────────────────────────────────
  {
    make:'Husqvarna', model:'120', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'38.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.37L',
      plugType:'Champion RCJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil (Smart Start)',
      notes:'Consumer entry saw. Handles up to 16 in bar. Bar oil: 0.21L.',
    },
  },
  {
    make:'Husqvarna', model:'135', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'38.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.37L',
      plugType:'Champion RCJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil (Smart Start)',
    },
  },
  {
    make:'Husqvarna', model:'235', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'34.4cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.37L',
      plugType:'Champion RCJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil (Smart Start)',
      notes:'Low-kickback model. LowVib anti-vibration. Recommended for light homeowner use.',
    },
  },
  {
    make:'Husqvarna', model:'240', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'38.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.37L',
      plugType:'Champion RCJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil (Smart Start)',
      notes:'Very common homeowner saw. XTorq engine reduces fuel consumption and emissions. Common fault: chain brake band stretched — check activation force annually.',
    },
  },
  {
    make:'Husqvarna', model:'346 XP', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'45.7cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.51L',
      plugType:'Champion RCJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', wotRpm:'9600 RPM', starterType:'Recoil',
      notes:'Pro class mid-range saw. Centrifugal air cleaning (CAC) system. Handles 18 in bar comfortably. Bar oil: 0.32L.',
    },
  },
  {
    make:'Husqvarna', model:'353', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'53.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.55L',
      plugType:'Champion RCJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil',
    },
  },
  {
    make:'Husqvarna', model:'365', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'65.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.75L',
      plugType:'Champion CJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil (with decompression valve)',
      notes:'Professional felling saw. Power: 3.4 kW. LowVib X-Torq. Bar oil: 0.46L. Decompression valve standard.',
    },
  },
  {
    make:'Husqvarna', model:'372 XP', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'70.7cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.75L',
      plugType:'Champion CJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil (with decompression valve)',
      notes:'Flagship pro saw. Power: 3.7 kW. Magnesium crankcase. Accepts up to 28 in bar. CAC air filtration. Bar oil: 0.46L. Common replacement: bar adjustment screw, chain brake band.',
    },
  },
  {
    make:'Husqvarna', model:'390 XP', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'87.9cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.85L',
      plugType:'Champion CJ7Y', plugGap:'0.50mm',
      idleRpm:'2500 RPM', starterType:'Recoil (with decompression valve)',
      notes:'Large felling saw. Power: 4.8 kW. Disc water pump connection for wet cutting. Bar oil: 0.62L.',
    },
  },
  {
    make:'Husqvarna', model:'395 XP', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'93.6cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.85L',
      plugType:'Champion CJ7Y', plugGap:'0.50mm',
      idleRpm:'2500 RPM', starterType:'Recoil (with decompression valve)',
      notes:'Largest production Husqvarna chainsaw. Power: 5.2 kW. Used in timber harvesting. Bar oil: 0.62L.',
    },
  },
  {
    make:'Husqvarna', model:'450', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'50.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.51L',
      plugType:'Champion RCJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil (Smart Start)',
      notes:'Prosumer saw. X-Torq, Smart Start, AutoTune (adjusts carb automatically on newer variants). Bar oil: 0.32L.',
    },
  },
  {
    make:'Husqvarna', model:'460 Rancher', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'60.3cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.65L',
      plugType:'Champion RCJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil (Smart Start)',
      notes:'Farm and ranch saw. Handles up to 24 in bar. Bar oil: 0.40L.',
    },
  },
  {
    make:'Husqvarna', model:'562 XP', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'59.8cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.65L',
      plugType:'Champion CJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil',
      notes:'X-CUT chain system. Air Purge system purges air from fuel system and carb for faster cold starts.',
    },
  },
  {
    make:'Husqvarna', model:'572 XP', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'70.6cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.75L',
      plugType:'Champion CJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil (with decompression valve)',
      notes:'Next-generation pro saw. Power: 4.0 kW. X-Torq, AutoTune, Air Purge. Designed to replace 372 XP.',
    },
  },

  // ── HUSQVARNA — Trimmers ──────────────────────────────────────────────────
  {
    make:'Husqvarna', model:'122L', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'21.7cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.40L',
      plugType:'Champion RCJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil (Smart Start)',
    },
  },
  {
    make:'Husqvarna', model:'125L', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'28.0cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.40L',
      plugType:'Champion RCJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil (Smart Start)',
    },
  },
  {
    make:'Husqvarna', model:'128LD', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'28.0cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.40L',
      plugType:'Champion RCJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil (Smart Start)',
      notes:'Detachable shaft allows multi-attachment use. Attachment fitting: universal splined collar.',
    },
  },
  {
    make:'Husqvarna', model:'325L', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'24.5cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.40L',
      plugType:'Champion RCJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil (Smart Start)',
    },
  },

  // ── HUSQVARNA — Blowers ───────────────────────────────────────────────────
  {
    make:'Husqvarna', model:'125B', type:'Blower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'28.0cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.47L',
      plugType:'Champion RCJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil (Smart Start)',
      notes:'Handheld blower. Max air velocity: 67 m/s. Smart Start and purge bulb.',
    },
  },
  {
    make:'Husqvarna', model:'150BT', type:'Blower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'50.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.92L',
      plugType:'Champion RCJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil',
      notes:'Pro backpack blower. Max air velocity: 76 m/s.',
    },
  },
  {
    make:'Husqvarna', model:'350BT', type:'Blower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'50.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'1.2L',
      plugType:'Champion RCJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil',
    },
  },

  // ── ECHO — Chainsaws ──────────────────────────────────────────────────────
  {
    make:'Echo', model:'CS-310', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'30.5cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.29L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2900 RPM', starterType:'Recoil (i-30 low effort)',
      notes:'Consumer entry chainsaw. i-30 starter reduces pull effort by 30%. Bar oil: 0.21L.',
    },
  },
  {
    make:'Echo', model:'CS-352', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'34.4cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.37L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2900 RPM', starterType:'Recoil',
    },
  },
  {
    make:'Echo', model:'CS-400', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'40.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.44L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2900 RPM', starterType:'Recoil',
      notes:'Mid-range prosumer saw. Handles 16–18 in bar. Power: 2.0 kW. Bar oil: 0.29L.',
    },
  },
  {
    make:'Echo', model:'CS-490', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'50.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.52L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2900 RPM', starterType:'Recoil',
      notes:'Popular farm/property saw. Power: 2.2 kW. 20 in bar standard.',
    },
  },
  {
    make:'Echo', model:'CS-501P', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'50.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.52L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2900 RPM', starterType:'Recoil',
      notes:'Pro class. Spring-loaded chain tensioner. G-Force engine air pre-cleaner.',
    },
  },
  {
    make:'Echo', model:'CS-600P', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'59.8cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.65L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Pro felling saw. Power: 3.0 kW. Tool-free chain adjustment and cover.',
    },
  },
  {
    make:'Echo', model:'CS-800P', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'79.9cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.94L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2800 RPM', starterType:'Recoil (with decompression valve)',
      notes:'Large pro felling/milling saw. Power: 4.3 kW.',
    },
  },

  // ── ECHO — Trimmers ───────────────────────────────────────────────────────
  {
    make:'Echo', model:'SRM-225', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'21.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.49L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2900 RPM', wotRpm:'7500 RPM', starterType:'Recoil (i-30)',
      notes:'Best-selling trimmer in the US. Speed-Feed 400 head standard. Common repairs: fuel line (replace both lines every 2 years, ethanol degrades them), primer bulb. Carb: Zama C1U-K52.',
    },
  },
  {
    make:'Echo', model:'SRM-266', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'25.4cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.49L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2900 RPM', starterType:'Recoil',
    },
  },
  {
    make:'Echo', model:'SRM-280', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'28.1cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.49L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2900 RPM', starterType:'Recoil',
    },
  },
  {
    make:'Echo', model:'SRM-3020T', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'30.5cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      fuelTankCapacity:'0.52L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'4-stroke trimmer. Separate oil sump — oil fill cap on underside of engine. Oil capacity: 90mL. Use SAE 10W-30. No premix required. Lower emissions than 2-stroke equivalents.',
    },
  },

  // ── ECHO — Blowers ────────────────────────────────────────────────────────
  {
    make:'Echo', model:'PB-250LN', type:'Blower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'25.4cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.48L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2900 RPM', starterType:'Recoil (i-30)',
      notes:'Low-noise blower. Max air velocity: 64 m/s.',
    },
  },
  {
    make:'Echo', model:'PB-500H', type:'Blower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'50.8cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'1.27L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Backpack blower. Max air velocity: 78 m/s.',
    },
  },
  {
    make:'Echo', model:'PB-580H', type:'Blower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'58.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'1.27L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Professional backpack blower. Max air velocity: 84 m/s.',
    },
  },
  {
    make:'Echo', model:'PB-770T', type:'Blower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'63.3cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'1.27L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'High-output professional backpack blower. Tube-mounted throttle. Max air velocity: 92 m/s.',
    },
  },

  // ── ECHO — Hedge Trimmers ─────────────────────────────────────────────────
  {
    make:'Echo', model:'HC-155', type:'Hedge Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'21.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.41L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2900 RPM', starterType:'Recoil (i-30)',
      notes:'Single-sided 24 in blade. Blade tip clearance: 16mm.',
    },
  },

  // ── HONDA — GX Series Engines ──────────────────────────────────────────────
  {
    make:'Honda', model:'GX35', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'35.8cc', boreDiameter:'39mm', crankStroke:'30mm',
      cylCount:'1', compressionRatio:'8.0:1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      fuelTankCapacity:'0.58L',
      plugType:'NGK CMR5H', plugGap:'0.60–0.70mm',
      idleRpm:'1500 RPM', wotRpm:'7000 RPM',
      valveTrain:'OHC — 2 valves per cylinder',
      intakeValveClear:'0.10mm (cold)', exhaustValveClear:'0.10mm (cold)',
      starterType:'Recoil',
      notes:'Mini 4-stroke used in Honda HHH handheld tools (trimmers, hedgers, brush cutters). OHC design keeps vibration low. Oil type: SAE 10W-30. Oil capacity: 100mL — overfilling fouls plug. No dipstick — tilt to level line. Common fault: cracked head casting from overtorque of cover bolts (torque: 10 Nm).',
    },
  },
  {
    make:'Honda', model:'GX120', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'118cc', boreDiameter:'60mm', crankStroke:'42mm',
      cylCount:'1', compressionRatio:'8.5:1', compression:'140–170 PSI',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      fuelTankCapacity:'0.92L',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV — 2 valves per cylinder',
      intakeValveClear:'0.15mm (cold)', exhaustValveClear:'0.20mm (cold)',
      starterType:'Recoil', weightKg:'9.3',
      notes:'3.5HP general-purpose engine. Keihin carb. Oil capacity: 0.55L. Change at 20 hr break-in then every 100 hrs. SAE 10W-30 above 0°C. Horizontal shaft standard; vertical shaft variant is GC120 (different valve arrangement). Common clone: Loncin G120.',
    },
  },
  {
    make:'Honda', model:'GX160', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'163cc', boreDiameter:'68mm', crankStroke:'45mm',
      cylCount:'1', compressionRatio:'8.5:1', compression:'140–170 PSI',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      fuelTankCapacity:'1.1L',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV — 2 valves per cylinder',
      intakeValveClear:'0.15mm (cold)', exhaustValveClear:'0.20mm (cold)',
      starterType:'Recoil', weightKg:'12.2',
      notes:'5.5HP. One of the most widely cloned small engines (DuroMax XP5.5HP, Predator 173cc, Lifan LF168F-2, etc.). Clone pistons not always interchangeable — measure bore before ordering. Oil: 0.6L SAE 10W-30. Max torque: 10.2 Nm @ 2500 RPM.',
    },
  },
  {
    make:'Honda', model:'GX270', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'270cc', boreDiameter:'77mm', crankStroke:'58mm',
      cylCount:'1', compressionRatio:'8.2:1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      fuelTankCapacity:'3.1L',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV — 2 valves per cylinder',
      intakeValveClear:'0.15mm (cold)', exhaustValveClear:'0.20mm (cold)',
      starterType:'Recoil', weightKg:'17.8',
      notes:'9HP. Common in heavy-duty generators, pressure washers, water pumps, chippers. Oil capacity: 1.1L. Electric start variant: GX270T. Governor spring specification important for rpm stability — replace if erratic hunting occurs.',
    },
  },
  {
    make:'Honda', model:'GX340', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'337cc', boreDiameter:'82mm', crankStroke:'63.6mm',
      cylCount:'1', compressionRatio:'8.2:1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      fuelTankCapacity:'3.1L',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV — 2 valves per cylinder',
      intakeValveClear:'0.15mm (cold)', exhaustValveClear:'0.20mm (cold)',
      starterType:'Recoil or electric', weightKg:'21.4',
      notes:'11HP. Same stroke as GX390, shorter bore. Widely used in ride-on mowers, tillers, generators. Oil: 1.1L. Drain plug is 14mm.',
    },
  },
  {
    make:'Honda', model:'GX390', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'389cc', boreDiameter:'88mm', crankStroke:'64mm',
      cylCount:'1', compressionRatio:'8.2:1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      fuelTankCapacity:'3.1L',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV — 2 valves per cylinder',
      intakeValveClear:'0.15mm (cold)', exhaustValveClear:'0.20mm (cold)',
      starterType:'Recoil or electric', weightKg:'26.8',
      notes:'13HP. High-output industrial engine. Common in large generators, concrete mixers, log splitters, pumps. Oil: 1.1L. Coil air gap: 0.2–0.4mm. Keihin BB carb. Clone replacement: Lifan LF390 shares bore/stroke. Check for crankshaft keyway damage from sudden load stops.',
    },
  },
  {
    make:'Honda', model:'GX630', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'688cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      fuelTankCapacity:'5.8L',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV — 2 valves per cylinder',
      intakeValveClear:'0.15mm (cold)', exhaustValveClear:'0.20mm (cold)',
      starterType:'Electric', weightKg:'38.6',
      notes:'20HP V-twin OHV. Used in ride-on mowers, ground care equipment. Oil: 1.5L. Firing order: 1–2 (cylinder 1 = flywheel side). Valve cover torque: 12 Nm. Check ignition pulse generator air gap (0.3–0.8mm) if intermittent spark.',
    },
  },
  {
    make:'Honda', model:'GX690', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'688cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      fuelTankCapacity:'6.0L',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV — 2 valves per cylinder',
      starterType:'Electric', weightKg:'40.6',
      notes:'22HP V-twin. Higher output than GX630 — different carb jetting and ignition advance. Common in commercial mowers.',
    },
  },

  // ── BRIGGS & STRATTON ──────────────────────────────────────────────────────
  {
    make:'Briggs & Stratton', model:'450E Series', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'127cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1750 RPM', wotRpm:'3100 RPM',
      starterType:'Recoil',
      notes:'Entry push mower engine. OHV. Plastic fuel tank. Common faults: fuel tank crack, carb float stuck. Oil: SAE 30 or 10W-30 (0.47L). No low-oil warning. Replace air filter every 25 hrs in dusty conditions.',
    },
  },
  {
    make:'Briggs & Stratton', model:'500E Series', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'140cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1750 RPM', wotRpm:'3100 RPM',
      starterType:'Recoil',
      notes:'140cc OHV. Common in entry Husqvarna, Ariens, and Murray mowers. Oil: 0.47L SAE 30.',
    },
  },
  {
    make:'Briggs & Stratton', model:'550EX Series', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'140cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      wotRpm:'3100 RPM', starterType:'Recoil',
      notes:'140cc OHV. ReadyStart — no choke required. Carb has sealed emulsion tube — must replace carb assembly (not rebuildable).',
    },
  },
  {
    make:'Briggs & Stratton', model:'675EX Series', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'190cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1750 RPM', wotRpm:'3100 RPM',
      starterType:'Recoil',
      notes:'190cc OHV. ReadyStart choke-free system. Oil: 0.6L SAE 30 or 10W-30. Very common in self-propelled Toro and Troy-Bilt mowers.',
    },
  },
  {
    make:'Briggs & Stratton', model:'725EXi Series', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'224cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      wotRpm:'3100 RPM', starterType:'Recoil',
      notes:'224cc OHV EXi series. Used in premium walk-behind mowers. Oil: 0.6L. Equipped with ReadyStart and StayClean filter.',
    },
  },
  {
    make:'Briggs & Stratton', model:'Vanguard 23 HP', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'627cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      starterType:'Electric',
      notes:'V-twin OHV commercial engine. Used in Toro, Husqvarna, and Scag commercial ZTRs and stand-on mowers. Oil: 1.3L. Dual air filter system. Check for intake manifold crack between cylinders — common after overheating. Ignition module air gap: 0.20–0.30mm.',
    },
  },
  {
    make:'Briggs & Stratton', model:'Vanguard 35 HP', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'993cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      wotRpm:'3600 RPM', starterType:'Electric',
      notes:'Big-block commercial V-twin. Used in large ZTR mowers and chippers. Oil: 1.7L.',
    },
  },
  {
    make:'Briggs & Stratton', model:'Intek 190', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'190cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1750 RPM', wotRpm:'3100 RPM',
      starterType:'Recoil',
      notes:'OHV Intek cast-iron cylinder. More durable than plastic-cylinder EX series. Common in Ariens and Husqvarna walk-behind mowers.',
    },
  },

  // ── KAWASAKI — FX Series (Commercial ZTR) ─────────────────────────────────
  {
    make:'Kawasaki', model:'FX481V', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'481cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK RC12YC', plugGap:'0.76mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV', starterType:'Electric',
      notes:'V-twin OHV. Used in commercial ZTR mowers. Oil: 1.3L SAE 10W-40. Dual element air filter.',
    },
  },
  {
    make:'Kawasaki', model:'FX600V', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'603cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK RC12YC', plugGap:'0.76mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV', starterType:'Electric',
      notes:'19HP V-twin. Widely used in Scag, Husqvarna, Bob-Cat, Gravely ZTR mowers. Oil: 1.5L. Valve clearance: Intake 0.15mm, Exhaust 0.20mm. Common issue: hydraulic lifter tick on cold start — use correct viscosity oil.',
    },
  },
  {
    make:'Kawasaki', model:'FX651V', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'651cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK RC12YC', plugGap:'0.76mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV', starterType:'Electric',
    },
  },
  {
    make:'Kawasaki', model:'FX691V', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'691cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK RC12YC', plugGap:'0.76mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV', starterType:'Electric',
      notes:'22HP V-twin. Industry-standard commercial ZTR engine. Valve clearance: Intake 0.15mm, Exhaust 0.20mm. Oil: 1.5L. Replace spark plugs every 100 hrs. Timing belt-free (direct cam drive).',
    },
  },
  {
    make:'Kawasaki', model:'FX730V', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'726cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK RC12YC', plugGap:'0.76mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV', starterType:'Electric',
    },
  },
  {
    make:'Kawasaki', model:'FX801V', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'801cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK RC12YC', plugGap:'0.76mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV', starterType:'Electric',
      notes:'25.5HP V-twin. Used in large-deck commercial mowers. Oil: 1.9L.',
    },
  },
  {
    make:'Kawasaki', model:'FX850V', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'852cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK RC12YC', plugGap:'0.76mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV', starterType:'Electric',
      notes:'27HP V-twin. Used in Scag Tiger and similar heavy-duty ZTRs.',
    },
  },
  {
    make:'Kawasaki', model:'FX921V', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'921cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK RC12YC', plugGap:'0.76mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV', starterType:'Electric',
      notes:'31HP V-twin. Largest Kawasaki FX series. Used in heavy-duty commercial ZTR and stump grinders.',
    },
  },
  {
    make:'Kawasaki', model:'FJ180V', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'179cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK RC12YC', plugGap:'0.76mm',
      wotRpm:'3600 RPM', starterType:'Recoil',
      notes:'4.5HP OHV single. Common in walk-behind mowers and small generators. Vertical shaft.',
    },
  },

  // ── KOHLER — Command / Courage ────────────────────────────────────────────
  {
    make:'Kohler', model:'CV200', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'194cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      wotRpm:'3600 RPM', starterType:'Recoil',
      notes:'Courage OHV series. Common in walk-behind mowers. Oil: 0.59L SAE 10W-30.',
    },
  },
  {
    make:'Kohler', model:'SV540', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'541cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV', starterType:'Electric',
      notes:'Courage Pro 17-18HP OHV single. Common in Troy-Bilt and Craftsman riders. Oil: 1.4L. Ignition module air gap: 0.20–0.30mm. Common failure: rocker arm loosening — check torque (8.5 Nm) every 200 hrs.',
    },
  },
  {
    make:'Kohler', model:'SV590', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'590cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV', starterType:'Electric',
    },
  },
  {
    make:'Kohler', model:'CH440', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'429cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      wotRpm:'3600 RPM', starterType:'Recoil or electric',
      notes:'Command Pro 14-15HP OHV. Used in pressure washers, generators, log splitters. Horizontal shaft. Oil: 1.3L.',
    },
  },
  {
    make:'Kohler', model:'CH620', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'624cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV', starterType:'Electric',
      notes:'Command 18HP V-twin. Oil: 1.7L. Used in Husqvarna, Ariens, and Cub Cadet riders. Ignition module gap: 0.20–0.30mm.',
    },
  },
  {
    make:'Kohler', model:'CH680', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'674cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV', starterType:'Electric',
    },
  },
  {
    make:'Kohler', model:'CH740', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'725cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV', starterType:'Electric',
      notes:'Command Pro 25HP V-twin. Common in Toro Titan, Ariens Zoom, and Walker commercial mowers. Oil: 1.7L.',
    },
  },
  {
    make:'Kohler', model:'ECV749', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'747cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Electronic Fuel Injection (EFI)',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV', starterType:'Electric',
      notes:'EFI V-twin. Fuel injection significantly reduces fuel consumption vs carb models. Requires scan tool for fault code reading. Throttle body injector: do not use carb cleaner — use dedicated EFI cleaner only.',
    },
  },

  // ── POULAN PRO ─────────────────────────────────────────────────────────────
  {
    make:'Poulan Pro', model:'PP3516AVX', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'36.0cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'40:1', fuelTankCapacity:'0.39L',
      plugType:'Champion RCJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil (Effortless Pull)',
      notes:'Budget consumer saw. Note: uses 40:1 mix ratio, not 50:1. Bar oil: 0.22L. Anti-vibration system.',
    },
  },
  {
    make:'Poulan Pro', model:'PP4218AVX', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'42.0cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'40:1', fuelTankCapacity:'0.43L',
      plugType:'Champion RCJ7Y', plugGap:'0.50mm',
      idleRpm:'2700 RPM', starterType:'Recoil',
      notes:'18 in bar. 40:1 mix. Poulan/Husqvarna shared platform — some Husqvarna parts interchange.',
    },
  },

  // ── REDMAX ─────────────────────────────────────────────────────────────────
  {
    make:'RedMax', model:'BCZ2500S', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'24.5cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.43L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Manufactured by Husqvarna (Zenoah division). Strato-charged engine — lower emissions, better fuel efficiency than conventional 2-stroke.',
    },
  },
  {
    make:'RedMax', model:'EBZ7500', type:'Blower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'65.6cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'1.5L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Professional backpack blower. Strato-charged engine. Max air velocity: 92 m/s.',
    },
  },
  {
    make:'RedMax', model:'EBZ8500', type:'Blower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'75.6cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'1.6L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'One of the highest-output backpack blowers. Max air velocity: 101 m/s. Strato-charged cylinder.',
    },
  },

  // ── SHINDAIWA ──────────────────────────────────────────────────────────────
  {
    make:'Shindaiwa', model:'T230', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'21.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.43L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2900 RPM', starterType:'Recoil',
      notes:'Shindaiwa is now part of Echo/Yamaha group. Many parts common with Echo SRM-225.',
    },
  },
  {
    make:'Shindaiwa', model:'488', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'47.9cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.54L',
      plugType:'NGK BPMR7A', plugGap:'0.60mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
    },
  },

  // ── TANAKA ─────────────────────────────────────────────────────────────────
  {
    make:'Tanaka', model:'ECS-3301B', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'32.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.37L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
    },
  },
  {
    make:'Tanaka', model:'TBC-430', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'42.7cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.55L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Brush cutter / heavy-duty trimmer.',
    },
  },

  // ── YAMAHA — Outboard Motors ───────────────────────────────────────────────
  {
    make:'Yamaha', model:'F2.5', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'72cc', cylCount:'1',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPMR6A', plugGap:'0.90–1.00mm',
      idleRpm:'900–1000 RPM', starterType:'Recoil',
      notes:'Lightest Yamaha 4-stroke outboard (13kg). Tiller handle. No gear shift (forward only). Water pump impeller: replace every 100 hrs or annually. Gear oil: 90mL.',
    },
  },
  {
    make:'Yamaha', model:'F6', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'123cc', cylCount:'1',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPMR6A', plugGap:'0.90–1.00mm',
      idleRpm:'750–850 RPM', starterType:'Recoil',
      notes:'3-cylinder (some variants single). Lower unit oil: Yamalube Gear Lube 90. Impeller every 100 hrs. Check thermostat (60°C) if overheating — common failure.',
    },
  },
  {
    make:'Yamaha', model:'F15', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'351cc', cylCount:'2',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK LFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'700–750 RPM', starterType:'Recoil or electric',
      notes:'Inline 2-cylinder. 15HP. Very common on dinghies and tenders. Gear oil: 190mL. Water pump impeller: annual replacement recommended.',
    },
  },
  {
    make:'Yamaha', model:'F40', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'747cc', cylCount:'3',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK LFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'700–750 RPM', starterType:'Electric',
      notes:'Inline 3-cylinder. Thermostat opens at 52°C. Gear lube: 360mL Yamalube. Impeller: every 200 hrs or 2 years. Tilt/trim hydraulic fluid: ATF type F.',
    },
  },
  {
    make:'Yamaha', model:'F115', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1596cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'700–750 RPM', starterType:'Electric',
      notes:'Inline 4-cylinder DOHC. 115HP. EFI system requires diagnostic tool (Yamaha Diagnostic System — YDS) for fault codes and TPS reset. Gear lube: 630mL. Impeller: every 200 hrs. Common: throttle body injector fouling from ethanol-blend fuel — use Yamaha Fuel Conditioner.',
    },
  },
  {
    make:'Yamaha', model:'F150', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'2670cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'600–700 RPM', starterType:'Electric',
      notes:'Inline 4-cylinder DOHC. VCT (Variable Camshaft Timing). Gear lube: 840mL. Use YDS for TPS and trim sensor calibration. VST (Vapour Separator Tank) fuel filter: replace every 300 hrs.',
    },
  },
  {
    make:'Yamaha', model:'F200', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'2785cc', cylCount:'6',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'600–700 RPM', starterType:'Electric',
      notes:'V6 60-degree DOHC. Gear lube: 980mL. VCT system. Note: port and starboard cylinder banks have separate ignition modules.',
    },
  },
  {
    make:'Yamaha', model:'F250', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'3352cc', cylCount:'6',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'600–700 RPM', starterType:'Electric',
      notes:'V6 DOHC. 250HP. Offset driveshaft reduces gear case drag. High-pressure EFI — fuel pressure at rail: 294 kPa (43 PSI). Gear lube: 1080mL.',
    },
  },

  // ── TOHATSU — Outboards ────────────────────────────────────────────────────
  {
    make:'Tohatsu', model:'MFS6', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'138cc', cylCount:'1',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPMR6A', plugGap:'0.90–1.00mm',
      idleRpm:'750–850 RPM', starterType:'Recoil',
      notes:'6HP 4-stroke. Also sold as Mercury/Nissan under OEM agreement. Gear oil: 180mL. Impeller: annual.',
    },
  },
  {
    make:'Tohatsu', model:'MFS20', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'432cc', cylCount:'2',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK LFR6A', plugGap:'0.90–1.00mm',
      idleRpm:'750–850 RPM', starterType:'Recoil or electric',
      notes:'20HP inline 2-cylinder. Mercury 20ELH shares identical engine. Gear oil: 280mL.',
    },
  },

  // ── HONDA — Walk-behind Mowers ────────────────────────────────────────────
  {
    make:'Honda', model:'HRX217', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'187cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1800 RPM', wotRpm:'3100 RPM',
      valveTrain:'OHC', starterType:'Recoil',
      notes:'GCV190 engine with NeXite deck (composite, non-rusting). Hydrostatic drive (no blade brake clutch). Oil: 0.55L. Blade stop cable adjustment critical — if cable too loose, BBC will not engage. Common fault: carb float needle seat wear from ethanol — rebuild with Viton-tipped needle.',
    },
  },
  {
    make:'Honda', model:'HRR216', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'163cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1800 RPM', wotRpm:'3100 RPM',
      valveTrain:'OHC', starterType:'Recoil',
      notes:'GCV160 engine. Very common residential mower. Roto-Stop (BBC) standard. Oil: 0.55L. Carb Keihin — do not disassemble idle circuit; sealed at factory.',
    },
  },

  // ── TORO / EXMARK ──────────────────────────────────────────────────────────
  {
    make:'Toro', model:'TimeCutter SS4225', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'452cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1500 RPM', wotRpm:'3200 RPM',
      valveTrain:'OHV', starterType:'Electric',
      notes:'Powered by Kohler 452cc V-twin. Zero-turn 42 in deck. Hydro-Gear ZT-2800 transaxles. Drive belt: check tension every 25 hrs. Deck belt: inspect for fraying every 50 hrs.',
    },
  },

  // ── JOHN DEERE ─────────────────────────────────────────────────────────────
  {
    make:'John Deere', model:'X350', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'586cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1350 RPM', wotRpm:'3400 RPM',
      valveTrain:'OHV', starterType:'Electric',
      notes:'Kawasaki FS586V-powered. 18.5HP. 42 in Accel Deep deck. Hydrostatic transmission. Transmission bypass rod must be disengaged before pushing manually. Deck spindle grease: Hy-Gard grease, 2 pumps per spindle every 10 hrs.',
    },
  },
  {
    make:'John Deere', model:'Z530M', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'726cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1350 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV', starterType:'Electric',
      notes:'Kawasaki FR730V engine. Zero-turn. Dual EZtrak drive system. Air filter: K&N washable on heavy-duty variant.',
    },
  },

  // ── MAKITA ─────────────────────────────────────────────────────────────────
  {
    make:'Makita', model:'DCS5121', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'50.1cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.52L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Professional class. Spring-assisted chain tensioner. Bar oil: 0.30L.',
    },
  },
  {
    make:'Makita', model:'EA6100P', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'59.8cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.65L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
    },
  },
  {
    make:'Makita', model:'RBC411U', type:'Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'41.6cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.65L',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'2800 RPM', starterType:'Recoil',
      notes:'Heavy-duty brush cutter. Bike handle configuration.',
    },
  },

  // ── OREGON ─────────────────────────────────────────────────────────────────
  {
    make:'Oregon', model:'CS1500', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'Electric (AC)', ccSize:'N/A',
      coolingType:'Air-cooled (fan)', fuelSystem:'Electric — 15A, 120V',
      starterType:'Switch (electric)',
      notes:'15-amp corded electric chainsaw. PowerSharp self-sharpening chain system — 3 seconds on the built-in grinder maintains edge. Bar: 18 in. No fuel mix, no pull-start, no spark plug. Common fault: motor brush wear on models over 200 hrs.',
    },
  },

  // ── GENERAC ────────────────────────────────────────────────────────────────
  {
    make:'Generac', model:'GP3500iO', type:'Generator', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'212cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'2200 RPM (eco mode) / 3600 RPM (full)', wotRpm:'3600 RPM',
      starterType:'Recoil',
      notes:'Inverter generator. OHV 212cc. 3500W rated / 4500W surge. THD <5%. PowerRush Advanced Technology provides extra starting surge. Oil: 0.59L SAE 10W-30. Economy mode throttle: engaged via front panel switch. Common fault: capacitor on inverter board — failure causes no AC output but engine runs.',
    },
  },
  {
    make:'Honda', model:'EU2200i', type:'Generator', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'121cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1000–2600 RPM (Eco Throttle)', wotRpm:'3000 RPM (50Hz) / 3600 RPM (60Hz)',
      starterType:'Recoil',
      notes:'Inverter generator. GX121 engine. 2200W rated / 2500W surge. THD <3%. Eco Throttle reduces fuel consumption by 40% at part load. Oil: 0.44L SAE 10W-30. Parallel capable via EU i-compatible cable. Common fault: voltage regulator (inverter board) — no output but alternator fine. Blue Capacitor diagnostic: check for 340VDC on bus before condemning board.',
    },
  },
  {
    make:'Yamaha', model:'EF2000iS', type:'Generator', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'79cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1200–3000 RPM (smart throttle)', wotRpm:'3600 RPM',
      starterType:'Recoil',
      notes:'Inverter generator. 2000W rated. MZ80 engine. Smart Throttle load-sensing. THD <2.5%. Oil: 0.42L. Tank: 1.1L. Common repair: idle solenoid valve sticking (Auto Choke system) — clean with carb cleaner and test 12V operation.',
    },
  },

  // ── SUBARU / ROBIN ─────────────────────────────────────────────────────────
  {
    make:'Subaru', model:'EX17', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'163cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHC', starterType:'Recoil',
      notes:'OHC design (unlike Honda OHV). Superior oil splash lubrication for inclined use. Used in Husqvarna walk-behind mowers and various commercial equipment. Oil: 0.6L. Common in Japanese market equipment.',
    },
  },
  {
    make:'Subaru', model:'EX27', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'270cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHC', starterType:'Recoil or electric',
      notes:'9HP OHC. Superior to OHV design for equipment operated on slopes. Oil: 1.1L.',
    },
  },

  // ── TECUMSEH ───────────────────────────────────────────────────────────────
  {
    make:'Tecumseh', model:'HM80', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'319cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RJ19LM', plugGap:'0.76mm',
      wotRpm:'3600 RPM', starterType:'Recoil or electric',
      notes:'L-head (flathead) OHV-era design. Used in older riders and snowthrowers. Note: Tecumseh ceased production in 2008 — parts availability declining. Oil: 0.9L SAE 30. Common issue: points ignition on pre-TCI models — check dwell and timing. Replacement strategy: source NOS parts or repower with Honda/B&S.',
    },
  },
  {
    make:'Tecumseh', model:'LV195EA', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'195cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RJ19LM', plugGap:'0.76mm',
      wotRpm:'3600 RPM', starterType:'Recoil',
      notes:'Vertical shaft OHV. Used in late-era Tecumseh walk-behind mowers. Primer bulb carb — Tecumseh primer carbs cannot be jetted. Oil: 0.59L.',
    },
  },
  {
    make:'Tecumseh', model:'OH160', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'163cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RJ19LM', plugGap:'0.76mm',
      wotRpm:'3600 RPM', starterType:'Recoil',
      notes:'Overhead valve vertical shaft. Used in walk-behind mowers. Parts: carb O-ring kit #640349 covers most rebuild needs.',
    },
  },

  // ── ARIENS ─────────────────────────────────────────────────────────────────
  {
    make:'Ariens', model:'Compact 24', type:'Snowblower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'208cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1750 RPM', wotRpm:'3000 RPM',
      starterType:'Electric (120V cord)', weightKg:'59.0',
      notes:'AX208 engine (Ariens-branded B&S based). 24 in clearing width. Fuel shutoff valve — always close after use to prevent carb flooding. Friction disc drive: inspect disc pad wear annually. Impeller shear bolts: replace only with Grade 2 — NOT Grade 5 or 8.',
    },
  },
  {
    make:'Ariens', model:'Deluxe 28', type:'Snowblower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'306cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1750 RPM', wotRpm:'3600 RPM',
      starterType:'Electric (120V cord)', weightKg:'90.7',
      notes:'Ariens AX306 engine. 28 in width, 21 in intake height. Auto-Turn™ steering. Heated handgrips standard on Deluxe. Impeller scraper blade gap: 3mm max from housing.',
    },
  },

  // ── PRESSURE WASHERS ─────────────────────────────────────────────────────
  {
    make:'Briggs & Stratton', model:'020228', type:'Pressure Washer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'190cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      wotRpm:'3400 RPM', starterType:'Recoil',
      notes:'2100 PSI / 1.2 GPM. Horizontal shaft driving AR pump (axial cam). After each use: flush pump with clean water, then pull start without water to evacuate pump. Winter storage: pump saver antifreeze essential — frozen pump is non-repairable. Unloader valve failure: most common fault — stuck open (no pressure) or stuck closed (pressure spikes).',
    },
  },
  {
    make:'Honda', model:'GX390 Pressure Washer', type:'Pressure Washer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'389cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      starterType:'Recoil or electric',
      notes:'Typical in 3000–4000 PSI commercial units with CAT or General pump. GX390 spec as per standalone engine above. Pump inlet strainer: clean every 50 hrs. Check belt tension on belt-drive units every 25 hrs.',
    },
  },

  // ── TILLERS ───────────────────────────────────────────────────────────────
  {
    make:'Honda', model:'FG110', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'25cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK CMR5H', plugGap:'0.60–0.70mm',
      idleRpm:'1600 RPM', wotRpm:'7000 RPM',
      valveTrain:'OHC', starterType:'Recoil',
      notes:'Mini tiller / cultivator. GX25 derived engine. Counter-rotating tines. Oil: 100mL. Gear oil: 60mL SAE 80. Tine bolt torque: 22 Nm. DO NOT use in compacted clay — stall-lock control required.',
    },
  },

  // ── WATER PUMPS ───────────────────────────────────────────────────────────
  {
    make:'Honda', model:'WX10', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'25cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK CMR5H', plugGap:'0.60–0.70mm',
      wotRpm:'7000 RPM', starterType:'Recoil',
      notes:'Mini water pump. GX25 engine. Max discharge: 40 L/min. Priming: ensure suction hose fully submersed and primed before starting. Mechanical seal: replace if shaft seal weeps (usually 200–400 hrs).',
    },
  },
  {
    make:'Honda', model:'WB30', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'196cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      starterType:'Recoil',
      notes:'3 in centrifugal pump, GX200 engine. Max discharge: 1100 L/min. Max head: 30m. Mechanical seal failure is most common repair — seal kit: 06193-ZE2-405.',
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
async function run() {
  console.log(`\n🔧  Training Data Seed${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`    ${ENTRIES.length} entries in seed file`);

  const slice = ENTRIES.slice(0, limit);
  console.log(`    Processing ${slice.length} entries`);

  console.log('\nFetching existing wiki slugs…');
  const existingSlugs = await fetchExistingSlugs();
  console.log(`  ${existingSlugs.size} entries already in wiki\n`);

  const result = await batchInsert(slice, existingSlugs, { dryRun });

  console.log(`\n✅  Done: ${result.inserted} inserted, ${result.skipped} skipped\n`);
}

run().catch(e => { console.error(e); process.exit(1); });
