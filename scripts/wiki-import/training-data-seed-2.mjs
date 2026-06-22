/**
 * Training-data seed 2 — Marine outboard motors.
 * Honda BF, Mercury FourStroke, Evinrude E-TEC, Suzuki DF, Johnson/Yamaha outboards.
 *
 * node scripts/wiki-import/training-data-seed-2.mjs
 * node scripts/wiki-import/training-data-seed-2.mjs --dry-run
 */

import { fetchExistingSlugs, batchInsert } from './_shared.mjs';

const args     = process.argv.slice(2);
const dryRun   = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit    = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

const SRC = 'RAT BENCH Training Seed';
const SUM = 'Seeded from manufacturer service manual data';

const ENTRIES = [

  // ── HONDA — BF Outboard Series ────────────────────────────────────────────
  {
    make:'Honda', model:'BF2.3', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'57.3cc', cylCount:'1',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR5ES', plugGap:'0.90–1.00mm',
      idleRpm:'950–1050 RPM', wotRpm:'4500–5500 RPM',
      starterType:'Recoil', weightKg:'13.0',
      notes:'Lightest Honda 4-stroke outboard. Tiller handle, no gear shift lever (twist-grip F/N/R). Gear oil: 70mL SAE 80. Water pump impeller: replace every 100 hrs or annually. No thermostat on sub-5HP models — check for blocked passages if overheating. Storage: flush with fresh water, run dry to evacuate pump.',
    },
  },
  {
    make:'Honda', model:'BF5', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'127cc', cylCount:'1',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BKR6E', plugGap:'0.90–1.00mm',
      idleRpm:'950–1050 RPM', wotRpm:'5000–6000 RPM',
      starterType:'Recoil', weightKg:'27.0',
      notes:'Single-cylinder. Long/short shaft. Gear oil: 105mL. Impeller: annual. Carb float height critical — 14.5mm from gasket surface. Primer knob location: port side of engine cowl.',
    },
  },
  {
    make:'Honda', model:'BF8', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'209cc', cylCount:'1',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BKR6E', plugGap:'0.90–1.00mm',
      idleRpm:'900–1000 RPM', wotRpm:'5000–6000 RPM',
      starterType:'Recoil',
      notes:'Same engine as BF10 — different prop pitch. Gear oil: 145mL. OHC single cylinder. Thermostat: 58–65°C. Common issue: anti-syphon valve on fuel line causing lean running — test by removing cap briefly.',
    },
  },
  {
    make:'Honda', model:'BF10', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'209cc', cylCount:'1',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BKR6E', plugGap:'0.90–1.00mm',
      idleRpm:'900–1000 RPM', wotRpm:'5000–6000 RPM',
      starterType:'Recoil',
      notes:'Identical engine to BF8, propped for 10HP. Electric start variant: BF10D. Gear oil: 145mL.',
    },
  },
  {
    make:'Honda', model:'BF15', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'351cc', cylCount:'2',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BKR6E', plugGap:'0.90–1.00mm',
      idleRpm:'750–850 RPM', wotRpm:'5000–6000 RPM',
      starterType:'Recoil or electric',
      notes:'Inline 2-cylinder OHC. Gear oil: 190mL. Tiller or remote. Thermostat: 58–65°C — replace if engine runs cold (slow warm-up) or overheats. Common: clogged water pump passage in the exhaust housing; flush annually.',
    },
  },
  {
    make:'Honda', model:'BF20', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'351cc', cylCount:'2',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BKR6E', plugGap:'0.90–1.00mm',
      idleRpm:'750–850 RPM', wotRpm:'5000–6000 RPM',
      starterType:'Recoil or electric',
      notes:'Same engine as BF15, different prop. Gear oil: 190mL. Tiller or remote. EFI variant: BF20D (later production).',
    },
  },
  {
    make:'Honda', model:'BF40', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'808cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'700–800 RPM', wotRpm:'5000–6000 RPM',
      starterType:'Electric',
      notes:'Inline 4-cylinder OHC. Gear oil: 330mL Hypoid Gear Oil SAE 90. Impeller: every 200 hrs or 2 years. Thermostat: 65°C. Timing chain tensioner: check every 200 hrs. Common issue: raw water pump housing corroded/worn — flush after every saltwater use.',
    },
  },
  {
    make:'Honda', model:'BF50', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'808cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'700–800 RPM', wotRpm:'5000–6000 RPM',
      starterType:'Electric',
      notes:'Same engine as BF40. Gear oil: 330mL. BLAST® (Boosted Low-speed Acceleration) available. Remote steering standard.',
    },
  },
  {
    make:'Honda', model:'BF90', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1496cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection + VTEC',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'700–800 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'Inline 4-cylinder SOHC with VTEC (switches to 4-valve high-lift at WOT). Gear oil: 630mL. Impeller: every 200 hrs. VTEC solenoid: check if engine bogs at high RPM — solenoid filter clogs in saltwater use. Alternator output: 35A. Tilt/trim: hydraulic, check fluid level at tilt pin (ATF).',
    },
  },
  {
    make:'Honda', model:'BF115', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1496cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection + VTEC',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'700–800 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'Same 1496cc inline 4 SOHC + VTEC as BF90 and BF75. 115HP. Gear oil: 630mL. Diagnostics: Honda PGM-FI self-diagnostic via MIL blinks (no scan tool needed for basic codes). Fuel pressure: 285 kPa (41 PSI) at idle.',
    },
  },
  {
    make:'Honda', model:'BF150', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'2354cc', cylCount:'6',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'600–700 RPM', wotRpm:'5500–6200 RPM',
      starterType:'Electric',
      notes:'V6 SOHC. 150HP. Gear oil: 980mL. Variable timing on intake camshaft (iVTEC). Impeller: every 200 hrs. Trim/tilt hydraulic fluid: Honda ATF-DW1. Common: spark plug fouling from extended idle — run at cruise once warmed up.',
    },
  },
  {
    make:'Honda', model:'BF200', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'3471cc', cylCount:'6',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'600–700 RPM', wotRpm:'5500–6200 RPM',
      starterType:'Electric',
      notes:'V6 DOHC iVTEC. 200HP. Gear oil: 1200mL. Charge system: 60A. Dual-fuel filter. VST (Vapour Separator Tank): replace filter every 300 hrs or if rough idle occurs.',
    },
  },
  {
    make:'Honda', model:'BF225', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'3471cc', cylCount:'6',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'600–700 RPM', wotRpm:'5500–6200 RPM',
      starterType:'Electric',
      notes:'V6 DOHC. Same block as BF200. 225HP. Gear oil: 1200mL.',
    },
  },
  {
    make:'Honda', model:'BF250', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'3471cc', cylCount:'6',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'600–700 RPM', wotRpm:'5500–6200 RPM',
      starterType:'Electric',
      notes:'V6 DOHC iVTEC. Honda\'s largest outboard. 250HP. Gear oil: 1200mL. HD gear case. Diagnostics via Honda Marine Diagnostic System (MDS). Alternator: 60A/12V.',
    },
  },

  // ── MERCURY — FourStroke Series ───────────────────────────────────────────
  {
    make:'Mercury', model:'2.5 FourStroke', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'72cc', cylCount:'1',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.90–1.00mm',
      idleRpm:'1000–1100 RPM', wotRpm:'4500–5500 RPM',
      starterType:'Recoil', weightKg:'13.0',
      notes:'Tohatsu-sourced engine (Mercury/Tohatsu OEM partnership). Gear oil: 70mL. Tiller, no neutral/reverse shift on base model. Shared service parts with Tohatsu MFS2.5 and Nissan 2.5.',
    },
  },
  {
    make:'Mercury', model:'3.5 FourStroke', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'72cc', cylCount:'1',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.90–1.00mm',
      wotRpm:'4500–5500 RPM', starterType:'Recoil',
      notes:'Same engine as 2.5, re-propped to 3.5HP. Tohatsu OEM. Gear oil: 70mL.',
    },
  },
  {
    make:'Mercury', model:'6 FourStroke', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'138cc', cylCount:'1',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPMR6A', plugGap:'0.90–1.00mm',
      idleRpm:'900–1000 RPM', wotRpm:'4500–5500 RPM',
      starterType:'Recoil',
      notes:'Tohatsu MFS6 OEM. Gear oil: 180mL. Shared service with Nissan 6.',
    },
  },
  {
    make:'Mercury', model:'9.9 FourStroke', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'212cc', cylCount:'2',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.90–1.00mm',
      idleRpm:'750–850 RPM', wotRpm:'5000–6000 RPM',
      starterType:'Recoil or electric',
      notes:'Inline 2-cylinder OHC. Gear oil: 200mL SAE 90. Impeller: annual. Very common on tenders and dinghies. Also sold as Mercury 9.9 BigFoot (large lower unit for shallow water).',
    },
  },
  {
    make:'Mercury', model:'15 FourStroke', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'351cc', cylCount:'2',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.90–1.00mm',
      idleRpm:'750–850 RPM', wotRpm:'5000–6000 RPM',
      starterType:'Recoil or electric',
      notes:'2-cylinder OHC. Gear oil: 190mL. Same 351cc displacement shared across Honda/Yamaha/Tohatsu 15–20HP class.',
    },
  },
  {
    make:'Mercury', model:'25 EFI FourStroke', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'526cc', cylCount:'3',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LFR6A', plugGap:'1.0–1.1mm',
      idleRpm:'700–800 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'Inline 3-cylinder EFI. Gear oil: 280mL. Throttle-by-wire compatible. Diagnostic via Verado/FourStroke DIACOM software or CAN bus reader.',
    },
  },
  {
    make:'Mercury', model:'60 EFI FourStroke', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'996cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'700–800 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'Inline 4-cylinder. Gear oil: 380mL. Common in aluminium tinnies and pontoon boats. SmartCraft (SC1000) gauge compatible. Impeller: every 300 hrs or 3 years on Mercury recommended schedule.',
    },
  },
  {
    make:'Mercury', model:'90 EFI FourStroke', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1496cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'650–750 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'Inline 4-cylinder. Gear oil: 620mL SAE 80W-90 gear lube. Fuel pressure: 280–320 kPa. Thermostat: 60°C. Common fault: trim/tilt relay corrosion — check continuity before condemning pump motor.',
    },
  },
  {
    make:'Mercury', model:'115 EFI FourStroke', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1496cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'650–750 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'Same 1496cc inline 4 as 90HP. 115HP via ECM tuning. Gear oil: 620mL. Mercury DIACOM diagnostic software reads live sensor data, logged fault codes, and allows TPS reset and timing check. VST fuel pressure: 275–310 kPa. Very common engine — extensive aftermarket support.',
    },
  },
  {
    make:'Mercury', model:'150 FourStroke', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'2785cc', cylCount:'6',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'600–700 RPM', wotRpm:'5500–6200 RPM',
      starterType:'Electric',
      notes:'V6 24-valve DOHC. Gear oil: 1000mL. SmartCraft compatible. VCT (Variable Cam Timing). Charge output: 60A. Trim pump fluid: Mercury Power Trim & Steering Fluid.',
    },
  },
  {
    make:'Mercury', model:'200 Pro XS', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'2785cc', cylCount:'6',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'600–700 RPM', wotRpm:'5800–6400 RPM',
      starterType:'Electric',
      notes:'V6 DOHC. High-performance tuned version of 150–200 platform with revised ECM, larger throttle bodies. Gear oil: 1000mL. Pro XS lower unit for higher top speed. Race prop compatible.',
    },
  },
  {
    make:'Mercury', model:'Verado 200', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'2600cc', cylCount:'6',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection + Supercharger',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'600–700 RPM', wotRpm:'5800–6400 RPM',
      starterType:'Electric',
      notes:'Inline 6-cylinder supercharged. Intercooled. 200HP from 2.6L (vs V6 2.8L NA). Gear oil: 1000mL. Supercharger belt: inspect every 100 hrs, replace every 300 hrs. Boost: ~35 kPa (5 PSI). Very smooth — no vibration offset needed. Common issue: supercharger bypass valve leak causing boost loss at high RPM.',
    },
  },
  {
    make:'Mercury', model:'Verado 300', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'2600cc', cylCount:'6',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection + Supercharger',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'600–700 RPM', wotRpm:'5800–6400 RPM',
      starterType:'Electric',
      notes:'Same I6 supercharged as Verado 200, higher boost. Gear oil: 1000mL. Joystick docking compatible (Skyhook). Power Steering standard.',
    },
  },

  // ── EVINRUDE — E-TEC Series (discontinued 2020, massive install base) ────
  {
    make:'Evinrude', model:'E-TEC 25', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'430cc', cylCount:'2',
      coolingType:'Water-cooled', fuelSystem:'E-TEC Direct Fuel Injection',
      plugType:'NGK BUHW-2', plugGap:'0.40mm',
      idleRpm:'700–750 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric or recoil',
      notes:'E-TEC DFI 2-stroke. No pre-mix required — uses on-board oil injection (BRP 2+4 or XD100 oil recommended). EMM (Engine Management Module) for diagnostics via BRP Evinrude Diagnostics software. Gear oil: 190mL. Oil injection tank: 1.9L. Very low emissions despite 2-stroke — CARB 3-star. Common fault: EMM sensor failure causing erratic idle; check CPS (Crank Position Sensor) air gap (1.0–1.5mm).',
    },
  },
  {
    make:'Evinrude', model:'E-TEC 40', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'760cc', cylCount:'2',
      coolingType:'Water-cooled', fuelSystem:'E-TEC Direct Fuel Injection',
      plugType:'NGK BUHW-2', plugGap:'0.40mm',
      idleRpm:'700–750 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'E-TEC DFI V-twin 2-stroke. Oil injection: 3.8L tank. Gear oil: 330mL. Impeller: every 300 hrs. E-TEC engines have NO break-in period — run hard from first start (EMM manages fuel delivery for engine protection). Common: injector fouling from extended storage; flush injectors with BRP cleaner before seasonal storage.',
    },
  },
  {
    make:'Evinrude', model:'E-TEC 90', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'1298cc', cylCount:'3',
      coolingType:'Water-cooled', fuelSystem:'E-TEC Direct Fuel Injection',
      plugType:'NGK BUHW-2', plugGap:'0.40mm',
      idleRpm:'650–750 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'E-TEC inline 3-cylinder. Oil injection: 3.8L. Gear oil: 480mL. 90-hr maintenance-free claim (no scheduled impeller, oil, or plugs for 3 years on factory schedule). Diagnostic: BRP software reads logged fault codes and injection timing. Common issue: reed valve wear at 500+ hrs causing rough idle at trolling speeds.',
    },
  },
  {
    make:'Evinrude', model:'E-TEC 115', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'1298cc', cylCount:'3',
      coolingType:'Water-cooled', fuelSystem:'E-TEC Direct Fuel Injection',
      plugType:'NGK BUHW-2', plugGap:'0.40mm',
      idleRpm:'650–750 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'Same 1298cc 3-cylinder as E-TEC 90. EMM tuned for higher output. Gear oil: 480mL. iDock joystick compatible. Excellent fuel economy vs 4-stroke at wide-open throttle (DFI eliminates scavenging losses).',
    },
  },
  {
    make:'Evinrude', model:'E-TEC 150', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'1726cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'E-TEC Direct Fuel Injection',
      plugType:'NGK BUHW-2', plugGap:'0.40mm',
      idleRpm:'600–700 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'V4 2-stroke E-TEC. Oil: 3.8L injection tank (XD100). Gear oil: 630mL. Very popular for tournament bass fishing — light weight (197 kg) vs 4-stroke equivalent. Stator output: 50A.',
    },
  },
  {
    make:'Evinrude', model:'E-TEC G2 200', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'1726cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'E-TEC G2 Direct Fuel Injection',
      plugType:'NGK BUHW-2', plugGap:'0.40mm',
      idleRpm:'600–700 RPM', wotRpm:'5800–6400 RPM',
      starterType:'Electric',
      notes:'Second-generation E-TEC with independently controlled injectors per cylinder. 58% more injection points, 15% better fuel economy vs G1. ICON (iCommand) touchscreen tachometer. Gear oil: 630mL. Extended-length upper unit improves handling. Discontinued 2020 when BRP ceased Evinrude production — no more factory parts after 2025.',
    },
  },
  {
    make:'Evinrude', model:'E-TEC G2 300', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'2600cc', cylCount:'6',
      coolingType:'Water-cooled', fuelSystem:'E-TEC G2 Direct Fuel Injection',
      plugType:'NGK BUHW-2', plugGap:'0.40mm',
      idleRpm:'600–700 RPM', wotRpm:'5800–6400 RPM',
      starterType:'Electric',
      notes:'V6 2-stroke E-TEC G2. Lightest 300HP outboard (227 kg). Gear oil: 1000mL. Joystick docking (iDock) available. Replacement parts increasingly from aftermarket (OMC/Bombardier supplier network) — BRP no longer manufacturing Evinrude.',
    },
  },

  // ── SUZUKI — DF FourStroke Series ─────────────────────────────────────────
  {
    make:'Suzuki', model:'DF2.5', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'68cc', cylCount:'1',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.90–1.00mm',
      idleRpm:'1100–1300 RPM', wotRpm:'4500–5500 RPM',
      starterType:'Recoil', weightKg:'13.0',
      notes:'Suzuki\'s own 68cc engine (not Tohatsu OEM). Manual tilt. Gear oil: 70mL Suzuki Gear Oil SAE 90. Front-facing pull-start reduces fatigue. Carry-on portable for inflatable dinghies.',
    },
  },
  {
    make:'Suzuki', model:'DF9.9', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'232cc', cylCount:'2',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK LFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'750–850 RPM', wotRpm:'5000–6000 RPM',
      starterType:'Recoil or electric',
      notes:'Inline 2-cylinder. Gear oil: 200mL. Lean Burn combustion system on newer variants reduces fuel consumption 20%. Also sold as DF15A (restricted and re-certified as 15HP with minor tuning).',
    },
  },
  {
    make:'Suzuki', model:'DF15A', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'327cc', cylCount:'2',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK LFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'750–850 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Recoil or electric',
      notes:'New generation DF15A is 327cc (vs older 232cc DF15). Lean Burn. Gear oil: 190mL. Best-in-class weight: 43kg (short shaft tiller). Offset driveshaft reduces lower unit drag.',
    },
  },
  {
    make:'Suzuki', model:'DF30A', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'526cc', cylCount:'3',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK LFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'700–800 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Recoil or electric',
      notes:'Inline 3-cylinder. Gear oil: 280mL. Lean Burn. Common on RIBs and tenders.',
    },
  },
  {
    make:'Suzuki', model:'DF60A', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'996cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'700–800 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'Inline 4-cylinder EFI. Gear oil: 380mL. Lean Burn. Selective Rotation (counter-rotation) version: DF60A TL. Common in aluminium fishing boats 4–6m.',
    },
  },
  {
    make:'Suzuki', model:'DF90A', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1502cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'700–800 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'Inline 4-cylinder. Gear oil: 630mL. Shared block with DF80A and DF100B. Lean Burn + Battery-Less EFI (starts without battery — rare feature). Timing chain: check tension every 300 hrs.',
    },
  },
  {
    make:'Suzuki', model:'DF115B', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1502cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'700–800 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'Same 1502cc inline 4 as DF80A/90A/100B. 115HP via ECM tuning. Gear oil: 630mL. Lean Burn, Battery-Less EFI. Diagnostic: Suzuki Marine Diagnostic System (SDS) software via CAN bus.',
    },
  },
  {
    make:'Suzuki', model:'DF150AP', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'2867cc', cylCount:'6',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'600–700 RPM', wotRpm:'5500–6200 RPM',
      starterType:'Electric',
      notes:'V6 DOHC. 150HP. Gear oil: 980mL. Lean Burn + TCI (Transistor Controlled Ignition). Trim tilt fluid: Suzuki Power Steering Fluid. Charge system: 44A. Excellent fuel economy V6.',
    },
  },
  {
    make:'Suzuki', model:'DF250AP', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'3614cc', cylCount:'6',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'600–700 RPM', wotRpm:'5500–6200 RPM',
      starterType:'Electric',
      notes:'V6 DOHC. 250HP. Gear oil: 1200mL. Dual alternators: 44A each. TECS (Suzuki Electronic Control Steering) power steering. Very high torque at mid-range due to large displacement.',
    },
  },
  {
    make:'Suzuki', model:'DF350A', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'3614cc', cylCount:'6',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection + Supercharger',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'600–700 RPM', wotRpm:'5500–6200 RPM',
      starterType:'Electric',
      notes:'V6 DOHC supercharged. First supercharged production outboard motor. 350HP from 3.6L. Dual contra-rotating props (CRD gear case). Gear oil: 1200mL. Supercharger: 120-hour self-maintenance cycle via ECM (regenerates automatically). Do NOT apply ethanol blends >10% — injector damage. Largest single outboard available.',
    },
  },

  // ── YAMAHA — Additional Outboards (extending seed-1 coverage) ────────────
  {
    make:'Yamaha', model:'F25', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'432cc', cylCount:'2',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK LFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'700–800 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Recoil or electric',
      notes:'Inline 2-cylinder. Gear oil: 230mL. Lightest in class at 52kg. Popular on aluminium tinnies. Manual tilt standard; power tilt optional. Common issue: timer base failure causing spark cut-out — check CDI unit output before condemning coils.',
    },
  },
  {
    make:'Yamaha', model:'F50', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'747cc', cylCount:'3',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK LFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'700–750 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'Inline 3-cylinder. Same lower unit as F40. Gear oil: 310mL. Power tilt standard. Common in 4–6m aluminium and fibreglass runabouts.',
    },
  },
  {
    make:'Yamaha', model:'F75', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1596cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'700–750 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'Inline 4-cylinder. Same block as F80/F90/F100/F115. Gear oil: 480mL. EFI. VCT (Variable Cam Timing) on F90+. Charge output: 25A. Impeller: every 200 hrs.',
    },
  },
  {
    make:'Yamaha', model:'F90', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1596cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'700–750 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'Same 1596cc inline 4 platform as F75–F115. VCT. Gear oil: 480mL. YDS diagnostics. Fuel pressure at rail: 294 kPa (43 PSI). Trim/tilt: Yamalube Power Trim and Tilt Fluid.',
    },
  },
  {
    make:'Yamaha', model:'F225', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'3352cc', cylCount:'6',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'600–700 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'V6 DOHC. 225HP. Gear oil: 1080mL. VCT on both banks. Dual VST fuel filters. Very popular twin/triple engine configuration on offshore and bluewater boats. Charge output: 60A.',
    },
  },
  {
    make:'Yamaha', model:'F300', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'4169cc', cylCount:'8',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'600–700 RPM', wotRpm:'5500–6200 RPM',
      starterType:'Electric',
      notes:'V8 DOHC — industry\'s first V8 4-stroke outboard. 300HP. Gear oil: 1300mL. Dual VST. Charge: 60A. Very smooth power delivery. YDS required for port/starboard synchronisation on twin rigs.',
    },
  },

  // ── JOHNSON / EVINRUDE — Vintage 2-Stroke ─────────────────────────────────
  {
    make:'Johnson', model:'15HP J15', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'305cc', cylCount:'2',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', plugType:'Champion QL78YC', plugGap:'0.50mm',
      idleRpm:'700–750 RPM', wotRpm:'4500–5500 RPM',
      starterType:'Recoil or electric',
      notes:'Vintage OMC (Outboard Marine Corporation) 2-stroke. Premix 50:1. Gear oil: 190mL. Points ignition on pre-1985 models — service every 100 hrs. CDI on later models. Common: rusted exhaust tube causing water ingestion. OMC/Johnson/Evinrude parts are interchangeable across many model years — verify HP, year, and lower unit ratio. Production ceased OMC bankruptcy 2001; BRP acquired Evinrude name.',
    },
  },
  {
    make:'Johnson', model:'40HP V4', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'760cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', plugType:'Champion QL78YC', plugGap:'0.50mm',
      idleRpm:'700–750 RPM', wotRpm:'4500–5500 RPM',
      starterType:'Electric',
      notes:'OMC V4 loop-charged 2-stroke. Oil injection available on later models (VRO — Variable Ratio Oiling — DISABLE VRO and run premix if pump fails). Reed valves: inspect every 200 hrs. Water pump housing: cast aluminium, prone to corrosion — replace housing and impeller as assembly on older units.',
    },
  },

  // ── TOHATSU — Additional Models ───────────────────────────────────────────
  {
    make:'Tohatsu', model:'MFS9.9', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'212cc', cylCount:'2',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.90–1.00mm',
      idleRpm:'750–850 RPM', wotRpm:'5000–6000 RPM',
      starterType:'Recoil or electric',
      notes:'Also sold as Mercury 9.9. Gear oil: 200mL. Manually adjustable trim angle.',
    },
  },
  {
    make:'Tohatsu', model:'MFS30', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'526cc', cylCount:'3',
      coolingType:'Water-cooled', fuelSystem:'Carburettor',
      plugType:'NGK LFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'700–800 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'Inline 3-cylinder. Gear oil: 280mL. Power tilt standard. Also Mercury 25/30 4-stroke in some markets.',
    },
  },
  {
    make:'Tohatsu', model:'MFS90A', type:'Outboard Motor', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1502cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'700–800 RPM', wotRpm:'5500–6000 RPM',
      starterType:'Electric',
      notes:'Inline 4-cylinder EFI. 90HP. Gear oil: 630mL. Also sold as Nissan 90. Power tilt and trim. EFI self-diagnosis via blink codes on warning lamp.',
    },
  },
];

async function run() {
  console.log(`\n⚓  Marine Outboard Seed${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`    ${ENTRIES.length} entries`);

  const slice = ENTRIES.slice(0, limit);

  console.log('\nFetching existing wiki slugs…');
  const existingSlugs = await fetchExistingSlugs();
  console.log(`  ${existingSlugs.size} entries already in wiki\n`);

  const result = await batchInsert(slice, existingSlugs, { dryRun });
  console.log(`\n✅  Done: ${result.inserted} inserted, ${result.skipped} skipped\n`);
}

run().catch(e => { console.error(e); process.exit(1); });
