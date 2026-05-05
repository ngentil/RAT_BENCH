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
  "lighting","services","smartMode",
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

export async function searchWiki(query) {
  const { data } = await supabase.from("wiki_entries")
    .select("id,slug,make,model,type,view_count")
    .or(`make.ilike.%${query}%,model.ilike.%${query}%`)
    .order("view_count", { ascending: false })
    .limit(30);
  return data || [];
}

export async function incrementViewCount(entryId) {
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
  await supabase.from("wiki_entries")
    .update({ current_rev_id: rev.id }).eq("id", entryId);
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
  await supabase.from("wiki_entries")
    .update({ current_rev_id: rev.id }).eq("id", entryId);
  return rev;
}

export async function deleteWikiRevision(revId, entryId) {
  const { error } = await supabase.from("wiki_revisions").delete().eq("id", revId);
  if (error) throw error;
  const { data: remaining } = await supabase.from("wiki_revisions")
    .select("id").eq("entry_id", entryId).order("created_at", { ascending: false }).limit(1);
  await supabase.from("wiki_entries")
    .update({ current_rev_id: remaining?.[0]?.id || null }).eq("id", entryId);
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
