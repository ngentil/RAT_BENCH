/**
 * Training-data seed 5 — Cruisers & tourers: Harley-Davidson, Triumph, BMW Motorrad,
 * Ducati, Indian, Honda Gold Wing, Yamaha, Kawasaki, Suzuki big bikes.
 *
 * node scripts/wiki-import/training-data-seed-5.mjs
 * node scripts/wiki-import/training-data-seed-5.mjs --dry-run
 */

import { fetchExistingSlugs, batchInsert } from './_shared.mjs';

const args     = process.argv.slice(2);
const dryRun   = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit    = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

const SRC = 'RAT BENCH Training Seed';
const SUM = 'Seeded from manufacturer service manual data';

const ENTRIES = [

  // ── HARLEY-DAVIDSON ───────────────────────────────────────────────────────
  {
    make:'Harley-Davidson', model:'Softail Standard (Milwaukee-Eight 107)', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1746cc', cylCount:'2',
      coolingType:'Air/Oil-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'Harley 6R12 (OEM) / NGK DCPR7E', plugGap:'0.97–1.08mm',
      idleRpm:'950–1050 RPM', wotRpm:'5500 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.076–0.152mm', exhaustValveClear:'0.203–0.279mm',
      starterType:'Electric', weightKg:'290', transType:'6-speed',
      notes:'Milwaukee-Eight 107 (1746cc), 90° V-twin. Hydraulic self-adjusting lifters — valve clearance only set on cold engine. Oil: 3.7L Harley Full Synthetic SAE 20W-50 (top end), primary chaincase 0.95L, gearbox 0.47L — three separate fill points, common beginner mistake. Primary chain adjustment: 6–9mm freeplay. Serpentine belt drive, no adjustment needed. Timing chain: no service (wet-sump oiling). H-D recommends oil change every 8000 km / 5000 mi. Air filter: inspect every 8000 km, replace per condition. Common fault: oil weeping at pushrod tube seals (no fix needed unless active leak > 1 drop/day). Torque: 148 Nm at 3000 RPM.',
    },
  },
  {
    make:'Harley-Davidson', model:'Fat Boy 114', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1868cc', cylCount:'2',
      coolingType:'Air/Oil-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'Harley 6R12', plugGap:'0.97–1.08mm',
      idleRpm:'950–1050 RPM', wotRpm:'5500 RPM',
      valveTrain:'OHV pushrod', intakeValveClear:'0.076–0.152mm', exhaustValveClear:'0.203–0.279mm',
      starterType:'Electric', weightKg:'317', transType:'6-speed',
      notes:'Milwaukee-Eight 114 (1868cc). 158 Nm torque. Twin cam belt drive, 8-spoke cast aluminium "laced" wheels. Oil system: same as 107 — 3 separate fills. Note: 114 uses same tappets and pushrods as 107. Solid front forks (no cartridge). Common: screen-type oil filter bypass at cold start — normal. Fuel tank 18.9L (5 US gal). Recommended: 91 RON (US87) min, 95 RON preferred on stage 1 tunes.',
    },
  },
  {
    make:'Harley-Davidson', model:'Road Glide Special (Milwaukee-Eight 114)', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1868cc', cylCount:'2',
      coolingType:'Air/Oil-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'Harley 6R12', plugGap:'0.97–1.08mm',
      idleRpm:'950–1050 RPM', wotRpm:'5500 RPM',
      valveTrain:'OHV pushrod',
      starterType:'Electric', weightKg:'368', transType:'6-speed',
      notes:'Batwing fairing with shark-nose lower; framemounted (not fork-mounted) for reduced steering inertia. Infotainment: BOOM! Box GTS touchscreen. ABS standard. Fuel: 22.7L. Oil: same 3-fill points as all M8 models. Common: radio vibration rattle from mid-fairing screw loosening — Loctite 243. Tyre: front 130/60B19, rear 180/55B18. Belt tension: 10–14mm deflection (3 kg load).',
    },
  },
  {
    make:'Harley-Davidson', model:'Sportster S (Revolution Max 1250T)', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1252cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LMAR8A-9', plugGap:'0.90mm',
      idleRpm:'1000 RPM', wotRpm:'8500 RPM',
      valveTrain:'DOHC 4-valve',
      starterType:'Electric', weightKg:'228', transType:'6-speed',
      notes:'Revolution Max 1250T — H-D first liquid-cooled Sportster (2021+). 121 HP, 125 Nm. Stressed-member frame (engine is structural). Oil: 4.0L (engine + transmission shared sump), first service 1600 km. Common: TPMS battery death at ~4 years — sensor replacement required for warning light reset. TFT display, Bluetooth RDRS (cornering ABS). Leaky water pump seal reported on early 2021 units — recall awareness.',
    },
  },
  {
    make:'Harley-Davidson', model:'Street Glide ST (Milwaukee-Eight 117)', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1923cc', cylCount:'2',
      coolingType:'Air/Oil-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'Harley 6R12', plugGap:'0.97–1.08mm',
      idleRpm:'950–1050 RPM', wotRpm:'5500 RPM',
      valveTrain:'OHV pushrod',
      starterType:'Electric', weightKg:'361', transType:'6-speed',
      notes:'Milwaukee-Eight 117 (1923cc). 170 Nm torque. Screamin Eagle 117 is stage 3 crate upgrade; ST is factory hot-rod tourer. Showa 47mm semi-active front suspension. Brembo 4-piston front calipers. Oil 3-fill same as all M8; 117 may require more frequent valve cover seal inspection due to higher thermal cycling.',
    },
  },
  {
    make:'Harley-Davidson', model:'Low Rider S (Milwaukee-Eight 114)', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1868cc', cylCount:'2',
      coolingType:'Air/Oil-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'Harley 6R12', plugGap:'0.97–1.08mm',
      idleRpm:'950–1050 RPM',
      valveTrain:'OHV pushrod',
      starterType:'Electric', weightKg:'306', transType:'6-speed',
      notes:'Performance Softail. Inverted 43mm forks. Brembo 4-piston dual discs. Low 690mm seat. Drag bars. Common accessory swap: 2-into-2 short-shots exhaust — remapping required to avoid lean surge at cruise.',
    },
  },

  // ── TRIUMPH ───────────────────────────────────────────────────────────────
  {
    make:'Triumph', model:'Bonneville T120', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1200cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK IMR9C-9HES', plugGap:'0.90mm',
      idleRpm:'1100 RPM', wotRpm:'6900 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'224', transType:'6-speed',
      notes:'High Torque 1200 parallel twin. 105 Nm at 3500 RPM. Ride-by-wire, 2 riding modes (Road/Rain). Torque assist clutch. Oil: 3.3L 10W-40. Coolant: 2.5L. Service: valve clearance 24,000 km; chain every 800 km lube / 24,000 km inspect. Common: throttle body balance drift — rough idle fixed by TPS sync. Fuel: 14.5L. Tyres: 100/90-18 front, 150/70-17 rear.',
    },
  },
  {
    make:'Triumph', model:'Thruxton RS', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1200cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK IMR9C-9HES', plugGap:'0.90mm',
      idleRpm:'1100 RPM', wotRpm:'7500 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'197', transType:'6-speed',
      notes:'High Power 1200 head (103 HP vs T120\'s 80 HP). Öhlins STX40 rear, Öhlins cartridge forks. Brembo M50 monobloc calipers. Clip-on bars, rearset pegs — dedicated café racer. Low seat 790mm. Same service intervals as T120 but uses higher-rev cam profile — check exhaust valve clearance first (tighter tolerance side). Fuel: 14.5L.',
    },
  },
  {
    make:'Triumph', model:'Tiger 900 GT', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'888cc', cylCount:'3',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK SILMAR8A8', plugGap:'0.80mm',
      idleRpm:'1100 RPM', wotRpm:'10000 RPM',
      valveTrain:'DOHC 12-valve',
      starterType:'Electric', weightKg:'193', transType:'6-speed',
      notes:'T-plane 888cc triple (firing 0°-290°-160° — irregular rhythm for rear-wheel traction feel). 95 HP. Ride-by-wire. 5 riding modes. Cornering ABS/TC. Oil: 4.0L 10W-40. Coolant: 2.6L. Service: 16,000 km major (valve shims). Chain lube: every 800 km. Common: heated grip relay buzzing — software patch via dealer. Fuel: 20L. Tyres: 100/90-19 front, 150/70-17 rear.',
    },
  },
  {
    make:'Triumph', model:'Street Triple 765 RS', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'765cc', cylCount:'3',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK SILMAR8A8', plugGap:'0.80mm',
      idleRpm:'1200 RPM', wotRpm:'12550 RPM',
      valveTrain:'DOHC 12-valve',
      starterType:'Electric', weightKg:'166', transType:'6-speed',
      notes:'765 RS: 130 HP (RS vs 120 HP S). Öhlins STX40 rear, Showa BFF forks, Brembo M50 brakes. Track-focused naked. Quick-shift standard. 5 riding modes. Oil: 3.6L 10W-40. Valve clearance: 24,000 km (intake 0.10–0.15mm, exhaust 0.15–0.20mm). Common: slipper clutch rattle on cold start — normal; oil-related noise within 60 seconds of warm-up. Fuel: 17.4L.',
    },
  },
  {
    make:'Triumph', model:'Speed Triple 1200 RS', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1160cc', cylCount:'3',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK IMR9C-9HES', plugGap:'0.90mm',
      idleRpm:'1200 RPM', wotRpm:'11000 RPM',
      valveTrain:'DOHC 12-valve',
      starterType:'Electric', weightKg:'198', transType:'6-speed',
      notes:'180 HP supernaked triple. Öhlins NIX30 forks, TTX36 rear. Brembo Stylema calipers. 5-axis IMU. 5 modes incl. Track. Full-colour TFT. Oil: 4.0L 10W-40. Quick-shift + autoblipper standard. Common: radiator stone damage on track use — mesh guard highly recommended. Fuel: 15.5L.',
    },
  },
  {
    make:'Triumph', model:'Rocket 3 R', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'2458cc', cylCount:'3',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK SILZKFR8E8', plugGap:'0.80mm',
      idleRpm:'1000 RPM', wotRpm:'6000 RPM',
      valveTrain:'DOHC 12-valve',
      starterType:'Electric', weightKg:'291', transType:'6-speed',
      notes:'World\'s largest production motorcycle engine (2458cc, 2021+ gen). 221 Nm torque at 4000 RPM — requires torque-assist slipper clutch and shaft drive. 167 HP. Oil: 6.5L 10W-40. Coolant: 4.5L. Service: valve clearance 16,000 km. Shaft drive: check oil level every 24,000 km (80W-90 hypoid, 200 mL). Tyres: 150/80-17 front, 240/50-16 rear. Fuel: 18L. Common: rear wheel spline corrosion if bike left unwashed — grease spline at every tyre change.',
    },
  },
  {
    make:'Triumph', model:'Tiger 1200 GT Explorer', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1160cc', cylCount:'3',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK IMR9C-9HES', plugGap:'0.90mm',
      idleRpm:'1100 RPM', wotRpm:'9300 RPM',
      valveTrain:'DOHC 12-valve',
      starterType:'Electric', weightKg:'239', transType:'6-speed',
      notes:'Adventure touring triple. 150 HP. Semi-active Showa suspension. Cornering ABS/TC/hill hold. Adaptive cruise control optional. Fuel: 30L tank (longest range in class). Oil: 4.0L 10W-40. Service: 16,000 km major. Common: self-cancelling indicator failure in muddy conditions — clean relay module behind headlight. Spoked wire wheels on Rally version (tubeless-compatible).',
    },
  },

  // ── BMW MOTORRAD ──────────────────────────────────────────────────────────
  {
    make:'BMW', model:'R 1250 GS', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1254cc', cylCount:'2',
      coolingType:'Air/Liquid-cooled (ShiftCam)', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK SILMAR8A8 (BMW part 12 12 7 535 210)', plugGap:'0.80mm',
      idleRpm:'1000 RPM', wotRpm:'7750 RPM',
      valveTrain:'OHV 4-valve per cylinder (ShiftCam variable lift)',
      starterType:'Electric', weightKg:'249', transType:'6-speed',
      notes:'Boxer twin with ShiftCam (2019+): variable valve timing shifts between two cam profiles for low-end torque vs top-end power. 136 HP, 143 Nm. Dynamic ESA semi-active suspension optional. Oil: 3.75L 10W-40 full synth; change every 10,000 km. Coolant (head only): 2.2L; air-cooled block, water-cooled heads. Common: TFT screen delamination in direct sunlight (warranty recall). Tele-Lever/Paralever — no fork dive braking. Valve clearance: 20,000 km (intake 0.10mm, exhaust 0.20mm). Fuel: 20L.',
    },
  },
  {
    make:'BMW', model:'R 1250 RT', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1254cc', cylCount:'2',
      coolingType:'Air/Liquid-cooled (ShiftCam)', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK SILMAR8A8', plugGap:'0.80mm',
      idleRpm:'1000 RPM', wotRpm:'7750 RPM',
      valveTrain:'OHV 4-valve (ShiftCam)',
      starterType:'Electric', weightKg:'279', transType:'6-speed',
      notes:'Touring version of R1250GS. Full fairing with electrically adjustable windscreen. Heated seat + grips standard. Hill Start Control, Adaptive Cruise Control. Common: heated windscreen element failure at cold cycling — thermal shock. Oil same as GS. ABS Pro with cornering. Fuel: 25L.',
    },
  },
  {
    make:'BMW', model:'S 1000 RR', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'999cc', cylCount:'4',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LMAR8AI-9 (BMW 12 12 7 711 383)', plugGap:'0.90mm',
      idleRpm:'1200 RPM', wotRpm:'13500 RPM',
      valveTrain:'DOHC 16-valve (ShiftCam 2019+)',
      starterType:'Electric', weightKg:'197', transType:'6-speed',
      notes:'Inline-4 superbike. 210 HP (2023 spec). ShiftCam on intake cams (2019+). DDC (Dynamic Damping Control) semi-active suspension. Öhlins optional. Oil: 4.0L 10W-40; change every 10,000 km or annually. Valve clearance: 12,000 km (intake 0.08–0.13mm, exhaust 0.13–0.18mm) — labour-intensive (engine out recommended). Gear indicator, quick-shift/autoblipper standard. Common: carbon throttle body deposits at 40,000+ km — ultrasonic clean. Fuel: 16.5L.',
    },
  },
  {
    make:'BMW', model:'F 850 GS', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'853cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LMAR8AI-9', plugGap:'0.90mm',
      idleRpm:'1200 RPM', wotRpm:'8500 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'229', transType:'6-speed',
      notes:'Parallel twin adventure. 95 HP. Upside-down Marzocchi 43mm forks. Valve clearance: 40,000 km (shim-over-bucket). Oil: 3.5L 15W-50. Common: ABS module connector corrosion — dielectric grease at installation. Tubeless spoked rims available as option. Fuel: 15L. Chain: lube every 1000 km, replace ~20,000 km.',
    },
  },
  {
    make:'BMW', model:'R nineT', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1170cc', cylCount:'2',
      coolingType:'Air/Oil-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK SILMAR8A8', plugGap:'0.80mm',
      idleRpm:'1000 RPM', wotRpm:'7750 RPM',
      valveTrain:'OHV 4-valve',
      starterType:'Electric', weightKg:'222', transType:'6-speed',
      notes:'Air/oil-cooled boxer (pre-ShiftCam). 110 HP. Popular café/scrambler customisation base — engine exposed. No water jacket; relies on oil cooler. Oil: 3.5L 10W-40; change every 10,000 km. Shaft drive. Tele-Lever front. Valve clearance: 10,000 km (intake 0.10mm cold, exhaust 0.20mm cold). Common: spline wear on shaft final drive after 50,000 km if not greased at tyre changes.',
    },
  },
  {
    make:'BMW', model:'G 310 GS', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'313cc', cylCount:'1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK MAR10A-J (BMW 12 12 7 718 570)', plugGap:'0.90mm',
      idleRpm:'1200 RPM', wotRpm:'9500 RPM',
      valveTrain:'DOHC 4-valve',
      starterType:'Electric', weightKg:'170', transType:'6-speed',
      notes:'Entry ADV built by TVS in India for BMW. Reverse-cylinder layout (exhaust forward) for shorter wheelbase. 34 HP. Valve clearance: 12,000 km. Oil: 1.3L 10W-40. Common: clutch drag in cold temps below 5°C — normal, resolves when warm. ABS non-switchable on base variant. Fuel: 11L.',
    },
  },

  // ── DUCATI ────────────────────────────────────────────────────────────────
  {
    make:'Ducati', model:'Monster 937', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'937cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LMAR8AI-9', plugGap:'0.90mm',
      idleRpm:'1350 RPM', wotRpm:'9250 RPM',
      valveTrain:'Desmodromic DOHC 4-valve',
      starterType:'Electric', weightKg:'188', transType:'6-speed',
      notes:'Testastretta 11° DS engine. 111 HP. Desmodromic valve actuation — no valve springs; positive opening AND closing by cam. Service interval: 15,000 km (desmo valve service required — specialist job, 8+ hours labour). Desmo clearance: intake open 0.10–0.13mm, intake close 0.02–0.08mm, exhaust open 0.10–0.15mm, exhaust close 0.03–0.08mm. Oil: 3.5L 15W-50. Cornering ABS, Bosch IMU. Fuel: 14.5L. Common: throttle body balance causing judder at 3500–4500 RPM.',
    },
  },
  {
    make:'Ducati', model:'Panigale V4 S', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1103cc', cylCount:'4',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK IMR8ES-HG', plugGap:'0.80mm',
      idleRpm:'1350 RPM', wotRpm:'13000 RPM',
      valveTrain:'Desmodromic DOHC 4-valve',
      starterType:'Electric', weightKg:'198', transType:'6-speed',
      notes:'Desmosedici Stradale 90° V4 (GP-derived). 215 HP (214 HP for Euro5 cert). Öhlins smart EC-2 semi-active suspension, Brembo Stylema R calipers. Full electronics suite incl. Ducati Traction Control (DTC EVO), Wheelie Control (DWC EVO), Launch Control (DLC). Desmo service: 24,000 km — 6+ hours, multiple cam shims. Oil: 5.5L 10W-50. Fuel: 16L. Common: EBC (exhaust bypass control) valve seizing — cleans with throttle body spray.',
    },
  },
  {
    make:'Ducati', model:'Multistrada V4 S', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1158cc', cylCount:'4',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LMAR8AI-9', plugGap:'0.90mm',
      idleRpm:'1350 RPM', wotRpm:'10500 RPM',
      valveTrain:'Desmodromic DOHC 4-valve (cylinder deactivation on rear pair)',
      starterType:'Electric', weightKg:'243', transType:'6-speed',
      notes:'Adventure V4 with cylinder deactivation (rear 2 cylinders cut at low speed/light load to reduce heat to rider). Front radar ACC optional. Skyhook semi-active suspension. Desmo service: 60,000 km (detuned cam profile allows extended interval vs Panigale). Oil: 5.5L 10W-50. Fuel: 22L. Common: Radar module FOD (foreign object damage) from stone impacts — guard available.',
    },
  },
  {
    make:'Ducati', model:'Scrambler 800 Icon', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'803cc', cylCount:'2',
      coolingType:'Air/Oil-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LMAR8AI-9', plugGap:'0.90mm',
      idleRpm:'1350 RPM', wotRpm:'8250 RPM',
      valveTrain:'Desmodromic DOHC 4-valve',
      starterType:'Electric', weightKg:'189', transType:'6-speed',
      notes:'L-twin Desmodue 803. 73 HP. Entry-level Ducati with trellis frame. Desmo service: 15,000 km. Oil: 3.3L 15W-50. ABS switchable. Fuel: 13.5L. Popular scrambler/tracker base — common swaps: Continental TKC70 rubber, Arrow exhaust (fuelling remap needed). Steering damper recommended for off-road use. Common: LCD display glitching in extreme heat — dealer software update.',
    },
  },
  {
    make:'Ducati', model:'Hypermotard 950', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'937cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LMAR8AI-9', plugGap:'0.90mm',
      idleRpm:'1350 RPM', wotRpm:'9250 RPM',
      valveTrain:'Desmodromic DOHC 4-valve',
      starterType:'Electric', weightKg:'178', transType:'6-speed',
      notes:'Supermoto-inspired. High, wide bars; tall seat 870mm. 114 HP. Wheelie Control, Cornering ABS, Bosch IMU. Öhlins forks optional (SP model). Desmo service 15,000 km same as Monster 937. Common: throttle-body off-idle surge from factory lean map — TPS reset via Ducati Diagnostic Software resolves.',
    },
  },

  // ── INDIAN MOTORCYCLE ─────────────────────────────────────────────────────
  {
    make:'Indian', model:'Scout', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1133cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LMAR8AI-9', plugGap:'0.90mm',
      idleRpm:'1000 RPM', wotRpm:'8100 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'256', transType:'6-speed',
      notes:'Indian-designed liquid-cooled V-twin (not S&S). 100 HP. Thunderstroke is Indian\'s air-cooled range; Scout uses separate liquid-cooled architecture. Oil: 3.3L SAE 20W-40 (full synthetic). First service: 1600 km. Common: primary cover oil seep at gasket — re-torque bolts (24 Nm) before gasket replacement. Belt drive. Fuel: 12.7L.',
    },
  },
  {
    make:'Indian', model:'Scout Bobber', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1133cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LMAR8AI-9', plugGap:'0.90mm',
      idleRpm:'1000 RPM', wotRpm:'8100 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'253', transType:'6-speed',
      notes:'Blacked-out Scout variant. Lower seat (648mm), drag bars, solo saddle. Same powertrain as Scout. Peanut tank 12.7L. ABS standard (2020+). Dark finish parts require pH-neutral cleaners — chrome polish damages matte black coating.',
    },
  },
  {
    make:'Indian', model:'Chief Dark Horse', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1890cc', cylCount:'2',
      coolingType:'Air/Oil-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'Champion RS14YC', plugGap:'0.97mm',
      idleRpm:'950 RPM', wotRpm:'5200 RPM',
      valveTrain:'OHV pushrod 4-valve',
      starterType:'Electric', weightKg:'314', transType:'6-speed',
      notes:'Thunderstroke 116 (1890cc). 171 Nm torque. Air/oil-cooled V-twin with large oil cooler in downtube. Ride-by-wire. 3 riding modes. Common: pushrod seal weeping at 30,000+ km — normal oil mist, address only if >1 drop/day. Oil: 3.78L (4 qts) 20W-40. Belt tension: 9–12mm freeplay (cold). Fuel: 19.9L.',
    },
  },
  {
    make:'Indian', model:'Chieftain Limited', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1890cc', cylCount:'2',
      coolingType:'Air/Oil-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'Champion RS14YC', plugGap:'0.97mm',
      idleRpm:'950 RPM', wotRpm:'5200 RPM',
      valveTrain:'OHV pushrod 4-valve',
      starterType:'Electric', weightKg:'376', transType:'6-speed',
      notes:'Premium tourer. Thunderstroke 116. Power windscreen, Pathfinder LED headlight, Ride Command 7" touchscreen, Bluetooth audio. Hard bags + top case standard. Oil same as Chief. Common: Ride Command screen freezing in cold (below -5°C) — warm-up idle for 2 min before using display.',
    },
  },
  {
    make:'Indian', model:'Pursuit Dark Horse', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1890cc', cylCount:'2',
      coolingType:'Air/Oil-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'Champion RS14YC', plugGap:'0.97mm',
      idleRpm:'950 RPM', wotRpm:'5200 RPM',
      valveTrain:'OHV pushrod 4-valve',
      starterType:'Electric', weightKg:'391', transType:'6-speed',
      notes:'Bagger with factory fairing and hard bags. 26" (660mm) front wheel. Thunderstroke 116 + Power Modulator for acceleration/braking balance. Rear coilover. PowerBand Audio. Common: front-end shimmy at 80–100 km/h on rough roads — steering damper resolves (dealer-fit OEM part). Fuel: 22.7L.',
    },
  },

  // ── HONDA GOLD WING ───────────────────────────────────────────────────────
  {
    make:'Honda', model:'Gold Wing GL1800 DCT', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1833cc', cylCount:'6',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK IZFR6K11S (iridium)', plugGap:'1.00mm',
      idleRpm:'750 RPM', wotRpm:'5500 RPM',
      valveTrain:'SOHC 4-valve per cylinder',
      starterType:'Electric', weightKg:'390', transType:'7-speed DCT (or 6-speed manual)',
      notes:'Horizontally-opposed flat-6. 126 HP, 170 Nm. Dual Clutch Transmission on DCT variant (most sold). Touring mode / Sport mode / Walk mode (reverse assist). Air suspension rear, Showa electronic front. Oil: 4.9L 10W-30 (engine), ATF for DCT 1.3L. Service: 12,000 km valve clearance (intake 0.18–0.22mm, exhaust 0.27–0.31mm). Fuel: 21.1L. Common: DCT hesitation on cool start — normal until oil temp reaches 40°C. TPMS standard.',
    },
  },
  {
    make:'Honda', model:'Gold Wing Tour', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1833cc', cylCount:'6',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK IZFR6K11S', plugGap:'1.00mm',
      idleRpm:'750 RPM', wotRpm:'5500 RPM',
      valveTrain:'SOHC 4-valve per cylinder',
      starterType:'Electric', weightKg:'417', transType:'7-speed DCT',
      notes:'Full-touring variant with airbag system (Honda exclusive). 45L top case, 30L panniers. Apple CarPlay integrated. 6.5" TFT. Same engine/DCT service intervals as GL1800 base. Airbag replaces conventional handlebar/dash — if airbag deploys (crash), full airbag module + seatbelt pretensioner replacement needed.',
    },
  },

  // ── YAMAHA BIG BIKES ──────────────────────────────────────────────────────
  {
    make:'Yamaha', model:'MT-09', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'889cc', cylCount:'3',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.90mm',
      idleRpm:'1050 RPM', wotRpm:'10000 RPM',
      valveTrain:'DOHC 12-valve',
      starterType:'Electric', weightKg:'193', transType:'6-speed',
      notes:'CP3 crossplane triple. 119 HP (2021+). 3-axis IMU, slide control, lift control, front brake management. Quick-shift standard. Oil: 3.1L 10W-40. Valve clearance: 26,600 km (0.11–0.20mm intake, 0.16–0.25mm exhaust). Common: front-end chatter at low speed in traffic — TC too aggressive, reduce TC level in D-mode. Fuel: 14L.',
    },
  },
  {
    make:'Yamaha', model:'MT-10', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'998cc', cylCount:'4',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.90mm',
      idleRpm:'1050 RPM', wotRpm:'11500 RPM',
      valveTrain:'DOHC 16-valve',
      starterType:'Electric', weightKg:'212', transType:'6-speed',
      notes:'YZF-R1 engine in naked package. 166 HP. YCC-T ride-by-wire, 4 D-Mode settings, TCS, Quickshifter+ (up+down). Oil: 3.8L 10W-40. Valve clearance: 26,600 km. Common: chain wear accelerated by strong engine braking — use D2 mode for street, lube chain every 500 km. Fuel: 17L.',
    },
  },
  {
    make:'Yamaha', model:'XSR900', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'889cc', cylCount:'3',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.90mm',
      idleRpm:'1050 RPM', wotRpm:'10000 RPM',
      valveTrain:'DOHC 12-valve',
      starterType:'Electric', weightKg:'193', transType:'6-speed',
      notes:'Retro-styled MT-09 variant. Same CP3 engine. 119 HP. Round headlight, analogue-inspired TFT. Same valve clearance and service intervals as MT-09. Fuel: 13L.',
    },
  },
  {
    make:'Yamaha', model:'V-Star 950', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'942cc', cylCount:'2',
      coolingType:'Air-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR8EIB-9', plugGap:'0.90mm',
      idleRpm:'1100 RPM', wotRpm:'7000 RPM',
      valveTrain:'SOHC 8-valve',
      starterType:'Electric', weightKg:'252', transType:'5-speed',
      notes:'Star Motorcycles (Yamaha USA) midweight cruiser. 54 HP V-twin. Belt drive. Oil: 3.1L 10W-40. Valve clearance: 26,600 km. Common: fuel petcock screen clog from ethanol blends — clean at first 10,000 km. Low seat 690mm. Fuel: 15.1L.',
    },
  },

  // ── KAWASAKI BIG BIKES ────────────────────────────────────────────────────
  {
    make:'Kawasaki', model:'Ninja 650', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'649cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.70–0.80mm',
      idleRpm:'1100 RPM', wotRpm:'9000 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'192', transType:'6-speed',
      notes:'Friendly parallel twin. 67 HP. Assist & slipper clutch. 2 riding modes (Sport/Road). Oil: 2.2L 10W-40. Valve clearance: 24,000 km. Common: fuel pump whine from partially clogged strainer — flush tank at 30,000 km. Fuel: 15L.',
    },
  },
  {
    make:'Kawasaki', model:'Z900', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'948cc', cylCount:'4',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.70–0.80mm',
      idleRpm:'1100 RPM', wotRpm:'10000 RPM',
      valveTrain:'DOHC 16-valve',
      starterType:'Electric', weightKg:'212', transType:'6-speed',
      notes:'Naked supermoto-inspired 4-cylinder. 125 HP. Kawasaki Traction Control (KTRC), Kawasaki Cornering Management Function. Quick-shift optional. Oil: 3.4L 10W-40. Valve clearance: 24,000 km. Common: clutch basket rattle on light throttle — assist/slipper clutch requires specific lubricant; incorrect oil viscosity amplifies noise. Fuel: 17L.',
    },
  },
  {
    make:'Kawasaki', model:'ZX-10R', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'998cc', cylCount:'4',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.70–0.80mm',
      idleRpm:'1200 RPM', wotRpm:'14500 RPM',
      valveTrain:'DOHC 16-valve',
      starterType:'Electric', weightKg:'207', transType:'6-speed',
      notes:'Kawasaki superbike. 203 HP (2021+ spec). Showa BFF (Balance Free Front Fork), Unit Pro-Link rear. Öhlins electronic optional. 9-level KTRC, KLCM (launch), KEBC (engine brake). Quick-shift standard. Oil: 3.7L 10W-40; change every 12,000 km. Valve clearance: 36,000 km (race use: 12,000 km). Fuel: 17L. Common: overheating in track pit lane — race fan controller recommended.',
    },
  },
  {
    make:'Kawasaki', model:'Vulcan S', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'649cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.70–0.80mm',
      idleRpm:'1100 RPM', wotRpm:'7500 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'228', transType:'6-speed',
      notes:'Ergonomics-adjustable cruiser (Ergo-Fit). Handlebar reach, footpeg, seat all adjustable without tools. Ninja 650 engine. Belt drive. Oil: 2.2L 10W-40. Belt tension: 7–13mm deflection. Common: belt chirp from dust contamination — mild water rinse (no solvent/lubricant). Fuel: 14L.',
    },
  },

  // ── SUZUKI BIG BIKES ──────────────────────────────────────────────────────
  {
    make:'Suzuki', model:'GSX-S1000', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'999cc', cylCount:'4',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR9EIA-9', plugGap:'0.60–0.70mm',
      idleRpm:'1100 RPM', wotRpm:'12000 RPM',
      valveTrain:'DOHC 16-valve',
      starterType:'Electric', weightKg:'214', transType:'6-speed',
      notes:'GSX-R1000 derived engine (detuned). 150 HP. Suzuki Intelligent Ride System (S.I.R.S.): 3 power modes, STCS traction control, Suzuki Load Sensitive Rear suspension (non-electronic). Quick-shift available. Oil: 3.7L 10W-40. Valve clearance: 26,600 km. Common: STCS interference at smooth-road corner exit — set to level 2 for street use. Fuel: 19L.',
    },
  },
  {
    make:'Suzuki', model:'Boulevard M109R B.O.S.S.', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'1783cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK DCPR7E', plugGap:'0.80mm',
      idleRpm:'1000 RPM', wotRpm:'5500 RPM',
      valveTrain:'SOHC 4-valve',
      starterType:'Electric', weightKg:'347', transType:'5-speed',
      notes:'VZR1800 power cruiser. 140 Nm torque. 240mm rear tyre. Shaft drive. Fuel injection with dual throttle bodies. Oil: 4.5L 10W-40. Common: fuel injector deposits from E10 ethanol at 40,000 km — injector flush service. Shaft drive oil: 200 mL 90W hypoid, change every 12,000 km. Fuel: 19L.',
    },
  },
  {
    make:'Suzuki', model:'V-Strom 650', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'645cc', cylCount:'2',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK CR8EIA-9', plugGap:'0.80mm',
      idleRpm:'1200 RPM', wotRpm:'9000 RPM',
      valveTrain:'DOHC 8-valve',
      starterType:'Electric', weightKg:'213', transType:'6-speed',
      notes:'SV650-based V-twin ADV. 70 HP. Traction control. Adjustable wind screen. Oil: 2.5L 10W-40. Valve clearance: 26,600 km. Good chain life (~20,000 km) due to smooth power delivery. Common: false neutral between 5th–6th on cold gearbox — resolves after warm-up. Fuel: 20L.',
    },
  },

];

async function run() {
  const existingSlugs = await fetchExistingSlugs();
  const slice = limit < ENTRIES.length ? ENTRIES.slice(0, limit) : ENTRIES;
  const result = await batchInsert(slice, existingSlugs, { dryRun });
  console.log(`Seed-5 complete: ${result.inserted} inserted, ${result.skipped} skipped.`);
}

run().catch(e => { console.error(e); process.exit(1); });
