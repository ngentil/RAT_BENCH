/**
 * Training-data seed 8 — Arborist chainsaws, hedge trimmers, pole pruners,
 * backpack blowers, tillers, vintage 2-strokes, inverter generators,
 * construction water pumps, concrete mixers, and extended power equipment.
 *
 * node scripts/wiki-import/training-data-seed-8.mjs
 * node scripts/wiki-import/training-data-seed-8.mjs --dry-run
 */

import { fetchExistingSlugs, batchInsert } from './_shared.mjs';

const args     = process.argv.slice(2);
const dryRun   = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit    = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

const SRC = 'RAT BENCH Training Seed';
const SUM = 'Seeded from manufacturer service manual data';

const ENTRIES = [

  // ── ARBORIST / TOP-HANDLE CHAINSAWS ───────────────────────────────────────
  {
    make:'Stihl', model:'MS 193 T', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'30.1cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.28L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', wotRpm:'13500 RPM',
      starterType:'Recoil', weightKg:'2.9',
      notes:'Top-handle arborist saw. Single-handed felling up tree. Chain: 3/8" Picco, 1.1mm gauge. Bar: 30–35cm. ElastoStart for reduced recoil. Side-access chain tensioner. Oil: bar & chain oil tank 0.16L. Carb: same M-Tronic (non-adjustable) on newer variants. WARNING: single-hand operation only permitted for licensed arborists/climbers — never ground-use single-handed. Common: throttle lockout releasing in brush — check lockout spring tension.',
    },
  },
  {
    make:'Stihl', model:'MS 201 T C-M', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'35.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor (M-Tronic)',
      mixRatio:'50:1', fuelTankCapacity:'0.34L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', wotRpm:'13500 RPM',
      starterType:'Recoil', weightKg:'3.1',
      notes:'Professional top-handle. M-Tronic electronic carburettor management (auto adjusts mixture). 2-MIX engine (reduced emissions). Anti-vibration isolator mount. Quickstop Super inertia chain brake. Bar: 30–40cm. Chain: 3/8" Picco. Decompression valve. Common: M-Tronic error code from contaminated fuel (water ingress) — purge fuel system and reset. Requires Stihl EMATIC low-lubrication bar for reduced oil consumption.',
    },
  },
  {
    make:'Stihl', model:'MS 462 C-M', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'72.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor (M-Tronic)',
      mixRatio:'50:1', fuelTankCapacity:'0.75L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', wotRpm:'13500 RPM',
      starterType:'Recoil', weightKg:'5.9',
      notes:'Professional felling saw. 5.0 kW output. 2-MIX combustion. M-Tronic auto carb. HD2 air filter (oiled foam + paper inner). Bar: 40–75cm recommended. Chain: .325" or 3/8" full. Decompression + primer. Anti-vibration system (Stihl AV). Bucking spikes. Common: HD2 filter collapse when pressure washing — never pressure wash directly at air filter; clean with compressed air outward direction only. Oil: Stihl EMATIC oiling.',
    },
  },
  {
    make:'Husqvarna', model:'540i XP Arborist', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke (battery)', ccSize:'N/A (36V battery)', cylCount:'N/A',
      coolingType:'Electric motor', fuelSystem:'Battery (Li-ion)',
      starterType:'Electric (trigger)', weightKg:'3.0',
      notes:'36V brushless top-handle arborist saw. Equivalent power to 40cc petrol. Battery: BLi200 (36V 5.2Ah) / BLi300. Run time: BLi200 gives ~35 min at moderate use. Auto-adjust chain oil. No exhaust emissions — ideal for indoor/enclosed tree work. Chain: 3/8" Picco. Saw chain tensioner: tool-free. Common: battery connector corrosion in high-moisture arborist environment — clean with contact spray, dry before storage. Bar: 33–40cm.',
    },
  },
  {
    make:'Echo', model:'CS-2511T Top Handle', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'25.0cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.22L',
      plugType:'NGK BPMR7A', plugGap:'0.60mm',
      idleRpm:'3000 RPM', wotRpm:'12000 RPM',
      starterType:'Recoil', weightKg:'2.5',
      notes:'Lightest top-handle in Echo range. Side-access tensioner. Safety trigger. 25cc is minimum practical size for arborist limbing. Bar: 25–30cm. Chain: 3/8" Picco LP 1.1mm. Air filter: clean every 5 hrs in tree canopy dust. Common: bar oil cap loosening during inversion — click-lock cap, check before each descent.',
    },
  },
  {
    make:'Makita', model:'EA3201S35B', type:'Chainsaw', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'32.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.31L',
      plugType:'NGK BPMR7A', plugGap:'0.60mm',
      idleRpm:'2800 RPM', wotRpm:'12000 RPM',
      starterType:'Recoil', weightKg:'3.6',
      notes:'Rear-handle compact saw for arborists and property maintenance. 35cm bar. Air purge primer. Side-access tensioner. Anti-vibration mounts. Common: carburettor diaphragm hardening at 3 years from ethanol blends — replace rebuild kit. Makita chain: 91PX series (3/8" LP). Oregon 91VXL equivalent.',
    },
  },

  // ── HEDGE TRIMMERS ────────────────────────────────────────────────────────
  {
    make:'Stihl', model:'HS 82 R', type:'Hedge Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'22.7cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor (2-MIX)',
      mixRatio:'50:1', fuelTankCapacity:'0.37L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', wotRpm:'8000 RPM',
      starterType:'Recoil', weightKg:'5.4',
      notes:'Professional dual-sided reciprocating hedge trimmer. 75cm bar. 2-MIX reduced emissions. Anti-vibration. Blade gap: 27mm; cut vegetation up to 25mm dia. Oil: gear oil (SAE 90) in gearbox at bar pivot — grease nipple; inject every 25 hrs. Blade sharpening: file to 75° bevel, balance both sides. Common: blade set hitting from out-of-phase reciprocation — caused by impact with wire/steel; realign phase by hand.',
    },
  },
  {
    make:'Stihl', model:'HS 56 C-E', type:'Hedge Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'27.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor (2-MIX)',
      mixRatio:'50:1', fuelTankCapacity:'0.42L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', wotRpm:'8000 RPM',
      starterType:'Recoil (Easy2Start)', weightKg:'5.3',
      notes:'Consumer/prosumer hedge trimmer. 60cm blade. Easy2Start decompression spring. Single-sided blade. Gear-head adjustable handle (6 positions, tool-free). Common: Easy2Start spring fatigue at 5 years — pulls hard with jerking, replace spring kit. Gearbox grease: every 50 hrs (SAE 90 multi-purpose).',
    },
  },
  {
    make:'Husqvarna', model:'122HD60', type:'Hedge Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'21.7cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.37L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', wotRpm:'7800 RPM',
      starterType:'Recoil', weightKg:'5.0',
      notes:'Homeowner hedgetrimmer. 60cm double-sided blade. LowVib anti-vibration. Smart Start (lower pull force). Air purge primer. Common: carburettor inlet screen clogging — clean with fine wire brush. Blade-set timing marks: align arrows at TDC before removing blade set. Gearcase: grease at blade shaft nipple every 25 hrs.',
    },
  },
  {
    make:'Husqvarna', model:'525HE3', type:'Hedge Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'25.4cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.42L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', wotRpm:'8500 RPM',
      starterType:'Recoil', weightKg:'5.4',
      notes:'Commercial hedge trimmer. 75cm blade. 3-point anti-vibration. Adjustable rear handle. Designed for daily professional use — 400+ hrs annual life. Gearbox: grease nipple every 25 hrs. Common: blade-set drive shaft oil seal leak at 300+ hrs — replace oil seal before gearbox oil loss damages gear teeth.',
    },
  },
  {
    make:'Echo', model:'HC-185', type:'Hedge Trimmer', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'21.2cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.35L',
      plugType:'NGK BPMR7A', plugGap:'0.60mm',
      idleRpm:'2800 RPM', wotRpm:'7000 RPM',
      starterType:'Recoil', weightKg:'4.8',
      notes:'Homeowner hedge trimmer. 58cm blade. Gear-drive (quieter blade noise than direct-drive). Air purge primer, primer bulb. Lifetime lubricated gear case (factory sealed). Common: blade gap widening from hitting hard objects — can re-set with feeler gauge (0.3mm gap), gently tap blade with rubber mallet. Fuel: 0.35L.',
    },
  },

  // ── POLE PRUNERS ─────────────────────────────────────────────────────────
  {
    make:'Stihl', model:'HT 133', type:'Multi-Tool', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'36.3cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.52L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', wotRpm:'13000 RPM',
      starterType:'Recoil', weightKg:'9.4',
      notes:'Professional pole pruner. 2.3–3.9m reach extension. 35cm bar. 2-piece telescopic shaft. Drive shaft: hexagonal in flexible housing. Gearhead: 90° bevel gear, grease nipple — grease every 25 hrs. Chain: 3/8" Picco. Bar oil tank (in powerhead): 0.25L. M-Tronic optional. Common: drive shaft dog ear breaking after impact — shaft is weakest point by design; replacement shaft available. Chain brake integrated in gearhead.',
    },
  },
  {
    make:'Echo', model:'PPT-266H Pole Pruner', type:'Multi-Tool', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'25.4cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.38L',
      plugType:'NGK BPMR7A', plugGap:'0.60mm',
      idleRpm:'3000 RPM', wotRpm:'10500 RPM',
      starterType:'Recoil', weightKg:'6.6',
      notes:'180° adjustable gearhead. 25cm bar. Reach: 2.4–3.9m (extra shaft adds 1.5m). Flexible drive cable in aluminium shaft tube. Common: cable kink from over-tightening shaft extension — rotate extension to align (never force). Gearhead grease: every 25 hrs. Bar oil: manual oiler button. Chain: 3/8" Picco LP.',
    },
  },
  {
    make:'Husqvarna', model:'525PT5S Pole Pruner', type:'Multi-Tool', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'25.4cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'0.42L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', wotRpm:'10500 RPM',
      starterType:'Recoil', weightKg:'5.3',
      notes:'X-Torq engine (reduced fuel + emissions). Reach: 2.7–3.9m. Telescopic adjustment without tools. 25cm bar. Gearhead: grease every 25 hrs (Husqvarna grease nipple). LowVib. Common: shaft joint play at extension collar causing chain bounce — replacement collar lock ring. Compatible with Husqvarna 525 Series combi shaft system.',
    },
  },

  // ── BACKPACK BLOWERS / MIST BLOWERS ──────────────────────────────────────
  {
    make:'Stihl', model:'BR 600 Magnum', type:'Blower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke (Stihl 4-MIX)', ccSize:'64.8cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'1.45L',
      plugType:'NGK CMR6H', plugGap:'0.50mm',
      idleRpm:'2800 RPM', wotRpm:'8700 RPM',
      starterType:'Recoil', weightKg:'9.8',
      notes:'4-MIX engine (4-stroke with 2-stroke oil premix). Air volume: 1090 m³/h. MPH at nozzle: 238 km/h. Anti-vibration frame straps. Thumb-wheel throttle. 4-MIX oil requirement: regular 50:1 premix (same fuel as 2-stroke tools) — but check valve clearance at 150 hrs (intake 0.10mm, exhaust 0.15mm). Common: valve-train tick at 100 hrs — normal 4-MIX characteristic until valves bedded; adjust if more than 0.3mm out. Volume control: adjustable impeller nozzle flap.',
    },
  },
  {
    make:'Husqvarna', model:'580BTS X-Torq Backpack', type:'Blower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'75.6cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'2.0L',
      plugType:'NGK BPMR7A', plugGap:'0.50mm',
      idleRpm:'2800 RPM', wotRpm:'8800 RPM',
      starterType:'Recoil', weightKg:'11.0',
      notes:'X-Torq 2-stroke (low emissions). Air volume: 1350 m³/h at nozzle. Largest production petrol backpack blower. Frame: aluminium. Throttle: hip-mounted cruise control. Common: fuel cap float chamber overflow when stored inverted — always upright storage. Impeller: inspect for debris damage every 50 hrs. Blower tube: crack at weld junction from vibration at 200+ hrs — replace.',
    },
  },
  {
    make:'Echo', model:'PB-8010T Backpack', type:'Blower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'79.9cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'2.3L',
      plugType:'NGK BPMR7A', plugGap:'0.60mm',
      idleRpm:'2800 RPM', wotRpm:'8700 RPM',
      starterType:'Recoil', weightKg:'11.4',
      notes:'Echo\'s most powerful backpack. 1040 CFM / 238 mph. Professional landscaping. Engine: Pro Torque. Air filter: HD type, clean every 25 hrs. Fuel filter: in-tank, replace every 2 years. Common: throttle body butterfly sticking from fuel varnish — clean pivot shaft. Choke plate: check opens fully at WOT. Shoulder straps: padded; check strap hardware at annual inspection.',
    },
  },
  {
    make:'Stihl', model:'SR 430 Mist Blower', type:'Blower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke (4-MIX)', ccSize:'37.7cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'1.2L',
      plugType:'NGK CMR6H', plugGap:'0.50mm',
      idleRpm:'2800 RPM', wotRpm:'8500 RPM',
      starterType:'Recoil', weightKg:'12.5',
      notes:'Knapsack sprayer (mist blower). 14L chemical tank + 1.2L fuel. High-velocity air carries chemical mist to target. Nozzle: ceramic disc set (2-part), replace when flow rate drops >20%. Chemical tank: wash with clean water immediately after pesticide use (corrosion risk). Pump: diaphragm pump, prime before first use. Common: pump diaphragm hardening from chemical residue — replace annually for heavy use. Rinse with clean water immediately — never store with chemical in tank.',
    },
  },

  // ── TILLERS ───────────────────────────────────────────────────────────────
  {
    make:'Honda', model:'FRC800 Rear-Tine Tiller', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'163cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.75mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod',
      starterType:'Recoil', weightKg:'64',
      notes:'GX160 engine. Rear-tine counter-rotating. Tilling width: 55–80cm adjustable. Depth: 30cm max. Gear: single-speed forward + reverse. Tine gearbox: SAE 90 gear oil, 0.7L; change every 2 years or 200 hrs. Tines: 4+4 reverse (bolo style). Common: tine bolt shearing on rock strike — M10 grade 8.8 shear bolts by design; carry spares. Never operate on slopes >15° with forward tines. Oil: 0.6L 10W-30.',
    },
  },
  {
    make:'Troy-Bilt', model:'TB146EC Compact Cultivator', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'98cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RJ19LM', plugGap:'0.76mm',
      idleRpm:'1700 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod',
      starterType:'Recoil', weightKg:'24',
      notes:'Honda GX100-equivalent (Troy-Bilt branded) or B&S 450e. Mini cultivator for raised beds. Front-tine direct drive. Tine width: 20–30cm. Folding handles for storage. Oil: 0.5L SAE 30. Common: tine shield clogging with wet clay — clear with stick (not hands — tines rotate when engine running). Depth stake: pin in 3 positions (controls tilling depth).',
    },
  },
  {
    make:'Husqvarna', model:'TF 230 Front-Tine Tiller', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'208cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1700 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod',
      starterType:'Recoil', weightKg:'54',
      notes:'B&S 208cc (7 HP). Front-tine. Width 56cm. Depth 30cm. Differential allows turning without lifting. Tine gearbox oil: SAE 80W-90, 0.4L; change annually. Common: bolo tines bending on buried rocks — remove rocks before tilling or use pick-tines. Handle height: 5-position adjust. Oil: 0.6L 10W-30.',
    },
  },

  // ── INVERTER GENERATORS ────────────────────────────────────────────────────
  {
    make:'Honda', model:'EU7000is', type:'Generator', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'389cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Electronic Fuel Injection (PGM-FI)',
      plugType:'NGK IZFR5H11 (iridium)', plugGap:'1.00mm',
      idleRpm:'1500 RPM', wotRpm:'3000 RPM',
      valveTrain:'OHV pushrod',
      starterType:'Electric + Recoil', weightKg:'100',
      notes:'PGM-FI EFI eliminates carb issues. 7000W continuous / 7000W rated (inverter output). True sine wave — safe for computers, medical, variable-speed tools. Eco-Throttle reduces fuel use at light load. Fuel: 24.4L (~18 hrs at 25% load). Oil: 1.7L 10W-30. Service: oil every 100 hrs, EFI throttle body every 500 hrs. Parallel capable (2x EU7000is = 14kW). Common: EFI "flashing red" oil alert — check oil level before ECU fault diagnosis.',
    },
  },
  {
    make:'Yamaha', model:'EF6300iSDE', type:'Generator', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'357cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.75mm',
      idleRpm:'1500 RPM', wotRpm:'3000 RPM',
      valveTrain:'OHV pushrod',
      starterType:'Electric + Recoil', weightKg:'70',
      notes:'MZ360 engine. 6300W continuous inverter. Smart Throttle ECO mode. Fuel: 31.8L (~24 hrs at 25%). Oil: 1.1L 10W-30. D-type fuel cock (auto-off when tipped). Wheel kit included. Parallel ready (cable available). Common: carb needle valve seat leaking at 5 years storage — rebuild kit. Oil drain: bottom port — clean catch underneath before loosening.',
    },
  },
  {
    make:'Westinghouse', model:'iGen4500', type:'Generator', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'224cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.75mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod',
      starterType:'Electric + Recoil', weightKg:'48',
      notes:'4500W surge / 3700W continuous. Inverter (clean power). Economy mode. Remote start key fob. Parallel capable. Fuel: 3.4L (~18 hrs at 25%). Oil: 0.59L 10W-30. Common: remote start fob battery dying (CR2025) — replace annually. Carbon monoxide shutdown sensor: test annually. AVR voltage drift: ±5V acceptable; >10V needs capacitor check in inverter module.',
    },
  },
  {
    make:'Predator', model:'3500W Inverter Generator', type:'Generator', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'212cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.76mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod',
      starterType:'Electric + Recoil', weightKg:'47',
      notes:'Harbor Freight Predator 212cc. 3500W surge / 3000W running. Inverter (clean power). Economy mode. Paralleling: requires parallel cable kit (separate purchase). Fuel: 3.8L. Oil: 0.6L SAE 30. Common: carb main jet clogging from storage — #38 pilot jet, #95 main jet; easy to clean. Low-oil shutdown: float type, test by tilting 20° (should shut). Value proposition: ~½ price of Honda EU3200i for similar output.',
    },
  },
  {
    make:'DuroMax', model:'XP12000EH Dual Fuel', type:'Generator', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'457cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor (Dual fuel: petrol + LPG)',
      plugType:'NGK BPR6ES', plugGap:'0.75mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod',
      starterType:'Electric + Recoil', weightKg:'113',
      notes:'12000W surge / 9500W (petrol) or 8550W (LPG) continuous. Dual-fuel solenoid selector. LPG output typically 80–90% of petrol. Fuel: petrol 7.6L tank; LPG from 9kg bottle (2–4 hrs depending on load). Oil: 1.0L 10W-30. LPG regulator: 2-stage POL or QCC1 (US)/UK BS347 connector. Common: LPG solenoid sticking after storage — spray solenoid body with penetrating oil, cycle switch rapidly. MX2 technology allows L14-30 full 240V split or two 120V circuits.',
    },
  },

  // ── WATER PUMPS ──────────────────────────────────────────────────────────
  {
    make:'Honda', model:'WT30X 3" Trash Pump', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'196cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.75mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod',
      starterType:'Recoil', weightKg:'35',
      notes:'GX200 engine. 3" trash pump (passes 25mm solids). Flow: 1325 L/min. Head: 26m. Semi-self-priming (fill pump body before starting dry). Impeller: semi-open cast iron. Mechanical shaft seal: most common failure (leaks at shaft). Replace seal kit before impeller damage. Pump housing: 3" BSP connections. Oil: 0.6L 10W-30 engine; dry mechanical seal (no grease — grease damages seal face). Common: volute clogging from rags/plastics — install 50mm suction strainer.',
    },
  },
  {
    make:'Davey', model:'HM60R Petrol Pump', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'163cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.75mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod',
      starterType:'Recoil', weightKg:'25',
      notes:'Honda GX160-based (Davey rebranded). 2" clean water centrifugal pump. Flow: 600 L/min. Head: 40m. Self-priming to 8m. Stainless impeller. Brass volute. Chemical-compatible for mild fertilisers. Oil: 0.6L 10W-30. Common: impeller wear from sandy water — use inlet strainer (mesh <2mm). Bypass valve: release system pressure before disconnecting hoses.',
    },
  },

  // ── CONCRETE MIXERS ───────────────────────────────────────────────────────
  {
    make:'Belle', model:'Minimix 150 Petrol', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'148cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.75mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod',
      starterType:'Recoil', weightKg:'66',
      notes:'Honda GX160 (or equivalent). 150L drum (90L mixed batch). Drum drive: direct-drive through roller bearings. Drum tilt: worm gear handle, 270° range. Oil: engine 0.6L 10W-30; drum roller bearings grease every 50 hrs (waterproof grease). Rubber mixing fin lining: replace when worn <10mm (concrete build-up reduces mix quality). Common: drum seizing from concrete hardening inside after improper cleaning — flush with 20L water + 1L vinegar immediately post-mix.',
    },
  },

  // ── VINTAGE 2-STROKES ─────────────────────────────────────────────────────
  {
    make:'Kawasaki', model:'KH250 (S1)', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'249cc', cylCount:'3',
      coolingType:'Air-cooled', fuelSystem:'Carburettor (x3 Mikuni VM26)',
      mixRatio:'20:1 (break-in) / 32:1 (running)',
      plugType:'NGK B8ES', plugGap:'0.60mm',
      idleRpm:'1200 RPM', wotRpm:'7500 RPM',
      starterType:'Kickstart', weightKg:'174', transType:'5-speed',
      notes:'Kawasaki 250 triple (1972–1975). 45 HP from 249cc — exceptional power-to-weight for era. CCI (Kawasaki cylinder injection) 2-stroke oil system — but VERIFY pump is working; if seized, use premix only. Carbs: balance all three per manual procedure (sync tool required). Points ignition (older) or CDI (later). Points gap: 0.3–0.4mm. Timing: 2.1mm BTDC. Expansion chambers: clean every 5000 km. Common: crank seal failure causing rich/lean symptoms — oil migration between cylinders.',
    },
  },
  {
    make:'Yamaha', model:'RD350', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'347cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor (x2 Mikuni VM28)',
      mixRatio:'20:1 (break-in) / 32:1 (running)',
      plugType:'NGK B8ES', plugGap:'0.60mm',
      idleRpm:'1200 RPM', wotRpm:'7500 RPM',
      starterType:'Kickstart', weightKg:'166', transType:'6-speed',
      notes:'Yamaha RD350 (1973–1975, YPVS-equipped 350LC 1980–1990s). Torque induction reed valve. Autolube oil injection — check pump cable and flow window. Points: 0.3–0.4mm gap. CDI (LC version) or points. Power valve (YPVS): servo-actuated at 5000 RPM — clean carbon every 5000 km, servo alignment critical. Expansion chambers improve power significantly. Frame: twin downtube — prone to cracking at headstock. Tyre: Avon 3D or Bridgestone S20 modern alternatives.',
    },
  },
  {
    make:'Honda', model:'CB175 K6', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'174cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor (x2 Keihin)',
      plugType:'NGK D8ES', plugGap:'0.60mm',
      idleRpm:'1200 RPM', wotRpm:'11000 RPM',
      valveTrain:'SOHC 4-valve',
      starterType:'Kickstart', weightKg:'148', transType:'5-speed',
      notes:'Honda CB175 (1968–1975). 20 HP from 174cc. Classic twin. Points ignition: 0.3–0.4mm gap, timing 38° BTDC at 9000 RPM (strobe light). Carb: pilot screw 1.5 turns out standard (adjust until smooth idle). Oil: 1.5L SAE 20W-50. Chain: #428, adjust 15–20mm. Common: camchain tensioner wear causing slap at startup — replace tensioner rubbers before chain jump. Head gasket: copper ring type — re-torque after first heat cycle.',
    },
  },
  {
    make:'Kawasaki', model:'KE100', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'99cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor (Mikuni)',
      mixRatio:'32:1',
      plugType:'NGK B8ES', plugGap:'0.60mm',
      idleRpm:'1500 RPM', wotRpm:'7000 RPM',
      starterType:'Kickstart', weightKg:'90', transType:'5-speed',
      notes:'Long-running learner/commuter (1976–2001). Points ignition: 0.3–0.4mm gap. Timing: 2.0mm BTDC. Reed valve induction. Decoke every 3000 km (carbon in exhaust port, piston crown). Main jet #90, pilot #38 standard. Common: crank seal deterioration (25+ years) allowing air ingress — causes high idle, weak power. Replacement seals available. Ring gap: 0.15–0.30mm new, replace >0.60mm.',
    },
  },
  {
    make:'Yamaha', model:'DT175 MX', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'171cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor (Mikuni VM26)',
      mixRatio:'20:1 (break-in) / 32:1 (running)',
      plugType:'NGK B8ES', plugGap:'0.60mm',
      idleRpm:'1300 RPM', wotRpm:'7000 RPM',
      starterType:'Kickstart', weightKg:'106', transType:'6-speed',
      notes:'Yamaha DT175 (1974–1981). Torque Induction (reed valve). Autolube oil pump. Street-legal enduro. Points: 0.3–0.4mm. Timing: 2.5mm BTDC. Fork seals: 36mm, replace every 5 years. Rear shock: non-serviceable mono; replacement KYB AG300 recommended. Common: Autolube pump diaphragm cracking — use premix if pump uncertain. Exhaust port: clean every 3000 km.',
    },
  },

];

async function run() {
  const existingSlugs = await fetchExistingSlugs();
  const slice = limit < ENTRIES.length ? ENTRIES.slice(0, limit) : ENTRIES;
  const result = await batchInsert(slice, existingSlugs, { dryRun });
  console.log(`Seed-8 complete: ${result.inserted} inserted, ${result.skipped} skipped.`);
}

run().catch(e => { console.error(e); process.exit(1); });
