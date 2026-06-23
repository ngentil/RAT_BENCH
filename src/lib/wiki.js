import { supabase } from './supabase';

// ── Slug ──────────────────────────────────────────────────────────────────────
export function makeSlug(make, model) {
  return [make, model].join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Field labels — camelCase keys matching the machine object ─────────────────
// Only public spec fields. Owner-contextual fields (status, source, photos,
// rage, lighting, notes) are excluded — the wiki is a spec reference, not a
// listing or personal log.
export const WIKI_FIELD_LABELS = {
  // Identity
  make:               "Make",
  model:              "Model",
  type:               "Machine Type",
  year:               "Year",
  serial:             "Serial No.",
  colour:             "Colour",
  bodyType:           "Body Type",
  driveConfig:        "Drive Config",

  // Engine
  strokeType:         "Engine Type",
  ccSize:             "Engine CC",
  compression:        "Compression (PSI)",
  compressionRatio:   "Compression Ratio",
  idleRpm:            "Idle RPM",
  wotRpm:             "WOT RPM",
  cylCount:           "Cylinder Count",
  firingOrder:        "Firing Order",
  valveTrain:         "Valve Train",
  camType:            "Cam Type",
  intakeValveClear:   "Intake Valve Clear (mm)",
  exhaustValveClear:  "Exhaust Valve Clear (mm)",
  intakeValveN:       "Intake Valves / Cyl",
  exhaustValveN:      "Exhaust Valves / Cyl",

  // Ignition
  plugType:           "Spark Plug",
  plugGap:            "Plug Gap (mm)",
  coilType:           "Coil Type",
  primaryOhms:        "Coil Primary (Ω)",
  secondaryOhms:      "Coil Secondary (Ω)",

  // Starter
  starterType:        "Starter Type",
  ropeDiameter:       "Rope Diameter (mm)",

  // Fuel
  fuelSystem:         "Fuel System",
  mixRatio:           "Fuel Mix Ratio",
  fuelTankCapacity:   "Fuel Tank (L)",
  tbDiameter:         "Throttle Body (mm)",

  // Cooling
  coolingType:        "Cooling Type",
  coolantType:        "Coolant Type",
  coolantCapacity:    "Coolant Capacity (L)",
  thermostatTemp:     "Thermostat Temp (°C)",

  // Turbo
  turboFitted:        "Forced Induction",
  turboType:          "Turbo Type",
  turboBrand:         "Turbo Brand",
  turboBoost:         "Boost (PSI)",

  // Engine internals
  boreDiameter:       "Bore Diameter (mm)",
  pistonDiameter:     "Piston Diameter (mm)",
  pistonClearance:    "Piston Clearance (mm)",
  crankStroke:        "Stroke (mm)",
  conrodLength:       "Con-rod Length C-C (mm)",

  // PTO / shaft
  ptoDiameter:        "PTO Shaft Diameter",
  shaftType:          "Shaft Type",

  // Drivetrain
  driveType:          "Drive Type",
  transType:          "Transmission",
  clutchType:         "Clutch Type",
  finalDriveType:     "Final Drive",
  finalDriveRatio:    "Final Drive Ratio",

  // Gearbox shafts
  inputShaftDiameter: "Input Shaft (mm)",
  outputShaftDiameter:"Output Shaft (mm)",

  // Suspension
  forkType:           "Fork Type",
  forkDiameter:       "Fork Diameter (mm)",
  forkTravel:         "Fork Travel (mm)",
  rearShockType:      "Rear Shock",
  rearTravel:         "Rear Travel (mm)",

  // Brakes
  frontBrakeType:     "Front Brake",
  rearBrakeType:      "Rear Brake",
  frontPadBrand:      "Front Pad Brand",
  rearPadBrand:       "Rear Pad Brand",

  // Tyres
  tyreSizeFront:      "Tyre Front",
  tyreSizeRear:       "Tyre Rear",
  tyrePressureFront:  "Tyre PSI Front",
  tyrePressureRear:   "Tyre PSI Rear",

  // Belt
  beltType:           "Belt Type",
  beltPartNo:         "Belt Part No.",
  beltWidth:          "Belt Width (mm)",
  beltLength:         "Belt Length (mm)",

  // Blade / Deck
  deckSize:           "Deck Size (in)",
  deckMaterial:       "Deck Material",
  bladeLength:        "Blade Length (mm)",
  bladeCount:         "Blade Count",
  bladeType:          "Blade Type",

  // Bar & Chain (chainsaw)
  barLength:          "Bar Length (in)",
  barGauge:           "Bar Gauge",
  chainPitchCS:       "Chain Pitch",
  chainDriveLinks:    "Drive Links",
  sprocketStyle:      "Sprocket Style",
  sprocketTeethCS:    "Sprocket Teeth",

  // Outboard
  obShaftLength:      "Shaft Length",
  obGearRatio:        "Gear Ratio",
  obPropPitch:        "Prop Pitch (in)",
  obPropDiameter:     "Prop Diameter (in)",
  obPropMaterial:     "Prop Material",
  obTiltTrim:         "Tilt / Trim",
  obSteering:         "Steering",
  obAnodeMaterial:    "Anode Material",
  obLowerUnitOilType: "Lower Unit Oil",

  // Pump (pressure washer)
  pumpPsi:            "Pump PSI",
  pumpFlow:           "Pump Flow (LPM)",
  pumpType:           "Pump Type",

  // Generator
  genVoltage:         "Generator Voltage",
  genHz:              "Generator Hz",
  genWatts:           "Generator Watts",
  genPhase:           "Generator Phase",

  // Dimensions
  weightKg:           "Weight (kg)",
  lengthMm:           "Length (mm)",
  widthMm:            "Width (mm)",
  heightMm:           "Height (mm)",

  // Notes
  notes:              "Notes",
};

// Fields stripped before storing to wiki — owner-contextual, not spec data
const STRIP_FIELDS = new Set([
  "id","userId","companyId","clientId","createdAt","updatedAt",
  "status","source","rage","photos","jobPhotos",
  "lighting","services",
  "wireGauge","wireLength","wireAmps","totalLoadWatts",
  "riderWeight","springRate","groundContactLength",
  "primaryRatio","topGearRatio",
]);

// ── API ───────────────────────────────────────────────────────────────────────
export async function getWikiEntryBySlug(slug) {
  const { data: entry, error } = await supabase.from("wiki_entries")
    .select("*").eq("slug", slug).single();
  if (error || !entry) return null;
  if (entry.current_rev_id) {
    const { data: rev } = await supabase.from("wiki_revisions")
      .select("*").eq("id", entry.current_rev_id).single();
    entry.currentRevision = rev || null;
  }
  return entry;
}

export async function getWikiRevisions(entryId) {
  const { data } = await supabase.from("wiki_revisions")
    .select("*").eq("entry_id", entryId).order("created_at", { ascending: false });
  return data || [];
}

// Look up a wiki entry by exact make+model (case-insensitive).
// Returns the best-matched non-sample entry, or the user's own sample entry,
// with currentRevision attached. Returns null if nothing found.
export async function lookupWikiEntry(make, model, userId) {
  if (!make || !model) return null;
  let q = supabase.from("wiki_entries")
    .select("*")
    .ilike("make", make)
    .ilike("model", model)
    .not("current_rev_id", "is", null);
  if (userId && /^[0-9a-f-]{36}$/.test(userId)) {
    q = q.or(`is_sample.eq.false,and(is_sample.eq.true,sample_owner_id.eq.${userId})`);
  } else {
    q = q.eq("is_sample", false);
  }
  const { data } = await q.order("view_count", { ascending: false }).limit(1);
  const entry = data?.[0];
  if (!entry) return null;
  const { data: rev } = await supabase.from("wiki_revisions")
    .select("*").eq("id", entry.current_rev_id).single();
  entry.currentRevision = rev || null;
  return entry;
}

export async function getWikiMakes(query) {
  if (!query?.trim()) return [];
  const { data } = await supabase
    .from('wiki_entries')
    .select('make')
    .ilike('make', `%${query}%`)
    .eq('is_sample', false)
    .limit(50);
  if (!data) return [];
  const unique = [...new Set(data.map(e => e.make).filter(Boolean))];
  const q = query.toLowerCase();
  return unique
    .sort((a, b) => {
      const aP = a.toLowerCase().startsWith(q), bP = b.toLowerCase().startsWith(q);
      if (aP && !bP) return -1;
      if (!aP && bP) return 1;
      return a.localeCompare(b);
    })
    .slice(0, 12);
}

export async function getWikiModels(make, query) {
  if (!query?.trim()) return [];
  let q = supabase
    .from('wiki_entries')
    .select('model')
    .ilike('model', `%${query}%`)
    .eq('is_sample', false)
    .limit(50);
  if (make?.trim()) q = q.ilike('make', make);
  const { data } = await q;
  if (!data) return [];
  const unique = [...new Set(data.map(e => e.model).filter(Boolean))];
  const ql = query.toLowerCase();
  return unique
    .sort((a, b) => {
      const aP = a.toLowerCase().startsWith(ql), bP = b.toLowerCase().startsWith(ql);
      if (aP && !bP) return -1;
      if (!aP && bP) return 1;
      return a.localeCompare(b);
    })
    .slice(0, 15);
}

export async function searchWiki(query, userId) {
  const tokens = query.trim()
    .split(/\s+/)
    .map(t => t.replace(/[^a-zA-Z0-9\-]/g, ''))
    .filter(Boolean);

  const addVisibility = (q) => {
    if (userId && /^[0-9a-f-]{36}$/.test(userId)) {
      return q.or(`is_sample.eq.false,and(is_sample.eq.true,sample_owner_id.eq.${userId})`);
    }
    return q.eq("is_sample", false);
  };

  const base = () => supabase.from("wiki_entries")
    .select("id,slug,make,model,type,view_count,is_sample")
    .order("view_count", { ascending: false })
    .limit(50);

  if (!tokens.length) {
    const { data } = await addVisibility(base());
    return data || [];
  }

  // AND pass: every token must appear in at least one of make/model/type/slug
  let q = base();
  for (const t of tokens) {
    q = q.or(`make.ilike.%${t}%,model.ilike.%${t}%,type.ilike.%${t}%,slug.ilike.%${t}%`);
  }
  const { data: exact } = await addVisibility(q);
  if (exact && exact.length > 0) return exact;

  // OR fallback: any token matches any field — return ranked by match count
  const fallbackConds = tokens.flatMap(t => [
    `make.ilike.%${t}%`, `model.ilike.%${t}%`, `type.ilike.%${t}%`, `slug.ilike.%${t}%`,
  ]);
  const { data: broad } = await addVisibility(base().or(fallbackConds.join(',')));
  if (!broad) return [];
  const score = (e) => tokens.reduce((s, t) => {
    const tl = t.toLowerCase();
    return s + ([e.make, e.model, e.type, e.slug].some(f => (f || '').toLowerCase().includes(tl)) ? 1 : 0);
  }, 0);
  return [...broad].sort((a, b) => score(b) - score(a) || b.view_count - a.view_count);
}

const _viewedThisSession = new Set();

export async function incrementViewCount(entryId) {
  if (_viewedThisSession.has(entryId)) return;
  _viewedThisSession.add(entryId);
  await supabase.rpc("increment_wiki_views", { entry_id: entryId });
}

export async function saveWikiRevision(entryId, data, editSummary, profile) {
  const { data: rev, error } = await supabase.from("wiki_revisions").insert({
    entry_id:     entryId,
    edited_by:    profile.id,
    username:     profile.username || profile.display_name || "Anonymous",
    edit_summary: editSummary || "Updated specs",
    data,
  }).select().single();
  if (error) throw error;
  await supabase.rpc("update_wiki_rev_pointer", { p_entry_id: entryId, p_rev_id: rev.id });
  return rev;
}

export async function saveWikiFieldEdit(entryId, currentData, fieldKey, oldValue, newValue, profile) {
  const updatedData = { ...currentData, [fieldKey]: newValue };
  const label = WIKI_FIELD_LABELS[fieldKey] || fieldKey;
  const { data: rev, error } = await supabase.from("wiki_revisions").insert({
    entry_id:     entryId,
    edited_by:    profile.id,
    username:     profile.username || profile.display_name || "Anonymous",
    edit_summary: `Updated ${label}`,
    data:         updatedData,
    field_key:    fieldKey,
    old_value:    oldValue != null ? String(oldValue) : "",
    new_value:    newValue != null ? String(newValue) : "",
  }).select().single();
  if (error) throw error;
  await supabase.rpc("update_wiki_rev_pointer", { p_entry_id: entryId, p_rev_id: rev.id });
  return rev;
}

export async function deleteWikiRevision(revId, entryId) {
  const { error } = await supabase.from("wiki_revisions").delete().eq("id", revId);
  if (error) throw error;
  const { data: remaining } = await supabase.from("wiki_revisions")
    .select("id").eq("entry_id", entryId).order("created_at", { ascending: false }).limit(1);
  await supabase.rpc("update_wiki_rev_pointer", { p_entry_id: entryId, p_rev_id: remaining?.[0]?.id || null });
}

export async function deleteWikiEntry(entryId) {
  await supabase.from("wiki_revisions").delete().eq("entry_id", entryId);
  await supabase.from("wiki_contributions").delete().eq("entry_id", entryId);
  const { error } = await supabase.from("wiki_entries").delete().eq("id", entryId);
  if (error) throw error;
}

// Read-only check — no writes. Used by the modal useEffect so opening the
// modal never creates a DB entry before the user clicks Publish.
export async function prepareWikiPublish(machine, profile) {
  const slug = makeSlug(machine.make || "", machine.model || "");
  if (!slug || slug === "-")
    throw new Error("Machine must have a make and model to publish.");
  const specData = Object.fromEntries(
    Object.entries(machine).filter(([k]) => !STRIP_FIELDS.has(k))
  );
  const { data: existing } = await supabase.from("wiki_entries")
    .select("*").eq("slug", slug).single();
  if (existing) {
    const { data: currentRev } = await supabase.from("wiki_revisions")
      .select("*").eq("id", existing.current_rev_id).single();
    return { entry: existing, currentRevision: currentRev || null, isNew: false, slug, specData };
  }
  return { entry: null, currentRevision: null, isNew: true, slug, specData };
}

export async function revertToRevision(entryId, rev, profile) {
  return saveWikiRevision(
    entryId,
    rev.data,
    `Reverted to revision from ${new Date(rev.created_at).toLocaleDateString()}`,
    profile,
  );
}

// ── Sample wiki entries ────────────────────────────────────────────────────────
const SAMPLE_ENTRIES = [
  {
    make: "Honda", model: "GX200", type: "Lawnmower",
    spec: {
      make: "Honda", model: "GX200", type: "Lawnmower",
      year: "1997–present",
      strokeType: "4-stroke",
      ccSize: "196cc",
      compression: "120 PSI",
      compressionRatio: "8.5:1",
      cylCount: "1",
      boreDiameter: "68mm",
      crankStroke: "54mm",
      conrodLength: "106mm",
      idleRpm: "1400 ±150 RPM",
      wotRpm: "3600 RPM",
      valveTrain: "OHV — 2 valves per cylinder",
      intakeValveClear: "0.15mm (cold)",
      exhaustValveClear: "0.20mm (cold)",
      intakeValveN: "1",
      exhaustValveN: "1",
      plugType: "NGK BPR6ES",
      plugGap: "0.70–0.80mm",
      coilType: "TCI (Transistor Controlled Ignition)",
      primaryOhms: "0.1–0.3Ω",
      secondaryOhms: "6.3–9.5kΩ",
      starterType: "Recoil",
      ropeDiameter: "4.0mm",
      fuelSystem: "Carburettor",
      cBrand: "Keihin",
      cModel: "Float-type, N424-24B",
      fuelTankCapacity: "3.1L",
      coolingType: "Air-cooled",
      ptoDiameter: "19.05mm (3/4 in)",
      weightKg: "15.1",
      lengthMm: "345",
      widthMm: "403",
      heightMm: "352",
      notes: "One of the most common small engines globally. Max torque: 12 Nm @ 2500 RPM; max power: 4.1 kW @ 3600 RPM. Many budget clones (Predator 212, DuroMax XP7HP, Loncin G200F) share near-identical bore/stroke but differ in gasket sizes and carb jetting — verify before cross-referencing parts. No low-oil warning on base GX200; check oil every 5 hrs. PTO is 3/4 in keyed horizontal shaft. Oil change at 20 hr break-in, then every 100 hrs/annually. Use SAE 10W-30 above 0°C, SAE 5W-30 below 0°C.",
    },
  },
  {
    make: "Husqvarna", model: "455 Rancher", type: "Chainsaw",
    spec: {
      make: "Husqvarna", model: "455 Rancher", type: "Chainsaw",
      year: "2009–present",
      strokeType: "2-stroke",
      ccSize: "55.5cc",
      compression: "175 PSI (approx)",
      cylCount: "1",
      idleRpm: "2700 RPM",
      wotRpm: "9000 RPM",
      plugType: "Champion RCJ7Y / NGK BPMR7A",
      plugGap: "0.50mm",
      coilType: "CDI",
      starterType: "Recoil (Smart Start®)",
      fuelSystem: "Carburettor",
      cBrand: "Walbro",
      cModel: "WT-series diaphragm",
      mixRatio: "50:1 (Husqvarna HP 2-stroke oil)",
      fuelTankCapacity: "0.65L",
      coolingType: "Air-cooled",
      barLength: "18 in / 20 in",
      barGauge: "0.058 in (1.5mm)",
      chainPitchCS: "3/8 in",
      chainDriveLinks: "72 (18 in bar) / 78 (20 in bar)",
      sprocketStyle: "Centrifugal clutch drum",
      sprocketTeethCS: "7",
      weightKg: "5.9 (without bar/chain)",
      notes: "Air Injection centrifugal air-cleaning system extends filter service intervals. Inertia-activated chain brake (LowVib anti-vibration). Bar oil tank: 0.40L. Use fresh fuel — stale ethanol-blend fuel destroys Walbro diaphragm membranes; drain and store dry. Primer bulb p/n: 525351001. Recommended chain: X-CUT SC22G (18 in) or SC25G (20 in). Top-end rebuild (piston/rings) at 150–200 hrs or when compression drops below 100 PSI. Decompression valve standard — always use on cold starts.",
    },
  },
  {
    make: "Yamaha", model: "YZ250", type: "Motorcycle",
    spec: {
      make: "Yamaha", model: "YZ250", type: "Motorcycle",
      year: "2023",
      strokeType: "2-stroke",
      ccSize: "249cc",
      cylCount: "1",
      boreDiameter: "66.4mm",
      crankStroke: "72.0mm",
      idleRpm: "N/A (no idle circuit)",
      wotRpm: "8500 RPM (peak power)",
      plugType: "NGK BR8EG",
      plugGap: "0.50–0.60mm",
      coilType: "CDI (Capacitor Discharge Ignition)",
      starterType: "Kick-start",
      fuelSystem: "Carburettor",
      cBrand: "Keihin",
      cModel: "PWK 38 Sudco flat-slide",
      mixRatio: "32:1 Yamalube 2R (break-in) / 40:1 (standard)",
      fuelTankCapacity: "8.0L",
      coolingType: "Liquid-cooled (YPVS power valve)",
      coolantType: "Yamaha Coolant (ethylene glycol, 50:50 mix)",
      coolantCapacity: "1.1L",
      driveType: "Chain",
      transType: "6-speed manual",
      clutchType: "Wet multi-plate",
      tyreSizeFront: "80/100-21",
      tyreSizeRear: "100/90-19",
      tyrePressureFront: "100 kPa / 15 PSI",
      tyrePressureRear: "100 kPa / 15 PSI",
      forkType: "KYB 48mm USD Cartridge",
      forkTravel: "310mm",
      rearShockType: "KYB Link-type Monocross",
      rearTravel: "315mm",
      frontBrakeType: "Single hydraulic disc — 250mm",
      rearBrakeType: "Single hydraulic disc — 245mm",
      weightKg: "95.6 (dry)",
      lengthMm: "2175",
      widthMm: "820",
      heightMm: "1290",
      notes: "Reed-valve inducted single-cylinder 2-stroke with YPVS (Yamaha Power Valve System). Wheelbase: 1480mm. Seat height: 968mm. Power delivery aggressive from ~5000 RPM — re-jet for altitude and ambient temp (factory jetting conservative). Top-end piston/ring rebuild every 30–50 hr track use; inspect nicasil cylinder bore for plating wear before honing (plated bores must be replated, not honed). Gearbox oil: 650ml Yamaha Gear Oil or 10W-30 4-stroke. Chain spec: 520 pitch. Grease swingarm and linkage bearings every 10–15 hrs.",
    },
  },
];

export async function seedSampleWikiEntries(profile) {
  if (!profile?.id) return;
  const uid8 = profile.id.slice(0, 8);
  const username = profile.username || profile.display_name || "RatBench";

  for (const sample of SAMPLE_ENTRIES) {
    const slug = `${makeSlug(sample.make, sample.model)}-sample-${uid8}`;
    const { data: existing } = await supabase.from("wiki_entries")
      .select("id").eq("slug", slug).single();
    if (existing) continue;

    const { data: entry, error } = await supabase.from("wiki_entries").insert({
      slug,
      make: sample.make,
      model: sample.model,
      type: sample.type,
      created_by: profile.id,
      is_sample: true,
      sample_owner_id: profile.id,
    }).select().single();
    if (error) continue;

    const { data: rev, error: revErr } = await supabase.from("wiki_revisions").insert({
      entry_id:     entry.id,
      edited_by:    profile.id,
      username,
      edit_summary: "Sample entry",
      data:         sample.spec,
    }).select().single();
    if (!revErr && rev) {
      await supabase.rpc("update_wiki_rev_pointer", { p_entry_id: entry.id, p_rev_id: rev.id });
    }
  }
}

export async function publishToWiki(machine, profile) {
  const slug = makeSlug(machine.make || "", machine.model || "");
  if (!slug || slug === "-")
    throw new Error("Machine must have a make and model to publish.");

  // Strip owner-contextual fields
  const specData = Object.fromEntries(
    Object.entries(machine).filter(([k]) => !STRIP_FIELDS.has(k))
  );

  const { data: existing } = await supabase.from("wiki_entries")
    .select("*").eq("slug", slug).single();

  if (existing) {
    const { data: currentRev } = await supabase.from("wiki_revisions")
      .select("*").eq("id", existing.current_rev_id).single();
    return { entry: existing, currentRevision: currentRev || null, isNew: false, slug, specData };
  }

  const { data: entry, error } = await supabase.from("wiki_entries").insert({
    slug,
    make:       machine.make,
    model:      machine.model,
    type:       machine.type,
    created_by: profile.id,
  }).select().single();
  if (error) throw error;

  const rev = await saveWikiRevision(entry.id, specData, "Initial publish", profile);

  await supabase.from("wiki_contributions").insert({
    entry_id: entry.id, machine_id: machine.id, user_id: profile.id,
  });

  return { entry, currentRevision: rev, isNew: true, slug, specData };
}
