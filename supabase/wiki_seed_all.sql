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

-- Verify — one row per seeded machine with its field count
SELECT e.type, e.make, e.model,
       (SELECT count(*) FROM jsonb_object_keys(r.data)) AS spec_fields
FROM wiki_entries e JOIN wiki_revisions r ON r.id = e.current_rev_id
WHERE e.slug IN ('kawasaki-klr650','suzuki-dr650','suzuki-dr-z400','yamaha-tw200','yamaha-wr450f','bmw-f650','bmw-f650gs','bmw-g650gs','cfmoto-450mt','cfmoto-800mt','honda-gx25','honda-gx35','honda-gx120','honda-gx160','honda-gx200','honda-gx240','honda-gx270','honda-gx340','honda-gx390','honda-gx630','honda-gx690','honda-gc160','honda-gc190','stihl-ms-170','stihl-ms-180','stihl-ms-211','stihl-ms-250','stihl-ms-261','stihl-ms-271','stihl-ms-291','stihl-ms-362','stihl-ms-391','stihl-ms-400','stihl-ms-462','stihl-ms-500i','stihl-ms-661','stihl-ms-880','yamaha-f9-9','yamaha-f15','yamaha-f25','yamaha-f60','yamaha-f115','yamaha-f150','mercury-9-9-fourstroke','mercury-25-fourstroke','mercury-60-fourstroke','mercury-115-fourstroke','honda-bf50','honda-bf90','suzuki-df60','tohatsu-mfs9-9','husqvarna-435','husqvarna-445','husqvarna-450','husqvarna-455-rancher','husqvarna-460-rancher','husqvarna-550-xp','husqvarna-562-xp','husqvarna-572-xp','husqvarna-372-xp','husqvarna-395-xp','echo-cs-400','echo-cs-490','echo-cs-590','echo-cs-800p','predator-212-hemi','predator-212-non-hemi','predator-224','predator-301','predator-420','predator-459','predator-670','tillotson-212r','lifan-168f-2','loncin-g200f','duromax-xp7hp','stihl-fs-55','stihl-fs-91','stihl-fs-131','stihl-fs-250','stihl-bg-86','stihl-br-600','stihl-br-700','husqvarna-128ld','husqvarna-525ls','husqvarna-350bt','husqvarna-580bts','echo-srm-225','echo-srm-2620','echo-pb-580','echo-pb-8010','kawasaki-fr691v','kawasaki-fr730v','kawasaki-fx730v','kawasaki-fx850v','kawasaki-fx1000v','kohler-ch270','kohler-ch440','kohler-ch740','kohler-kt745','briggs-vanguard-810','briggs-intek-v-twin')
ORDER BY e.type, e.make, e.model;
