-- ============================================================
-- Rat Bench Wiki — master content seed (popular workbench engines & machines).
-- Run in Supabase SQL Editor. Enrich-or-create per slug: adds a detailed
-- revision to an existing entry or creates it. Safe to re-run (adds another
-- revision and re-points current_rev_id). New batches are appended below.
-- ============================================================

-- ═══ from wiki_seed_klr650_dr650.sql ═══
DO $$
DECLARE
  v_admin uuid;
  v_entry uuid;
  v_rev   uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com')
    ORDER BY email LIMIT 1;

  -- ── Kawasaki KLR650 ────────────────────────────────────────────────────────
  SELECT id INTO v_entry FROM wiki_entries WHERE slug = 'kawasaki-klr650';
  IF v_entry IS NULL THEN
    INSERT INTO wiki_entries (slug, make, model, type, created_by)
    VALUES ('kawasaki-klr650','Kawasaki','KLR650','Motorcycle', v_admin)
    RETURNING id INTO v_entry;
  END IF;

  INSERT INTO wiki_revisions (entry_id, edited_by, username, edit_summary, data)
  VALUES (v_entry, v_admin, 'Rat Bench', 'Detailed spec import (Gen 2, 2008–2018)',
  $klr$
  {
    "year": "2008–2018 (Gen 2)",
    "strokeType": "4-Stroke",
    "ccSize": "651",
    "compressionRatio": "9.8:1",
    "cylCount": "1",
    "valveTrain": "DOHC",
    "camType": "DOHC — 4 valves",
    "intakeValveClear": "0.15–0.20 mm (cold)",
    "exhaustValveClear": "0.20–0.25 mm (cold)",
    "plugType": "NGK CR9E",
    "plugGap": "0.7",
    "coilType": "Digital DC-CDI",
    "starterType": "Electric / key start only",
    "fuelSystem": "Carburetted",
    "fuelTankCapacity": "23",
    "coolingType": "Liquid cooled",
    "coolantType": "50/50 ethylene glycol",
    "coolantCapacity": "1.35",
    "boreDiameter": "100.0",
    "crankStroke": "83.0",
    "pistonDiameter": "100.0",
    "idleRpm": "1300",
    "wotRpm": "7500",
    "driveType": "Chain",
    "transType": "Manual",
    "clutchType": "Multi-plate wet",
    "finalDriveType": "520 chain",
    "finalDriveRatio": "15/43",
    "forkType": "Telescopic fork",
    "forkDiameter": "41",
    "forkTravel": "200",
    "rearShockType": "Uni-Trak monoshock",
    "rearTravel": "185",
    "frontBrakeType": "Single 280 mm disc, 2-piston caliper",
    "rearBrakeType": "240 mm disc, 1-piston",
    "tyreSizeFront": "90/90-21",
    "tyreSizeRear": "130/80-17",
    "wotPower": "42 hp (31 kW) @ 6,500 rpm",
    "torqueNm": "50",
    "topSpeed": "~160 km/h (100 mph)",
    "frameType": "Semi-double-cradle, high-tensile steel",
    "wheelbaseMm": "1480",
    "seatHeightMm": "890",
    "groundClearanceMm": "210",
    "weightKg": "196 (wet / curb)",
    "notes": "Kawasaki KLR650 Gen 2 (2008–2018) — the iconic budget dual-sport. Keihin CVK40 carburetor. Engine oil 10W-40, ~2.6 L with filter; oil & filter every ~10,000 km, valve check every ~19,000 km. Well-known weak point: the balancer-chain tensioner lever (the doohickey) — a cheap, popular upgrade to a spring-loaded aftermarket part. Gearing shown is stock 15T front / 43T rear. Verify clearances against the factory service manual before wrenching."
  }
  $klr$::jsonb)
  RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id = v_rev WHERE id = v_entry;

  -- ── Suzuki DR650SE ─────────────────────────────────────────────────────────
  SELECT id INTO v_entry FROM wiki_entries WHERE slug = 'suzuki-dr650';
  IF v_entry IS NULL THEN
    INSERT INTO wiki_entries (slug, make, model, type, created_by)
    VALUES ('suzuki-dr650','Suzuki','DR650','Motorcycle', v_admin)
    RETURNING id INTO v_entry;
  END IF;

  INSERT INTO wiki_revisions (entry_id, edited_by, username, edit_summary, data)
  VALUES (v_entry, v_admin, 'Rat Bench', 'Detailed spec import (DR650SE)',
  $dr$
  {
    "year": "1996–present (DR650SE)",
    "strokeType": "4-Stroke",
    "ccSize": "644",
    "compressionRatio": "9.5:1",
    "cylCount": "1",
    "valveTrain": "OHC",
    "camType": "OHC — 4 valves",
    "intakeValveClear": "0.10–0.15 mm (cold)",
    "exhaustValveClear": "0.20–0.25 mm (cold)",
    "plugType": "NGK DPR8EA-9",
    "plugGap": "0.8–0.9",
    "coilType": "Electronic CDI",
    "starterType": "Electric / key start only",
    "fuelSystem": "Carburetted",
    "fuelTankCapacity": "13",
    "coolingType": "Air cooled",
    "boreDiameter": "100.0",
    "crankStroke": "82.0",
    "pistonDiameter": "100.0",
    "idleRpm": "1400",
    "wotRpm": "7500",
    "driveType": "Chain",
    "transType": "Manual",
    "clutchType": "Multi-plate wet",
    "finalDriveType": "520 chain",
    "finalDriveRatio": "15/41",
    "forkType": "Telescopic fork",
    "forkDiameter": "43",
    "forkTravel": "260",
    "rearShockType": "Link-type monoshock",
    "rearTravel": "260",
    "frontBrakeType": "Single 290 mm disc, 2-piston caliper",
    "rearBrakeType": "240 mm disc, 1-piston",
    "tyreSizeFront": "90/90-21",
    "tyreSizeRear": "120/90-17",
    "wotPower": "43 hp (32 kW) @ 6,400 rpm",
    "torqueNm": "49",
    "topSpeed": "~160 km/h (100 mph)",
    "frameType": "Semi-double-cradle, steel",
    "wheelbaseMm": "1490",
    "seatHeightMm": "885",
    "groundClearanceMm": "265",
    "weightKg": "166 (wet / curb)",
    "notes": "Suzuki DR650SE (1996–present) — air/oil-cooled (Suzuki SACS) SOHC single, legendary reliability and a huge aftermarket. Mikuni BST40 CV carburetor (common upgrade: rejet / needle). Engine oil 10W-40, ~2.4 L with filter; valve check ~every 15,000 km. Seat height lowers to ~845 mm via the adjustable dog-bone linkage / lowering kit. Gearing shown is stock 15T front / 41T rear; many run 15/42 or a 14T front off-road. Listed as air-cooled (technically air/oil-cooled SACS). Verify clearances against the factory service manual."
  }
  $dr$::jsonb)
  RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id = v_rev WHERE id = v_entry;

  RAISE NOTICE 'KLR650 + DR650 wiki specs imported.';
END $$;


