-- Popular workbench engines — Honda small-engine batch. Run in Supabase SQL Editor.
-- Enrich-or-create per slug. type = 'Standalone Engine'. Specs from Honda's
-- published figures; valve lash and plug are the standard GX-series values
-- (intake 0.15 / exhaust 0.20 mm cold, NGK BPR6ES). Verify against the shop
-- manual — every field is editable inline on the wiki.

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

-- Verify — expect 13 rows
SELECT e.slug, e.make, e.model,
       (SELECT count(*) FROM jsonb_object_keys(r.data)) AS spec_fields
FROM wiki_entries e JOIN wiki_revisions r ON r.id = e.current_rev_id
WHERE e.slug LIKE 'honda-gx%' OR e.slug LIKE 'honda-gc%'
ORDER BY e.model;
