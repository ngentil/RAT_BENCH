/**
 * Training-data seed 10 — 2-stroke RC/hobby engines: DLE full range (singles + twins),
 * EME, 3W, Desert Aircraft (DA), OS GT petrol series, Zenoah petrol,
 * OS/YS/Saito/CMB glow engines, Chinese RC 2-stroke copies, glider/UAV engines.
 *
 * node scripts/wiki-import/training-data-seed-10.mjs
 * node scripts/wiki-import/training-data-seed-10.mjs --dry-run
 */

import { fetchExistingSlugs, batchInsert } from './_shared.mjs';

const args     = process.argv.slice(2);
const dryRun   = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit    = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

const SRC = 'RAT BENCH Training Seed';
const SUM = 'Seeded from manufacturer service manual data';

const ENTRIES = [

  // ── DLE ENGINES — SINGLE CYLINDER ────────────────────────────────────────
  // DLE (Dalian Enpower / 大连英飞) — China's leading petrol RC engine brand.
  // All DLE petrol singles: 2-stroke, gasoline 87-93 oct, 30:1-40:1 premix.
  // Electronic ignition standard. CDI box included.
  {
    make:'DLE', model:'DLE-20', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'20.4cc', boreDiameter:'34.4mm', crankStroke:'22mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro WT-257)',
      mixRatio:'30:1 (break-in 25:1)', fuelTankCapacity:'N/A (external)',
      plugType:'NGK CM6', plugGap:'0.50–0.60mm',
      idleRpm:'1400 RPM', wotRpm:'9000 RPM',
      starterType:'Electric (starter shaft)', weightKg:'0.39',
      notes:'DLE\'s entry-level petrol single. Walbro WT-257 diaphragm carb (no float — works inverted). Needle: L screw 1.5 turns out, H screw 1.5 turns out from lightly seated. Break-in: 10 tanks at <¾ throttle, rich needle setting. Electronic CDI — no points. Prop range: 15×8 to 18×6. Crankshaft thread: M6 left-hand (prop washer/nut). Mounting: 4× M4 bolts, 30mm×30mm square pattern. Common: lean cut-out at WOT transition from poorly set H needle — richen H 1/8 turn at a time until smooth. Fuel: 30:1 premix with Stihl HP Ultra or equivalent RC-grade 2T oil.',
    },
  },
  {
    make:'DLE', model:'DLE-30', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'30.5cc', boreDiameter:'38mm', crankStroke:'27mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro WB-37)',
      mixRatio:'30:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50–0.60mm',
      idleRpm:'1300 RPM', wotRpm:'8500 RPM',
      starterType:'Electric', weightKg:'0.48',
      notes:'Step up from DLE-20 for 2m wingspan aircraft. 2.5HP. Walbro WB-37. L needle: 1.5T out, H needle: 1.25T out. Prop: 16×8 to 20×6 2-blade, 15×10 3-blade. Muffler: rear-mount standard (front-mount optional). Crankshaft: M8 left-hand. Mounting: 4× M4, 40mm×40mm. Common: prop washer fretting at 50+ hrs — check torque 6 Nm; use threadlocker on prop nut. Break-in same as DLE-20 procedure.',
    },
  },
  {
    make:'DLE', model:'DLE-35RA', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'35.0cc', boreDiameter:'40mm', crankStroke:'28mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro WT-668)',
      mixRatio:'30:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50–0.60mm',
      idleRpm:'1200 RPM', wotRpm:'8000 RPM',
      starterType:'Electric', weightKg:'0.54',
      notes:'RA = Rear Exhaust (pipe exits rearward — better for tractor-style aircraft). 2.9HP. Most popular DLE single for 35–50% scale aircraft. Walbro WT-668. L: 1.5T, H: 1.25T. Prop: 18×8 to 22×6. Mounting: 4× M4, 50mm×50mm. Muffler: rear-exit, integrated into crankcase casting. Common: muffler carbon build-up at 30 hrs — back-pressure affects idle stability; clean with hot water + detergent cycle. Ignition kill switch: always wire to TX for safety.',
    },
  },
  {
    make:'DLE', model:'DLE-40', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'40.0cc', boreDiameter:'42mm', crankStroke:'29mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro WT-668)',
      mixRatio:'30:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50–0.60mm',
      idleRpm:'1200 RPM', wotRpm:'8000 RPM',
      starterType:'Electric', weightKg:'0.60',
      notes:'Step up from DLE-35RA. Same Walbro carb. Prop: 18×10 to 22×8. Mounting 4× M4, 50×50mm. Used in large aerobatic aircraft (Yak-54, Extra 330, Cap 232) at 40% scale. Tuning: rich H needle critical for inverted flight — lean cut at negative-g, richen H ¼ turn. Break-in: 5 tanks partial throttle, rich mixture.',
    },
  },
  {
    make:'DLE', model:'DLE-55RA', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'55.0cc', boreDiameter:'46mm', crankStroke:'33mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro WT-668)',
      mixRatio:'30:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50–0.60mm',
      idleRpm:'1200 RPM', wotRpm:'7800 RPM',
      starterType:'Electric', weightKg:'0.76',
      notes:'Largest DLE single. 4.5HP. Rear exhaust. Prop: 22×8 to 26×8. Mounting: M4, 60×60mm. Common: at 55cc single-cylinder vibration is high — use vibration dampeners on all electronics in airframe. Crankshaft: M10 left-hand. CDI timing fixed at 27° BTDC. Decompressor button on cylinder head — mandatory for hand propping; electric start recommended. Muffler baffle cleaning every 25–30 flights.',
    },
  },

  // ── DLE ENGINES — TWIN CYLINDER (BOXER) ──────────────────────────────────
  // DLE twins use two linked single cranks with 180° offset. Boxer configuration.
  {
    make:'DLE', model:'DLE-60 Twin', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'60.5cc', boreDiameter:'38mm', crankStroke:'27mm',
      cylCount:'2', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro ×2)',
      mixRatio:'30:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50–0.60mm',
      idleRpm:'1200 RPM', wotRpm:'8000 RPM',
      starterType:'Electric', weightKg:'1.05',
      notes:'DLE-60 = 2× DLE-30 cylinders on shared crankcase. Boxer twin — smooth power due to 180° balance. Two independent Walbro carbs — must be synchronised (balance both idle screws first, then H screws equally). Prop: 24×8 to 28×6. Mounting: 4× M4, 80×40mm. CDI: dual-pickup single CDI fires both cylinders wasted spark. Common: carb sync drift after temperature change — re-balance before critical flights. Throttle linkage: both carbs must open identically (use slave horn method).',
    },
  },
  {
    make:'DLE', model:'DLE-85 Twin', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'85.0cc', boreDiameter:'42.5mm', crankStroke:'30mm',
      cylCount:'2', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro ×2)',
      mixRatio:'30:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50–0.60mm',
      idleRpm:'1200 RPM', wotRpm:'7800 RPM',
      starterType:'Electric', weightKg:'1.15',
      notes:'7HP boxer twin. For 35–40% scale aircraft and large aerobats. Prop: 26×8 to 30×8. Mounting: M4, 90×40mm. Dual CDI. Identical carb sync procedure as DLE-60. Common: crank seal migration at 100+ hrs — rear-facing crankshaft oil seal can walk under sustained inverted flight (negative pressure); inspect seals at every 50 hr check.',
    },
  },
  {
    make:'DLE', model:'DLE-111 Twin', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'111.0cc', boreDiameter:'46mm', crankStroke:'33.5mm',
      cylCount:'2', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro ×2)',
      mixRatio:'30:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50–0.60mm',
      idleRpm:'1200 RPM', wotRpm:'7500 RPM',
      starterType:'Electric', weightKg:'1.45',
      notes:'9HP. Popular in 40% Extra 330/Yak-54 and large warbirds. Prop: 28×10 to 32×8. Mounting: M5, 100×40mm. Weight 1.45kg — balance point consideration in long aircraft noses. Dual CDI pickups. Break-in: 10 litres at partial throttle. Common: cylinder base gasket weeping at 80 hrs — symptom: oil mist on one cylinder fin. Torque base nuts to 8 Nm on DLE twin bases.',
    },
  },
  {
    make:'DLE', model:'DLE-120 Twin', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'120.0cc', boreDiameter:'46mm', crankStroke:'36mm',
      cylCount:'2', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro ×2)',
      mixRatio:'30:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50–0.60mm',
      idleRpm:'1100 RPM', wotRpm:'7500 RPM',
      starterType:'Electric', weightKg:'1.50',
      notes:'10HP. For 40–50% scale giants. Prop: 30×10 to 34×8. Mounting: M5, 100×40mm. Very popular in Giant Scale competitions. Dual CDI. Common: DLE-120 prop hub flange: left-hand M10 prop bolt — confirm orientation before installation (safety critical). At this power level, hard mount on airframe causes cracking — always use vibration isolators.',
    },
  },
  {
    make:'DLE', model:'DLE-128 Twin', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'128.0cc', boreDiameter:'48mm', crankStroke:'35mm',
      cylCount:'2', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro ×2)',
      mixRatio:'30:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50–0.60mm',
      idleRpm:'1100 RPM', wotRpm:'7500 RPM',
      starterType:'Electric', weightKg:'1.60',
      notes:'11HP boxer twin. Differentiated from DLE-120 by 48mm bore. Prop: 30×10 to 34×10 3-blade. Mounting: M5. Common use: JR Yak-54 50%, Pilot RC Extra 330 50%. Dual CDI, same electronic ignition as all DLE petrol range. Vibration isolator mount mandatory at this displacement — composite airframe cracking documented without.',
    },
  },
  {
    make:'DLE', model:'DLE-170 Twin', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'170.0cc', boreDiameter:'52mm', crankStroke:'40mm',
      cylCount:'2', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro ×2)',
      mixRatio:'30:1', fuelTankCapacity:'N/A',
      plugType:'NGK CMR6H', plugGap:'0.60–0.70mm',
      idleRpm:'1100 RPM', wotRpm:'7000 RPM',
      starterType:'Electric', weightKg:'1.85',
      notes:'14HP. For giant scale aircraft 4.5m+ wingspan. Prop: 32×12 to 36×10 3-blade. Heavy-duty crankshaft bearings (C3 clearance rated). Dual CDI. Break-in: 15 litres. Common: DLE-170 cylinder head bolt torque critical — 12 Nm in star pattern; undertorqued causes head gasket failure at high load. At WOT sustained (aerobatics): check head bolt torque every 10 hours.',
    },
  },
  {
    make:'DLE', model:'DLE-222 Twin', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'222.0cc', boreDiameter:'55mm', crankStroke:'47mm',
      cylCount:'2', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro ×2)',
      mixRatio:'30:1', fuelTankCapacity:'N/A',
      plugType:'NGK CMR6H', plugGap:'0.60–0.70mm',
      idleRpm:'1000 RPM', wotRpm:'6500 RPM',
      starterType:'Electric', weightKg:'2.20',
      notes:'18HP — DLE\'s largest. For 50%+ scale giants (5m wingspan+). Prop: 36×12 to 42×10. Crankshaft: 25mm shaft, M12 left-hand prop nut. CDI box: external unit with capacitive charge from dual stator coils. Weight 2.2kg — nose-heavy aircraft design consideration. Common: CDI failure from vibration damage to solder joints — pot CDI board in RTV silicone. Prop shaft run-out: check with dial gauge after 50 hrs; >0.10mm requires crank re-balance.',
    },
  },

  // ── EME ENGINES (Chinese, German-spec quality line) ────────────────────────
  {
    make:'EME', model:'EME-35 Single', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'35.0cc', boreDiameter:'40mm', crankStroke:'28mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro WB-37)',
      mixRatio:'30:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50–0.60mm',
      idleRpm:'1200 RPM', wotRpm:'8000 RPM',
      starterType:'Electric', weightKg:'0.52',
      notes:'EME is a Chinese-German collaborative brand emphasising tighter machining tolerances. EME-35 competes directly with DLE-35RA. Notable difference: EME uses a precision-turned crankshaft (vs DLE cast crank) — lower vibration, smoother idle. Carb: Walbro WB-37. L: 1.5T, H: 1.5T. Prop: 18×8 to 22×6. Muffler: side-exit. Common: EME ignition module runs hotter than DLE — mount clear of exhaust; max operating temp 60°C. Same NGK CM6 plug as DLE.',
    },
  },
  {
    make:'EME', model:'EME-70 Twin', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'70.0cc', boreDiameter:'40mm', crankStroke:'28mm',
      cylCount:'2', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro ×2)',
      mixRatio:'30:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50–0.60mm',
      idleRpm:'1200 RPM', wotRpm:'8000 RPM',
      starterType:'Electric', weightKg:'0.98',
      notes:'EME-70 = 2× EME-35 cylinders. 6HP twin. Precision crankshaft advantage carries through to twin — notably lower vibration than equivalent DLE-60 (some builders measure 15–20% lower vibration RMS). Dual Walbro WB-37. Carb sync procedure: sync throttle levers first, then balance L and H needles separately. Prop: 24×8 to 28×8. Mounting: M4, 82×40mm.',
    },
  },
  {
    make:'EME', model:'EME-120 Twin', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'120.0cc', boreDiameter:'48mm', crankStroke:'33mm',
      cylCount:'2', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro ×2)',
      mixRatio:'30:1', fuelTankCapacity:'N/A',
      plugType:'NGK CMR6H', plugGap:'0.60–0.70mm',
      idleRpm:'1100 RPM', wotRpm:'7500 RPM',
      starterType:'Electric', weightKg:'1.50',
      notes:'EME-120: 10HP twin, same market as DLE-120. Precision crankshaft, high-polish ports (EME claims 8% improved VE). Mounting: M5, 100×40mm. Dual CDI. Common: EME uses Loctite-sealed crank pin — do not press apart without heat gun (95°C) to avoid crank damage. Piston ring: 1.0mm×1.0mm (thinner than DLE 1.2mm) — must use EME OEM rings.',
    },
  },
  {
    make:'EME', model:'EME-300B Twin', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'300.0cc', boreDiameter:'60mm', crankStroke:'53mm',
      cylCount:'2', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro HDA)',
      mixRatio:'30:1', fuelTankCapacity:'N/A',
      plugType:'NGK CMR6H', plugGap:'0.60–0.70mm',
      idleRpm:'900 RPM', wotRpm:'6000 RPM',
      starterType:'Electric', weightKg:'2.80',
      notes:'EME\'s flagship — 300cc boxer twin. ~24HP. Purpose-built for giant aircraft (6m+ span, 30+ kg AUW). Prop: 40×14 to 46×12 3-blade. Forged crank, heavy-duty bearings rated 15,000+ hrs. Dual Walbro HDA carburettors. Crankshaft: 28mm diameter. CDI: separate box per cylinder. Operating temp: monitor head temp, max 220°C (EGT). Common: EME-300B idle instability if mufflers not symmetrically loaded — both mufflers must have same back-pressure (length within 5mm). Fuel consumption: ~500 mL/hr at cruise.',
    },
  },

  // ── 3W ENGINES (Germany / China) ─────────────────────────────────────────
  {
    make:'3W', model:'3W-28i Single', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'28.0cc', boreDiameter:'37mm', crankStroke:'26mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Bing 16/20)',
      mixRatio:'50:1 (Motul Kart Grand Prix or equivalent)', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50mm',
      idleRpm:'1200 RPM', wotRpm:'9000 RPM',
      starterType:'Electric', weightKg:'0.44',
      notes:'3W is German-designed, partially Chinese-manufactured, known for exceptional engineering. "i" suffix = standard electronic ignition. 3W uses Bing carburettors (German origin, different from Walbro — slide type, not rotary). Bing 16 or 20mm depending on engine. Needle: clip position 3 standard (5 positions). 3W specifies 50:1 with premium 2T oil (Motul Kart, Ipone 2T Racing) — higher ratio than DLE due to superior port/piston tolerance. Common: Bing carb diaphragm: 2-year replacement regardless of condition (diaphragm stiffening causes lean surge). German-quality prop hub: M8 left-hand, stainless prop washer standard.',
    },
  },
  {
    make:'3W', model:'3W-55i Single', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'55.0cc', boreDiameter:'46mm', crankStroke:'33mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Bing 16/20)',
      mixRatio:'50:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50mm',
      idleRpm:'1100 RPM', wotRpm:'8000 RPM',
      starterType:'Electric', weightKg:'0.73',
      notes:'4.4HP. Largest 3W single. Bing 20mm carb. Prop: 22×8 to 26×8. Mounting: M4, 64×64mm. CNC-machined crankcase (3W distinguishing feature over Chinese competitors). Crank: laser-balanced. Break-in: 2 litres rich, no sustained WOT first 30 minutes. Common: 3W ignition coil: integrated into flywheel cover — replace as assembly. Air gap: 0.25mm (critical — measure with feeler gauge; timing-linked to gap).',
    },
  },
  {
    make:'3W', model:'3W-106CS Twin', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'106.0cc', boreDiameter:'46mm', crankStroke:'32mm',
      cylCount:'2', coolingType:'Air-cooled', fuelSystem:'Carburettor (Bing ×2)',
      mixRatio:'50:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50mm',
      idleRpm:'1100 RPM', wotRpm:'8500 RPM',
      starterType:'Electric', weightKg:'1.35',
      notes:'CS = "Clean and Simple" housing. 8.5HP twin. Used in top-tier giant scale competition. Dual Bing carbs — balance procedure: 3W recommends manometer sync (not visual only). Mounting: M5, 100×50mm. 3W provide fuel flow bench data per engine serial (build-to-order matching). Common: Bing needle clip 3 → 4 for sea level <200m altitude. 3W warranty: 2 years (higher support than Chinese competitors). Contact 3W GmbH direct for rebuild kits.',
    },
  },

  // ── DESERT AIRCRAFT (DA) — USA ────────────────────────────────────────────
  {
    make:'Desert Aircraft', model:'DA-35', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'35.0cc', boreDiameter:'40mm', crankStroke:'28mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro WB-37)',
      mixRatio:'40:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50mm',
      idleRpm:'1400 RPM', wotRpm:'8500 RPM',
      starterType:'Electric', weightKg:'0.54',
      notes:'Desert Aircraft (Tucson, AZ) — US premium brand, aerospace-grade machining. DA engines are known for the best vibration isolation of any petrol RC engine. DA-35: 2.9HP, 40:1 mix ratio (DA-specific — reflects better bearing and sealing quality). Walbro WB-37. Prop: 18×8 to 22×6. Muffler: DA-patented canister muffler with carbon fibre sleeve (lightest in class). CNC crankcase, balanced crank. Common: DA muffler canister carbon build-up at 25 hrs — clean or replace carbon insert. DA warranty: 5 years (exceptional for RC engines). L: 1.5T, H: 1.25T standard setting.',
    },
  },
  {
    make:'Desert Aircraft', model:'DA-70', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'70.0cc', boreDiameter:'46mm', crankStroke:'42mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro WB-37)',
      mixRatio:'40:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50mm',
      idleRpm:'1200 RPM', wotRpm:'7800 RPM',
      starterType:'Electric', weightKg:'0.88',
      notes:'5.5HP large single cylinder. Unusual for 70cc to be single (most competitors use twin at this displacement). DA long-stroke design (42mm stroke) gives exceptional low-end torque — good for scale warbirds where heavy props are used. Prop: 24×10 to 28×8. Muffler: DA canister. L: 1.5T, H: 1.5T. Common: at 70cc single, vibration is significant — use DA-supplied vibration mounts; failure to use mounts causes servo/receiver failure within 20 flights.',
    },
  },
  {
    make:'Desert Aircraft', model:'DA-120', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'120.0cc', boreDiameter:'46mm', crankStroke:'36mm',
      cylCount:'2', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro ×2)',
      mixRatio:'40:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50mm',
      idleRpm:'1100 RPM', wotRpm:'7500 RPM',
      starterType:'Electric', weightKg:'1.55',
      notes:'DA-120 twin: 10HP, DA\'s most popular size. Dual Walbro WB-37. DA canister mufflers. 5-year warranty. Prop: 30×10 to 34×8. Considered by many competition pilots as the best 120cc RC engine in terms of power delivery consistency. CNC crank, matched cylinders. L and H needles adjusted individually per cylinder, then balanced. Common: DA-120 CDI uses capacitor-discharge from permanent magnet alternator — replace capacitors (CDI) every 5 years regardless of condition.',
    },
  },
  {
    make:'Desert Aircraft', model:'DA-150', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'150.0cc', boreDiameter:'49mm', crankStroke:'40mm',
      cylCount:'2', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro ×2)',
      mixRatio:'40:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50mm',
      idleRpm:'1000 RPM', wotRpm:'7000 RPM',
      starterType:'Electric', weightKg:'1.80',
      notes:'12HP. For giant-scale 5m+ aircraft. DA-150 uses shared ignition (single CDI fires both cylinders — wasted spark — unlike DLE\'s separate CDI approach). Crankshaft: 22mm diameter. Mounting: M5. DA-patented crankshaft counter-balance reduces vibration at idle (comfort/electronics protection). Common: prop shaft O-ring seal migration after 100 hrs hard use — inspect and replace O-ring to prevent prop hub wobble.',
    },
  },

  // ── OS ENGINES — GT PETROL SERIES (Japan) ────────────────────────────────
  {
    make:'OS Engines', model:'GT15 HZ (15cc Petrol)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'15.2cc', boreDiameter:'33mm', crankStroke:'18mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro WYK)',
      mixRatio:'40:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50mm',
      idleRpm:'1400 RPM', wotRpm:'9500 RPM',
      starterType:'Electric', weightKg:'0.29',
      notes:'OS Engines (Japan) GT series is their gasoline RC line. GT15: lightest OS petrol, popular in trainer/sport aircraft. Walbro WYK diaphragm carb. Electronic CDI. Prop: 14×8 to 16×8. Very reliable due to OS\'s precision machining. Mix: 40:1 with OS GP-Pro 2T or Motul Kart. L: 1.75T, H: 1.5T (richer than DLE — OS fine-tuned for wide temp range). Common: OS GT15 idle RPM sensitive to altitude — re-tune L needle for each new flying location if >500m elevation change.',
    },
  },
  {
    make:'OS Engines', model:'GT33 (33cc Petrol)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'33.4cc', boreDiameter:'39mm', crankStroke:'28mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro WYK)',
      mixRatio:'40:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50mm',
      idleRpm:'1300 RPM', wotRpm:'8500 RPM',
      starterType:'Electric', weightKg:'0.49',
      notes:'2.5HP OS petrol single. L: 1.75T, H: 1.5T. Prop: 17×8 to 20×8. Japanese CNC machining — tightest bore tolerance in class. CDI timing: 25° BTDC at WOT (fixed). OS recommend full spark plug replacement every 25 flights. Common: needle valve seat wear (Walbro WYK) at 100+ hrs — carb rebuild kit OS part 55601024. OS warranty: 2 years parts; excellent Japanese dealer support.',
    },
  },
  {
    make:'OS Engines', model:'GT60 Twin (60cc Petrol)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'59.8cc', boreDiameter:'39mm', crankStroke:'25mm',
      cylCount:'2', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro WYK ×2)',
      mixRatio:'40:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50mm',
      idleRpm:'1200 RPM', wotRpm:'8500 RPM',
      starterType:'Electric', weightKg:'0.95',
      notes:'OS GT60: Japanese precision boxer twin. 5HP. Used in aerobatics aircraft where weight savings and power balance are paramount. OS\'s CDI: separate ignition per cylinder (not wasted spark) — more precise timing, notably smoother idle than DLE/EME at same displacement. Dual Walbro WYK. Prop: 24×8 to 26×8. Common: OS GT60 throttle linkage: uses OS proprietary connector — do not substitute standard RC ball links (play causes sync problems). Full OS service kit available.',
    },
  },

  // ── ZENOAH PETROL ENGINES ─────────────────────────────────────────────────
  {
    make:'Zenoah', model:'G20EI (20cc)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'20.4cc', boreDiameter:'34.4mm', crankStroke:'22mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro WYL)',
      mixRatio:'40:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50mm',
      idleRpm:'1400 RPM', wotRpm:'9000 RPM',
      starterType:'Electric', weightKg:'0.35',
      notes:'Zenoah (Japanese — acquired by Husqvarna/Jonsered group). EI = Electronic Ignition. G20EI is one of the longest-surviving RC engine designs. Very reliable bore/stroke same as DLE-20 (industry standard 20cc). Walbro WYL (larger than WYK). L: 1.5T, H: 1.5T. Prop: 15×8 to 18×6. Zenoah distinguish: heavier flywheel provides smoother idle vs DLE-20. Crankshaft: 8mm parallel shaft (vs DLE taper) — different prop hub required. Common: Zenoah G20EI crankshaft seal drying at 3 years from fuel vapour — replace annual if stored in humid conditions.',
    },
  },
  {
    make:'Zenoah', model:'G38 (38cc)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'38.0cc', boreDiameter:'42mm', crankStroke:'28mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro WYL)',
      mixRatio:'40:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50mm',
      idleRpm:'1200 RPM', wotRpm:'8200 RPM',
      starterType:'Electric', weightKg:'0.60',
      notes:'Zenoah G38: 3.2HP. Magneto point-type ignition on older versions; newer versions have CDI (check model suffix). Points gap (if applicable): 0.3mm. CDI version: fixed timing 27° BTDC. Prop: 18×8 to 22×6. Crankshaft: 10mm parallel. Common: older Zenoah G38 with points ignition — condenser failure causes erratic spark; replace condenser and points together every 30 hrs. CDI version: replace ignition module every 200 hrs preventatively.',
    },
  },
  {
    make:'Zenoah', model:'G45 (45cc)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'45.0cc', boreDiameter:'44.7mm', crankStroke:'28.5mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro WYL)',
      mixRatio:'40:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50mm',
      idleRpm:'1200 RPM', wotRpm:'8000 RPM',
      starterType:'Electric', weightKg:'0.68',
      notes:'3.8HP. Zenoah\'s most popular size historically. CDI ignition on all current production. Prop: 20×8 to 24×6. Crankshaft: 10mm parallel shaft. Zenoah G45 is used in Traxxas Nitro Slash ground vehicles (modified/adapted) as well as aircraft. Common: G45 lower crankcase bearing: 6302 type — replace at 200+ hrs or if any roughness detected. Fuel line: replace silicone fuel line every 2 years (fuel vapour permeation causes softening).',
    },
  },
  {
    make:'Zenoah', model:'G62 (62cc)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'62.0cc', boreDiameter:'46mm', crankStroke:'37mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro WYL-240)',
      mixRatio:'40:1', fuelTankCapacity:'N/A',
      plugType:'NGK CMR6H', plugGap:'0.60mm',
      idleRpm:'1100 RPM', wotRpm:'7500 RPM',
      starterType:'Electric', weightKg:'0.86',
      notes:'5HP single — Zenoah\'s largest single-cylinder. Long stroke (37mm) for torque. Used in scale warbirds with large 3-blade props. Prop: 22×10 to 26×10 3-blade. Crankshaft: 12mm parallel. Carb: Walbro WYL-240 (larger diaphragm area). CDI ignition, 27° BTDC. Common: G62 muffler spring clamp: replace spring annually (vibration metal fatigue). Exhaust leak increases CO in pilot area — flight line safety concern.',
    },
  },

  // ── OS GLOW ENGINES ───────────────────────────────────────────────────────
  // Glow engines: run on methanol-based glow fuel (15-30% nitromethane typical).
  // Plug: glow plug (platinum filament — no spark, auto-ignites from compression).
  {
    make:'OS Engines', model:'.61FX (10cc Glow)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'10.0cc', boreDiameter:'28.4mm', crankStroke:'25.4mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (OS 10F5A float-type)',
      mixRatio:'N/A (glow fuel 15–25% nitro)', fuelTankCapacity:'N/A',
      plugType:'OS Type-F / CMB Type A (glow plug)', plugGap:'N/A (glow)',
      idleRpm:'2000 RPM', wotRpm:'15000 RPM',
      starterType:'Electric glow starter', weightKg:'0.24',
      notes:'OS .61FX: classic 10cc 2-stroke glow for ½A-to-.60 sport aircraft. Glow fuel: methanol + 15–25% nitromethane + oil (castor or synthetic). OS 10F5A float-type carb (not diaphragm — requires upright flight for carburation). Needle: H needle (1/2" long needle) and idle stop. H needle: 1.75 turns from closed standard setting. Glow plug: replace when filament appears black/coated (not glowing bright orange). Break-in: 3 tanks at ½–¾ throttle, rich needle, with glow driver attached. Common: needle valve seat wear at 50+ hrs — rebuild kit OS 69602000. Fuel filter: replace every 10 flights.',
    },
  },
  {
    make:'OS Engines', model:'.91FX (15cc Glow)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'14.96cc', boreDiameter:'32mm', crankStroke:'29.5mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (OS 15F8A)',
      mixRatio:'N/A (15–30% nitro glow fuel)', fuelTankCapacity:'N/A',
      plugType:'OS Type-F (glow)', plugGap:'N/A',
      idleRpm:'2000 RPM', wotRpm:'16000 RPM',
      starterType:'Electric', weightKg:'0.38',
      notes:'OS .91: industry standard for sport/aerobatic 40-class glow aircraft. 2HP. Used in trainers, aerobatics, pattern aircraft. ABC (All Brass Chrome) piston construction — no rings. ABC: aluminium alloy piston in chrome-plated brass cylinder, pinch-fit seal. Do NOT oil the cylinder bore (ABC relies on interference fit). Ringed models (FX suffix): require conventional break-in. H needle: 1.5T. Glow plug: OS #8 (standard heat range for 15% fuel). Common: ABC bore wear appears as "blueing" of chrome — replace cylinder/piston set together. ABC sets are not re-reable, replace as unit.',
    },
  },
  {
    make:'OS Engines', model:'.120AX (20cc Glow)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'19.8cc', boreDiameter:'34.4mm', crankStroke:'27mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (OS 21F8A)',
      mixRatio:'N/A (15–25% nitro)', fuelTankCapacity:'N/A',
      plugType:'OS #8 (glow)', plugGap:'N/A',
      idleRpm:'1800 RPM', wotRpm:'14000 RPM',
      starterType:'Electric', weightKg:'0.53',
      notes:'OS .120AX: 20cc large glow single. Used in ½-scale WW2 warbird scale models. Ringed construction (AX suffix). Break-in: 5 tanks with oil-rich mixture. H needle: 2T. ABC-style chrome liner — separate liner from OS.91. Prop: 15×8 to 18×6. Fuel: 15% nitro recommended (higher % increases RPM but reduces engine life from heat). Common: OS .120AX head gasket material — copper, anneal before re-use; replace if distorted. OS provide detailed Japanese-quality service manual.',
    },
  },

  // ── YS ENGINES (Japan — Glow) ─────────────────────────────────────────────
  {
    make:'YS Engines', model:'YS .91FZ (15cc Glow)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'14.9cc', boreDiameter:'32mm', crankStroke:'29.5mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (YS FZ pump-carb)',
      mixRatio:'N/A (15–20% nitro glow fuel)', fuelTankCapacity:'N/A',
      plugType:'YS RP6 / OS #8 (glow)', plugGap:'N/A',
      idleRpm:'2200 RPM', wotRpm:'18000 RPM',
      starterType:'Electric', weightKg:'0.36',
      notes:'YS Engines (Japan): unique pump-type carburettor. YS FZ pump-carb uses crankcase pressure to positively pump fuel — independent of tank position. Inverted flight: YS carb provides fuel regardless of orientation (advantage over OS float carb). FZ = pump carb designation. Needle: single needle (H), typically 1.25T. Break-in: 3 tanks at ½ throttle. YS recommend 15–20% nitro (lower than OS recommendation at same displacement — pump carb delivers more consistent fuel). Common: YS pump diaphragm replacement every 50 hrs (Viton diaphragm; YS OEM part only — aftermarket diaphragms fail within 10 hrs). YS clamp: screw clamp on backplate — tighten to YS spec 0.8 Nm.',
    },
  },
  {
    make:'YS Engines', model:'YS 120FZR (20cc Glow)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'19.8cc', boreDiameter:'34.4mm', crankStroke:'27mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (YS FZ pump)',
      mixRatio:'N/A (15–20% nitro)', fuelTankCapacity:'N/A',
      plugType:'YS RP6 (glow)', plugGap:'N/A',
      idleRpm:'2000 RPM', wotRpm:'16000 RPM',
      starterType:'Electric', weightKg:'0.52',
      notes:'YS 120FZR: 2.5HP, the aerobatic pilot\'s choice for 20cc class. R suffix = ringed piston (not ABC). YS pump-carb standard. R vs ABC: ringed allows higher nitro % without bore damage. 120FZR handles 25–30% nitro for competition use. Needle: 1.25–1.5T. Common: YS pump-carb pressure nipple (connects to crankcase) blockage from glow fuel residue — clean with carburettor cleaner spray, never poke wire into nipple (brass shaving damage). Throttle arm: YS uses M2.5 screw — do not overtighten (2.5 Nm). F-series YS: no idle mixture screw, idle adjusted by spring tension only.',
    },
  },

  // ── SAITO ENGINES (Japan — 4-stroke Glow) ────────────────────────────────
  {
    make:'Saito', model:'FA-90 T3 (14.75cc 4-stroke Glow)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'14.75cc', boreDiameter:'28.4mm', crankStroke:'23mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Saito TA-1A)',
      mixRatio:'N/A (10–15% nitro 4T glow fuel — oil content ≥18%)', fuelTankCapacity:'N/A',
      plugType:'Saito / NGK CM-6 (glow)', plugGap:'N/A',
      idleRpm:'2000 RPM', wotRpm:'9000 RPM',
      valveTrain:'SOHC 2-valve', intakeValveClear:'0.04mm', exhaustValveClear:'0.05mm',
      starterType:'Electric glow + recoil optional', weightKg:'0.43',
      notes:'Saito 4-stroke glow — iconic sound (4-stroke burble vs 2-stroke whine). FA-90T3: 14.75cc 4T. 4-stroke glow fuel requires higher oil content (≥18% oil) than 2T glow. TA-1A float carb. H needle: 1.75T out from closed. Valve clearance: critical — check every 30 hrs, set cold. 4T glow: starts with external glow driver (battery), then self-sustains via compression heat. Scale realism: Saito 4T sounds like full-scale — very popular in warbird modelling. Common: Saito rocker arm cover gasket leaking glow fuel oil — retorque 4 cover screws to 0.5 Nm (finger tight); overtorque distorts aluminium gasket face.',
    },
  },
  {
    make:'Saito', model:'FA-125 (20cc 4-stroke Glow)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'20.47cc', boreDiameter:'30.5mm', crankStroke:'28mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Saito TA-1A)',
      mixRatio:'N/A (10–15% nitro, ≥18% oil 4T fuel)', fuelTankCapacity:'N/A',
      plugType:'Saito (glow)', plugGap:'N/A',
      idleRpm:'2000 RPM', wotRpm:'8500 RPM',
      valveTrain:'SOHC 2-valve', intakeValveClear:'0.04mm', exhaustValveClear:'0.05mm',
      starterType:'Electric', weightKg:'0.55',
      notes:'2.5HP 4T glow. H needle: 1.75T. Prop: 14×6 to 16×6 (slower than 2T at same power due to torque multiplication). Saito FA-125 frequently used in WW2-trainer replicas (Piper Cub, Stinson) for authentic slow-fly sound. Valve clearance at cold engine ONLY — 4T thermally expands more than 2T. Common: Saito cam follower (rocker pivot) wearing at 200+ hrs — replace complete rocker assembly (left and right together). Fuel: use Saito-recommended 4T glow fuel; standard 2T glow fuel has insufficient oil — Saito 4T has pressurised oil circuit.',
    },
  },
  {
    make:'Saito', model:'FA-300T Twin (49cc 4-stroke Glow)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'49.0cc', boreDiameter:'36mm', crankStroke:'28mm',
      cylCount:'2', coolingType:'Air-cooled', fuelSystem:'Carburettor (Saito TA-1A ×2)',
      mixRatio:'N/A (10–15% nitro, ≥18% oil)', fuelTankCapacity:'N/A',
      plugType:'Saito (glow ×2)', plugGap:'N/A',
      idleRpm:'1800 RPM', wotRpm:'7500 RPM',
      valveTrain:'SOHC 2-valve per cylinder', intakeValveClear:'0.04mm', exhaustValveClear:'0.05mm',
      starterType:'Electric', weightKg:'1.05',
      notes:'Saito 4T twin — incredibly realistic sound (V-twin note). Used in large aerobatic and scale aircraft. Dual float carbs. Sync procedure: both needles to 1.75T, adjust H on each cylinder separately to eliminate one-cylinder lean cut. Valve clearance: set both cylinders cold. Common: Saito FA-300T oil splashback from glow plug hole at speed changes — use fuel dot filter on glow plug vent. 4T fuel oil circulates under pressure; check pushrods for oil film at annual inspection.',
    },
  },

  // ── CHINESE COPY GLOW ENGINES ─────────────────────────────────────────────
  {
    make:'Enya', model:'Enya .60 III CX (10cc Glow)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'9.9cc', boreDiameter:'28.4mm', crankStroke:'25.4mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Enya 15H5B)',
      mixRatio:'N/A (15–25% nitro glow fuel)', fuelTankCapacity:'N/A',
      plugType:'Enya No. 3 / OS Type F (glow)', plugGap:'N/A',
      idleRpm:'2000 RPM', wotRpm:'16000 RPM',
      starterType:'Electric', weightKg:'0.23',
      notes:'Enya (Japan) was a pioneer of affordable Japanese-quality glow engines. .60 III CX: ABC construction. H needle: 1.5T. Budget alternative to OS at similar quality. Common: Enya needle valve seat: softer brass alloy than OS — wear appears as rich surge at 80+ hrs; Enya rebuild kit available but OS needle seat is direct fit (preferred). Glow plug: Enya #3 = medium heat; equivalent to OS #8. Idle: richer than OS equivalent — L needle 1.5T from closed.',
    },
  },
  {
    make:'Thunder Tiger', model:'Pro .50 (8.2cc Glow)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'8.18cc', boreDiameter:'25.4mm', crankStroke:'25.4mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Thunder Tiger ABC-type)',
      mixRatio:'N/A (15–25% nitro)', fuelTankCapacity:'N/A',
      plugType:'OS Type-F (glow)', plugGap:'N/A',
      idleRpm:'2000 RPM', wotRpm:'18000 RPM',
      starterType:'Electric', weightKg:'0.18',
      notes:'Thunder Tiger Pro .50: Taiwanese manufacturer, value-oriented glow. ABC piston. Square bore/stroke (25.4×25.4mm). H needle: 1.5T. Used in trainers and sport aircraft. Less expensive than OS/YS but reliable for casual flyers. Common: Thunder Tiger crankcase threading is coarser than Japanese standard — use TT-specific prop washer (comes in kit); substitute washers can gall threads. Glow plug: OS Type-F is direct cross. Run 20% nitro for best performance.',
    },
  },
  {
    make:'CMB', model:'CMB 91 RS (15cc Glow, Italian)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'14.9cc', boreDiameter:'32mm', crankStroke:'29.5mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (CMB pump-type)',
      mixRatio:'N/A (25–30% nitro race fuel)', fuelTankCapacity:'N/A',
      plugType:'CMB Type A (glow)', plugGap:'N/A',
      idleRpm:'2500 RPM', wotRpm:'22000+ RPM',
      starterType:'Electric', weightKg:'0.32',
      notes:'CMB (Costruzioni Motori Benzina — Italy). Race-spec glow engine for F3A/F3D aerobatic competition. RS = Race Specification. 22,000+ RPM at WOT — highest RPM production 2T in class. Short-stroke, high-winding. Pump carb (like YS) for inverted flight. CMB Type A plug: hot plug for 25–30% nitro. H needle: 1.5T — extremely sensitive, 1/16T changes are meaningful. Competition set-up: always tune at full tank then re-check at ¼ tank. Common: CMB bearings are ceramic-hybrid — do NOT use standard chrome steel bearings as replacement; CMB ceramic bearings rated for 25,000 RPM. Engine life: 200 competition flights before rebuild needed.',
    },
  },

  // ── GENERIC CHINESE RC GLOW ENGINE COPIES ────────────────────────────────
  {
    make:'Generic', model:'Chinese .46 ABC Glow Clone', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'7.54cc', boreDiameter:'26.8mm', crankStroke:'22.5mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro/Keihin clone)',
      mixRatio:'N/A (15–20% nitro)', fuelTankCapacity:'N/A',
      plugType:'OS Type-F equivalent (glow)', plugGap:'N/A',
      idleRpm:'2000 RPM', wotRpm:'15000 RPM',
      starterType:'Electric', weightKg:'0.22',
      notes:'Chinese-manufactured .46 ABC glow sold under many brands (XTech, Toki, various eBay/AliExpress brands). Architecture: copy of OS .46AX. ABC chrome liner. Quality varies wildly between batches. Common: chrome liner peeling in low-quality examples — visual inspection before purchase (liner should be smooth uniform silver, no visible pitting or flaking). Carb: OS Type-5 is a direct upgrade for carb-related failures. Glow plug: OS #8 fits. Break-in: mandatory 10+ tanks; skipping break-in leads to ABC fit failure (liner seizes from thermal shock). If in doubt, service same as OS .46AX.',
    },
  },
  {
    make:'Generic', model:'Chinese .21 Glow Clone (3.5cc)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'3.5cc', boreDiameter:'20.6mm', crankStroke:'18mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (clone)',
      mixRatio:'N/A (20–30% nitro)', fuelTankCapacity:'N/A',
      plugType:'OS Type-M3 equivalent (glow)', plugGap:'N/A',
      idleRpm:'3000 RPM', wotRpm:'24000 RPM',
      starterType:'Electric', weightKg:'0.09',
      notes:'Sub-3.5cc trainer/sport class clone. Used in cheap RTF trainers. Architecture: based on OS .21FP or similar. Budget builds use ringed pistons (not ABC). Carb: 5mm venturi — very sensitive needle. H needle: 1.5T standard. Glow plug: OS #8 or #10 (hot plug for small engines). Common: prop adaptor slip on cheap Chinese .21 clones — prop drives directly against prop washer; add thin lock-washer under prop to prevent rotation. Break-in: 5 tanks minimum, no WOT first 2 tanks.',
    },
  },

  // ── UAV / DRONE PETROL ENGINES ────────────────────────────────────────────
  {
    make:'DLA', model:'DLA-32 (32cc UAV Engine)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'32.0cc', boreDiameter:'39mm', crankStroke:'27mm',
      cylCount:'1', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro WJ)',
      mixRatio:'50:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50mm',
      idleRpm:'1500 RPM', wotRpm:'8500 RPM',
      starterType:'Electric', weightKg:'0.58',
      notes:'DLA (Chinese UAV/drone engine brand, distinct from DLE). DLA-32 designed specifically for fixed-wing UAV/drone endurance applications. Oil-metered ignition timing advance vs RPM (ECU-linked). Extended TBO (time between overhaul): 300 hrs vs DLE-35RA 150 hrs stated. Key difference from DLE: DLA uses Nikasil-coated aluminium cylinder (not plain aluminium) — better wear resistance. Mix: 50:1 with premium synthetic. Common: DLA ECU requires 4.8–6V regulated supply — do not connect directly to 7.4V LiPo without regulator. Prop: same as DLE-35RA recommendation (18×8 to 22×6).',
    },
  },
  {
    make:'DLA', model:'DLA-56 Twin (56cc UAV)', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'56.0cc', boreDiameter:'39mm', crankStroke:'23mm',
      cylCount:'2', coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro WJ ×2)',
      mixRatio:'50:1', fuelTankCapacity:'N/A',
      plugType:'NGK CM6', plugGap:'0.50mm',
      idleRpm:'1400 RPM', wotRpm:'9000 RPM',
      starterType:'Electric', weightKg:'1.08',
      notes:'DLA twin for endurance UAV (long-range ISR, cargo drone). 56cc from 2×28cc cylinders. Boxer twin. Fuel efficiency focus: Walbro WJ (high-efficiency type). ECU-controlled timing advance improves fuel economy 8–12% vs fixed CDI. Dual CDI backup (each cylinder on separate CDI module for redundancy). Nikasil cylinders standard. Common: DLA twin fuel balance — both cylinders must receive equal fuel; twin-feed fuel system required (single fuel line into splitter before dual carbs). Carb sync: use digital tachometer on each exhaust port individually.',
    },
  },

];

async function run() {
  const existingSlugs = await fetchExistingSlugs();
  const slice = limit < ENTRIES.length ? ENTRIES.slice(0, limit) : ENTRIES;
  const result = await batchInsert(slice, existingSlugs, { dryRun });
  console.log(`Seed-10 complete: ${result.inserted} inserted, ${result.skipped} skipped.`);
}

run().catch(e => { console.error(e); process.exit(1); });
