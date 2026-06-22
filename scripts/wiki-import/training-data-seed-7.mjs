/**
 * Training-data seed 7 — Commercial mowers, golf carts, SxS/UTVs, construction,
 * additional ride-ons: Scag, Ferris, Gravely, Hustler, Exmark, Wright, Bad Boy,
 * Husqvarna P-ZT, Club Car, E-Z-GO, Yamaha G29, Honda Pioneer, Yamaha Wolverine,
 * Polaris General, Can-Am Defender, Kubota RTV-X, John Deere Gator,
 * Wacker WP1550, Multiquip pump, Husqvarna floor saw, John Deere E/X series,
 * Cub Cadet XT2, Troy-Bilt Pony, Craftsman T150, Ariens Zoom.
 *
 * node scripts/wiki-import/training-data-seed-7.mjs
 * node scripts/wiki-import/training-data-seed-7.mjs --dry-run
 */

import { fetchExistingSlugs, batchInsert } from './_shared.mjs';

const args     = process.argv.slice(2);
const dryRun   = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit    = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

const SRC = 'RAT BENCH Training Seed';
const SUM = 'Seeded from manufacturer service manual data';

const ENTRIES = [

  // ── COMMERCIAL ZTR MOWERS ─────────────────────────────────────────────────
  {
    make:'Scag', model:'Tiger Cat II 52"', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'726cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1600 RPM', wotRpm:'3600 RPM',
      starterType:'Electric', weightKg:'476', transType:'Dual hydrostatic (Hydro-Gear ZT-3400)',
      notes:'Kawasaki FX730V engine (24 HP). ZT-3400 dual-hydro transaxles. 52" Velocity Plus deck. Oil: 1.9L 10W-30. Air filter: service every 25 hrs (dusty conditions: 10 hrs). Deck belt: inspect 100 hrs, replace ~500 hrs. Hydro fluid: Hydro-Gear 10W-50, check sight glass every 100 hrs; full flush/change every 400 hrs. Common: idler pulley bearing failure at 600 hrs — squealing on engagement, replace pulley assembly. Fuel: 20L.',
    },
  },
  {
    make:'Scag', model:'Turf Tiger II 61"', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'999cc', cylCount:'2',
      coolingType:'Air/Oil-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1600 RPM', wotRpm:'3600 RPM',
      starterType:'Electric', weightKg:'608', transType:'Dual hydrostatic (Parker TG hydraulic)',
      notes:'Kawasaki FX1000V (35 HP) or Briggs Vanguard option. Parker TG hydraulic system with reservoir and cooling loop — separate from consumer Hydro-Gear. Hydraulic fluid: Dexron III ATF or Parker premium, 7.6L; change every 500 hrs or annually. Common: oil cooler line chafing at 800+ hrs — wrap with split loom. 61" deck 10-gauge steel. Fuel: 22.7L.',
    },
  },
  {
    make:'Ferris', model:'IS 700Z 48"', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'656cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      starterType:'Electric', weightKg:'408', transType:'Dual hydrostatic (Ferris independent suspension link)',
      notes:'Kawasaki FS651V (21.5 HP). Patented full-suspension (4 independent coilover shocks) — key differentiator. Oil: 1.7L 10W-30. Suspension pivots: grease every 50 hrs (5 points). Deck spindles: grease every 25 hrs — dry spindles seize fast. Hydro fluid: Hydro-Gear 10W-50 sight glass check every 50 hrs. Common: front caster fork bushing wear at 400 hrs — slop in steering feel. Fuel: 14L.',
    },
  },
  {
    make:'Gravely', model:'Pro-Turn 272', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'764cc', cylCount:'2',
      coolingType:'Air/Oil-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1600 RPM', wotRpm:'3600 RPM',
      starterType:'Electric', weightKg:'540', transType:'Dual Hydro-Gear ZT-5400',
      notes:'Kawasaki FX801V (25.5 HP). Ariens/Gravely 72" deck. ZT-5400 is heavy-duty commercial hydro — larger pumps and wheel motors than ZT-3400. Fluid check: sight glass every 50 hrs. Common: deck anti-scalp roller cracking on rough terrain — replace set of 5. Spindle bearing replacement: 500 hrs average in commercial use. Fuel: 21L.',
    },
  },
  {
    make:'Hustler', model:'Super Z 60"', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'726cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1600 RPM', wotRpm:'3600 RPM',
      starterType:'Electric', weightKg:'522', transType:'Parker 12cc pump + Parker TG wheel motors',
      notes:'Kawasaki FX730V (24 HP). Open-loop Parker hydraulic system (not Hydro-Gear). Hydraulic oil: 15W-50 synthetic, 11.4L total; change every 250 hrs. Air-ride seat standard. Ground speed: 18 km/h. Common: hydraulic filter bypass indicator popping — replace filter immediately. Front anti-tip wheels recommended for slopes. Fuel: 24L.',
    },
  },
  {
    make:'Exmark', model:'Lazer Z X-Series 60"', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'726cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1600 RPM', wotRpm:'3600 RPM',
      starterType:'Electric', weightKg:'554', transType:'Dual Parker 12cc hydrostatic',
      notes:'Kawasaki FX730V (24 HP). Triton deck (1/4" steel, baffled for vacuum). RedTech diagnostic system (hour meter, service alerts). Suspension platform optional. Parker fluid: 15W-50 synthetic, full change every 400 hrs. Common: UltraCut blade engagement slip at high grass load — belt stretch; maintain proper deck engagement cable tension. Fuel: 22L.',
    },
  },
  {
    make:'Bad Boy', model:'Outlaw 54"', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'726cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1600 RPM', wotRpm:'3600 RPM',
      starterType:'Electric', weightKg:'426', transType:'Dual Hydro-Gear ZT-3400',
      notes:'Kawasaki FX730V (24 HP). Arkansas-made commercial ZTR. 7-gauge steel deck. Oil: 1.9L 10W-30. Hydro-Gear ZT-3400: sight glass every 50 hrs; replace oil if grey/milky (water ingress indicates seal failure). Deck belt routing: 3-belt system; print routing diagram on back of cover (common confusion during belt change). Fuel: 17L.',
    },
  },

  // ── GOLF CARTS ────────────────────────────────────────────────────────────
  {
    make:'Club Car', model:'Precedent Gas', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'341cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR4ES', plugGap:'0.75mm',
      idleRpm:'1700 RPM', wotRpm:'3100 RPM',
      valveTrain:'OHV pushrod',
      starterType:'Electric', weightKg:'272', transType:'CVT (Asymmetric Differential)',
      notes:'FE290 (or FE350 on newer) 1-cylinder engine. 11 HP. CVT primary (driver pulley) + secondary (driven pulley) + asymmetric rear differential. Oil: 0.6L SAE 30 (summer) / 10W-30 (winter). Change every season or 125 hrs. CVT belt: 3–5 year/300 hrs. Common: belt squeal in damp conditions — dry cloth, not lubricant. Governor spring: adjust max speed (legal restriction — do not exceed). Carburetor solenoid: clean needle valve every 2 years.',
    },
  },
  {
    make:'E-Z-GO', model:'TXT Gas', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'295cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RZ7C', plugGap:'0.75mm',
      idleRpm:'1700 RPM', wotRpm:'3400 RPM',
      valveTrain:'OHV pushrod',
      starterType:'Electric', weightKg:'258', transType:'CVT',
      notes:'Robin/Subaru EH29C engine. 9.5 HP. E-Z-GO uses Textron-designed CVT. Oil: 0.6L SAE 30. Change every 125 hrs or annually. Air filter: clean every 50 hrs (foam pre-filter), replace paper element every year. Common: choke sticking — ethanol gums up choke shaft; spray carb cleaner annually. Rear axle bearing seal: replace every 4 years on fleet golf carts. Fuel: 13.2L.',
    },
  },
  {
    make:'Yamaha', model:'Drive2 Gas (G29)', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'357cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK BPR5ES', plugGap:'0.75mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod',
      starterType:'Electric', weightKg:'260', transType:'CVT',
      notes:'Yamaha MR-1 engine with EFI (2017+). 11.4 HP. Fuel injection eliminates cold-start issues of carb predecessors. Oil: 0.7L 10W-30. Change every 150 hrs or annually. Fuel pump: in-tank; replace if weak cranking/power loss at 800+ hrs. CVT belt: inspect every 200 hrs, replace every 400–600 hrs. Common: EFI throttle position sensor fault code causing no-start — clean TPS connector. Fuel: 13.2L.',
    },
  },

  // ── SxS / UTV ─────────────────────────────────────────────────────────────
  {
    make:'Honda', model:'Pioneer 1000-5', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'999cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK SIMR8A9', plugGap:'0.90mm',
      idleRpm:'1200 RPM', wotRpm:'7000 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'697', transType:'6-speed DCT with high/low',
      notes:'Parallel twin. 72 HP. Honda DCT (dual clutch) with paddle shift in a UTV — industry first. Selectable 2WD/4WD/4WD-Lock. Tow rating 907 kg. Oil: 3.1L 10W-30 (engine), DCT fluid 1.3L Honda HPF-1. Service: oil every 600 hrs/12 months; DCT fluid 24,000 km. Common: DCT shift hesitation on steep incline in low — normal characteristic; use manual mode. Fuel: 37.9L.',
    },
  },
  {
    make:'Yamaha', model:'Wolverine RMAX4 1000', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'998cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR8EIA-9', plugGap:'0.90mm',
      idleRpm:'1100 RPM', wotRpm:'7500 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'775', transType:'CVT with high/low/reverse',
      notes:'Sport recreation UTV. 100 HP. On-command 4WD. Long-travel KYB FOX suspension. Oil: 3.0L 10W-40. CVT: Yamaha sealed belt housing (dry-type, not wet). Belt: inspect 1600 km, replace when glazed/cracked (no in-field serviceable). Common: front diff actuator motor failure in muddy conditions — actuator seal critical. Fuel: 37.9L.',
    },
  },
  {
    make:'Polaris', model:'General 1000 EPS', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'999cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.90mm',
      idleRpm:'1200 RPM', wotRpm:'7500 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'650', transType:'PVT (Polaris Variable Transmission) with high/low',
      notes:'ProStar 1000 parallel twin. 100 HP. Versatile (recreation + work). EPS (Electronic Power Steering). Tow: 680 kg. Oil: 2.4L Polaris PS-4 (10W-50); change every 100 hrs or 1600 km. PVT belt: inspect 100 hrs; Polaris OEM belt critical (aftermarket belt failures documented). Common: belt glazing from high-load low-speed — do not slip belt on steep climbs; use low gear. Fuel: 37.9L.',
    },
  },
  {
    make:'Can-Am', model:'Defender HD10', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'976cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK DCPR7E', plugGap:'0.80mm',
      idleRpm:'1300 RPM', wotRpm:'7200 RPM',
      valveTrain:'SOHC 8-valve (Rotax HD10)',
      starterType:'Electric', weightKg:'740', transType:'CVT with high/low/reverse',
      notes:'Rotax HD10 V-twin (72 HP). Defender is work-spec (vs Maverick = sport). Tow: 1134 kg. Oil: 3.0L Can-Am XPS 4T (10W-40). CVT: Can-Am sealed dry CVT; belt inspect every 100 hrs or 1600 km. Common: front prop-shaft CV boot failure from rock strikes — inspect at every oil change. Fuel: 37.9L.',
    },
  },
  {
    make:'Kubota', model:'RTV-X1100C', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1123cc', cylCount:'3',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection (diesel)',
      plugType:'N/A (Diesel)', plugGap:'N/A',
      idleRpm:'900 RPM', wotRpm:'3200 RPM',
      valveTrain:'OHV 2-valve',
      starterType:'Electric', weightKg:'900', transType:'HST (Hydrostatic) with high/low',
      notes:'Kubota D1105 3-cylinder diesel (24.8 HP). Industrial-spec UTV — no sport use. Hydrostatic transmission (HST) with 3-range Hi/Mid/Lo. Diff locks: all 4 individually lockable. Tow: 900 kg. Diesel oil: 6.5L 15W-40 CD/CF; change every 200 hrs. Fuel filter: every 200 hrs. Glow plugs: preheat 10 sec below 0°C. Common: HST charge pressure dropping at 2000+ hrs — filter bypass indicator lit; service hydrostatic filter. Fuel: 28.4L.',
    },
  },
  {
    make:'John Deere', model:'Gator HPX615E', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'615cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK BPR5ES', plugGap:'0.75mm',
      idleRpm:'1200 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV pushrod',
      starterType:'Electric', weightKg:'567', transType:'Variable speed Torque Converter (CVT) + mechanical low range',
      notes:'2-cylinder EFI. 20 HP. Utility Gator for farm/estate use. 600 kg payload (1/2-tonne bed). Torque converter CVT — smooth but not as efficient as belt CVT in sport machines. Oil: 1.9L 10W-30. Change every 100 hrs. Common: bed lift ram oil seal leak at 500 hrs in agricultural use — seal kit available. Diff lock: manual lever, avoid using on hard surfaces. Fuel: 17L.',
    },
  },

  // ── CONSTRUCTION EQUIPMENT ────────────────────────────────────────────────
  {
    make:'Wacker', model:'WP1550AW Plate Compactor', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'98cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.75mm',
      idleRpm:'2800 RPM', wotRpm:'5500 RPM',
      starterType:'Recoil', weightKg:'68',
      notes:'Honda GX100 engine (2.8 HP). Forward-plate compactor. Eccentric shaft excitation frequency: 95 Hz. Centrifugal clutch (compaction plate disengages at idle). Oil: 0.5L 10W-30. Change every 50 hrs or season. Compaction plate guard: check rubber strips every 20 hrs — bare plate edges cut travel liners. Vibration exposure: operator daily limit 2.5 hrs continuous (EU WBV). Common: throttle cable fraying at guide — replace at first sign of fraying (sudden WOT dangerous).',
    },
  },
  {
    make:'Wacker', model:'BS50-2 Jumping Jack Rammer', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'49cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1', fuelTankCapacity:'1.1L',
      plugType:'NGK BPR6ES', plugGap:'0.75mm',
      idleRpm:'2800 RPM', wotRpm:'6500 RPM',
      starterType:'Recoil', weightKg:'67',
      notes:'Wacker WM80 2-stroke engine. Jumping jack (rammer/tamper) for trench backfill, granular soils. Spring-stroke mechanism: check spring fatigue at 300 hrs (impact force drops if spring weakens). Oil in rammer body (guide cylinder): Wacker rammer oil SAE 40, 0.4L; change every 150 hrs. Fuel: 50:1 mix. Common: shoe bolt loosening from vibration — check 8x M10 bolts every 50 hrs (150 Nm). Vibration white-finger risk: limit operator continuous time to 1.5 hrs.',
    },
  },
  {
    make:'Multiquip', model:'QP3TH Trash Pump', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'196cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.75mm',
      idleRpm:'1800 RPM', wotRpm:'3600 RPM',
      starterType:'Recoil', weightKg:'43',
      notes:'Honda GX200 engine. 3" trash pump (can pass 25mm solids). Flow rate: 1136 L/min. Max head: 26m. Impeller: cast iron, inspect for wear/cracking every 200 hrs. Mechanical seal: common failure point — replace if pump leaks at shaft. Oil: 0.6L 10W-30. Priming: semi-self-priming to 7.6m — fill pump housing with water before starting dry. Common: impeller clogging with rags — install 50mm suction strainer.',
    },
  },
  {
    make:'Husqvarna', model:'FS 7000 D Floor Saw', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'686cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.75mm',
      idleRpm:'2200 RPM', wotRpm:'3600 RPM',
      starterType:'Electric', weightKg:'256',
      notes:'Honda GX630 (18 HP) or Kohler Command Pro 18 HP options. Floor saw for concrete cutting. 14–18" diamond blades. Water feed system for blade cooling/dust suppression — ensure water flow before engaging blade. Oil: 1.5L 10W-30. Blade guard: inspect for cracking every 50 hrs (blade disintegration hazard). Belt drive from engine to blade arbor: check tension every 50 hrs (poly V-belt). Common: water pump impeller wear causing poor flow — replace impeller every 500 hrs.',
    },
  },
  {
    make:'Generac', model:'XG8000E Generator', type:'Generator', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'530cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      starterType:'Electric + Recoil', weightKg:'113',
      notes:'Generac OHVI 530cc engine. 8000W running / 10000W surge. EcoMode (throttle varies with load). Fuel: 15L (10+ hrs at 50% load). Oil: 1.9L 10W-30. Change every 100 hrs or annually. Circuit breaker: thermal, not fuse — reset by hand after overload. Common: carburettor float sinking after ethanol exposure — replace float and needle seat every 3–5 years. AVR (voltage regulator): replace if output voltage drifts ±15% at load.',
    },
  },
  {
    make:'Briggs & Stratton', model:'Elite Series 8750W', type:'Generator', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'420cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      starterType:'Electric + Recoil', weightKg:'98',
      notes:'B&S 420cc OHV. 8750W running / 10000W peak. No EcoMode (constant 3600 RPM). Fuel: 18.9L (~11 hrs 50% load). Oil: 0.6L SAE 30. Change every 50 hrs or annually. Automatic low oil shutdown. Common: brushes wearing in generator head at 1500+ hrs — replace brush set before commutator grooving. Circuit breaker 30A L14-30R twistlock outlet.',
    },
  },
  {
    make:'Champion', model:'3500W Portable Generator', type:'Generator', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'196cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      starterType:'Recoil', weightKg:'48',
      notes:'Champion 196cc. 3500W running / 4000W surge. Economy mode switchable. Fuel: 3.8L (~12 hrs at 25% load). Oil: 0.6L SAE 30. Change first 5 hrs (break-in), then every 50 hrs. Common: carb pilot jet clog from storage — clean or replace $5 jet. GFCI outlets: test before each use. Not suitable for sensitive electronics — pure sine wave inverter generator required for computers/medical equipment.',
    },
  },
  {
    make:'Ariens', model:'921046 2-Stage 254cc', type:'Vehicle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'254cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RJ19LM', plugGap:'0.76mm',
      idleRpm:'1700 RPM', wotRpm:'3600 RPM',
      starterType:'Electric + Recoil', weightKg:'104',
      notes:'Ariens AX254 engine. 2-stage snowblower (impeller throws snow from auger — clears wet heavy snow better than single-stage). Auger: serrated steel; shear bolts (6x) protect drive line — carry spares. Oil: 0.5L 5W-30 (winter spec critical). Change every season. Drive: 6 forward / 2 reverse gear, friction disc. Friction disc: replace when slipping. Common: lower scraper bar wear — reverse on dry pavement accelerates wear, replace annually for concrete use.',
    },
  },

  // ── RESIDENTIAL RIDE-ON MOWERS ────────────────────────────────────────────
  {
    make:'John Deere', model:'E110 42"', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'344cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1750 RPM', wotRpm:'3350 RPM',
      starterType:'Electric', weightKg:'193', transType:'CVT (Tuff Torq K46)',
      notes:'B&S 17.5 HP single cylinder. Tuff Torq K46 transmission (sealed — oil not serviceable in field, replace unit at failure). 42" 2-blade deck. Oil: 1.4L SAE 30. Change every 50 hrs. Deck belt: single belt drives both blades; replace every 3–5 years. Common: K46 hydrostatic failure at 300–500 hrs under heavy load — K46 is consumer-grade; for >5 acres consider K57 or K66 upgrade model. Fuel: 11.4L.',
    },
  },
  {
    make:'John Deere', model:'X590 Multi-Terrain 54"', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'726cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1750 RPM', wotRpm:'3400 RPM',
      starterType:'Electric', weightKg:'322', transType:'Hydrostatic (Tuff Torq K66)',
      notes:'Kawasaki FR730V (24 HP). Tuff Torq K66 (serviceable heavy-duty — oil level check possible). Oil: 1.9L 10W-30. K66 fluid: Tuff Torq oil, 0.9L, change every 200 hrs. 4WD available (X595). Cruise control. Foot-controlled depth adjustment. Mulching kit available. Common: front axle bushing wear causing shimmy at 400 hrs — grease every 25 hrs prevents. Fuel: 19L.',
    },
  },
  {
    make:'Cub Cadet', model:'XT2 LX42 42"', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'679cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1750 RPM', wotRpm:'3400 RPM',
      starterType:'Electric', weightKg:'233', transType:'Hydrostatic (Hydro-Gear EZT)',
      notes:'Kohler 7000 Series 20 HP (KT715/KT725). Hydro-Gear EZT (semi-integrated axle + hydro in one unit). Oil: 1.9L 10W-30. EZT fluid: check sight glass; add Hydro-Gear 20W-50 if low — do not drain (sealed, no serviceability). Common: EZT losing drive when warm — low fluid level or internal bypass valve worn. Deck spindle bearings: lube every 25 hrs. Fuel: 11.4L.',
    },
  },
  {
    make:'Troy-Bilt', model:'Pony 42XP', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'344cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1750 RPM', wotRpm:'3350 RPM',
      starterType:'Electric', weightKg:'186', transType:'CVT (Tuff Torq K46)',
      notes:'B&S 17.5 HP Intek. Same K46 as JD E110 — same caveats apply. Oil: 1.4L SAE 30. Deck: 6-position height. Single blade belt. Common: belt jumping off deck pulley — worn idler spring (weak return tension) causes belt to skip under load. Replace spring before belt replacement. Fuel: 11.4L.',
    },
  },
  {
    make:'Craftsman', model:'T150 46"', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'452cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1750 RPM', wotRpm:'3400 RPM',
      starterType:'Electric', weightKg:'230', transType:'Hydrostatic (Tuff Torq K46T)',
      notes:'Craftsman (Husqvarna-manufactured post-2019). B&S 19 HP twin. K46T (T = twin clutch variant). Oil: 1.9L 10W-30. Deck drive belt: front-to-rear layout (46" uses 2 blades). Common: hydrostatic creep when brake pedal released — brake/hydrostatic linkage out of adjustment; see adjustment chart in manual. Fuel: 11.4L.',
    },
  },
  {
    make:'Ariens', model:'Zoom 42"', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'656cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1750 RPM', wotRpm:'3400 RPM',
      starterType:'Electric', weightKg:'286', transType:'Dual Hydro-Gear ZT-2400',
      notes:'Kawasaki FS651V (21.5 HP). Entry ZTR. Hydro-Gear ZT-2400 (lighter commercial duty than ZT-3400). Oil: 1.7L 10W-30. Hydro fluid: check sight glass; add 10W-50 if low. Deck belt: 42" single belt. Caster wheels: grease every 25 hrs. Common: arm rest bracket cracking from vibration — known warranty item on early models; reinforced bracket available. Fuel: 14L.',
    },
  },

];

async function run() {
  const existingSlugs = await fetchExistingSlugs();
  const slice = limit < ENTRIES.length ? ENTRIES.slice(0, limit) : ENTRIES;
  const result = await batchInsert(slice, existingSlugs, { dryRun });
  console.log(`Seed-7 complete: ${result.inserted} inserted, ${result.skipped} skipped.`);
}

run().catch(e => { console.error(e); process.exit(1); });
