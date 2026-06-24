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

  // Motorcycle / ATV / Powersports
  wotPower:           "Max Power",
  torqueNm:           "Max Torque (N·m)",
  topSpeed:           "Top Speed",
  frameType:          "Frame Type",
  wheelbaseMm:        "Wheelbase (mm)",
  seatHeightMm:       "Seat Height (mm)",
  groundClearanceMm:  "Ground Clearance (mm)",

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
// Returns the best-matched entry with currentRevision attached, or null.
export async function lookupWikiEntry(make, model) {
  if (!make || !model) return null;
  const { data } = await supabase.from("wiki_entries")
    .select("*")
    .ilike("make", make)
    .ilike("model", model)
    .not("current_rev_id", "is", null)
    .eq("is_sample", false)
    .order("view_count", { ascending: false })
    .limit(1);
  const entry = data?.[0];
  if (!entry) return null;
  const { data: rev } = await supabase.from("wiki_revisions")
    .select("*").eq("id", entry.current_rev_id).single();
  entry.currentRevision = rev || null;
  return entry;
}

export async function getWikiMakes(query) {
  if (!query?.trim()) return [];
  // Split at letter/digit boundaries so "gx200" matches "GX 200", etc.
  const parts = query.match(/[a-zA-Z]+|\d+/g) || [query.trim()];
  let q = supabase.from('wiki_entries').select('make').eq('is_sample', false).limit(50);
  for (const p of parts) q = q.ilike('make', `%${p}%`);
  const { data } = await q;
  if (!data) return [];
  const unique = [...new Set(data.map(e => e.make).filter(Boolean))];
  const qn = query.toLowerCase().replace(/\s+/g, '');
  return unique
    .sort((a, b) => {
      const an = a.toLowerCase().replace(/\s+/g, '');
      const bn = b.toLowerCase().replace(/\s+/g, '');
      const aP = an.startsWith(qn), bP = bn.startsWith(qn);
      if (aP && !bP) return -1;
      if (!aP && bP) return 1;
      return a.localeCompare(b);
    })
    .slice(0, 12);
}

export async function getWikiModels(make, query) {
  if (!query?.trim()) return [];
  // Split at letter/digit boundaries so "ms461" matches "MS 461", etc.
  const parts = query.match(/[a-zA-Z]+|\d+/g) || [query.trim()];
  let q = supabase.from('wiki_entries').select('model').eq('is_sample', false).limit(50);
  if (make?.trim()) q = q.ilike('make', make);
  for (const p of parts) q = q.ilike('model', `%${p}%`);
  const { data } = await q;
  if (!data) return [];
  const unique = [...new Set(data.map(e => e.model).filter(Boolean))];
  const qn = query.toLowerCase().replace(/\s+/g, '');
  return unique
    .sort((a, b) => {
      const an = a.toLowerCase().replace(/\s+/g, '');
      const bn = b.toLowerCase().replace(/\s+/g, '');
      const aP = an.startsWith(qn), bP = bn.startsWith(qn);
      if (aP && !bP) return -1;
      if (!aP && bP) return 1;
      return a.localeCompare(b);
    })
    .slice(0, 15);
}

export async function searchWiki(query) {
  const tokens = query.trim()
    .split(/\s+/)
    .map(t => t.replace(/[^a-zA-Z0-9\-]/g, ''))
    .filter(Boolean);

  const base = () => supabase.from("wiki_entries")
    .select("id,slug,make,model,type,view_count")
    .eq("is_sample", false)
    .order("view_count", { ascending: false })
    .limit(50);

  if (!tokens.length) {
    const { data } = await base();
    return data || [];
  }

  // AND pass: every token must appear in at least one of make/model/type/slug
  let q = base();
  for (const t of tokens) {
    q = q.or(`make.ilike.%${t}%,model.ilike.%${t}%,type.ilike.%${t}%,slug.ilike.%${t}%`);
  }
  const { data: exact } = await q;
  if (exact && exact.length > 0) return exact;

  // OR fallback: any token matches any field — return ranked by match count
  const fallbackConds = tokens.flatMap(t => [
    `make.ilike.%${t}%`, `model.ilike.%${t}%`, `type.ilike.%${t}%`, `slug.ilike.%${t}%`,
  ]);
  const { data: broad } = await base().or(fallbackConds.join(','));
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
