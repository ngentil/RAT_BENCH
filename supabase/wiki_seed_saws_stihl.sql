-- Popular workbench engines — Stihl chainsaw batch. Run in Supabase SQL Editor.
-- Enrich-or-create per slug. type = 'Chainsaw'. 2-stroke, air-cooled, 50:1 premix,
-- NGK BPMR7A / 0.5 mm gap across the range. Bore/stroke given only where certain;
-- verify bar/chain combos and carb (M-Tronic) settings against the Stihl manual.

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

SELECT e.slug, e.make, e.model,
       (SELECT count(*) FROM jsonb_object_keys(r.data)) AS spec_fields
FROM wiki_entries e JOIN wiki_revisions r ON r.id = e.current_rev_id
WHERE e.slug LIKE 'stihl-ms-%' ORDER BY e.model;
