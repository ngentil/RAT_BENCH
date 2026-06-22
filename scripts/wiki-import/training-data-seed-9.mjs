/**
 * Training-data seed 9 — Clone engines: GX160/GX200/212/270/390/420cc clones,
 * GY6 scooter family, Chinese pit bike engines, cub/moped engines, Loncin
 * bike-series, Tillotson racing, mini bike complete machines.
 *
 * node scripts/wiki-import/training-data-seed-9.mjs
 * node scripts/wiki-import/training-data-seed-9.mjs --dry-run
 */

import { fetchExistingSlugs, batchInsert } from './_shared.mjs';

const args     = process.argv.slice(2);
const dryRun   = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit    = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

const SRC = 'RAT BENCH Training Seed';
const SUM = 'Seeded from manufacturer service manual data';

const ENTRIES = [

  // ── GX160-CLASS CLONES (163cc / 5.5 HP) ──────────────────────────────────
  // The original Honda GX160 uses 68mm bore × 45mm stroke = 163cc.
  // Chinese code: "168F" (168 ≈ 68mm bore, F = forced air / horizontal shaft).
  // Vertical shaft variant: 168FV or "GX160V clone".
  {
    make:'Generic', model:'168F Clone Engine (163cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'163cc', boreDiameter:'68mm', crankStroke:'45mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.5:1', plugType:'NGK BPR6ES / Champion F7TC', plugGap:'0.70–0.80mm',
      idleRpm:'1400–1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'15',
      notes:'GX160 architecture clone. Carburettor: Huayi HW-04K or generic 16mm slide type. Main jet: #88–92 (sea level). Pilot jet: #38–42. Float height: 17mm. Oil: 0.6L SAE 30 (>5°C) or 10W-30. Change first 5 hrs break-in, then every 50 hrs. Air filter: foam pre-cleaner + paper element; service foam every 25 hrs. Governor: centrifugal flyweight type — do not remove or max RPM will destroy engine (governed to 3600). Valve clearance MUST be set cold. Common: Chinese 168F carbs have inferior needle valve seats — ethanol fuel degrades float; replace with Honda GX160 OEM carb direct swap for reliability. Horizontal PTO shaft: keyed 19.05mm (3/4") taper or straight 22mm depending on variant.',
    },
  },
  {
    make:'Loncin', model:'LC160F (163cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'163cc', boreDiameter:'68mm', crankStroke:'45mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.5:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'15.5',
      notes:'Loncin (Chongqing Loncin Holdings) is one of the better-built Chinese engine manufacturers — OEM supplier to BMW and Honda joint ventures in China. LC160F is well-finished compared to generic 168F. Carb: Loncin branded (Huayi derivative). Main jet #90. Honda GX160 gaskets, valves, and rings are cross-compatible. Common: governor spring tension slightly looser than Honda spec — RPM may drift to 3700+ under no load; adjust governor spring preload. PTO: 19.05mm parallel shaft keyed.',
    },
  },
  {
    make:'Rato', model:'R180-II (163cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'163cc', boreDiameter:'68mm', crankStroke:'45mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.5:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'15.0',
      notes:'Rato (Chongqing Rato Power) exports widely under OEM supply agreements. R180 designation = 180cc class in Rato naming despite being 163cc bore/stroke. Honda GX160 cross-compatibility: carb, air filter, spark plug all direct fit. Valve seat recession known at 300+ hrs on poor fuel — replace with hardened seats for LPG/E10 use. Oil: 0.6L SAE 30.',
    },
  },
  {
    make:'WEN', model:'GN160 (163cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'163cc', boreDiameter:'68mm', crankStroke:'45mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.5:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'15.0',
      notes:'WEN Products (US-marketed, Chinese-manufactured). GN160 is GX160 clone. Used in WEN pressure washers and generators. Parts identical to generic 168F. Carb: Huayi. Recoil: direct Honda GX160 rope/pulley swap. Oil drain: threaded plug on oil sump — use 10mm socket. Common: primer ball (if fitted) cracking after 2 winters — replace or remove and use choke-only cold start.',
    },
  },
  {
    make:'Daytona', model:'Anima 150F (163cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'163cc', boreDiameter:'68mm', crankStroke:'45mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.5:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'14.5',
      notes:'Italian-branded, Chinese-built. Daytona specifies tighter manufacturing tolerances and sources stronger connecting rods vs generic 168F. Popular in European karting (Rotax Max feeder classes). Carb: Daytona labelled Huayi derivative. Performance note: head gasket sealing surface is machined — less rework needed for head skim. Compatible with Honda GX160 pistons/rings.',
    },
  },

  // ── GX200-CLASS CLONES (196cc / 6.5 HP) ──────────────────────────────────
  // Honda GX200: 68mm bore × 54mm stroke = 196cc. Chinese code: 168F-2.
  {
    make:'Generic', model:'168F-2 Clone Engine (196cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'196cc', boreDiameter:'68mm', crankStroke:'54mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.5:1', plugType:'NGK BPR6ES / Champion F7TC', plugGap:'0.70–0.80mm',
      idleRpm:'1400–1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'15.5',
      notes:'Most common clone engine globally. Sold under hundreds of brand names (Tradepower, Silvan, Grizzly, Hyundai, Powertech, Buffalo Tools, Clarke, Einhell entry-level, etc.). The 168F-2 ("2" = larger 54mm stroke vs 168F 45mm) is physically identical externally to GX160 clone. Identify by displacement label or measuring stroke. Carb: Huayi HW-04K or PZ type. Main jet: #90–95. Honda GX200 OEM carb is direct bolt-on upgrade — resolves 90% of fuelling issues. Block casting "168F-2" or "196cc" or "6.5HP" stamped on side. Crankshaft keyway: 3/16" (Honda spec). Use Honda GX200 parts manual as service reference — 95% cross-compatible.',
    },
  },
  {
    make:'Loncin', model:'LC180F (196cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'196cc', boreDiameter:'68mm', crankStroke:'54mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.5:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'16.0',
      notes:'Loncin\'s 196cc workhorse. Used in Loncin-powered generators, pressure washers, and OEM supply (early Husqvarna wheeled products used Loncin). Better steel alloy crankshaft vs generic 168F-2 — measured crank runout typically <0.05mm vs 0.10–0.15mm on generic. Oil: 0.6L SAE 30/10W-30. Carb: Loncin GX200 type (Huayi derivative, same as generic). Common: governor/throttle return spring clip backing off at 50+ hrs — add secondary locking washer.',
    },
  },
  {
    make:'Rato', model:'R210-II (208cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'208cc', boreDiameter:'70mm', crankStroke:'54mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.5:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'16.0',
      notes:'Rato slightly overbores to 70mm (vs Honda 68mm) for 208cc. Carb: 16mm slide. Main jet #92. NOT identical to GX200 — 70mm piston/rings are Rato-specific; Honda GX200 piston will not fit. Gasket set: use Rato OEM. Everything else (valves, cam, governor) compatible with GX200 pattern. Common: piston ring end gap specification: 0.25–0.45mm; replace if >0.80mm.',
    },
  },
  {
    make:'Zongshen', model:'ZS168F (196cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'196cc', boreDiameter:'68mm', crankStroke:'54mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.5:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'15.5',
      notes:'Zongshen (Chongqing Zongshen Power Machinery) — one of China\'s top 3 small engine makers. ZS168F = true 68mm bore GX200 spec. Used extensively in Chinese market pressure washers and generators; also exported under OEM supply. Honda GX200 parts cross-compatible at 95%+. Common: Zongshen uses slightly narrower valve spring collet groove — GX200 springs/keepers don\'t fit; use Zongshen OEM valvetrain parts.',
    },
  },
  {
    make:'Ducar', model:'212E (196cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'196cc', boreDiameter:'68mm', crankStroke:'54mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.5:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'15.5',
      notes:'Ducar (Shanghai Ducar Engine) is a quality Chinese export brand. The 212E is their 196cc model (despite "212" name — marketing confusion). Strong points: forged connecting rod std, tighter casting tolerances. Used in go-karts and mini bikes targeting performance buyers. Carb: Mikuni-style 16mm. Honda GX200 rod bolts compatible. Common: aftermarket performance carb (22–26mm) upgrade popular — requires main jet re-jetting to #105–115 depending on carb size and elevation.',
    },
  },
  {
    make:'Baumr', model:'BMS200 (196cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'196cc', boreDiameter:'68mm', crankStroke:'54mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.5:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'15.5',
      notes:'Baumr-AG is Australian consumer brand; BMS200 is their 6.5HP generator/pressure washer engine. Internal: generic 168F-2 sourced from OEM Chinese manufacturer. Sold at Supercheap Auto, Total Tools. Parts: order "168F-2 repair kit" — fits perfectly. Common: Baumr carb needle jet seat loosening from vibration — symptom: fuel dribble from carb overflow. Fix: replace needle valve seat with Honda GX200 seat (direct fit).',
    },
  },

  // ── 212cc CLONE VARIANTS ──────────────────────────────────────────────────
  // 212cc = 70mm bore × 55mm stroke. Popular kart/mini bike displacement.
  {
    make:'Predator', model:'212 Non-Hemi', type:'Go-kart', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'212cc', boreDiameter:'70mm', crankStroke:'55mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.5:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'16.0',
      notes:'Non-Hemi = flat-top combustion chamber (vs Hemi = dome-top). Sold 2010–2016 as "old" Predator 212. Non-hemi head has a FLAT combustion chamber identical to Honda GX200 architecture — this is the preferred performance base. Non-hemi carb: Huayi with 15mm bore — upgrade to 22mm Mikuni-clone is Stage 1. Governor removal (Stage 1): allows 5500+ RPM; must remove flyweight AND spring. Stage 2: cam, valve springs, 22mm carb — 11+ HP. Stage 3: stroker crank, big bore piston — 15+ HP. Non-hemi is favoured for stages 2–3 due to better aftermarket head availability. Identify: remove air box — non-hemi carb is smaller, has separate choke lever; hemi carb has integrated choke butterfly.',
    },
  },
  {
    make:'Predator', model:'212 Hemi', type:'Go-kart', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'212cc', boreDiameter:'70mm', crankStroke:'55mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.5:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'16.0',
      notes:'Hemi = hemispherical combustion chamber (dome head). Current (2016+) Predator 212 sold at Harbor Freight. Hemi carb: larger 16mm with integrated choke — more fuel flow stock. The hemispherical head is harder to machine for performance (curved surface); valve placement differs. Stage 1 hemi: larger carb + exhaust only (limited by head geometry). For serious performance, most builders swap hemi head for aftermarket flat head (e.g., Tillotson or clone flat head). Hemi-specific: connecting rod is 3mm longer than non-hemi — do not mix rods between hemi/non-hemi engines with same bore piston.',
    },
  },
  {
    make:'Tillotson', model:'H212 RS', type:'Go-kart', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'212cc', boreDiameter:'70mm', crankStroke:'55mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Tillotson HL-334)',
      compressionRatio:'9.0:1 (raised)', plugType:'NGK BPR6ES', plugGap:'0.65–0.75mm',
      idleRpm:'1600 RPM', wotRpm:'5800+ RPM (no governor)',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10mm', exhaustValveClear:'0.15mm',
      starterType:'Recoil', weightKg:'15.8',
      notes:'Purpose-built race engine using Chinese 212 clone architecture with premium components. Ships without governor. Tillotson HL-334 carb (diaphragm type — no float bowl to slosh in corners). Flathead design — machined flat combustion chamber for consistent compression. Performance cam (longer duration), stiffer valve springs. Billet flywheel. Main bearing sizes and bolt pattern: compatible with Predator 212. Competition classes: World Formula, Open Clone, Restricted 212. Restricted class requires stock carb and rev limiter — check class rules before tuning.',
    },
  },
  {
    make:'Tillotson', model:'T225RS', type:'Go-kart', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'225cc', boreDiameter:'72mm', crankStroke:'55mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Tillotson HL-334)',
      compressionRatio:'9.0:1', plugType:'NGK BPR6ES', plugGap:'0.65mm',
      idleRpm:'1600 RPM', wotRpm:'6000+ RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10mm', exhaustValveClear:'0.15mm',
      starterType:'Recoil', weightKg:'15.8',
      notes:'Overbored 225cc variant of H212 architecture. 72mm bore (vs 70mm on H212). 72mm piston kit is Tillotson proprietary — not Honda or generic compatible. Extra 13cc produces measurable torque advantage. Used in Open Clone and some Unlimited kart classes. Service: check piston-to-wall clearance (0.05–0.08mm cold) at every rebuild — 72mm is at limit of 212 block cylinder bore. Block sleeve replacement available when worn.',
    },
  },
  {
    make:'Loncin', model:'LC1P70FA (212cc)', type:'Go-kart', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'212cc', boreDiameter:'70mm', crankStroke:'55mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.5:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'16.0',
      notes:'Loncin 212cc — used in Loncin-powered go-karts and mini bikes sold in Australia/NZ under brands like Trailmaster and Coleman. "FA" = horizontal shaft with automotive-style recoil housing. Forged crank std on 2021+ models. Full governor system. Honda GX200 valve seats, guides, and cam compatible. Common: Loncin 212cc throttle cable bracket: M6 thread (vs Honda M6) — same pitch, direct swap.',
    },
  },

  // ── GX270-CLASS CLONES (270cc / 9 HP) ────────────────────────────────────
  // Honda GX270: 77mm bore × 58mm stroke = 270cc.
  {
    make:'Generic', model:'177F Clone Engine (270cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'270cc', boreDiameter:'77mm', crankStroke:'58mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.2:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil (or Electric optional)', weightKg:'19.0',
      notes:'Chinese code 177F = 77mm bore. 9HP class. Used in ride-on mower base models, larger pressure washers, log splitters, and construction equipment. Carb: 18–19mm slide, Huayi or PZ type. Main jet #100–105. Oil: 1.1L SAE 30/10W-30. Honda GX270 carb is direct bolt-on upgrade. Valve clearance: set cold, same as GX200 clone spec (carryover architecture). Electric start variant adds 12V 3.5A charging coil. Common: camshaft lobe wearing on exhaust side at 500+ hrs from poor oil maintenance — use full synthetic 10W-30 for extended cam life.',
    },
  },
  {
    make:'Loncin', model:'LC1P92F (270cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'270cc', boreDiameter:'77mm', crankStroke:'58mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.2:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'19.5',
      notes:'Loncin\'s 270cc is used in their own ride-on mower range and as OEM supply. Higher build quality than generic 177F — steel cylinder liner of greater thickness. Oil: 1.1L. Recoil handle: ergonomic T-grip standard on 2020+. Common: Loncin 270cc base gasket (head-to-block) uses steel-armoured composite — torque to 24 Nm in star pattern (vs generic head gasket torque 20 Nm). Do not use Honda GX270 head gasket — slightly different fire ring position.',
    },
  },
  {
    make:'Rato', model:'R270-II (270cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'270cc', boreDiameter:'77mm', crankStroke:'58mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.2:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'19.0',
      notes:'Rato R270-II widely used in Chinese-market construction machinery. Electric start version adds alternator stator (12V/3.5A). Connects to Honda GX270 mounting bolt pattern (bolt spacing 75mm horizontal / 100mm vertical). Carb: 18mm slide, Rato branded. Main jet: #100 sea level. Common: R270 ignition coil air gap: 0.20–0.30mm (tighter than Honda GX270 spec of 0.25–0.35mm) — adjust with feeler gauge after flywheel cleaning.',
    },
  },
  {
    make:'Zongshen', model:'ZS188F (270cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'270cc', boreDiameter:'77mm', crankStroke:'58mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.2:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'19.0',
      notes:'Zongshen 188F — confusing name (188 ≈ 88mm? No — internal Zongshen code, not bore size). 77mm bore confirmed. Honda GX270 parts compatibility: cylinder head (confirm bolt spacing); valve seats: GX270 hardened seats fit Zongshen ZS188F block. Oil: 1.1L SAE 30. Common: ZS188F throttle body has metric 19mm throat — standard PZ19 carb is direct upgrade.',
    },
  },

  // ── GX390-CLASS CLONES (389cc / 13 HP) ───────────────────────────────────
  // Honda GX390: 88mm bore × 64mm stroke = 389cc.
  {
    make:'Generic', model:'188F/190F Clone Engine (389cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'389cc', boreDiameter:'88mm', crankStroke:'64mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.2:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.20–0.25mm',
      starterType:'Electric + Recoil', weightKg:'27.0',
      notes:'GX390 architecture clone. Chinese code "188F" (88mm bore) or "190F" (some makers round up — NOT related to the 190cc/7HP engines using "190F" code — context-dependent!). 13HP class used in concrete mixers, large generators, heavy pressure washers, log splitters, and commercial mowers. Oil: 1.1L SAE 30 (mandatory — do not use 10W-40; damages oil pump at 3600 RPM). Carb: 19–20mm slide, PZ20 type. Main jet: #110–115. Honda GX390 carb: direct bolt-on, resolves lean surge. Head torque: 24 Nm (6 bolts in star pattern). Electric start: 12V 8A charging coil. Common: plastic timing cover cracking from vibration at 400 hrs — replace with Honda GX390 metal cover (fits). PTO shaft: 25.4mm (1") or 28.575mm (1-1/8") keyed.',
    },
  },
  {
    make:'Loncin', model:'LC1P88F (389cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'389cc', boreDiameter:'88mm', crankStroke:'64mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.2:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.20–0.25mm',
      starterType:'Electric + Recoil', weightKg:'27.5',
      notes:'Loncin\'s GX390 clone — notably better rod and crank quality than generic 188F. Used in Belle concrete mixers and European-market generators. Head casting: Loncin uses 6-bolt head (same as Honda GX390). Honda GX390 head gasket: confirmed direct fit. Connecting rod: Loncin uses I-beam forged rod (generic 188F uses C-channel cast rod) — important for >400 hr heavy loads. Oil pump: gear-type positive displacement (reliable). Common: Loncin recoil mechanism: 10-spring helix design — stronger return force than generic; rope replacement requires housing disassembly (4 screws).',
    },
  },
  {
    make:'Rato', model:'R390-II (389cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'389cc', boreDiameter:'88mm', crankStroke:'64mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.2:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.20–0.25mm',
      starterType:'Electric + Recoil', weightKg:'27.0',
      notes:'Rato R390-II: widely exported to Europe/Australia as OEM supply engine. Stator: 12V / 8.3A. Honda GX390 carb bolt-on fit confirmed. Muffler: M10 × 1.5mm thread exhaust stud (same as GX390 — aftermarket exhausts fit directly). Oil: 1.1L. Common: R390 governor arm roll pin migrating at 600+ hrs under sustained load — apply thread locker (Loctite 243) to pin after confirming correct governor gap (1.0mm between arm and flyweight).',
    },
  },
  {
    make:'Zongshen', model:'ZS192F (389cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'389cc', boreDiameter:'88mm', crankStroke:'64mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.2:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.20–0.25mm',
      starterType:'Electric + Recoil', weightKg:'27.0',
      notes:'Zongshen 192F = 88mm bore, their GX390 clone. Used in Zongshen-powered construction equipment. ZS192F cylinder bore surface: plateau-honed from factory — ring seating faster than some generic 188F rough bores. Honda GX390 ring set: direct fit (confirm 88mm × 1.2mm compression ring, 2.0mm oil ring). Common: ZS192F choke plate screw backing out (vibration) — causes rich running. Use thread locker on choke plate screw at each carb service.',
    },
  },
  {
    make:'Powerland', model:'PD389E (389cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'389cc', boreDiameter:'88mm', crankStroke:'64mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.2:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.20–0.25mm',
      starterType:'Electric + Recoil', weightKg:'27.5',
      notes:'Powerland (Chinese OEM exported to North America). PD389E is direct GX390 architecture. Used in Powerland pressure washers and log splitters. Same service specs as generic 188F. Electric start: key switch + battery (12V 12Ah min). Spark: NGK BPR6ES, gap 0.70–0.80mm. Common: key switch corrosion — dielectric grease at installation; replace with Honda GX390 key switch (same connector).',
    },
  },

  // ── 420cc / 15HP CLASS CLONES ─────────────────────────────────────────────
  {
    make:'Generic', model:'420cc Clone Engine (15HP)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'420cc', boreDiameter:'90mm', crankStroke:'66mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.0:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.20–0.25mm',
      starterType:'Electric + Recoil', weightKg:'30.0',
      notes:'420cc = 90mm bore × 66mm stroke. Chinese code "192F" variants or unbranded "420cc 15HP". NOT the same as GX390 (389cc) — extra displacement from 90mm bore. Oil capacity increases to 1.5L SAE 30. Used in large log splitters, commercial-grade pressure washers, and heavy utility equipment. Carb: 20–22mm slide. Main jet: #115–120. PTO shaft: 25.4mm or 28.575mm keyed. Common: The 420cc block is physically taller than GX390 — mounting frame clearance check needed before substitution. Valve clearance same spec as 389cc. Ignition coil gap: 0.25–0.35mm.',
    },
  },
  {
    make:'Rato', model:'R420 (420cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'420cc', boreDiameter:'90mm', crankStroke:'66mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.0:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.20–0.25mm',
      starterType:'Electric + Recoil', weightKg:'30.5',
      notes:'Rato R420 used in heavy-duty Chinese construction and agricultural equipment. Stator: 12V / 10A on electric start models. Oil: 1.5L SAE 30 — this is critical; running 1.1L (GX390 fill spec) will cause oil starvation in the larger sump. Crank: 28.575mm PTO. Common: R420 muffler studs are M10 × 1.25mm fine pitch (vs Honda M10 × 1.5mm coarse pitch on GX390) — verify stud thread before fitting aftermarket exhaust.',
    },
  },
  {
    make:'Loncin', model:'LC1P90F (420cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'420cc', boreDiameter:'90mm', crankStroke:'66mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.0:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.20–0.25mm',
      starterType:'Electric + Recoil', weightKg:'30.5',
      notes:'Loncin top-of-range single cylinder. Forged crank and rod (same quality programme as LC1P88F). Used in Loncin-powered ride-on mowers (vertically-oriented variant) and large generators. Vertical shaft variant: LC1P90FV. Oil: 1.5L. Charging stator: 12V / 12A on LC1P90FE (electric start). Common: Loncin 420cc governor RPM adjustment: factory set 3200 RPM for ride-on mower use — adjust to 3600 for generator use via governor arm screw (clockwise increases RPM).',
    },
  },

  // ── GY6 SCOOTER ENGINE FAMILY ─────────────────────────────────────────────
  // GY6 = Guangzhou Yanfa 6th-generation design. Horizontal and vertical variants.
  // Hundreds of Chinese manufacturers produce GY6 clones.
  {
    make:'Generic', model:'GY6 49cc (139QMB)', type:'Scooter', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'49cc', boreDiameter:'39mm', crankStroke:'41.4mm',
      cylCount:'1', coolingType:'Forced air (fan on flywheel)', fuelSystem:'Carburettor',
      compressionRatio:'10.0:1', plugType:'NGK CR7HSA', plugGap:'0.60–0.70mm',
      idleRpm:'1700 RPM', wotRpm:'8000 RPM',
      valveTrain:'SOHC 2-valve', intakeValveClear:'0.08–0.10mm', exhaustValveClear:'0.10–0.12mm',
      starterType:'Electric + Kick', weightKg:'28', transType:'CVT automatic',
      notes:'139QMB = Chinese engine code (139 = maker code, QM = single cylinder, B = variant). The global dominant 50cc 4-stroke scooter engine. Produces 2.7–3.5HP depending on state of tune and carb. CVT: variator (primary drive) + belt + rear clutch. Belt: 669×18×30 (standard) or 669-style — measure before ordering. Variator rollers: 6× rollers, 6–9g for standard (heavier = higher RPM engagement). Carb: Keihin-clone PD18J (18mm) most common. Main jet: #78–82 sea level. Pilot jet: #35. Transmission oil: 80W-90 gear oil 80–100mL. Common: variator face groove wear at 15,000 km — replace complete variator. Exhaust valve carbon at 10,000 km — decoke with cylinder off. Oil: 0.8L 10W-30 (shared sump, engine + transmission).',
    },
  },
  {
    make:'Generic', model:'GY6 125cc Vertical (152QMI)', type:'Scooter', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'124cc', boreDiameter:'52.4mm', crankStroke:'57.8mm',
      cylCount:'1', coolingType:'Forced air', fuelSystem:'Carburettor',
      compressionRatio:'9.5:1', plugType:'NGK CR7HSA', plugGap:'0.60–0.70mm',
      idleRpm:'1600 RPM', wotRpm:'8500 RPM',
      valveTrain:'SOHC 2-valve', intakeValveClear:'0.08–0.10mm', exhaustValveClear:'0.10–0.12mm',
      starterType:'Electric + Kick', weightKg:'32', transType:'CVT automatic',
      notes:'152QMI = Chinese scooter 125cc. 7.5–8HP. Used in Chinese-market 125cc scooters and most TGA/Neco/Sym/Kymco-adjacent budget brands. CVT belt: 743×20×30 common. Variator rollers: 12g typical. Carb: PD24J (24mm). Main jet: #98–102 sea level. Pilot: #38. Transmission gear oil: 80W-90, 90–120mL. Common: cam chain tensioner: hydraulic auto-tensioner on 152QMI — fails at 25,000–30,000 km causing cam chain rattle; replace tensioner body + spring. Oil: 0.9L 10W-30.',
    },
  },
  {
    make:'Generic', model:'GY6 150cc Vertical (157QMJ)', type:'Scooter', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'149cc', boreDiameter:'57.4mm', crankStroke:'57.8mm',
      cylCount:'1', coolingType:'Forced air', fuelSystem:'Carburettor',
      compressionRatio:'9.5:1', plugType:'NGK CR7HSA', plugGap:'0.60–0.70mm',
      idleRpm:'1600 RPM', wotRpm:'8500 RPM',
      valveTrain:'SOHC 2-valve', intakeValveClear:'0.08–0.10mm', exhaustValveClear:'0.10–0.12mm',
      starterType:'Electric + Kick', weightKg:'33', transType:'CVT automatic',
      notes:'157QMJ = same stroke as 152QMI, larger 57.4mm bore = 150cc. Most common Chinese 150cc scooter engine. 10–11HP. The 157QMJ and 152QMI share the SAME transmission housing — gears, clutch, and CVT components are interchangeable. Carb: PD24J, 24mm. Main jet: #105–108 sea level. Belt: 743×20×30. Oil: 0.9L 10W-30. Common: cylinder head stud thread stripping from aluminium block at #80 Nm torque — insert M6 Helicoil on stripped studs; standard repair. Camshaft: SOHC chain-driven; chain: 82-link 420 pitch, replace every 20,000 km.',
    },
  },
  {
    make:'Generic', model:'GY6 150cc Horizontal (Go-Kart)', type:'Go-kart', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'149cc', boreDiameter:'57.4mm', crankStroke:'57.8mm',
      cylCount:'1', coolingType:'Forced air', fuelSystem:'Carburettor',
      compressionRatio:'9.5:1', plugType:'NGK CR7HSA', plugGap:'0.60–0.70mm',
      idleRpm:'1600 RPM', wotRpm:'8500 RPM',
      valveTrain:'SOHC 2-valve', intakeValveClear:'0.08–0.10mm', exhaustValveClear:'0.10–0.12mm',
      starterType:'Electric + Kick', weightKg:'30', transType:'CVT or manual (no auto-clutch)',
      notes:'Same GY6 150cc engine as scooter 157QMJ but oriented HORIZONTALLY (PTO shaft points rearward). Used in Chinese go-karts, dune buggies, and Chinese quad/ATV applications. Horizontal orientation changes oil pooling — oil drain plug is on a different face; confirm correct orientation before running. Carb: PD24J mounted on side (not top). Common: horizontal GY6 oil level window hard to read — engine must be level. Frequent in Chinese buggy brands (TrailMaster, TaoTao, Hammerhead, Kinroad). Transmission: most use belt CVT with rear centrifugal clutch. Manual 4-speed versions exist for kart applications.',
    },
  },
  {
    make:'Generic', model:'GY6 180cc (162QML)', type:'Scooter', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'177cc', boreDiameter:'63mm', crankStroke:'57mm',
      cylCount:'1', coolingType:'Forced air', fuelSystem:'Carburettor',
      compressionRatio:'9.5:1', plugType:'NGK CR7HSA', plugGap:'0.60–0.70mm',
      idleRpm:'1600 RPM', wotRpm:'8000 RPM',
      valveTrain:'SOHC 2-valve', intakeValveClear:'0.08–0.10mm', exhaustValveClear:'0.10–0.12mm',
      starterType:'Electric + Kick', weightKg:'35', transType:'CVT automatic',
      notes:'163QML / 162QML — GY6 family overbore to 63mm. 12–13HP. Less common than 125/150 but used in larger Chinese scooters and some ATV applications. Shares 157QMJ transmission housing. Carb: 26mm PZ26 or Keihin clone CVK26. Main jet: #115–118. Oil: 1.0L 10W-30. Common: 63mm piston rings — Chinese market only; order specifically as "GY6 180" or "162QML rings" — 157QMJ piston (57.4mm) will not substitute. Belt: 743×20×30 (same as 150cc).',
    },
  },
  {
    make:'Generic', model:'GY6 250cc (172MM)', type:'Scooter', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'244cc', boreDiameter:'67mm', crankStroke:'69mm',
      cylCount:'1', coolingType:'Forced air (some liquid-cooled)', fuelSystem:'Carburettor',
      compressionRatio:'9.0:1', plugType:'NGK CR7HSA', plugGap:'0.60–0.70mm',
      idleRpm:'1500 RPM', wotRpm:'7500 RPM',
      valveTrain:'SOHC 2-valve', intakeValveClear:'0.10–0.12mm', exhaustValveClear:'0.12–0.15mm',
      starterType:'Electric + Kick', weightKg:'42', transType:'CVT automatic',
      notes:'172MM engine — GY6 250cc class. Chinese brand name varies (CN250, Ling Ben 250, Bashan 250, TaoTao 250). 14–16HP. Uses a larger transmission case than the 150cc family — not directly interchangeable. Carb: 30mm CVK-style (Keihin clone). Main jet: #128–132. Belt: 835×20×30 (longer than 150cc belt — critical, order correct size). Oil: 1.2L 10W-30. Liquid-cooled variant (CF250): adds thermostat, coolant jacket, water pump on timing chain side — different maintenance schedule. Common: CF250 thermostat housing cracking from coolant pressure at 30,000 km — inspect annually.',
    },
  },

  // ── CHINESE PIT BIKE — CRF50/70 CLONE LINEAGE ────────────────────────────
  {
    make:'Generic', model:'Chinese 70cc Pit Bike Engine (XF70)', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'72cc', boreDiameter:'47mm', crankStroke:'41.4mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'9.0:1', plugType:'NGK CR5HSA', plugGap:'0.60–0.70mm',
      idleRpm:'1500 RPM', wotRpm:'8500 RPM',
      valveTrain:'SOHC 2-valve', intakeValveClear:'0.06–0.08mm', exhaustValveClear:'0.08–0.10mm',
      starterType:'Kick', weightKg:'20', transType:'3-speed (or 4-speed) semi-auto',
      notes:'Honda CRF50 architecture clone at 47mm bore. Used in Chinese pit bikes (TaoTao, Coolster, SSR, JCRMOTO 70). Semi-auto = foot shift, no clutch lever. 3 or 4 gears. Oil: 0.7L 10W-30 (shared engine/gearbox sump). Change every 20 hrs or 500 km. Carb: PE16 type, 16mm. Main jet: #75. Common: valve timing marks: T = TDC, line before T = ignition advance mark. At TDC compression stroke — confirm BOTH valves closed. Chinese 70cc often has inaccurate casting marks — verify TDC with a dial gauge on first service. Cam chain: 420-pitch, 82 links standard.',
    },
  },
  {
    make:'Generic', model:'Chinese 110cc Pit Bike Engine (1P52FMH)', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'107cc', boreDiameter:'52.4mm', crankStroke:'49.5mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'9.0:1', plugType:'NGK CR5HSA', plugGap:'0.60–0.70mm',
      idleRpm:'1500 RPM', wotRpm:'9000 RPM',
      valveTrain:'SOHC 2-valve', intakeValveClear:'0.06–0.08mm', exhaustValveClear:'0.08–0.10mm',
      starterType:'Kick (+ Electric optional)', weightKg:'22', transType:'4-speed manual (or semi-auto)',
      notes:'The ubiquitous Chinese pit bike engine. 52.4mm bore × 49.5mm stroke ≈ 107cc (marketed as "110cc"). Same external dimensions as Honda XR/CRF50/70 — most Chinese pit bikes use this block. SOHC 2-valve — pushrod SOHC (different from GY6 chain-SOHC). Oil: 0.7L 10W-30. Carb: PE18 (18mm slide). Main jet: #78–82. Pilot jet: #35. Manual clutch version: 4-speed with lever. Semi-auto: 4-speed no lever. Common: cam chain guides (rubber slider) wearing at 5000 km — replace when visible cracking; delayed replacement causes chain jump and bent valves. Honda XR50 cam chain fits 420-pitch Chinese 110cc blocks.',
    },
  },
  {
    make:'Lifan', model:'LF152FMH (110cc)', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'107cc', boreDiameter:'52.4mm', crankStroke:'49.5mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'9.0:1', plugType:'NGK CR5HSA', plugGap:'0.60–0.70mm',
      idleRpm:'1500 RPM', wotRpm:'9000 RPM',
      valveTrain:'SOHC 2-valve', intakeValveClear:'0.06–0.08mm', exhaustValveClear:'0.08–0.10mm',
      starterType:'Kick + Electric', weightKg:'22', transType:'4-speed manual',
      notes:'Lifan Industries is one of China\'s largest engine makers (motorcycles + cars). LF152FMH is their quality-grade 110cc for export pit bikes and Lifan-branded motorcycles. Better metallurgy than generic 1P52FMH — notably tighter piston/bore clearance from factory (0.02mm vs 0.04mm on generics). Oil: 0.7L 10W-30. Cam chain: 420 pitch (Honda cross-compatible). Electric start adds generator coil on right side. Common: Lifan 110cc CDI: AC-powered CDI (uses stator output) — if CDI fails, confirm AC voltage at CDI connector (80–120V AC at WOT); low voltage indicates stator coil failure.',
    },
  },
  {
    make:'Lifan', model:'LF154FMI (125cc Manual)', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'124cc', boreDiameter:'54mm', crankStroke:'54mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'9.2:1', plugType:'NGK CR7HSA', plugGap:'0.60–0.70mm',
      idleRpm:'1400 RPM', wotRpm:'9500 RPM',
      valveTrain:'SOHC 2-valve', intakeValveClear:'0.06–0.08mm', exhaustValveClear:'0.08–0.10mm',
      starterType:'Kick + Electric', weightKg:'24', transType:'4-speed manual',
      notes:'LF154FMI = Lifan 125cc manual-clutch pit bike/commuter engine. Square engine (54×54mm). Used in Lifan-branded bikes and many SSR, Piranha, TB Parts race machines. Better quality than generic Chinese 125 — Lifan 154FMI has forged piston (vs cast on generics). Carb: PE22 (22mm). Main jet: #95. Oil: 0.9L 10W-30. Electric start: note Lifan uses RIGHT-side kickstarter and LEFT-side electric start (unusual — most Chinese reverse this). Common: primary chain (left side engine cover) stretching at 10,000 km — add shim behind primary sprocket to take up slack before full replacement needed.',
    },
  },
  {
    make:'Zongshen', model:'ZS155FMI (125cc)', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'124cc', boreDiameter:'54mm', crankStroke:'54mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'9.2:1', plugType:'NGK CR7HSA', plugGap:'0.60–0.70mm',
      idleRpm:'1400 RPM', wotRpm:'9500 RPM',
      valveTrain:'SOHC 2-valve', intakeValveClear:'0.06–0.08mm', exhaustValveClear:'0.08–0.10mm',
      starterType:'Kick', weightKg:'23', transType:'4-speed manual',
      notes:'Zongshen 125cc pit bike engine. Used in Zongshen-branded bikes and supplied to Chinese pit bike assemblers. Carb: 22mm slide. Oil: 0.9L 10W-30. ZS155FMI does NOT have electric start provision (no stator winding for charging). CDI: DC-type (requires battery) or AC-type depending on year. Common: Zongshen 125cc oil drain plug: M14×1.5mm thread — strip prone; torque to 20 Nm only. If stripped, M16×1.5mm thread insert (Helicoil). Gasket set: generic "Chinese 125cc gasket set" fits ZS155FMI.',
    },
  },
  {
    make:'YX', model:'YX140 (140cc Performance)', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'140cc', boreDiameter:'56mm', crankStroke:'56.6mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'10.5:1', plugType:'NGK CR7HSA', plugGap:'0.60mm',
      idleRpm:'1500 RPM', wotRpm:'10000+ RPM',
      valveTrain:'SOHC 2-valve (performance cam optional)', intakeValveClear:'0.06mm', exhaustValveClear:'0.08mm',
      starterType:'Kick', weightKg:'23', transType:'4-speed manual',
      notes:'Yinxiang (YX) 140cc — China\'s dominant performance pit bike engine brand. Higher compression, better casting quality. 56mm bore uses YX-proprietary big-bore piston. Carb: 26mm PE26 or VM26 Mikuni clone. Main jet: #105–112 depending on exhaust. Oil: 0.9L 10W-40 (synthetic recommended for high-rev use). Common mods: YX150 head (larger valves 26/22mm vs YX140 25/21mm — swap improves flow). YX140 vs TB143: TB Racing sells a "143cc" version with longer stroke — different piston, NOT interchangeable. Used in YCF/Pitster Pro/Stomp racing pit bikes.',
    },
  },
  {
    make:'YX', model:'YX160 (160cc Performance)', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'160cc', boreDiameter:'60mm', crankStroke:'56.6mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'10.8:1', plugType:'NGK CR7HSA', plugGap:'0.60mm',
      idleRpm:'1500 RPM', wotRpm:'10500+ RPM',
      valveTrain:'SOHC 2-valve', intakeValveClear:'0.06mm', exhaustValveClear:'0.08mm',
      starterType:'Kick', weightKg:'24', transType:'4-speed manual',
      notes:'YX160 = 60mm bore, YX\'s top-spec pit bike engine. Race-derived. 60mm piston is YX proprietary — confirm "YX160 piston" when ordering (NOT GY6, NOT Loncin). Head: large valve (28/24mm). Carb: 28mm PWK Keihin clone or VM28. Oil: 0.9L full synthetic 10W-40. Valve clearance tighter due to performance cam — check every 20 hrs racing, 50 hrs trail. Common: YX160 primary chain: 219-pitch (vs Honda CRF 420-pitch at same power level) — stronger for race use but YX-specific sprockets required. Used in Class A pit bike racing.',
    },
  },

  // ── CHINESE CUB / MOPED ENGINES ───────────────────────────────────────────
  {
    make:'Generic', model:'Chinese 70cc Cub (C70 Clone)', type:'Moped', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'72cc', boreDiameter:'47mm', crankStroke:'41.4mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'9.0:1', plugType:'NGK CR5HSA', plugGap:'0.60–0.70mm',
      idleRpm:'1400 RPM', wotRpm:'7500 RPM',
      valveTrain:'SOHC 2-valve', intakeValveClear:'0.06mm', exhaustValveClear:'0.08mm',
      starterType:'Kick + Push (pedal start)', weightKg:'19', transType:'3-speed semi-auto (no clutch lever)',
      notes:'Honda C70 clone — horizontal engine (cylinder points forward). Used in Chinese cub-style mopeds/scooters. 3-speed semi-auto: foot shift, no clutch lever required, centrifugal clutch. Oil: 0.7L SAE 30/10W-30 (shared sump). Change every 1000 km or 3 months. Carb: 16mm slide. Main jet: #72–76. Engine fires cylinder-forward (horizontal crankshaft) — oil drain is underneath. Common: semi-auto clutch slipping when warm — spring weakening; replace clutch springs every 15,000 km. Chinese C70 clutch: Honda C70 clutch plates and springs cross-compatible.',
    },
  },
  {
    make:'Generic', model:'Chinese 110cc Cub (Wave/Dream Clone)', type:'Moped', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'107cc', boreDiameter:'52.4mm', crankStroke:'49.5mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'9.0:1', plugType:'NGK CR7HSA', plugGap:'0.60–0.70mm',
      idleRpm:'1400 RPM', wotRpm:'8500 RPM',
      valveTrain:'SOHC 2-valve', intakeValveClear:'0.06mm', exhaustValveClear:'0.08mm',
      starterType:'Kick + Electric', weightKg:'22', transType:'4-speed semi-auto',
      notes:'Horizontal 110cc — same bore/stroke as pit bike 1P52FMH but horizontal orientation. Used in Honda Wave, Dream, and CG-style clone commuters (Loncin, Lifan, Haojue, Dayun, Jialing branded). Oil: 0.7L 10W-30. Carb: 18mm slide (PB18 or equivalent). Electric start stator: provides 12V AC for charging. Common: Chinese 110cc cub electrical fault — AC-powered horn/light system has no regulator on budget models; lights pulse with RPM (normal). For battery charging: regulator/rectifier is separate component, often fails at 3 years. CDI: widely interchangeable between Chinese 110 cub brands.',
    },
  },
  {
    make:'Loncin', model:'G155FB (155cc Moped)', type:'Moped', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'149cc', boreDiameter:'57mm', crankStroke:'58.6mm',
      cylCount:'1', coolingType:'Forced air (scooter-type)', fuelSystem:'Carburettor',
      compressionRatio:'9.5:1', plugType:'NGK CR7HSA', plugGap:'0.60–0.70mm',
      idleRpm:'1600 RPM', wotRpm:'8500 RPM',
      valveTrain:'SOHC 2-valve', intakeValveClear:'0.08mm', exhaustValveClear:'0.10mm',
      starterType:'Electric + Kick', weightKg:'30', transType:'CVT automatic',
      notes:'Loncin G-series: purpose-built for scooter/moped OEM supply (different architecture from the GX-clone horizontal range). G155FB is GY6 150cc equivalent (similar bore/stroke). Used in Loncin-branded scooters and supplied to European entry-level scooter brands. Carb: 24mm PD24J. Belt: 743×20×30 (same as GY6 150). Oil: 0.9L 10W-30. Common: Loncin G-series uses slightly different variator centre nut thread (left-hand thread — turn clockwise to loosen) — vs generic GY6 which is also left-hand thread; confirm before applying additional torque. Both are left-hand thread on variator nut.',
    },
  },
  {
    make:'Loncin', model:'G200F (200cc Go-Kart/Mini Bike)', type:'Go-kart', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'196cc', boreDiameter:'65mm', crankStroke:'59mm',
      cylCount:'1', coolingType:'Forced air', fuelSystem:'Carburettor',
      compressionRatio:'9.5:1', plugType:'NGK CR7HSA', plugGap:'0.60–0.70mm',
      idleRpm:'1600 RPM', wotRpm:'7500 RPM',
      valveTrain:'SOHC 2-valve', intakeValveClear:'0.08mm', exhaustValveClear:'0.10mm',
      starterType:'Kick + Electric', weightKg:'27', transType:'Centrifugal clutch + manual gearbox',
      notes:'Loncin G200F is a bike-format engine (SOHC chain cam, not OHV pushrod like GX200 clones). Different architecture from 168F-2 clones — NOT interchangeable parts. Used in Loncin-powered mini bikes and go-karts with gearboxes (not CVT). 65mm bore = proprietary Loncin. Gearbox: 4-speed or automatic depending on variant (G200FA = auto, G200FM = manual). Oil: 0.9L 10W-30 (engine); separate transmission oil 0.1L if applicable. Carb: 22mm slide. Common: G200F cam chain tensioner hydraulic auto-type — same failure mode as GY6 125cc; replace at 25,000 km.',
    },
  },

  // ── CHINESE 2-STROKE SCOOTER ENGINES ─────────────────────────────────────
  {
    make:'Generic', model:'1E40QMB 49cc 2-Stroke (Minarelli Clone)', type:'Scooter', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'49cc', boreDiameter:'40mm', crankStroke:'39.2mm',
      cylCount:'1', coolingType:'Forced air', fuelSystem:'Carburettor',
      mixRatio:'40:1 (break-in 25:1)',
      plugType:'NGK BR8HS', plugGap:'0.50–0.60mm',
      idleRpm:'1800 RPM', wotRpm:'8500 RPM',
      starterType:'Kick + Electric', weightKg:'12', transType:'CVT automatic',
      notes:'Chinese clone of Yamaha Minarelli AM6 / JOG architecture. Air-cooled 2-stroke 50cc scooter engine. Used in Chinese market scooters sold before Euro 4 (pre-2017). Reed valve induction. Carb: 12mm slide SHA clone. Main jet: #70–74 sea level. Belt: 669×18×30. Oil: mix fuel 40:1 OR separate oil injection (if fitted — verify before use). No separate gearbox oil — 2-stroke. Common: piston ring wear at 5000 km in stop/go use — top ring gap check: new 0.1–0.2mm, replace >0.5mm. Expansion chamber exhaust significantly improves power (tuned pipe). Reed valve petals: replace if delaminating.',
    },
  },
  {
    make:'Generic', model:'1PE40QMB 49cc 2-Stroke Liquid-Cooled', type:'Scooter', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'49cc', boreDiameter:'40mm', crankStroke:'39.2mm',
      cylCount:'1', coolingType:'Liquid-cooled', fuelSystem:'Carburettor',
      mixRatio:'40:1',
      plugType:'NGK BR8HS', plugGap:'0.50–0.60mm',
      idleRpm:'1800 RPM', wotRpm:'9000 RPM',
      starterType:'Kick + Electric', weightKg:'14', transType:'CVT automatic',
      notes:'Liquid-cooled Minarelli clone (same block, added water jacket). "P" in 1PE = water pump. Coolant: 200–300mL (50/50 mix), change every 20,000 km. Water pump impeller: integral with crankshaft (no separate pump). Radiator: small unit mounted under fairing — clear mud/debris regularly. Compared to 1E40QMB: more power (better thermal control) but water pump seal is a long-term failure point. Common: water pump seal leaking at 30,000+ km — coolant enters crankcase; symptom: blue-white smoke on cold start. Replace crank seal kit when seal fails.',
    },
  },

  // ── POPULAR COMPLETE MACHINES WITH CLONE ENGINES ─────────────────────────
  {
    make:'Coleman', model:'CT200U-EX Mini Bike', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'196cc', boreDiameter:'68mm', crankStroke:'54mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'66', transType:'Centrifugal clutch (TAV2 torque converter optional)',
      notes:'Most popular Chinese clone mini bike in North America. Engine: Loncin LC1P70FA or equivalent generic 196cc OHV (badged "Coleman" or sourced from Loncin). Centrifugal clutch: 10T/12T sprocket #35 or #41 chain. Clutch engagement: ~1800 RPM. Common upgrades: TAV2 torque converter (replaces centrifugal clutch — eliminates belt but improves low-speed torque); 22mm carb kit; stage 1 exhaust. Oil: 0.6L SAE 30. Common stock issues: factory carb jetting lean for altitude >500m — pilot jet #40, main jet #92 standard tune for sea level. Tyre: 4.10-6 (19" nominal).',
    },
  },
  {
    make:'Baja', model:'MB200 Mini Bike', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'196cc', boreDiameter:'68mm', crankStroke:'54mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'64', transType:'Centrifugal clutch',
      notes:'Baja Motorsports MB200 — uses a 196cc clone engine (sourced from various Chinese OEMs over model years — Loncin, generic 168F-2, or Rato depending on production run). Carb: Huayi 16mm. Chain: #35 chain 68-link. Sprocket: 10T engine / 60T rear. Disk brake rear. Common engine identification: look for casting code on engine block — Loncin units have "LC" prefix; others are generic. All 196cc OHV clones are service-compatible. Common: throttle cable routing kinks after first disassembly — use spiral wrap to protect cable at frame notch.',
    },
  },
  {
    make:'TrailMaster', model:'Mini XRX Go-Kart (196cc)', type:'Go-kart', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'196cc', boreDiameter:'68mm', crankStroke:'54mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil + Electric', weightKg:'113', transType:'Torque converter (TAV2) + #35 chain',
      notes:'Chinese go-kart OEM. Engine: generic 196cc OHV clone (Loncin or equivalent). TAV2 torque converter standard (driver/driven pulley, rubber belt). TAV2 belt: standard 30-series belt (754, 835, 203797 depending on variant). Belt life: 2000–5000 km depending on operating temp — high ambient temp degrades rubber. Governor: remove for track use (add valve springs to compensate). Common: TAV2 driven clutch spider spring breaking — sharp engagement; replace 3× spider springs every 500 hrs. Brakes: disc rear, drum front.',
    },
  },

  // ── MISC NOTABLE CLONE BRANDS ─────────────────────────────────────────────
  {
    make:'Chongqing Rato', model:'R80 (78cc Vertical)', type:'Lawnmower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'78cc', boreDiameter:'50mm', crankStroke:'40mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.0:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3000 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10mm', exhaustValveClear:'0.15mm',
      starterType:'Recoil', weightKg:'9.5',
      notes:'Rato R80: 78cc Honda GC110-class clone (Honda GC = overhead cam, but Rato R80 uses OHV pushrod). Used in Chinese budget walk-behind mowers. Carb: 12mm slide. Main jet: #68. Oil: 0.45L SAE 30 — very small sump; check level every 8 hrs. Air filter: wet foam, wash every 25 hrs. Common: deck blade adapter: 19mm bore (vs Honda GCx series 20mm bore) — Chinese blade adapters required; Honda blade bolts and washers are direct fit. Blade tip speed: governed below 3000 RPM for safety.',
    },
  },
  {
    make:'SGS Engineering', model:'SS110 6.5HP (196cc)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'196cc', boreDiameter:'68mm', crankStroke:'54mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.5:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'16.0',
      notes:'SGS Engineering: UK distributor of Chinese OHV engines. SS110 is SGS-branded generic 168F-2. Widely sold in UK through Tool Station, Machine Mart. Parts: order "Honda GX200 equivalent" for all service parts. Carb: Huayi. Oil: 0.6L SAE 30. 2-year warranty provided by SGS (not the Chinese OEM). Common: SGS supply pressure washer/generator OEM engines — note SGS throttle linkage varies between applications; carry spare throttle return spring.',
    },
  },
  {
    make:'XtremepowerUS', model:'7HP 212cc Engine', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'212cc', boreDiameter:'70mm', crankStroke:'55mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.5:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'16.5',
      notes:'XtremepowerUS brand (US-marketed, Chinese-manufactured). 212cc generic OHV clone. Used in XtremepowerUS log splitters and pressure washers. Engine source varies by production run (generic Chinese OEM). Service: treat as generic 168F-2 / Predator 212 equivalent. Mounting holes: standard GX200 bolt pattern (66mm × 66mm on 2-bolt face). Carb: Huayi. Common: XtremepowerUS log splitter — engine coupling direct-drive to hydraulic pump; check coupling spider (flexible insert) every 100 hrs; cracked spider causes banging on load application.',
    },
  },
  {
    make:'Tomahawk', model:'TPE-212 (212cc)', type:'Go-kart', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'212cc', boreDiameter:'70mm', crankStroke:'55mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor',
      compressionRatio:'8.5:1', plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Recoil', weightKg:'16.0',
      notes:'Tomahawk Power brand targeting Predator 212 market with slightly higher specs: ships with 22mm carb (vs stock Predator 16mm) and low-profile air filter. Otherwise standard 212cc OHV clone architecture. Performance out of box ~6.5HP vs Predator 5HP. No governor bypass included — 3600 RPM governed. Full Honda GX200/Predator 212 parts cross-compatibility. Used as OEM engine for some go-kart and mini bike brands. Common: Tomahawk exhaust flange gasket: copper composition — re-torque hot after first 2 hrs. Main jet: #92 stock (already larger than Predator).',
    },
  },

  // ── CHINESE V-TWIN CLONE ──────────────────────────────────────────────────
  {
    make:'Loncin', model:'V-Twin 688cc (LC2V80F)', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'688cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1600 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Electric + Recoil', weightKg:'35',
      notes:'Loncin 688cc V-twin: OHV air-cooled, competing with Kawasaki FS651V and B&S twin. Used in Chinese-market ride-on mowers and some exported to Oceania/EU under various mower brands. 90° V-twin. Oil: 1.9L 10W-30. Carbs: 2× 22mm (one per cylinder) — synchronise both carb butterfly openings with sync tool at every major service. Cylinder head gaskets: independent left/right — replace individually. Charging stator: 12V / 5A. Common: V-twin balance: Loncin LC2V uses single balance shaft (primary balance only); more vibration than Kawasaki FS-series at idle — characteristic, not fault. Timing: both cylinders fire simultaneously (wasted spark CDI).',
    },
  },
  {
    make:'Ducar', model:'Twin 420cc (DPC20B)', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'420cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.10–0.15mm', exhaustValveClear:'0.15–0.20mm',
      starterType:'Electric', weightKg:'38',
      notes:'Ducar DPC20B: 2-cylinder horizontally-opposed (boxer) 420cc. 20HP. Used in Chinese generators and light construction equipment. Flat twin reduces vibration vs V-twin. Oil: 1.5L SAE 30. Carb: single Huayi 20mm feeding both cylinders via intake manifold splitter — balance inherent. Electric start only (no recoil backup). Common: intake manifold gasket leaking between cylinders causing one-cylinder lean misfire — symptoms: rough idle, backfire on load. Torque intake manifold bolts to 12 Nm.',
    },
  },

];

async function run() {
  const existingSlugs = await fetchExistingSlugs();
  const slice = limit < ENTRIES.length ? ENTRIES.slice(0, limit) : ENTRIES;
  const result = await batchInsert(slice, existingSlugs, { dryRun });
  console.log(`Seed-9 complete: ${result.inserted} inserted, ${result.skipped} skipped.`);
}

run().catch(e => { console.error(e); process.exit(1); });
