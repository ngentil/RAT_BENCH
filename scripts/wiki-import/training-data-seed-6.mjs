/**
 * Training-data seed 6 — Supersport, adventure, scooters, commuters:
 * CBR600RR/1000RR-R, YZF-R1/R6, ZX-6R/ZX-10R, GSX-R1000R, Africa Twin,
 * KTM 890/1290 Adventure, Ténéré 700, V-Strom 1050, Aprilia Tuareg 660,
 * Norden 901, PCX125, Forza 350, NMAX 155, XMAX 300, TMAX 560, Vespa GTS 300,
 * Honda CBR500R, MT-03, Z400, CB300R, RE Meteor 350, Benelli TNT 600.
 *
 * node scripts/wiki-import/training-data-seed-6.mjs
 * node scripts/wiki-import/training-data-seed-6.mjs --dry-run
 */

import { fetchExistingSlugs, batchInsert } from './_shared.mjs';

const args     = process.argv.slice(2);
const dryRun   = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit    = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

const SRC = 'RAT BENCH Training Seed';
const SUM = 'Seeded from manufacturer service manual data';

const ENTRIES = [

  // ── HONDA SUPERSPORT ──────────────────────────────────────────────────────
  {
    make:'Honda', model:'CBR600RR', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'599cc', cylCount:'4',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK IMR9C-9HES', plugGap:'0.90mm',
      idleRpm:'1300 RPM', wotRpm:'14700 RPM',
      valveTrain:'DOHC 16-valve',
      starterType:'Electric', weightKg:'194', transType:'6-speed',
      notes:'CBR600RR (2013+). 120 HP. Honda Electronic Steering Damper (HESD). Dual Combined Braking (cABS). Oil: 3.3L 10W-30. Valve clearance: 16,000 km (intake 0.16±0.03mm, exhaust 0.25±0.03mm). Common: fuelling surge at 5000–6000 RPM cruise — PC VI fuel controller or ECU reflash. Rear suspension linkage bearings: replace every 30,000 km (seize easily without greasing).',
    },
  },
  {
    make:'Honda', model:'CBR1000RR-R Fireblade SP', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1000cc', cylCount:'4',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK IMR9C-9HES', plugGap:'0.90mm',
      idleRpm:'1200 RPM', wotRpm:'14500 RPM',
      valveTrain:'DOHC 16-valve',
      starterType:'Electric', weightKg:'201', transType:'6-speed',
      notes:'CBR1000RR-R (2020+). 217 HP. Öhlins Smart EC 2.0 semi-active suspension, Brembo Stylema monobloc front calipers. Winglets. 6-axis IMU. Quickshifter+ (up/down). Cornering ABS, wheelie control, launch control. Oil: 4.2L 10W-30; change every 12,000 km. Valve clearance: 12,000 km (critical — high-rev use advances wear). Common: exhaust header heat discolouration normal. Track-day tip: bleed brakes before every session (fluid vaporisation risk).',
    },
  },
  {
    make:'Honda', model:'Africa Twin CRF1100L DCT', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1084cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK SIMR8A9 (iridium)', plugGap:'0.90mm',
      idleRpm:'1200 RPM', wotRpm:'8000 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'238', transType:'6-speed DCT',
      notes:'Parallel twin adventure. 102 HP. DCT with off-road G-switch (higher engagement slip for loose terrain). 6-axis IMU; 7 riding modes. Showa 45mm forks, Pro-Link monoshock (adjustable). Apple CarPlay. Oil: 3.0L 10W-30 (DCT); change every 12,000 km. DCT fluid: Honda HPF-1 ATF, change every 24,000 km. Valve clearance: 16,000 km. Common: DCT software version mismatch after battery swap — reflash at dealer. Fuel: 24.2L.',
    },
  },
  {
    make:'Honda', model:'CBR500R', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'471cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK IMR9C-9HES', plugGap:'0.90mm',
      idleRpm:'1300 RPM', wotRpm:'8600 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'192', transType:'6-speed',
      notes:'47 HP mid-step sportsbike. Assist & slipper clutch. ABS. Sporty half-fairing. Oil: 3.1L 10W-30. Valve clearance: 16,000 km. Shared platform with CB500F/CB500X. Common: Rear tyre (160/60-17) unusual wear pattern from tight budget chassis — check swing arm pivot bearing preload.',
    },
  },

  // ── YAMAHA SUPERSPORT / ADV ───────────────────────────────────────────────
  {
    make:'Yamaha', model:'YZF-R1', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'998cc', cylCount:'4',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.90mm',
      idleRpm:'1100 RPM', wotRpm:'13000 RPM',
      valveTrain:'DOHC 16-valve (crossplane crankshaft)',
      starterType:'Electric', weightKg:'201', transType:'6-speed',
      notes:'CP4 crossplane crankshaft (90° firing intervals) — GP-derived torque feel. 200 HP (2020+). Öhlins electronic suspension, Brembo M50 calipers. 6-axis IMU, slide control, lift control, launch control. Quick-shift standard. Oil: 3.8L 10W-40; change every 12,000 km. Valve clearance: 26,600 km. Common: R1 can run hot in traffic — aux fan wiring kit dealer mod for city use. Fuel: 17L.',
    },
  },
  {
    make:'Yamaha', model:'YZF-R6', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'599cc', cylCount:'4',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.90mm',
      idleRpm:'1100 RPM', wotRpm:'14500 RPM',
      valveTrain:'DOHC 16-valve',
      starterType:'Electric', weightKg:'190', transType:'6-speed',
      notes:'YZF-R6 (2017+, final street version). 122 HP. Street use discontinued in EU (Euro5 failed 2021); track-only version available. YCC-T ride-by-wire. D-mode x3. Oil: 2.9L 10W-40. Valve clearance: 26,600 km. Common: YCCT sensor malfunction causing rich surge — TPS reset via Yamaha Diagnostic Tool. Chain: 530 pitch, replace every 20,000 km.',
    },
  },
  {
    make:'Yamaha', model:'YZF-R7', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'689cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.90mm',
      idleRpm:'1150 RPM', wotRpm:'10000 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'188', transType:'6-speed',
      notes:'MT-07 engine in full supersport bodywork. 73 HP. Aimed at club racing (homologation). Öhlins-spec fork cartridge as optional OEM. Assist/slipper clutch. Oil: 3.0L 10W-40. Valve clearance: 26,600 km. Not a 600cc supersport replacement — parallel twin torque character differs from 4-cylinder screamers. Fuel: 13L.',
    },
  },
  {
    make:'Yamaha', model:'Ténéré 700', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'689cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.90mm',
      idleRpm:'1150 RPM', wotRpm:'9000 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'205', transType:'6-speed',
      notes:'Rally-inspired mid-weight ADV. 72 HP CP2 parallel twin. Long-travel KYB forks (230mm), KYB monoshock (220mm). No riding modes (simplicity by design). ABS switchable off. Fuel: 16L. Chain: 520 pitch for lightweight feel. Oil: 2.6L 10W-40. Common: rear axle locking nut overtorqued at PDI — use breaker bar not air gun at 85 Nm. Popular: Rally Replica windscreen kit.',
    },
  },

  // ── KAWASAKI SUPERSPORT / ADV ─────────────────────────────────────────────
  {
    make:'Kawasaki', model:'ZX-6R 636', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'636cc', cylCount:'4',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.70–0.80mm',
      idleRpm:'1100 RPM', wotRpm:'14500 RPM',
      valveTrain:'DOHC 16-valve',
      starterType:'Electric', weightKg:'196', transType:'6-speed',
      notes:'636cc oversized 600 class. 128 HP. Kawasaki Traction Control, cornering management. Showa SFF-BP forks. Assist/slipper clutch. Oil: 3.4L 10W-40. Valve clearance: 24,000 km. Common: throttle bodies air leak at No.2/3 injector o-ring — lean surge at 6000–8000 RPM. Fuel: 17L.',
    },
  },
  {
    make:'Kawasaki', model:'Versys 650', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'649cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.70–0.80mm',
      idleRpm:'1100 RPM', wotRpm:'9000 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'216', transType:'6-speed',
      notes:'Ninja 650 engine in adventure-touring chassis. 69 HP. Long-travel 41mm forks (150mm). Soft seat 840mm tall. 2 power modes. ABS standard. Oil: 2.2L 10W-40. Valve clearance: 24,000 km. Common: fork seal leaks at 30,000 km from road debris — debris guards extend life. Fuel: 21L.',
    },
  },
  {
    make:'Kawasaki', model:'Versys 1000 SE', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1043cc', cylCount:'4',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.70–0.80mm',
      idleRpm:'1100 RPM', wotRpm:'10000 RPM',
      valveTrain:'DOHC 16-valve',
      starterType:'Electric', weightKg:'268', transType:'6-speed',
      notes:'Tourer with Öhlins electronic suspension (KECS). 120 HP. Cornering lights. Cruise control. Heated grips standard. Oil: 3.4L 10W-40. Valve clearance: 24,000 km. Common: KECS suspension actuator connector moisture ingress — dielectric grease at each service.',
    },
  },

  // ── SUZUKI SUPERSPORT / ADV ───────────────────────────────────────────────
  {
    make:'Suzuki', model:'GSX-R600', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'599cc', cylCount:'4',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.60–0.70mm',
      idleRpm:'1300 RPM', wotRpm:'15000 RPM',
      valveTrain:'DOHC 16-valve',
      starterType:'Electric', weightKg:'188', transType:'6-speed',
      notes:'Final production year 2017 (EU compliance end). 125 HP. Showa BFF forks. SDMS (Suzuki Drive Mode Selector) 3 modes. Oil: 3.3L 10W-40. Valve clearance: 26,600 km. Common: SAP (Secondary Air Injection) valve failure causing popping on decel — SAP removal/block-off plate common mod. Fuel: 17L.',
    },
  },
  {
    make:'Suzuki', model:'GSX-R1000R', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'999cc', cylCount:'4',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.60–0.70mm',
      idleRpm:'1100 RPM', wotRpm:'13200 RPM',
      valveTrain:'DOHC 16-valve',
      starterType:'Electric', weightKg:'203', transType:'6-speed',
      notes:'2017+ GSX-R1000R. 202 HP. SR-VVT (Suzuki Racing Variable Valve Timing) on intake — world first in production superbike. Öhlins electronic suspension, Brembo monobloc. IMU-based ABS/TCS/LC/wheelie control. Oil: 3.7L 10W-40. SR-VVT oil cleanliness critical — VVT actuator can stick if old oil; strict 10,000 km change. Fuel: 16L.',
    },
  },
  {
    make:'Suzuki', model:'V-Strom 1050 XT', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1037cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR8EIA-9', plugGap:'0.80mm',
      idleRpm:'1100 RPM', wotRpm:'9000 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'232', transType:'6-speed',
      notes:'90° V-twin adventure. 107 HP. SDMS-α 3 modes, ABS off-road mode (incl. rear ABS disable). Bi-directional quick-shift. Hill hold. Spoked wheels on XT. Oil: 3.7L 10W-40. Valve clearance: 26,600 km. Common: centre stand pivot pin seizing from lack of grease — lube annually. Fuel: 20L.',
    },
  },

  // ── KTM ADV ───────────────────────────────────────────────────────────────
  {
    make:'KTM', model:'890 Adventure R', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'889cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK SILMAR8A8', plugGap:'0.90mm',
      idleRpm:'1350 RPM', wotRpm:'9500 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'204', transType:'6-speed',
      notes:'Parallel twin LC8c (89° offset pins). 105 HP. WP XPLOR 48mm long-travel forks (240mm), WP XPLOR rear (240mm). Rally spec geometry. Off-road ABS (rear disconnectable), MTC, Cornering ABS. Oil: 1.9L 15W-50 (engine separate from gearbox). Gearbox: 0.7L 75W-90. Valve clearance: 15,000 km. Common: chain guide wear rapid in rocky terrain — steel skid plate protects front sprocket. Fuel: 20L.',
    },
  },
  {
    make:'KTM', model:'1290 Super Adventure S', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1301cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK SILMAR8A8', plugGap:'0.90mm',
      idleRpm:'1350 RPM', wotRpm:'9000 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'228', transType:'6-speed',
      notes:'V-twin LC8 (75° angle). 160 HP, 140 Nm. WP APEX semi-active suspension. Adaptive cruise control. Cornering lights. 9" TFT touchscreen. Radar (2021+). Oil: 1.9L 15W-50 engine + 0.7L gearbox (separate). Valve clearance: 30,000 km. Common: V-twin heat soak to right leg in traffic — heat shields available. Fuel: 23L.',
    },
  },

  // ── HUSQVARNA ADV ─────────────────────────────────────────────────────────
  {
    make:'Husqvarna', model:'Norden 901', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'889cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK SILMAR8A8', plugGap:'0.90mm',
      idleRpm:'1350 RPM', wotRpm:'9500 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'204', transType:'6-speed',
      notes:'KTM 890 sibling (shared platform). Scandinavian-styled adventure. WP APEX 43mm semi-active forks (Norden Expedition). Off-road ABS, TC. Oil: 1.9L 15W-50 + 0.7L gearbox. Valve clearance: 15,000 km. Slightly softer suspension tune than KTM 890R for road comfort. Fuel: 20L.',
    },
  },

  // ── APRILIA ADV ───────────────────────────────────────────────────────────
  {
    make:'Aprilia', model:'Tuareg 660', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'659cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK ILKAR7L11', plugGap:'0.95mm',
      idleRpm:'1300 RPM', wotRpm:'9500 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'204', transType:'6-speed',
      notes:'Parallel twin ADV (Aprilia RS 660 engine). 80 HP. Kayaba 43mm long-travel forks (230mm). APRC suite (Cornering ABS, TC, wheelie control). Oil: 2.4L 10W-40. Valve clearance: 24,000 km. Common: fan activation loud at idle in traffic — normal (thermostatic). Rally exhaust available (lighter, louder). Fuel: 18L.',
    },
  },

  // ── SCOOTERS ──────────────────────────────────────────────────────────────
  {
    make:'Honda', model:'PCX125', type:'Scooter', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'124cc', cylCount:'1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK IZFR5H11 (iridium)', plugGap:'1.00mm',
      idleRpm:'1700 RPM', wotRpm:'8500 RPM',
      valveTrain:'SOHC 4-valve',
      starterType:'Electric (+ ISS idle-stop)', weightKg:'130', transType:'CVT',
      notes:'eSP+ enhanced Smart Power engine. 12.7 HP. CVT with Idling Stop System (ISS) shuts engine at red lights. Oil: 0.7L 10W-30 (Honda genuine ultra). Change every 4000 km or annually. Coolant: 0.65L; change every 24,000 km. Common: ISS battery (dedicated 12V lithium) failing after 3 years — replace before main battery. Tyre: 110/70-14 front, 130/70-13 rear. Fuel: 8.1L.',
    },
  },
  {
    make:'Honda', model:'Forza 350', type:'Scooter', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'330cc', cylCount:'1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK IZFR6H11', plugGap:'1.00mm',
      idleRpm:'1700 RPM', wotRpm:'7700 RPM',
      valveTrain:'SOHC 4-valve',
      starterType:'Electric', weightKg:'193', transType:'CVT',
      notes:'29 HP maxi-scooter. Smart Key. 5" TFT. 21.3L underseat storage. ABS dual-channel. Oil: 1.5L 10W-30. CVT belt: inspect 16,000 km, replace ~40,000 km. CVT roller weights: inspect 32,000 km — flat spots cause RPM surge/hunting. Coolant: change 24,000 km. Common: rear brake caliper sticking — clean/lubricate slide pins every 2 years. Fuel: 13.5L.',
    },
  },
  {
    make:'Yamaha', model:'NMAX 155', type:'Scooter', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'155cc', cylCount:'1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CPR8EA-9', plugGap:'0.90mm',
      idleRpm:'1600 RPM', wotRpm:'8500 RPM',
      valveTrain:'SOHC 4-valve (VVA variable valve actuation)',
      starterType:'Electric', weightKg:'127', transType:'CVT',
      notes:'VVA (Variable Valve Actuation) switches between low/high cam lobes at 6000 RPM. 15.1 HP. ABS standard (2021+). Smart Key. Oil: 0.9L 10W-40. Change every 4000 km. VVA actuation solenoid: known failure at 50,000+ km on dirty oil — strict change interval prevents this. CVT belt: 40,000 km. Fuel: 5.1L.',
    },
  },
  {
    make:'Yamaha', model:'XMAX 300', type:'Scooter', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'292cc', cylCount:'1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR8EIA-9', plugGap:'0.90mm',
      idleRpm:'1500 RPM', wotRpm:'7500 RPM',
      valveTrain:'SOHC 4-valve',
      starterType:'Electric', weightKg:'182', transType:'CVT',
      notes:'Maxi-scooter. 28 HP. Smart Key. ABS. Traction Control. 45L underseat. Oil: 1.2L 10W-40. CVT belt: 40,000 km. Common: power loss above 100 km/h from CVT roller wear (flattens from 30,000 km hard use) — check every 20,000 km in performance applications. Fuel: 13L.',
    },
  },
  {
    make:'Yamaha', model:'TMAX 560 Tech Max', type:'Scooter', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'562cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.90mm',
      idleRpm:'1300 RPM', wotRpm:'7500 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'220', transType:'CVT',
      notes:'Premium maxi-scooter. Parallel twin. 47 HP. Y-AMT automated manual transmission (clutch auto, manual shift mode). ABS + TCS. Adjustable KYB suspension. Heated seat + grips. 7" TFT + Bluetooth. Oil: 2.3L 10W-40. CVT belt less critical — Y-AMT reduces belt slip. Common: Y-AMT clutch actuator wear after aggressive use — service at 40,000 km. Fuel: 15L.',
    },
  },
  {
    make:'Vespa', model:'GTS 300 Super', type:'Scooter', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'278cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK BPCR8ES', plugGap:'0.80mm',
      idleRpm:'1400 RPM', wotRpm:'7500 RPM',
      valveTrain:'SOHC 4-valve',
      starterType:'Electric', weightKg:'168', transType:'CVT',
      notes:'Hpe (High Performance Engineering) engine. 24 HP. ABS. ASR traction control. USB-C charge. Monoshock rear. Steel monocoque chassis (unlike Japanese plastic). Oil: 1.1L 5W-40. Change every 4000 km. Common: crankshaft seal oil leak at 30,000 km — early sign is oil on centrifugal clutch bell causing belt slip. CVT belt: 40,000 km. Fuel: 9L.',
    },
  },
  {
    make:'Piaggio', model:'MP3 500 HPE', type:'Scooter', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'493cc', cylCount:'1',
      coolingType:'Air/Liquid-cooled hybrid', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK BPCR8ES', plugGap:'0.80mm',
      idleRpm:'1300 RPM', wotRpm:'7000 RPM',
      valveTrain:'SOHC 4-valve',
      starterType:'Electric', weightKg:'262', transType:'CVT',
      notes:'Three-wheel tilting scooter (2 front wheels). 44 HP. Hydraulic tilt-locking system allows parking without kickstand. ABS + ASR + ESC on 3-wheel platform. Oil: 1.3L 5W-40. Front wheel tilt mechanism: service linkage bearings every 20,000 km (critical — stiff linkage causes uneven tyre wear). Fuel: 12L.',
    },
  },
  {
    make:'Kymco', model:'AK 550', type:'Scooter', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'550cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CPR8EA-9', plugGap:'0.90mm',
      idleRpm:'1300 RPM', wotRpm:'7500 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'240', transType:'CVT',
      notes:'Taiwanese maxi-scooter challenging TMAX territory. 50 HP. Dual-disc front brakes. ABS + TC. Large underseat storage + top box option. Oil: 2.1L 10W-40. CVT belt: manufacturer spec 48,000 km. Common: TFT screen anti-glare coating peeling after 2 years in UV — screen protector film recommended. Fuel: 15L.',
    },
  },
  {
    make:'SYM', model:'Maxsym TL500', type:'Scooter', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'499cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CPR8EA-9', plugGap:'0.90mm',
      idleRpm:'1400 RPM', wotRpm:'7500 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'225', transType:'CVT',
      notes:'Taiwanese parallel-twin maxi-scooter. 46 HP. Keyless entry, adjustable windscreen, TFT display, Brembo brakes. ABS + TC + cornering ABS. Oil: 2.0L 10W-40. CVT: inspect belt 20,000 km — Taiwanese CVT tolerances tighter than Japanese; replace at signs of glazing. Fuel: 14L.',
    },
  },
  {
    make:'Suzuki', model:'Burgman 400', type:'Scooter', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'399cc', cylCount:'1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR8EIA-9', plugGap:'0.80mm',
      idleRpm:'1500 RPM', wotRpm:'7000 RPM',
      valveTrain:'DOHC 4-valve',
      starterType:'Electric', weightKg:'207', transType:'CVT',
      notes:'Executive maxi-scooter. 32 HP. Automatic exhaust valve (SAIS). Smart key. ABS. Large 49L underseat. Oil: 1.5L 10W-40. CVT belt: 25,000 km Suzuki spec. Common: SAIS valve rattle at idle from carbon — clean or block off (exhaust note change only). Fuel: 13.5L.',
    },
  },

  // ── A2/LEARNER COMMUTERS ──────────────────────────────────────────────────
  {
    make:'Honda', model:'CB300R', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'286cc', cylCount:'1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CPR8EA-9', plugGap:'0.90mm',
      idleRpm:'1400 RPM', wotRpm:'8500 RPM',
      valveTrain:'DOHC 4-valve',
      starterType:'Electric', weightKg:'143', transType:'6-speed',
      notes:'Neo-retro naked. 31 HP (27 HP restricted for A2). ABS. Oil: 1.4L 10W-30. Valve clearance: 16,000 km. Common: rear tyre (150/60-17) unusual wear from single-cylinder firing pulse — check chain tension every 3000 km (elongates faster than twins). Fuel: 10L.',
    },
  },
  {
    make:'Yamaha', model:'MT-03', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'321cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CPR8EA-9', plugGap:'0.90mm',
      idleRpm:'1400 RPM', wotRpm:'10750 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'168', transType:'6-speed',
      notes:'A2-licence parallel twin. 42 HP (restricted to 35 HP for A2). ABS. Assist/slipper clutch. Oil: 1.8L 10W-40. Valve clearance: 26,600 km. Common: exhaust header heat paint flaking at 20,000 km — cosmetic. Economical touring: 4.5 L/100 km. Fuel: 14L.',
    },
  },
  {
    make:'Kawasaki', model:'Z400', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'399cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.70–0.80mm',
      idleRpm:'1300 RPM', wotRpm:'11000 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'167', transType:'6-speed',
      notes:'Naked A2 (45 HP, restricted to 35 HP). Assist/slipper clutch. ABS. Shared platform with Ninja 400. Oil: 1.9L 10W-40. Valve clearance: 24,000 km. Common: slight vibration at 7000–8000 RPM cruise — inherent parallel twin characteristic, not fault. Fuel: 14L.',
    },
  },
  {
    make:'Royal Enfield', model:'Meteor 350', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'349cc', cylCount:'1',
      coolingType:'Air/Oil-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CPR8EA-9', plugGap:'0.80mm',
      idleRpm:'1400 RPM', wotRpm:'6500 RPM',
      valveTrain:'SOHC 4-valve',
      starterType:'Electric', weightKg:'191', transType:'5-speed',
      notes:'Tripper Navigation (turn-by-turn pod). 20.2 HP. Tripper connects to phone via Bluetooth for navigation dots. ABS single-channel rear only. Oil: 2.0L 20W-50 (RE spec). Change every 5000 km. Common: air filter dust seal inadequate in dusty regions — add pre-filter foam wrap. Tappet noise normal on cold start (hydraulic lifter shimmy) — resolves in 30 seconds. Fuel: 15L.',
    },
  },
  {
    make:'Royal Enfield', model:'Classic 350', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'349cc', cylCount:'1',
      coolingType:'Air/Oil-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CPR8EA-9', plugGap:'0.80mm',
      idleRpm:'1400 RPM', wotRpm:'6500 RPM',
      valveTrain:'SOHC 4-valve',
      starterType:'Electric', weightKg:'195', transType:'5-speed',
      notes:'Retro cruiser, India\'s highest-selling motorcycle. J-series engine (2021+) is significantly improved over old UCE. ABS. Oil: 2.0L 20W-50. Change every 5000 km. Common: choke-lever creep (cable stretches) — adjust at barrel adjuster. Frame rust in humid climates — wax cavity sections at purchase. Fuel: 13L.',
    },
  },
  {
    make:'Benelli', model:'TNT 600i', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'600cc', cylCount:'4',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.80mm',
      idleRpm:'1200 RPM', wotRpm:'12000 RPM',
      valveTrain:'DOHC 16-valve',
      starterType:'Electric', weightKg:'240', transType:'6-speed',
      notes:'Italian brand, Chinese production (QJ-Benelli). 85 HP. Brembo brakes. Tubular trellis frame. Oil: 3.5L 10W-40. Valve clearance: 12,000 km — tight interval. Common: clutch basket cracking on hard use (known weak point pre-2021) — inspect basket at each clutch service. Fuel: 17.5L.',
    },
  },
  {
    make:'Aprilia', model:'RS 660', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'659cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK ILKAR7L11', plugGap:'0.95mm',
      idleRpm:'1300 RPM', wotRpm:'10500 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'169', transType:'6-speed',
      notes:'Mid-displacement sportsbike. 100 HP. 6-axis IMU, APRC (Cornering ABS, TC, wheelie control, launch). Quick-shift+ up/down. Öhlins forks optional. Oil: 2.4L 10W-40. Valve clearance: 24,000 km. Common: clutch bite point adjustment drifts after bedding — adjust at lever reservoir. Fuel: 15L.',
    },
  },

];

async function run() {
  const existingSlugs = await fetchExistingSlugs();
  const slice = limit < ENTRIES.length ? ENTRIES.slice(0, limit) : ENTRIES;
  const result = await batchInsert(slice, existingSlugs, { dryRun });
  console.log(`Seed-6 complete: ${result.inserted} inserted, ${result.skipped} skipped.`);
}

run().catch(e => { console.error(e); process.exit(1); });
