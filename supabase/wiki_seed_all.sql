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

-- ═══ Outboards (4-stroke) ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- Yamaha F9.9
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-f9-9';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-f9-9','Yamaha','F9.9','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $yf99$
  { "year":"Portable 4-stroke","strokeType":"4-Stroke","ccSize":"212","cylCount":"2","valveTrain":"SOHC","coolingType":"Liquid cooled",
    "fuelSystem":"Carburetted","starterType":"Recoil / electric","wotRpm":"5000–6000","wotPower":"9.9 hp @ 5,500 rpm",
    "obShaftLength":"15\" / 20\" (S/L)","obTiltTrim":"Manual tilt","obSteering":"Tiller (remote optional)",
    "obLowerUnitOilType":"SAE 90 hypoid gear oil","obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"39",
    "notes":"Yamaha F9.9 — 212 cc 2-cyl water-cooled portable 4-stroke; a popular kicker/tender motor. Carbureted. Plug/valve-clearance specs vary by year — see the Yamaha service manual." }
  $yf99$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha F15
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-f15';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-f15','Yamaha','F15','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $yf15$
  { "year":"Portable 4-stroke (F15C)","strokeType":"4-Stroke","ccSize":"362","cylCount":"2","valveTrain":"SOHC","coolingType":"Liquid cooled",
    "fuelSystem":"Carburetted","starterType":"Recoil / electric","wotRpm":"5000–6000","wotPower":"15 hp @ 5,500 rpm",
    "obShaftLength":"15\" / 20\" (S/L)","obTiltTrim":"Manual tilt","obSteering":"Tiller (remote optional)",
    "obLowerUnitOilType":"SAE 90 hypoid gear oil","obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"51",
    "notes":"Yamaha F15C — 362 cc 2-cyl water-cooled portable 4-stroke (shares its powerhead with the F20). Carbureted. See the Yamaha manual for plug/lash by year." }
  $yf15$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha F25
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-f25';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-f25','Yamaha','F25','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $yf25$
  { "year":"Portable 4-stroke (F25G)","strokeType":"4-Stroke","ccSize":"432","cylCount":"2","valveTrain":"SOHC","coolingType":"Liquid cooled",
    "fuelSystem":"Fuel injection (EFI)","starterType":"Recoil / electric","wotRpm":"5000–6000","wotPower":"25 hp @ 5,500 rpm",
    "obShaftLength":"15\" / 20\" (S/L)","obTiltTrim":"Manual / power tilt","obSteering":"Tiller (remote optional)",
    "obLowerUnitOilType":"SAE 90 hypoid gear oil","obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"57",
    "notes":"Yamaha F25G — 432 cc 2-cyl water-cooled portable 4-stroke, EFI, the lightest 25 in its class. (Older F25 was a 498 cc 3-cyl.) See the Yamaha manual for plug/lash." }
  $yf25$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha F60
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-f60';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-f60','Yamaha','F60','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $yf60$
  { "year":"Mid-range 4-stroke","strokeType":"4-Stroke","ccSize":"996","cylCount":"4","valveTrain":"SOHC","coolingType":"Liquid cooled",
    "fuelSystem":"Fuel injection (EFI)","starterType":"Electric","wotRpm":"5000–6000","wotPower":"60 hp @ 5,500 rpm",
    "obShaftLength":"20\" / 25\" (L/X)","obTiltTrim":"Power trim & tilt","obSteering":"Remote",
    "obLowerUnitOilType":"SAE 90 hypoid gear oil","obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"104",
    "notes":"Yamaha F60 — 996 cc inline-4 water-cooled 4-stroke, EFI (shares its block with the F70). Extremely popular pontoon/tender mid-range. See the Yamaha manual for plug/lash." }
  $yf60$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha F115
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-f115';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-f115','Yamaha','F115','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $yf115$
  { "year":"Mid-range 4-stroke","strokeType":"4-Stroke","ccSize":"1832","cylCount":"4","valveTrain":"DOHC 16v","coolingType":"Liquid cooled",
    "fuelSystem":"Fuel injection (EFI)","starterType":"Electric","wotRpm":"5000–6000","wotPower":"115 hp @ 5,500 rpm",
    "obShaftLength":"20\" / 25\" (L/X)","obTiltTrim":"Power trim & tilt","obSteering":"Remote (mechanical / DBW)",
    "obLowerUnitOilType":"SAE 90 hypoid gear oil","obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"166",
    "notes":"Yamaha F115 — 1.8 L DOHC inline-4 water-cooled 4-stroke, EFI. A staple mid-size outboard. See the Yamaha manual for plug/lash." }
  $yf115$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha F150
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-f150';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-f150','Yamaha','F150','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $yf150$
  { "year":"4-stroke","strokeType":"4-Stroke","ccSize":"2670","cylCount":"4","valveTrain":"DOHC 16v","coolingType":"Liquid cooled",
    "fuelSystem":"Fuel injection (EFI)","starterType":"Electric","wotRpm":"5000–6000","wotPower":"150 hp @ 5,500 rpm",
    "obShaftLength":"20\" / 25\" (L/X)","obTiltTrim":"Power trim & tilt","obSteering":"Remote (mechanical / DBW)",
    "obLowerUnitOilType":"SAE 90 hypoid gear oil","obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"208",
    "notes":"Yamaha F150 — 2.7 L DOHC inline-4 water-cooled 4-stroke, EFI; the biggest naturally-aspirated Yamaha four-cylinder. Hugely popular on centre-consoles. See the Yamaha manual for plug/lash." }
  $yf150$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Mercury 9.9 FourStroke
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='mercury-9-9-fourstroke';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('mercury-9-9-fourstroke','Mercury','9.9 FourStroke','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $m99$
  { "year":"Portable 4-stroke","strokeType":"4-Stroke","ccSize":"209","cylCount":"2","valveTrain":"SOHC","coolingType":"Liquid cooled",
    "fuelSystem":"Carburetted","starterType":"Recoil / electric","wotRpm":"5000–6000","wotPower":"9.9 hp @ 5,500 rpm",
    "obShaftLength":"15\" / 20\" / 25\"","obTiltTrim":"Manual tilt","obSteering":"Tiller (remote optional)",
    "obLowerUnitOilType":"SAE 90 gear lube","obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"38",
    "notes":"Mercury 9.9 FourStroke — 209 cc 2-cyl water-cooled portable (built by Tohatsu; shares the Tohatsu MFS9.9 powerhead). Carbureted kicker favourite. See the Mercury manual for plug/lash." }
  $m99$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Mercury 25 FourStroke
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='mercury-25-fourstroke';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('mercury-25-fourstroke','Mercury','25 FourStroke','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $m25$
  { "year":"Portable 4-stroke","strokeType":"4-Stroke","ccSize":"526","cylCount":"3","valveTrain":"SOHC","coolingType":"Liquid cooled",
    "fuelSystem":"Fuel injection (EFI)","starterType":"Recoil / electric","wotRpm":"5000–6000","wotPower":"25 hp @ 5,500 rpm",
    "obShaftLength":"15\" / 20\"","obTiltTrim":"Manual / power tilt","obSteering":"Tiller (remote optional)",
    "obLowerUnitOilType":"SAE 90 gear lube","obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"71",
    "notes":"Mercury 25 FourStroke — 526 cc 3-cyl water-cooled EFI (shares the 25/30 powerhead). See the Mercury manual for plug/lash." }
  $m25$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Mercury 60 FourStroke
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='mercury-60-fourstroke';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('mercury-60-fourstroke','Mercury','60 FourStroke','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $m60$
  { "year":"Mid-range 4-stroke","strokeType":"4-Stroke","ccSize":"995","cylCount":"4","valveTrain":"SOHC","coolingType":"Liquid cooled",
    "fuelSystem":"Fuel injection (EFI)","starterType":"Electric","wotRpm":"5500–6000","wotPower":"60 hp @ 5,750 rpm",
    "obShaftLength":"20\" / 25\"","obTiltTrim":"Power trim & tilt","obSteering":"Tiller / remote",
    "obLowerUnitOilType":"SAE 90 gear lube","obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"112",
    "notes":"Mercury 60 FourStroke — 995 cc inline-4 water-cooled EFI (BigFoot / Command Thrust variants for pontoons). See the Mercury manual for plug/lash." }
  $m60$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Mercury 115 FourStroke
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='mercury-115-fourstroke';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('mercury-115-fourstroke','Mercury','115 FourStroke','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $m115$
  { "year":"Mid-range 4-stroke","strokeType":"4-Stroke","ccSize":"2064","cylCount":"4","valveTrain":"DOHC 16v","coolingType":"Liquid cooled",
    "fuelSystem":"Fuel injection (EFI)","starterType":"Electric","wotRpm":"5000–6000","wotPower":"115 hp @ 5,500 rpm",
    "obShaftLength":"20\" / 25\"","obTiltTrim":"Power trim & tilt","obSteering":"Remote",
    "obLowerUnitOilType":"SAE 90 gear lube","obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"163",
    "notes":"Mercury 115 FourStroke — 2.1 L DOHC inline-4 water-cooled EFI (Pro XS variant is tuned harder). A best-seller in its class. See the Mercury manual for plug/lash." }
  $m115$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Honda BF50
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-bf50';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-bf50','Honda','BF50','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $bf50$
  { "year":"Mid-range 4-stroke","strokeType":"4-Stroke","ccSize":"808","cylCount":"3","valveTrain":"SOHC","coolingType":"Liquid cooled",
    "fuelSystem":"Carburetted","starterType":"Electric","wotRpm":"5000–6000","wotPower":"50 hp @ 5,500 rpm",
    "obShaftLength":"20\" / 25\"","obTiltTrim":"Power trim & tilt","obSteering":"Tiller / remote",
    "obLowerUnitOilType":"Hypoid gear oil SAE 90","obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"98",
    "notes":"Honda BF50 — 808 cc 3-cyl water-cooled 4-stroke (shares the BF40 block). Honda's engines are famously long-lived. See the Honda marine manual for plug/lash." }
  $bf50$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Honda BF90
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-bf90';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-bf90','Honda','BF90','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $bf90$
  { "year":"Mid-range 4-stroke","strokeType":"4-Stroke","ccSize":"1496","cylCount":"4","valveTrain":"SOHC 16v","coolingType":"Liquid cooled",
    "fuelSystem":"Fuel injection (PGM-FI)","starterType":"Electric","wotRpm":"5000–6000","wotPower":"90 hp @ 5,500 rpm",
    "obShaftLength":"20\" / 25\"","obTiltTrim":"Power trim & tilt","obSteering":"Remote",
    "obLowerUnitOilType":"Hypoid gear oil SAE 90","obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"166",
    "notes":"Honda BF90 — 1496 cc SOHC inline-4 water-cooled 4-stroke, PGM-FI (shares the BF75 block; BF115/135 share the larger 2.4 L). See the Honda marine manual for plug/lash." }
  $bf90$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Suzuki DF60
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='suzuki-df60';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('suzuki-df60','Suzuki','DF60','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $df60$
  { "year":"Mid-range 4-stroke (DF60A)","strokeType":"4-Stroke","ccSize":"941","cylCount":"3","valveTrain":"DOHC 12v","coolingType":"Liquid cooled",
    "fuelSystem":"Fuel injection (EFI)","starterType":"Electric","wotRpm":"5000–6000","wotPower":"60 hp @ 5,500 rpm",
    "obShaftLength":"20\" / 25\"","obTiltTrim":"Power trim & tilt","obSteering":"Remote",
    "obLowerUnitOilType":"Hypoid gear oil SAE 90","obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"102",
    "notes":"Suzuki DF60A — 941 cc DOHC 3-cyl water-cooled EFI (shares the DF70A block); lean-burn control. See the Suzuki manual for plug/lash." }
  $df60$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Tohatsu MFS9.9
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='tohatsu-mfs9-9';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('tohatsu-mfs9-9','Tohatsu','MFS9.9','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $mfs99$
  { "year":"Portable 4-stroke","strokeType":"4-Stroke","ccSize":"209","cylCount":"2","valveTrain":"SOHC","coolingType":"Liquid cooled",
    "fuelSystem":"Carburetted","starterType":"Recoil / electric","wotRpm":"5000–6000","wotPower":"9.9 hp @ 5,500 rpm",
    "obShaftLength":"15\" / 20\" / 25\"","obTiltTrim":"Manual tilt","obSteering":"Tiller (remote optional)",
    "obLowerUnitOilType":"SAE 90 gear lube","obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"38",
    "notes":"Tohatsu MFS9.9 — 209 cc 2-cyl water-cooled portable 4-stroke; the powerhead behind the Mercury 9.9 FourStroke too. Reliable kicker/tender. See the Tohatsu manual for plug/lash." }
  $mfs99$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Outboard 4-stroke batch imported (14 motors).';
END $$;

-- ═══ Husqvarna + Echo chainsaws ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- Husqvarna 435
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='husqvarna-435';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('husqvarna-435','Husqvarna','435','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $h435$
  { "year":"Homeowner (X-Torq)","strokeType":"2-Stroke","ccSize":"40.9","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK BPMR7A","plugGap":"0.5","coilType":"Electronic (capacitor discharge)","starterType":"Recoil only",
    "fuelSystem":"Carburetted","mixRatio":"50:1","fuelTankCapacity":"0.37","idleRpm":"2900","wotRpm":"12000","wotPower":"1.6 kW (2.2 hp)",
    "barLength":"13–18 in","barGauge":"0.050 in (1.3 mm)","chainPitchCS":".325\" / 3/8\"","sprocketStyle":"Spur","weightKg":"4.2",
    "notes":"Husqvarna 435 — 40.9 cc X-Torq homeowner saw. 50:1 premix, plug NGK BPMR7A (HQT-1). Bore/stroke omitted pending confirmation. Verify against the Husqvarna manual." }
  $h435$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Husqvarna 445
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='husqvarna-445';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('husqvarna-445','Husqvarna','445','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $h445$
  { "year":"Homeowner/farm (X-Torq)","strokeType":"2-Stroke","ccSize":"45.7","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK BPMR7A","plugGap":"0.5","coilType":"Electronic (capacitor discharge)","starterType":"Recoil only",
    "fuelSystem":"Carburetted","mixRatio":"50:1","fuelTankCapacity":"0.45","idleRpm":"2700","wotRpm":"12000","wotPower":"2.1 kW (2.8 hp)",
    "barLength":"13–20 in","barGauge":"0.050 in (1.3 mm)","chainPitchCS":".325\"","sprocketStyle":"Spur","weightKg":"4.9",
    "notes":"Husqvarna 445 — 45.7 cc X-Torq farm/homeowner saw. 50:1 premix, plug NGK BPMR7A. Verify against the Husqvarna manual." }
  $h445$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Husqvarna 450
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='husqvarna-450';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('husqvarna-450','Husqvarna','450','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $h450$
  { "year":"Farm/all-round (X-Torq)","strokeType":"2-Stroke","ccSize":"50.2","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"44.0","crankStroke":"33.0","pistonDiameter":"44.0","plugType":"NGK BPMR7A","plugGap":"0.5",
    "coilType":"Electronic (capacitor discharge)","starterType":"Recoil only","fuelSystem":"Carburetted","mixRatio":"50:1",
    "fuelTankCapacity":"0.45","idleRpm":"2700","wotRpm":"12000","wotPower":"2.4 kW (3.2 hp)",
    "barLength":"13–20 in","barGauge":"0.050 in (1.3 mm)","chainPitchCS":".325\"","sprocketStyle":"Spur","weightKg":"5.1",
    "notes":"Husqvarna 450 — 50.2 cc X-Torq all-rounder, a very popular mid-size. 50:1 premix, plug NGK BPMR7A. Verify against the Husqvarna manual." }
  $h450$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Husqvarna 455 Rancher
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='husqvarna-455-rancher';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('husqvarna-455-rancher','Husqvarna','455 Rancher','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $h455$
  { "year":"Farm/ranch (X-Torq)","strokeType":"2-Stroke","ccSize":"55.5","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"47.0","crankStroke":"32.0","pistonDiameter":"47.0","plugType":"NGK BPMR7A","plugGap":"0.5",
    "coilType":"Electronic (capacitor discharge)","starterType":"Recoil only","fuelSystem":"Carburetted","mixRatio":"50:1",
    "fuelTankCapacity":"0.65","idleRpm":"2700","wotRpm":"12000","wotPower":"2.6 kW (3.5 hp)",
    "barLength":"13–20 in","barGauge":"0.058 in (1.5 mm)","chainPitchCS":".325\"","sprocketStyle":"Spur","weightKg":"5.9",
    "notes":"Husqvarna 455 Rancher — 55.5 cc X-Torq, one of the best-selling farm/ranch saws ever. 50:1 premix, plug NGK BPMR7A. Verify against the Husqvarna manual." }
  $h455$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Husqvarna 460 Rancher
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='husqvarna-460-rancher';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('husqvarna-460-rancher','Husqvarna','460 Rancher','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $h460$
  { "year":"Farm/ranch (X-Torq)","strokeType":"2-Stroke","ccSize":"60.3","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK BPMR7A","plugGap":"0.5","coilType":"Electronic (capacitor discharge)","starterType":"Recoil only",
    "fuelSystem":"Carburetted","mixRatio":"50:1","fuelTankCapacity":"0.68","idleRpm":"2700","wotRpm":"12000","wotPower":"2.7 kW (3.6 hp)",
    "barLength":"13–24 in","barGauge":"0.058 in (1.5 mm)","chainPitchCS":".325\" / 3/8\"","sprocketStyle":"Spur","weightKg":"5.9",
    "notes":"Husqvarna 460 Rancher — 60.3 cc X-Torq, the bigger Rancher for larger bars. 50:1 premix, plug NGK BPMR7A. Bore/stroke omitted pending confirmation. Verify against the Husqvarna manual." }
  $h460$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Husqvarna 550 XP
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='husqvarna-550-xp';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('husqvarna-550-xp','Husqvarna','550 XP','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $h550$
  { "year":"Professional (Mark II, AutoTune)","strokeType":"2-Stroke","ccSize":"50.1","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK BPMR7A","plugGap":"0.5","coilType":"Electronic (AutoTune)","starterType":"Recoil only",
    "fuelSystem":"Carburetted","mixRatio":"50:1","fuelTankCapacity":"0.50","idleRpm":"2700","wotRpm":"14000","wotPower":"2.8 kW (3.75 hp)",
    "barLength":"13–20 in","barGauge":"0.050 in (1.3 mm)","chainPitchCS":".325\"","sprocketStyle":"Rim","weightKg":"4.9",
    "notes":"Husqvarna 550 XP Mark II — 50.1 cc professional saw with AutoTune (self-adjusting carb). 50:1 premix, plug NGK BPMR7A. Verify against the Husqvarna manual." }
  $h550$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Husqvarna 562 XP
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='husqvarna-562-xp';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('husqvarna-562-xp','Husqvarna','562 XP','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $h562$
  { "year":"Professional (AutoTune)","strokeType":"2-Stroke","ccSize":"59.8","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK BPMR7A","plugGap":"0.5","coilType":"Electronic (AutoTune)","starterType":"Recoil only",
    "fuelSystem":"Carburetted","mixRatio":"50:1","fuelTankCapacity":"0.65","idleRpm":"2700","wotRpm":"14000","wotPower":"3.5 kW (4.7 hp)",
    "barLength":"13–24 in","barGauge":"0.058 in (1.5 mm)","chainPitchCS":".325\" / 3/8\"","sprocketStyle":"Rim","weightKg":"6.1",
    "notes":"Husqvarna 562 XP — 59.8 cc professional saw with AutoTune, a favourite 60 cc pro. 50:1 premix, plug NGK BPMR7A. Bore/stroke omitted pending confirmation. Verify against the Husqvarna manual." }
  $h562$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Husqvarna 572 XP
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='husqvarna-572-xp';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('husqvarna-572-xp','Husqvarna','572 XP','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $h572$
  { "year":"Professional (AutoTune)","strokeType":"2-Stroke","ccSize":"70.6","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK BPMR7A","plugGap":"0.5","coilType":"Electronic (AutoTune)","starterType":"Recoil only",
    "fuelSystem":"Carburetted","mixRatio":"50:1","fuelTankCapacity":"0.72","idleRpm":"2700","wotRpm":"14000","wotPower":"4.3 kW (5.8 hp)",
    "barLength":"15–28 in","barGauge":"0.058 in (1.5 mm)","chainPitchCS":".325\" / 3/8\"","sprocketStyle":"Rim","weightKg":"6.6",
    "notes":"Husqvarna 572 XP — 70.6 cc professional saw with AutoTune, the modern successor to the 372XP. 50:1 premix, plug NGK BPMR7A. Verify against the Husqvarna manual." }
  $h572$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Husqvarna 372 XP
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='husqvarna-372-xp';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('husqvarna-372-xp','Husqvarna','372 XP','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $h372$
  { "year":"Professional (classic)","strokeType":"2-Stroke","ccSize":"70.7","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"50.0","crankStroke":"36.0","pistonDiameter":"50.0","plugType":"NGK BPMR7A","plugGap":"0.5",
    "coilType":"Electronic (capacitor discharge)","starterType":"Recoil only","fuelSystem":"Carburetted","mixRatio":"50:1",
    "fuelTankCapacity":"0.77","idleRpm":"2700","wotRpm":"13000","wotPower":"3.9 kW (5.4 hp)",
    "barLength":"15–28 in","barGauge":"0.058 in (1.5 mm)","chainPitchCS":".325\" / 3/8\"","sprocketStyle":"Rim","weightKg":"6.6",
    "notes":"Husqvarna 372 XP — 70.7 cc, a legendary professional saw with a cult following. 50:1 premix, plug NGK BPMR7A. Verify against the Husqvarna manual." }
  $h372$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Husqvarna 395 XP
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='husqvarna-395-xp';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('husqvarna-395-xp','Husqvarna','395 XP','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $h395$
  { "year":"Professional (big-bore)","strokeType":"2-Stroke","ccSize":"93.6","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"56.0","crankStroke":"38.0","pistonDiameter":"56.0","plugType":"NGK BPMR7A","plugGap":"0.5",
    "coilType":"Electronic (capacitor discharge)","starterType":"Recoil only","fuelSystem":"Carburetted","mixRatio":"50:1",
    "fuelTankCapacity":"0.95","idleRpm":"2500","wotRpm":"13000","wotPower":"4.9 kW (6.5 hp)",
    "barLength":"20–36 in","barGauge":"0.063 in (1.6 mm)","chainPitchCS":"3/8\" / .404\"","sprocketStyle":"Rim","weightKg":"7.5",
    "notes":"Husqvarna 395 XP — 93.6 cc big professional saw for felling and milling. 50:1 premix, plug NGK BPMR7A. Verify against the Husqvarna manual." }
  $h395$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Echo CS-400
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='echo-cs-400';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('echo-cs-400','Echo','CS-400','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $e400$
  { "year":"Homeowner","strokeType":"2-Stroke","ccSize":"40.2","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"40.0","crankStroke":"32.0","pistonDiameter":"40.0","coilType":"Electronic (capacitor discharge)","starterType":"Recoil only",
    "fuelSystem":"Carburetted","mixRatio":"50:1","fuelTankCapacity":"0.39","idleRpm":"2800","wotRpm":"13000","wotPower":"1.6 kW (2.2 hp)",
    "barLength":"16–18 in","barGauge":"0.050 in (1.3 mm)","chainPitchCS":"3/8\" / .325\"","sprocketStyle":"Spur","weightKg":"4.1",
    "notes":"Echo CS-400 — 40.2 cc homeowner saw, well regarded for value. 50:1 premix. Spark plug/gap per the Echo manual (commonly NGK). Verify against the Echo manual." }
  $e400$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Echo CS-490
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='echo-cs-490';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('echo-cs-490','Echo','CS-490','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $e490$
  { "year":"Farm/ranch","strokeType":"2-Stroke","ccSize":"50.2","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"44.7","crankStroke":"32.0","pistonDiameter":"44.7","coilType":"Electronic (capacitor discharge)","starterType":"Recoil only",
    "fuelSystem":"Carburetted","mixRatio":"50:1","fuelTankCapacity":"0.44","idleRpm":"2800","wotRpm":"13500","wotPower":"2.4 kW (3.2 hp)",
    "barLength":"18–20 in","barGauge":"0.058 in (1.5 mm)","chainPitchCS":".325\"","sprocketStyle":"Spur","weightKg":"5.0",
    "notes":"Echo CS-490 — 50.2 cc farm/ranch saw. 50:1 premix. Plug/gap per the Echo manual. Verify against the Echo manual." }
  $e490$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Echo CS-590 Timber Wolf
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='echo-cs-590';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('echo-cs-590','Echo','CS-590','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $e590$
  { "year":"Farm/ranch (Timber Wolf)","strokeType":"2-Stroke","ccSize":"59.8","cylCount":"1","coolingType":"Air cooled",
    "coilType":"Electronic (capacitor discharge)","starterType":"Recoil only","fuelSystem":"Carburetted","mixRatio":"50:1",
    "fuelTankCapacity":"0.55","idleRpm":"2800","wotRpm":"13500","wotPower":"2.9 kW (3.9 hp)",
    "barLength":"18–27 in","barGauge":"0.058 in (1.5 mm)","chainPitchCS":".325\" / 3/8\"","sprocketStyle":"Spur","weightKg":"6.0",
    "notes":"Echo CS-590 Timber Wolf — 59.8 cc value farm/ranch saw with a big following. 50:1 premix. Bore/stroke and plug per the Echo manual. Verify against the Echo manual." }
  $e590$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Echo CS-800P
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='echo-cs-800p';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('echo-cs-800p','Echo','CS-800P','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $e800$
  { "year":"Professional (big-bore)","strokeType":"2-Stroke","ccSize":"80.7","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"52.0","crankStroke":"38.0","pistonDiameter":"52.0","coilType":"Electronic (capacitor discharge)","starterType":"Recoil only",
    "fuelSystem":"Carburetted","mixRatio":"50:1","fuelTankCapacity":"0.83","idleRpm":"2500","wotRpm":"13000","wotPower":"4.4 kW (5.9 hp)",
    "barLength":"20–36 in","barGauge":"0.063 in (1.6 mm)","chainPitchCS":"3/8\" / .404\"","sprocketStyle":"Rim","weightKg":"8.0",
    "notes":"Echo CS-800P — 80.7 cc big professional saw for felling/milling. 50:1 premix. Plug/gap per the Echo manual. Verify against the Echo manual." }
  $e800$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Husqvarna + Echo saw batch imported (14 saws).';
END $$;

-- ═══ Clone / import engines (Predator, Loncin, Lifan, Tillotson, DuroMax) ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- Predator 212 (Hemi)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='predator-212-hemi';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('predator-212-hemi','Predator','212 Hemi','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $p212h$
  { "year":"GX200-clone (Hemi head)","strokeType":"4-Stroke","ccSize":"212","compressionRatio":"8.5:1","cylCount":"1",
    "valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves","boreDiameter":"70.0","crankStroke":"55.0","pistonDiameter":"70.0",
    "intakeValveClear":"0.10–0.15 mm (cold, verify)","exhaustValveClear":"0.10–0.15 mm (cold, verify)","plugType":"NGK BPR6ES","plugGap":"0.7",
    "coilType":"Transistor magneto","starterType":"Recoil only","fuelSystem":"Carburetted","fuelTankCapacity":"3.6","coolingType":"Air cooled",
    "idleRpm":"1750","wotRpm":"3600 (governed)","wotPower":"6.5 hp @ 3,600 rpm","torqueNm":"12.5","shaftType":"Horizontal 3/4\" keyed","weightKg":"16",
    "notes":"Predator 212 cc (Hemi) — Harbor Freight GX200 clone (built by Loncin); the go-kart/minibike/racing hub. Hemi (angled-valve) head vs the earlier Non-Hemi. Massive aftermarket. Clone valve lash varies — verify against the Predator manual." }
  $p212h$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Predator 212 (Non-Hemi)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='predator-212-non-hemi';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('predator-212-non-hemi','Predator','212 Non-Hemi','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $p212n$
  { "year":"GX200-clone (flat/Non-Hemi head)","strokeType":"4-Stroke","ccSize":"212","compressionRatio":"8.5:1","cylCount":"1",
    "valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves","boreDiameter":"70.0","crankStroke":"55.0","pistonDiameter":"70.0",
    "intakeValveClear":"0.10–0.15 mm (cold, verify)","exhaustValveClear":"0.10–0.15 mm (cold, verify)","plugType":"NGK BPR6ES","plugGap":"0.7",
    "coilType":"Transistor magneto","starterType":"Recoil only","fuelSystem":"Carburetted","fuelTankCapacity":"3.6","coolingType":"Air cooled",
    "idleRpm":"1750","wotRpm":"3600 (governed)","wotPower":"6.5 hp @ 3,600 rpm","torqueNm":"12.5","shaftType":"Horizontal 3/4\" keyed","weightKg":"16",
    "notes":"Predator 212 cc (Non-Hemi) — the earlier flat-chamber head; parts differ from the Hemi (rods, valves, head). Same 70×55 mm bottom end. Verify valve lash against the Predator manual." }
  $p212n$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Predator 224
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='predator-224';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('predator-224','Predator','224','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $p224$
  { "year":"212 successor","strokeType":"4-Stroke","ccSize":"224","compressionRatio":"8.5:1","cylCount":"1",
    "valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves","plugType":"NGK BPR6ES","plugGap":"0.7",
    "coilType":"Transistor magneto","starterType":"Recoil only","fuelSystem":"Carburetted","fuelTankCapacity":"3.6","coolingType":"Air cooled",
    "idleRpm":"1750","wotRpm":"3600 (governed)","wotPower":"6.5 hp @ 3,600 rpm","shaftType":"Horizontal 3/4\" keyed","weightKg":"16",
    "notes":"Predator 224 cc — the updated replacement for the 212 in many markets; similar footprint and mounting, mild displacement bump. Bore/stroke omitted pending confirmation. Verify against the Predator manual." }
  $p224$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Predator 301
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='predator-301';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('predator-301','Predator','301','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $p301$
  { "year":"GX270-class clone","strokeType":"4-Stroke","ccSize":"301","compressionRatio":"8.5:1","cylCount":"1",
    "valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves","plugType":"NGK BPR6ES","plugGap":"0.7",
    "coilType":"Transistor magneto","starterType":"Recoil (electric optional)","fuelSystem":"Carburetted","fuelTankCapacity":"6.0","coolingType":"Air cooled",
    "idleRpm":"1750","wotRpm":"3600 (governed)","wotPower":"8.0 hp @ 3,600 rpm","shaftType":"Horizontal 1\" keyed","weightKg":"25",
    "notes":"Predator 301 cc — GX270-class single-cylinder clone; common on karts, mini-bikes and gensets. Bore/stroke omitted pending confirmation. Verify against the Predator manual." }
  $p301$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Predator 420
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='predator-420';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('predator-420','Predator','420','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $p420$
  { "year":"GX390-class clone","strokeType":"4-Stroke","ccSize":"420","compressionRatio":"8.0:1","cylCount":"1",
    "valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves","boreDiameter":"90.0","crankStroke":"66.0","pistonDiameter":"90.0",
    "intakeValveClear":"0.10–0.15 mm (cold, verify)","exhaustValveClear":"0.10–0.15 mm (cold, verify)","plugType":"NGK BPR6ES","plugGap":"0.7",
    "coilType":"Transistor magneto","starterType":"Recoil (electric optional)","fuelSystem":"Carburetted","fuelTankCapacity":"6.5","coolingType":"Air cooled",
    "idleRpm":"1750","wotRpm":"3600 (governed)","wotPower":"13 hp @ 3,600 rpm","torqueNm":"26","shaftType":"Horizontal 1\" keyed","weightKg":"34",
    "notes":"Predator 420 cc — GX390 clone (Loncin); the big-single workhorse for karts, log splitters, gensets, pressure washers. Big aftermarket. Verify valve lash against the Predator manual." }
  $p420$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Predator 459
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='predator-459';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('predator-459','Predator','459','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $p459$
  { "year":"Big single","strokeType":"4-Stroke","ccSize":"459","compressionRatio":"8.0:1","cylCount":"1",
    "valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves","plugType":"NGK BPR6ES","plugGap":"0.7",
    "coilType":"Transistor magneto","starterType":"Recoil (electric optional)","fuelSystem":"Carburetted","fuelTankCapacity":"6.5","coolingType":"Air cooled",
    "idleRpm":"1750","wotRpm":"3600 (governed)","wotPower":"15 hp @ 3,600 rpm","shaftType":"Horizontal 1\" keyed","weightKg":"36",
    "notes":"Predator 459 cc — larger single above the 420; common on bigger splitters and gensets. Bore/stroke omitted pending confirmation. Verify against the Predator manual." }
  $p459$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Predator 670 V-twin
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='predator-670';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('predator-670','Predator','670','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $p670$
  { "year":"GX620-class V-twin clone","strokeType":"4-Stroke","ccSize":"670","compressionRatio":"8.3:1","cylCount":"2",
    "firingOrder":"90° V-twin","valveTrain":"OHV (pushrod)","camType":"OHV — 4 valves","plugType":"NGK BPR6ES","plugGap":"0.7",
    "coilType":"Transistor magneto","starterType":"Electric + recoil","fuelSystem":"Carburetted","coolingType":"Air cooled",
    "idleRpm":"1400","wotRpm":"3600 (governed)","wotPower":"22 hp @ 3,600 rpm","shaftType":"Horizontal 1\" keyed (V-twin)","weightKg":"38",
    "notes":"Predator 670 cc — GX620/V-twin-class clone; popular for big karts, ZTR mower swaps and generators. Dual plugs NGK BPR6ES. Bore/stroke omitted pending confirmation. Verify against the Predator manual." }
  $p670$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Tillotson 212R
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='tillotson-212r';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('tillotson-212r','Tillotson','212R','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $t212$
  { "year":"Racing GX200-clone","strokeType":"4-Stroke","ccSize":"212","compressionRatio":"9.0:1","cylCount":"1",
    "valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves","boreDiameter":"70.0","crankStroke":"55.0","pistonDiameter":"70.0",
    "plugType":"NGK BPR6ES","plugGap":"0.7","coilType":"Transistor magneto","starterType":"Recoil only","fuelSystem":"Carburetted",
    "coolingType":"Air cooled","idleRpm":"1750","wotRpm":"6000+","wotPower":"~15 hp (race-built)","shaftType":"Horizontal 3/4\" keyed","weightKg":"16",
    "notes":"Tillotson 212R RS — factory race-prepped GX200-clone (billet rod, upgraded valve train, performance carb) aimed at kart racing classes. Runs well past the stock governed rpm. Verify build spec against Tillotson's documentation." }
  $t212$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Lifan 168F-2
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='lifan-168f-2';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('lifan-168f-2','Lifan','168F-2','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $l168$
  { "year":"GX160-clone (OEM)","strokeType":"4-Stroke","ccSize":"163","compressionRatio":"8.5:1","cylCount":"1",
    "valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves","boreDiameter":"68.0","crankStroke":"45.0","pistonDiameter":"68.0",
    "plugType":"NGK BPR6ES","plugGap":"0.7","coilType":"Transistor magneto","starterType":"Recoil (electric optional)","fuelSystem":"Carburetted",
    "coolingType":"Air cooled","idleRpm":"1750","wotRpm":"3600 (governed)","wotPower":"5.5 hp @ 3,600 rpm","shaftType":"Horizontal 3/4\" keyed","weightKg":"15",
    "notes":"Lifan 168F-2 — 163 cc GX160-clone (one of the common OEMs behind branded 6.5 hp engines). Interchangeable with GX160 in most fitments. Verify valve lash against the manufacturer's manual." }
  $l168$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Loncin G200F
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='loncin-g200f';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('loncin-g200f','Loncin','G200F','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $lg200$
  { "year":"GX200-clone (OEM)","strokeType":"4-Stroke","ccSize":"196","compressionRatio":"8.5:1","cylCount":"1",
    "valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves","boreDiameter":"68.0","crankStroke":"54.0","pistonDiameter":"68.0",
    "plugType":"NGK BPR6ES","plugGap":"0.7","coilType":"Transistor magneto","starterType":"Recoil (electric optional)","fuelSystem":"Carburetted",
    "coolingType":"Air cooled","idleRpm":"1750","wotRpm":"3600 (governed)","wotPower":"6.5 hp @ 3,600 rpm","shaftType":"Horizontal 3/4\" keyed","weightKg":"16",
    "notes":"Loncin G200F — 196 cc GX200-clone OEM behind many branded engines (Loncin also builds Predator and some BMW/motorcycle units). GX200-interchangeable. Verify valve lash against the manufacturer's manual." }
  $lg200$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- DuroMax XP7HP
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='duromax-xp7hp';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('duromax-xp7hp','DuroMax','XP7HP','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $dm7$
  { "year":"GX200-class clone","strokeType":"4-Stroke","ccSize":"208","compressionRatio":"8.5:1","cylCount":"1",
    "valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves","plugType":"NGK BPR6ES","plugGap":"0.7",
    "coilType":"Transistor magneto","starterType":"Recoil (electric optional)","fuelSystem":"Carburetted","fuelTankCapacity":"3.6","coolingType":"Air cooled",
    "idleRpm":"1750","wotRpm":"3600 (governed)","wotPower":"7 hp @ 3,600 rpm","shaftType":"Horizontal 3/4\" keyed","weightKg":"17",
    "notes":"DuroMax XP7HP — 208 cc GX200-class clone; common on pumps, karts and gensets. Bore/stroke omitted pending confirmation. Verify against the DuroMax manual." }
  $dm7$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Clone/import engine batch imported (11 engines).';
END $$;

-- ═══ Handheld 2-stroke — trimmers & blowers ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- Stihl FS 55
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-fs-55';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-fs-55','Stihl','FS 55','Trimmer',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $fs55$
  { "year":"Homeowner trimmer","strokeType":"2-Stroke","ccSize":"27.2","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK CMR6H","plugGap":"0.5","coilType":"Electronic","starterType":"Recoil only","fuelSystem":"Carburetted",
    "mixRatio":"50:1","fuelTankCapacity":"0.33","wotPower":"0.75 kW (1.0 hp)","weightKg":"5.0",
    "notes":"Stihl FS 55 — 27.2 cc straight-shaft trimmer, a long-running homeowner staple. 50:1 premix, plug NGK CMR6H. Verify against the Stihl manual." }
  $fs55$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Stihl FS 91 (4-MIX)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-fs-91';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-fs-91','Stihl','FS 91','Trimmer',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $fs91$
  { "year":"Pro trimmer (4-MIX)","strokeType":"4-Stroke (4-MIX)","ccSize":"28.4","cylCount":"1","coolingType":"Air cooled",
    "valveTrain":"OHV (4-MIX)","plugType":"NGK CMR6H","plugGap":"0.5","coilType":"Electronic","starterType":"Recoil only",
    "fuelSystem":"Carburetted","mixRatio":"50:1","fuelTankCapacity":"0.34","wotPower":"0.87 kW (1.2 hp)","weightKg":"5.6",
    "notes":"Stihl FS 91 — 28.4 cc 4-MIX pro-grade trimmer. 4-MIX is a valved 4-stroke that still runs on 50:1 premix (no separate oil) — check valve lash periodically. Plug NGK CMR6H. Verify against the Stihl manual." }
  $fs91$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Stihl FS 131 (4-MIX)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-fs-131';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-fs-131','Stihl','FS 131','Trimmer',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $fs131$
  { "year":"Pro trimmer/brushcutter (4-MIX)","strokeType":"4-Stroke (4-MIX)","ccSize":"36.3","cylCount":"1","coolingType":"Air cooled",
    "valveTrain":"OHV (4-MIX)","plugType":"NGK CMR6H","plugGap":"0.5","coilType":"Electronic","starterType":"Recoil only",
    "fuelSystem":"Carburetted","mixRatio":"50:1","fuelTankCapacity":"0.53","wotPower":"1.4 kW (1.9 hp)","weightKg":"5.8",
    "notes":"Stihl FS 131 — 36.3 cc 4-MIX pro trimmer/brushcutter. 50:1 premix, periodic valve check (4-MIX). Plug NGK CMR6H. Verify against the Stihl manual." }
  $fs131$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Stihl FS 250
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-fs-250';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-fs-250','Stihl','FS 250','Trimmer',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $fs250$
  { "year":"Pro brushcutter","strokeType":"2-Stroke","ccSize":"40.2","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK BPMR7A","plugGap":"0.5","coilType":"Electronic","starterType":"Recoil only","fuelSystem":"Carburetted",
    "mixRatio":"50:1","fuelTankCapacity":"0.64","wotPower":"1.6 kW (2.2 hp)","weightKg":"6.5",
    "notes":"Stihl FS 250 — 40.2 cc 2-stroke pro brushcutter, a torquey clearing-saw favourite. 50:1 premix, plug NGK BPMR7A. Verify against the Stihl manual." }
  $fs250$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Stihl BG 86
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-bg-86';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-bg-86','Stihl','BG 86','Blower',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $bg86$
  { "year":"Handheld blower","strokeType":"2-Stroke","ccSize":"27.2","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK CMR6H","plugGap":"0.5","coilType":"Electronic","starterType":"Recoil only","fuelSystem":"Carburetted",
    "mixRatio":"50:1","fuelTankCapacity":"0.44","wotPower":"0.8 kW (1.1 hp)","weightKg":"4.4",
    "notes":"Stihl BG 86 — 27.2 cc handheld blower, a landscaping workhorse (~750 m³/h air). 50:1 premix, plug NGK CMR6H. Verify against the Stihl manual." }
  $bg86$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Stihl BR 600 (4-MIX)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-br-600';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-br-600','Stihl','BR 600','Blower',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $br600$
  { "year":"Backpack blower (4-MIX)","strokeType":"4-Stroke (4-MIX)","ccSize":"64.8","cylCount":"1","coolingType":"Air cooled",
    "valveTrain":"OHV (4-MIX)","plugType":"NGK CMR6H","plugGap":"0.5","coilType":"Electronic","starterType":"Recoil only",
    "fuelSystem":"Carburetted","mixRatio":"50:1","fuelTankCapacity":"1.4","wotPower":"2.8 kW (3.8 hp)","weightKg":"9.8",
    "notes":"Stihl BR 600 — 64.8 cc 4-MIX backpack blower, an industry benchmark for quiet, fuel-efficient power. 50:1 premix, periodic valve check (4-MIX). Plug NGK CMR6H. Verify against the Stihl manual." }
  $br600$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Stihl BR 700
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-br-700';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-br-700','Stihl','BR 700','Blower',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $br700$
  { "year":"Backpack blower (4-MIX)","strokeType":"4-Stroke (4-MIX)","ccSize":"64.8","cylCount":"1","coolingType":"Air cooled",
    "valveTrain":"OHV (4-MIX)","plugType":"NGK CMR6H","plugGap":"0.5","coilType":"Electronic","starterType":"Recoil only",
    "fuelSystem":"Carburetted","mixRatio":"50:1","fuelTankCapacity":"1.4","wotPower":"2.8 kW (3.8 hp)","weightKg":"10.5",
    "notes":"Stihl BR 700 — 64.8 cc 4-MIX backpack blower, the higher-output sibling of the BR 600 with improved air flow. 50:1 premix. Plug NGK CMR6H. Verify against the Stihl manual." }
  $br700$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Husqvarna 128LD
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='husqvarna-128ld';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('husqvarna-128ld','Husqvarna','128LD','Trimmer',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $h128$
  { "year":"Homeowner trimmer (detachable)","strokeType":"2-Stroke","ccSize":"28.0","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK CMR7H","plugGap":"0.5","coilType":"Electronic","starterType":"Recoil only","fuelSystem":"Carburetted",
    "mixRatio":"50:1","fuelTankCapacity":"0.34","wotPower":"0.8 kW (1.1 hp)","weightKg":"5.0",
    "notes":"Husqvarna 128LD — 28 cc detachable-shaft trimmer (accepts the Husqvarna attachment system). 50:1 premix, plug NGK CMR7H. Verify against the Husqvarna manual." }
  $h128$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Husqvarna 525LS
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='husqvarna-525ls';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('husqvarna-525ls','Husqvarna','525LS','Trimmer',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $h525$
  { "year":"Professional trimmer","strokeType":"2-Stroke","ccSize":"25.4","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK CMR7H","plugGap":"0.5","coilType":"Electronic","starterType":"Recoil only","fuelSystem":"Carburetted",
    "mixRatio":"50:1","fuelTankCapacity":"0.51","wotPower":"1.0 kW (1.34 hp)","weightKg":"5.5",
    "notes":"Husqvarna 525LS — 25.4 cc professional straight-shaft trimmer, light and high-revving for its class. 50:1 premix, plug NGK CMR7H. Verify against the Husqvarna manual." }
  $h525$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Husqvarna 350BT
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='husqvarna-350bt';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('husqvarna-350bt','Husqvarna','350BT','Blower',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $h350$
  { "year":"Backpack blower","strokeType":"2-Stroke","ccSize":"50.2","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK CMR7H","plugGap":"0.5","coilType":"Electronic","starterType":"Recoil only","fuelSystem":"Carburetted",
    "mixRatio":"50:1","fuelTankCapacity":"1.25","wotPower":"1.6 kW (2.1 hp)","weightKg":"10.2",
    "notes":"Husqvarna 350BT — 50.2 cc X-Torq backpack blower, a popular mid-size commercial unit. 50:1 premix, plug NGK CMR7H. Verify against the Husqvarna manual." }
  $h350$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Husqvarna 580BTS
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='husqvarna-580bts';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('husqvarna-580bts','Husqvarna','580BTS','Blower',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $h580$
  { "year":"Backpack blower (pro)","strokeType":"2-Stroke","ccSize":"75.6","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK CMR7H","plugGap":"0.5","coilType":"Electronic","starterType":"Recoil only","fuelSystem":"Carburetted",
    "mixRatio":"50:1","fuelTankCapacity":"2.6","wotPower":"3.1 kW (4.2 hp)","weightKg":"11.8",
    "notes":"Husqvarna 580BTS — 75.6 cc X-Torq professional backpack blower, one of the highest-output commercial blowers. 50:1 premix, plug NGK CMR7H. Verify against the Husqvarna manual." }
  $h580$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Echo SRM-225
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='echo-srm-225';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('echo-srm-225','Echo','SRM-225','Trimmer',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $srm225$
  { "year":"Trimmer","strokeType":"2-Stroke","ccSize":"21.2","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK CMR6H","plugGap":"0.5","coilType":"Electronic","starterType":"Recoil only","fuelSystem":"Carburetted",
    "mixRatio":"50:1","fuelTankCapacity":"0.44","wotPower":"0.67 kW (0.9 hp)","weightKg":"4.6",
    "notes":"Echo SRM-225 — 21.2 cc straight-shaft trimmer, a light and reliable commercial-grade unit. 50:1 premix, plug commonly NGK CMR6H. Verify against the Echo manual." }
  $srm225$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Echo SRM-2620
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='echo-srm-2620';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('echo-srm-2620','Echo','SRM-2620','Trimmer',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $srm2620$
  { "year":"Professional trimmer","strokeType":"2-Stroke","ccSize":"25.4","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK CMR6H","plugGap":"0.5","coilType":"Electronic","starterType":"Recoil only","fuelSystem":"Carburetted",
    "mixRatio":"50:1","fuelTankCapacity":"0.67","wotPower":"0.9 kW (1.2 hp)","weightKg":"5.4",
    "notes":"Echo SRM-2620 — 25.4 cc professional trimmer with a high-torque gearcase; a landscaper favourite. 50:1 premix. Verify plug/gap against the Echo manual." }
  $srm2620$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Echo PB-580
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='echo-pb-580';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('echo-pb-580','Echo','PB-580','Blower',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $pb580$
  { "year":"Backpack blower","strokeType":"2-Stroke","ccSize":"58.2","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK BPMR7A","plugGap":"0.65","coilType":"Electronic","starterType":"Recoil only","fuelSystem":"Carburetted",
    "mixRatio":"50:1","fuelTankCapacity":"1.9","wotPower":"2.4 kW (3.2 hp)","weightKg":"10.9",
    "notes":"Echo PB-580 — 58.2 cc backpack blower, a durable mid/large commercial unit. 50:1 premix. Verify plug/gap against the Echo manual." }
  $pb580$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Echo PB-8010
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='echo-pb-8010';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('echo-pb-8010','Echo','PB-8010','Blower',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $pb8010$
  { "year":"Backpack blower (flagship)","strokeType":"2-Stroke","ccSize":"79.9","cylCount":"1","coolingType":"Air cooled",
    "plugType":"NGK BPMR7A","plugGap":"0.65","coilType":"Electronic","starterType":"Recoil only","fuelSystem":"Carburetted",
    "mixRatio":"50:1","fuelTankCapacity":"2.5","wotPower":"3.8 kW (5.2 hp)","weightKg":"11.9",
    "notes":"Echo PB-8010 — 79.9 cc backpack blower, marketed as the world's most powerful (~1360 m³/h, ~211 mph). 50:1 premix. Verify plug/gap against the Echo manual." }
  $pb8010$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Handheld 2-stroke batch imported (15 units).';
END $$;

-- ═══ Lawn & commercial V-twins (Kawasaki FR/FX, Kohler, B&S Vanguard/Intek) ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- Kawasaki FR691V
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kawasaki-fr691v';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kawasaki-fr691v','Kawasaki','FR691V','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $fr691$
  { "year":"Residential V-twin","strokeType":"4-Stroke","ccSize":"726","cylCount":"2","firingOrder":"90° V-twin","valveTrain":"OHV (pushrod)",
    "camType":"OHV — 4 valves","coolingType":"Air cooled","fuelSystem":"Carburetted","starterType":"Electric","plugType":"NGK BPR4ES","plugGap":"0.75",
    "coilType":"Transistor magneto","wotRpm":"3600 (governed)","wotPower":"23 hp @ 3,600 rpm","shaftType":"Vertical (mower)","weightKg":"35",
    "notes":"Kawasaki FR691V — 726 cc air-cooled OHV V-twin, a very common residential zero-turn engine. Plug NGK BPR4ES. Oil ~1.8 L with filter. Verify valve lash (some models hydraulic) against the Kawasaki manual." }
  $fr691$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kawasaki FR730V
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kawasaki-fr730v';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kawasaki-fr730v','Kawasaki','FR730V','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $fr730$
  { "year":"Residential V-twin","strokeType":"4-Stroke","ccSize":"726","cylCount":"2","firingOrder":"90° V-twin","valveTrain":"OHV (pushrod)",
    "camType":"OHV — 4 valves","coolingType":"Air cooled","fuelSystem":"Carburetted","starterType":"Electric","plugType":"NGK BPR4ES","plugGap":"0.75",
    "coilType":"Transistor magneto","wotRpm":"3600 (governed)","wotPower":"24 hp @ 3,600 rpm","shaftType":"Vertical (mower)","weightKg":"36",
    "notes":"Kawasaki FR730V — 726 cc air-cooled OHV V-twin, top of the residential FR series. Plug NGK BPR4ES. Oil ~1.8 L with filter. Verify lash against the Kawasaki manual." }
  $fr730$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kawasaki FX730V
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kawasaki-fx730v';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kawasaki-fx730v','Kawasaki','FX730V','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $fx730$
  { "year":"Commercial V-twin","strokeType":"4-Stroke","ccSize":"726","cylCount":"2","firingOrder":"90° V-twin","valveTrain":"OHV (pushrod)",
    "camType":"OHV — 4 valves","coolingType":"Air cooled","fuelSystem":"Carburetted","starterType":"Electric","plugType":"NGK BPR4ES","plugGap":"0.75",
    "coilType":"Transistor magneto","wotRpm":"3600 (governed)","wotPower":"23.5 hp @ 3,600 rpm","shaftType":"Vertical (mower)","weightKg":"39",
    "notes":"Kawasaki FX730V — 726 cc air-cooled OHV V-twin, the commercial-duty FX (heavier build, cast-iron liners, canister filter). Common on commercial ZTRs. Plug NGK BPR4ES. Verify lash against the Kawasaki manual." }
  $fx730$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kawasaki FX850V
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kawasaki-fx850v';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kawasaki-fx850v','Kawasaki','FX850V','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $fx850$
  { "year":"Commercial V-twin","strokeType":"4-Stroke","ccSize":"852","cylCount":"2","firingOrder":"90° V-twin","valveTrain":"OHV (pushrod)",
    "camType":"OHV — 4 valves","coolingType":"Air cooled","fuelSystem":"Carburetted","starterType":"Electric","plugType":"NGK BPR4ES","plugGap":"0.75",
    "coilType":"Transistor magneto","wotRpm":"3600 (governed)","wotPower":"27 hp @ 3,600 rpm","shaftType":"Vertical (mower)","weightKg":"40",
    "notes":"Kawasaki FX850V — 852 cc air-cooled OHV commercial V-twin. Common on larger commercial ZTRs. Plug NGK BPR4ES. Verify lash against the Kawasaki manual." }
  $fx850$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kawasaki FX1000V
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kawasaki-fx1000v';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kawasaki-fx1000v','Kawasaki','FX1000V','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $fx1000$
  { "year":"Commercial V-twin","strokeType":"4-Stroke","ccSize":"999","cylCount":"2","firingOrder":"90° V-twin","valveTrain":"OHV (pushrod)",
    "camType":"OHV — 4 valves","coolingType":"Air cooled","fuelSystem":"Carburetted / EFI","starterType":"Electric","plugType":"NGK BPR4ES","plugGap":"0.75",
    "coilType":"Transistor magneto","wotRpm":"3600 (governed)","wotPower":"35 hp @ 3,600 rpm","shaftType":"Vertical (mower)","weightKg":"45",
    "notes":"Kawasaki FX1000V — 999 cc air-cooled OHV commercial V-twin, the big-bore FX (carb and EFI versions). Large commercial ZTRs and outfront mowers. Plug NGK BPR4ES. Verify lash against the Kawasaki manual." }
  $fx1000$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kohler CH270 (single)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kohler-ch270';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kohler-ch270','Kohler','CH270','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ch270$
  { "year":"Command Pro single","strokeType":"4-Stroke","ccSize":"208","cylCount":"1","valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves",
    "coolingType":"Air cooled","fuelSystem":"Carburetted","starterType":"Recoil (electric optional)","plugType":"Champion RC12YC","plugGap":"0.76",
    "coilType":"Transistor magneto","idleRpm":"1400","wotRpm":"3600 (governed)","wotPower":"7 hp @ 3,600 rpm","shaftType":"Horizontal (various PTO)","weightKg":"22",
    "notes":"Kohler Command Pro CH270 — 208 cc OHV single, GX200-class general-purpose engine. Plug Champion RC12YC. Verify lash/oil against the Kohler manual." }
  $ch270$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kohler CH440 (single)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kohler-ch440';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kohler-ch440','Kohler','CH440','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ch440$
  { "year":"Command Pro single","strokeType":"4-Stroke","ccSize":"429","cylCount":"1","valveTrain":"OHV (pushrod)","camType":"OHV — 2 valves",
    "coolingType":"Air cooled","fuelSystem":"Carburetted","starterType":"Recoil (electric optional)","plugType":"Champion RC12YC","plugGap":"0.76",
    "coilType":"Transistor magneto","idleRpm":"1400","wotRpm":"3600 (governed)","wotPower":"14 hp @ 3,600 rpm","shaftType":"Horizontal (various PTO)","weightKg":"35",
    "notes":"Kohler Command Pro CH440 — 429 cc OHV single, GX390-class big single for splitters, karts and gensets. Plug Champion RC12YC. Verify lash/oil against the Kohler manual." }
  $ch440$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kohler CH740 (V-twin)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kohler-ch740';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kohler-ch740','Kohler','CH740','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ch740$
  { "year":"Command Pro V-twin","strokeType":"4-Stroke","ccSize":"725","cylCount":"2","firingOrder":"V-twin","valveTrain":"OHV (pushrod)","camType":"OHV — 4 valves",
    "coolingType":"Air cooled","fuelSystem":"Carburetted","starterType":"Electric","plugType":"Champion RC12YC","plugGap":"0.76",
    "coilType":"Transistor magneto","wotRpm":"3600 (governed)","wotPower":"25 hp @ 3,600 rpm","shaftType":"Horizontal / vertical","weightKg":"42",
    "notes":"Kohler Command Pro CH740 — 725 cc air-cooled OHV V-twin, a commercial-grade twin for mowers and machinery. Plug Champion RC12YC. Verify lash/oil against the Kohler manual." }
  $ch740$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kohler KT745 (7000 series V-twin)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kohler-kt745';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kohler-kt745','Kohler','KT745','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $kt745$
  { "year":"7000 Series residential V-twin","strokeType":"4-Stroke","ccSize":"747","cylCount":"2","firingOrder":"V-twin","valveTrain":"OHV (pushrod, hydraulic lifters)","camType":"OHV — 4 valves",
    "coolingType":"Air cooled","fuelSystem":"Carburetted","starterType":"Electric","plugType":"Champion RC12YC","plugGap":"0.76",
    "coilType":"Transistor magneto","wotRpm":"3600 (governed)","wotPower":"26 hp @ 3,600 rpm","shaftType":"Vertical (mower)","weightKg":"37",
    "notes":"Kohler KT745 (7000 Series) — 747 cc residential OHV V-twin with hydraulic valve lifters (no lash adjustment). Common on garden tractors and residential ZTRs. Plug Champion RC12YC. Verify oil/service against the Kohler manual." }
  $kt745$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Briggs Vanguard 810 V-twin
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='briggs-vanguard-810';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('briggs-vanguard-810','Briggs & Stratton','Vanguard 810','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $vg810$
  { "year":"Commercial V-twin (Big Block)","strokeType":"4-Stroke","ccSize":"810","cylCount":"2","firingOrder":"90° V-twin","valveTrain":"OHV (pushrod)","camType":"OHV — 4 valves",
    "coolingType":"Air cooled","fuelSystem":"Carburetted","starterType":"Electric","plugType":"Champion RC12YC","plugGap":"0.76",
    "coilType":"Transistor magneto","wotRpm":"3600 (governed)","wotPower":"28 hp @ 3,600 rpm","shaftType":"Vertical / horizontal","weightKg":"42",
    "notes":"Briggs & Stratton Vanguard 810 — 810 cc air-cooled OHV commercial V-twin (Daihatsu-designed 'Big Block'), full-pressure lubrication with spin-on filter. Common on commercial ZTRs and machinery. Plug Champion RC12YC. Verify lash/oil against the Briggs manual." }
  $vg810$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Briggs Intek V-Twin
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='briggs-intek-v-twin';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('briggs-intek-v-twin','Briggs & Stratton','Intek V-Twin','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $intek$
  { "year":"Residential V-twin","strokeType":"4-Stroke","ccSize":"724","cylCount":"2","firingOrder":"V-twin","valveTrain":"OHV (pushrod)","camType":"OHV — 4 valves",
    "coolingType":"Air cooled","fuelSystem":"Carburetted","starterType":"Electric","plugType":"Champion RC12YC","plugGap":"0.76",
    "coilType":"Transistor magneto","wotRpm":"3600 (governed)","wotPower":"~23 hp @ 3,600 rpm","shaftType":"Vertical (mower)","weightKg":"38",
    "notes":"Briggs & Stratton Intek V-Twin — ~724 cc air-cooled OHV residential V-twin, extremely common on lawn/garden tractors. (Displacement varies a little by series.) Plug Champion RC12YC. Verify exact displacement/lash for your model against the Briggs manual." }
  $intek$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Lawn/commercial V-twin batch imported (11 engines).';
END $$;

-- ═══ Classic 2-stroke outboards ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- Mercury 9.9 (2-stroke)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='mercury-9-9-2-stroke';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('mercury-9-9-2-stroke','Mercury','9.9 (2-Stroke)','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $m99t$
  { "year":"Classic 2-stroke","strokeType":"2-Stroke","ccSize":"262","cylCount":"2","coolingType":"Liquid cooled","fuelSystem":"Carburetted",
    "mixRatio":"50:1 (or oil-injected)","starterType":"Manual / electric","wotRpm":"4500–5500","wotPower":"9.9 hp",
    "obShaftLength":"15\" / 20\"","obTiltTrim":"Manual tilt","obSteering":"Tiller","obLowerUnitOilType":"SAE 90 gear lube",
    "obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"37",
    "notes":"Mercury 9.9 (2-stroke) — classic 2-cyl loop-charged carbureted outboard; simple and rebuildable, a long-running tiller/kicker. 50:1 premix (or oil-injected on some). Verify plug/timing against the Mercury manual." }
  $m99t$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Mercury 40 (2-stroke, 3-cyl)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='mercury-40-2-stroke';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('mercury-40-2-stroke','Mercury','40 (2-Stroke)','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $m40t$
  { "year":"Classic 2-stroke","strokeType":"2-Stroke","ccSize":"644","cylCount":"3","coolingType":"Liquid cooled","fuelSystem":"Carburetted",
    "mixRatio":"50:1 (or oil-injected)","starterType":"Electric / manual","wotRpm":"5000–5500","wotPower":"40 hp",
    "obShaftLength":"20\"","obTiltTrim":"Power trim & tilt","obSteering":"Tiller / remote","obLowerUnitOilType":"SAE 90 gear lube",
    "obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"78",
    "notes":"Mercury 40 (2-stroke) — classic 3-cylinder carbureted outboard, a popular tinny/tender motor. 50:1 premix or oil injection. Verify plug/timing against the Mercury manual." }
  $m40t$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Mercury 115 (2-stroke, inline-4)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='mercury-115-2-stroke';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('mercury-115-2-stroke','Mercury','115 (2-Stroke)','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $m115t$
  { "year":"Classic 2-stroke","strokeType":"2-Stroke","ccSize":"1710","cylCount":"4","coolingType":"Liquid cooled","fuelSystem":"Carburetted",
    "mixRatio":"Oil-injected (or 50:1)","starterType":"Electric","wotRpm":"5000–5500","wotPower":"115 hp",
    "obShaftLength":"20\" / 25\"","obTiltTrim":"Power trim & tilt","obSteering":"Remote","obLowerUnitOilType":"SAE 90 gear lube",
    "obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"163",
    "notes":"Mercury 115 (2-stroke) — classic inline-4 carbureted outboard, a workhorse on runabouts and bass boats. Oil-injected (or premix). Verify displacement/plug/timing against the Mercury manual." }
  $m115t$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Mercury 150 Black Max (2.5L V6)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='mercury-150-black-max';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('mercury-150-black-max','Mercury','150 Black Max','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $mbm$
  { "year":"Classic 2-stroke V6","strokeType":"2-Stroke","ccSize":"2496","cylCount":"6","firingOrder":"60° V6","coolingType":"Liquid cooled","fuelSystem":"Carburetted",
    "mixRatio":"Oil-injected","starterType":"Electric","wotRpm":"5000–5500","wotPower":"150 hp",
    "obShaftLength":"20\" / 25\"","obTiltTrim":"Power trim & tilt","obSteering":"Remote","obLowerUnitOilType":"SAE 90 gear lube",
    "obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"191",
    "notes":"Mercury 150 Black Max / XR — the classic 2.5 L 60° V6 2-stroke, a legendary bass-boat and offshore powerplant with a huge rebuild/aftermarket community. Oil-injected. Verify plug/timing against the Mercury manual." }
  $mbm$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Johnson/Evinrude 9.9 (2-stroke)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='evinrude-9-9-2-stroke';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('evinrude-9-9-2-stroke','Evinrude','9.9 (2-Stroke)','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ev99$
  { "year":"Classic 2-stroke (OMC)","strokeType":"2-Stroke","ccSize":"211","cylCount":"2","coolingType":"Liquid cooled","fuelSystem":"Carburetted",
    "mixRatio":"50:1 (or VRO oil-injected)","starterType":"Manual / electric","wotRpm":"4500–5500","wotPower":"9.9 hp",
    "obShaftLength":"15\" / 20\"","obTiltTrim":"Manual tilt","obSteering":"Tiller","obLowerUnitOilType":"SAE 90 gear lube",
    "obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"32",
    "notes":"Johnson/Evinrude 9.9 (OMC 2-stroke) — classic 2-cyl carbureted kicker, shared across the Johnson & Evinrude badges. 50:1 premix or VRO oil injection. Verify plug/timing against the OMC/BRP manual." }
  $ev99$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Evinrude 40 (2-stroke)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='evinrude-40-2-stroke';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('evinrude-40-2-stroke','Evinrude','40 (2-Stroke)','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ev40$
  { "year":"Classic 2-stroke (OMC)","strokeType":"2-Stroke","ccSize":"521","cylCount":"2","coolingType":"Liquid cooled","fuelSystem":"Carburetted",
    "mixRatio":"50:1 (or VRO)","starterType":"Electric / manual","wotRpm":"4500–5500","wotPower":"40 hp",
    "obShaftLength":"15\" / 20\"","obTiltTrim":"Manual / power tilt","obSteering":"Tiller / remote","obLowerUnitOilType":"SAE 90 gear lube",
    "obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"70",
    "notes":"Johnson/Evinrude 40 (OMC 2-stroke) — classic 2-cyl carbureted outboard. 50:1 premix or VRO oil injection. Verify displacement/plug/timing against the OMC/BRP manual." }
  $ev40$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Johnson 70 (3-cyl 2-stroke)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='johnson-70-2-stroke';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('johnson-70-2-stroke','Johnson','70 (2-Stroke)','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $j70$
  { "year":"Classic 2-stroke (OMC)","strokeType":"2-Stroke","cylCount":"3","coolingType":"Liquid cooled","fuelSystem":"Carburetted",
    "mixRatio":"50:1 (or VRO)","starterType":"Electric","wotRpm":"4500–5500","wotPower":"70 hp",
    "obShaftLength":"20\"","obTiltTrim":"Power trim & tilt","obSteering":"Remote","obLowerUnitOilType":"SAE 90 gear lube",
    "obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"104",
    "notes":"Johnson/Evinrude 70 (OMC 2-stroke) — classic 3-cyl carbureted outboard. 50:1 premix or VRO. Displacement omitted pending confirmation. Verify plug/timing against the OMC/BRP manual." }
  $j70$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Evinrude 90 (V4 2-stroke)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='evinrude-90-v4';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('evinrude-90-v4','Evinrude','90 (V4)','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ev90$
  { "year":"Classic 2-stroke V4 (OMC)","strokeType":"2-Stroke","ccSize":"1600","cylCount":"4","firingOrder":"90° V4","coolingType":"Liquid cooled","fuelSystem":"Carburetted",
    "mixRatio":"50:1 (or VRO)","starterType":"Electric","wotRpm":"4500–5500","wotPower":"90 hp",
    "obShaftLength":"20\" / 25\"","obTiltTrim":"Power trim & tilt","obSteering":"Remote","obLowerUnitOilType":"SAE 90 gear lube",
    "obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"143",
    "notes":"Johnson/Evinrude 90 (OMC 90° V4 2-stroke) — the classic ~1.6 L V4 loop-charged carbureted outboard (also 100/112/115 hp). 50:1 premix or VRO. Verify plug/timing against the OMC/BRP manual." }
  $ev90$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Evinrude E-TEC 150 (DI 2-stroke)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='evinrude-e-tec-150';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('evinrude-e-tec-150','Evinrude','E-TEC 150','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $etec$
  { "year":"Direct-injection 2-stroke (BRP)","strokeType":"2-Stroke","ccSize":"2589","cylCount":"6","firingOrder":"60° V6","coolingType":"Liquid cooled","fuelSystem":"Direct injection (E-TEC)",
    "mixRatio":"Auto oil injection (no premix)","starterType":"Electric","wotRpm":"5000–6000","wotPower":"150 hp",
    "obShaftLength":"20\" / 25\"","obTiltTrim":"Power trim & tilt","obSteering":"Remote","obLowerUnitOilType":"SAE 90 gear lube",
    "obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"196",
    "notes":"Evinrude E-TEC 150 — BRP's direct-injection 2-stroke V6; no scheduled dealer maintenance for years, auto oil injection (no premix), clean-burning. Discontinued 2020 but well supported. Verify against the BRP manual." }
  $etec$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha 40 (2-stroke)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-40-2-stroke';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-40-2-stroke','Yamaha','40 (2-Stroke)','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $y40t$
  { "year":"Classic 2-stroke","strokeType":"2-Stroke","ccSize":"703","cylCount":"3","coolingType":"Liquid cooled","fuelSystem":"Carburetted",
    "mixRatio":"50:1 (or oil-injected)","starterType":"Electric / manual","wotRpm":"4500–5500","wotPower":"40 hp",
    "obShaftLength":"15\" / 20\"","obTiltTrim":"Power trim & tilt","obSteering":"Tiller / remote","obLowerUnitOilType":"SAE 90 gear lube",
    "obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"71",
    "notes":"Yamaha 40 (2-stroke) — classic 3-cyl carbureted outboard (the 2-stroke 40/50 family), famously durable. 50:1 premix or oil injection. Verify plug/timing against the Yamaha manual." }
  $y40t$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Tohatsu 9.8 (2-stroke)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='tohatsu-9-8-2-stroke';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('tohatsu-9-8-2-stroke','Tohatsu','9.8 (2-Stroke)','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $t98$
  { "year":"Classic 2-stroke","strokeType":"2-Stroke","ccSize":"169","cylCount":"2","coolingType":"Liquid cooled","fuelSystem":"Carburetted",
    "mixRatio":"50:1","starterType":"Manual","wotRpm":"4500–5500","wotPower":"9.8 hp",
    "obShaftLength":"15\" / 20\"","obTiltTrim":"Manual tilt","obSteering":"Tiller","obLowerUnitOilType":"SAE 90 gear lube",
    "obAnodeMaterial":"Sacrificial anode (per water type)","weightKg":"26",
    "notes":"Tohatsu 9.8 (2-stroke) — light 2-cyl carbureted outboard, one of the lightest in class; a popular tender/kicker. 50:1 premix. Verify plug/timing against the Tohatsu manual." }
  $t98$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Classic 2-stroke outboard batch imported (11 motors).';
END $$;

-- ═══ ATV / UTV / side-by-side ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- Honda TRX420 Rancher
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-trx420-rancher';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-trx420-rancher','Honda','TRX420 Rancher','Quad Bike',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $trx420$
  { "year":"Utility ATV","strokeType":"4-Stroke","ccSize":"420","cylCount":"1","valveTrain":"OHV","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI)",
    "starterType":"Electric","driveType":"Shaft","transType":"Manual / DCT / auto (by trim)","wotPower":"~27 hp","tyreSizeFront":"24x8-12","tyreSizeRear":"24x10-11",
    "frontBrakeType":"Dual hydraulic disc","rearBrakeType":"Sealed / drum","fuelTankCapacity":"14.7","weightKg":"250","groundClearanceMm":"185",
    "notes":"Honda TRX420 Rancher — 420 cc liquid-cooled EFI single utility ATV, offered in manual, ESP, DCT and IRS trims. A best-selling farm/hunting quad. Verify plug/lash against the Honda manual." }
  $trx420$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Honda TRX520 Foreman
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-trx520-foreman';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-trx520-foreman','Honda','TRX520 Foreman','Quad Bike',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $trx520$
  { "year":"Utility ATV","strokeType":"4-Stroke","ccSize":"518","cylCount":"1","valveTrain":"OHV","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI)",
    "starterType":"Electric","driveType":"Shaft","transType":"Manual / DCT","wotPower":"~30 hp","tyreSizeFront":"24x8-12","tyreSizeRear":"24x10-11",
    "frontBrakeType":"Dual hydraulic disc","rearBrakeType":"Sealed","fuelTankCapacity":"16.4","weightKg":"270","groundClearanceMm":"200",
    "notes":"Honda TRX520 Foreman — 518 cc liquid-cooled EFI single utility ATV (manual or DCT), a heavy-duty workhorse. Verify plug/lash against the Honda manual." }
  $trx520$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha Raptor 700
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-raptor-700';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-raptor-700','Yamaha','Raptor 700','Quad Bike',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $raptor$
  { "year":"Sport ATV","strokeType":"4-Stroke","ccSize":"686","cylCount":"1","valveTrain":"SOHC 4v","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI)",
    "starterType":"Electric","driveType":"Chain","transType":"5-speed + reverse","clutchType":"Multi-plate wet","wotPower":"~45 hp","tyreSizeFront":"22x7-10","tyreSizeRear":"20x10-9",
    "frontBrakeType":"Dual hydraulic disc","rearBrakeType":"Hydraulic disc","fuelTankCapacity":"10","weightKg":"192","seatHeightMm":"825",
    "notes":"Yamaha Raptor 700 — 686 cc liquid-cooled SOHC single sport ATV, the benchmark big-bore sport quad. 5-speed with reverse, chain final drive. Verify plug/lash against the Yamaha manual." }
  $raptor$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha Grizzly 700
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-grizzly-700';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-grizzly-700','Yamaha','Grizzly 700','Quad Bike',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $grizzly$
  { "year":"Utility ATV","strokeType":"4-Stroke","ccSize":"686","cylCount":"1","valveTrain":"SOHC 4v","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI)",
    "starterType":"Electric","driveType":"Shaft","transType":"CVT (Ultramatic)","wotPower":"~45 hp","tyreSizeFront":"25x8-12","tyreSizeRear":"25x10-12",
    "frontBrakeType":"Dual hydraulic disc","rearBrakeType":"Sealed wet","fuelTankCapacity":"20","weightKg":"296","groundClearanceMm":"290",
    "notes":"Yamaha Grizzly 700 — 686 cc liquid-cooled SOHC single utility ATV with the Ultramatic CVT (all-time engine braking) and shaft drive. A durable trail/work quad. Verify plug/lash against the Yamaha manual." }
  $grizzly$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha YFZ450R
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-yfz450r';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-yfz450r','Yamaha','YFZ450R','Quad Bike',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $yfz$
  { "year":"Sport ATV (race)","strokeType":"4-Stroke","ccSize":"449","cylCount":"1","valveTrain":"DOHC 5v","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI)",
    "starterType":"Electric","driveType":"Chain","transType":"5-speed","clutchType":"Multi-plate wet","wotPower":"~42 hp","tyreSizeFront":"21x7-10","tyreSizeRear":"20x10-9",
    "frontBrakeType":"Dual hydraulic disc","rearBrakeType":"Hydraulic disc","fuelTankCapacity":"10","weightKg":"180",
    "notes":"Yamaha YFZ450R — 449 cc liquid-cooled DOHC titanium-valve sport/race ATV, the class benchmark for MX and GNCC. Aluminium/steel hybrid frame, 5-speed. Verify plug/lash against the Yamaha manual." }
  $yfz$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Polaris Sportsman 570
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='polaris-sportsman-570';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('polaris-sportsman-570','Polaris','Sportsman 570','Quad Bike',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $sport570$
  { "year":"Utility ATV","strokeType":"4-Stroke","ccSize":"567","cylCount":"1","valveTrain":"DOHC 4v","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI)",
    "starterType":"Electric","driveType":"Shaft (on-demand AWD)","transType":"CVT (PVT)","wotPower":"44 hp","tyreSizeFront":"25x8-12","tyreSizeRear":"25x10-12",
    "frontBrakeType":"Hydraulic disc","rearBrakeType":"Hydraulic disc","fuelTankCapacity":"17","weightKg":"318","groundClearanceMm":"290",
    "notes":"Polaris Sportsman 570 — 567 cc ProStar DOHC single utility ATV with on-demand AWD and CVT. One of the best-selling utility quads. Verify plug/lash against the Polaris manual." }
  $sport570$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Can-Am Outlander 650
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='can-am-outlander-650';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('can-am-outlander-650','Can-Am','Outlander 650','Quad Bike',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $out650$
  { "year":"Utility ATV","strokeType":"4-Stroke","ccSize":"649","cylCount":"2","firingOrder":"V-twin","valveTrain":"SOHC 8v","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI)",
    "starterType":"Electric","driveType":"Shaft","transType":"CVT","wotPower":"62 hp","tyreSizeFront":"25x8-12","tyreSizeRear":"25x10-12",
    "frontBrakeType":"Dual hydraulic disc","rearBrakeType":"Hydraulic disc","fuelTankCapacity":"20","weightKg":"327","groundClearanceMm":"280",
    "notes":"Can-Am Outlander 650 — 649 cc Rotax V-twin utility ATV, class-leading power. CVT, shaft drive. Verify plug/lash against the Can-Am/Rotax manual." }
  $out650$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Can-Am Outlander 1000
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='can-am-outlander-1000';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('can-am-outlander-1000','Can-Am','Outlander 1000','Quad Bike',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $out1000$
  { "year":"Utility ATV","strokeType":"4-Stroke","ccSize":"976","cylCount":"2","firingOrder":"V-twin","valveTrain":"SOHC 8v","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI)",
    "starterType":"Electric","driveType":"Shaft","transType":"CVT","wotPower":"91 hp","tyreSizeFront":"26x8-14","tyreSizeRear":"26x10-14",
    "frontBrakeType":"Dual hydraulic disc","rearBrakeType":"Hydraulic disc","fuelTankCapacity":"20","weightKg":"365","groundClearanceMm":"305",
    "notes":"Can-Am Outlander 1000 — 976 cc Rotax V-twin, the most powerful utility ATV class. CVT, shaft drive. Verify plug/lash against the Can-Am/Rotax manual." }
  $out1000$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Suzuki KingQuad 750
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='suzuki-kingquad-750';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('suzuki-kingquad-750','Suzuki','KingQuad 750','Quad Bike',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $kingquad$
  { "year":"Utility ATV","strokeType":"4-Stroke","ccSize":"722","cylCount":"1","valveTrain":"SOHC 4v","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI)",
    "starterType":"Electric","driveType":"Shaft","transType":"CVT (QuadMatic)","wotPower":"~48 hp","tyreSizeFront":"25x8-12","tyreSizeRear":"25x10-12",
    "frontBrakeType":"Dual hydraulic disc","rearBrakeType":"Sealed wet","fuelTankCapacity":"17.5","weightKg":"300","groundClearanceMm":"260",
    "notes":"Suzuki KingQuad 750 AXi — 722 cc liquid-cooled SOHC single utility ATV, known for reliability. CVT, shaft drive. Verify plug/lash against the Suzuki manual." }
  $kingquad$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kawasaki Brute Force 750
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kawasaki-brute-force-750';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kawasaki-brute-force-750','Kawasaki','Brute Force 750','Quad Bike',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $brute$
  { "year":"Utility ATV","strokeType":"4-Stroke","ccSize":"749","cylCount":"2","firingOrder":"90° V-twin","valveTrain":"SOHC 8v","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI)",
    "starterType":"Electric","driveType":"Shaft","transType":"CVT","wotPower":"~55 hp","tyreSizeFront":"25x8-12","tyreSizeRear":"25x10-12",
    "frontBrakeType":"Dual hydraulic disc","rearBrakeType":"Sealed wet","fuelTankCapacity":"19","weightKg":"329","groundClearanceMm":"265",
    "notes":"Kawasaki Brute Force 750 — 749 cc V-twin utility ATV, a torquey all-rounder. CVT, shaft drive. Verify plug/lash against the Kawasaki manual." }
  $brute$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Polaris RZR XP 1000
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='polaris-rzr-xp-1000';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('polaris-rzr-xp-1000','Polaris','RZR XP 1000','Quad Bike',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $rzr$
  { "year":"Sport side-by-side (UTV)","strokeType":"4-Stroke","ccSize":"999","cylCount":"2","firingOrder":"Parallel twin","valveTrain":"DOHC 8v","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI)",
    "starterType":"Electric","driveType":"Shaft (on-demand AWD)","transType":"CVT (PVT)","wotPower":"110 hp","tyreSizeFront":"29x9-14","tyreSizeRear":"29x11-14",
    "frontBrakeType":"Hydraulic disc","rearBrakeType":"Hydraulic disc","fuelTankCapacity":"36","weightKg":"635","groundClearanceMm":"330",
    "notes":"Polaris RZR XP 1000 — 999 cc ProStar twin sport side-by-side (UTV); a dominant recreation SxS. CVT, on-demand AWD, long-travel suspension. Verify plug/lash against the Polaris manual." }
  $rzr$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Can-Am Maverick X3
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='can-am-maverick-x3';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('can-am-maverick-x3','Can-Am','Maverick X3','Quad Bike',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $mav$
  { "year":"Sport side-by-side (turbo)","strokeType":"4-Stroke","ccSize":"900","cylCount":"3","firingOrder":"Inline triple","valveTrain":"DOHC 12v","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (turbo)",
    "starterType":"Electric","driveType":"Shaft (selectable)","transType":"CVT (QRS-X)","turboFitted":"Yes","wotPower":"120–200 hp (by trim)","tyreSizeFront":"30x10-14","tyreSizeRear":"30x10-14",
    "frontBrakeType":"Hydraulic disc","rearBrakeType":"Hydraulic disc","fuelTankCapacity":"40","weightKg":"680","groundClearanceMm":"355",
    "notes":"Can-Am Maverick X3 — 900 cc Rotax turbocharged inline-triple sport side-by-side (UTV); up to ~200 hp (Turbo RR). The performance-SxS benchmark. Verify plug/lash/boost against the Can-Am manual." }
  $mav$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Honda Pioneer 1000
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-pioneer-1000';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-pioneer-1000','Honda','Pioneer 1000','Quad Bike',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $pioneer$
  { "year":"Utility side-by-side (UTV)","strokeType":"4-Stroke","ccSize":"999","cylCount":"2","firingOrder":"Parallel twin","valveTrain":"OHC 8v","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI)",
    "starterType":"Electric","driveType":"Shaft","transType":"6-speed DCT (automatic)","wotPower":"~72 hp","tyreSizeFront":"27x9-14","tyreSizeRear":"27x11-14",
    "frontBrakeType":"Hydraulic disc","rearBrakeType":"Hydraulic disc","fuelTankCapacity":"30","weightKg":"680","groundClearanceMm":"315",
    "notes":"Honda Pioneer 1000 — 999 cc twin utility side-by-side (UTV) with Honda's true 6-speed DCT automatic (no belt). Work/rec crossover. Verify plug/lash against the Honda manual." }
  $pioneer$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'ATV/UTV batch imported (13 machines).';
END $$;

-- ═══ Dirt / dual-sport / adventure motorcycles (batch 2) ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- Honda CRF300L
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-crf300l';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-crf300l','Honda','CRF300L','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $crf300l$
  { "year":"2021–present (dual-sport)","strokeType":"4-Stroke","ccSize":"286","compressionRatio":"10.7:1","cylCount":"1","valveTrain":"DOHC","camType":"DOHC — 4 valves",
    "boreDiameter":"76.0","crankStroke":"63.0","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (PGM-FI)","starterType":"Electric / key start only",
    "driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (assist/slipper)","wotPower":"27 hp @ 8,500 rpm","torqueNm":"26",
    "forkType":"USD","forkTravel":"260","rearShockType":"Pro-Link monoshock","rearTravel":"260","frontBrakeType":"256 mm disc","rearBrakeType":"220 mm disc",
    "tyreSizeFront":"3.00-21","tyreSizeRear":"120/80-18","wheelbaseMm":"1455","seatHeightMm":"880","groundClearanceMm":"285","weightKg":"142 (wet)","fuelTankCapacity":"7.8",
    "notes":"Honda CRF300L — 286 cc liquid-cooled DOHC single dual-sport (grew from the CRF250L). Light, reliable, hugely popular entry dual-sport. Verify plug/lash against the Honda manual." }
  $crf300l$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Honda CRF450L
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-crf450l';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-crf450l','Honda','CRF450L','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $crf450l$
  { "year":"Dual-sport","strokeType":"4-Stroke","ccSize":"449","compressionRatio":"12.0:1","cylCount":"1","valveTrain":"DOHC","camType":"DOHC — 4 valves (Ti)",
    "boreDiameter":"96.0","crankStroke":"62.1","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (PGM-FI)","starterType":"Electric / key start only",
    "driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet","wotPower":"~24 hp (emissions-detuned)","torqueNm":"32",
    "forkType":"USD (Showa 49 mm)","forkTravel":"305","rearShockType":"Pro-Link monoshock","rearTravel":"312","frontBrakeType":"260 mm disc","rearBrakeType":"240 mm disc",
    "tyreSizeFront":"80/100-21","tyreSizeRear":"120/80-18","wheelbaseMm":"1485","seatHeightMm":"940","groundClearanceMm":"315","weightKg":"131 (wet)","fuelTankCapacity":"7.6",
    "notes":"Honda CRF450L — street-legal dual-sport built off the CRF450R; heavily detuned for emissions/reliability (many owners uncork it). Titanium valves. Verify plug/lash against the Honda manual." }
  $crf450l$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Honda XR650L
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-xr650l';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-xr650l','Honda','XR650L','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $xr650l$
  { "year":"1993–present (dual-sport)","strokeType":"4-Stroke","ccSize":"644","compressionRatio":"8.3:1","cylCount":"1","valveTrain":"SOHC (RFVC)","camType":"SOHC — 4 valves (radial)",
    "boreDiameter":"100.0","crankStroke":"82.0","coolingType":"Air cooled","fuelSystem":"Carburetted","starterType":"Electric / key start only",
    "driveType":"Chain","transType":"5-speed","clutchType":"Multi-plate wet","wotPower":"~40 hp","torqueNm":"48",
    "forkType":"Telescopic (43 mm)","forkTravel":"290","rearShockType":"Pro-Link monoshock","rearTravel":"280","frontBrakeType":"256 mm disc","rearBrakeType":"220 mm disc",
    "tyreSizeFront":"3.00-21","tyreSizeRear":"120/90-18","wheelbaseMm":"1455","seatHeightMm":"940","groundClearanceMm":"330","weightKg":"147 (dry)","fuelTankCapacity":"10.5",
    "notes":"Honda XR650L — 644 cc air-cooled SOHC RFVC single dual-sport, essentially unchanged since 1993; bulletproof and hugely popular for overlanding. Keihin carb. Shares 100×82 mm bore/stroke with the DR650. Verify against the Honda manual." }
  $xr650l$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Honda CRF450R
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-crf450r';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-crf450r','Honda','CRF450R','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $crf450r$
  { "year":"Motocross","strokeType":"4-Stroke","ccSize":"449","compressionRatio":"13.5:1","cylCount":"1","valveTrain":"Unicam SOHC","camType":"Unicam — 4 valves (Ti)",
    "boreDiameter":"96.0","crankStroke":"62.1","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (PGM-FI)","starterType":"Electric / key start only",
    "driveType":"Chain","transType":"5-speed","clutchType":"Multi-plate wet","wotPower":"~55 hp","torqueNm":"~48",
    "forkType":"USD (Showa 49 mm)","forkTravel":"305","rearShockType":"Pro-Link monoshock","rearTravel":"312","frontBrakeType":"260 mm disc","rearBrakeType":"240 mm disc",
    "tyreSizeFront":"80/100-21","tyreSizeRear":"120/80-19","wheelbaseMm":"1482","seatHeightMm":"960","groundClearanceMm":"335","weightKg":"111 (wet)","fuelTankCapacity":"6.3",
    "notes":"Honda CRF450R — 449 cc Unicam liquid-cooled MX bike; Honda's flagship 450 motocrosser. Electric start, titanium valves. Race service intervals. Verify against the Honda manual." }
  $crf450r$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Honda Africa Twin CRF1100L
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-africa-twin-crf1100l';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-africa-twin-crf1100l','Honda','Africa Twin CRF1100L','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $at1100$
  { "year":"2020–present (ADV)","strokeType":"4-Stroke","ccSize":"1084","compressionRatio":"10.1:1","cylCount":"2","firingOrder":"270° parallel twin","valveTrain":"Unicam SOHC","camType":"Unicam — 8 valves",
    "coolingType":"Liquid cooled","fuelSystem":"Fuel injection (PGM-FI)","starterType":"Electric / key start only",
    "driveType":"Chain","transType":"6-speed (opt. DCT)","clutchType":"Multi-plate wet (assist/slipper)","wotPower":"101 hp @ 7,500 rpm","torqueNm":"105",
    "forkType":"USD (Showa 45 mm)","forkTravel":"230","rearShockType":"Pro-Link monoshock","rearTravel":"220","frontBrakeType":"Dual 310 mm disc","rearBrakeType":"256 mm disc",
    "tyreSizeFront":"90/90-21","tyreSizeRear":"150/70-18","wheelbaseMm":"1575","seatHeightMm":"850","weightKg":"226 (wet)","fuelTankCapacity":"18.8",
    "notes":"Honda Africa Twin CRF1100L — 1084 cc 270° parallel-twin adventure bike, available with Honda's DCT automatic. Genuine off-road-capable big ADV. Verify plug/lash against the Honda manual." }
  $at1100$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha WR250R
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-wr250r';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-wr250r','Yamaha','WR250R','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $wr250r$
  { "year":"Dual-sport","strokeType":"4-Stroke","ccSize":"250","compressionRatio":"11.8:1","cylCount":"1","valveTrain":"DOHC","camType":"DOHC — 4 valves (Ti)",
    "boreDiameter":"77.0","crankStroke":"53.6","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI)","starterType":"Electric / key start only",
    "driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet","wotPower":"~30 hp @ 10,000 rpm","torqueNm":"24",
    "forkType":"USD (46 mm)","forkTravel":"270","rearShockType":"Monoshock","rearTravel":"270","frontBrakeType":"250 mm disc","rearBrakeType":"230 mm disc",
    "tyreSizeFront":"80/100-21","tyreSizeRear":"120/80-18","wheelbaseMm":"1425","seatHeightMm":"930","groundClearanceMm":"300","weightKg":"134 (wet)","fuelTankCapacity":"7.6",
    "notes":"Yamaha WR250R — 250 cc liquid-cooled DOHC titanium-valve dual-sport, a high-revving, high-quality (and long-discontinued, sought-after) machine. Verify plug/lash against the Yamaha manual." }
  $wr250r$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha YZ250 (2-stroke)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-yz250';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-yz250','Yamaha','YZ250','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $yz250$
  { "year":"Motocross (2-stroke)","strokeType":"2-Stroke","ccSize":"249","compressionRatio":"8.9–10.6:1 (YPVS)","cylCount":"1","coolingType":"Liquid cooled",
    "boreDiameter":"66.4","crankStroke":"72.0","fuelSystem":"Carburetted (Keihin PWK38)","mixRatio":"32:1","starterType":"Kick","plugType":"NGK BR9EG","plugGap":"0.6",
    "driveType":"Chain","transType":"5-speed","clutchType":"Multi-plate wet","wotPower":"~48 hp","forkType":"USD (KYB 48 mm)","forkTravel":"300",
    "rearShockType":"Monoshock (KYB)","rearTravel":"315","frontBrakeType":"270 mm disc","rearBrakeType":"245 mm disc",
    "tyreSizeFront":"80/100-21","tyreSizeRear":"110/90-19","wheelbaseMm":"1481","seatHeightMm":"985","weightKg":"104 (wet)","fuelTankCapacity":"8.0",
    "notes":"Yamaha YZ250 — 249 cc 2-stroke MX bike with the YPVS power valve; produced with minimal change for decades and beloved for its light, punchy character. 32:1 premix, kick start. Verify against the Yamaha manual." }
  $yz250$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha Tenere 700
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-tenere-700';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-tenere-700','Yamaha','Tenere 700','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $t700$
  { "year":"2019–present (ADV)","strokeType":"4-Stroke","ccSize":"689","compressionRatio":"11.5:1","cylCount":"2","firingOrder":"270° parallel twin (CP2)","valveTrain":"DOHC","camType":"DOHC — 8 valves",
    "boreDiameter":"80.0","crankStroke":"68.6","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI)","starterType":"Electric / key start only",
    "driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (assist/slipper)","wotPower":"72 hp @ 9,000 rpm","torqueNm":"68",
    "forkType":"USD (43 mm)","forkTravel":"210","rearShockType":"Monoshock","rearTravel":"200","frontBrakeType":"Dual 282 mm disc","rearBrakeType":"245 mm disc",
    "tyreSizeFront":"90/90-21","tyreSizeRear":"150/70-18","wheelbaseMm":"1595","seatHeightMm":"875","weightKg":"204 (wet)","fuelTankCapacity":"16",
    "notes":"Yamaha Ténéré 700 — 689 cc CP2 270° parallel-twin (the MT-07 engine) middleweight adventure bike; minimal electronics, big off-road following. Verify plug/lash against the Yamaha manual." }
  $t700$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kawasaki KLX300
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kawasaki-klx300';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kawasaki-klx300','Kawasaki','KLX300','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $klx300$
  { "year":"2021–present (dual-sport)","strokeType":"4-Stroke","ccSize":"292","compressionRatio":"11.1:1","cylCount":"1","valveTrain":"DOHC","camType":"DOHC — 4 valves",
    "boreDiameter":"78.0","crankStroke":"61.2","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI)","starterType":"Electric / key start only",
    "driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet","wotPower":"~25 hp","torqueNm":"25",
    "forkType":"USD (43 mm)","forkTravel":"250","rearShockType":"Uni-Trak monoshock","rearTravel":"265","frontBrakeType":"250 mm disc","rearBrakeType":"240 mm disc",
    "tyreSizeFront":"3.00-21","tyreSizeRear":"120/80-18","wheelbaseMm":"1470","seatHeightMm":"890","groundClearanceMm":"285","weightKg":"139 (wet)","fuelTankCapacity":"7.7",
    "notes":"Kawasaki KLX300 — 292 cc liquid-cooled DOHC single dual-sport (EFI since 2021), a comfortable trail/commute dual-sport. Verify plug/lash against the Kawasaki manual." }
  $klx300$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Suzuki V-Strom 650
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='suzuki-v-strom-650';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('suzuki-v-strom-650','Suzuki','V-Strom 650','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $vstrom$
  { "year":"2004–present (ADV-touring)","strokeType":"4-Stroke","ccSize":"645","compressionRatio":"11.2:1","cylCount":"2","firingOrder":"90° V-twin","valveTrain":"DOHC","camType":"DOHC — 8 valves",
    "boreDiameter":"81.0","crankStroke":"62.6","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI)","starterType":"Electric / key start only",
    "driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet","wotPower":"70 hp @ 8,800 rpm","torqueNm":"62",
    "forkType":"Telescopic (43 mm)","forkTravel":"150","rearShockType":"Monoshock (link)","rearTravel":"160","frontBrakeType":"Dual 310 mm disc","rearBrakeType":"260 mm disc",
    "tyreSizeFront":"110/80-19","tyreSizeRear":"150/70-17","wheelbaseMm":"1560","seatHeightMm":"835","weightKg":"216 (wet)","fuelTankCapacity":"20",
    "notes":"Suzuki V-Strom 650 — 645 cc 90° V-twin (SV650-derived) adventure-tourer; famously reliable and a value benchmark. More road than dirt. Verify plug/lash against the Suzuki manual." }
  $vstrom$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- KTM 350 EXC-F
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='ktm-350-exc-f';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('ktm-350-exc-f','KTM','350 EXC-F','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ktm350$
  { "year":"Enduro","strokeType":"4-Stroke","ccSize":"350","compressionRatio":"13.5:1","cylCount":"1","valveTrain":"DOHC","camType":"DOHC — 4 valves (Ti)",
    "boreDiameter":"88.0","crankStroke":"57.5","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI)","starterType":"Electric / key start only",
    "driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (DDS/hydraulic)","wotPower":"~46 hp","forkType":"USD (WP XPLOR 48 mm)","forkTravel":"300",
    "rearShockType":"WP monoshock","rearTravel":"310","frontBrakeType":"260 mm disc","rearBrakeType":"220 mm disc",
    "tyreSizeFront":"90/90-21","tyreSizeRear":"140/80-18","seatHeightMm":"960","weightKg":"104 (dry)","fuelTankCapacity":"8.5",
    "notes":"KTM 350 EXC-F — 350 cc DOHC titanium-valve enduro; the 'best of both worlds' between a 250 and 450. Hydraulic clutch, WP suspension. Race service intervals. Verify against the KTM manual." }
  $ktm350$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- KTM 500 EXC-F
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='ktm-500-exc-f';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('ktm-500-exc-f','KTM','500 EXC-F','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ktm500$
  { "year":"Enduro (dual-sport in US)","strokeType":"4-Stroke","ccSize":"510","compressionRatio":"12.75:1","cylCount":"1","valveTrain":"SOHC","camType":"SOHC — 4 valves (Ti)",
    "boreDiameter":"95.0","crankStroke":"72.0","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI)","starterType":"Electric / key start only",
    "driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (DDS/hydraulic)","wotPower":"~55 hp","forkType":"USD (WP XPLOR 48 mm)","forkTravel":"300",
    "rearShockType":"WP monoshock","rearTravel":"310","frontBrakeType":"260 mm disc","rearBrakeType":"220 mm disc",
    "tyreSizeFront":"90/90-21","tyreSizeRear":"140/80-18","seatHeightMm":"960","weightKg":"111 (dry)","fuelTankCapacity":"8.5",
    "notes":"KTM 500 EXC-F — 510 cc SOHC enduro (street-legal dual-sport in some markets), the biggest mainstream 4-stroke enduro; huge torque, light weight. Verify against the KTM manual." }
  $ktm500$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- KTM 300 XC (2-stroke)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='ktm-300-xc';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('ktm-300-xc','KTM','300 XC','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ktm300$
  { "year":"Enduro (2-stroke)","strokeType":"2-Stroke","ccSize":"293","compressionRatio":"Variable (power valve)","cylCount":"1","coolingType":"Liquid cooled",
    "boreDiameter":"72.0","crankStroke":"72.0","fuelSystem":"TPI / carburetted (by year)","mixRatio":"60:1 (TPI) / 40–50:1 (carb)","starterType":"Electric / kick","plugType":"NGK BR8EG","plugGap":"0.6",
    "driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (DDS/hydraulic)","wotPower":"~50 hp","forkType":"USD (WP 48 mm)","forkTravel":"300",
    "rearShockType":"WP monoshock","rearTravel":"310","frontBrakeType":"260 mm disc","rearBrakeType":"220 mm disc",
    "tyreSizeFront":"90/90-21","tyreSizeRear":"140/80-18","seatHeightMm":"960","weightKg":"103 (dry)","fuelTankCapacity":"9.0",
    "notes":"KTM 300 XC — 293 cc 2-stroke enduro (fuel-injected TPI since 2018, carb before); the go-to big-bore two-stroke for hard enduro and woods. Verify oil ratio/plug against the KTM manual (TPI vs carb differ)." }
  $ktm300$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Husqvarna 701 Enduro
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='husqvarna-701-enduro';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('husqvarna-701-enduro','Husqvarna','701 Enduro','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $h701$
  { "year":"Big-single dual-sport","strokeType":"4-Stroke","ccSize":"692.7","compressionRatio":"12.8:1","cylCount":"1","valveTrain":"SOHC","camType":"SOHC — 4 valves",
    "boreDiameter":"105.0","crankStroke":"80.0","coolingType":"Liquid cooled","fuelSystem":"Fuel injection (EFI, ride-by-wire)","starterType":"Electric / key start only",
    "driveType":"Chain","transType":"6-speed","clutchType":"APTC slipper (hydraulic)","wotPower":"74 hp @ 8,000 rpm","torqueNm":"72",
    "forkType":"USD (WP APEX 48 mm)","forkTravel":"250","rearShockType":"WP monoshock","rearTravel":"250","frontBrakeType":"300 mm disc","rearBrakeType":"240 mm disc",
    "tyreSizeFront":"90/90-21","tyreSizeRear":"140/80-18","wheelbaseMm":"1502","seatHeightMm":"910","weightKg":"145 (dry)","fuelTankCapacity":"13",
    "notes":"Husqvarna 701 Enduro — 692.7 cc LC4 single (shared with the KTM 690 Enduro R), the most powerful mass-production single; balancer shafts tame the vibes. Verify plug/lash against the Husqvarna/KTM manual." }
  $h701$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- BMW R1250GS
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='bmw-r1250gs';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('bmw-r1250gs','BMW','R1250GS','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $r1250gs$
  { "year":"2019–present (ADV flagship)","strokeType":"4-Stroke","ccSize":"1254","compressionRatio":"12.5:1","cylCount":"2","firingOrder":"Boxer twin","valveTrain":"DOHC (ShiftCam)","camType":"DOHC — 8 valves (variable)",
    "boreDiameter":"102.5","crankStroke":"76.0","coolingType":"Liquid cooled (air/liquid)","fuelSystem":"Fuel injection (ride-by-wire)","starterType":"Electric / key start only",
    "driveType":"Shaft","transType":"6-speed","clutchType":"Multi-plate wet (self-reinforcing)","wotPower":"136 hp @ 7,750 rpm","torqueNm":"143",
    "forkType":"Telelever (37 mm)","forkTravel":"190","rearShockType":"Paralever monoshock (ESA)","rearTravel":"200","frontBrakeType":"Dual 305 mm disc","rearBrakeType":"276 mm disc",
    "tyreSizeFront":"120/70-19","tyreSizeRear":"170/60-17","wheelbaseMm":"1525","seatHeightMm":"850","weightKg":"249 (wet)","fuelTankCapacity":"20",
    "notes":"BMW R1250GS — 1254 cc boxer twin with ShiftCam variable valve timing; the best-selling big adventure bike, shaft final drive, Telelever front end. Verify plug/lash against the BMW manual." }
  $r1250gs$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Dirt/dual-sport/ADV bike batch 2 imported (15 bikes).';
END $$;

-- ═══ Generators, pressure washers & pumps ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- Honda EU2200i
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-eu2200i';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-eu2200i','Honda','EU2200i','Generator',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $eu2200$
  { "year":"Inverter generator","strokeType":"4-Stroke","ccSize":"121","cylCount":"1","valveTrain":"OHV","coolingType":"Air cooled","fuelSystem":"Carburetted",
    "starterType":"Recoil only","plugType":"NGK CR5HSB","genWatts":"1800 running / 2200 peak","genVoltage":"120 V","genHz":"60 Hz","fuelTankCapacity":"3.6","weightKg":"21",
    "notes":"Honda EU2200i — inverter generator on the Honda GXR120 (121 cc) engine; 2200 W peak / 1800 W running, 120 V pure sine, parallel-capable, Eco-Throttle. The benchmark portable inverter. Verify against the Honda manual." }
  $eu2200$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Honda EU3000is
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-eu3000is';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-eu3000is','Honda','EU3000is','Generator',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $eu3000$
  { "year":"Inverter generator","strokeType":"4-Stroke","ccSize":"196","cylCount":"1","valveTrain":"OHV","coolingType":"Air cooled","fuelSystem":"Carburetted",
    "starterType":"Electric + recoil","plugType":"NGK BPR6ES","genWatts":"2800 running / 3000 peak","genVoltage":"120 V","genHz":"60 Hz","fuelTankCapacity":"12.5","weightKg":"59",
    "notes":"Honda EU3000is — inverter generator on a GX200-class (196 cc) engine; 3000 W peak / 2800 W running, electric start, very quiet. A popular RV/home-backup unit. Verify against the Honda manual." }
  $eu3000$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha EF2000iS
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-ef2000is';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-ef2000is','Yamaha','EF2000iS','Generator',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ef2000$
  { "year":"Inverter generator","strokeType":"4-Stroke","ccSize":"79","cylCount":"1","valveTrain":"OHV","coolingType":"Air cooled","fuelSystem":"Carburetted",
    "starterType":"Recoil only","plugType":"NGK CR7HSA","genWatts":"1600 running / 2000 peak","genVoltage":"120 V","genHz":"60 Hz","fuelTankCapacity":"4.2","weightKg":"20",
    "notes":"Yamaha EF2000iS — 79 cc inverter generator; 2000 W peak / 1600 W running, pure sine, parallel-capable. A quiet, reliable portable. Verify against the Yamaha manual." }
  $ef2000$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Predator 3500 (inverter)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='predator-3500-inverter';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('predator-3500-inverter','Predator','3500 Inverter','Generator',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $pred3500$
  { "year":"Inverter generator","strokeType":"4-Stroke","ccSize":"212","cylCount":"1","valveTrain":"OHV","coolingType":"Air cooled","fuelSystem":"Carburetted",
    "starterType":"Electric + recoil","plugType":"NGK BPR6ES","genWatts":"3000 running / 3500 peak","genVoltage":"120 V","genHz":"60 Hz","fuelTankCapacity":"9.5","weightKg":"45",
    "notes":"Predator 3500 Inverter — 212 cc (GX200-clone) inverter generator; 3500 W peak / 3000 W running, electric start, remote. A budget-favourite RV/tailgate unit. Verify against the Predator manual." }
  $pred3500$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Westinghouse iGen4500
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='westinghouse-igen4500';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('westinghouse-igen4500','Westinghouse','iGen4500','Generator',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $igen$
  { "year":"Inverter generator","strokeType":"4-Stroke","ccSize":"224","cylCount":"1","valveTrain":"OHV","coolingType":"Air cooled","fuelSystem":"Carburetted",
    "starterType":"Electric / remote","genWatts":"3700 running / 4500 peak","genVoltage":"120 V","genHz":"60 Hz","fuelTankCapacity":"14.4","weightKg":"44",
    "notes":"Westinghouse iGen4500 — 224 cc inverter generator; 4500 W peak / 3700 W running, electric + remote start, RV outlet. A popular large-inverter value pick. Verify plug against the Westinghouse manual." }
  $igen$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- DuroMax XP13000EH
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='duromax-xp13000eh';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('duromax-xp13000eh','DuroMax','XP13000EH','Generator',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $duro13$
  { "year":"Conventional dual-fuel generator","strokeType":"4-Stroke","ccSize":"500","cylCount":"2","firingOrder":"V-twin","valveTrain":"OHV","coolingType":"Air cooled","fuelSystem":"Carburetted (dual-fuel gas/LPG)",
    "starterType":"Electric + recoil","plugType":"NGK BPR6ES","genWatts":"10500 running / 13000 peak","genVoltage":"120/240 V","genHz":"60 Hz","fuelTankCapacity":"32","weightKg":"106",
    "notes":"DuroMax XP13000EH — 500 cc air-cooled V-twin dual-fuel (gasoline/propane) conventional generator; 13000 W peak / 10500 W running, 120/240 V, electric start. Home-backup workhorse. Verify against the DuroMax manual." }
  $duro13$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Generac GP6500
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='generac-gp6500';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('generac-gp6500','Generac','GP6500','Generator',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $gp6500$
  { "year":"Conventional portable generator","strokeType":"4-Stroke","ccSize":"389","cylCount":"1","valveTrain":"OHV","coolingType":"Air cooled","fuelSystem":"Carburetted",
    "starterType":"Recoil only","plugType":"Champion RC12YC","genWatts":"6500 running / 8125 peak","genVoltage":"120/240 V","genHz":"60 Hz","fuelTankCapacity":"25","weightKg":"77",
    "notes":"Generac GP6500 — 389 cc OHV (Generac G-Force) conventional portable generator; 8125 W peak / 6500 W running, 120/240 V. A common jobsite/home-backup unit. Verify against the Generac manual." }
  $gp6500$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Simpson MegaShot MSH3125
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='simpson-megashot-msh3125';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('simpson-megashot-msh3125','Simpson','MegaShot MSH3125','Pressure Washer',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $msh$
  { "year":"Residential pressure washer","strokeType":"4-Stroke","ccSize":"187","cylCount":"1","valveTrain":"OHC","coolingType":"Air cooled","fuelSystem":"Carburetted",
    "starterType":"Recoil only","plugType":"NGK BPR6ES","pumpPsi":"3200","pumpFlow":"9.5 (2.5 GPM)","pumpType":"AAA axial cam (OEM)","fuelTankCapacity":"","weightKg":"29",
    "notes":"Simpson MegaShot MSH3125 — residential pressure washer, Honda GC190 (187 cc) engine driving an AAA axial-cam pump; 3200 PSI @ 2.5 GPM. Common homeowner unit. Verify pump-oil/engine specs against the Simpson & Honda manuals." }
  $msh$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Simpson PowerShot PS4240
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='simpson-powershot-ps4240';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('simpson-powershot-ps4240','Simpson','PowerShot PS4240','Pressure Washer',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ps4240$
  { "year":"Professional pressure washer","strokeType":"4-Stroke","ccSize":"389","cylCount":"1","valveTrain":"OHV","coolingType":"Air cooled","fuelSystem":"Carburetted",
    "starterType":"Recoil only","plugType":"NGK BPR6ES","pumpPsi":"4200","pumpFlow":"15 (4.0 GPM)","pumpType":"AAA industrial triplex","fuelTankCapacity":"6.1","weightKg":"29",
    "notes":"Simpson PowerShot PS4240 — professional pressure washer, Honda GX390 (389 cc) engine driving an AAA industrial triplex plunger pump; 4200 PSI @ 4.0 GPM. Contractor-grade. Verify pump-oil/engine specs against the Simpson & Honda manuals." }
  $ps4240$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Honda WB30 water pump
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-wb30';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-wb30','Honda','WB30','Water Pump',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $wb30$
  { "year":"3-inch centrifugal water pump","strokeType":"4-Stroke","ccSize":"163","cylCount":"1","valveTrain":"OHV","coolingType":"Air cooled","fuelSystem":"Carburetted",
    "starterType":"Recoil only","plugType":"NGK BPR6ES","pumpFlow":"1100 L/min","pumpType":"Centrifugal (self-priming)","pumpInlet":"3 in (76 mm)","pumpOutlet":"3 in (76 mm)","fuelTankCapacity":"3.1","weightKg":"26",
    "notes":"Honda WB30 — 3-inch self-priming centrifugal water pump on the Honda GX160 (163 cc) engine; ~1100 L/min max flow. Common on farms/sites for clean-water transfer. Verify against the Honda manual." }
  $wb30$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Generator/pressure-washer/pump batch imported (10 units).';
END $$;

-- ═══ Deep-spec iconic street/adventure bikes (40+ fields) ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- Suzuki SV650
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='suzuki-sv650';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('suzuki-sv650','Suzuki','SV650','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $sv650$
  { "year":"2016–present (EFI)","strokeType":"4-Stroke","ccSize":"645","compressionRatio":"11.2:1","cylCount":"2","firingOrder":"90° V-twin","valveTrain":"DOHC","camType":"DOHC — 8 valves",
    "boreDiameter":"81.0","crankStroke":"62.6","pistonDiameter":"81.0","coilType":"Electronic (transistorized)","starterType":"Electric / key start only",
    "fuelSystem":"Fuel injection (EFI)","fuelTankCapacity":"14.5","coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","coolantCapacity":"1.5",
    "driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (assist/slipper)","finalDriveType":"525 chain","finalDriveRatio":"15/45",
    "forkType":"Telescopic (41 mm)","forkDiameter":"41","forkTravel":"125","rearShockType":"Link-type monoshock","rearTravel":"130",
    "frontBrakeType":"Dual 290 mm disc, 2-piston","rearBrakeType":"240 mm disc, 1-piston","tyreSizeFront":"120/70-17","tyreSizeRear":"160/60-17",
    "wotPower":"75 hp @ 8,500 rpm","torqueNm":"64","topSpeed":"~200 km/h (124 mph)","frameType":"Steel trellis","wheelbaseMm":"1445","seatHeightMm":"785","groundClearanceMm":"135","weightKg":"198 (wet)",
    "notes":"Suzuki SV650 — 645 cc 90° V-twin naked; a beloved all-rounder, trackday and streetfighter favourite with Low-RPM Assist. Verify plug and valve clearances against the Suzuki manual." }
  $sv650$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha MT-07
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-mt-07';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-mt-07','Yamaha','MT-07','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $mt07$
  { "year":"2014–present","strokeType":"4-Stroke","ccSize":"689","compressionRatio":"11.5:1","cylCount":"2","firingOrder":"270° parallel twin (CP2)","valveTrain":"DOHC","camType":"DOHC — 8 valves",
    "boreDiameter":"80.0","crankStroke":"68.6","pistonDiameter":"80.0","coilType":"Electronic (TCI)","starterType":"Electric / key start only",
    "fuelSystem":"Fuel injection (EFI)","fuelTankCapacity":"14","coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","coolantCapacity":"2.1",
    "driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (assist/slipper)","finalDriveType":"525 chain","finalDriveRatio":"16/43",
    "forkType":"Telescopic (41 mm)","forkDiameter":"41","forkTravel":"130","rearShockType":"Link-type monoshock","rearTravel":"130",
    "frontBrakeType":"Dual 298 mm disc, 4-piston","rearBrakeType":"245 mm disc, 1-piston","tyreSizeFront":"120/70-17","tyreSizeRear":"180/55-17",
    "wotPower":"73 hp @ 8,750 rpm","torqueNm":"67","topSpeed":"~205 km/h (127 mph)","frameType":"Steel diamond (backbone)","wheelbaseMm":"1400","seatHeightMm":"805","groundClearanceMm":"140","weightKg":"184 (wet)",
    "notes":"Yamaha MT-07 — 689 cc CP2 270° crossplane parallel-twin naked; torquey, light and enormously popular (also powers the R7, Ténéré 700, XSR700). Verify plug and valve clearances against the Yamaha manual." }
  $mt07$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kawasaki Ninja 400
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kawasaki-ninja-400';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kawasaki-ninja-400','Kawasaki','Ninja 400','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $ninja400$
  { "year":"2018–present","strokeType":"4-Stroke","ccSize":"399","compressionRatio":"11.5:1","cylCount":"2","firingOrder":"180° parallel twin","valveTrain":"DOHC","camType":"DOHC — 8 valves",
    "boreDiameter":"70.0","crankStroke":"51.8","pistonDiameter":"70.0","coilType":"Electronic (TCI)","starterType":"Electric / key start only",
    "fuelSystem":"Fuel injection (EFI)","fuelTankCapacity":"14","coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","coolantCapacity":"1.5",
    "driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (assist/slipper)","finalDriveType":"520 chain","finalDriveRatio":"14/43",
    "forkType":"Telescopic (41 mm)","forkDiameter":"41","forkTravel":"120","rearShockType":"Bottom-link Uni-Trak monoshock","rearTravel":"130",
    "frontBrakeType":"310 mm disc, 2-piston","rearBrakeType":"220 mm disc, 2-piston","tyreSizeFront":"110/70-17","tyreSizeRear":"150/60-17",
    "wotPower":"45 hp @ 10,000 rpm","torqueNm":"38","topSpeed":"~185 km/h (115 mph)","frameType":"Steel trellis","wheelbaseMm":"1370","seatHeightMm":"785","groundClearanceMm":"140","weightKg":"168 (wet)",
    "notes":"Kawasaki Ninja 400 — 399 cc parallel-twin sportbike on a light trellis frame; a class benchmark for new riders and lightweight racing. Verify plug and valve clearances against the Kawasaki manual." }
  $ninja400$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Honda CB500X
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-cb500x';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-cb500x','Honda','CB500X','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $cb500x$
  { "year":"2013–present (adventure-touring)","strokeType":"4-Stroke","ccSize":"471","compressionRatio":"10.7:1","cylCount":"2","firingOrder":"180° parallel twin","valveTrain":"DOHC","camType":"DOHC — 8 valves",
    "boreDiameter":"67.0","crankStroke":"66.8","pistonDiameter":"67.0","coilType":"Electronic","starterType":"Electric / key start only",
    "fuelSystem":"Fuel injection (PGM-FI)","fuelTankCapacity":"17.7","coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","coolantCapacity":"1.8",
    "driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (assist/slipper)","finalDriveType":"520 chain","finalDriveRatio":"15/40",
    "forkType":"USD (41 mm)","forkDiameter":"41","forkTravel":"150","rearShockType":"Pro-Link monoshock","rearTravel":"135",
    "frontBrakeType":"310 mm disc, 2-piston","rearBrakeType":"240 mm disc, 1-piston","tyreSizeFront":"110/80-19","tyreSizeRear":"160/60-17",
    "wotPower":"47 hp @ 8,600 rpm","torqueNm":"43","topSpeed":"~180 km/h (112 mph)","frameType":"Steel diamond","wheelbaseMm":"1445","seatHeightMm":"830","groundClearanceMm":"150","weightKg":"199 (wet)",
    "notes":"Honda CB500X — 471 cc parallel-twin adventure-tourer with a 19-inch front wheel; a light, thrifty A2-friendly all-rounder. Verify plug and valve clearances against the Honda manual." }
  $cb500x$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kawasaki Z900
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kawasaki-z900';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kawasaki-z900','Kawasaki','Z900','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $z900$
  { "year":"2017–present","strokeType":"4-Stroke","ccSize":"948","compressionRatio":"11.8:1","cylCount":"4","firingOrder":"Inline-4","valveTrain":"DOHC","camType":"DOHC — 16 valves",
    "boreDiameter":"73.4","crankStroke":"56.0","pistonDiameter":"73.4","coilType":"Electronic","starterType":"Electric / key start only",
    "fuelSystem":"Fuel injection (EFI)","fuelTankCapacity":"17","coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","coolantCapacity":"3.0",
    "driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (assist/slipper)","finalDriveType":"525 chain","finalDriveRatio":"15/44",
    "forkType":"USD (41 mm)","forkDiameter":"41","forkTravel":"120","rearShockType":"Horizontal back-link monoshock","rearTravel":"140",
    "frontBrakeType":"Dual 300 mm disc, 4-piston","rearBrakeType":"250 mm disc, 1-piston","tyreSizeFront":"120/70-17","tyreSizeRear":"180/55-17",
    "wotPower":"125 hp @ 9,500 rpm","torqueNm":"98.6","topSpeed":"~240 km/h (149 mph)","frameType":"Steel trellis","wheelbaseMm":"1450","seatHeightMm":"820","groundClearanceMm":"145","weightKg":"212 (wet)",
    "notes":"Kawasaki Z900 — 948 cc inline-four naked (sugomi styling); strong midrange and a light trellis frame. Verify plug and valve clearances against the Kawasaki manual." }
  $z900$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- KTM 390 Duke
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='ktm-390-duke';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('ktm-390-duke','KTM','390 Duke','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $duke390$
  { "year":"Naked single","bodyType":"Naked / streetfighter","strokeType":"4-Stroke","ccSize":"373","compressionRatio":"12.6:1","cylCount":"1","valveTrain":"DOHC","camType":"DOHC — 4 valves",
    "boreDiameter":"89.0","crankStroke":"60.0","pistonDiameter":"89.0","coilType":"Electronic","starterType":"Electric / key start only",
    "fuelSystem":"Fuel injection (ride-by-wire)","fuelTankCapacity":"13.4","coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50",
    "driveType":"Chain","transType":"6-speed","clutchType":"PASC slipper (multi-plate wet)","finalDriveType":"520 chain","finalDriveRatio":"15/45",
    "forkType":"USD (WP APEX 43 mm)","forkDiameter":"43","forkTravel":"150","rearShockType":"WP APEX monoshock","rearTravel":"150",
    "frontBrakeType":"320 mm disc, 4-piston radial","rearBrakeType":"230 mm disc, 1-piston","tyreSizeFront":"110/70-17","tyreSizeRear":"150/60-17",
    "wotPower":"43 hp @ 9,000 rpm","torqueNm":"37","topSpeed":"~167 km/h (104 mph)","frameType":"Steel trellis","wheelbaseMm":"1357","seatHeightMm":"830","groundClearanceMm":"185","weightKg":"149 (wet)",
    "notes":"KTM 390 Duke — 373 cc DOHC single naked; ride-by-wire, WP suspension, radial brake — a sharp lightweight streetbike (shares its engine with the RC390 and 390 Adventure). Verify plug and valve clearances against the KTM manual." }
  $duke390$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Royal Enfield Himalayan
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='royal-enfield-himalayan';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('royal-enfield-himalayan','Royal Enfield','Himalayan','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $himalayan$
  { "year":"2016–present (411 LS410)","bodyType":"Adventure tourer","strokeType":"4-Stroke","ccSize":"411","compressionRatio":"9.5:1","cylCount":"1","idleRpm":"1400","valveTrain":"SOHC","camType":"SOHC — 2 valves",
    "boreDiameter":"78.0","crankStroke":"86.0","pistonDiameter":"78.0","coilType":"Electronic","starterType":"Electric / key start only",
    "fuelSystem":"Fuel injection (EFI)","fuelTankCapacity":"15","coolingType":"Air cooled (oil-cooled)","driveType":"Chain","transType":"5-speed","clutchType":"Multi-plate wet",
    "finalDriveType":"520 chain","finalDriveRatio":"15/37","forkType":"Telescopic (41 mm)","forkDiameter":"41","forkTravel":"200",
    "rearShockType":"Monoshock (linkage)","rearTravel":"180","frontBrakeType":"300 mm disc, 2-piston","rearBrakeType":"240 mm disc","tyreSizeFront":"90/90-21","tyreSizeRear":"120/90-17",
    "wotPower":"24 hp @ 6,500 rpm","torqueNm":"32","topSpeed":"~140 km/h (87 mph)","frameType":"Half-duplex split cradle","wheelbaseMm":"1465","seatHeightMm":"800","groundClearanceMm":"220","weightKg":"199 (wet)",
    "notes":"Royal Enfield Himalayan (LS410) — 411 cc air/oil-cooled SOHC single adventure bike; simple, torquey and affordable, a huge value-ADV following. (A 452 cc liquid-cooled Himalayan launched 2024.) Verify plug and valve clearances against the RE manual." }
  $himalayan$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Honda XR250R (classic dual-sport/enduro)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-xr250r';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-xr250r','Honda','XR250R','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $xr250r$
  { "year":"1986–2004 (classic enduro)","strokeType":"4-Stroke","ccSize":"249","compressionRatio":"9.5:1","cylCount":"1","valveTrain":"SOHC (RFVC)","camType":"SOHC — 4 valves (radial)",
    "boreDiameter":"73.0","crankStroke":"59.5","pistonDiameter":"73.0","intakeValveClear":"0.10 mm (cold)","exhaustValveClear":"0.12 mm (cold)","plugType":"NGK DPR8EA-9","plugGap":"0.7",
    "coilType":"CDI","starterType":"Kick","fuelSystem":"Carburetted","fuelTankCapacity":"9.5","coolingType":"Air cooled","driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet",
    "finalDriveType":"520 chain","forkType":"Telescopic (43 mm)","forkTravel":"280","rearShockType":"Pro-Link monoshock","rearTravel":"280",
    "frontBrakeType":"240 mm disc","rearBrakeType":"220 mm disc","tyreSizeFront":"3.00-21","tyreSizeRear":"4.60-18",
    "wotPower":"~28 hp","torqueNm":"23","topSpeed":"~120 km/h (75 mph)","frameType":"Semi-double-cradle steel","wheelbaseMm":"1420","seatHeightMm":"940","groundClearanceMm":"330","weightKg":"116 (dry)",
    "notes":"Honda XR250R — air-cooled RFVC SOHC single enduro (1986–2004); one of the most reliable, popular vintage dual-sport/trail bikes. Kick start, carbureted. Verify clearances against the Honda manual." }
  $xr250r$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Deep-spec iconic bike batch imported (8 bikes).';
END $$;

-- ═══ Deep-spec iconic street/sport bikes (batch 2, 40+ fields) ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- Kawasaki Ninja 650
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kawasaki-ninja-650';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kawasaki-ninja-650','Kawasaki','Ninja 650','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $n650$
  { "year":"2017–present","bodyType":"Sport tourer","strokeType":"4-Stroke","ccSize":"649","compressionRatio":"10.8:1","cylCount":"2","firingOrder":"180° parallel twin","valveTrain":"DOHC","camType":"DOHC — 8 valves",
    "boreDiameter":"83.0","crankStroke":"60.0","pistonDiameter":"83.0","coilType":"Electronic","starterType":"Electric / key start only","fuelSystem":"Fuel injection (EFI)","fuelTankCapacity":"15",
    "coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","coolantCapacity":"2.0","driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (assist/slipper)","finalDriveType":"520 chain","finalDriveRatio":"15/46",
    "forkType":"Telescopic (41 mm)","forkDiameter":"41","forkTravel":"125","rearShockType":"Offset laydown monoshock","rearTravel":"130","frontBrakeType":"Dual 300 mm disc, 2-piston","rearBrakeType":"220 mm disc, 1-piston",
    "tyreSizeFront":"120/70-17","tyreSizeRear":"160/60-17","wotPower":"68 hp @ 8,000 rpm","torqueNm":"65.7","topSpeed":"~210 km/h (130 mph)","frameType":"Steel trellis","wheelbaseMm":"1410","seatHeightMm":"790","groundClearanceMm":"130","weightKg":"193 (wet)",
    "notes":"Kawasaki Ninja 650 — 649 cc parallel-twin sport-tourer (shares its engine with the Z650); a light, friendly all-rounder. Verify plug and valve clearances against the Kawasaki manual." }
  $n650$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha MT-09
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-mt-09';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-mt-09','Yamaha','MT-09','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $mt09$
  { "year":"2021–present (890 CP3)","bodyType":"Naked","strokeType":"4-Stroke","ccSize":"890","compressionRatio":"11.5:1","cylCount":"3","firingOrder":"120° inline triple (CP3)","valveTrain":"DOHC","camType":"DOHC — 12 valves",
    "boreDiameter":"78.0","crankStroke":"62.1","pistonDiameter":"78.0","coilType":"Electronic (TCI)","starterType":"Electric / key start only","fuelSystem":"Fuel injection (ride-by-wire)","fuelTankCapacity":"14",
    "coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","coolantCapacity":"2.4","driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (assist/slipper)","finalDriveType":"525 chain","finalDriveRatio":"16/45",
    "forkType":"USD (41 mm)","forkDiameter":"41","forkTravel":"130","rearShockType":"Link-type monoshock","rearTravel":"122","frontBrakeType":"Dual 298 mm disc, 4-piston radial","rearBrakeType":"245 mm disc, 1-piston",
    "tyreSizeFront":"120/70-17","tyreSizeRear":"180/55-17","wotPower":"117 hp @ 10,000 rpm","torqueNm":"93","topSpeed":"~215 km/h (134 mph)","frameType":"Aluminium CF die-cast Deltabox","wheelbaseMm":"1430","seatHeightMm":"825","groundClearanceMm":"140","weightKg":"189 (wet)",
    "notes":"Yamaha MT-09 — 890 cc CP3 crossplane inline-triple naked; punchy and light, the basis of the Tracer 9 and XSR900. Ride-by-wire, IMU rider aids. Verify plug and valve clearances against the Yamaha manual." }
  $mt09$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha YZF-R3
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-yzf-r3';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-yzf-r3','Yamaha','YZF-R3','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $r3$
  { "year":"2015–present","bodyType":"Supersport","strokeType":"4-Stroke","ccSize":"321","compressionRatio":"11.2:1","cylCount":"2","firingOrder":"180° parallel twin","valveTrain":"DOHC","camType":"DOHC — 8 valves",
    "boreDiameter":"68.0","crankStroke":"44.1","pistonDiameter":"68.0","coilType":"Electronic (TCI)","starterType":"Electric / key start only","fuelSystem":"Fuel injection (EFI)","fuelTankCapacity":"14",
    "coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","coolantCapacity":"1.6","driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet","finalDriveType":"520 chain","finalDriveRatio":"14/43",
    "forkType":"USD (37 mm)","forkDiameter":"37","forkTravel":"130","rearShockType":"Link-type monoshock","rearTravel":"125","frontBrakeType":"298 mm disc, 2-piston","rearBrakeType":"220 mm disc, 1-piston",
    "tyreSizeFront":"110/70-17","tyreSizeRear":"140/70-17","wotPower":"42 hp @ 10,750 rpm","torqueNm":"29.5","topSpeed":"~180 km/h (112 mph)","frameType":"Steel diamond","wheelbaseMm":"1380","seatHeightMm":"780","groundClearanceMm":"160","weightKg":"169 (wet)",
    "notes":"Yamaha YZF-R3 — 321 cc parallel-twin entry supersport; revvy and light, popular for new riders and lightweight racing. Verify plug and valve clearances against the Yamaha manual." }
  $r3$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Honda CB650R
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-cb650r';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-cb650r','Honda','CB650R','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $cb650r$
  { "year":"2019–present","bodyType":"Neo-café naked","strokeType":"4-Stroke","ccSize":"649","compressionRatio":"11.6:1","cylCount":"4","firingOrder":"Inline-4","valveTrain":"DOHC","camType":"DOHC — 16 valves",
    "boreDiameter":"67.0","crankStroke":"46.0","pistonDiameter":"67.0","coilType":"Electronic","starterType":"Electric / key start only","fuelSystem":"Fuel injection (PGM-FI)","fuelTankCapacity":"15.4",
    "coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","coolantCapacity":"2.3","driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (assist/slipper)","finalDriveType":"525 chain","finalDriveRatio":"15/42",
    "forkType":"USD (Showa SFF-BP 41 mm)","forkDiameter":"41","forkTravel":"120","rearShockType":"Monoshock","rearTravel":"128","frontBrakeType":"Dual 310 mm disc, 4-piston radial","rearBrakeType":"240 mm disc, 1-piston",
    "tyreSizeFront":"120/70-17","tyreSizeRear":"180/55-17","wotPower":"94 hp @ 12,000 rpm","torqueNm":"63","topSpeed":"~210 km/h (130 mph)","frameType":"Steel diamond","wheelbaseMm":"1450","seatHeightMm":"810","groundClearanceMm":"150","weightKg":"202 (wet)",
    "notes":"Honda CB650R — 649 cc inline-four neo-sports-café naked with a characterful screaming top end; refined and reliable. Verify plug and valve clearances against the Honda manual." }
  $cb650r$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kawasaki ZX-6R
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kawasaki-zx-6r';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kawasaki-zx-6r','Kawasaki','ZX-6R','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $zx6r$
  { "year":"636 cc supersport","bodyType":"Supersport","strokeType":"4-Stroke","ccSize":"636","compressionRatio":"12.9:1","cylCount":"4","firingOrder":"Inline-4","valveTrain":"DOHC","camType":"DOHC — 16 valves",
    "boreDiameter":"67.0","crankStroke":"45.1","pistonDiameter":"67.0","coilType":"Electronic","starterType":"Electric / key start only","fuelSystem":"Fuel injection (EFI)","fuelTankCapacity":"17",
    "coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","coolantCapacity":"2.9","driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (assist/slipper)","finalDriveType":"520 chain","finalDriveRatio":"16/43",
    "forkType":"USD (Showa SFF-BP 41 mm)","forkDiameter":"41","forkTravel":"120","rearShockType":"Uni-Trak monoshock","rearTravel":"134","frontBrakeType":"Dual 310 mm disc, 4-piston radial","rearBrakeType":"220 mm disc, 1-piston",
    "tyreSizeFront":"120/70-17","tyreSizeRear":"180/55-17","wotPower":"130 hp @ 13,500 rpm","torqueNm":"70.8","topSpeed":"~260 km/h (162 mph)","frameType":"Aluminium perimeter","wheelbaseMm":"1400","seatHeightMm":"830","groundClearanceMm":"130","weightKg":"196 (wet)",
    "notes":"Kawasaki ZX-6R — 636 cc inline-four supersport; the 'extra 36 cc' gives midrange few 600s have. Track and road favourite. Verify plug and valve clearances against the Kawasaki manual." }
  $zx6r$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Triumph Street Triple 765
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='triumph-street-triple-765';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('triumph-street-triple-765','Triumph','Street Triple 765','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $stt765$
  { "year":"2017–present","bodyType":"Naked","strokeType":"4-Stroke","ccSize":"765","compressionRatio":"12.65:1","cylCount":"3","firingOrder":"Inline triple","valveTrain":"DOHC","camType":"DOHC — 12 valves",
    "boreDiameter":"78.0","crankStroke":"53.4","pistonDiameter":"78.0","coilType":"Electronic","starterType":"Electric / key start only","fuelSystem":"Fuel injection (ride-by-wire)","fuelTankCapacity":"15",
    "coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (slipper)","finalDriveType":"525 chain","finalDriveRatio":"16/47",
    "forkType":"USD (Showa/Big Piston 41 mm)","forkDiameter":"41","forkTravel":"115","rearShockType":"Monoshock","rearTravel":"134","frontBrakeType":"Dual 310 mm disc, 4-piston radial (Brembo)","rearBrakeType":"220 mm disc, 1-piston",
    "tyreSizeFront":"120/70-17","tyreSizeRear":"180/55-17","wotPower":"118–128 hp (by trim)","torqueNm":"79","topSpeed":"~230 km/h (143 mph)","frameType":"Aluminium twin-spar","wheelbaseMm":"1405","seatHeightMm":"826","groundClearanceMm":"145","weightKg":"189 (wet)",
    "notes":"Triumph Street Triple 765 — 765 cc inline-triple naked (the engine base for Moto2); R and RS trims differ in output and brakes/suspension. A handling benchmark. Verify plug and valve clearances against the Triumph manual." }
  $stt765$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Ducati Monster 937
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='ducati-monster-937';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('ducati-monster-937','Ducati','Monster 937','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $mon937$
  { "year":"2021–present","bodyType":"Naked","strokeType":"4-Stroke","ccSize":"937","compressionRatio":"13.3:1","cylCount":"2","firingOrder":"90° L-twin (Testastretta 11°)","valveTrain":"DOHC (Desmodromic)","camType":"Desmo — 8 valves",
    "boreDiameter":"94.0","crankStroke":"67.5","pistonDiameter":"94.0","coilType":"Electronic","starterType":"Electric / key start only","fuelSystem":"Fuel injection (ride-by-wire)","fuelTankCapacity":"14",
    "coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (slipper)","finalDriveType":"525 chain","finalDriveRatio":"15/41",
    "forkType":"USD (43 mm)","forkDiameter":"43","forkTravel":"130","rearShockType":"Monoshock (progressive)","rearTravel":"140","frontBrakeType":"Dual 320 mm disc, 4-piston radial (Brembo M4.32)","rearBrakeType":"245 mm disc, 2-piston",
    "tyreSizeFront":"120/70-17","tyreSizeRear":"180/55-17","wotPower":"111 hp @ 9,250 rpm","torqueNm":"93","topSpeed":"~220 km/h (137 mph)","frameType":"Aluminium front frame (GP-derived)","wheelbaseMm":"1474","seatHeightMm":"820","groundClearanceMm":"","weightKg":"188 (wet)",
    "notes":"Ducati Monster 937 — 937 cc Testastretta 11° desmodromic L-twin naked; the modern aluminium-frame Monster. Desmo valve service is interval-critical — verify clearances/timing against the Ducati manual." }
  $mon937$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Suzuki GSX-S750
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='suzuki-gsx-s750';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('suzuki-gsx-s750','Suzuki','GSX-S750','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $gsxs750$
  { "year":"2017–present","bodyType":"Naked","strokeType":"4-Stroke","ccSize":"749","compressionRatio":"12.3:1","cylCount":"4","firingOrder":"Inline-4","valveTrain":"DOHC","camType":"DOHC — 16 valves",
    "boreDiameter":"72.0","crankStroke":"46.0","pistonDiameter":"72.0","coilType":"Electronic","starterType":"Electric / key start only","fuelSystem":"Fuel injection (EFI)","fuelTankCapacity":"16",
    "coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","coolantCapacity":"3.1","driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet","finalDriveType":"525 chain","finalDriveRatio":"16/42",
    "forkType":"Telescopic (41 mm)","forkDiameter":"41","forkTravel":"120","rearShockType":"Link-type monoshock","rearTravel":"130","frontBrakeType":"Dual 310 mm disc, 4-piston radial","rearBrakeType":"240 mm disc, 1-piston",
    "tyreSizeFront":"120/70-17","tyreSizeRear":"180/55-17","wotPower":"114 hp @ 10,500 rpm","torqueNm":"81","topSpeed":"~230 km/h (143 mph)","frameType":"Steel twin-spar","wheelbaseMm":"1455","seatHeightMm":"820","groundClearanceMm":"135","weightKg":"213 (wet)",
    "notes":"Suzuki GSX-S750 — 749 cc inline-four naked derived from a K5-era GSX-R750 engine; strong, characterful four-cylinder value. Verify plug and valve clearances against the Suzuki manual." }
  $gsxs750$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Deep-spec iconic bike batch 2 imported (8 bikes).';
END $$;

-- ═══ Deep-spec flagship supersport/superbikes (batch 3, 40+ fields) ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- Yamaha YZF-R6
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-yzf-r6';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-yzf-r6','Yamaha','YZF-R6','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $r6$
  { "year":"600 supersport","bodyType":"Supersport","strokeType":"4-Stroke","ccSize":"599","compressionRatio":"13.1:1","cylCount":"4","firingOrder":"Inline-4","valveTrain":"DOHC","camType":"DOHC — 16 valves (Ti)",
    "boreDiameter":"67.0","crankStroke":"42.5","pistonDiameter":"67.0","coilType":"Electronic","starterType":"Electric / key start only","fuelSystem":"Fuel injection (ride-by-wire, YCC-T)","fuelTankCapacity":"17",
    "coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (slipper)","finalDriveType":"520 chain","finalDriveRatio":"16/45",
    "forkType":"USD (KYB 43 mm)","forkDiameter":"43","forkTravel":"120","rearShockType":"Link-type monoshock","rearTravel":"120","frontBrakeType":"Dual 320 mm disc, 4-piston radial","rearBrakeType":"220 mm disc, 1-piston",
    "tyreSizeFront":"120/70-17","tyreSizeRear":"180/55-17","wotPower":"118 hp @ 14,500 rpm","torqueNm":"61.7","topSpeed":"~260 km/h (162 mph)","frameType":"Aluminium Deltabox","wheelbaseMm":"1375","seatHeightMm":"850","groundClearanceMm":"130","weightKg":"190 (wet)",
    "notes":"Yamaha YZF-R6 — 599 cc inline-four supersport, titanium valves, ~16,500 rpm redline; a track-day and supersport-racing icon. Verify plug and valve clearances against the Yamaha manual." }
  $r6$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Honda CBR600RR
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-cbr600rr';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-cbr600rr','Honda','CBR600RR','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $cbr600$
  { "year":"600 supersport","bodyType":"Supersport","strokeType":"4-Stroke","ccSize":"599","compressionRatio":"12.2:1","cylCount":"4","firingOrder":"Inline-4","valveTrain":"DOHC","camType":"DOHC — 16 valves",
    "boreDiameter":"67.0","crankStroke":"42.5","pistonDiameter":"67.0","coilType":"Electronic","starterType":"Electric / key start only","fuelSystem":"Fuel injection (PGM-DSFI)","fuelTankCapacity":"18",
    "coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (slipper)","finalDriveType":"525 chain","finalDriveRatio":"16/42",
    "forkType":"USD (Big Piston 41 mm)","forkDiameter":"41","forkTravel":"120","rearShockType":"Unit Pro-Link monoshock","rearTravel":"130","frontBrakeType":"Dual 310 mm disc, 4-piston radial","rearBrakeType":"220 mm disc, 1-piston",
    "tyreSizeFront":"120/70-17","tyreSizeRear":"180/55-17","wotPower":"118 hp @ 13,500 rpm","torqueNm":"66","topSpeed":"~260 km/h (162 mph)","frameType":"Aluminium twin-spar","wheelbaseMm":"1375","seatHeightMm":"820","groundClearanceMm":"130","weightKg":"194 (wet)",
    "notes":"Honda CBR600RR — 599 cc inline-four supersport, famed for balance and refinement. Verify plug and valve clearances against the Honda manual." }
  $cbr600$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Suzuki GSX-R750
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='suzuki-gsx-r750';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('suzuki-gsx-r750','Suzuki','GSX-R750','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $gsxr750$
  { "year":"Supersport","bodyType":"Supersport","strokeType":"4-Stroke","ccSize":"750","compressionRatio":"12.5:1","cylCount":"4","firingOrder":"Inline-4","valveTrain":"DOHC","camType":"DOHC — 16 valves",
    "boreDiameter":"70.0","crankStroke":"48.7","pistonDiameter":"70.0","coilType":"Electronic","starterType":"Electric / key start only","fuelSystem":"Fuel injection (EFI, SDTV)","fuelTankCapacity":"17",
    "coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (slipper)","finalDriveType":"525 chain","finalDriveRatio":"17/45",
    "forkType":"USD (Showa BPF 41 mm)","forkDiameter":"41","forkTravel":"120","rearShockType":"Link-type monoshock","rearTravel":"130","frontBrakeType":"Dual 310 mm disc, 4-piston radial (Brembo)","rearBrakeType":"220 mm disc, 1-piston",
    "tyreSizeFront":"120/70-17","tyreSizeRear":"180/55-17","wotPower":"148 hp @ 13,200 rpm","torqueNm":"86","topSpeed":"~285 km/h (177 mph)","frameType":"Aluminium twin-spar","wheelbaseMm":"1390","seatHeightMm":"810","groundClearanceMm":"130","weightKg":"190 (wet)",
    "notes":"Suzuki GSX-R750 — 750 cc inline-four; the unique 'middleweight chassis, big power' formula with a devoted following. Verify plug and valve clearances against the Suzuki manual." }
  $gsxr750$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Suzuki GSX-R1000
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='suzuki-gsx-r1000';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('suzuki-gsx-r1000','Suzuki','GSX-R1000','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $gsxr1000$
  { "year":"Superbike","bodyType":"Superbike","strokeType":"4-Stroke","ccSize":"999","compressionRatio":"13.2:1","cylCount":"4","firingOrder":"Inline-4","valveTrain":"DOHC (VVT)","camType":"DOHC — 16 valves (VVT)",
    "boreDiameter":"76.0","crankStroke":"55.1","pistonDiameter":"76.0","coilType":"Electronic","starterType":"Electric / key start only","fuelSystem":"Fuel injection (ride-by-wire)","fuelTankCapacity":"16",
    "coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (slipper)","finalDriveType":"525 chain","finalDriveRatio":"17/42",
    "forkType":"USD (Showa BFF 43 mm)","forkDiameter":"43","forkTravel":"120","rearShockType":"Link-type monoshock (Showa BFRC)","rearTravel":"130","frontBrakeType":"Dual 320 mm disc, 4-piston radial (Brembo)","rearBrakeType":"220 mm disc, 1-piston",
    "tyreSizeFront":"120/70-17","tyreSizeRear":"190/55-17","wotPower":"199 hp @ 13,200 rpm","torqueNm":"117","topSpeed":"~299 km/h (186 mph)","frameType":"Aluminium twin-spar","wheelbaseMm":"1420","seatHeightMm":"825","groundClearanceMm":"130","weightKg":"203 (wet)",
    "notes":"Suzuki GSX-R1000 — 999 cc inline-four superbike with Broad Power System VVT (MotoGP-derived). Verify plug and valve clearances against the Suzuki manual." }
  $gsxr1000$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha YZF-R1
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-yzf-r1';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-yzf-r1','Yamaha','YZF-R1','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $r1$
  { "year":"Superbike (CP4)","bodyType":"Superbike","strokeType":"4-Stroke","ccSize":"998","compressionRatio":"13.0:1","cylCount":"4","firingOrder":"Crossplane inline-4 (CP4)","valveTrain":"DOHC","camType":"DOHC — 16 valves (Ti)",
    "boreDiameter":"79.0","crankStroke":"50.9","pistonDiameter":"79.0","coilType":"Electronic","starterType":"Electric / key start only","fuelSystem":"Fuel injection (ride-by-wire, YCC-T)","fuelTankCapacity":"17",
    "coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (slipper)","finalDriveType":"525 chain","finalDriveRatio":"16/41",
    "forkType":"USD (KYB 43 mm)","forkDiameter":"43","forkTravel":"120","rearShockType":"Link-type monoshock","rearTravel":"120","frontBrakeType":"Dual 320 mm disc, 4-piston radial","rearBrakeType":"220 mm disc, 1-piston",
    "tyreSizeFront":"120/70-17","tyreSizeRear":"190/55-17","wotPower":"200 hp @ 13,500 rpm","torqueNm":"112","topSpeed":"~299 km/h (186 mph)","frameType":"Aluminium Deltabox","wheelbaseMm":"1405","seatHeightMm":"855","groundClearanceMm":"130","weightKg":"201 (wet)",
    "notes":"Yamaha YZF-R1 — 998 cc crossplane (CP4) inline-four superbike with a distinctive uneven firing order and MotoGP-derived electronics (IMU). Verify plug and valve clearances against the Yamaha manual." }
  $r1$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- BMW S1000RR
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='bmw-s1000rr';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('bmw-s1000rr','BMW','S1000RR','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $s1000rr$
  { "year":"Superbike (ShiftCam)","bodyType":"Superbike","strokeType":"4-Stroke","ccSize":"999","compressionRatio":"13.5:1","cylCount":"4","firingOrder":"Inline-4","valveTrain":"DOHC (ShiftCam VVT)","camType":"DOHC — 16 valves (variable)",
    "boreDiameter":"80.0","crankStroke":"49.7","pistonDiameter":"80.0","coilType":"Electronic","starterType":"Electric / key start only","fuelSystem":"Fuel injection (ride-by-wire)","fuelTankCapacity":"16.5",
    "coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (anti-hopping)","finalDriveType":"525 chain","finalDriveRatio":"17/45",
    "forkType":"USD (45 mm)","forkDiameter":"45","forkTravel":"120","rearShockType":"Full-floater monoshock","rearTravel":"117","frontBrakeType":"Dual 320 mm disc, 4-piston radial","rearBrakeType":"220 mm disc, 1-piston",
    "tyreSizeFront":"120/70-17","tyreSizeRear":"200/55-17","wotPower":"205 hp @ 13,500 rpm","torqueNm":"113","topSpeed":"~299 km/h (186 mph)","frameType":"Aluminium twin-spar (Flex Frame)","wheelbaseMm":"1441","seatHeightMm":"824","groundClearanceMm":"130","weightKg":"197 (wet)",
    "notes":"BMW S1000RR — 999 cc inline-four superbike with ShiftCam variable valve timing/lift and a comprehensive IMU electronics suite. Verify plug and valve clearances against the BMW manual." }
  $s1000rr$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Aprilia RS660
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='aprilia-rs660';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('aprilia-rs660','Aprilia','RS660','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $rs660$
  { "year":"2020–present","bodyType":"Sport","strokeType":"4-Stroke","ccSize":"659","compressionRatio":"13.5:1","cylCount":"2","firingOrder":"270° parallel twin","valveTrain":"DOHC","camType":"DOHC — 8 valves",
    "boreDiameter":"81.0","crankStroke":"63.9","pistonDiameter":"81.0","coilType":"Electronic","starterType":"Electric / key start only","fuelSystem":"Fuel injection (ride-by-wire)","fuelTankCapacity":"15",
    "coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (slipper)","finalDriveType":"525 chain","finalDriveRatio":"16/43",
    "forkType":"USD (Kayaba 41 mm)","forkDiameter":"41","forkTravel":"120","rearShockType":"Monoshock","rearTravel":"130","frontBrakeType":"Dual 320 mm disc, 4-piston radial (Brembo)","rearBrakeType":"220 mm disc, 1-piston",
    "tyreSizeFront":"120/70-17","tyreSizeRear":"180/55-17","wotPower":"100 hp @ 10,500 rpm","torqueNm":"67","topSpeed":"~230 km/h (143 mph)","frameType":"Aluminium twin-spar","wheelbaseMm":"1370","seatHeightMm":"820","groundClearanceMm":"","weightKg":"183 (wet)",
    "notes":"Aprilia RS660 — 659 cc 270° parallel-twin (derived from a bank of the RSV4 V4) sport bike with a full IMU electronics suite; light and modern. Verify plug and valve clearances against the Aprilia manual." }
  $rs660$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Triumph Bonneville T120
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='triumph-bonneville-t120';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('triumph-bonneville-t120','Triumph','Bonneville T120','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import', $t120$
  { "year":"2016–present","bodyType":"Modern classic","strokeType":"4-Stroke","ccSize":"1200","compressionRatio":"10.0:1","cylCount":"2","firingOrder":"270° parallel twin (HT)","valveTrain":"SOHC","camType":"SOHC — 8 valves",
    "boreDiameter":"97.6","crankStroke":"80.0","pistonDiameter":"97.6","coilType":"Electronic","starterType":"Electric / key start only","fuelSystem":"Fuel injection (ride-by-wire)","fuelTankCapacity":"14.5",
    "coolingType":"Liquid cooled","coolantType":"Ethylene glycol 50/50","driveType":"Chain","transType":"6-speed","clutchType":"Multi-plate wet (assist/slipper, torque-assist)","finalDriveType":"525 chain",
    "forkType":"Telescopic (41 mm)","forkDiameter":"41","forkTravel":"120","rearShockType":"Twin shocks (preload adj.)","rearTravel":"120","frontBrakeType":"Dual 310 mm disc, 2-piston (Nissin)","rearBrakeType":"255 mm disc, 2-piston",
    "tyreSizeFront":"100/90-18","tyreSizeRear":"150/70-17","wotPower":"80 hp @ 6,550 rpm","torqueNm":"105","topSpeed":"~180 km/h (112 mph)","frameType":"Tubular steel cradle","wheelbaseMm":"1445","seatHeightMm":"790","groundClearanceMm":"","weightKg":"236 (wet)",
    "notes":"Triumph Bonneville T120 — 1200 cc 'High Torque' 270° parallel-twin modern classic; huge low-end torque, water-cooled but styled as air-cooled. Verify plug and valve clearances against the Triumph manual." }
  $t120$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Deep-spec flagship bike batch 3 imported (8 bikes).';
END $$;

-- ═══ British Seagull vintage outboards ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- British Seagull Forty Plus
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-forty-plus';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-forty-plus','British Seagull','Forty Plus','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import (vintage)', $sgfp$
  { "year":"~1940s–1990s (classic series)","strokeType":"2-Stroke","ccSize":"64","cylCount":"1","coolingType":"Liquid cooled (raw water)",
    "fuelSystem":"Carburetted (Amal; Bing on late models)","mixRatio":"10:1 (Amal-carb models) / 25:1 (Bing-carb, ~1979-on)",
    "plugType":"Champion D16 (18 mm)","plugGap":"0.50 mm (0.020 in)","coilType":"Flywheel magneto (Villiers / Wipac)","starterType":"Rope pull (knotted cord on flywheel)",
    "starterMotorType":"None — manual rope only","obSteering":"Tiller","obTiltTrim":"Manual tilt","obShaftLength":"Standard / long (by model code)",
    "obLowerUnitOilType":"SAE 140 gear oil (heavy)","obGearRatio":"Bevel gear reduction, direct drive","transType":"Direct drive (no neutral; clutch on 'C' models)",
    "wotPower":"~2 hp (rated 'Forty Plus')","wotRpm":"~3800","fuelTankCapacity":"~1.8 (brass tank)","weightKg":"~12",
    "notes":"British Seagull Forty Plus — the archetypal Seagull: 64 cc water-cooled 2-stroke single, brass tank, flywheel magneto, knotted-rope start, direct drive (no neutral — the prop turns whenever it runs; clutch versions carry a C in the model code). CRITICAL: pre-~1979 Amal-carb models run a very rich 10:1 premix by design (plain bearings depend on it) — do NOT lean it to modern ratios without a Bing carb/needle-roller conversion; late Bing-carb models run 25:1. Points gap ~0.020 in. Model code stamped on the crankcase identifies year/variant. Parts and lore: the Save Our Seagulls community. Verify against the Seagull handbook for your model code." }
  $sgfp$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- British Seagull Forty Minus
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-forty-minus';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-forty-minus','British Seagull','Forty Minus','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import (vintage)', $sgfm$
  { "year":"~1950s–1980s (classic series)","strokeType":"2-Stroke","ccSize":"64","cylCount":"1","coolingType":"Liquid cooled (raw water)",
    "fuelSystem":"Carburetted (Amal; Bing on late models)","mixRatio":"10:1 (Amal-carb models) / 25:1 (Bing-carb, ~1979-on)",
    "plugType":"Champion D16 (18 mm)","plugGap":"0.50 mm (0.020 in)","coilType":"Flywheel magneto (Villiers / Wipac)","starterType":"Rope pull (knotted cord on flywheel)",
    "starterMotorType":"None — manual rope only","obSteering":"Tiller","obTiltTrim":"Manual tilt","obShaftLength":"Standard / long (by model code)",
    "obLowerUnitOilType":"SAE 140 gear oil (heavy)","obGearRatio":"Bevel gear reduction, direct drive","transType":"Direct drive (no neutral)",
    "wotPower":"~1.5 hp (rated 'Forty Minus')","wotRpm":"~3600","fuelTankCapacity":"~1.8 (brass tank)","weightKg":"~11",
    "notes":"British Seagull Forty Minus — the lower-rated sibling of the Forty Plus (same 64 cc block, smaller-pitch prop/lower rating) for dinghies and tenders. Same rules: 10:1 premix on Amal-carb models (25:1 only on late Bing-carb), Champion D16 plug, knotted-rope start, no neutral. Verify against the Seagull handbook for your model code." }
  $sgfm$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- British Seagull Silver Century
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-silver-century';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-silver-century','British Seagull','Silver Century','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import (vintage)', $sgsc$
  { "year":"~1950s–1990s (classic series)","strokeType":"2-Stroke","ccSize":"102","cylCount":"1","coolingType":"Liquid cooled (raw water)",
    "fuelSystem":"Carburetted (Amal; Bing on late models)","mixRatio":"10:1 (Amal-carb models) / 25:1 (Bing-carb, ~1979-on)",
    "plugType":"Champion D16 (18 mm)","plugGap":"0.50 mm (0.020 in)","coilType":"Flywheel magneto (Villiers / Wipac)","starterType":"Rope pull (knotted cord on flywheel)",
    "starterMotorType":"None — manual rope only","obSteering":"Tiller","obTiltTrim":"Manual tilt","obShaftLength":"Standard / long (by model code)",
    "obLowerUnitOilType":"SAE 140 gear oil (heavy)","obGearRatio":"Bevel gear reduction, direct drive","transType":"Direct drive (clutch on 'C' models)",
    "wotPower":"~4 hp (Century class; Plus variants higher-thrust prop)","wotRpm":"~4000","fuelTankCapacity":"~2.3 (brass tank)","weightKg":"~17",
    "notes":"British Seagull Silver Century — the 102 cc big single of the classic range (Century / Silver Century / Century Plus variants differ in prop, tank and shaft). Same golden rules: 10:1 premix on Amal-carb models, Champion D16, SAE 140 in the gearbox, no neutral on standard models. The big-prop, low-rev thrust makes it a legendary displacement-dinghy pusher. Verify against the Seagull handbook for your model code." }
  $sgsc$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- British Seagull QB / Kingfisher
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-qb-kingfisher';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-qb-kingfisher','British Seagull','QB / Kingfisher','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import (vintage)', $sgqb$
  { "year":"~1980s (modernized series)","strokeType":"2-Stroke","ccSize":"~64–110 (by model)","cylCount":"1","coolingType":"Liquid cooled (raw water)",
    "fuelSystem":"Carburetted (Bing)","mixRatio":"25:1","plugType":"Champion (14 mm on late models — verify per engine)","coilType":"Wipac CD ignition (electronic on late models)",
    "starterType":"Recoil","obSteering":"Tiller","obTiltTrim":"Manual tilt","obLowerUnitOilType":"SAE 140 gear oil (heavy)",
    "transType":"Direct drive / clutch (by model)","wotPower":"~2–5 hp (by model)","weightKg":"~13–18",
    "notes":"British Seagull QB ('Quiet Britain') / Kingfisher series — the 1980s modernization attempt: recoil start, cowling, quieter exhaust, Bing carb, 25:1 mix, CD ignition. Less loved by purists but the same simple bones. Model-specific figures vary — treat this entry as a family overview and verify displacement/plug against your engine's handbook. Production ended in the mid-1990s; the classic range's parts supply remains strong via the enthusiast community." }
  $sgqb$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'British Seagull vintage batch imported (4 motors).';
END $$;

-- ═══ Vintage & Aussie icons (Victa, postie, farm bikes, vintage saws, B&S flathead) ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- Victa Power Torque 160
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='victa-power-torque-160';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('victa-power-torque-160','Victa','Power Torque 160','Lawnmower',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import (vintage)', $victa$
  { "year":"~1975–2000s (Australian icon)","strokeType":"2-Stroke","ccSize":"160","cylCount":"1","coolingType":"Air cooled",
    "fuelSystem":"Carburetted (Victa G4 diaphragm; later LM)","mixRatio":"25:1","coilType":"Points magneto (electronic on later)","starterType":"Recoil only",
    "bladeType":"Twin swing-back blades on disc","deckSize":"18–20 in (by model)","wotRpm":"~3200","weightKg":"~30",
    "notes":"Victa Power Torque 160 — the Australian 2-stroke mower engine, millions made in Sydney; powered the classic Victa 18/20 alloy- and steel-deck mowers. 25:1 premix through the G4 diaphragm carb (primer bulb); swing-back blade disc underneath. Crank seals and reed/carb diaphragms are the usual old-age fixes. Earlier Victas ran the 125 cc 'full-crank' 2-stroke. Verify plug/points for your era against the Victa handbook." }
  $victa$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Honda CT110 (Postie)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-ct110';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-ct110','Honda','CT110','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import (postie bike)', $ct110$
  { "year":"1980–2012 (the Postie)","bodyType":"Trail / utility","strokeType":"4-Stroke","ccSize":"105","compressionRatio":"8.5:1","cylCount":"1","valveTrain":"OHC","camType":"OHC — 2 valves",
    "boreDiameter":"52.0","crankStroke":"49.5","pistonDiameter":"52.0","plugType":"NGK C7HSA","plugGap":"0.6–0.7","coilType":"CDI","starterType":"Kick",
    "fuelSystem":"Carburetted","fuelTankCapacity":"5.5","coolingType":"Air cooled","driveType":"Chain (fully enclosed case)","transType":"4-speed semi-auto + hi/lo dual range",
    "clutchType":"Automatic centrifugal","finalDriveType":"428 chain","forkType":"Telescopic","rearShockType":"Twin shocks","frontBrakeType":"Drum","rearBrakeType":"Drum",
    "tyreSizeFront":"2.75-17","tyreSizeRear":"2.75-17","wotPower":"~7.6 hp @ 7,500 rpm","topSpeed":"~80 km/h","frameType":"Pressed-steel step-through","seatHeightMm":"795","weightKg":"~90 (wet)",
    "notes":"Honda CT110 — the Australia Post 'postie bike', the best-selling motorcycle in Australian history. 105 cc OHC single, 4-speed semi-auto (no clutch lever) with a hi/lo dual-range sub-transmission, enclosed chain case, drums both ends. Utterly rebuildable; ex-AusPost auction bikes are an enthusiast institution. Verify clearances against the Honda manual (typically ~0.05 mm both, cold)." }
  $ct110$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha AG200
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-ag200';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-ag200','Yamaha','AG200','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import (farm bike)', $ag200$
  { "year":"1984–present (farm bike)","bodyType":"Agricultural","strokeType":"4-Stroke","ccSize":"196","cylCount":"1","valveTrain":"SOHC","camType":"SOHC — 2 valves",
    "boreDiameter":"67.0","crankStroke":"55.7","pistonDiameter":"67.0","coilType":"CDI","starterType":"Kick (electric on AG200E)","fuelSystem":"Carburetted","fuelTankCapacity":"9.8",
    "coolingType":"Air cooled","driveType":"Chain (fully enclosed case)","transType":"5-speed","clutchType":"Multi-plate wet","forkType":"Telescopic (with gaiters)","rearShockType":"Monoshock",
    "frontBrakeType":"Drum","rearBrakeType":"Drum","tyreSizeFront":"90/100-19? — verify by year","tyreSizeRear":"110/100-16? — verify by year",
    "wotPower":"~16 hp","topSpeed":"~110 km/h","seatHeightMm":"800","weightKg":"~110 (wet)",
    "notes":"Yamaha AG200 — the purpose-built Aussie/NZ farm bike, in production largely unchanged for 40 years: fully enclosed chain case, dual side stands, front and rear carry racks, drum brakes for mud, sealed electrics. The 196 cc air-cooled single is famously unkillable. Tyre sizes changed across years — verify against your model's manual." }
  $ag200$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha AG100
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-ag100';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-ag100','Yamaha','AG100','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import (farm bike)', $ag100$
  { "year":"1973–2000s (farm bike)","bodyType":"Agricultural","strokeType":"2-Stroke","ccSize":"97","cylCount":"1","coolingType":"Air cooled",
    "fuelSystem":"Carburetted","mixRatio":"Autolube oil injection (no premix)","coilType":"Magneto CDI (points early)","starterType":"Kick",
    "driveType":"Chain (fully enclosed case)","transType":"5-speed","clutchType":"Multi-plate wet","forkType":"Telescopic (gaiters)","rearShockType":"Twin shocks (mono later)",
    "frontBrakeType":"Drum","rearBrakeType":"Drum","wotPower":"~10 hp","topSpeed":"~90 km/h","weightKg":"~95 (wet)",
    "notes":"Yamaha AG100 — the 2-stroke little brother of the AG200 and one of the longest-serving farm bikes ever. 97 cc single with Yamaha Autolube oil injection (fill the oil tank — no premixing), enclosed chain, dual stands, racks. Keep the Autolube pump bled and cable-synced after carb work. Verify plug/jetting against the Yamaha manual for your year." }
  $ag100$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Suzuki DR200SE Trojan
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='suzuki-dr200se-trojan';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('suzuki-dr200se-trojan','Suzuki','DR200SE Trojan','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import (farm bike)', $trojan$
  { "year":"1996–present (farm/trail)","bodyType":"Agricultural / trail","strokeType":"4-Stroke","ccSize":"199","compressionRatio":"9.4:1","cylCount":"1","valveTrain":"SOHC","camType":"SOHC — 2 valves",
    "boreDiameter":"66.0","crankStroke":"58.2","pistonDiameter":"66.0","coilType":"CDI","starterType":"Electric","fuelSystem":"Carburetted (Mikuni BST31)","fuelTankCapacity":"13",
    "coolingType":"Air cooled","driveType":"Chain","transType":"5-speed","clutchType":"Multi-plate wet","forkType":"Telescopic","rearShockType":"Monoshock",
    "frontBrakeType":"Disc","rearBrakeType":"Drum","tyreSizeFront":"70/100-21","tyreSizeRear":"100/90-18","wotPower":"~19 hp","topSpeed":"~110 km/h","seatHeightMm":"810","weightKg":"~126 (wet)",
    "notes":"Suzuki DR200SE 'Trojan' — the electric-start farm/trail 200 with a big 13 L tank; the third leg of the Aussie farm-bike trio alongside the AG200 and CT110-descended posties. Simple air-cooled SOHC single, easy valve access. Verify clearances/plug against the Suzuki manual." }
  $trojan$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Honda Z50 Monkey
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='honda-z50';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('honda-z50','Honda','Z50','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import (minibike classic)', $z50$
  { "year":"1968–1999 (Monkey / Mini Trail)","bodyType":"Minibike","strokeType":"4-Stroke","ccSize":"49","cylCount":"1","valveTrain":"OHC","camType":"OHC — 2 valves",
    "plugType":"NGK C5HSA / C6HS (by year)","coilType":"Points (CDI later)","starterType":"Kick","fuelSystem":"Carburetted","coolingType":"Air cooled",
    "driveType":"Chain","transType":"3-speed semi-auto","clutchType":"Automatic centrifugal","frontBrakeType":"Drum","rearBrakeType":"Drum",
    "tyreSizeFront":"3.50-8","tyreSizeRear":"3.50-8","wotPower":"~2.5 hp","topSpeed":"~40 km/h","weightKg":"~50",
    "notes":"Honda Z50 Monkey / Mini Trail — the 49 cc OHC minibike that launched a million riders (and the modern Monkey 125 homage). 3-speed semi-auto, 8-inch wheels, folding bars on early models. Massive collector and pit-bike aftermarket; the horizontal 50 engine family (Z50/C50/CT70) is endlessly interchangeable. Verify plug/points era against the Honda manual for your year." }
  $z50$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kawasaki KE100
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kawasaki-ke100';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kawasaki-ke100','Kawasaki','KE100','Motorcycle',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import (classic 2-stroke)', $ke100$
  { "year":"1976–2001 (dual-purpose)","bodyType":"Dual-purpose","strokeType":"2-Stroke","ccSize":"99","cylCount":"1","coolingType":"Air cooled",
    "fuelSystem":"Carburetted (rotary disc valve)","mixRatio":"Oil injection (Superlube)","coilType":"Magneto (points early, CDI later)","starterType":"Kick",
    "driveType":"Chain","transType":"5-speed","clutchType":"Multi-plate wet","frontBrakeType":"Drum","rearBrakeType":"Drum",
    "tyreSizeFront":"2.75-19","tyreSizeRear":"3.00-18","wotPower":"~11 hp","topSpeed":"~100 km/h","weightKg":"~99 (wet)",
    "notes":"Kawasaki KE100 — 99 cc rotary-disc-valve 2-stroke dual-purpose bike, sold near-unchanged for 25 years; oil-injected (no premix). A beloved cheap trail/learner classic. Verify plug/jetting against the Kawasaki manual for your year." }
  $ke100$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Homelite XL-12
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='homelite-xl-12';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('homelite-xl-12','Homelite','XL-12','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import (vintage saw)', $xl12$
  { "year":"1963–1980s (vintage)","strokeType":"2-Stroke","ccSize":"~54","cylCount":"1","coolingType":"Air cooled",
    "fuelSystem":"Carburetted (Tillotson/Walbro diaphragm)","mixRatio":"16:1 original spec (32:1 acceptable with modern 2T oil — see notes)",
    "plugType":"Champion CJ8 (verify)","coilType":"Points magneto","starterType":"Recoil only","chainPitchCS":"3/8\"","barLength":"14–20 in","weightKg":"~6.5 (powerhead)",
    "notes":"Homelite XL-12 — one of the best-selling saws of all time; a light (for its day) ~54 cc direct-drive 2-stroke with a huge survivor population. Original manuals call for 16:1 with 1960s oils; most restorers run 32:1 with modern oil — never lean an original-spec vintage saw to 50:1. Points ignition (~0.015 in) unless converted to electronic. Verify displacement variant (XL-12 family spans models) against your serial." }
  $xl12$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- McCulloch Mac 10-10
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='mcculloch-mac-10-10';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('mcculloch-mac-10-10','McCulloch','Mac 10-10','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import (vintage saw)', $mac1010$
  { "year":"1965–1980s (vintage)","strokeType":"2-Stroke","ccSize":"~54","cylCount":"1","coolingType":"Air cooled",
    "fuelSystem":"Carburetted (diaphragm)","mixRatio":"40:1 with McCulloch oil (orig.) / 16:1 with standard oils of the era — 32:1 modern",
    "coilType":"Points magneto","starterType":"Recoil only","chainPitchCS":"3/8\"","barLength":"16–20 in","weightKg":"~7 (powerhead)",
    "notes":"McCulloch Mac 10-10 — the classic yellow farm saw of the 70s, ~54 cc direct-drive with automatic + manual chain oiling. Factory quoted 40:1 with McCulloch-branded oil or richer with generic; 32:1 with modern oil is the safe restorer's choice. Points ignition; kits and parts still circulate. Verify plug/points against the McCulloch manual." }
  $mac1010$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Stihl 070
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-070';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-070','Stihl','070','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import (vintage big-bore)', $s070$
  { "year":"1968–present in some markets","strokeType":"2-Stroke","ccSize":"106","cylCount":"1","coolingType":"Air cooled",
    "fuelSystem":"Carburetted","mixRatio":"25:1 original spec (50:1 with modern Stihl oil — see notes)","plugType":"Bosch WSR6F / NGK BPMR7A (later)","coilType":"Points magneto (electronic later)",
    "starterType":"Recoil only","chainPitchCS":".404\"","barLength":"25–36 in","wotPower":"~4.1 kW (5.5 hp)","weightKg":"~10.5 (powerhead)",
    "notes":"Stihl 070 — the legendary 106 cc big-bore workhorse, still manufactured for developing markets decades after its 1968 debut; slow-revving, torque-monster milling and big-timber saw. Early spec was 25:1; with modern Stihl HP oils 50:1 is factory-approved on later builds — match the era of your engine. Points saws need ~0.4 mm gap. Verify against the Stihl manual." }
  $s070$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Stihl 090
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='stihl-090';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('stihl-090','Stihl','090','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import (vintage big-bore)', $s090$
  { "year":"1971–2000s (vintage giant)","strokeType":"2-Stroke","ccSize":"137","cylCount":"1","coolingType":"Air cooled",
    "fuelSystem":"Carburetted","mixRatio":"25:1 original spec (50:1 with modern Stihl oil on later builds)","coilType":"Points magneto (electronic later)",
    "starterType":"Recoil only","chainPitchCS":".404\"","barLength":"30–60 in","wotPower":"~4.8 kW (6.5 hp)","weightKg":"~12 (powerhead)",
    "notes":"Stihl 090 — the 137 cc giant, one of the largest production chainsaws ever; the definitive slabbing/milling and giant-timber saw, hugely sought-after today. Slow, brutal torque; runs .404 chain on bars up to 5 ft. Match oil ratio to your engine's era (25:1 original). Verify against the Stihl manual." }
  $s090$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Briggs & Stratton 5HP Flathead
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='briggs-5hp-flathead';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('briggs-5hp-flathead','Briggs & Stratton','5HP Flathead','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Detailed spec import (classic)', $b5hp$
  { "year":"~1960s–2000s (Model 130200-series et al.)","strokeType":"4-Stroke","ccSize":"~206","cylCount":"1","valveTrain":"Flathead (L-head side-valve)","camType":"Side-valve — 2 valves",
    "coolingType":"Air cooled","fuelSystem":"Carburetted (Flo-Jet / Pulsa-Jet by series)","plugType":"Champion J19LM","plugGap":"0.76 (0.030 in)","coilType":"Points under flywheel (Magnetron electronic later)",
    "starterType":"Recoil only","idleRpm":"1750","wotRpm":"3600 (governed)","wotPower":"5 hp @ 3,600 rpm","shaftType":"Horizontal 3/4\" keyed","weightKg":"~14",
    "notes":"Briggs & Stratton 5 HP flathead — the L-head single that powered a generation of minibikes, karts, tillers and mowers; the engine every young wrench learned on. Points under the flywheel (0.020 in) on older units, Magnetron electronic conversion is a classic upgrade; Champion J19LM plug at 0.030 in. Huge vintage-kart racing scene. Verify series (Pulsa-Jet vs Flo-Jet carb, tank config) by the model number stamped on the shroud." }
  $b5hp$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Vintage & Aussie icons batch imported (12 machines).';
END $$;

-- ═══ British Seagull — enriched from Saving Old Seagulls (sourced) ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- ENRICH: Forty Plus (sourced bore/stroke, codes, gears, prop)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-forty-plus';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-forty-plus','British Seagull','Forty Plus','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Enriched from Saving Old Seagulls / brochure data', $sgfp2$
  { "year":"1956–1990s (code SJP 1956–67; later variants)","strokeType":"2-Stroke (3-port)","ccSize":"64","cylCount":"1",
    "boreDiameter":"45.0","crankStroke":"40.0","coolingType":"Liquid cooled (raw water)",
    "fuelSystem":"Carburetted (Villiers/Amal; Bing from ~1978)","mixRatio":"10:1 (pre-1978 Villiers/Amal) / 25:1 (Bing, or after conversion)",
    "plugType":"Champion D16 (18 mm)","plugGap":"0.50 mm (0.020 in)","coilType":"Flywheel magneto (Villiers/Wipac; breakerless CD on late models)",
    "starterType":"Rope pull (knotted cord on flywheel)","obSteering":"Tiller","obTiltTrim":"Manual tilt","obShaftLength":"Standard / long (by model code)",
    "obLowerUnitOilType":"SAE 140 gear oil (heavy)","obGearRatio":"2.5:1 reduction","obPropPitch":"3-blade anti-weed, 8 in (203 mm) dia",
    "transType":"Direct drive (no neutral; clutch on 'C' codes; FN gears on late)","wotPower":"~3 hp thrust class (55 lb / 25 kg thrust)","wotRpm":"~4000","fuelTankCapacity":"~1.8 (brass tank)","weightKg":"~12",
    "notes":"British Seagull Forty Plus — the archetypal Seagull. Code SJP (1956–1967); continued in later variants into the 1990s. 64 cc (45×40 mm) 3-port water-cooled single, 2.5:1 reduction, 8-inch 3-blade anti-weed prop, ~55 lb thrust (marketed as the 3 hp class). CRITICAL: pre-1978 Villiers/Amal-carb engines run 10:1 premix by design — convertible to 25:1; Bing-carb engines run 25:1. Plug Champion D16, points ~0.020 in. Dating: serial letters = month, digit = year (A3 = Jan '63; from 1973 doubled letters, AA3 = Jan '73). Sources: saving-old-seagulls.co.uk, britishseagullparts.com." }
  $sgfp2$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- ENRICH: Forty Minus
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-forty-minus';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-forty-minus','British Seagull','Forty Minus','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Enriched from Saving Old Seagulls / brochure data', $sgfm2$
  { "year":"1955–1967 (code SJM)","strokeType":"2-Stroke (3-port)","ccSize":"64","cylCount":"1",
    "boreDiameter":"45.0","crankStroke":"40.0","coolingType":"Liquid cooled (raw water)",
    "fuelSystem":"Carburetted (Villiers/Amal)","mixRatio":"10:1 (convertible to 25:1)",
    "plugType":"Champion D16 (18 mm)","plugGap":"0.50 mm (0.020 in)","coilType":"Flywheel magneto (Villiers/Wipac)",
    "starterType":"Rope pull (knotted cord on flywheel)","obSteering":"Tiller","obTiltTrim":"Manual tilt",
    "obLowerUnitOilType":"SAE 140 gear oil (heavy)","obGearRatio":"10/21 reduction","obPropPitch":"4-blade, 6 in (152 mm) dia",
    "transType":"Direct drive (no neutral)","wotPower":"~1.5 hp class","wotRpm":"~3500","fuelTankCapacity":"~1.8 (brass tank)","weightKg":"~12 (26 lb)",
    "notes":"British Seagull Forty Minus — code SJM, 1955–1967; the lower-rated 64 cc sibling (10/21 gears, 6-inch 4-blade prop, ~3500 rpm) for 6–9 ft dinghies with low transoms. Same 10:1-premix rules and Champion D16 plug as the rest of the classic range. Succeeded in spirit by the Forty Featherweight. Sources: saving-old-seagulls.co.uk, britishseagullparts.com." }
  $sgfm2$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- NEW: Forty Featherweight
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-forty-featherweight';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-forty-featherweight','British Seagull','Forty Featherweight','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Spec import from Saving Old Seagulls / brochure data', $sgff$
  { "year":"1967–1976 (code F; GF 1977–78)","strokeType":"2-Stroke (3-port)","ccSize":"64","cylCount":"1",
    "boreDiameter":"45.0","crankStroke":"40.0","coolingType":"Liquid cooled (raw water)",
    "fuelSystem":"Carburetted (Seagull-Villiers pre-1978; Bing after)","mixRatio":"10:1 (pre-1978; convertible) / 25:1 (Bing)",
    "plugType":"Champion D16 (18 mm)","plugGap":"0.50 mm (0.020 in)","coilType":"Flywheel magneto (Wipac)",
    "starterType":"Rope pull (knotted cord on flywheel)","obSteering":"Tiller","obTiltTrim":"Manual tilt",
    "obLowerUnitOilType":"SAE 140 gear oil (heavy)","obGearRatio":"10/21 reduction","obPropPitch":"4-blade, 6 in (152 mm) dia",
    "transType":"Direct drive (no neutral)","wotPower":"~1.5 hp class","wotRpm":"~3500","weightKg":"~12 (26 lb)",
    "notes":"British Seagull Forty Featherweight — code F (1967–1976), GF (1977–78); the lightest classic Seagull, successor to the Forty Minus for small dinghies and tenders. 64 cc (45×40 mm), 10/21 gears, 6-inch 4-blade prop, ~26 lb. Model 45 continued the 1.5 hp line after it. 10:1 premix on Villiers-carb engines (pre-Jan-1978), 25:1 on Bing. Sources: saving-old-seagulls.co.uk, britishseagullparts.com." }
  $sgff$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- NEW: Model 102
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-102';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-102','British Seagull','Model 102','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Spec import from Saving Old Seagulls / brochure data', $sg102$
  { "year":"1936–1960s (first '102' badged Marston Seagull)","strokeType":"2-Stroke (3-port)","ccSize":"102","cylCount":"1",
    "coolingType":"Liquid cooled (raw water, water-injected exhaust)","fuelSystem":"Carburetted (Amal; 'A' in code = Amal)",
    "mixRatio":"10:1","plugType":"Champion D16 (18 mm)","plugGap":"0.50 mm (0.020 in)","coilType":"Flywheel magneto (Villiers)",
    "starterType":"Rope pull (knotted cord on flywheel)","obSteering":"Tiller","obTiltTrim":"Manual tilt",
    "obLowerUnitOilType":"SAE 140 gear oil (heavy)","transType":"Direct drive (clutch on 'C' codes)","wotPower":"~4 hp class","weightKg":"~18",
    "notes":"British Seagull Model 102 — the pre-war original of the big-block line: first sold 1936 wearing the 'Marston Seagull' logo, with an integral cylinder block/head and water-injected exhaust. Codes carry letters for features ('A' = Amal carb, 'C' = clutch, 'D' = model series). The square-block Century family descended from it. Strictly 10:1 premix — plain bearings depend on the oil. A genuine collector's motor with parts still circulating via the Seagull community. Sources: saving-old-seagulls.co.uk, britishseagullparts.com." }
  $sg102$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- ENRICH: Silver Century (sourced bore/stroke + prop)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-silver-century';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-silver-century','British Seagull','Silver Century','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Enriched from Saving Old Seagulls / brochure data', $sgsc2$
  { "year":"1950s–1990s (codes S/WS; WSPC = long-shaft Plus)","strokeType":"2-Stroke (3-port)","ccSize":"102","cylCount":"1",
    "boreDiameter":"57.0","crankStroke":"44.0","coolingType":"Liquid cooled (raw water)",
    "fuelSystem":"Carburetted (Amal; Bing from ~1978)","mixRatio":"10:1 (pre-1978) / 25:1 (Bing or converted)",
    "plugType":"Champion D16 (18 mm)","plugGap":"0.50 mm (0.020 in)","coilType":"Flywheel magneto (Villiers/Wipac; CD on late)",
    "starterType":"Rope pull (knotted cord on flywheel)","obSteering":"Tiller","obTiltTrim":"Manual tilt","obShaftLength":"Standard (S) / long (W-prefix)",
    "obLowerUnitOilType":"SAE 140 gear oil (heavy)","obGearRatio":"12/48 (4:1) reduction","obPropPitch":"5-blade, 11 in (280 mm) dia",
    "transType":"Direct drive (clutch on 'C' codes)","wotPower":"4–5.5 hp","wotRpm":"~4500 max","fuelTankCapacity":"~2.3 (brass tank)","weightKg":"~17",
    "notes":"British Seagull Silver Century / Silver Century Plus — the 102 cc (57×44 mm) big single. Codes: S, SP, SPC, WS, WSC, WSPC, ESC, ESPC (W = long shaft, P = Plus big gearbox/prop, C = clutch, E = electronic ignition). 12/48 gears swinging a 5-blade 11-inch prop — legendary displacement-dinghy thrust; main engine for 14–17 ft boats. 10:1 premix pre-1978, 25:1 with Bing. Dating: serial letter=month, digit=year (doubled letters from 1973: AA3 = Jan '73). Sources: saving-old-seagulls.co.uk, britishseagullparts.com." }
  $sgsc2$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- NEW: Model 90/110 series
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-90-110';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-90-110','British Seagull','Model 90/110','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Spec import from Saving Old Seagulls / brochure data', $sg90$
  { "year":"1979–1990s (with Models 75 & 80)","strokeType":"2-Stroke (3-port)","ccSize":"102","cylCount":"1",
    "coolingType":"Liquid cooled (raw water)","fuelSystem":"Carburetted (Bing)","mixRatio":"25:1",
    "plugType":"Champion D16 (18 mm)","coilType":"Breakerless CD ignition (sealed)","starterType":"Rope pull / recoil (by variant)",
    "obSteering":"Tiller","obTiltTrim":"Manual tilt","obLowerUnitOilType":"SAE 140 gear oil (heavy)","obGearRatio":"12/48 (4:1) reduction",
    "transType":"FNR gearbox (forward-neutral-reverse) on 110","wotPower":"~5 hp","weightKg":"~20",
    "notes":"British Seagull Models 75 / 80 / 90 / 110 (from 1979) — the metricated, Bing-carb, CD-ignition evolution of the Century line, all ~5 hp on the 102 block with 12/48 gears. The Model 110 adds an FNR gearbox (forward-neutral-reverse) — the first Seagulls you could take out of gear. 25:1 mix as standard. Model 80 = Silver Century Plus CD. Sources: saving-old-seagulls.co.uk (90/110 series page), britishseagullparts.com." }
  $sg90$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- NEW: Model 170
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-170';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-170','British Seagull','Model 170','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Spec import from Saving Old Seagulls / brochure data', $sg170$
  { "year":"1982–1996 (with Model 125 from 1984)","strokeType":"2-Stroke","ccSize":"~102 (170 = model, not cc)","cylCount":"1",
    "coolingType":"Liquid cooled (raw water)","fuelSystem":"Carburetted (upgraded Bing)","mixRatio":"25:1",
    "coilType":"Breakerless CD ignition","starterType":"Recoil","obSteering":"Tiller","obTiltTrim":"Manual tilt",
    "obLowerUnitOilType":"SAE 140 gear oil (heavy)","transType":"Direct / clutch (by variant)","wotPower":"~5 hp class",
    "notes":"British Seagull Model 170 (1982–1996) and Model 125 (1984–1996) — the late cowled Seagulls: enclosed engine, upgraded carburettors and cylinder blocks, recoil start; visually modern but classic Seagull underneath. Produced until the company's mid-1990s end. Verify per-engine figures against the handbook — late-model variants differ. Sources: saving-old-seagulls.co.uk, britishseagullparts.com." }
  $sg170$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- ENRICH: QB / Kingfisher (sourced: 102cc 5-port, 3.1:1 FNR, 55.5 lb, 1987)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-qb-kingfisher';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-qb-kingfisher','British Seagull','QB / Kingfisher','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Enriched from Saving Old Seagulls / brochure data', $sgqb2$
  { "year":"1987–1990s (QB series)","strokeType":"2-Stroke (5-port)","ccSize":"102","cylCount":"1",
    "coolingType":"Liquid cooled (raw water)","fuelSystem":"Carburetted (Bing)","mixRatio":"25:1",
    "coilType":"Breakerless CD ignition","starterType":"Recoil","obSteering":"Tiller","obTiltTrim":"Manual tilt",
    "obLowerUnitOilType":"SAE 140 gear oil (heavy)","obGearRatio":"3.1:1 reduction","transType":"FNR gearbox (forward-neutral-reverse)",
    "wotPower":"6 hp (Kingfisher) / 5 hp (Osprey) / 4 hp (Curlew)","weightKg":"25.2 (55.5 lb dry)",
    "notes":"British Seagull QB series — launched at the 1987 London Boat Show with the 6 hp Kingfisher, followed by the 5 hp Osprey and 4 hp Curlew. A genuinely modernized Seagull: 102 cc 5-port engine, 3.1:1 FNR gearbox, recoil start, cowling, CD ignition, 25:1 mix. Less loved by purists but the most usable Seagulls day-to-day. Sources: saving-old-seagulls.co.uk, britishseagullparts.com." }
  $sgqb2$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Seagull enrichment batch complete (4 enriched + 4 new = 8 entries).';
END $$;

-- ═══ British Seagull — complete the range (sourced from Saving Old Seagulls et al.) ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- NEW: Little Forty (earliest small Seagull)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-little-forty';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-little-forty','British Seagull','Little Forty','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Spec import from Saving Old Seagulls (sourced)', $sglf$
  { "year":"1949 onward (first 'Little Model 40', 1949)","strokeType":"2-Stroke (3-port)","ccSize":"40 (Model F) / 56 (FV, FVP)","cylCount":"1",
    "coolingType":"Liquid cooled (raw water)","fuelSystem":"Carburetted (Villiers)","mixRatio":"10:1 (plain-bearing engine)",
    "plugType":"Champion D16 (18 mm; classic-range plug)","plugGap":"0.50 mm (0.020 in)","coilType":"Flywheel magneto (Villiers)",
    "starterType":"Rope pull (knotted cord on flywheel)","obSteering":"Tiller (mounted to the CENTRE of the crankcase — unique to the Little Forty)","obTiltTrim":"Manual tilt",
    "obLowerUnitOilType":"SAE 140 gear oil (heavy)","obGearRatio":"10/21 (2.1:1) reduction","transType":"Direct drive (no neutral)","wotPower":"~1–1.5 hp class",
    "notes":"British Seagull Little Forty — the earliest small Seagull, first sold as the 'Little Model 40' in 1949. Three sub-models: Model F (40 cc) and the larger FV / FVP (56 cc) — note these are SMALLER than the 64 cc block of the later Forty Minus/Featherweight, so parts do not interchange. Several details are unique to it: the tiller arm mounts to the CENTRE of the crankcase (not the side), the transom bracket is plated bronze, the fuel pipe is plated, the drive-shaft tube is CLAMPED to the base of the crankcase (later models bolt it) and SCREWED into the gearbox (later models clamp it). Strictly 10:1 premix — plain bronze bearings depend on the oil. Spares are now largely obsolete; a collector's engine. Sources: saving-old-seagulls.co.uk (little_forty), britishseagullparts.com." }
  $sglf$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- NEW: Century (base / Century 100)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-century';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-century','British Seagull','Century','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Spec import from Saving Old Seagulls (sourced)', $sgcen$
  { "year":"1956/57–1973 (LLS Villiers 1956/57–1967; W Wipac 1967–1973)","strokeType":"2-Stroke (3-port)","ccSize":"102","cylCount":"1",
    "boreDiameter":"57.0","crankStroke":"40.0","coolingType":"Liquid cooled (raw water)",
    "fuelSystem":"Carburetted (Villiers; round inlet port)","mixRatio":"10:1 (pre-1978 Villiers) / 25:1 (after conversion)",
    "plugType":"Champion D16 (18 mm)","plugGap":"0.50 mm (0.020 in)","coilType":"Villiers magneto (LLS) / Wipac (W, from 1967)",
    "starterType":"Rope pull (knotted cord on flywheel)","obSteering":"Tiller","obTiltTrim":"Manual tilt","obShaftLength":"Standard ~16 in / long ~22 in (verify)",
    "obLowerUnitOilType":"SAE 140 gear oil (heavy)","obGearRatio":"10/35 (3.5:1) standard; 4:1 fixed and 4:1 clutched boxes also offered","obPropPitch":"4-blade, 9 in (229 mm) dia (11 in on clutch box)",
    "transType":"Direct drive (no neutral; 4:1 clutched box optional)","wotPower":"3–4 hp class","wotRpm":"~3800–4000","fuelTankCapacity":"~2.27 (4-pint brass/steel)","weightKg":"~17 (37 lb)",
    "notes":"British Seagull Century ('Century 100') — the base 102 cc big single. Codes LLS (1956/57–1967, Villiers magneto) and W (1967–1973, Wipac). Runs a Villiers carburettor with a ROUND cylinder inlet port on the opposite side of the block to the later Amal-carb Silver Century — the quickest way to tell the two apart. Three lower units were offered: the standard 3.5:1 (10/35), a 4:1 fixed and a 4:1 clutched box, all with Villiers carbs. 10:1 premix in the Villiers era; Champion D16; SAE 140 in the gearbox. Stroke shown as 40 mm to reconcile with 102 cc — some Plus-series data prints 44 mm; verify against the handbook. Sources: saving-old-seagulls.co.uk (century_series), britishseagullparts.com (LLS), lagerholm.com." }
  $sgcen$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- NEW: Century Plus
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-century-plus';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-century-plus','British Seagull','Century Plus','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Spec import from Saving Old Seagulls (sourced)', $sgcp$
  { "year":"1957–1973 (CP/CPC 1957–1967 Villiers; WP/WPC 1967–1973 Wipac)","strokeType":"2-Stroke (3-port)","ccSize":"102","cylCount":"1",
    "boreDiameter":"57.0","crankStroke":"40.0 (verify; some Plus data prints 44)","coolingType":"Liquid cooled (raw water)",
    "fuelSystem":"Carburetted (Villiers)","mixRatio":"10:1 (pre-1978 Villiers) / 25:1 (after conversion)",
    "plugType":"Champion D16 (18 mm)","plugGap":"0.50 mm (0.020 in)","coilType":"Villiers magneto (CP/CPC) / Wipac (WP/WPC)",
    "starterType":"Rope pull (knotted cord on flywheel)","obSteering":"Tiller","obTiltTrim":"Manual tilt",
    "obLowerUnitOilType":"SAE 140 gear oil (heavy)","obGearRatio":"Big 'Plus' reduction box, slow-turning (~4:1 class; some data prints 10/35 — verify)","obPropPitch":"Large coarse-pitch prop (~11 in on clutch box)",
    "transType":"Fixed drive (CP/WP) or clutch drive with neutral (CPC/WPC)","wotPower":"4–5.5 hp class","wotRpm":"~4500","fuelTankCapacity":"~2.27 (4-pint)","weightKg":"~17 (37 lb)",
    "notes":"British Seagull Century Plus — the higher-thrust Century. Codes: CP (fixed, 1957–67), CPC (clutch, 1959–67), WP (fixed, 1967–69), WPC (clutch, 1967–73). The 'Plus' is a physically much larger, slower-turning gearbox swinging a big coarse-pitch prop — built for thrust on heavier displacement hulls (17–19 ft boats), not top speed. Villiers carb, 10:1 premix in period. Fixed-drive (CP/WP) has no neutral; clutch versions (CPC/WPC) add neutral. Roughly 3¼ hours per gallon at ½–¾ throttle. Sources: saving-old-seagulls.co.uk ('Differences between Century and Plus'), britishseagullparts.com (CP/CPC), lagerholm.com." }
  $sgcp$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- NEW: Silver Century Plus
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-silver-century-plus';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-silver-century-plus','British Seagull','Silver Century Plus','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Spec import from British Seagull Parts (sourced)', $sgscp$
  { "year":"1966–1973 (WSP/WSPC; WSPCL long-shaft; later ESPC with CD ignition)","strokeType":"2-Stroke (3-port)","ccSize":"102","cylCount":"1",
    "boreDiameter":"57.0","crankStroke":"44.0 (as printed on WSPC data; note 57×44 ≈ 112 cc — verify)","coolingType":"Liquid cooled (raw water); fully water-jacketed cast-iron cylinder",
    "fuelSystem":"Carburetted (Seagull-Amal 46 twin-jet)","mixRatio":"10:1 (pre-1978, Power Jet 45) / 25:1 (from 1978, Power Jet 40)",
    "plugType":"Champion D16 (18 mm)","plugGap":"0.50 mm (0.020 in)","coilType":"Wipac magneto (WSP/WSPC); breakerless CD on ESPC",
    "starterType":"Rope pull (knotted cord on flywheel)","obSteering":"Tiller","obTiltTrim":"Manual tilt","obShaftLength":"Standard; long-shaft = WSPCL (L suffix)",
    "obLowerUnitOilType":"SAE 140 gear oil (heavy)","obGearRatio":"12/48 (4:1) reduction","obPropPitch":"5-blade Hydrofan, 11 in (280 mm) dia, compound pitch",
    "transType":"Fixed drive (WSP) or clutch drive with neutral (WSPC)","wotPower":"4–5.5 hp class","wotRpm":"~4500","fuelTankCapacity":"~2.27 (4-pint) / 3.12 (5.5-pint long-range)","weightKg":"17 (37 lb dry)",
    "notes":"British Seagull Silver Century Plus — the top classic big-single. Codes: WSP (fixed), WSPC (clutch), WSPCL (clutch long-shaft), later ESPC (CD ignition). Seagull-Amal 46 twin-jet carb; the big 12/48 (4:1) 'Plus' gearbox swings a 5-blade 11-inch Hydrofan for maximum low-rev thrust on heavy hulls. ~2.5 hours per gallon. Fuel mix: 10:1 with the No.45 power jet pre-1978, 25:1 with the No.40 jet (part S7/062/40) from 1978. Dating example: WSPCL 1734 BB3 = long-shaft SCP, unit 1734, Feb 1973 (doubled month letters signal 1973-on). Sources: britishseagullparts.com (WSPC), saving-old-seagulls.co.uk (i_d_letters), lagerholm.com." }
  $sgscp$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- NEW: Model 125 (cowled) — promoted to its own entry
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-125';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-125','British Seagull','Model 125','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Spec import from British Seagull Parts (sourced)', $sg125$
  { "year":"Late 1980s–1996 (cowled era; some data 1982–1987 — verify)","strokeType":"2-Stroke (4-port)","ccSize":"102","cylCount":"1",
    "boreDiameter":"57.0","crankStroke":"40.0","coolingType":"Liquid cooled (raw water; centrifugal impeller)",
    "fuelSystem":"Carburetted (upgraded; Bing-type)","mixRatio":"25:1 (a 50:1 spec was tried at launch, then reverted to 25:1 after bearing failures)",
    "plugType":"Seagull IGN70006 short-reach (NOT the classic D16)","plugGap":"0.50 mm (0.020 in) (verify)","coilType":"Breakerless CD ignition (sealed, waterproof)",
    "starterType":"Recoil","obSteering":"Tiller","obTiltTrim":"Manual tilt","obShaftLength":"Standard; long-shaft ~47 in (1168 mm) overall",
    "obLowerUnitOilType":"SAE 90 / EP90 (sealed box)","obGearRatio":"2.5:1 Forward-Neutral (F-N)","transType":"F-N gearbox (forward + neutral; not full reverse like the 170)",
    "wotPower":"~6 hp equivalent (125 lb prop thrust)","fuelTankCapacity":"~27 (6-gallon remote)","weightKg":"~25 (56 lb, verify)",
    "notes":"British Seagull Model 125 — one of the two late cowled Seagulls (with the larger Model 170). The '125' is propeller thrust in pounds (≈6 hp), not a displacement — it uses the same 102 cc (57×40 mm) block, here with a 4-port head, sealed breakerless CD ignition, recoil start and a full cowling. Runs a 2.5:1 forward-neutral box (the 170 gets full FNR). CAUTION: the 125/170 pair suffered a poorly-designed crankshaft/con-rod bushing that caused warranty failures — worst on lean mixtures, which is why the launch 50:1 spec was pulled back to 25:1. Sealed gearbox takes SAE 90, not SAE 140. Production years and dry weight vary between sources — verify against the handbook. Sources: britishseagullparts.com (model-125), saving-old-seagulls.co.uk." }
  $sg125$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- NEW: QB Osprey
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-qb-osprey';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-qb-osprey','British Seagull','QB Osprey','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Spec import from British Seagull Parts (sourced)', $sgosp$
  { "year":"1987–1996 (QB series)","strokeType":"2-Stroke (5-port)","ccSize":"102","cylCount":"1",
    "boreDiameter":"57.0","crankStroke":"40.0","coolingType":"Liquid cooled (raw water; centrifugal impeller; water-cooled underwater exhaust)",
    "fuelSystem":"Carburetted (Bing)","mixRatio":"25:1","plugType":"Champion N4 / Seagull IGN70006 (verify)","plugGap":"0.50 mm (0.020 in) (verify)",
    "coilType":"Breakerless CD ignition (sealed, waterproof)","starterType":"Recoil","obSteering":"Tiller","obTiltTrim":"Manual tilt",
    "obShaftLength":"Standard 15 in (381 mm) / long 20 in (508 mm)","obLowerUnitOilType":"SAE 90 / EP90 (sealed box)","obGearRatio":"3.1:1 FNR reduction","transType":"FNR gearbox (forward-neutral-reverse)",
    "wotPower":"5 hp (Seagull 5; ~90–110 lb thrust)","weightKg":"~25 (≈ Kingfisher block; verify)",
    "notes":"British Seagull QB Osprey (Seagull 5) — the middle engine of the 1980s QB ('Quiet Britain') range developed with Queen's University Belfast. Same 102 cc (57×40 mm) 5-port block and cylinder-head casting as the 6 hp Kingfisher, but tuned and propped for 5 hp. Cross-scavenge combustion, water-cooled underwater exhaust, sealed breakerless CD ignition, recoil start, cowling, 3.1:1 FNR gearbox, 25:1 mix. Per-model dry weight and tank are not separately published — the figure shown is the shared-block value; verify against the handbook. Sources: britishseagullparts.com (QB), saving-old-seagulls.co.uk (qb_series)." }
  $sgosp$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- NEW: QB Curlew
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-qb-curlew';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-qb-curlew','British Seagull','QB Curlew','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Spec import from British Seagull Parts (sourced)', $sgcur$
  { "year":"1987–1996 (QB series; factory code QB1)","strokeType":"2-Stroke","ccSize":"102","cylCount":"1",
    "boreDiameter":"57.0","crankStroke":"40.0","coolingType":"Liquid cooled (raw water; centrifugal impeller; water-cooled underwater exhaust)",
    "fuelSystem":"Carburetted (Bing)","mixRatio":"25:1","plugType":"Champion N4 / Seagull IGN70006 (verify)","plugGap":"0.50 mm (0.020 in) (verify)",
    "coilType":"Breakerless CD ignition (sealed, waterproof)","starterType":"Recoil","obSteering":"Tiller","obTiltTrim":"Manual tilt",
    "obShaftLength":"Standard 15 in (381 mm) / long 20 in (508 mm)","obLowerUnitOilType":"SAE 90 / EP90 (sealed box)","obGearRatio":"3.1:1 FNR reduction","transType":"FNR gearbox (forward-neutral-reverse); clutch",
    "wotPower":"4 hp (Seagull 4; ~60–75 lb thrust)","weightKg":"~25 (≈ Kingfisher block; verify)",
    "notes":"British Seagull QB Curlew (Seagull 4, factory code QB1) — the smallest, lowest-tuned engine of the 1980s QB range. Uses the same 102 cc (57×40 mm) block as the Kingfisher and Osprey but, unlike those two (which share one head casting), the Curlew has its OWN model-specific cylinder head. 4 hp, cross-scavenge, water-cooled underwater exhaust, sealed breakerless CD ignition, recoil start, cowling, 3.1:1 FNR gearbox with clutch, 25:1 mix. Per-model weight/tank not separately published — the shared-block figure is shown; verify against the handbook. Sources: britishseagullparts.com (QB), saving-old-seagulls.co.uk (qb_series)." }
  $sgcur$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- ENRICH: Model 170 (real sourced specs; de-bundle the 125)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-170';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-170','British Seagull','Model 170','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Enriched from British Seagull Parts (sourced)', $sg170b$
  { "year":"Late 1980s–1996 (cowled era; some data 1982–1987 — verify)","strokeType":"2-Stroke (4-port, loop-scavenged)","ccSize":"102","cylCount":"1",
    "boreDiameter":"57.0","crankStroke":"40.0","coolingType":"Liquid cooled (raw water; centrifugal impeller)",
    "fuelSystem":"Carburetted (upgraded; Bing-type)","mixRatio":"25:1 (50:1 tried at launch, reverted to 25:1)",
    "plugType":"Seagull IGN70006 short-reach (NOT the classic D16)","plugGap":"0.50 mm (0.020 in) (verify)","coilType":"Breakerless CD ignition (sealed, waterproof)",
    "starterType":"Recoil","obSteering":"Tiller","obTiltTrim":"Manual tilt","obShaftLength":"Standard (overall 45.5 in / 1155 mm) / long (49.5 in / 1257 mm)",
    "obLowerUnitOilType":"SAE 90 / EP90 (sealed box)","obGearRatio":"3:1 FNR reduction","obPropPitch":"4-blade anti-weed, 10.625 in (270 mm) dia",
    "transType":"FNR gearbox (forward-neutral-reverse)","wotPower":"~7.5 hp equivalent (170 lb prop thrust)","fuelTankCapacity":"~27 (6-gallon remote)",
    "notes":"British Seagull Model 170 — the largest and last major Seagull, flagship of the late cowled range (with the smaller Model 125). The '170' is propeller thrust in pounds (≈7.5 hp), not displacement: it uses the same 102 cc (57×40 mm) block with a 4-port loop-scavenged head, sealed breakerless CD ignition, recoil start, a full cowling and a 3:1 FNR gearbox swinging a 4-blade 10.625-inch anti-weed prop. Fuel use ~3.5 pints (2 L) per hour at ½–¾ throttle from a 6-gallon remote tank. CAUTION: the 125/170 pair suffered a poorly-designed crankshaft/con-rod bushing that caused warranty failures (worst on lean mixtures — hence the launch 50:1 spec was pulled back to 25:1), denting Seagull's reliability reputation near the end. Sealed gearbox takes SAE 90. Production years and dry weight differ between sources — verify against the handbook. Sources: britishseagullparts.com (model-170), saving-old-seagulls.co.uk." }
  $sg170b$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- ENRICH: Model 102 (add sourced bore/stroke, gear, rpm)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-102';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-102','British Seagull','Model 102','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Enriched with sourced bore/stroke & gearing', $sg102b$
  { "year":"1936–1960s (first '102' badged Marston Seagull)","strokeType":"2-Stroke (3-port)","ccSize":"102","cylCount":"1",
    "boreDiameter":"57.0","crankStroke":"40.0","coolingType":"Liquid cooled (raw water, water-injected exhaust)","fuelSystem":"Carburetted (Amal; 'A' in code = Amal)",
    "mixRatio":"10:1","plugType":"Champion D16 (18 mm)","plugGap":"0.50 mm (0.020 in)","coilType":"Flywheel magneto (Villiers)",
    "starterType":"Rope pull (knotted cord on flywheel)","obSteering":"Tiller","obTiltTrim":"Manual tilt",
    "obLowerUnitOilType":"SAE 140 gear oil (heavy)","obGearRatio":"2.5:1 (Plus/clutch variants 4:1)","transType":"Direct drive (clutch on 'C' codes)","wotPower":"~4 hp class","wotRpm":"~3800","weightKg":"~18",
    "notes":"British Seagull Model 102 — the pre-war original of the big-block line: first sold 1936 wearing the 'Marston Seagull' logo, 102 cc (57×40 mm) with an integral cylinder block/head and water-injected exhaust. Codes carry letters for features ('A' = Amal carb, 'C' = clutch, 'W' = Wipac ignition added early-70s). All 102s except Plus versions ran the 2.5:1 box (Plus = 4:1). The square-block Century family descended from it. Strictly 10:1 premix — plain bearings depend on the oil. A genuine collector's motor with parts still circulating via the Seagull community. Sources: saving-old-seagulls.co.uk (102_models), britishseagullparts.com." }
  $sg102b$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- ENRICH: Model 90/110 (correct EFNR gearbox & sealed-box oil; add bore/stroke)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='british-seagull-90-110';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('british-seagull-90-110','British Seagull','Model 90/110','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Enriched: EFNR gearbox, sealed-box oil, bore/stroke', $sg90b$
  { "year":"1979–1990s (with Models 75 & 80)","strokeType":"2-Stroke (3-port)","ccSize":"102","cylCount":"1",
    "boreDiameter":"57.0","crankStroke":"40.0","coolingType":"Liquid cooled (raw water)","fuelSystem":"Carburetted (Bing)","mixRatio":"25:1",
    "plugType":"Champion D16 (18 mm)","plugGap":"0.50 mm (0.020 in)","coilType":"Breakerless CD ignition (sealed)","starterType":"Rope pull / recoil (by variant)",
    "obSteering":"Tiller","obTiltTrim":"Manual tilt","obShaftLength":"Standard / long","obLowerUnitOilType":"SAE 90 / EP90 (sealed EFNR box)","obGearRatio":"3.1:1 FNR (EFNR box on 90/110); 12/48 (4:1) on fixed-box variants",
    "transType":"FNR gearbox (forward-neutral-reverse) — the first Seagulls you could take out of gear","wotPower":"~5 hp (90 = 90 lb thrust; 110 = 110 lb thrust)","wotRpm":"~4500","weightKg":"~20",
    "notes":"British Seagull Models 75 / 80 / 90 / 110 (from 1979) — the metricated, Bing-carb, CD-ignition evolution of the Century line on the 102 block. The numbers are propeller thrust in pounds, not cc. Model code EFNR (E = electronic/CD ignition, F = 40/Forty series lineage, NR = neutral-reverse gearbox), 3.1:1 FNR box; a fixed 12/48 (4:1) lower unit was the alternative. The FNR gearbox made these the first Seagulls with a neutral. Model 80 ≈ Silver Century Plus with CD ignition. Sealed gearbox takes SAE 90, not SAE 140. 25:1 mix as standard. Sources: saving-old-seagulls.co.uk (90/110 series), britishseagullparts.com." }
  $sg90b$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Seagull range-completion batch: 7 new + 3 enriched. Library Seagull total now 15.';
END $$;

-- ═══ Cult small engines — vintage industrial, Tecumseh & Clinton (Standalone Engine) ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- Briggs & Stratton WM/WMB
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='briggs-wm-wmb';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('briggs-wm-wmb','Briggs & Stratton','WM/WMB','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage industrial spec import', $bwm$
  { "year":"1940s–1950s (WM/WMB family; exact range verify)","strokeType":"4-Stroke","ccSize":"103 (6.28 cu in)","cylCount":"1",
    "coolingType":"Air cooled","wotPower":"1.20 hp @ 2,200 rpm / 1.48 hp @ 2,700 rpm / 1.60 hp @ 3,200 rpm (rated curve)",
    "plugType":"14mm, Champion J8 or equivalent","coilType":"High-tension magneto","fuelTankCapacity":"0.95 (1 quart)",
    "notes":"Briggs & Stratton WM/WMB — a classic cast-iron collector flathead, part of the same letter-series family as the Model N, 6B and 8B. WM has the spark plug mounted on the side of the head; WMB has it vertical in the head. Early WMB used an external breather with a cast-iron head; later WMB switched to an internal breather with an aluminum head. Flywheel nut is LEFT-HAND thread (loosens clockwise) — a classic gotcha for first-time rebuilders. Oil capacity ~1 pint. Primary application: washing machines, plus some lawn mowers. Prized by the stationary-engine collector community (smokstak.com) as an easy, cheap, forgiving entry point into vintage engine restoration — parts are plentiful and castings are simple. Siblings Model N, 6B and 8B exist in the same family but lack independently confirmed hp/rpm/ignition/weight figures and were not given separate entries. Verify exact production years against manual/collector forum." }
  $bwm$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kohler K91
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kohler-k91';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kohler-k91','Kohler','K91','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage industrial spec import', $k91$
  { "year":"~1951 introduction (one source cites a 1959 line-rationalization redesignation from K90 — conflicting, verify)","strokeType":"4-Stroke","ccSize":"~145 (calculated from bore/stroke; verify against manual)","cylCount":"1",
    "boreDiameter":"60.33","crankStroke":"50.80","valveTrain":"L-head (side valve)","coolingType":"Air cooled",
    "shaftType":"Horizontal PTO","wotPower":"4.0 hp (4.1 PS / 3.0 kW) @ 4,000 rpm","wotRpm":"4000",
    "starterType":"Recoil (rope-start most common); some battery/starter-generator variants existed",
    "coilType":"Magneto, battery, or breakerless ignition depending on application/era",
    "notes":"Kohler K91 — smallest of the classic K-series garden-tractor engines. Part of a family (K91/K161/K181/K241/K301/K321/K341) that shares enough ignition-coil, points and service-manual commonality to function as a single rebuild ecosystem — a big driver of parts availability today. Prized in the garden-tractor collector/puller community for cast-iron durability and being easy to hop up; dedicated garden-tractor-pulling tuning guides cover head/cam modification for competition classes. Kohler discontinued the K-series in the early 1980s for the Magnum line, described by collectors as 'essentially K's with new sheet metal and electronic ignition.' Sources: engine-specs.net, Wersis.net, smokstak.com." }
  $k91$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kohler K161
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kohler-k161';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kohler-k161','Kohler','K161','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage industrial spec import', $k161$
  { "year":"~1952 introduction (verify)","strokeType":"4-Stroke","ccSize":"~278 (calculated from bore/stroke; verify against manual)","cylCount":"1",
    "boreDiameter":"74.62","crankStroke":"63.50","valveTrain":"L-head (side valve)","coolingType":"Air cooled",
    "shaftType":"Horizontal PTO","wotPower":"7.0 hp (7.1 PS / 5.2 kW) @ 3,600 rpm","wotRpm":"3600",
    "coilType":"Ignition varies by era: magneto with recoil, or battery ignition with starter/generator, some with camshaft spark advance",
    "notes":"Kohler K161 — mid-size K-series engine, part of the same shared-parts family as the K91/K241/K301/K662. Garden-tractor collector cult values cast-iron durability and easy hop-up potential. See Kohler K91 entry for the broader family/discontinuation context. Sources: engine-specs.net, Wersis.net, wfmachines.com forum." }
  $k161$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kohler K241
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kohler-k241';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kohler-k241','Kohler','K241','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage industrial spec import', $k241$
  { "year":"Garden-tractor application era ~1970–1971, before many uses transitioned to the K301 in 1972 (verify exact cutover)","strokeType":"4-Stroke","ccSize":"391 (23.86 cu in)","cylCount":"1",
    "boreDiameter":"82.6","crankStroke":"73.0","valveTrain":"L-head (side valve)","coolingType":"Air cooled",
    "shaftType":"Horizontal PTO","wotPower":"10.0 hp (10.2 PS / 7.5 kW) @ 3,600 rpm","wotRpm":"3600",
    "coilType":"Magneto ignition — shares coil/points part numbering (e.g. 47-755-20-S) with K141/K161/K181/K301/K321",
    "notes":"Kohler K241 (10 hp) — garden-tractor mainstay of the K-series, common on 1970–71 tractors. Oil capacity documented as 1 or 2 quarts depending on crankcase/sump variant — verify against your specific serial's manual. Part of the shared K-series rebuild ecosystem (see K91 entry). Sources: engine-specs.net, tractorgearbox.com, justanswer.com, enginebore.com." }
  $k241$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kohler K301
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kohler-k301';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kohler-k301','Kohler','K301','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage industrial spec import', $k301$
  { "year":"1972 onward (succeeded K241 in garden-tractor applications; verify)","strokeType":"4-Stroke","ccSize":"476 (29.05 cu in)","cylCount":"1",
    "boreDiameter":"85.7","crankStroke":"82.6","valveTrain":"L-head (side valve)","coolingType":"Air cooled",
    "wotPower":"12.0 hp (12.2 PS / 9.0 kW) @ 3,600 rpm","wotRpm":"3600",
    "notes":"Kohler K301 (12 hp) — the larger sibling that succeeded the K241 in most garden-tractor lines from 1972. Required a lower-compression cylinder head; this led to LP (propane)-fuel heads being discontinued across the line in the early 1960s (verify detail against collector forum/manual). A favorite of the garden-tractor-pulling competition scene for its cast-iron durability and tuning headroom. Sources: engine-specs.net, tractorgearbox.com, gardentractorpullingtips.com." }
  $k301$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Kohler K662 (twin)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='kohler-k662';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('kohler-k662','Kohler','K662','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage industrial spec import', $k662$
  { "year":"K-series twin era (verify exact years)","strokeType":"4-Stroke","ccSize":"1101 (67.20 cu in)","cylCount":"2",
    "boreDiameter":"92.0","crankStroke":"82.5","valveTrain":"L-head (side valve), horizontal PTO","coolingType":"Air cooled",
    "fuelSystem":"Carburetted (downdraft)","wotPower":"24 hp (24.3 PS / 17.9 kW) @ 3,600 rpm","wotRpm":"3600",
    "notes":"Kohler K662 — the twin-cylinder flagship of the K-series, with pressurized lubrication (positive-displacement oil pump), full-flow oil filter, and a paper air cleaner with optional oiled foam pre-cleaner. A 'K661' designation appears in parts numbering but no independently verified separate spec was found for it — treat K662 as the documented twin. Part of the same garden-tractor-pulling collector cult as the smaller K-series singles. Sources: engine-specs.net." }
  $k662$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Onan CCK
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='onan-cck';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('onan-cck','Onan','CCK','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage industrial spec import', $onck$
  { "year":"Late 1950s–late 1980s/early 1990s (very long production run; units dated as early as Sept. 1959 documented)","strokeType":"4-Stroke","ccSize":"816.2 (49.8 cu in)","cylCount":"2",
    "boreDiameter":"82.55","crankStroke":"76.2","valveTrain":"L-head (side valve), opposed twin","coolingType":"Air cooled",
    "wotPower":"12.2–16.0 hp (9.1–12.3 kW) depending on rpm/source — figures inconsistent across secondary sources, verify against Onan CCK manual 927-0753/927-0754",
    "starterType":"Exciter-cranked (standard across nearly all CCK gensets; the MCCK variant is the documented exception)",
    "coilType":"Magneto (stock); many field units retrofitted to breakerless/electronic ignition + electronic governor (a very active DIY topic on smokstak.com)",
    "notes":"Onan CCK — 'the workhorse of the Onan line' per owner consensus, described as running 'forever with just the slightest care.' Widely used inside rebadged welder-generator sets — Miller AEA/AEAD 200-amp welder-gensets (run at 3,000 rpm, 5kW AC at 1,860 rpm per one source), plus private-label units sold as Bug welder, P&H, Craftsman, Solar Welder and General Electric — Onan built essentially the same core for many welder brands, creating a distinct welder-generator collector niche alongside straight-generator collectors. A single-source forum claim ties the Case 646 tractor to CCK power — verify. Sources: tractorgearbox.com, smokstak.com, onanfamily.org, archive.lib.msu.edu." }
  $onck$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Onan BF/BFA/BGA/NH family
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='onan-bf-bfa-bga-nh';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('onan-bf-bfa-bga-nh','Onan','BF/BFA/BGA/NH','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage industrial spec import', $onbf$
  { "year":"Mid-1970s–mid-1980s (NH units commonly dated 1978–1983 in collector listings)","strokeType":"4-Stroke","ccSize":"NH: 983 (60.0 cu in) — family also includes BF 659cc/40.25cu in, BFA 710cc/43.3cu in, BGA 777cc/47.4cu in","cylCount":"2 (opposed)",
    "coolingType":"Air cooled","wotPower":"NH: 14.0 hp / BF: 8.5 hp / BFA: 8.5 hp / BGA: 10.0 hp — all rated at 1,800 rpm","wotRpm":"1800",
    "starterType":"Exciter-cranked 12-volt starting system, standard across the whole family",
    "weightKg":"NH: 129.3 (285 lb) / BF: 98.4 (217 lb) / BFA: 106.6 (235 lb) / BGA: 74.8 (165 lb)",
    "notes":"Onan BF/BFA/BGA/NH — the classic RV/industrial genset family, shared four-cycle air-cooled opposed-twin architecture with a revolving-armature four-pole generator end. BF at 60Hz RV rating: 4,000W, 120V, 33A. Reportedly built in Huntsville, Alabama, prior to Linamar taking over production in a later corporate transition — verify against a company-history source rather than forum recollection. Valued by RV owners for simplicity, ease of field repair, and durability; the NH in particular is a staple of 'best Onan genset' owner discussions. Sources: manualzz.com (900-0337 service manual), archive.org, smokstak.com, onanfamily.org." }
  $onbf$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Tecumseh HSSK50
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='tecumseh-hssk50';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('tecumseh-hssk50','Tecumseh','HSSK50','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult mini-bike/kart swap-engine spec import', $thssk$
  { "year":"1980s–1990s (Snow King small-frame era; exact range verify)","strokeType":"4-Stroke","ccSize":"197.34 (12.04 cu in)","cylCount":"1",
    "boreDiameter":"71.4","crankStroke":"49.2","valveTrain":"L-head (flathead)","shaftType":"Horizontal, small frame",
    "coolingType":"Forced air","wotPower":"5.0 hp (3.7 kW) @ 3,600 rpm rated","torqueNm":"11.1 (8.2 ft-lb) @ 2,800 rpm",
    "starterType":"Recoil (rewind, 'mitten grip' handle); electric-start variants existed on related HSK models",
    "fuelTankCapacity":"1.9 (2.0 qt)","weightKg":"15.1 (33.0 lb)",
    "notes":"Tecumseh HSSK50 — THE classic mini-bike/go-kart swap engine, even though its factory purpose was snow blowers ('SK' = Snow King), not recreational vehicles. Its small-frame horizontal footprint fits tight vintage frames (Baja, Doodlebug-style, Coleman, older Rupp/Taco-era builds) where larger engines won't fit, and became cheap/plentiful once snowblowers were scrapped each spring. Mechanical governor runs in crankcase oil. Forum consensus (oldminibikes.com, diygokarts.com) flags the HS-series connecting rod as the 'weakest link' vs. the cast-iron-sleeved, dual-bearing Predator 212 clone that has largely displaced it in the performance-swap scene; mounting bolt patterns/shaft height commonly match a Predator 212 for a straight swap, but the Tecumseh uses a stepped crank (~7/8in OD at the clutch step) vs. the Predator's straight 3/4in OD — a recurring gotcha in swap threads. ARC is repeatedly cited as essentially the sole remaining performance-parts vendor for these engines. Tecumseh sold its engine business to Platinum Equity in 2007, the manufacturing division closed Dec 2008, and Certified Parts Corporation acquired the parts/tooling/IP in Feb 2009 — the hobby now runs on remaining OEM/NOS stock plus reproduction parts. Sources: tractorgearbox.com, pinrepair.com, oldminibikes.com, diygokarts.com, support.mtdproducts.com." }
  $thssk$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Tecumseh H50/H70
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='tecumseh-h50-h70';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('tecumseh-h50-h70','Tecumseh','H50/H70','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage industrial spec import', $th5070$
  { "year":"~1960s–1980s (cast-iron industrial line, later superseded by aluminum-block engines; verify exact range)","strokeType":"4-Stroke","ccSize":"H50: 188.4 (11.5 cu in) / H70: 245.8 (15.0 cu in)","cylCount":"1",
    "boreDiameter":"69.85 (2.75 in, both)","crankStroke":"H50: 49.2 (1-15/16 in) / H70: 64.3 (2-17/32 in)",
    "valveTrain":"L-head (cast-iron industrial line)","coolingType":"Air cooled",
    "wotPower":"H50: 5 hp / H70: 7 hp @ 3,600 rpm rated (both)","wotRpm":"3600",
    "starterType":"Recoil standard; 12V and 120V electric-start options existed on industrial suffix codes (verify exact codes against manual)",
    "weightKg":"~17.7 (39.0 lb, both — this identical figure across differing displacements looks suspicious and should be checked against the OEM manual)",
    "notes":"Tecumseh H50/H70 — cast-iron 'H series' industrial horizontal engines: pumps, generators, compressors, garden tractors (a Wheel Horse forum thread references H60 use in Wheel Horse tractors). Oil capacity 0.60 qt. An H60 exists in the same family but its specs could not be separated from H50/H70 in this research pass — omitted rather than guessed. Sources: tractorgearbox.com, brentchalmers.com (combined H50/H60/H70/HH50/HH60 manual), mytractorforum.com." }
  $th5070$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Tecumseh HMSK80
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='tecumseh-hmsk80';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('tecumseh-hmsk80','Tecumseh','HMSK80','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage industrial spec import', $thmsk80$
  { "year":"1980s–1990s (2-stage snow-blower era; verify)","strokeType":"4-Stroke","ccSize":"318.46 (19.43 cu in)","cylCount":"1",
    "boreDiameter":"79.4","crankStroke":"64.3","valveTrain":"L-head (flathead)","shaftType":"Horizontal, Snow King large frame","coolingType":"Air cooled",
    "wotPower":"8.0 hp (5.9 kW) @ 3,600 rpm","torqueNm":"16.9 (12.4 ft-lb) @ 2,800 rpm",
    "notes":"Tecumseh HMSK80 — larger Snow King engine for 2-stage snow blowers (MTD/Yard-Man, Craftsman, Ariens); a 1995 MTD Yard-Man is documented using this exact engine. A forum claim states the HMSK80 shares cam, crank and carb with the larger HM100 (below), differing mainly in bore/displacement — this is a forum claim, not an OEM spec-sheet confirmation, so treat with caution before assuming full parts interchangeability. Sources: tractorgearbox.com, snowblowerforum.com, itstillruns.com." }
  $thmsk80$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Tecumseh HM100
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='tecumseh-hm100';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('tecumseh-hm100','Tecumseh','HM100','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage industrial spec import', $thm100$
  { "year":"1980s–1990s (2-stage snow-blower era; verify)","strokeType":"4-Stroke","ccSize":"333.08 (20.2 cu in)","cylCount":"1",
    "boreDiameter":"81.0","crankStroke":"64.3","valveTrain":"L-head (flathead)","shaftType":"Horizontal, Snow King large frame","coolingType":"Air cooled",
    "wotPower":"10.0 hp (7.4 kW) @ 3,600 rpm","torqueNm":"20.8 (15.4 ft-lb) @ 2,800 rpm",
    "notes":"Tecumseh HM100 — the larger 2-stage snow-blower sibling of the HMSK80, same Snow King large-frame family. See HMSK80 entry for the cam/crank/carb-sharing forum claim (unconfirmed against an OEM document). Sources: tractorgearbox.com, snowblowerforum.com." }
  $thm100$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Tecumseh OVRM120
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='tecumseh-ovrm120';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('tecumseh-ovrm120','Tecumseh','OVRM120','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage industrial spec import', $tovrm$
  { "year":"Later Tecumseh consumer line (verify exact years)","strokeType":"4-Stroke","ccSize":"195 (11.90 cu in)","cylCount":"1",
    "boreDiameter":"70.99","crankStroke":"49.23","valveTrain":"OHV (overhead valve)","shaftType":"Vertical, small frame rotary mower","coolingType":"Air cooled",
    "wotPower":"6.5 hp (4.47 kW)",
    "notes":"Tecumseh OVRM120 — Tecumseh's later OHV answer to Honda-style GC/GX push-mower engines, replacing the older L-head consumer lines. Included as the best-documented example of Tecumseh's late-era consumer engine architecture, since the parallel 'Vantage' European line (Mountfield/Wolf-Garten mowers) could not be verified with hard bore/stroke/rpm figures in this research pass and was omitted rather than padded. Sources: jackssmallengines.com." }
  $tovrm$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Tecumseh LAV series
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='tecumseh-lav-series';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('tecumseh-lav-series','Tecumseh','LAV30/35/40/50','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage industrial spec import', $tlav$
  { "year":"Vertical light-equipment line (verify exact years)","strokeType":"4-Stroke","ccSize":"LAV30: 127 (7.75 cu in) / LAV35: 148 (9.05 cu in) / LAV40: 172 (10.5 cu in) / LAV50: 188 (11.5 cu in)","cylCount":"1",
    "boreDiameter":"LAV30: 58.7 (2.3125 in) / LAV35: 63.5 (2.5 in) / LAV40: 66.7 (2.625 in) / LAV50: 69.85 (2.75 in)",
    "crankStroke":"LAV30/35: 46.8 (1-27/32 in) / LAV40/50: 49.2 (1-15/16 in)",
    "shaftType":"Vertical, light frame ('Lightweight Aluminum Vertical')","wotPower":"LAV30: 3 hp / LAV35: 3.5 hp / LAV40: 4 hp / LAV50: 5 hp",
    "notes":"Tecumseh LAV30/35/40/50 — light-duty vertical-shaft push-mower and rotary-equipment engines. Aftermarket kit listings show one shared carburetor part number (632795A) fitting the whole LAV30–LAV50 range plus the related ECV100 — a good interchangeability signal, though sourced from aftermarket vendors rather than an OEM parts-interchange document. Ignition, governor, starter and weight were not independently confirmed for this family — omitted rather than guessed. Sources: repairfaq.org (LMFAQ), allotment-garden.org, smallenginesuppliers.com." }
  $tlav$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Tecumseh TVM series
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='tecumseh-tvm-series';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('tecumseh-tvm-series','Tecumseh','TVM140/220','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage industrial spec import', $ttvm$
  { "year":"Riding-mower/garden-tractor era (verify exact years)","strokeType":"4-Stroke","ccSize":"TVM140: 221.7 (13.53 cu in) / TVM220: 357.6 (21.82 cu in)","cylCount":"1",
    "valveTrain":"L-head (flathead)","shaftType":"Vertical, medium frame","coolingType":"Air cooled",
    "wotPower":"TVM140: 6.0 hp @ 3,600 rpm / TVM220: 8.0 hp @ 3,400 rpm",
    "notes":"Tecumseh TVM140/TVM220 — vertical medium-frame engines for riding lawn mowers and garden tractors. This entry is thinner than most in the batch: bore/stroke, ignition, governor, starter and weight were not confirmed in this research pass, so only displacement and the rated power/rpm are reported — do not treat this as a full spec sheet without further manual verification. Sources: tractorgearbox.com, smallenginesuppliers.com." }
  $ttvm$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Clinton 700-A (Doodle Bug engine)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='clinton-700a';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('clinton-700a','Clinton','700-A','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage minibike-scooter spec import', $c700a$
  { "year":"1946–1948 (Beam Mfg. Co. 'Doodle Bug' Standard Model B scooter era)","strokeType":"4-Stroke","cylCount":"1","coolingType":"Air cooled",
    "wotPower":"1.5 hp @ 3,000 rpm / 2.0 hp @ 3,600 rpm","coilType":"Bendix Scintilla magneto — the only Clinton series documented using this ignition brand",
    "notes":"Clinton 700-A (710-A-S-L-B) — the OEM engine on the Beam Manufacturing 'Doodle Bug' scooter's Standard Model B variant, one of very few submodels built with a Clinton rather than the far more common Briggs & Stratton engine (an estimated 1,000 units or fewer, out of a 10,000-unit first production run) — a genuine rarity prized by scooter/minibike collectors. Model-code decode: 700A = basic model, S = kickstart, L = lighting coil, B = Beam Scooter fitment. Early units (710ASLB) were built in Clinton, Michigan before the company's move to Iowa and differ from later production. Sources: Wikipedia (Doodle Bug scooter), smokstak.com, AACA/AMCA antique-scooter forums." }
  $c700a$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Clinton VS-100 / Model 100
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='clinton-vs100';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('clinton-vs100','Clinton','VS-100','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage minibike-era spec import', $cvs100$
  { "year":"~1956 (per a Clinton parts book of that date; verify)","strokeType":"4-Stroke, vertical shaft, 'clamshell design' aluminum block","ccSize":"118 (7.2 cu in)","cylCount":"1",
    "boreDiameter":"60.3 (2-3/8 in)","crankStroke":"41.3 (1-5/8 in)","coolingType":"Air cooled",
    "wotPower":"1.45 hp @ 2,200 rpm / 2.0 hp @ 2,800 rpm / 2.5 hp @ 3,600 rpm",
    "notes":"Clinton VS-100 / Model 100 — used on a lot of early rotary lawn mowers; direct ancestor/relative of the small Clinton engines later adopted into the minibike/kart scene. This research pass could not fully confirm whether 'VS-100' and 'Model 100' are exactly identical or merely closely related variants — flag as unresolved, verify against manual. Sources: smokstak.com ('Little Clinton 100' / 'Clinton Engine Model ID' threads)." }
  $cvs100$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Clinton VS-200
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='clinton-vs200';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('clinton-vs200','Clinton','VS-200','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage minibike-era spec import', $cvs200$
  { "year":"Vintage minibike/mower era (verify exact years)","strokeType":"2-Stroke","cylCount":"1","coolingType":"Air cooled",
    "boreDiameter":"47.6 (1-7/8 in)","crankStroke":"41.3 (1-5/8 in)","mixRatio":"16:1 (using 30-weight oil)",
    "wotPower":"1.1–2.25 hp @ 2,000–3,800 rpm (two conflicting figure sets found across sources — likely different sub-variants; verify against manual)",
    "notes":"Clinton VS-200 — ignition point gap .018\"–.021\", fixed timing at 27°. Its 'Panther' branding is genuinely disputed among collectors: one Smokstak contributor states flatly the VS-200 is not a Panther engine, while another owns a decal-matching example they call a Panther — an unresolved identity question worth preserving rather than flattening. Sources: smokstak.com ('Clinton VS200 Panther?' and 'Clinton VS200' threads)." }
  $cvs200$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Clinton A-400 Panther
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='clinton-a400-panther';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('clinton-a400-panther','Clinton','A-400 Panther','Standalone Engine',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage kart/minibike spec import', $ca400$
  { "year":"Vintage go-kart/minibike era (verify exact years)","strokeType":"2-Stroke","cylCount":"1","coolingType":"Air cooled",
    "wotPower":"2.5 hp (early) / 2.75 hp @ 3,600 rpm (later production — figure varies by year/variant)",
    "starterType":"'E-Z Pull' branded recoil starter",
    "notes":"Clinton A-400 (A400-1000) 'Panther' — a classic vintage go-kart and minibike engine. Its illustrated parts list is combined with the A-490-1000 in Clinton's own documentation, implying close mechanical kinship between the two. Other Clinton 2-stroke kart/minibike-adjacent models (A-490, A-2100, E-65, D-25) exist in period parts catalogs and eBay listings but yielded no independently verifiable bore/stroke/hp/weight figures in this research pass — they were deliberately left out of the wiki rather than published with invented numbers. Sources: rucenterprises.com parts-list filenames, eBay/Worthpoint vintage-listing titles, smokstak.com." }
  $ca400$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Cult industrial/Tecumseh/Clinton batch imported (19 engines).';
END $$;
-- ═══ Cult vintage chainsaws — Solo, McCulloch, Dolmar ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- Solo Rex
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='solo-rex';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('solo-rex','Solo','Rex','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage chainsaw spec import', $srex$
  { "year":"1958","strokeType":"2-Stroke (piston-ported)","ccSize":"125 (7.2 cu in)","cylCount":"1",
    "boreDiameter":"54.0","crankStroke":"54.0","coolingType":"Air cooled",
    "fuelSystem":"Carburetted (diaphragm carburetor)","wotPower":"5 hp DIN / 7 hp SAE (advertised)",
    "barLength":"17","weightKg":"11.4 (26 lb) with 17 in bar",
    "notes":"Solo Rex (1958) — marketed as the first European one-man chainsaw with a diaphragm carburetor, a genuine 'first of its kind' claim. Aluminum cylinder with a chrome-plated bore. Solo Kleinmotoren GmbH was founded 10 Feb 1948 in Stuttgart by brothers Heinz and Hans Emmerich, whose first product was a small 2-stroke engine built into a vineyard sprayer. The family sold most Solo product lines to the Austrian Al-Ko group in 2014; collector consensus (arboristsite.com) holds that present-day 'Solo' chainsaws are rebadged generic imports, distinct from these vintage West-German-built saws. Sources: vintagechainsawcollection.blogspot.com, fireandsaw.com, solo.global." }
  $srex$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Solo 611 Twin
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='solo-611-twin';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('solo-611-twin','Solo','611 Twin','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage chainsaw spec import — vintage holy grail', $s611$
  { "year":"1965","strokeType":"2-Stroke (piston-ported)","ccSize":"100 (2 x 50cc twin-cylinder)","cylCount":"2",
    "boreDiameter":"40.0","crankStroke":"40.0 (each cylinder)","coolingType":"Air cooled",
    "barLength":"17","weightKg":"11.9 (26 lb) with 43cm (17 in) bar and chain",
    "notes":"Solo 611 Twin (1965) — the ONLY twin-cylinder chainsaw of its kind ever built (two in-line 50cc cylinders), and universally regarded by collectors as one of the most desirable vintage chainsaws in existence, consistently topping 'holy grail' vintage-saw lists (arboristsite.com, opeforum.com). Aluminum cylinders with chrome-plated bores. Famous for a distinctive, high-revving exhaust note — described by collectors as sounding like 'a howling banshee.' Very few surface for sale and prices run high when they do. Sources: acresinternet.com ('Model Profile: 611 TWIN'), arboristsite.com, opeforum.com." }
  $s611$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- McCulloch 250 / Super 250
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='mcculloch-250-super250';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('mcculloch-250-super250','McCulloch','250/Super 250','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage chainsaw spec import', $m250$
  { "year":"~1970–1975 (Super 250)","strokeType":"2-Stroke","ccSize":"250: 80 / Super 250: 87","cylCount":"1",
    "boreDiameter":"54.0 (2.125 in, both)","crankStroke":"250: 34.9 (1.375 in) / Super 250: 38.1 (1.5 in)","coolingType":"Air cooled",
    "notes":"McCulloch 250 / Super 250 — the Super 250 adds an automatic oil pump (with manual override) and more aggressive porting over the base 250, plus a distinctive long, rounded black top cover with a row of holes down each side. Positioned as the mid-size 'step-up' saw in McCulloch's classic range and a popular collector entry point. Sources: thisoldchainsaw.com, acresinternet.com, chainsawpartsworld.com." }
  $m250$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- McCulloch Super Pro 60
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='mcculloch-superpro60';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('mcculloch-superpro60','McCulloch','Super Pro 60','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage chainsaw spec import', $msp60$
  { "year":"Classic McCulloch Super Pro era (verify exact years)","strokeType":"2-Stroke","ccSize":"60 (3.7 cu in)","cylCount":"1","coolingType":"Air cooled",
    "barLength":"20","barGauge":"0.050 in","chainPitchCS":"3/8 in","weightKg":"8.3 (18.3 lb)",
    "notes":"McCulloch Super Pro 60 — McCulloch never officially published horsepower on these saws; forum estimates for comparable 60cc-class Macs run ~3.4–4.2 hp, unverified against a factory document. Known among collectors for being heavy for its displacement but torquey and durable — the classic McCulloch trait of pulling long bars off a relatively small cc. A Super Pro 80 sibling exists in the same parts family but lacked independently confirmed specs in this research pass — omitted rather than padded. Sources: leonschainsawpartsandrepair.com, arboristsite.com ('Super Pro 60 Horsepower rating')." }
  $msp60$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- McCulloch 795/797/Super 797
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='mcculloch-797-super797';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('mcculloch-797-super797','McCulloch','795/797/Super 797','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage chainsaw spec import', $m797$
  { "year":"Super 797 illustrated parts list dated Aug. 1969 (model no. 600130)","strokeType":"2-Stroke","ccSize":"795: 103 / 797 & Super 797: 123 (7.5 cu in)","cylCount":"1",
    "boreDiameter":"795: 56.3 / 797: 57.9","crankStroke":"795: 41.5 / 797: 46.6","coolingType":"Air cooled",
    "notes":"McCulloch 795/797/Super 797 — McCulloch's classic big-inch 'one-man muscle saws,' direct predecessors to the CP-125/SP-125 line. IMPORTANT: a figure claiming 'McCulloch 090 = 137cc' surfaced in research but is almost certainly a mix-up with the unrelated Stihl 090 (137cc) — McCulloch never made a model called '090'; do not use that figure. There is also no verified McCulloch or Dolmar model called 'PS-120,' nor any confirmed record of a 'biggest gas chainsaw ever built' title for either brand — treat any such claim as unconfirmed. Sources: opeforum.com, leonschainsawpartsandrepair.com." }
  $m797$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- McCulloch SP125/CP125
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='mcculloch-sp125-cp125';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('mcculloch-sp125-cp125','McCulloch','SP125/CP125','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage chainsaw spec import', $msp125$
  { "year":"Classic McCulloch big-saw era (verify exact years)","strokeType":"2-Stroke","ccSize":"123","cylCount":"1","coolingType":"Air cooled",
    "notes":"McCulloch SP125 / CP125 / Super Pro 125 — the largest documented production ONE-MAN McCulloch saw. Features anti-vibration handles, an automatic chain oiler, a quick-release air filter, a two-handed wrap-around grip, and a decompression valve. The CP125 uses a single large reed valve versus the SP125's dual-reed-petal setup and runs about 5 lb lighter; the SP125C variant (chrome bore, better-balanced crank, larger wrist-pin needle bearing) is regarded by collectors as the smoothest and strongest-running of the family. Rumored larger 130cc ('549') and 160cc ('755') one-man models are mentioned in a single secondary collector-forum source only — unverified, and deliberately not given their own entries. Sources: arboristsite.com ('McCulloch SP125'), opeforum.com, chainsawcollectors.se." }
  $msp125$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Dolmar Model A (1927)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='dolmar-model-a';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('dolmar-model-a','Dolmar','Model A','Chainsaw',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage chainsaw spec import — corrects a fictitious \"PS-120\" claim', $dolma$
  { "year":"1927 (patent granted 15 June 1928; produced ~1927–1931/32, succeeded by the Model C 1930–1937)","strokeType":"2-Stroke (two-man saw)","ccSize":"~245 (single-sourced figure, verify against manual/museum record)","cylCount":"1",
    "wotPower":"~8 hp","weightKg":"57–58 (125–128 lb)",
    "notes":"Dolmar Model A (1927) — built by Emil Lerp, this is THE FIRST GASOLINE-POWERED CHAINSAW FOR TREE WORK ever built, requiring two operators. The company name 'Dolmar' comes directly from the Dolmar Hill test site in the Thuringer forest where the saw was developed and proven. IMPORTANT CORRECTION: there is no verified Dolmar model ever called 'PS-120,' and no confirmed record of Dolmar holding a 'biggest gas chainsaw ever built' title — Dolmar's real '120'/'120 Super'/'120si' family is actually a mid-size ~67-68cc ONE-MAN saw, not a giant. This 1927 Model A is the genuine 'biggest/first' Dolmar story. Contemporary two-man rivals cited in period lore include the Titan 'C' and IEL 'K'/'M' models, plus a French REXO at a claimed 350cc — treat these comparisons as forum lore, not independently verified figures. Sources: Wikipedia ('Emil Lerp'), fireandsaw.com, amickssuperstore.com, arboristsite.com ('The Biggest Saw Of All Time')." }
  $dolma$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Cult vintage chainsaw batch imported (7 saws).';
END $$;
-- ═══ Cult vintage European moped engines — Sachs, Puch, Minarelli, Simson ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- Sachs 50-series
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='sachs-50-series';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('sachs-50-series','Sachs','50-Series','Moped',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage moped spec import', $sachs$
  { "year":"~1960–1990 (501/502/504/505 family with A–D sub-variants; verify exact start date)","strokeType":"2-Stroke","ccSize":"47.6 stock; 49.9 (D variant, 44mm stroke)","cylCount":"1",
    "crankStroke":"42.0 stock / 44.0 (D variant)","coolingType":"Air cooled","compressionRatio":"~10:1 (D variant)",
    "fuelSystem":"Carburetted (Bing; A/C = 12mm square, B = 10mm, D = high-output 12mm no-needle '85/12/104')",
    "coilType":"Flywheel magneto, points-type (Bosch and Motoplat units used across variants)",
    "transType":"1-speed automatic, 2-speed, or 3-speed manual (foot-shift or handlebar lever) — shared case, drilled differently per variant",
    "starterType":"Pedal-start (505-series, often with back-pedal coaster-brake engagement); kick-start on earlier 501",
    "wotPower":"A: 1.8 hp / B: 1.5 hp / D: 2.7 hp",
    "notes":"Sachs (Fichtel & Sachs, Germany) 50-series — powered Hercules (F&S bought Hercules in 1963), Sparta (Netherlands), Columbia, KKM, Grycner, Foxi, General, Eagle, Moppet and MBK. The last true US-market Sachs application was the KKM Mopet, built in Ohio 1988–1990. Cult/tuning: a strong, mostly German-language tuning scene centers on the Hercules Prima platform (mofapower.de, mopedparts.de); community wisdom holds 3-speed motors don't tolerate tuning past ~50km/h and fail quickly, so the 2-speed variant is preferred for performance builds. Dutch site mofakult.nl markets Sachs as making 'indestructible 2-strokes' — Sparta, the largest Dutch moped maker of the 1970s, built its reputation on Sachs power. Sources: mopedarmy.com/wiki/Sachs_Motor_Differences, en.wikipedia.org (Sachs Motorcycles, Sparta B.V.), vwtechie.tripod.com." }
  $sachs$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Puch E50/ZA50
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='puch-e50-za50';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('puch-e50-za50','Puch','E50/ZA50','Moped',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage moped spec import', $puch$
  { "year":"1970s–1980s (verify exact start/end)","strokeType":"2-Stroke","ccSize":"48","cylCount":"1",
    "boreDiameter":"38.0","crankStroke":"42.0","coolingType":"Air cooled",
    "fuelSystem":"Carburetted (Bing, 12mm stock)","coilType":"Flywheel magneto with points (Bosch, Iskra, or Ducati factory-fitted); CDI a common aftermarket retrofit",
    "transType":"E50 = single-speed automatic (centrifugal clutch); ZA50 = two-speed automatic — no manual gearbox",
    "starterType":"Pedal-start (1970s models, doubles as propulsion when disengaged); later kick-start",
    "wotPower":"1.0 / 1.5 / 2.0 hp factory states of tune (20/25/30 mph top-speed limited); Sport MK-II variant up to 2.4 hp",
    "weightKg":"~39 (86 lb, approximate)",
    "notes":"Puch (Steyr-Daimler-Puch, Austria) E50/ZA50 — powered the Puch Maxi, Sport, Luxe, Newport, Pinto, Magnum and Cobra; rebadged in the US as Sears, Montgomery Ward 'Free Spirit,' J.C. Penney and Murray-branded mopeds. Frequently called 'the Volkswagen of mopeds' for mechanical simplicity and parts commonality across years. Central platform of the US moped-army scene — Moped Army's own wiki maintains a dedicated tuning page covering derestricting the airbox, exhaust-pipe swaps, head-gasket removal and carb re-tuning as the standard performance path. Sources: mopedarmy.com/wiki/E50, en.wikipedia.org (Puch Maxi), myronsmopeds.com, puchshop.de, dualwheeljourney.com." }
  $puch$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Minarelli V1
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='minarelli-v1';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('minarelli-v1','Minarelli','V1','Moped',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage moped spec import', $minv1$
  { "year":"1969–1990 (full variant timeline: V1/V1N 1969–77, V1 1977–80 plastic shroud, V1A 1977–80 aluminum cyl, V1P 1979–86 iron cyl, V1H 1982–87 aluminum cyl, V1L 1987–89 iron reed valve, V1HL 1988–90 aluminum reed)","strokeType":"2-Stroke","ccSize":"~49.7 (38.8mm bore) / ~53.6 (40.3mm bore variant) — calculated from sourced bore/stroke","cylCount":"1",
    "boreDiameter":"38.8 / 40.3 (variant)","crankStroke":"42.0","coolingType":"Air cooled",
    "coilType":"Stock magneto/points; aftermarket fixed-curve CDI kits widely sold (e.g. Italkit Racing)",
    "wotPower":"~1.9 hp (stock V1; rpm not confirmed)",
    "notes":"Minarelli (Motori Minarelli, Bologna, Italy), founded 1951 by Vittorio Minarelli, built exclusively two-stroke engines. This V1 timeline is the most complete production-year table found across all four moped brands researched. Genuine racing pedigree: 24 world speed records across the 50/75/100/175cc classes, plus four manufacturer titles and two rider titles in 125cc world championship road racing during the 1970s. Powered badge-engineered mopeds (Cimatti, Gitane, Testi, Concord, Motron, Fantic, General, AMF, Baretta, Gadabout, Motomarina, Safari) largely uncredited on the finished bike — this 'hidden engineer' mystique is a real part of its enthusiast appeal, since many owners don't realize their bike is Minarelli-powered until they open the crankcase. Has the deepest aftermarket of all four moped brands researched — Polini and Malossi both manufacture extensive cylinder-kit and variator lines for Minarelli-based engines. Sources: myronsmopeds.com, en.wikipedia.org (Motori Minarelli), motoriminarelli.it." }
  $minv1$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Simson S50/S51
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='simson-s50-s51';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('simson-s50-s51','Simson','S50/S51','Moped',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult vintage moped spec import', $simson$
  { "year":"S50: 1975–1980 / S51: 1980–1991 (combined family production over 1.6 million units — the most numerous moped ever built in Germany)","strokeType":"2-Stroke","ccSize":"49.6","cylCount":"1",
    "boreDiameter":"38.0 (S51)","crankStroke":"44.0 (S51; a long-stroke redesign vs. the S50 specifically to improve low/mid-range torque)","coolingType":"Air cooled",
    "fuelSystem":"Carburetted (BVF, 16mm)","coilType":"Stock 6V flywheel magneto with points; 12V CDI a very common modern retrofit",
    "transType":"3- or 4-speed manual, foot-shift","wotPower":"3.75 hp (2.8 kW) @ 5,500 rpm (S51)","torqueNm":"5.0 (3.69 ft-lb) @ 4,800 rpm (S51)",
    "topSpeed":"60 km/h (37 mph) standard; S51 N variant limited to 40 km/h","weightKg":"~78–86 (varies by year/variant — S51 B1-4 1980: 78.5kg; S51 N 1986: 86kg)",
    "notes":"Simson (VEB Simson, Suhl, East Germany) S50/S51 — the deepest 'living cult' of all four moped brands researched. Near-ubiquitous in East Germany; after reunification became a powerful nostalgia object (the DDR-Museum covers Simson/MZ as 'the two-wheeled forge of the GDR'). An active dedicated Simson Forum exists with threads specifically on DDR-era tuning. Genuine period racing lore: privateer racers reportedly built 50cc Simson-based racebikes with 6-speed gearboxes and rotary-valve induction reaching up to 16 hp — described as unofficial, never factory-backed (unverified single figure, flag for a primary German-language source). Contemporary manufacturing in Suhl/Thuringia continues today with M451/M471 engines used as rebuild bases for old East German mopeds still on the road. Sources: autoevolution.com, cyclechaos.com/wiki/Simson_S51, ddr-museum.de, simsonforum.net." }
  $simson$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Cult vintage moped batch imported (4 mopeds).';
END $$;
-- ═══ Cult antique outboard motors — Elto, Johnson, Champion (AOMCI collector cult) ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- Elto Cub
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='elto-cub';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('elto-cub','Elto','Cub','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult antique outboard spec import', $ecub$
  { "year":"1939–1941","strokeType":"2-Stroke","cylCount":"1","wotPower":"0.5 hp","weightKg":"3.9 (8.5 lb)",
    "notes":"Elto Cub (1939–1941) — marketed as the 'world's lightest outboard' on introduction, priced at $29.50 new. Only produced for 2 years before being discontinued in 1941, deliberately a throwback to convenience-over-power even as the rest of the industry chased bigger and faster motors. Built by Evinrude Motors Division, Outboard Marine & Manufacturing Co., Milwaukee, WI. A novelty/oddity collectible prized by the Antique Outboard Motor Club International (AOMCI) independent of performance. Sources: Wisconsin Historical Society (wisconsinhistory.org)." }
  $ecub$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Elto Ace
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='elto-ace';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('elto-ace','Elto','Ace','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult antique outboard spec import', $eace$
  { "year":"Developed 1934–36, produced into the early 1940s","strokeType":"2-Stroke","cylCount":"1",
    "wotPower":"1.4 hp (earliest run); 1.6 hp and 1.8 hp variants seen in later production years — verify exact figure against AOMCI records for a given year",
    "coolingType":"Piston-type water pump (early production); switched to a two-stage centrifugal ('centripetal') water pump in the gear case on later production",
    "notes":"Elto Ace — derived from the 1934 1.5 hp Evinrude Sportsman (Model 4091: 25 lb, die-cast aluminum, ~3 ft tall). Marketed at a slightly lower horsepower than its Sportsman parent, in part to justify a lower price point. Part of the Elto brand's founding-era product family — Elto (Evinrude Light Twin Outboard) began in 1921 and its Ruddertwin used a distinctive fixed powerhead steered by an independent rudder, unlike rival Johnson's full swivel-steer design (see Johnson Light Twin entry). Sources: aomci.org forum ('Elto ace 1.4 hp'), eBay period listings." }
  $eace$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Johnson Light Twin / Model A / Waterbug
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='johnson-light-twin';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('johnson-light-twin','Johnson','Light Twin','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult antique outboard spec import', $jlt$
  { "year":"1921 (debuted Dec 19, 1921, for the 1922 model year)","strokeType":"2-Stroke","cylCount":"2","wotPower":"2 hp","weightKg":"15.9 (35 lb)",
    "starterType":"Rope pull","obSteering":"Full 360° swivel (tiltable) — the opposite design philosophy to Elto's fixed-head rudder steering, one of the defining 'first-generation outboard' engineering forks in the hobby",
    "notes":"Johnson Light Twin ('Model A' / 'Waterbug') — Johnson's very first outboard and the brand's founding product. Aluminum twin-cylinder construction, deliberately built lighter than cast-iron competitors of the era. 3,429 units were ordered at the 1922 New York Motor Boat Show — proof of the model's instant commercial impact. Johnson Motors' profits collapsed in the Depression (from $445,613 in 1929 to $141,086 in 1930); the company entered voluntary receivership in 1932, and Outboard Marine Corporation acquired its assets in 1935 for $800,000 — Johnson then sold 20,872 motors in its first year under OMC, repaying the purchase price in a single season. Collectors treat pre-1935 'Johnson Motor Company' era motors as a distinct, more collectible sub-era versus post-1935 OMC-owned Johnson production. 2021 marked the 100th anniversary of both Johnson and Elto, celebrated with a joint 4-day AOMCI national meet. Sources: yankeeaomci.org, en.wikipedia.org (Johnson Outboards, Outboard Marine Corporation)." }
  $jlt$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Champion (1927 original)
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='champion-1927';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('champion-1927','Champion','1927 Original','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult antique outboard spec import — corrects a fictitious \"Iron Horse\" claim', $champ27$
  { "year":"1927","strokeType":"2-Stroke","cylCount":"1","wotPower":"1.5 hp","weightKg":"13.6 (30 lb)",
    "notes":"Champion (1927 original) — the true founding product of the Champion Outboard Motor brand, hand-built by three St. Paul, Minnesota men: Henry Dolan, Sig Conrad and 'Dutch' Witch. Only an estimated ~30 units were ever built (single-sourced figure — an unusually specific claim that would benefit from a second corroborating source before being treated as settled fact). The 'Champion' name was sold to Flour City Ornamental Iron Co. in 1927/1928, which then manufactured the motor in Minneapolis for years afterward. IMPORTANT CORRECTION: there is no verified Champion outboard ever called the 'Iron Horse' — that name belongs to an unrelated OMC D-400 lawnmower engine and should not be confused with Champion's outboard history. See the Champion Blue Ribbon 2J entry for the brand's later, second-generation era. Sources: everythingaboutboats.org." }
  $champ27$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Champion Blue Ribbon 2J
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='champion-blue-ribbon-2j';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('champion-blue-ribbon-2j','Champion','Blue Ribbon 2J','Outboard Motor',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Cult antique outboard spec import', $champ2j$
  { "year":"1946/1947","strokeType":"2-Stroke","cylCount":"1","wotPower":"4.2 hp",
    "starterType":"Rewind/recoil starter (2J 'Deluxe'); the 1J 'Standard' sibling instead used a rope sheave on the flywheel and lacked the 2J's flywheel cover",
    "notes":"Champion Blue Ribbon Model 2J — from the second-generation Champion Outboard Motor Co., founded 1935 by Stanley Grey and Earl DuMonte, manufactured under contract by a small tool-and-punch-press operation from 1935–1942 (no production 1943–1945 during WWII), then resumed by DuMonte at his own facility 1946–1957. In 1939 DuMonte struck a distribution deal with Firestone Tire Co., reportedly pushing Champion to the #2 US outboard maker behind Evinrude. The final Champion model before production ceased in 1957 was the Tandem 33 — a twin pair of counter-rotating 16.5 hp outboards (33 hp combined) for cruiser/heavy-runabout use. Sources: Adirondack Experience museum collection listing, AOMCI forum, everythingaboutboats.org." }
  $champ2j$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Cult antique outboard batch imported (5 motors).';
END $$;
-- ═══ Modern kart-racing engines (active cult, not vintage) — LO206, X30, Rotax Max, KT100, Predator Ghost ═══
DO $$
DECLARE
  v_admin uuid; v_entry uuid; v_rev uuid;
BEGIN
  SELECT id INTO v_admin FROM auth.users
    WHERE email IN ('nathan.gentil.ai@gmail.com','nathan.gentil@gmail.com') ORDER BY email LIMIT 1;

  -- Briggs & Stratton LO206
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='briggs-lo206';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('briggs-lo206','Briggs & Stratton','LO206','Go-kart',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Modern spec-racing engine import', $lo206$
  { "year":"Introduced ~2009 (current)","strokeType":"4-Stroke, OHV","ccSize":"204","cylCount":"1",
    "boreDiameter":"68.3","crankStroke":"68.3","compressionRatio":"8.5:1","coolingType":"Air cooled",
    "wotPower":"8.8 hp @ 5,500 rpm","torqueNm":"13.5 (~10 ft-lb)","wotRpm":"6,100 (hard rev-limiter ceiling)",
    "fuelSystem":"Carburetted (Briggs-tooled 22mm round-slide, fixed factory jetting — non-adjustable under most sanctioning-body rules); 87-octane pump gasoline, no oil premix (wet-sump 4-stroke)",
    "coilType":"Digital electronic ignition with built-in rev limiter, 29° BTDC fixed timing","starterType":"Integrated recoil (pull-start, lawnmower-style)",
    "notes":"Briggs & Stratton LO206 — introduced as a low-cost, strictly regulated spec engine to replace the aging, cheat-prone Yamaha/2-stroke karting classes and 'level the playing field.' The bottom end is factory-sealed with two tamper-evident seals; a broken or missing seal is an automatic disqualification under IKF, WKA and virtually every sanctioning body's rules — teams cannot legally access the crank/rod/piston without buying an entirely new short block, a deliberate anti-cheating design. Now the dominant North American grassroots spec-racing engine, run from Kid Kart through Masters classes via swappable carburetor restrictor plates; WKA launched a dedicated '206 Only Series' in 2022, and flagship events (Cup Karts North America Grand Nationals) reportedly draw 500+ drivers. Weight not officially published — verify against the official Briggs 206 Rule Set. Sources: briggsracing.com, worldkarting.com." }
  $lo206$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- IAME X30
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='iame-x30';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('iame-x30','IAME','X30','Go-kart',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Modern spec-racing engine import', $x30$
  { "year":"Launched 2005 (current)","strokeType":"2-Stroke, reed-valve inlet","ccSize":"123.67 (125cc class)","cylCount":"1",
    "boreDiameter":"54.00 (max 54.28)","crankStroke":"54.00","coolingType":"Liquid cooled (radiator)",
    "wotPower":"30 hp (Senior) / 21 hp (Junior)","torqueNm":"19.5 (Senior) / 11 (Junior)",
    "wotRpm":"~15,800 soft-cut limiter engagement; hard ceiling cited 14,000–16,000 depending on class/homologation year — verify current rulebook",
    "fuelSystem":"Carburetted (Tillotson HW-27A)","mixRatio":"~18:1–25:1 (regulations reference a 4–6% oil window; community baseline ~25:1, commonly run ~18:1; 95-octane fuel recommended, castor-based racing oil favored — verify exact ratio against the current IAME manual)",
    "coilType":"Selettra Digital 'K' or 'S' ECU — only unmodified factory units are legal","starterType":"Electric (integrated)","clutchType":"Centrifugal dry clutch","weightKg":"12.0 (dry, bare engine)",
    "notes":"IAME X30 — launched as a successor to older 125cc TaG ('Touch and Go') engines, and became the dominant international sprint/TaG platform, effectively displacing most rival 125cc TaG engines in modern sprint karting. Used in SKUSA, USPKS, IKF, WKA, WSK, IAME's own single-brand X30 Challenge/Euro Series, and dozens of national federations across 30+ countries. Strict homologation (unmodified ignition unit, controlled carburetor and fuel rules) keeps the class a driver/chassis-skill contest rather than an engine-tuning arms race — similar in spirit to the LO206's seal system, though less rigidly sealed. Sources: iameengines.com, iame-motorsport.com, bilsport.no (technical regulations)." }
  $x30$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Rotax Max
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='rotax-max';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('rotax-max','Rotax','Max','Go-kart',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Modern spec-racing engine import', $rotax$
  { "year":"Introduced 1997 as the Rotax 125 MAX (current, Evo generation)","strokeType":"2-Stroke","ccSize":"125.0 (all class variants share the same bottom end)","cylCount":"1",
    "boreDiameter":"54.00","crankStroke":"54.5","coolingType":"Liquid cooled, integrated water pump + balance shaft",
    "fuelSystem":"Carburetted (Dellorto VHSB34)","coilType":"Digital battery-based CDI (proprietary Rotax digital ignition); Senior MAX adds an electronically timed exhaust power valve",
    "starterType":"Electric (integrated, standard since the 1997 introduction)","clutchType":"Centrifugal clutch",
    "weightKg":"12.0 (Senior MAX bare engine, ~26.5 lb); complete power pack ~23.1 kg (51.0 lb)",
    "wotPower":"Micro: 6 kW (~9.5 hp) @ 7,500 rpm / Mini: 11 kW (~15 hp) @ 8,500 rpm / Junior Evo: 17 kW (23 hp) @ 8,500 rpm / Senior Evo: 22 kW (30 hp) @ 11,500 rpm",
    "torqueNm":"Micro: 9 @ 7,500 rpm / Mini: 13 @ 8,000 rpm / Junior: 19 @ 8,500 rpm / Senior: 21 @ 9,000 rpm",
    "notes":"Rotax Max — notable at its 1997 launch for pairing a 125cc two-stroke with an electric starter, removing the need for push/bump starting. The Rotax Max Challenge is a global one-make karting structure run in 60+ countries with annual Grand Finals (started 2000 in Puerto Rico with 66 drivers from 19 countries). Widely cited as a primary karting-to-Formula-1 pipeline over the last 20+ years: Max Verstappen raced Rotax Mini MAX in 2007, winning the Belgian and Dutch Rotax championships in that category; Lando Norris was a Rotax Mini winner in the UK; other Rotax-graduate names cited in motorsport media include Kimi Raikkonen, Jenson Button, George Russell (early career), Giorgio Pantano, Anthony Davidson, Esteban Gutierrez and Robert Kubica. Alongside IAME X30, one of the two dominant international sprint-kart platforms; sealed/tech-inspected engine rules (Global RMC Technical Regulation) keep engines standardized across the one-make series. Sources: rotax-racing.com, rotax.com (100-years company history), en.wikipedia.org (Rotax Max Challenge)." }
  $rotax$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Yamaha KT100
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='yamaha-kt100';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('yamaha-kt100','Yamaha','KT100','Go-kart',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Modern (legacy) spec-racing engine import', $kt100$
  { "year":"Introduced ~1977 (still actively raced)","strokeType":"2-Stroke, piston-ported (not reed-valve)","ccSize":"97.6 (marketed as '100cc' nominal)","cylCount":"1",
    "boreDiameter":"52.0","crankStroke":"46.0","coolingType":"Air cooled",
    "wotPower":"~15 hp (11 kW) @ 10,000 rpm stock; racers report ~17 bhp tuned at 15,500–16,000 rpm, and up to 19–20 bhp with a 90-degree expansion-chamber pipe — these higher figures are anecdotal/tuned, not stock factory spec",
    "fuelSystem":"Carburetted (Walbro WB-3A)","mixRatio":"20:1 (Yamalube 2R recommended)","coilType":"Transistor-controlled ignition (TCI)",
    "starterType":"None integrated — historically derived from an ultralight-aircraft engine; run with an external electric starter (17mm crank-nut adapter) or bump-started direct-drive",
    "clutchType":"None as standard — commonly run direct-drive (chain sprocket straight to axle); centrifugal-clutch setups exist for some classes",
    "weightKg":"~9.5 (21 lb dry — secondary-source figure, verify against a Yamaha spec sheet)",
    "notes":"Yamaha KT100 — became, per community sources, 'the most popular engine in kart racing' at tracks across the US and beyond through the 1980s–90s, and a staple of WKA/IKF-sanctioned sprint karting for decades (Junior/Senior/Modified divisions via the KT100S variant). A genuine still-actively-raced 'cult' engine today: current karting-forum discourse frames it as declining in mainstream use (displaced by the LO206) but kept alive by a loyal, affordability-driven enthusiast base. This is the thinnest-documented of the modern racing engines researched — no official Yamaha spec-sheet could be directly confirmed in this pass, so displacement, weight and starter details rely on secondary sources; recommend sourcing an original Yamaha KT100 owner's/service manual before treating exact figures as locked in. Sources: Wikipedia, sciencing.com, 4cycle.com/ekartingnews.com forum discussion." }
  $kt100$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  -- Predator 212 Ghost
  SELECT id INTO v_entry FROM wiki_entries WHERE slug='predator-ghost';
  IF v_entry IS NULL THEN INSERT INTO wiki_entries (slug,make,model,type,created_by)
    VALUES ('predator-ghost','Predator','212 Ghost','Go-kart',v_admin) RETURNING id INTO v_entry; END IF;
  INSERT INTO wiki_revisions (entry_id,edited_by,username,edit_summary,data) VALUES (v_entry,v_admin,'Rat Bench','Modern clone-scene racing engine import', $ghost$
  { "year":"Launched June 2022 (current, Harbor Freight SKU 57531)","strokeType":"4-Stroke, OHV","ccSize":"211.66 (marketed as '212cc')","cylCount":"1",
    "boreDiameter":"70.0","crankStroke":"55.0","compressionRatio":"8.5:1","coolingType":"Air cooled",
    "wotRpm":"6,000–6,100 (digital rev-limiter; sources vary slightly)","wotPower":"~9.9 hp stock (independent dyno test); community claims of 15+ hp with bolt-on mods are anecdotal, not a stock rating",
    "torqueNm":"~19 (~14 ft-lb, community-reported — verify against Harbor Freight spec sheet)",
    "fuelSystem":"Carburetted (PZ22 slide-type, manual choke); 91+ octane fuel, treated with stabilizer","coilType":"Digital/CDI ignition with built-in electronic rev limiter — mechanical governor deleted entirely",
    "starterType":"Recoil only — no electric-start option","shaftType":"Horizontal 3/4 in (0.75 in), ~2.43 in length — standard clone/Honda GX200 spec (single source, verify)",
    "weightKg":"~15.9 (35 lb — single source, verify)",
    "notes":"Predator 212 'Ghost' Kart Racing Engine — developed with input from a 3x national go-kart racing champion. Genuinely distinct internals from the standard Hemi/Non-Hemi: a forged-steel crankshaft on dual ball bearings (vs. the base 212's crank on a bushing/single bearing), a high-flow racing intake port, a fire-ring head gasket, a racing piston-ring package and high-silicon valve springs. Explicitly marketed and discussed in the karting community as a budget, unsealed, moddable alternative to the sealed Briggs LO206 spec engine. Part of the broader Honda GX160/GX200 'clone' scene (Ducar/Lifan/Loncin-built clones sold by Harbor Freight, DuroMax and others) and its Stage 1/2/3 build culture: Stage 1 = bolt-on tuning (carb jetting, exhaust, air filter, timing); Stage 2 = governor removal (already deleted from factory on the Ghost, but the standard mod on other clone engines); Stage 3 = internal reinforcement (billet rod/flywheel, stroker kits, big-valve heads) to survive higher RPM safely. Oil capacity 0.63 qt, 10W-30 full synthetic recommended. Sources: harborfreight.com, newsroom.harborfreight.com (June 2022 press release), slashgear.com, gokartnerds.com." }
  $ghost$::jsonb) RETURNING id INTO v_rev; UPDATE wiki_entries SET current_rev_id=v_rev WHERE id=v_entry;

  RAISE NOTICE 'Modern kart-racing + clone-scene batch imported (5 engines).';
END $$;

-- Verify — one row per seeded machine with its field count
SELECT e.type, e.make, e.model,
       (SELECT count(*) FROM jsonb_object_keys(r.data)) AS spec_fields
FROM wiki_entries e JOIN wiki_revisions r ON r.id = e.current_rev_id
WHERE e.slug IN ('kawasaki-klr650','suzuki-dr650','suzuki-dr-z400','yamaha-tw200','yamaha-wr450f','bmw-f650','bmw-f650gs','bmw-g650gs','cfmoto-450mt','cfmoto-800mt','honda-gx25','honda-gx35','honda-gx120','honda-gx160','honda-gx200','honda-gx240','honda-gx270','honda-gx340','honda-gx390','honda-gx630','honda-gx690','honda-gc160','honda-gc190','stihl-ms-170','stihl-ms-180','stihl-ms-211','stihl-ms-250','stihl-ms-261','stihl-ms-271','stihl-ms-291','stihl-ms-362','stihl-ms-391','stihl-ms-400','stihl-ms-462','stihl-ms-500i','stihl-ms-661','stihl-ms-880','yamaha-f9-9','yamaha-f15','yamaha-f25','yamaha-f60','yamaha-f115','yamaha-f150','mercury-9-9-fourstroke','mercury-25-fourstroke','mercury-60-fourstroke','mercury-115-fourstroke','honda-bf50','honda-bf90','suzuki-df60','tohatsu-mfs9-9','husqvarna-435','husqvarna-445','husqvarna-450','husqvarna-455-rancher','husqvarna-460-rancher','husqvarna-550-xp','husqvarna-562-xp','husqvarna-572-xp','husqvarna-372-xp','husqvarna-395-xp','echo-cs-400','echo-cs-490','echo-cs-590','echo-cs-800p','predator-212-hemi','predator-212-non-hemi','predator-224','predator-301','predator-420','predator-459','predator-670','tillotson-212r','lifan-168f-2','loncin-g200f','duromax-xp7hp','stihl-fs-55','stihl-fs-91','stihl-fs-131','stihl-fs-250','stihl-bg-86','stihl-br-600','stihl-br-700','husqvarna-128ld','husqvarna-525ls','husqvarna-350bt','husqvarna-580bts','echo-srm-225','echo-srm-2620','echo-pb-580','echo-pb-8010','kawasaki-fr691v','kawasaki-fr730v','kawasaki-fx730v','kawasaki-fx850v','kawasaki-fx1000v','kohler-ch270','kohler-ch440','kohler-ch740','kohler-kt745','briggs-vanguard-810','briggs-intek-v-twin','mercury-9-9-2-stroke','mercury-40-2-stroke','mercury-115-2-stroke','mercury-150-black-max','evinrude-9-9-2-stroke','evinrude-40-2-stroke','johnson-70-2-stroke','evinrude-90-v4','evinrude-e-tec-150','yamaha-40-2-stroke','tohatsu-9-8-2-stroke','honda-trx420-rancher','honda-trx520-foreman','yamaha-raptor-700','yamaha-grizzly-700','yamaha-yfz450r','polaris-sportsman-570','can-am-outlander-650','can-am-outlander-1000','suzuki-kingquad-750','kawasaki-brute-force-750','polaris-rzr-xp-1000','can-am-maverick-x3','honda-pioneer-1000','honda-crf300l','honda-crf450l','honda-xr650l','honda-crf450r','honda-africa-twin-crf1100l','yamaha-wr250r','yamaha-yz250','yamaha-tenere-700','kawasaki-klx300','suzuki-v-strom-650','ktm-350-exc-f','ktm-500-exc-f','ktm-300-xc','husqvarna-701-enduro','bmw-r1250gs','honda-eu2200i','honda-eu3000is','yamaha-ef2000is','predator-3500-inverter','westinghouse-igen4500','duromax-xp13000eh','generac-gp6500','simpson-megashot-msh3125','simpson-powershot-ps4240','honda-wb30','suzuki-sv650','yamaha-mt-07','kawasaki-ninja-400','honda-cb500x','kawasaki-z900','ktm-390-duke','royal-enfield-himalayan','honda-xr250r','kawasaki-ninja-650','yamaha-mt-09','yamaha-yzf-r3','honda-cb650r','kawasaki-zx-6r','triumph-street-triple-765','ducati-monster-937','suzuki-gsx-s750','yamaha-yzf-r6','honda-cbr600rr','suzuki-gsx-r750','suzuki-gsx-r1000','yamaha-yzf-r1','bmw-s1000rr','aprilia-rs660','triumph-bonneville-t120','british-seagull-forty-plus','british-seagull-forty-minus','british-seagull-silver-century','british-seagull-qb-kingfisher','victa-power-torque-160','honda-ct110','yamaha-ag200','yamaha-ag100','suzuki-dr200se-trojan','honda-z50','kawasaki-ke100','homelite-xl-12','mcculloch-mac-10-10','stihl-070','stihl-090','briggs-5hp-flathead','british-seagull-forty-featherweight','british-seagull-102','british-seagull-90-110','british-seagull-170','british-seagull-little-forty','british-seagull-century','british-seagull-century-plus','british-seagull-silver-century-plus','british-seagull-125','british-seagull-qb-osprey','british-seagull-qb-curlew','briggs-wm-wmb','kohler-k91','kohler-k161','kohler-k241','kohler-k301','kohler-k662','onan-cck','onan-bf-bfa-bga-nh','tecumseh-hssk50','tecumseh-h50-h70','tecumseh-hmsk80','tecumseh-hm100','tecumseh-ovrm120','tecumseh-lav-series','tecumseh-tvm-series','clinton-700a','clinton-vs100','clinton-vs200','clinton-a400-panther','solo-rex','solo-611-twin','mcculloch-250-super250','mcculloch-superpro60','mcculloch-797-super797','mcculloch-sp125-cp125','dolmar-model-a','sachs-50-series','puch-e50-za50','minarelli-v1','simson-s50-s51','elto-cub','elto-ace','johnson-light-twin','champion-1927','champion-blue-ribbon-2j','briggs-lo206','iame-x30','rotax-max','yamaha-kt100','predator-ghost')
ORDER BY e.type, e.make, e.model;