-- ═══ from wiki_seed_dualsport_batch.sql ═══
DO $$
DECLARE
  v_admin uuid;
  v_entry uuid;
  v_rev   uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com')
    ORDER BY email LIMIT 1;

  -- ── Suzuki DR-Z400 (S / SM) ────────────────────────────────────────────────
  SELECT id INTO v_entry FROM wiki_entries WHERE slug = 'suzuki-dr-z400';
  IF v_entry IS NULL THEN
    INSERT INTO wiki_entries (slug, make, model, type, created_by)
    VALUES ('suzuki-dr-z400','Suzuki','DR-Z400','Motorcycle', v_admin) RETURNING id INTO v_entry;
  END IF;
  INSERT INTO wiki_revisions (entry_id, edited_by, username, edit_summary, data)
  VALUES (v_entry, v_admin, 'Rat Bench', 'Detailed spec import (DR-Z400 S/SM)', $drz$
  {
    "year": "2000–present (DR-Z400S / SM)", "strokeType": "4-Stroke", "ccSize": "398",
    "compressionRatio": "11.3:1", "cylCount": "1", "valveTrain": "DOHC", "camType": "DOHC — 4 valves",
    "intakeValveClear": "0.10–0.20 mm (cold)", "exhaustValveClear": "0.20–0.30 mm (cold)",
    "plugType": "NGK CR8E", "plugGap": "0.7", "coilType": "Electronic CDI",
    "starterType": "Electric / key start only", "fuelSystem": "Carburetted", "fuelTankCapacity": "10",
    "coolingType": "Liquid cooled", "coolantCapacity": "1.1", "boreDiameter": "90.0",
    "crankStroke": "62.6", "pistonDiameter": "90.0", "idleRpm": "1500", "wotRpm": "10500",
    "driveType": "Chain", "transType": "Manual", "clutchType": "Multi-plate wet",
    "finalDriveType": "520 chain", "finalDriveRatio": "15/44 (S) · 15/41 (SM)",
    "forkType": "USD (SM) / Telescopic (S)", "forkDiameter": "49", "forkTravel": "288 (S) / 260 (SM)",
    "rearShockType": "Link-type monoshock", "rearTravel": "296 (S) / 276 (SM)",
    "frontBrakeType": "250 mm disc (S) / 300 mm 4-piston (SM)", "rearBrakeType": "220 mm disc",
    "tyreSizeFront": "80/100-21 (S) / 120/70-17 (SM)", "tyreSizeRear": "120/90-18 (S) / 140/70-17 (SM)",
    "wotPower": "~40 hp (29 kW) @ 8,500 rpm", "torqueNm": "39", "topSpeed": "~145 km/h (90 mph)",
    "frameType": "Semi-double-cradle, steel", "wheelbaseMm": "1485 (S) / 1460 (SM)",
    "seatHeightMm": "935 (S) / 890 (SM)", "groundClearanceMm": "300 (S) / 260 (SM)",
    "weightKg": "144 (S, wet) / 146 (SM, wet)",
    "notes": "Suzuki DR-Z400 — DOHC liquid-cooled thumper. Covers the street-legal DR-Z400S (dual-sport) and DR-Z400SM (supermoto); the DR-Z400E is the closed-course version (kickstart, hotter cam, 12.2:1). Mikuni BSR36 CV carb — the JD jet kit + '3x3' airbox mod is the classic upgrade. Oil 10W-40, ~1.7 L with filter. Verify clearances against the service manual."
  } $drz$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id = v_rev WHERE id = v_entry;

  -- ── Yamaha TW200 ───────────────────────────────────────────────────────────
  SELECT id INTO v_entry FROM wiki_entries WHERE slug = 'yamaha-tw200';
  IF v_entry IS NULL THEN
    INSERT INTO wiki_entries (slug, make, model, type, created_by)
    VALUES ('yamaha-tw200','Yamaha','TW200','Motorcycle', v_admin) RETURNING id INTO v_entry;
  END IF;
  INSERT INTO wiki_revisions (entry_id, edited_by, username, edit_summary, data)
  VALUES (v_entry, v_admin, 'Rat Bench', 'Detailed spec import (TW200)', $tw$
  {
    "year": "1987–present", "strokeType": "4-Stroke", "ccSize": "196", "compressionRatio": "9.5:1",
    "cylCount": "1", "valveTrain": "SOHC", "camType": "SOHC — 2 valves",
    "intakeValveClear": "0.05–0.09 mm (cold)", "exhaustValveClear": "0.11–0.15 mm (cold)",
    "plugType": "NGK DR8EA", "plugGap": "0.6–0.7", "coilType": "CDI (TCI)",
    "starterType": "Electric + kick", "fuelSystem": "Carburetted", "fuelTankCapacity": "7.0",
    "coolingType": "Air cooled", "boreDiameter": "67.0", "crankStroke": "55.7", "pistonDiameter": "67.0",
    "idleRpm": "1400", "driveType": "Chain", "transType": "Manual", "clutchType": "Multi-plate wet",
    "finalDriveType": "428 chain", "finalDriveRatio": "14/50", "forkType": "Telescopic fork",
    "forkTravel": "160", "rearShockType": "Monoshock (swingarm)", "rearTravel": "150",
    "frontBrakeType": "220 mm disc", "rearBrakeType": "Drum", "tyreSizeFront": "130/80-18",
    "tyreSizeRear": "180/80-14", "wotPower": "~16 hp (12 kW) @ 8,000 rpm", "torqueNm": "15.5",
    "topSpeed": "~110 km/h (68 mph)", "frameType": "Single-cradle, steel", "wheelbaseMm": "1330",
    "seatHeightMm": "790", "groundClearanceMm": "265", "weightKg": "127 (wet)",
    "notes": "Yamaha TW200 — air-cooled 2-valve single on distinctive fat balloon tyres (rear 180/80-14). Utterly simple and reliable; a trail/dual-sport favourite. Mikuni carburetor, oil ~1.3 L. Gearing 14T/50T on 428 chain. Verify valve clearances against the service manual."
  } $tw$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id = v_rev WHERE id = v_entry;

  -- ── Yamaha WR450F ──────────────────────────────────────────────────────────
  SELECT id INTO v_entry FROM wiki_entries WHERE slug = 'yamaha-wr450f';
  IF v_entry IS NULL THEN
    INSERT INTO wiki_entries (slug, make, model, type, created_by)
    VALUES ('yamaha-wr450f','Yamaha','WR450F','Motorcycle', v_admin) RETURNING id INTO v_entry;
  END IF;
  INSERT INTO wiki_revisions (entry_id, edited_by, username, edit_summary, data)
  VALUES (v_entry, v_admin, 'Rat Bench', 'Detailed spec import (WR450F, 2019+)', $wr$
  {
    "year": "2019–present (4-valve, EFI, e-start)", "strokeType": "4-Stroke", "ccSize": "449",
    "compressionRatio": "12.0:1", "cylCount": "1", "valveTrain": "DOHC", "camType": "DOHC — 4 valves (Ti)",
    "intakeValveClear": "0.10–0.15 mm (cold)", "exhaustValveClear": "0.17–0.22 mm (cold)",
    "plugType": "NGK CPR8EB-9", "plugGap": "0.8", "coilType": "TCI (digital)",
    "starterType": "Electric / key start only", "fuelSystem": "Fuel injection", "fuelTankCapacity": "7.9",
    "coolingType": "Liquid cooled", "boreDiameter": "97.0", "crankStroke": "60.8", "pistonDiameter": "97.0",
    "driveType": "Chain", "transType": "Manual", "clutchType": "Multi-plate wet",
    "finalDriveType": "520 chain", "finalDriveRatio": "13/50", "forkType": "USD (KYB 48 mm)",
    "forkDiameter": "48", "forkTravel": "310", "rearShockType": "Monoshock (KYB)", "rearTravel": "317",
    "frontBrakeType": "270 mm disc, hydraulic", "rearBrakeType": "245 mm disc", "tyreSizeFront": "90/90-21",
    "tyreSizeRear": "120/90-18", "wotPower": "~58 hp (est. — not published)", "torqueNm": "49 (est.)",
    "topSpeed": "~150 km/h (93 mph)", "frameType": "Aluminium bilateral beam", "wheelbaseMm": "1480",
    "seatHeightMm": "955", "groundClearanceMm": "320", "weightKg": "119 (wet)",
    "notes": "Yamaha WR450F — competition enduro. Reverse-cylinder DOHC 4-valve since the 2019 redesign (2003–2006 were 5-valve; 2012+ 4-valve), EFI + electric start. Yamaha doesn't publish crank hp; ~58 hp is an enthusiast estimate. Race-oriented service intervals — check valves/oil often. Verify clearances against the manual."
  } $wr$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id = v_rev WHERE id = v_entry;

  -- ── BMW F650 (Funduro/Strada) ──────────────────────────────────────────────
  SELECT id INTO v_entry FROM wiki_entries WHERE slug = 'bmw-f650';
  IF v_entry IS NULL THEN
    INSERT INTO wiki_entries (slug, make, model, type, created_by)
    VALUES ('bmw-f650','BMW','F650','Motorcycle', v_admin) RETURNING id INTO v_entry;
  END IF;
  INSERT INTO wiki_revisions (entry_id, edited_by, username, edit_summary, data)
  VALUES (v_entry, v_admin, 'Rat Bench', 'Detailed spec import (F650 Funduro)', $f650$
  {
    "year": "1993–2000 (F650 Funduro / Strada)", "strokeType": "4-Stroke", "ccSize": "652",
    "compressionRatio": "9.7:1", "cylCount": "1", "valveTrain": "DOHC", "camType": "DOHC — 4 valves",
    "intakeValveClear": "0.10–0.15 mm (cold)", "exhaustValveClear": "0.20–0.25 mm (cold)",
    "plugType": "NGK DPR8EA-9", "plugGap": "0.9", "coilType": "Electronic",
    "starterType": "Electric / key start only", "fuelSystem": "Carburetted", "fuelTankCapacity": "17.5",
    "coolingType": "Liquid cooled", "boreDiameter": "100.0", "crankStroke": "83.0", "pistonDiameter": "100.0",
    "driveType": "Chain", "transType": "Manual", "clutchType": "Multi-plate wet",
    "finalDriveType": "525 chain", "forkType": "Telescopic fork", "forkDiameter": "41", "forkTravel": "170",
    "rearShockType": "Monoshock (Monolever)", "rearTravel": "165", "frontBrakeType": "300 mm disc, 2-piston",
    "rearBrakeType": "240 mm disc", "tyreSizeFront": "100/90-19", "tyreSizeRear": "130/80-17",
    "wotPower": "48 hp (35 kW) @ 6,500 rpm", "torqueNm": "57", "topSpeed": "~165 km/h (103 mph)",
    "frameType": "Steel bridge / tubular", "wheelbaseMm": "1480", "seatHeightMm": "810", "weightKg": "191 (wet)",
    "notes": "BMW F650 Funduro/Strada (1993–2000) — Rotax-built 652 cc liquid-cooled DOHC single, assembled by Aprilia. Twin Mikuni BST33 CV carbs. Shares the 100×83 mm bore/stroke with the later F650GS/G650 (and, coincidentally, the KLR650/DR650). Chain final drive. Verify clearances against the service manual."
  } $f650$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id = v_rev WHERE id = v_entry;

  -- ── BMW F650GS (single, 2000–2007) ─────────────────────────────────────────
  SELECT id INTO v_entry FROM wiki_entries WHERE slug = 'bmw-f650gs';
  IF v_entry IS NULL THEN
    INSERT INTO wiki_entries (slug, make, model, type, created_by)
    VALUES ('bmw-f650gs','BMW','F650GS','Motorcycle', v_admin) RETURNING id INTO v_entry;
  END IF;
  INSERT INTO wiki_revisions (entry_id, edited_by, username, edit_summary, data)
  VALUES (v_entry, v_admin, 'Rat Bench', 'Detailed spec import (F650GS single)', $f650gs$
  {
    "year": "2000–2007 (single-cylinder)", "strokeType": "4-Stroke", "ccSize": "652",
    "compressionRatio": "11.5:1", "cylCount": "1", "valveTrain": "DOHC", "camType": "DOHC — 4 valves",
    "intakeValveClear": "0.10–0.15 mm (cold)", "exhaustValveClear": "0.20–0.25 mm (cold)",
    "plugType": "NGK DPR8EA-9 (twin-plug head)", "plugGap": "0.9", "coilType": "BMS-C EFI",
    "starterType": "Electric / key start only", "fuelSystem": "Fuel injection", "fuelTankCapacity": "17.3",
    "coolingType": "Liquid cooled", "boreDiameter": "100.0", "crankStroke": "83.0", "pistonDiameter": "100.0",
    "driveType": "Chain", "transType": "Manual", "clutchType": "Multi-plate wet", "finalDriveType": "525 chain",
    "forkType": "Telescopic fork", "forkDiameter": "41", "forkTravel": "170", "rearShockType": "Monoshock",
    "rearTravel": "165", "frontBrakeType": "300 mm disc, 2-piston (ABS optional)", "rearBrakeType": "240 mm disc",
    "tyreSizeFront": "100/90-19", "tyreSizeRear": "130/80-17", "wotPower": "50 hp (37 kW) @ 6,800 rpm",
    "torqueNm": "60", "topSpeed": "~170 km/h (106 mph)", "frameType": "Steel bridge", "wheelbaseMm": "1479",
    "seatHeightMm": "780", "weightKg": "192 (wet)",
    "notes": "BMW F650GS single-cylinder (2000–2007) — fuel-injected (BMS-C), twin-spark 652 cc Rotax single. NOTE: the 2008+ 'F650GS' is actually a 798 cc parallel twin — a different bike. Chain final drive; optional ABS. Verify clearances against the service manual."
  } $f650gs$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id = v_rev WHERE id = v_entry;

  -- ── BMW G650GS (2009–2016) ─────────────────────────────────────────────────
  SELECT id INTO v_entry FROM wiki_entries WHERE slug = 'bmw-g650gs';
  IF v_entry IS NULL THEN
    INSERT INTO wiki_entries (slug, make, model, type, created_by)
    VALUES ('bmw-g650gs','BMW','G650GS','Motorcycle', v_admin) RETURNING id INTO v_entry;
  END IF;
  INSERT INTO wiki_revisions (entry_id, edited_by, username, edit_summary, data)
  VALUES (v_entry, v_admin, 'Rat Bench', 'Detailed spec import (G650GS)', $g650$
  {
    "year": "2009–2016 (G650GS / Sertão)", "strokeType": "4-Stroke", "ccSize": "652",
    "compressionRatio": "11.5:1", "cylCount": "1", "valveTrain": "DOHC", "camType": "DOHC — 4 valves",
    "intakeValveClear": "0.10–0.15 mm (cold)", "exhaustValveClear": "0.20–0.25 mm (cold)",
    "plugType": "NGK (twin-plug head)", "plugGap": "0.9", "coilType": "BMS-C II EFI",
    "starterType": "Electric / key start only", "fuelSystem": "Fuel injection", "fuelTankCapacity": "14",
    "coolingType": "Liquid cooled", "boreDiameter": "100.0", "crankStroke": "83.0", "pistonDiameter": "100.0",
    "driveType": "Chain", "transType": "Manual", "clutchType": "Multi-plate wet", "finalDriveType": "525 chain",
    "forkType": "Telescopic fork", "forkDiameter": "41", "forkTravel": "170", "rearShockType": "Monoshock",
    "rearTravel": "165", "frontBrakeType": "300 mm disc, 2-piston (ABS)", "rearBrakeType": "240 mm disc",
    "tyreSizeFront": "100/90-19", "tyreSizeRear": "130/80-17", "wotPower": "50 hp (37 kW) @ 6,500 rpm",
    "torqueNm": "60", "topSpeed": "~170 km/h (106 mph)", "frameType": "Steel bridge", "wheelbaseMm": "1477",
    "seatHeightMm": "800", "weightKg": "192 (wet)",
    "notes": "BMW G650GS (2009–2016) — evolution of the single-cylinder F650GS; same 652 cc twin-spark Rotax-derived single, EFI. The Sertão variant adds longer travel and a 21-inch front wheel (seat ~860 mm). Verify clearances against the service manual."
  } $g650$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id = v_rev WHERE id = v_entry;

  -- ── CFMoto 450MT ───────────────────────────────────────────────────────────
  SELECT id INTO v_entry FROM wiki_entries WHERE slug = 'cfmoto-450mt';
  IF v_entry IS NULL THEN
    INSERT INTO wiki_entries (slug, make, model, type, created_by)
    VALUES ('cfmoto-450mt','CFMoto','450MT','Motorcycle', v_admin) RETURNING id INTO v_entry;
  END IF;
  INSERT INTO wiki_revisions (entry_id, edited_by, username, edit_summary, data)
  VALUES (v_entry, v_admin, 'Rat Bench', 'Detailed spec import (450MT / MT450)', $mt450$
  {
    "year": "2024–present", "strokeType": "4-Stroke", "ccSize": "449", "compressionRatio": "11.5:1",
    "cylCount": "2", "firingOrder": "270° crank", "valveTrain": "DOHC", "camType": "DOHC — 8 valves",
    "plugType": "NGK", "coilType": "Bosch EFI (ride-by-wire)", "starterType": "Electric / key start only",
    "fuelSystem": "Fuel injection", "fuelTankCapacity": "17.5", "coolingType": "Liquid cooled",
    "boreDiameter": "72.0", "crankStroke": "55.2", "idleRpm": "1400", "driveType": "Chain",
    "transType": "Manual", "clutchType": "Multi-plate wet (slipper)", "finalDriveType": "520 chain",
    "forkType": "USD (KYB 43 mm)", "forkDiameter": "43", "forkTravel": "200", "rearShockType": "Monoshock (KYB)",
    "rearTravel": "190", "frontBrakeType": "320 mm disc, J.Juan (cornering ABS)", "rearBrakeType": "240 mm disc",
    "tyreSizeFront": "90/90-21 (tubeless spoked)", "tyreSizeRear": "150/70-18",
    "wotPower": "44 hp (32.5 kW) @ 8,500 rpm", "torqueNm": "42", "topSpeed": "~160 km/h (100 mph)",
    "frameType": "Steel trellis", "wheelbaseMm": "1490", "seatHeightMm": "820", "weightKg": "175 (wet)",
    "notes": "CFMoto 450MT (a.k.a. MT450) — 449 cc 270° parallel-twin adventure bike on CFMoto's 450 platform (shared with 450SR/450NK/Ibex 450). Tubeless spoked wheels, switchable/cornering ABS, ride-by-wire. NEW model — bore/stroke and exact output are provisional; verify against CFMoto's official spec sheet."
  } $mt450$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id = v_rev WHERE id = v_entry;

  -- ── CFMoto 800MT ───────────────────────────────────────────────────────────
  SELECT id INTO v_entry FROM wiki_entries WHERE slug = 'cfmoto-800mt';
  IF v_entry IS NULL THEN
    INSERT INTO wiki_entries (slug, make, model, type, created_by)
    VALUES ('cfmoto-800mt','CFMoto','800MT','Motorcycle', v_admin) RETURNING id INTO v_entry;
  END IF;
  INSERT INTO wiki_revisions (entry_id, edited_by, username, edit_summary, data)
  VALUES (v_entry, v_admin, 'Rat Bench', 'Detailed spec import (800MT / MT800)', $mt800$
  {
    "year": "2021–present (800MT Touring / Sport)", "strokeType": "4-Stroke", "ccSize": "799",
    "compressionRatio": "12.7:1", "cylCount": "2", "firingOrder": "285° crank", "valveTrain": "DOHC",
    "camType": "DOHC — 8 valves", "plugType": "NGK", "coilType": "Bosch EFI (ride-by-wire)",
    "starterType": "Electric / key start only", "fuelSystem": "Fuel injection", "fuelTankCapacity": "19",
    "coolingType": "Liquid cooled", "boreDiameter": "88.0", "crankStroke": "65.7", "driveType": "Chain",
    "transType": "Manual", "clutchType": "Multi-plate wet (slipper, quickshifter)", "finalDriveType": "525 chain",
    "forkType": "USD (KYB 43 mm)", "forkDiameter": "43", "forkTravel": "150",
    "rearShockType": "Monoshock (KYB, remote preload)", "rearTravel": "150",
    "frontBrakeType": "Dual 320 mm discs, J.Juan (Bosch cornering ABS)", "rearBrakeType": "260 mm disc",
    "tyreSizeFront": "120/70-19 (Touring) / 90/90-21 (Sport)", "tyreSizeRear": "170/60-17 (Touring) / 150/70-18 (Sport)",
    "wotPower": "95 hp (70 kW) @ 9,000 rpm", "torqueNm": "77", "topSpeed": "~200 km/h (124 mph)",
    "frameType": "Steel trellis", "wheelbaseMm": "1525", "seatHeightMm": "825", "weightKg": "231 (wet, Touring)",
    "notes": "CFMoto 800MT (MT800) — 799 cc parallel-twin adventure bike using the KTM-derived LC8c engine (CFMoto/KTM partnership; same base as the KTM 790 Adventure). Touring and Sport (spoked, longer-travel) variants. Bosch cornering ABS, quickshifter, ride modes. Verify exact figures against CFMoto's official spec sheet."
  } $mt800$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id = v_rev WHERE id = v_entry;

  RAISE NOTICE 'Dual-sport batch imported (8 entries).';
END $$;


-- ═══ from wiki_seed_engines_honda.sql ═══
DO $$
DECLARE
  v_admin uuid;
  v_entry uuid;
  v_rev   uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com')
    ORDER BY email LIMIT 1;

  -- helper pattern repeated per engine: find-or-create entry, add revision, point to it

  -- GX25
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-gx25';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-gx25','Honda','GX25','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data)
  VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $gx25$
  { "year":"Mini 4-stroke (current)","strokeType":"4-Stroke","ccSize":"25","compressionRatio":"8.0:1",
    "cylCount":"1","valveTrain":"OHC","camType":"OHC — 2 valves","boreDiameter":"35.0","crankStroke":"26.0",
    "pistonDiameter":"35.0","intakeValveClear":"0.08 mm (cold)","exhaustValveClear":"0.11 mm (cold)",
    "plugType":"NGK CMR5H","plugGap":"0.6–0.7","coilType":"Transistor magneto","starterType":"Recoil only",
    "fuelSystem":"Carburetted","fuelTankCapacity":"0.55","coolingType":"Air cooled","wotRpm":"7000",
    "wotPower":"1.0 hp (0.72 kW) @ 7,000 rpm","torqueNm":"1.0","weightKg":"2.9",
    "notes":"Honda GX25 — 25 cc OHC mini 4-stroke used in trimmers/multi-tools; runs at any angle (360°). Walbro diaphragm carburetor. Oil ~80 cc (SAE 10W-30, no dipstick — fill to thread). Verify against the Honda manual." }
  $gx25$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- GX35
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-gx35';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-gx35','Honda','GX35','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data)
  VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $gx35$
  { "year":"Mini 4-stroke (current)","strokeType":"4-Stroke","ccSize":"35.8","compressionRatio":"8.0:1",
    "cylCount":"1","valveTrain":"OHC","camType":"OHC — 2 valves","boreDiameter":"39.0","crankStroke":"30.0",
    "pistonDiameter":"39.0","intakeValveClear":"0.08 mm (cold)","exhaustValveClear":"0.11 mm (cold)",
    "plugType":"NGK CMR5H","plugGap":"0.6–0.7","coilType":"Transistor magneto","starterType":"Recoil only",
    "fuelSystem":"Carburetted","fuelTankCapacity":"0.63","coolingType":"Air cooled","wotRpm":"7000",
    "wotPower":"1.3 hp (1.0 kW) @ 7,000 rpm","torqueNm":"1.6","weightKg":"3.3",
    "notes":"Honda GX35 — 35.8 cc OHC mini 4-stroke, the trimmer/brushcutter workhorse; runs at any angle. Walbro diaphragm carburetor. Oil ~100 cc (SAE 10W-30). Verify against the Honda manual." }
  $gx35$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- GX120
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-gx120';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-gx120','Honda','GX120','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data)
  VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $gx120$
  { "year":"General-purpose OHV","strokeType":"4-Stroke","ccSize":"118","compressionRatio":"8.5:1",
    "cylCount":"1","valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves","boreDiameter":"60.0","crankStroke":"42.0",
    "pistonDiameter":"60.0","intakeValveClear":"0.15 mm (cold)","exhaustValveClear":"0.20 mm (cold)",
    "plugType":"NGK BPR6ES","plugGap":"0.7–0.8","coilType":"Transistor magneto (TCI)","starterType":"Recoil + electric",
    "fuelSystem":"Carburetted","fuelTankCapacity":"2.0","coolingType":"Air cooled","idleRpm":"1400","wotRpm":"3600 (governed)",
    "wotPower":"3.5 hp (2.6 kW) @ 3,600 rpm","torqueNm":"7.6","shaftType":"Horizontal (various PTO)","weightKg":"13",
    "notes":"Honda GX120 — 118 cc air-cooled OHV general-purpose single. Keihin float carb, mechanical governor. Oil ~0.5 L (10W-30). Common on pumps, tampers and small gear. Verify against the Honda shop manual." }
  $gx120$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- GX160
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-gx160';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-gx160','Honda','GX160','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data)
  VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $gx160$
  { "year":"General-purpose OHV","strokeType":"4-Stroke","ccSize":"163","compressionRatio":"9.0:1",
    "cylCount":"1","valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves","boreDiameter":"68.0","crankStroke":"45.0",
    "pistonDiameter":"68.0","intakeValveClear":"0.15 mm (cold)","exhaustValveClear":"0.20 mm (cold)",
    "plugType":"NGK BPR6ES","plugGap":"0.7–0.8","coilType":"Transistor magneto (TCI)","starterType":"Recoil + electric",
    "fuelSystem":"Carburetted","fuelTankCapacity":"3.1","coolingType":"Air cooled","idleRpm":"1400","wotRpm":"3600 (governed)",
    "wotPower":"4.8 hp (3.6 kW) @ 3,600 rpm","torqueNm":"10.3","shaftType":"Horizontal (3/4\" straight/tapered/threaded)","weightKg":"15",
    "notes":"Honda GX160 — 163 cc air-cooled OHV single, one of the most-cloned engines ever (basis of many 6.5 hp clones). Keihin carb, mechanical governor. Oil ~0.58 L (10W-30). Plug NGK BPR6ES, lash 0.15/0.20 mm cold. Karts, pressure washers, generators, pumps. Verify against the Honda shop manual." }
  $gx160$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- GX200
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-gx200';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-gx200','Honda','GX200','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data)
  VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $gx200$
  { "year":"General-purpose OHV","strokeType":"4-Stroke","ccSize":"196","compressionRatio":"8.5:1",
    "cylCount":"1","valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves","boreDiameter":"68.0","crankStroke":"54.0",
    "pistonDiameter":"68.0","intakeValveClear":"0.15 mm (cold)","exhaustValveClear":"0.20 mm (cold)",
    "plugType":"NGK BPR6ES","plugGap":"0.7–0.8","coilType":"Transistor magneto (TCI)","starterType":"Recoil + electric",
    "fuelSystem":"Carburetted","fuelTankCapacity":"3.1","coolingType":"Air cooled","idleRpm":"1400","wotRpm":"3600 (governed)",
    "wotPower":"5.5 hp (4.1 kW) @ 3,600 rpm","torqueNm":"12.4","shaftType":"Horizontal (3/4\" straight/tapered)","weightKg":"16",
    "notes":"Honda GX200 — 196 cc air-cooled OHV single; the go-kart / minibike / racing-clone benchmark (the Predator 212 is a GX200 clone). Keihin carb. Oil ~0.6 L. Lash 0.15/0.20 mm cold, plug NGK BPR6ES. Verify against the Honda shop manual." }
  $gx200$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- GX240
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-gx240';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-gx240','Honda','GX240','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data)
  VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $gx240$
  { "year":"General-purpose OHV","strokeType":"4-Stroke","ccSize":"242","compressionRatio":"8.3:1",
    "cylCount":"1","valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves","boreDiameter":"73.0","crankStroke":"58.0",
    "pistonDiameter":"73.0","intakeValveClear":"0.15 mm (cold)","exhaustValveClear":"0.20 mm (cold)",
    "plugType":"NGK BPR6ES","plugGap":"0.7–0.8","coilType":"Transistor magneto (TCI)","starterType":"Recoil + electric",
    "fuelSystem":"Carburetted","fuelTankCapacity":"5.3","coolingType":"Air cooled","idleRpm":"1400","wotRpm":"3600 (governed)",
    "wotPower":"7.1 hp (5.3 kW) @ 3,600 rpm","torqueNm":"16.2","shaftType":"Horizontal (1\" straight/tapered)","weightKg":"25",
    "notes":"Honda GX240 — 242 cc air-cooled OHV single. Oil ~1.1 L (10W-30). Lash 0.15/0.20 mm cold, plug NGK BPR6ES. Generators, pressure washers, pumps, compactors. Verify against the Honda shop manual." }
  $gx240$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- GX270
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-gx270';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-gx270','Honda','GX270','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data)
  VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $gx270$
  { "year":"General-purpose OHV","strokeType":"4-Stroke","ccSize":"270","compressionRatio":"8.5:1",
    "cylCount":"1","valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves","boreDiameter":"77.0","crankStroke":"58.0",
    "pistonDiameter":"77.0","intakeValveClear":"0.15 mm (cold)","exhaustValveClear":"0.20 mm (cold)",
    "plugType":"NGK BPR6ES","plugGap":"0.7–0.8","coilType":"Transistor magneto (TCI)","starterType":"Recoil + electric",
    "fuelSystem":"Carburetted","fuelTankCapacity":"5.3","coolingType":"Air cooled","idleRpm":"1400","wotRpm":"3600 (governed)",
    "wotPower":"8.5 hp (6.3 kW) @ 3,600 rpm","torqueNm":"19.1","shaftType":"Horizontal (1\" straight/tapered)","weightKg":"25",
    "notes":"Honda GX270 — 270 cc air-cooled OHV single. Oil ~1.1 L. Lash 0.15/0.20 mm cold, plug NGK BPR6ES. Common on larger pressure washers, generators and plate compactors. Verify against the Honda shop manual." }
  $gx270$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- GX340
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-gx340';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-gx340','Honda','GX340','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data)
  VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $gx340$
  { "year":"General-purpose OHV","strokeType":"4-Stroke","ccSize":"337","compressionRatio":"8.0:1",
    "cylCount":"1","valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves","boreDiameter":"82.0","crankStroke":"64.0",
    "pistonDiameter":"82.0","intakeValveClear":"0.15 mm (cold)","exhaustValveClear":"0.20 mm (cold)",
    "plugType":"NGK BPR6ES","plugGap":"0.7–0.8","coilType":"Transistor magneto (TCI)","starterType":"Recoil + electric",
    "fuelSystem":"Carburetted","fuelTankCapacity":"6.0","coolingType":"Air cooled","idleRpm":"1400","wotRpm":"3600 (governed)",
    "wotPower":"10.7 hp (8.0 kW) @ 3,600 rpm","torqueNm":"24.5","shaftType":"Horizontal (1\" straight/tapered)","weightKg":"31",
    "notes":"Honda GX340 — 337 cc air-cooled OHV single. Oil ~1.1 L. Lash 0.15/0.20 mm cold, plug NGK BPR6ES. Verify against the Honda shop manual." }
  $gx340$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- GX390
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-gx390';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-gx390','Honda','GX390','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data)
  VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $gx390$
  { "year":"General-purpose OHV","strokeType":"4-Stroke","ccSize":"389","compressionRatio":"8.2:1",
    "cylCount":"1","valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves","boreDiameter":"88.0","crankStroke":"64.0",
    "pistonDiameter":"88.0","intakeValveClear":"0.15 mm (cold)","exhaustValveClear":"0.20 mm (cold)",
    "plugType":"NGK BPR6ES","plugGap":"0.7–0.8","coilType":"Transistor magneto (TCI)","starterType":"Recoil + electric",
    "fuelSystem":"Carburetted","fuelTankCapacity":"6.1","coolingType":"Air cooled","idleRpm":"1400","wotRpm":"3600 (governed)",
    "wotPower":"11.7 hp (8.7 kW) @ 3,600 rpm","torqueNm":"26.4","shaftType":"Horizontal (1\" straight/tapered)","weightKg":"31.5",
    "notes":"Honda GX390 — 389 cc air-cooled OHV single, the big-single benchmark (widely cloned). Keihin carb, mechanical governor. Oil ~1.1 L (10W-30). Lash 0.15/0.20 mm cold, plug NGK BPR6ES. Generators, pressure washers, karts, mixers. Verify against the Honda shop manual." }
  $gx390$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- GX630 (V-twin)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-gx630';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-gx630','Honda','GX630','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data)
  VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $gx630$
  { "year":"V-twin OHV","strokeType":"4-Stroke","ccSize":"688","compressionRatio":"9.3:1",
    "cylCount":"2","firingOrder":"90° V-twin","valveTrain":"OHV (pushrod)","camType":"OHV — 4 valves","boreDiameter":"78.0","crankStroke":"72.0",
    "pistonDiameter":"78.0","intakeValveClear":"0.15 mm (cold)","exhaustValveClear":"0.20 mm (cold)",
    "plugType":"NGK BPR6ES","plugGap":"0.7–0.8","coilType":"Transistor magneto (TCI)","starterType":"Electric + recoil",
    "fuelSystem":"Carburetted","fuelTankCapacity":"","coolingType":"Air cooled","idleRpm":"1400","wotRpm":"3600 (governed)",
    "wotPower":"20.5 hp (15.3 kW) @ 3,600 rpm","torqueNm":"44.1","shaftType":"Horizontal (V-twin)","weightKg":"44",
    "notes":"Honda GX630 — 688 cc air-cooled OHV V-twin. Internal oil pump + spin-on filter, oil ~1.9 L with filter. Dual plugs NGK BPR6ES, lash 0.15/0.20 mm cold. Zero-turn mowers, large gensets, pumps. Verify against the Honda shop manual." }
  $gx630$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- GX690 (V-twin)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-gx690';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-gx690','Honda','GX690','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data)
  VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $gx690$
  { "year":"V-twin OHV","strokeType":"4-Stroke","ccSize":"688","compressionRatio":"9.3:1",
    "cylCount":"2","firingOrder":"90° V-twin","valveTrain":"OHV (pushrod)","camType":"OHV — 4 valves","boreDiameter":"78.0","crankStroke":"72.0",
    "pistonDiameter":"78.0","intakeValveClear":"0.15 mm (cold)","exhaustValveClear":"0.20 mm (cold)",
    "plugType":"NGK BPR6ES","plugGap":"0.7–0.8","coilType":"Transistor magneto (TCI)","starterType":"Electric + recoil",
    "fuelSystem":"Carburetted","fuelTankCapacity":"","coolingType":"Air cooled","idleRpm":"1400","wotRpm":"3600 (governed)",
    "wotPower":"22.1 hp (16.5 kW) @ 3,600 rpm","torqueNm":"47.0","shaftType":"Horizontal (V-twin)","weightKg":"44",
    "notes":"Honda GX690 — 688 cc air-cooled OHV V-twin, the larger sibling of the GX630. Oil ~1.9 L with spin-on filter. Dual plugs NGK BPR6ES, lash 0.15/0.20 mm cold. Commercial ZTR mowers and large gensets. Verify against the Honda shop manual." }
  $gx690$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- GC160 (OHC residential)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-gc160';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-gc160','Honda','GC160','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data)
  VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $gc160$
  { "year":"Residential OHC","strokeType":"4-Stroke","ccSize":"160","compressionRatio":"8.5:1",
    "cylCount":"1","valveTrain":"OHC","camType":"OHC — 2 valves (belt)","boreDiameter":"64.0","crankStroke":"50.0",
    "pistonDiameter":"64.0","intakeValveClear":"0.15 mm (cold)","exhaustValveClear":"0.20 mm (cold)",
    "plugType":"NGK BPR6ES","plugGap":"0.7–0.8","coilType":"Transistor magneto","starterType":"Recoil only",
    "fuelSystem":"Carburetted","fuelTankCapacity":"2.0","coolingType":"Air cooled","idleRpm":"1700","wotRpm":"3600 (governed)",
    "wotPower":"4.4 hp (3.3 kW) @ 3,600 rpm","torqueNm":"9.4","shaftType":"Vertical / horizontal (residential)","weightKg":"9.8",
    "notes":"Honda GC160 — 160 cc OHC residential engine (belt-driven cam, timing belt), lighter/quieter than the GX. Common on pressure washers and push mowers. Oil ~0.55 L (no oil filter). Uses an internal timing belt — inspect on high-hour units. Verify against the Honda manual." }
  $gc160$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- GC190 (OHC residential)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-gc190';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-gc190','Honda','GC190','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data)
  VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $gc190$
  { "year":"Residential OHC","strokeType":"4-Stroke","ccSize":"187","compressionRatio":"8.5:1",
    "cylCount":"1","valveTrain":"OHC","camType":"OHC — 2 valves (belt)","boreDiameter":"69.0","crankStroke":"50.0",
    "pistonDiameter":"69.0","intakeValveClear":"0.15 mm (cold)","exhaustValveClear":"0.20 mm (cold)",
    "plugType":"NGK BPR6ES","plugGap":"0.7–0.8","coilType":"Transistor magneto","starterType":"Recoil only",
    "fuelSystem":"Carburetted","fuelTankCapacity":"2.1","coolingType":"Air cooled","idleRpm":"1700","wotRpm":"3600 (governed)",
    "wotPower":"5.1 hp (3.8 kW) @ 3,600 rpm","torqueNm":"11.4","shaftType":"Vertical / horizontal (residential)","weightKg":"12.3",
    "notes":"Honda GC190 — 187 cc OHC residential engine (timing-belt cam). Common on mid-size pressure washers and mowers. Oil ~0.55 L (no filter). Verify against the Honda manual." }
  $gc190$::jsonb) RETURNING id INTO v_rev;
  UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Honda small-engine batch imported (13 engines).';
END $$;


-- ═══ from wiki_seed_saws_stihl.sql ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- MS 170
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-ms-170';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-ms-170','Stihl','MS 170','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ms170$
  { "year":"Homeowner (current)","strokeType":"2-Stroke","ccSize":"30.1","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"37.0","crankStroke":"28.0","pistonDiameter":"37.0","plugType":"NGK BPMR7A","plugGap":"0.5",
    "coilType":"Electronic (capacitor discharge)","starterType":"Recoil only","fuelSystem":"Carburetted","mixRatio":"50:1",
    "fuelTankCapacity":"0.25","idleRpm":"2800","wotRpm":"13000","wotPower":"1.3 kW (1.7 hp)",
    "barLength":"12–16 in","barGauge":"0.050 in (1.3 mm)","chainPitchCS":"3/8\" Picco","sprocketStyle":"Spur","weightKg":"3.9",
    "notes":"Stihl MS 170 — 30.1 cc homeowner saw. 50:1 premix. Plug NGK BPMR7A, gap 0.5 mm. Verify bar/chain and carb settings against the Stihl manual." }
  $ms170$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- MS 180
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-ms-180';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-ms-180','Stihl','MS 180','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ms180$
  { "year":"Homeowner (current)","strokeType":"2-Stroke","ccSize":"31.8","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"38.0","crankStroke":"28.0","pistonDiameter":"38.0","plugType":"NGK BPMR7A","plugGap":"0.5",
    "coilType":"Electronic (capacitor discharge)","starterType":"Recoil only","fuelSystem":"Carburetted","mixRatio":"50:1",
    "fuelTankCapacity":"0.25","idleRpm":"2800","wotRpm":"13000","wotPower":"1.5 kW (2.0 hp)",
    "barLength":"14–16 in","barGauge":"0.050 in (1.3 mm)","chainPitchCS":"3/8\" Picco","sprocketStyle":"Spur","weightKg":"3.9",
    "notes":"Stihl MS 180 — 31.8 cc homeowner saw (MS 170's slightly larger sibling). 50:1 premix, plug NGK BPMR7A. Verify bar/chain and carb settings against the Stihl manual." }
  $ms180$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- MS 211
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-ms-211';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-ms-211','Stihl','MS 211','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ms211$
  { "year":"Homeowner/farm (current)","strokeType":"2-Stroke","ccSize":"35.2","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"40.0","crankStroke":"28.0","pistonDiameter":"40.0","plugType":"NGK BPMR7A","plugGap":"0.5",
    "coilType":"Electronic (capacitor discharge)","starterType":"Recoil only","fuelSystem":"Carburetted","mixRatio":"50:1",
    "fuelTankCapacity":"0.27","idleRpm":"2800","wotRpm":"13000","wotPower":"1.7 kW (2.3 hp)",
    "barLength":"14–18 in","barGauge":"0.050 in (1.3 mm)","chainPitchCS":".325\" / 3/8\" Picco","sprocketStyle":"Spur","weightKg":"4.3",
    "notes":"Stihl MS 211 — 35.2 cc farm/homeowner saw. 50:1 premix, plug NGK BPMR7A. Verify bar/chain and carb settings against the Stihl manual." }
  $ms211$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- MS 250
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-ms-250';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-ms-250','Stihl','MS 250','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ms250$
  { "year":"Farm/ranch (current)","strokeType":"2-Stroke","ccSize":"45.4","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"42.5","crankStroke":"32.0","pistonDiameter":"42.5","plugType":"NGK BPMR7A","plugGap":"0.5",
    "coilType":"Electronic (capacitor discharge)","starterType":"Recoil only","fuelSystem":"Carburetted","mixRatio":"50:1",
    "fuelTankCapacity":"0.34","idleRpm":"2800","wotRpm":"14000","wotPower":"2.3 kW (3.1 hp)",
    "barLength":"16–18 in","barGauge":"0.050 in (1.3 mm)","chainPitchCS":".325\"","sprocketStyle":"Spur","weightKg":"4.6",
    "notes":"Stihl MS 250 — 45.4 cc farm/ranch saw, hugely popular mid-size. 50:1 premix, plug NGK BPMR7A. Verify bar/chain and carb settings against the Stihl manual." }
  $ms250$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- MS 261 C-M
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-ms-261';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-ms-261','Stihl','MS 261','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ms261$
  { "year":"Professional (current, C-M)","strokeType":"2-Stroke","ccSize":"50.2","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"44.7","crankStroke":"32.0","pistonDiameter":"44.7","plugType":"NGK BPMR7A","plugGap":"0.5",
    "coilType":"Electronic (M-Tronic on C-M)","starterType":"Recoil only","fuelSystem":"Carburetted","mixRatio":"50:1",
    "fuelTankCapacity":"0.50","idleRpm":"2800","wotRpm":"14000","wotPower":"3.0 kW (4.0 hp)",
    "barLength":"16–20 in","barGauge":"0.050 / 0.063 in","chainPitchCS":".325\" / 3/8\"","sprocketStyle":"Rim","weightKg":"4.9",
    "notes":"Stihl MS 261 (C-M) — 50.2 cc professional saw, a benchmark 50 cc pro. C-M models use M-Tronic (no carb screws). 50:1 premix, plug NGK BPMR7A. Verify against the Stihl manual." }
  $ms261$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- MS 271 Farm Boss
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-ms-271';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-ms-271','Stihl','MS 271','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ms271$
  { "year":"Farm Boss (current)","strokeType":"2-Stroke","ccSize":"50.2","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK BPMR7A","plugGap":"0.5","coilType":"Electronic (capacitor discharge)","starterType":"Recoil only",
    "fuelSystem":"Carburetted","mixRatio":"50:1","fuelTankCapacity":"0.60","idleRpm":"2800","wotRpm":"13000","wotPower":"2.6 kW (3.5 hp)",
    "barLength":"16–20 in","barGauge":"0.063 in (1.6 mm)","chainPitchCS":".325\" / 3/8\"","sprocketStyle":"Spur","weightKg":"5.6",
    "notes":"Stihl MS 271 Farm Boss — 50.2 cc mid-size farm saw (heavier, 2-MIX engine). 50:1 premix, plug NGK BPMR7A. Bore/stroke omitted pending confirmation. Verify against the Stihl manual." }
  $ms271$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- MS 291
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-ms-291';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-ms-291','Stihl','MS 291','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ms291$
  { "year":"Farm/ranch (current)","strokeType":"2-Stroke","ccSize":"55.5","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK BPMR7A","plugGap":"0.5","coilType":"Electronic (capacitor discharge)","starterType":"Recoil only",
    "fuelSystem":"Carburetted","mixRatio":"50:1","fuelTankCapacity":"0.60","idleRpm":"2800","wotRpm":"13000","wotPower":"2.8 kW (3.8 hp)",
    "barLength":"16–20 in","barGauge":"0.063 in (1.6 mm)","chainPitchCS":".325\" / 3/8\"","sprocketStyle":"Spur","weightKg":"5.6",
    "notes":"Stihl MS 291 — 55.5 cc farm/ranch saw (2-MIX). 50:1 premix, plug NGK BPMR7A. Bore/stroke omitted pending confirmation. Verify against the Stihl manual." }
  $ms291$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- MS 362 C-M
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-ms-362';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-ms-362','Stihl','MS 362','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ms362$
  { "year":"Professional (current, C-M)","strokeType":"2-Stroke","ccSize":"59.0","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"47.0","crankStroke":"34.0","pistonDiameter":"47.0","plugType":"NGK BPMR7A","plugGap":"0.5",
    "coilType":"Electronic (M-Tronic on C-M)","starterType":"Recoil only","fuelSystem":"Carburetted","mixRatio":"50:1",
    "fuelTankCapacity":"0.60","idleRpm":"2800","wotRpm":"14000","wotPower":"3.5 kW (4.7 hp)",
    "barLength":"16–25 in","barGauge":"0.050 / 0.063 in","chainPitchCS":".325\" / 3/8\"","sprocketStyle":"Rim","weightKg":"5.6",
    "notes":"Stihl MS 362 (C-M) — 59 cc professional saw, a workhorse for firewood and felling. M-Tronic on C-M. 50:1 premix, plug NGK BPMR7A. Verify against the Stihl manual." }
  $ms362$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- MS 391
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-ms-391';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-ms-391','Stihl','MS 391','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ms391$
  { "year":"Farm/ranch (current)","strokeType":"2-Stroke","ccSize":"64.1","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"49.0","crankStroke":"34.0","pistonDiameter":"49.0","plugType":"NGK BPMR7A","plugGap":"0.5",
    "coilType":"Electronic (capacitor discharge)","starterType":"Recoil only","fuelSystem":"Carburetted","mixRatio":"50:1",
    "fuelTankCapacity":"0.68","idleRpm":"2800","wotRpm":"13000","wotPower":"3.3 kW (4.4 hp)",
    "barLength":"16–25 in","barGauge":"0.063 in (1.6 mm)","chainPitchCS":".325\" / 3/8\"","sprocketStyle":"Spur","weightKg":"6.2",
    "notes":"Stihl MS 391 — 64.1 cc farm/ranch saw, big-bore value workhorse. 50:1 premix, plug NGK BPMR7A. Verify against the Stihl manual." }
  $ms391$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- MS 400 C-M
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-ms-400';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-ms-400','Stihl','MS 400','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ms400$
  { "year":"Professional (current, C-M)","strokeType":"2-Stroke","ccSize":"66.8","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"50.0","crankStroke":"34.0","pistonDiameter":"50.0","plugType":"NGK BPMR7A","plugGap":"0.5",
    "coilType":"Electronic (M-Tronic)","starterType":"Recoil only","fuelSystem":"Carburetted","mixRatio":"50:1",
    "fuelTankCapacity":"0.65","idleRpm":"2800","wotRpm":"14000","wotPower":"4.0 kW (5.4 hp)",
    "barLength":"16–25 in","barGauge":"0.050 / 0.063 in","chainPitchCS":".325\" / 3/8\"","sprocketStyle":"Rim","weightKg":"5.8",
    "notes":"Stihl MS 400 C-M — 66.8 cc pro saw, first Stihl with an aluminium cylinder (light for its class). M-Tronic. 50:1 premix, plug NGK BPMR7A. Verify against the Stihl manual." }
  $ms400$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- MS 462 C-M
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-ms-462';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-ms-462','Stihl','MS 462','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ms462$
  { "year":"Professional (current, C-M)","strokeType":"2-Stroke","ccSize":"72.2","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK BPMR7A","plugGap":"0.5","coilType":"Electronic (M-Tronic)","starterType":"Recoil only",
    "fuelSystem":"Carburetted","mixRatio":"50:1","fuelTankCapacity":"0.75","idleRpm":"2800","wotRpm":"14000","wotPower":"4.4 kW (6.0 hp)",
    "barLength":"18–32 in","barGauge":"0.063 in (1.6 mm)","chainPitchCS":".325\" / 3/8\" / .404\"","sprocketStyle":"Rim","weightKg":"6.0",
    "notes":"Stihl MS 462 C-M — 72.2 cc professional felling/firewood saw, a light 70 cc-class pro. M-Tronic. 50:1 premix, plug NGK BPMR7A. Bore/stroke omitted pending confirmation. Verify against the Stihl manual." }
  $ms462$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- MS 500i
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-ms-500i';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-ms-500i','Stihl','MS 500i','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ms500i$
  { "year":"Professional (current)","strokeType":"2-Stroke","ccSize":"79.2","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"56.0","crankStroke":"32.0","pistonDiameter":"56.0","plugType":"NGK BPMR7A","plugGap":"0.5",
    "coilType":"Electronic","starterType":"Recoil only","fuelSystem":"Fuel injection","mixRatio":"50:1",
    "fuelTankCapacity":"0.77","idleRpm":"2800","wotRpm":"14000","wotPower":"5.0 kW (6.7 hp)",
    "barLength":"20–36 in","barGauge":"0.063 in (1.6 mm)","chainPitchCS":"3/8\" / .404\"","sprocketStyle":"Rim","weightKg":"6.2",
    "notes":"Stihl MS 500i — 79.2 cc, the first fuel-injected chainsaw (electronically-controlled injection, no carburetor). Best-in-class power-to-weight, fastest acceleration. Still 50:1 premix for lubrication. Plug NGK BPMR7A. Verify against the Stihl manual." }
  $ms500i$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- MS 661 C-M
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-ms-661';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-ms-661','Stihl','MS 661','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ms661$
  { "year":"Professional (current, C-M)","strokeType":"2-Stroke","ccSize":"91.1","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"56.0","crankStroke":"37.0","pistonDiameter":"56.0","plugType":"NGK BPMR7A","plugGap":"0.5",
    "coilType":"Electronic (M-Tronic)","starterType":"Recoil only","fuelSystem":"Carburetted","mixRatio":"50:1",
    "fuelTankCapacity":"0.83","idleRpm":"2500","wotRpm":"13500","wotPower":"5.4 kW (7.2 hp)",
    "barLength":"20–36 in","barGauge":"0.063 in (1.6 mm)","chainPitchCS":"3/8\" / .404\"","sprocketStyle":"Rim","weightKg":"7.4",
    "notes":"Stihl MS 661 C-M — 91.1 cc big pro saw for felling and milling. M-Tronic. 50:1 premix, plug NGK BPMR7A. Verify against the Stihl manual." }
  $ms661$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- MS 880
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-ms-880';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-ms-880','Stihl','MS 880','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ms880$
  { "year":"Professional (current)","strokeType":"2-Stroke","ccSize":"121.6","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"60.0","crankStroke":"43.0","pistonDiameter":"60.0","plugType":"NGK BPMR7A","plugGap":"0.5",
    "coilType":"Electronic (capacitor discharge)","starterType":"Recoil only","fuelSystem":"Carburetted","mixRatio":"50:1",
    "fuelTankCapacity":"1.30","idleRpm":"2500","wotRpm":"11000","wotPower":"6.4 kW (8.7 hp)",
    "barLength":"30–59 in","barGauge":"0.063 in (1.6 mm)","chainPitchCS":".404\"","sprocketStyle":"Rim","weightKg":"10.1",
    "notes":"Stihl MS 880 (MS 881) — 121.6 cc, the largest production Stihl, a milling/big-timber saw run with long bars and .404\" chain. 50:1 premix, plug NGK BPMR7A. Verify against the Stihl manual." }
  $ms880$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Stihl chainsaw batch imported (14 saws).';
END $$;

-- Verify — one row per seeded machine with its field count
SELECT e.make, e.model, e.type,
       (SELECT count(*) FROM jsonb_object_keys(r.data)) AS spec_fields
FROM wiki_entries e JOIN wiki_revisions r ON r.id = e.current_rev_id
WHERE e.slug IN (
  'kawasaki-klr650','suzuki-dr650','suzuki-dr-z400','yamaha-tw200','yamaha-wr450f',
  'bmw-f650','bmw-f650gs','bmw-g650gs','cfmoto-450mt','cfmoto-800mt',
  'honda-gx25','honda-gx35','honda-gx120','honda-gx160','honda-gx200','honda-gx240',
  'honda-gx270','honda-gx340','honda-gx390','honda-gx630','honda-gx690','honda-gc160','honda-gc190',
  'stihl-ms-170','stihl-ms-180','stihl-ms-211','stihl-ms-250','stihl-ms-261','stihl-ms-271',
  'stihl-ms-291','stihl-ms-362','stihl-ms-391','stihl-ms-400','stihl-ms-462','stihl-ms-500i',
  'stihl-ms-661','stihl-ms-880'
) ORDER BY e.type, e.make, e.model;
