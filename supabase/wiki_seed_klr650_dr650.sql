-- Detailed wiki specs for the Kawasaki KLR650 (Gen 2, 2008–2018) and
-- Suzuki DR650SE (1996–present). Run in Supabase SQL Editor.
-- Enrich-or-create: adds a new revision to an existing entry (by slug) or
-- creates the entry first. Idempotent-ish — re-running just adds another
-- identical revision and re-points current_rev_id (harmless).
--
-- NOTE: specs are compiled from well-known factory figures but a few details
-- (valve clearances, capacities, torque) should be verified against the
-- service manual — any field is editable inline on the wiki afterward.

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

-- Verify
SELECT e.slug, e.make, e.model, jsonb_object_keys_count.n AS spec_fields
FROM wiki_entries e
JOIN LATERAL (
  SELECT count(*) AS n FROM jsonb_object_keys((SELECT data FROM wiki_revisions WHERE id = e.current_rev_id))
) jsonb_object_keys_count ON true
WHERE e.slug IN ('kawasaki-klr650','suzuki-dr650');
