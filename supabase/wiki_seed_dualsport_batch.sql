-- Detailed wiki specs — dual-sport / adventure batch. Run in Supabase SQL Editor.
-- Enrich-or-create per slug (adds a revision to an existing entry or creates it).
-- Specs from well-known factory figures; a few details (valve clearances,
-- capacities, and the newer CFMoto outputs) are approximate — verify against the
-- service manual. Every field is editable inline on the wiki afterward.

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

-- Verify — expect 8 rows with their field counts
SELECT e.slug, e.make, e.model,
       (SELECT count(*) FROM jsonb_object_keys(r.data)) AS spec_fields
FROM wiki_entries e
JOIN wiki_revisions r ON r.id = e.current_rev_id
WHERE e.slug IN ('suzuki-dr-z400','yamaha-tw200','yamaha-wr450f','bmw-f650',
                 'bmw-f650gs','bmw-g650gs','cfmoto-450mt','cfmoto-800mt')
ORDER BY e.make, e.model;
