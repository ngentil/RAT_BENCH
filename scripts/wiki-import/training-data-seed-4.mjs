/**
 * Training-data seed 4 — PWC, ATVs/UTVs, diesel engines, GX clones, RC engines,
 * road motorcycles, snowmobiles, and additional generators.
 *
 * node scripts/wiki-import/training-data-seed-4.mjs
 * node scripts/wiki-import/training-data-seed-4.mjs --dry-run
 */

import { fetchExistingSlugs, batchInsert } from './_shared.mjs';

const args     = process.argv.slice(2);
const dryRun   = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit    = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

const SRC = 'RAT BENCH Training Seed';
const SUM = 'Seeded from manufacturer service manual data';

const ENTRIES = [

  // ── SEA-DOO (BRP) — Personal Watercraft ───────────────────────────────────
  {
    make:'Sea-Doo', model:'Spark 60', type:'Jet Ski / PWC', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'899cc', cylCount:'3',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK DCPR8E', plugGap:'0.90mm',
      idleRpm:'1300 RPM', wotRpm:'7800 RPM',
      starterType:'Electric', weightKg:'249',
      notes:'Rotax 900 ACE engine. Lightest 3-seat PWC (249 kg). Intelligent Brake and Reverse (iBR) optional. Closed-loop cooling. Supercharger: NOT fitted (naturally aspirated). Oil: 2.2L SAE 5W-40 (full synthetic). Coolant: 1.5L. Spark plugs: replace every 100 hrs. Wear ring: inspect every 50 hrs for grass/debris nicking — damaged ring causes cavitation and loss of thrust.',
    },
  },
  {
    make:'Sea-Doo', model:'GTI 130', type:'Jet Ski / PWC', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'899cc', cylCount:'3',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK DCPR8E', plugGap:'0.90mm',
      idleRpm:'1300 RPM', wotRpm:'7800 RPM',
      starterType:'Electric', weightKg:'331',
      notes:'Rotax 900 HO ACE (High Output). 130HP. 3-seat. Swim platform with retractable boarding ladder. Oil: 3.0L 5W-40. Coolant: 3.0L. IBR (Intelligent Brake and Reverse). Common fault: carbon seal leak on jet pump shaft — water enters hull; check bilge daily after use.',
    },
  },
  {
    make:'Sea-Doo', model:'GTX 230', type:'Jet Ski / PWC', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1630cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'1300 RPM', wotRpm:'8000 RPM',
      starterType:'Electric', weightKg:'380',
      notes:'Rotax 1630 ACE. 230HP. Naturally aspirated. 3-seat. LinQ cargo system. VTS (Variable Trim System). Intelligent Throttle Control. Oil: 4.2L 5W-40. Coolant: 4.5L. Fuel: 70L. Top speed ~105 km/h. Common: fuel filter replacement every 100 hrs — ethanol blend degrades plastic filter housing.',
    },
  },
  {
    make:'Sea-Doo', model:'RXT-X 300', type:'Jet Ski / PWC', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1630cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection + Supercharger',
      plugType:'NGK LFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'1300 RPM', wotRpm:'8500 RPM',
      starterType:'Electric', weightKg:'388',
      notes:'Rotax 1630 ACE Supercharged. 300HP. Supercharger wash procedure: run flush at idle 30 sec after each saltwater use — CRITICAL or supercharger corrodes rapidly. Oil: 4.2L 5W-40 full synthetic. Fuel: 70L (95 RON minimum). Supercharger service: rebuild every 100 hrs (BRP shop only — sealed unit). Top speed ~130 km/h. Launch Control, intelligent throttle, ErgoLock seat.',
    },
  },
  {
    make:'Sea-Doo', model:'RXP-X 300', type:'Jet Ski / PWC', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1630cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection + Supercharger',
      plugType:'NGK LFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'1300 RPM', wotRpm:'8500 RPM',
      starterType:'Electric', weightKg:'340',
      notes:'Race-oriented 1-seat version of RXT-X. Rotax 1630 ACE SC. 300HP. Lightest 300HP PWC (340 kg). Category-leading top speed. Rear sponsons adjustable for handling. Supercharger flush after every saltwater use.',
    },
  },

  // ── YAMAHA — WaveRunner ───────────────────────────────────────────────────
  {
    make:'Yamaha', model:'EX Waverunner', type:'Jet Ski / PWC', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1049cc', cylCount:'3',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9E', plugGap:'0.90mm',
      idleRpm:'1200 RPM', wotRpm:'7500 RPM',
      starterType:'Electric', weightKg:'274',
      notes:'TR-1 engine. Naturally aspirated 1049cc inline 3-cylinder. 100HP. 3-seat. RiDE system (Reverse with Intuitive Deceleration Electronics). Oil: 2.3L 10W-40. Fuel: 50L. Foam-filled hull below waterline — swamping resistant. Replace spark plugs every 100 hrs.',
    },
  },
  {
    make:'Yamaha', model:'VXR Waverunner', type:'Jet Ski / PWC', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1049cc', cylCount:'3',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9E', plugGap:'0.90mm',
      idleRpm:'1200 RPM', wotRpm:'7800 RPM',
      starterType:'Electric', weightKg:'314',
      notes:'TR-1 High Output. 110HP. Sport hull. RiDE. NanoXcel2 hull material — very light. Oil: 2.3L.',
    },
  },
  {
    make:'Yamaha', model:'FX SVHO Waverunner', type:'Jet Ski / PWC', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1812cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection + Supercharger',
      plugType:'NGK LFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'1200 RPM', wotRpm:'8300 RPM',
      starterType:'Electric', weightKg:'376',
      notes:'Super High Output 1812cc inline 4-cylinder supercharged. 260HP. Top speed ~115 km/h. Oil: 4.5L 10W-40 full synthetic. Fuel: 70L (95 RON). Supercharger: rinse after saltwater use, rebuild every 100 hrs at Yamaha dealer. YRS (Yamaha Remote Steering) — no conventional steering cables. Common: supercharger shaft seal failure — water in oil if oil level rises after use.',
    },
  },

  // ── KAWASAKI — Jet Ski ────────────────────────────────────────────────────
  {
    make:'Kawasaki', model:'Jet Ski Ultra LX', type:'Jet Ski / PWC', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1498cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9E', plugGap:'0.90mm',
      idleRpm:'1150 RPM', wotRpm:'8000 RPM',
      starterType:'Electric', weightKg:'396',
      notes:'Inline 4-cylinder, naturally aspirated. 160HP. 3-seat. Oil: 3.0L 10W-40. Fuel: 86L (largest tank in class). Electric reverse. Common in charter/rental fleet — durable and straightforward to service. Wear ring and impeller: inspect annually.',
    },
  },
  {
    make:'Kawasaki', model:'Jet Ski Ultra 310R', type:'Jet Ski / PWC', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1498cc', cylCount:'4',
      coolingType:'Water-cooled', fuelSystem:'Electronic Fuel Injection + Supercharger',
      plugType:'NGK CR9E', plugGap:'0.90mm',
      idleRpm:'1150 RPM', wotRpm:'8500 RPM',
      starterType:'Electric', weightKg:'399',
      notes:'Supercharged inline 4. 310HP. Race-focused. Oil: 3.0L 5W-40 full synthetic. Fuel: 86L (95 RON). Supercharger flush after every saltwater session. Intercooler: check water passages annually for scale buildup. Launch mode available. Top speed >130 km/h.',
    },
  },

  // ── ATVs / UTVs ───────────────────────────────────────────────────────────
  {
    make:'Honda', model:'TRX420 Rancher', type:'Quad Bike', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'420cc', boreDiameter:'86mm', crankStroke:'72mm',
      cylCount:'1', compressionRatio:'9.3:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection (PGM-FI)',
      plugType:'NGK DPRE7A-9', plugGap:'0.90mm',
      idleRpm:'1400 RPM',
      valveTrain:'OHV — 2 valves', transType:'5-speed manual or semi-auto ESP',
      starterType:'Electric', weightKg:'281',
      notes:'Farm/utility ATV. Liquid-cooled OHV single. Oil: 2.1L 10W-30. Coolant: 1.0L. Independent Rear Suspension or solid axle variants. 4WD with front diff lock. ESP (Electric Shift Program) variant uses servo motor for clutch — inspect servo contact points every 200 hrs. Chain: O-ring, 520. Rear drive: shaft option.',
    },
  },
  {
    make:'Honda', model:'TRX500 Foreman', type:'Quad Bike', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'475cc', cylCount:'1',
      compressionRatio:'9.5:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK DPRE7A-9', plugGap:'0.90mm',
      idleRpm:'1400 RPM',
      valveTrain:'OHV — 2 valves', transType:'5-speed manual or DCT',
      starterType:'Electric',
      notes:'Heavy-duty farm/hunting ATV. 475cc EFI. DCT (Dual Clutch Transmission) variant — automatic with paddle shift option. Oil: 2.6L. Coolant: 1.3L. 4WD. Selectable rear diff lock. Towing: 590 kg. Common: diff lock actuator sticking from mud ingress — flush and grease.',
    },
  },
  {
    make:'Honda', model:'TRX680 Rincon', type:'Quad Bike', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'675cc', cylCount:'1',
      compressionRatio:'9.0:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK DPRE7A-9', plugGap:'0.90mm',
      idleRpm:'1350 RPM',
      valveTrain:'OHV — 2 valves', transType:'3-speed auto (SHF)',
      starterType:'Electric',
      notes:'Large displacement single-cylinder ATV. 675cc. Selectable 4WD. Independent Rear Suspension. Oil: 3.1L. Coolant: 1.6L. SHF (Sequential Hydraulic Fluid) 3-speed auto — very different to DCT; fluid change every 200 hrs (Honda SHF Fluid). Max towing: 590 kg.',
    },
  },
  {
    make:'Yamaha', model:'Grizzly 700', type:'Quad Bike', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'686cc', boreDiameter:'102mm', crankStroke:'84mm',
      cylCount:'1', compressionRatio:'10.0:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LMAR8A-9', plugGap:'0.90mm',
      idleRpm:'1350 RPM',
      valveTrain:'DOHC — 4 valves', transType:'CVT (Ultramatic)',
      starterType:'Electric', weightKg:'297',
      notes:'DOHC 686cc single. Ultramatic CVT with centrifugal clutch and sub-transmission (HI/LO/Reverse). Oil: 2.5L 10W-40. Coolant: 1.36L. On-command 4WD. EPS (Electric Power Steering) standard. CVT belt: replace every 200 hrs or if slipping. Differential oil: 175mL SAE 80 each (front + rear).',
    },
  },
  {
    make:'Yamaha', model:'Raptor 700R', type:'Quad Bike', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'686cc', boreDiameter:'102mm', crankStroke:'84mm',
      cylCount:'1', compressionRatio:'10.0:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LMAR8A-9', plugGap:'0.90mm',
      wotRpm:'8500 RPM', valveTrain:'DOHC — 4 valves',
      transType:'5-speed manual', starterType:'Electric',
      notes:'Sport ATV racer. Same 686cc DOHC as Grizzly 700 but tuned for peak power. Manual 5-speed (no CVT). 2WD only. Oil: 1.6L (engine) + 0.5L (gearbox, separate). Independent front and rear suspension. Axle: solid rear with A-arm. Very popular sand dune and MX track machine.',
    },
  },
  {
    make:'Polaris', model:'Sportsman 570', type:'Quad Bike', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'567cc', cylCount:'1',
      compressionRatio:'10.5:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection (EFI)',
      plugType:'NGK DCPR8E', plugGap:'0.90mm',
      idleRpm:'1300 RPM',
      valveTrain:'DOHC', transType:'CVT (Auto)',
      starterType:'Electric', weightKg:'278',
      notes:'Popular utility ATV. On-demand AWD (automatically engages under slip). Oil: 1.9L Polaris PS-4 5W-50. Coolant: 1.1L. CVT belt: Polaris specified — belt width critical, aftermarket belts may slip. Check CVT clutch alignment every 200 hrs. Rear rack: 90 kg. Front rack: 45 kg. Towing: 680 kg.',
    },
  },
  {
    make:'Polaris', model:'Sportsman 850', type:'Quad Bike', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'849cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK DCPR8E', plugGap:'0.90mm',
      idleRpm:'1300 RPM',
      valveTrain:'DOHC', transType:'CVT (Auto)',
      starterType:'Electric',
      notes:'Twin-cylinder high-output ATV. ProStar 850 engine — parallel twin. Oil: 2.3L PS-4. Coolant: 1.5L. AWD on demand. Very popular farm/hunting machine. CVT belt: check tension and condition every 100 hrs. Engine braking: adjustable.',
    },
  },
  {
    make:'Polaris', model:'Ranger 570', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'567cc', cylCount:'1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK DCPR8E', plugGap:'0.90mm',
      transType:'CVT (Auto)', starterType:'Electric',
      notes:'Utility UTV (Side-by-Side). ProStar 570 single. Very common on farms and work sites. Oil: 1.9L PS-4 5W-50. Payload: 362 kg. Towing: 680 kg. Dump bed. CVT belt replacement is the most common service item. On-demand AWD + turf mode (2WD only for lawn surface protection).',
    },
  },
  {
    make:'Can-Am', model:'Outlander 650', type:'Quad Bike', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'649cc', cylCount:'2',
      compressionRatio:'10.5:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EH-9', plugGap:'0.90mm',
      idleRpm:'1350 RPM',
      valveTrain:'DOHC', transType:'CVT (Rotax)',
      starterType:'Electric',
      notes:'Rotax 650 V-twin. 4WD with Visco-Lok QE auto front diff. Oil: 2.3L Can-Am XPS 5W-40. Coolant: 1.5L. Traxter-style tri-mode active damping optional. CVT: Rotax QRS belt — genuine Rotax only. Common: overheating on steep climbs due to mud packing radiator — clean after every muddy use.',
    },
  },
  {
    make:'Can-Am', model:'Maverick X3 Turbo RR', type:'Ride-on Mower', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'900cc', cylCount:'3',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection + Turbo',
      plugType:'NGK LKR7B-11', plugGap:'1.0–1.1mm',
      idleRpm:'1200 RPM', wotRpm:'8000 RPM',
      starterType:'Electric',
      notes:'Rotax 900 ACE Turbo RR — 200HP. Inline 3-cylinder turbocharged. Side-by-side UTV. Oil: 3.7L Can-Am XPS 0W-40 (turbo spec — do not substitute). Coolant: 4.0L. Intercooler: clean fins annually. Turbo: no service interval — check for shaft play and seal leaks every 100 hrs. Boost: ~140 kPa. 98 RON minimum. Very high performance — popular sand and desert UTV.',
    },
  },

  // ── DIESEL — Small Engines ─────────────────────────────────────────────────
  {
    make:'Kubota', model:'Z482', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke diesel', ccSize:'479cc', cylCount:'2',
      boreDiameter:'67mm', crankStroke:'68mm', compressionRatio:'23.0:1',
      coolingType:'Water-cooled', fuelSystem:'Indirect injection (IDI)',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      starterType:'Electric',
      notes:'Vertical 2-cylinder water-cooled diesel. Used in Kubota BX compact tractors, ride-on mowers, mini excavators, chippers. Glow plugs: 11.5V, 4-second preheat. Engine oil: 2.1L SAE 15W-40. Coolant: 1.8L. Fuel injection pump: in-line Bosch/Denso type — do NOT disassemble without calibration equipment. Timing: set at 12° BTDC via injection pump spill timing. Very reliable — typical service life 5000+ hrs with regular oil changes.',
    },
  },
  {
    make:'Kubota', model:'D722', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke diesel', ccSize:'719cc', cylCount:'3',
      boreDiameter:'67mm', crankStroke:'68mm', compressionRatio:'23.0:1',
      coolingType:'Water-cooled', fuelSystem:'Indirect injection (IDI)',
      idleRpm:'1000–1500 RPM', wotRpm:'3600 RPM',
      starterType:'Electric',
      notes:'3-cylinder vertical diesel. Used in Kubota B and BX tractors, ride-on mowers, welders, generators. Glow plugs: 11.5V. Oil: 3.0L 15W-40. Coolant: 2.5L. Injection pump timing: 12° BTDC. Belt tension: fan/alternator belt deflection 10mm at midpoint (10N force). Common: injector carbon buildup — suspect if black smoke under load. Compression: 3.0 MPa min.',
    },
  },
  {
    make:'Kubota', model:'D902', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke diesel', ccSize:'898cc', cylCount:'3',
      boreDiameter:'72mm', crankStroke:'73.6mm', compressionRatio:'23.2:1',
      coolingType:'Water-cooled', fuelSystem:'Indirect injection (IDI)',
      idleRpm:'1000–1500 RPM', wotRpm:'3600 RPM',
      starterType:'Electric',
      notes:'3-cylinder diesel. Very common in Kubota compact tractors (BX and B series). Oil: 3.3L. Coolant: 3.0L. Belt: check every 200 hrs. Valve clearance (cold): Intake 0.15mm, Exhaust 0.18mm — every 200 hrs.',
    },
  },
  {
    make:'Kubota', model:'D1105', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke diesel', ccSize:'1123cc', cylCount:'3',
      boreDiameter:'78mm', crankStroke:'78.4mm', compressionRatio:'23.0:1',
      coolingType:'Water-cooled', fuelSystem:'Indirect injection (IDI)',
      idleRpm:'1000–1500 RPM', wotRpm:'3600 RPM',
      starterType:'Electric',
      notes:'Largest Kubota 3-cylinder IDI diesel. Used in L-series tractors, ride-on mowers, and commercial equipment. Oil: 4.2L. Coolant: 4.0L. 25HP class. Injection pressure: 13.2 MPa (Denso injectors). Lift pump: diaphragm type — replace every 1000 hrs or if air in fuel system.',
    },
  },
  {
    make:'Yanmar', model:'L48AE', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke diesel', ccSize:'211cc', cylCount:'1',
      boreDiameter:'68mm', crankStroke:'58mm', compressionRatio:'20.5:1',
      coolingType:'Air-cooled', fuelSystem:'Direct injection',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      starterType:'Recoil or electric',
      notes:'Air-cooled diesel single. Used in small tillers, water pumps, generators, mini cultivators. Glow plug preheating not required above 5°C. Oil: 0.9L 15W-40. Fuel injection: direct — Yanmar DI is rare in this class; most competitors use IDI. Very fuel efficient. Governor spring: do not adjust beyond rated RPM (3600 max). Low oil shutdown standard.',
    },
  },
  {
    make:'Yanmar', model:'L70AE', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke diesel', ccSize:'296cc', cylCount:'1',
      boreDiameter:'78mm', crankStroke:'62mm', compressionRatio:'20.5:1',
      coolingType:'Air-cooled', fuelSystem:'Direct injection',
      idleRpm:'1500 RPM', wotRpm:'3600 RPM',
      starterType:'Recoil or electric',
      notes:'7HP air-cooled DI diesel. Used in heavy-duty pumps, tillers, generators. Oil: 1.2L. Very clean combustion via DI design — less carbon than IDI competitors at same displacement.',
    },
  },
  {
    make:'Hatz', model:'1B20', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke diesel', ccSize:'232cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Direct injection',
      idleRpm:'1500 RPM', wotRpm:'3000 RPM',
      starterType:'Recoil or electric',
      notes:'German-made air-cooled diesel. Used in construction equipment, pressure washers, generators, fire pumps. Known for extreme durability. Oil: 0.9L 15W-40. Injection pump: Bosch PFR type. Decompression lever makes cold starting easier. Spare parts often available from Hatz-authorised dealers — NOT interchangeable with Asian competitors.',
    },
  },
  {
    make:'Lister Petter', model:'TS1', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke diesel', ccSize:'555cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Indirect injection',
      idleRpm:'1500 RPM', wotRpm:'1800–3000 RPM',
      starterType:'Recoil or electric',
      notes:'British air-cooled diesel. Extremely long-lived — many still running after 30,000+ hrs. Common in standby generators, water pumps, stationary applications. Oil: 1.5L 30W (monograde recommended by Lister for best camshaft lubrication). Valve clearance (hot): Intake 0.25mm, Exhaust 0.25mm. Decompressor on head. Injection timing: 28° BTDC. Parts available from Lister Petter spares network.',
    },
  },

  // ── GX CLONES ─────────────────────────────────────────────────────────────
  {
    make:'Predator', model:'212cc', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'212cc', boreDiameter:'68mm', crankStroke:'58mm',
      cylCount:'1', compressionRatio:'8.5:1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion L78V', plugGap:'0.76mm',
      idleRpm:'1800 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV', starterType:'Recoil',
      notes:'Honda GX200 clone. Sold at Harbor Freight (USA). Oil: 0.6L SAE 10W-30. Very popular for kart builds, log splitters, go-karts, mini bikes. "Hemi" variant (6.5HP) has hemispherical combustion chamber — NOT bolt-for-bolt interchangeable with standard 212. Upgrade path: jet kit (108 main, 35 pilot), valve spring kit, billet connecting rod, .010 head gasket removal for compression boost. Common issue: float needle wear — replace with Viton-tipped needle every 2 years.',
    },
  },
  {
    make:'Predator', model:'301cc', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'301cc', cylCount:'1',
      compressionRatio:'8.7:1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      wotRpm:'3600 RPM', valveTrain:'OHV', starterType:'Recoil or electric',
      notes:'GX270/GX340 clone class. Popular in log splitters, chippers, generators. Oil: 1.0L. Same carb rebuilding notes as Predator 212 — Viton needle and O-ring kit from Honda GX270 fits with minor modification.',
    },
  },
  {
    make:'Predator', model:'420cc', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'420cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      wotRpm:'3600 RPM', valveTrain:'OHV', starterType:'Recoil or electric',
      notes:'B&S 420cc class clone. Very popular in log splitters, go-karts, and commercial equipment. Oil: 1.1L. Very similar to Honda GX390 in dimensions — some parts cross. Popular karting engine when modified.',
    },
  },
  {
    make:'Lifan', model:'LF168F-2', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'163cc', boreDiameter:'68mm', crankStroke:'45mm',
      cylCount:'1', compressionRatio:'8.5:1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV', starterType:'Recoil or electric',
      notes:'Honda GX160 clone. 5.5HP. Bore and stroke identical to GX160 — gaskets and rings cross-reference. Carb: float height 14.5mm (same as GX160). Common in budget pressure washers, pumps, cultivators. Oil: 0.6L. Head bolt torque: 20 Nm (standard GX160 spec). Piston clearance may be larger than OEM spec — check before rebuild.',
    },
  },
  {
    make:'Lifan', model:'LF190F', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'196cc', boreDiameter:'68mm', crankStroke:'54mm',
      cylCount:'1', compressionRatio:'8.5:1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK BPR6ES', plugGap:'0.70–0.80mm',
      idleRpm:'1400 RPM', wotRpm:'3600 RPM',
      valveTrain:'OHV', starterType:'Recoil or electric',
      notes:'Honda GX200 clone. 6.5HP. Very common in budget tillers, water pumps, generators. Honda GX200 gaskets fit with minor trimming. Oil: 0.6L. Clone carb jets often smaller than Honda spec — re-jet with Honda main jet for better performance (stock is often lean).',
    },
  },
  {
    make:'DuroMax', model:'XP7HP', type:'Custom', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'212cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion L78V', plugGap:'0.76mm',
      wotRpm:'3600 RPM', valveTrain:'OHV', starterType:'Recoil',
      notes:'GX200/Predator 212 class clone. Used in DuroMax generators and pumps. Oil: 0.6L. Common replacement: air filter (foam deteriorates quickly) and governor spring (can stretch under load).',
    },
  },

  // ── RC / HOBBY ENGINES ────────────────────────────────────────────────────
  {
    make:'OS Engines', model:'.46 AX II', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'7.54cc', cylCount:'1',
      coolingType:'Air-cooled (fins)', fuelSystem:'Glow plug (nitro methanol)',
      mixRatio:'Nitro 15–30%, methanol + oil',
      plugType:'OS #8 or equivalent', plugGap:'N/A (glow element)',
      idleRpm:'2000–3000 RPM', wotRpm:'16000–20000 RPM',
      starterType:'Electric starter or glow fuel',
      notes:'Classic RC aircraft/car engine. Ringed piston. ABC (Aluminium/Brass/Chrome) cylinder — NO honing; replace as matched set. Needle valve: main needle 2.5 turns out from closed (sea level); richly set until broken in (2–3 tanks). Glow plug heat range: OS #8 standard, OS #4 for hotter climates. Fuel: 15–20% nitro for aircraft, up to 30% for racing. Break-in: 3 tanks at rich needle, progress lean gradually. Backplate: check O-ring every 20 tanks — air leak causes lean run and seizure.',
    },
  },
  {
    make:'OS Engines', model:'.21 XZ', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'3.46cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Glow plug (nitro)',
      plugType:'OS #8',
      idleRpm:'2000–3000 RPM', wotRpm:'25000–30000 RPM',
      starterType:'Electric start',
      notes:'1/10 and 1/8 scale RC buggy engine. Very high RPM. Tune needle valve: start 2.0 turns out, richen until bog-free, then lean in 1/16 turn at a time to WOT. Check engine temp: 100–120°C on cylinder head with temp gun is ideal. Above 130°C: too lean. ABC bore — no honing.',
    },
  },
  {
    make:'Saito', model:'FA-100', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'16.39cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor (Saito) + glow plug',
      wotRpm:'10000–12000 RPM', starterType:'Electric start',
      notes:'4-stroke RC aircraft engine. Silky smooth — ideal for scale warbirds and trainers. Uses 15–25% nitro glow fuel (or purpose-designed 4-stroke fuel). Valve train: OHV pushrod. Oil in fuel lubricates engine — no separate oil sump. Needle valve: set from float bowl adjustment. Break-in same as 2-stroke (rich needles first). Very popular 60-size engine.',
    },
  },
  {
    make:'Zenoah', model:'G230RC', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'23cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor (Walbro WT) — petrol/oil mix',
      mixRatio:'25:1–30:1 (petrol + 2T oil)',
      plugType:'NGK CM6', plugGap:'0.50mm',
      wotRpm:'9000–10500 RPM', starterType:'Recoil',
      notes:'Giant-scale RC aircraft engine — runs on petrol, not glow fuel. Walbro WT carb — standard diaphragm rebuild every 2 seasons (primer bulb cracks, needle valve seat wears). Electronic ignition (CDI). Prop strike: after any prop strike, remove flywheel and inspect crankshaft taper for damage before continuing. Used in 30–35% scale aircraft.',
    },
  },
  {
    make:'Rotax', model:'125 Max', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'125cc', boreDiameter:'54mm', crankStroke:'54.5mm',
      cylCount:'1', coolingType:'Liquid-cooled',
      fuelSystem:'Carburettor (Tillotson HW-27A)', mixRatio:'Pre-mix 50:1',
      plugType:'NGK BR10EG', plugGap:'0.50–0.55mm',
      idleRpm:'1800 RPM', wotRpm:'12000–14000 RPM',
      transType:'Direct drive (no gearbox)', starterType:'Push/electric start',
      notes:'Control class karting engine. Reed valve. E-start variant (EVO). Controlled spec: sealed engine — no porting or internal modifications allowed in class racing. Maximum cylinder head temp: 230°C (use temp strip or infrared). Carb jet: stock 132 main; adjust for altitude (lean by 2 sizes per 1500m). Coolant: Rotax Mix (30% antifreeze). Bearings: replace every 2 seasons or 50 hrs race use. Water pump impeller: inspect every season.',
    },
  },
  {
    make:'IAME', model:'X30', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'125cc', boreDiameter:'54mm', crankStroke:'54.5mm',
      cylCount:'1', coolingType:'Liquid-cooled',
      fuelSystem:'Carburettor (Tillotson HW-27A)', mixRatio:'Pre-mix 50:1',
      plugType:'NGK BR10EG', plugGap:'0.50–0.55mm',
      wotRpm:'14000–15000 RPM',
      transType:'Direct drive', starterType:'Electric start',
      notes:'Single-speed karting engine — rival to Rotax Max. Highly tunable power pipe (exhaust expansion chamber). Sealed for control-class racing. Crank bearings: replace every 30–40 hrs of race use. Reed valve: inspect and replace reeds if chipped or warped (causes weak bottom-end and bogging). Very popular ROK Cup and IAME Series engine.',
    },
  },
  {
    make:'Briggs & Stratton', model:'LO206', type:'RC / Hobby Engine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'206cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'Champion RC12YC', plugGap:'0.76mm',
      idleRpm:'1800 RPM', wotRpm:'6100 RPM',
      transType:'Direct drive', valveTrain:'OHV', starterType:'Recoil',
      notes:'Spec karting engine — world\'s most popular 4-stroke kart engine. Sealed engine: factory sealed clutch side cover and valve cover (void warranty if broken). Very inexpensive to run — full rebuild kit under $100. Air filter: UNI or K&N foam. Carb: stock Walbro — do not modify. Governor removed for karting use (factory seal on governor cover). Max RPM limited by valve float and cam design to 6100 RPM. Change oil every 4 race days. Carb diaphragm: every 2 seasons.',
    },
  },

  // ── SNOWMOBILES ────────────────────────────────────────────────────────────
  {
    make:'Ski-Doo', model:'MXZ 600R', type:'Tracked Machine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'599cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection (EFI)',
      mixRatio:'No premix (oil injection — Rotax RAVE-powered)',
      plugType:'NGK BR9ECM', plugGap:'0.70–0.80mm',
      idleRpm:'1500 RPM', wotRpm:'8000–8500 RPM',
      starterType:'Electric + recoil',
      notes:'Rotax 600R E-TEC 2-stroke. Electronically controlled oil injection (no premix). Liquid-cooled. Chaincase oil: 300mL Ski-Doo Chaincase Oil. Belt: Ski-Doo OEM only for rated loads. RAVE (Rotax Adjustable Variable Exhaust) power valve: service every 2000 km — carbon buildup causes midrange flat spot. Top-end piston/ring: inspect every 5000 km.',
    },
  },
  {
    make:'Ski-Doo', model:'Summit 850 E-TEC', type:'Tracked Machine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'849cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'E-TEC Direct Injection',
      plugType:'NGK BR9ECM', plugGap:'0.70–0.80mm',
      idleRpm:'1500 RPM', wotRpm:'8000 RPM',
      starterType:'Electric + recoil',
      notes:'BRP 850 E-TEC. DI 2-stroke — no premix. Lightest high-power sled in class. Chaincase: 300mL. Power valve: clean every 3000 km. Very popular backcountry and mountain snowmobile. Clutch alignment critical for belt life — check offset and deflection after any track/chassis work.',
    },
  },
  {
    make:'Polaris', model:'Indy 550', type:'Tracked Machine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'544cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Carburettor',
      mixRatio:'50:1 premix (Liberty engine)',
      plugType:'NGK BR9ECS', plugGap:'0.70–0.80mm',
      idleRpm:'1500 RPM', wotRpm:'8000 RPM',
      starterType:'Recoil',
      notes:'Polaris Liberty 550 twin. Premix required (no oil injection). Common trail sled. Chaincase oil: 300mL Polaris Chaincase/Transmission oil. CVT belt: Polaris OEM (Gates G-Force). Cooling: heat exchanger in tunnel + belly pan coolant passages — ensure not blocked by packed snow on trail.',
    },
  },
  {
    make:'Yamaha', model:'Sidewinder SRX LE', type:'Tracked Machine', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'998cc', cylCount:'4',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LMAR9D-9', plugGap:'0.90mm',
      wotRpm:'8500 RPM', starterType:'Electric',
      notes:'Genesis Turbo FI 4-stroke — Yamaha SuperJet-based. Turbocharged. 200+ HP. Very exotic engine for a snowmobile. Oil: 4.0L Yamalube 4T. Turbo: intercooled, boost ~80 kPa. Intercooler (charge air cooler) uses engine coolant — inspect hoses and clamps annually.',
    },
  },

  // ── ROAD MOTORCYCLES (common repair shop bikes) ───────────────────────────
  {
    make:'Honda', model:'CB500F', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'471cc', boreDiameter:'67mm', crankStroke:'66.8mm',
      cylCount:'2', compressionRatio:'10.7:1',
      coolingType:'Liquid-cooled', fuelSystem:'PGM-FI EFI (2×34mm)',
      plugType:'NGK IZFR6K-11S', plugGap:'1.0–1.1mm',
      idleRpm:'1200 RPM',
      valveTrain:'DOHC — 4 valves per cylinder', transType:'6-speed manual',
      driveType:'Chain', starterType:'Electric',
      notes:'Parallel twin. LAMS eligible. Oil: 3.1L 10W-30. Coolant: 2.1L. Chain: 520. Valve clearance: Intake 0.16–0.24mm, Exhaust 0.26–0.34mm — every 16,000 km. ABS standard from 2013. Very popular beginner to intermediate machine.',
    },
  },
  {
    make:'Honda', model:'CB650R', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'648cc', cylCount:'4',
      compressionRatio:'11.6:1',
      coolingType:'Liquid-cooled', fuelSystem:'PGM-FI EFI',
      plugType:'NGK SILMAR8A9', plugGap:'0.90mm',
      idleRpm:'1200 RPM', wotRpm:'11000 RPM',
      valveTrain:'DOHC', transType:'6-speed manual',
      driveType:'Chain', starterType:'Electric',
      notes:'Neo Sports Café inline 4. Derived from CBR650R. Oil: 4.0L. Coolant: 1.7L. Valve clearance: Intake 0.16–0.24mm, Exhaust 0.26–0.34mm — every 16,000 km. Not LAMS. ABS + throttle-by-wire.',
    },
  },
  {
    make:'Yamaha', model:'MT-07', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'689cc', boreDiameter:'80mm', crankStroke:'68.6mm',
      cylCount:'2', compressionRatio:'11.5:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection (2×40mm FI)',
      plugType:'NGK LMAR9D-J', plugGap:'0.90mm',
      idleRpm:'1100 RPM',
      valveTrain:'DOHC — 4 valves per cylinder', transType:'6-speed manual',
      driveType:'Chain', starterType:'Electric',
      notes:'CP2 (Crossplane Concept 2) 270° firing order parallel twin — characterful irregular firing pulse. Oil: 3.0L 10W-40. Coolant: 1.55L. Chain: 520 DID. Valve clearance: Intake 0.11–0.20mm, Exhaust 0.21–0.30mm — every 24,000 km (every 42,000 km for exhaust). ABS. Very popular naked bike. A2 LAMS variant available (35kW restricted).',
    },
  },
  {
    make:'Kawasaki', model:'Z650', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'649cc', boreDiameter:'83mm', crankStroke:'60mm',
      cylCount:'2', compressionRatio:'10.8:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.90mm',
      idleRpm:'1100 RPM',
      valveTrain:'DOHC', transType:'6-speed manual',
      driveType:'Chain', starterType:'Electric',
      notes:'Parallel twin 180° firing order. Oil: 2.0L 10W-40. Coolant: 1.45L. Chain: 520. LAMS (restricted variant: Z650L). Valve clearance: every 24,000 km. Assist and Slipper clutch standard.',
    },
  },
  {
    make:'Kawasaki', model:'Ninja 400', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'399cc', boreDiameter:'70mm', crankStroke:'52mm',
      cylCount:'2', compressionRatio:'11.5:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK SILMAR8A9', plugGap:'0.90mm',
      idleRpm:'1300 RPM', wotRpm:'12000 RPM',
      valveTrain:'DOHC', transType:'6-speed manual',
      driveType:'Chain', starterType:'Electric',
      notes:'Best in class LAMS 400. Parallel twin. Oil: 2.0L 10W-40. Coolant: 1.35L. Slipper clutch. Very highly rated beginner sport bike. Valve clearance: Intake 0.15–0.24mm, Exhaust 0.22–0.31mm every 15,000 km.',
    },
  },
  {
    make:'Suzuki', model:'SV650', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'645cc', boreDiameter:'81mm', crankStroke:'62.6mm',
      cylCount:'2', compressionRatio:'11.2:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection (2×39mm)',
      plugType:'NGK CR9EIA-9', plugGap:'0.90mm',
      idleRpm:'1300 RPM',
      valveTrain:'DOHC', transType:'6-speed manual',
      driveType:'Chain', starterType:'Electric',
      notes:'90° V-twin. Iconic beginner and track day machine. Oil: 2.5L 10W-40. Coolant: 1.8L. Chain: 525. Valve clearance: Intake 0.10–0.20mm, Exhaust 0.20–0.30mm — every 24,000 km. LAMS variant: SV650L (power restricted). Very common repair shop machine — carb-era versions (1999–2002) have Mikuni BST36 flat-slides that need periodic jet needle clip adjustment.',
    },
  },
  {
    make:'BMW', model:'F 800 GS', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'798cc', boreDiameter:'82mm', crankStroke:'75.6mm',
      cylCount:'2', compressionRatio:'12.0:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection (BMS-K + throttle-by-wire)',
      plugType:'NGK LZFR5A-11', plugGap:'1.0–1.1mm',
      idleRpm:'1200 RPM',
      valveTrain:'DOHC', transType:'6-speed manual',
      driveType:'Chain', starterType:'Electric',
      notes:'Parallel twin 360° (even firing). Oil: 3.0L Shell Advance Ultra 10W-40 or BMW Motorrad 4T. Filter: external spin-on. Coolant: 1.5L. Chain: 525. Valve clearance: Intake 0.15mm, Exhaust 0.15mm — every 10,000 km. ABS standard. BMW Motorrad diagnostic via GS-911 or BMW Motorrad Diagnostics. Telelever front suspension — not a conventional fork; toe adjustment via eccentric bearing. Very popular adventure touring bike.',
    },
  },
  {
    make:'KTM', model:'790 Adventure', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'799cc', boreDiameter:'88mm', crankStroke:'65.7mm',
      cylCount:'2', compressionRatio:'12.7:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection (Keihin)',
      plugType:'NGK LKAR9A-9', plugGap:'0.90mm',
      idleRpm:'1200 RPM',
      valveTrain:'DOHC', transType:'6-speed manual',
      driveType:'Chain', starterType:'Electric',
      notes:'LC8c parallel twin. 270° crank firing order (like V-twin character). Oil: 1.5L 15W-50 (engine ONLY — separate gearbox oil 0.7L 75W-90). Coolant: 1.7L. WP APEX suspension. Cornering ABS. Multiple ride modes. Valve clearance: every 15,000 km — finger follower design means minimal adjustment. Very popular adventure bike.',
    },
  },
  {
    make:'Royal Enfield', model:'Interceptor 650', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'648cc', boreDiameter:'78mm', crankStroke:'67.8mm',
      cylCount:'2', compressionRatio:'9.5:1',
      coolingType:'Air/oil cooled', fuelSystem:'Electronic Fuel Injection (2×38mm)',
      plugType:'NGK IZFR6K-11', plugGap:'1.0–1.1mm',
      idleRpm:'1100 RPM',
      valveTrain:'OHC — 4 valves per cylinder', transType:'6-speed manual',
      driveType:'Chain', starterType:'Electric',
      notes:'Parallel twin 270° crank firing order. Air/oil cooled (no liquid coolant circuit). Oil: 2.5L 10W-50 (Royal Enfield Gear SAE 10W-50 recommended). No coolant. Valve clearance: Intake 0.10mm, Exhaust 0.10mm — every 10,000 km. Chain: 520. Popular retro bike, very approachable for mechanics — simpler than Japanese competitors. Common: valve clearance tightening by 5000 km on new engine.',
    },
  },
];

async function run() {
  console.log(`\n🔥  All-in Seed 4 — PWC, ATVs, Diesels, Clones, RC, Snow, Road${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`    ${ENTRIES.length} entries`);

  const slice = ENTRIES.slice(0, limit);

  console.log('\nFetching existing wiki slugs…');
  const existingSlugs = await fetchExistingSlugs();
  console.log(`  ${existingSlugs.size} entries already in wiki\n`);

  const result = await batchInsert(slice, existingSlugs, { dryRun });
  console.log(`\n✅  Done: ${result.inserted} inserted, ${result.skipped} skipped\n`);
}

run().catch(e => { console.error(e); process.exit(1); });
