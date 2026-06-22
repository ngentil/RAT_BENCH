/**
 * Training-data seed 3 — Dirt bikes, MX, enduro, and trail bikes.
 * Honda CRF, Yamaha YZ/WR, KTM SX/EXC, Kawasaki KX, Suzuki RM/RMZ, Husqvarna MX.
 *
 * node scripts/wiki-import/training-data-seed-3.mjs
 * node scripts/wiki-import/training-data-seed-3.mjs --dry-run
 */

import { fetchExistingSlugs, batchInsert } from './_shared.mjs';

const args     = process.argv.slice(2);
const dryRun   = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit    = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

const SRC = 'RAT BENCH Training Seed';
const SUM = 'Seeded from manufacturer service manual data';

const ENTRIES = [

  // ── HONDA — CRF Series ────────────────────────────────────────────────────
  {
    make:'Honda', model:'CRF50F', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'49cc', boreDiameter:'39mm', crankStroke:'41.4mm',
      cylCount:'1', compressionRatio:'10.0:1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK CR5HSB', plugGap:'0.60–0.70mm',
      idleRpm:'1400 RPM', wotRpm:'9500 RPM',
      valveTrain:'OHC', transType:'3-speed semi-auto (no clutch lever)',
      starterType:'Kick-start',
      notes:'Beginner pit bike. Automatic clutch — no lever. 3-speed rotary shift. Oil: 0.5L SAE 10W-30. Valve clearance: Intake 0.05mm, Exhaust 0.08mm. Chain: 420 pitch. Rear sprocket: 37T. Common: valve clearance too tight causing hard start — check every 20 hrs on brand-new engines.',
    },
  },
  {
    make:'Honda', model:'CRF110F', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'109cc', boreDiameter:'50mm', crankStroke:'55.6mm',
      cylCount:'1', compressionRatio:'9.0:1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK CR7HSA', plugGap:'0.60–0.70mm',
      idleRpm:'1400 RPM',
      valveTrain:'OHC', transType:'4-speed semi-auto',
      starterType:'Electric + kick',
      notes:'Step up from CRF50. Automatic clutch, 4-speed. Oil: 0.8L. Valve clearance: Intake 0.08mm, Exhaust 0.10mm. Great first trail bike — very bulletproof engine.',
    },
  },
  {
    make:'Honda', model:'CRF125F', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'124cc', cylCount:'1',
      compressionRatio:'9.1:1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK CR8EH-9', plugGap:'0.90mm',
      idleRpm:'1400 RPM',
      valveTrain:'OHC', transType:'4-speed manual clutch',
      starterType:'Electric + kick',
      notes:'First Honda trail bike with a manual clutch — ideal step up. Oil: 0.9L. Chain: 428 pitch.',
    },
  },
  {
    make:'Honda', model:'CRF150F', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'149cc', cylCount:'1',
      compressionRatio:'9.5:1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK D7EA', plugGap:'0.60–0.70mm',
      idleRpm:'1400 RPM',
      valveTrain:'OHC', transType:'5-speed manual',
      starterType:'Electric + kick',
      notes:'Trail/enduro orientated. Wide ratio gearbox. Oil: 1.0L. Chain: 428 pitch. Very popular farm/property trail bike.',
    },
  },
  {
    make:'Honda', model:'CRF150R', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'149cc', boreDiameter:'66mm', crankStroke:'43.7mm',
      cylCount:'1', compressionRatio:'12.8:1',
      coolingType:'Liquid-cooled', fuelSystem:'Carburettor',
      plugType:'NGK CR9EH-9', plugGap:'0.90mm',
      wotRpm:'12000 RPM',
      valveTrain:'DOHC — 4 valves', transType:'5-speed manual',
      starterType:'Kick-start',
      notes:'Liquid-cooled race version. High compression — use 95+ RON. Valve clearance: Intake 0.10–0.15mm, Exhaust 0.20–0.25mm. Check every 15 hrs race use. Coolant: Honda Coolant 50:50. Chain: 420 pitch. Suspension: Showa 37mm USD forks.',
    },
  },
  {
    make:'Honda', model:'CRF230F', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'223cc', boreDiameter:'65.5mm', crankStroke:'66.2mm',
      cylCount:'1', compressionRatio:'8.8:1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK D8EA', plugGap:'0.60–0.70mm',
      idleRpm:'1400 RPM',
      valveTrain:'OHC — 2 valves', transType:'6-speed manual',
      starterType:'Kick-start',
      notes:'Long-running trail/farm bike (2003–2019). Air-cooled OHC single. Oil: 1.5L SAE 10W-30. Reliable and low-maintenance. Common: pilot jet clogging (idle circuit) from ethanol storage — run dry or use fuel stabiliser. Valve clearance: Intake 0.05mm, Exhaust 0.08mm. Great beginner adult bike.',
    },
  },
  {
    make:'Honda', model:'CRF250F', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'249cc', boreDiameter:'76.0mm', crankStroke:'54.9mm',
      cylCount:'1', compressionRatio:'10.8:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection (PGM-FI)',
      plugType:'NGK IZFR6K-11', plugGap:'1.0–1.1mm',
      idleRpm:'1400 RPM',
      valveTrain:'DOHC — 4 valves', transType:'6-speed manual',
      starterType:'Electric + kick',
      notes:'Modern liquid-cooled trail/enduro bike. PGM-FI EFI. Coolant capacity: 1.47L. Oil: 1.4L (with filter), 1.3L (without). Valve clearance: Intake 0.15–0.20mm, Exhaust 0.26–0.31mm. Check valves every 24 hrs. Gearbox oil separate: 0.7L. HRC enduro tuning available.',
    },
  },
  {
    make:'Honda', model:'CRF250R', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'249cc', boreDiameter:'76.8mm', crankStroke:'53.8mm',
      cylCount:'1', compressionRatio:'13.9:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection (44mm Keihin)',
      plugType:'NGK IZFR6K-11', plugGap:'0.80–0.90mm',
      wotRpm:'13500 RPM',
      valveTrain:'DOHC — 4 valves', transType:'5-speed manual',
      starterType:'Electric',
      notes:'MX racer. Very high compression — use 98+ RON. Valve clearance: Intake 0.10–0.15mm, Exhaust 0.16–0.21mm — check every 15 hrs race use. Coolant: 1.1L. Oil: 0.8L (engine) + 0.7L (gearbox, separated). Showa 49mm USD forks. Top speed in MX competition. Oil change every 5 hrs race use.',
    },
  },
  {
    make:'Honda', model:'CRF450R', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'449cc', boreDiameter:'96.0mm', crankStroke:'62.1mm',
      cylCount:'1', compressionRatio:'13.5:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection (46mm Keihin)',
      plugType:'NGK IZFR6K-11', plugGap:'0.80–0.90mm',
      wotRpm:'11000 RPM',
      valveTrain:'DOHC — 4 valves', transType:'5-speed manual',
      starterType:'Electric',
      notes:'Open-class MX racer. High-compression: 98+ RON only. Valve clearance: Intake 0.10–0.15mm, Exhaust 0.17–0.22mm — every 15 hrs. Coolant: 1.36L. Oil: 1.0L engine + 0.9L gearbox (separate). Showa 49mm USD. Launch Control (LC) and Holeshot Device (HSD) standard on recent models. Oil change every 3–5 hrs race use.',
    },
  },
  {
    make:'Honda', model:'CRF450RX', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'449cc', cylCount:'1',
      compressionRatio:'13.5:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK IZFR6K-11', plugGap:'0.80–0.90mm',
      valveTrain:'DOHC — 4 valves', transType:'6-speed manual',
      starterType:'Electric',
      notes:'Enduro version of CRF450R. Extra gear (6-speed vs 5), wider fuel tank, trail riding map, kickstand, headlight. Oil: 1.0L + 0.9L gearbox. Coolant: 1.48L.',
    },
  },

  // ── YAMAHA — YZ / WR Series ───────────────────────────────────────────────
  {
    make:'Yamaha', model:'YZ85', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'84.7cc', boreDiameter:'47.0mm', crankStroke:'48.6mm',
      cylCount:'1', coolingType:'Liquid-cooled',
      fuelSystem:'Carburettor (Mikuni TMX22)', mixRatio:'Pre-mix 32:1–40:1',
      plugType:'NGK BR9EG', plugGap:'0.50–0.60mm',
      wotRpm:'9500 RPM',
      transType:'6-speed manual', starterType:'Kick-start',
      notes:'Junior MX racer. Reed valve inducted. Coolant: 0.9L. Premix 32:1 with Yamalube 2R break-in, 40:1 normal. Power valve (YPVS): clean and free-actuate every 20 hrs — seized YPVS causes big mid-range hole. Top-end piston/ring: every 20–30 hrs race use.',
    },
  },
  {
    make:'Yamaha', model:'YZ125', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'124.7cc', boreDiameter:'54.0mm', crankStroke:'54.5mm',
      cylCount:'1', coolingType:'Liquid-cooled',
      fuelSystem:'Carburettor (Keihin PWK 38)', mixRatio:'Pre-mix 32:1–40:1',
      plugType:'NGK R6254K-105', plugGap:'1.05mm',
      wotRpm:'11500 RPM', transType:'6-speed manual', starterType:'Kick-start',
      notes:'Iconic 125cc 2-stroke MX bike. Reed valve, YPVS power valve. Coolant: 1.1L. Premix 32:1 (Yamalube 2R race) or 40:1 Yamaha 2-stroke. Piston/ring top-end: every 25–30 hrs. Crank rebuild: every 60–80 hrs. Re-jet for altitude (standard jetting sea level). KTM 125 SX closest rival — same class.',
    },
  },
  {
    make:'Yamaha', model:'YZ250F', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'249cc', boreDiameter:'77.0mm', crankStroke:'53.6mm',
      cylCount:'1', compressionRatio:'13.8:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection (Yamaha YCC-T)',
      plugType:'NGK LMAR8A-9', plugGap:'0.90mm',
      wotRpm:'13500 RPM', valveTrain:'DOHC — 4 valves',
      transType:'5-speed manual', starterType:'Electric + kick',
      notes:'250F MX racer. EFI. Very high compression — 98+ RON. Valve clearance: Intake 0.10–0.15mm, Exhaust 0.20–0.25mm — every 20 hrs race use. Coolant: 1.0L. Engine oil: 0.75L. Gearbox oil: 0.65L (separate). YCC-T throttle-by-wire. Power Tuner app for ECU mapping via Bluetooth.',
    },
  },
  {
    make:'Yamaha', model:'YZ450F', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'449cc', boreDiameter:'97.0mm', crankStroke:'60.8mm',
      cylCount:'1', compressionRatio:'12.8:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection (Yamaha)',
      plugType:'NGK LMAR8A-9', plugGap:'0.90mm',
      wotRpm:'11000 RPM', valveTrain:'DOHC — 4 valves',
      transType:'5-speed manual', starterType:'Electric',
      notes:'Open-class MX. Reverse-inclined engine layout (cylinder tilted backward) allows rearward weight bias for better balance. Valve clearance: every 15 hrs race use. Coolant: 1.0L. Engine oil: 0.95L. Power Tuner Bluetooth ECU mapping. Traction control standard on recent models.',
    },
  },
  {
    make:'Yamaha', model:'WR250F', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'249cc', boreDiameter:'77.0mm', crankStroke:'53.6mm',
      cylCount:'1', compressionRatio:'12.5:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LMAR8A-9', plugGap:'0.90mm',
      valveTrain:'DOHC — 4 valves', transType:'6-speed manual',
      starterType:'Electric + kick',
      notes:'Enduro version of YZ250F — detuned for tractability, 6-speed, wider tank, trail lighting, kickstand. CDI map switch for enduro vs WOT mode. Valve clearance: every 24 hrs. Coolant: 1.0L. Oil: 0.75L engine.',
    },
  },
  {
    make:'Yamaha', model:'WR450F', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'449cc', cylCount:'1',
      compressionRatio:'12.3:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LMAR8A-9', plugGap:'0.90mm',
      valveTrain:'DOHC — 4 valves', transType:'6-speed manual',
      starterType:'Electric + kick',
      notes:'Enduro 450. 6-speed, larger fuel tank than YZ450F. Softer suspension valving for trail use. Very popular ISDE and hard enduro machine.',
    },
  },

  // ── KTM — SX / EXC Series ────────────────────────────────────────────────
  {
    make:'KTM', model:'85 SX', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'84.9cc', boreDiameter:'47.0mm', crankStroke:'48.8mm',
      cylCount:'1', coolingType:'Liquid-cooled',
      fuelSystem:'Carburettor (Dellorto PHBH 28)', mixRatio:'Pre-mix 40:1–60:1',
      plugType:'NGK BR9EG', plugGap:'0.50–0.60mm',
      wotRpm:'10500 RPM', transType:'6-speed manual', starterType:'Kick-start',
      notes:'Junior MX 2-stroke. PPS (Power Progression System) pipe. Coolant: 0.7L. Premix 60:1 with KTM PowerPart 2T oil. Top-end (piston/ring): every 20–30 hrs race use. Crank seals: inspect every 50 hrs — leak causes lean bog.',
    },
  },
  {
    make:'KTM', model:'125 SX', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'124.8cc', boreDiameter:'54.0mm', crankStroke:'54.5mm',
      cylCount:'1', coolingType:'Liquid-cooled',
      fuelSystem:'Carburettor (Keihin PWK 38)', mixRatio:'Pre-mix 40:1–60:1',
      plugType:'NGK BR9EG', plugGap:'0.50–0.60mm',
      wotRpm:'11500 RPM', transType:'6-speed manual', starterType:'Kick-start',
      notes:'125cc 2-stroke MX — premier junior class. Coolant: 0.9L. Top-end: every 25 hrs. WP XACT 48mm USD forks. PHBG 28mm Dellorto carb. 2020+ models use Mikuni TMX38. Main jet: 172 (sea level), reduce 2 sizes per 1500m altitude.',
    },
  },
  {
    make:'KTM', model:'150 SX', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'143.9cc', boreDiameter:'56.0mm', crankStroke:'58.4mm',
      cylCount:'1', coolingType:'Liquid-cooled',
      fuelSystem:'Carburettor (Keihin PWK 38)', mixRatio:'Pre-mix 40:1–60:1',
      plugType:'NGK BR9EG', plugGap:'0.50–0.60mm',
      wotRpm:'11000 RPM', transType:'6-speed manual', starterType:'Kick-start',
      notes:'Oversize class 2-stroke. Bigger bore, longer stroke than 125. Same frame as 125 SX. Top-end: every 25–30 hrs. Best power-to-weight in 2-stroke class.',
    },
  },
  {
    make:'KTM', model:'250 SX', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'249.0cc', boreDiameter:'66.4mm', crankStroke:'72.0mm',
      cylCount:'1', coolingType:'Liquid-cooled',
      fuelSystem:'Carburettor (Keihin PWK 38 Sudco)', mixRatio:'Pre-mix 40:1–60:1',
      plugType:'NGK BR9EG', plugGap:'0.50–0.60mm',
      wotRpm:'9000 RPM', transType:'6-speed manual', starterType:'Kick-start',
      notes:'250cc 2-stroke MX. Massive mid-to-top power. Coolant: 1.1L. Top-end piston/ring: every 30 hrs race. Crank bearing and seals: every 80 hrs. Re-jet for altitude and temperature — very sensitive to jetting. Pipe resonance: stock expansion chamber tuned for mid-range.',
    },
  },
  {
    make:'KTM', model:'300 EXC TPI', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'293.2cc', boreDiameter:'72.0mm', crankStroke:'72.0mm',
      cylCount:'1', coolingType:'Liquid-cooled',
      fuelSystem:'KTM TPI (Transfer Port Injection — no premix required)',
      plugType:'NGK BR8EG', plugGap:'0.50–0.60mm',
      wotRpm:'8000 RPM', transType:'6-speed manual', starterType:'Kick-start',
      notes:'Transfer Port Injection 2-stroke — NO premix. Engine oil injected separately. Oil tank: 0.7L (KTM 2T Oil only). Very clean and tuneable — ECU maps via KTM My Tune app. Enduro spec. Coolant: 1.0L. No carburetor — uses injectors into transfer ports. Do NOT use premix — will result in oil overdose causing fouled plug/flooding.',
    },
  },
  {
    make:'KTM', model:'250 SX-F', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'249.9cc', boreDiameter:'78.0mm', crankStroke:'52.3mm',
      cylCount:'1', compressionRatio:'13.9:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection (Keihin EFI)',
      plugType:'NGK LKAR8A-9', plugGap:'0.90mm',
      wotRpm:'14000 RPM', valveTrain:'DOHC — 4 valves',
      transType:'5-speed manual', starterType:'Electric',
      notes:'250F MX racer. DOHC. Very high revving — peak power at 13,500+. Valve clearance: Intake 0.10–0.12mm, Exhaust 0.18–0.20mm — every 15 hrs race. Coolant: 0.9L. Oil: 0.75L (engine + gearbox shared). WP XACT 48mm forks. Lightweight — 98.5 kg ready to race.',
    },
  },
  {
    make:'KTM', model:'350 SX-F', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'349.7cc', boreDiameter:'87.0mm', crankStroke:'59.0mm',
      cylCount:'1', compressionRatio:'14.2:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LKAR8A-9', plugGap:'0.90mm',
      wotRpm:'12500 RPM', valveTrain:'DOHC — 4 valves',
      transType:'5-speed manual', starterType:'Electric',
      notes:'35-class — best of both worlds: 250F weight with near-450F power. Very popular MXGP weapon. Valve clearance every 15 hrs. Oil: 0.85L. Coolant: 1.0L. WP 48mm XACT forks.',
    },
  },
  {
    make:'KTM', model:'450 SX-F', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'449.3cc', boreDiameter:'95.0mm', crankStroke:'63.4mm',
      cylCount:'1', compressionRatio:'13.9:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LKAR8A-9', plugGap:'0.90mm',
      wotRpm:'11000 RPM', valveTrain:'DOHC — 4 valves',
      transType:'5-speed manual', starterType:'Electric',
      notes:'Open-class MX. Used by factory MXGP and AMA 450 teams. Valve clearance every 15 hrs race. Oil: 1.0L (shared engine/gearbox). Coolant: 1.2L. WP 48mm XACT. Launch control map standard. 100.5 kg — lightest 450F.',
    },
  },
  {
    make:'KTM', model:'500 EXC-F', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'510cc', cylCount:'1',
      compressionRatio:'12.0:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LKAR8A-9', plugGap:'0.90mm',
      valveTrain:'DOHC — 4 valves', transType:'6-speed manual',
      starterType:'Electric + kick',
      notes:'King of hard enduro and adventure off-road. 6-speed. Enduro map with broader power delivery. Valve clearance every 20 hrs. Oil: 1.1L. Tank: 8.5L. Road-legal in most markets. Used in Rally, Dakar (with modifications).',
    },
  },

  // ── KAWASAKI — KX Series ──────────────────────────────────────────────────
  {
    make:'Kawasaki', model:'KX65', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'64.9cc', boreDiameter:'44.0mm', crankStroke:'42.6mm',
      cylCount:'1', coolingType:'Liquid-cooled',
      fuelSystem:'Carburettor (Keihin PWK 28)', mixRatio:'Pre-mix 32:1',
      plugType:'NGK BR9ES', plugGap:'0.50–0.60mm',
      transType:'6-speed manual', starterType:'Kick-start',
      notes:'65cc class MX. Coolant: 0.7L. Top-end: every 20 hrs. Very close-ratio 6-speed. Reed valve. Power valve: KIPS (Kawasaki Integrated Powervalve System) — clean and lubricate every 40 hrs.',
    },
  },
  {
    make:'Kawasaki', model:'KX85', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'84.0cc', boreDiameter:'47.0mm', crankStroke:'48.5mm',
      cylCount:'1', coolingType:'Liquid-cooled',
      fuelSystem:'Carburettor (Keihin PWK 33)', mixRatio:'Pre-mix 32:1',
      plugType:'NGK BR9ES', plugGap:'0.50–0.60mm',
      wotRpm:'10500 RPM', transType:'6-speed manual', starterType:'Kick-start',
      notes:'85cc MX. KIPS power valve. Coolant: 0.8L. Top-end every 20–30 hrs. Big Wheel (BW) variant has larger wheels for taller riders.',
    },
  },
  {
    make:'Kawasaki', model:'KX250F', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'249cc', boreDiameter:'76.8mm', crankStroke:'53.8mm',
      cylCount:'1', compressionRatio:'14.3:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK SILMAR9A9', plugGap:'0.90mm',
      wotRpm:'14000 RPM', valveTrain:'DOHC — 4 valves',
      transType:'5-speed manual', starterType:'Electric',
      notes:'250F MX. Finger follower rocker design (lower friction). Valve clearance: every 15 hrs. Coolant: 0.98L. Oil: 0.8L. Showa 49mm USD forks. EFI map accessible via Kawasaki rideology app.',
    },
  },
  {
    make:'Kawasaki', model:'KX450', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'449cc', boreDiameter:'96.0mm', crankStroke:'62.1mm',
      cylCount:'1', compressionRatio:'13.4:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK SILMAR9A9', plugGap:'0.90mm',
      wotRpm:'11500 RPM', valveTrain:'DOHC — 4 valves',
      transType:'5-speed manual', starterType:'Electric',
      notes:'Open class MX. Launch control. Electric start with lithium battery option. Valve clearance every 15 hrs. Coolant: 1.0L. Oil: 1.0L. Showa 49mm USD.',
    },
  },

  // ── SUZUKI — RM / RMZ Series ──────────────────────────────────────────────
  {
    make:'Suzuki', model:'RM85', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'84.7cc', boreDiameter:'47.0mm', crankStroke:'48.8mm',
      cylCount:'1', coolingType:'Liquid-cooled',
      fuelSystem:'Carburettor (Mikuni TM28)', mixRatio:'Pre-mix 32:1',
      plugType:'NGK BR9ES', plugGap:'0.50–0.60mm',
      transType:'6-speed manual', starterType:'Kick-start',
      notes:'85cc MX racer. Exhaust valve (AERD — Automatic Exhaust Resonance Device). Coolant: 0.75L. Top-end every 20–30 hrs.',
    },
  },
  {
    make:'Suzuki', model:'RM-Z250', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'249cc', boreDiameter:'76.8mm', crankStroke:'53.8mm',
      cylCount:'1', compressionRatio:'13.8:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection (Keihin 44mm)',
      plugType:'NGK LMAR8A-9', plugGap:'0.90mm',
      wotRpm:'14000 RPM', valveTrain:'DOHC — 4 valves',
      transType:'5-speed manual', starterType:'Electric',
      notes:'250F MX. Fully flat slide fuel injection (no vacuum piston). Valve clearance: every 15 hrs. Coolant: 1.0L. Oil: 0.8L. Showa 49mm USD. Very smooth power. Works tuning: FI Commander for ECU mapping.',
    },
  },
  {
    make:'Suzuki', model:'RM-Z450', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'449cc', boreDiameter:'96.0mm', crankStroke:'62.1mm',
      cylCount:'1', compressionRatio:'12.8:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LMAR8A-9', plugGap:'0.90mm',
      wotRpm:'11000 RPM', valveTrain:'DOHC — 4 valves',
      transType:'5-speed manual', starterType:'Electric',
      notes:'Open class. Docile, predictable power delivery. Valve clearance every 15 hrs. Coolant: 1.1L. Oil: 0.95L. Showa 49mm.',
    },
  },

  // ── HUSQVARNA — MX / Enduro (KTM Platform) ───────────────────────────────
  {
    make:'Husqvarna', model:'TC125', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'124.8cc', boreDiameter:'54.0mm', crankStroke:'54.5mm',
      cylCount:'1', coolingType:'Liquid-cooled',
      fuelSystem:'Carburettor (Keihin PWK 38)', mixRatio:'Pre-mix 40:1–60:1',
      plugType:'NGK BR9EG', plugGap:'0.50–0.60mm',
      wotRpm:'11500 RPM', transType:'6-speed manual', starterType:'Kick-start',
      notes:'KTM 125 SX platform with Husqvarna styling. Shared engine, frame, and suspension. Top-end: every 25 hrs. Coolant: 0.9L.',
    },
  },
  {
    make:'Husqvarna', model:'FC250', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'249.9cc', boreDiameter:'78.0mm', crankStroke:'52.3mm',
      cylCount:'1', compressionRatio:'13.9:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LKAR8A-9', plugGap:'0.90mm',
      wotRpm:'14000 RPM', valveTrain:'DOHC — 4 valves',
      transType:'5-speed manual', starterType:'Electric',
      notes:'KTM 250 SX-F platform. Same engine specs. Husqvarna-specific mapping and ergonomics. Valve clearance every 15 hrs. Oil: 0.75L. Coolant: 0.9L.',
    },
  },
  {
    make:'Husqvarna', model:'FE350', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'349.7cc', boreDiameter:'87.0mm', crankStroke:'59.0mm',
      cylCount:'1', compressionRatio:'14.2:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LKAR8A-9', plugGap:'0.90mm',
      valveTrain:'DOHC — 4 valves', transType:'6-speed manual',
      starterType:'Electric + kick',
      notes:'KTM 350 EXC-F platform. Enduro spec with 6-speed, trail map, lighting, kickstand. Valve clearance every 20 hrs. Oil: 0.85L.',
    },
  },

  // ── BETA — 2-Stroke Enduro ────────────────────────────────────────────────
  {
    make:'Beta', model:'RR 300', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'293cc', boreDiameter:'72.0mm', crankStroke:'72.0mm',
      cylCount:'1', coolingType:'Liquid-cooled',
      fuelSystem:'Carburettor (Keihin PWK 36)', mixRatio:'Pre-mix 50:1–80:1',
      plugType:'NGK BR8EG', plugGap:'0.50–0.60mm',
      transType:'6-speed manual', starterType:'Kick-start',
      notes:'Italian-made enduro 2-stroke. Very popular hard enduro and WESS competition. Reed valve. Power valve. Coolant: 0.9L. Carb very sensitive to needle position — start at 3rd from top, adjust 1 clip at a time. Top-end: every 30–40 hrs enduro use.',
    },
  },

  // ── GAS GAS — (KTM Group) ─────────────────────────────────────────────────
  {
    make:'GASGAS', model:'MC 125', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'124.8cc', cylCount:'1',
      coolingType:'Liquid-cooled', fuelSystem:'Carburettor',
      mixRatio:'Pre-mix 40:1–60:1',
      plugType:'NGK BR9EG', plugGap:'0.50–0.60mm',
      transType:'6-speed manual', starterType:'Kick-start',
      notes:'KTM 125 SX platform (KTM acquired GasGas 2021). Identical engine to KTM 125 SX and Husqvarna TC125. GASGAS-specific livery and minor ergonomic differences only.',
    },
  },
  {
    make:'GASGAS', model:'EC 300', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'293cc', cylCount:'1',
      coolingType:'Liquid-cooled', fuelSystem:'Carburettor',
      mixRatio:'Pre-mix 40:1–60:1',
      plugType:'NGK BR8EG', plugGap:'0.50–0.60mm',
      transType:'6-speed manual', starterType:'Kick-start',
      notes:'KTM 300 EXC platform. Non-TPI version (carb) — premix required. Enduro spec.',
    },
  },

  // ── SHERCO — Trials / Enduro ──────────────────────────────────────────────
  {
    make:'Sherco', model:'300 SE-R', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'2-stroke', ccSize:'293cc', boreDiameter:'72.0mm', crankStroke:'72.0mm',
      cylCount:'1', coolingType:'Liquid-cooled',
      fuelSystem:'Carburettor (Keihin PWK)', mixRatio:'Pre-mix 50:1',
      plugType:'NGK BR8EG', plugGap:'0.50–0.60mm',
      transType:'6-speed manual', starterType:'Kick-start',
      notes:'Spanish enduro 2-stroke. Hydraulic clutch. Very popular XC and enduro racing machine. Top-end: every 30 hrs. Reed valve.',
    },
  },

  // ── YAMAHA — TTR Trail Series ─────────────────────────────────────────────
  {
    make:'Yamaha', model:'TT-R50E', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'49cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK CR5HSB', plugGap:'0.60–0.70mm',
      transType:'3-speed automatic clutch', starterType:'Electric + kick',
      notes:'Entry-level Yamaha trail bike. Semi-auto 3-speed. Oil: 0.5L. Very similar to Honda CRF50. Popular pit bike for beginners.',
    },
  },
  {
    make:'Yamaha', model:'TT-R125LE', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'124cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK CR7HSA', plugGap:'0.60–0.70mm',
      idleRpm:'1400 RPM',
      valveTrain:'OHC', transType:'5-speed manual',
      starterType:'Electric + kick',
      notes:'Trail/farm junior bike. SOHC air-cooled. Oil: 1.0L. Very durable. Popular farm bike. E = electric start, L = larger 21/18 in wheels vs standard 19/16.',
    },
  },

  // ── HONDA — Trail / Farm ───────────────────────────────────────────────────
  {
    make:'Honda', model:'XR100R', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'99cc', cylCount:'1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor',
      plugType:'NGK D7EA', plugGap:'0.60–0.70mm',
      valveTrain:'OHC', transType:'5-speed manual', starterType:'Kick-start',
      notes:'Classic 80s–90s trail bike (discontinued ~2003). Very common repair shop item. Oil: 0.9L. SOHC. Parts still widely available aftermarket. Valve clearance: Intake 0.05mm, Exhaust 0.08mm.',
    },
  },
  {
    make:'Honda', model:'XR650L', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'644cc', boreDiameter:'100mm', crankStroke:'82mm',
      cylCount:'1', compressionRatio:'8.3:1',
      coolingType:'Air-cooled', fuelSystem:'Carburettor (Keihin PD)',
      plugType:'NGK DR8ES-L', plugGap:'0.60–0.70mm',
      idleRpm:'1200 RPM',
      valveTrain:'OHC — RFVC (Radial Four-Valve Combustion)', transType:'5-speed manual',
      starterType:'Electric + kick',
      notes:'Long-running dual-sport (1993–present). RFVC 4-valve single. Low compression for mid-range torque. Oil: 2.3L. Chain: 520. HUGE aftermarket — most popular uncorked for carb re-jet (stock jetting very lean for US emissions). Pilot jet: stock 45, upgrade to 55; main: stock 152, upgrade to 158. Remove grey wire from stator for better ignition advance.',
    },
  },
  {
    make:'Honda', model:'CRF300L', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'286cc', boreDiameter:'76mm', crankStroke:'63mm',
      cylCount:'1', compressionRatio:'10.7:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection (PGM-FI)',
      plugType:'NGK IZFR6K11', plugGap:'1.0–1.1mm',
      idleRpm:'1400 RPM',
      valveTrain:'OHC — 4 valves', transType:'6-speed manual',
      starterType:'Electric',
      notes:'Modern dual-sport. Replaced CRF250L in 2021. Liquid-cooled EFI. Oil: 1.5L. Coolant: 1.15L. ABS optional. Very popular adventure/trail bike for beginners and commuters. LAMS eligible in Australia.',
    },
  },

  // ── HUSQVARNA — Norden / Vitpilen / Svartpilen ───────────────────────────
  {
    make:'Husqvarna', model:'Svartpilen 401', type:'Motorcycle', source:SRC, editSummary:SUM,
    specData:{
      strokeType:'4-stroke', ccSize:'373cc', boreDiameter:'89mm', crankStroke:'60mm',
      cylCount:'1', compressionRatio:'12.6:1',
      coolingType:'Liquid-cooled', fuelSystem:'Electronic Fuel Injection',
      plugType:'NGK LMAR7A-9', plugGap:'0.90mm',
      idleRpm:'1400 RPM', wotRpm:'9000 RPM',
      valveTrain:'DOHC — 4 valves', transType:'6-speed manual',
      starterType:'Electric',
      notes:'KTM 390 Duke platform. Scrambler/tracker styling. Oil: 1.7L. Coolant: 1.6L. WP APEX forks. LAMS eligible.',
    },
  },
];

async function run() {
  console.log(`\n🏍️   Dirt Bike & MX Seed${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`    ${ENTRIES.length} entries`);

  const slice = ENTRIES.slice(0, limit);

  console.log('\nFetching existing wiki slugs…');
  const existingSlugs = await fetchExistingSlugs();
  console.log(`  ${existingSlugs.size} entries already in wiki\n`);

  const result = await batchInsert(slice, existingSlugs, { dryRun });
  console.log(`\n✅  Done: ${result.inserted} inserted, ${result.skipped} skipped\n`);
}

run().catch(e => { console.error(e); process.exit(1); });
