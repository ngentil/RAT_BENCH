import { supabase } from './supabase';
import { escapeLike } from './helpers';
import { uploadPhoto } from './storage';

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

// Fields stripped before storing to wiki — owner-contextual, not spec data.
// Anything private MUST be listed here: photo URLs, job/billing data, service
// history, and personal scheduling all leak into publicly readable revisions
// if omitted.
const STRIP_FIELDS = new Set([
  "id","userId","companyId","clientId","createdAt","updatedAt",
  "status","source","rage","photos","jobPhotos",
  "lighting","services",
  "wireGauge","wireLength","wireAmps","totalLoadWatts",
  "riderWeight","springRate","groundContactLength",
  "primaryRatio","topGearRatio",
  // Private photo URLs (owner's storage folder)
  "iPPhotos","ePPhotos",
  // Job / billing / scheduling data
  "parts","timeLog","jobTimers","dueDate",
  // Service history
  "lastServiceDate","lastServiceOdo","lastServiceNotes",
  // UI prefs / internal linkage
  "tileFields","tileColors","expandFields","submittedToWiki","wikiMachineId",
]);

// Deep-clean nested spec objects: carbSpec embeds private gasket photo URLs
// and the owner's purchase links.
function sanitizeSpecData(machine) {
  const specData = Object.fromEntries(
    Object.entries(machine).filter(([k]) => !STRIP_FIELDS.has(k))
  );
  if (specData.carbSpec && typeof specData.carbSpec === "object") {
    const { gasketPhotos, purchaseLinks, ...carbRest } = specData.carbSpec;
    specData.carbSpec = carbRest;
  }
  return specData;
}

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
    .ilike("make", escapeLike(make))
    .ilike("model", escapeLike(model))
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
  for (const p of parts) q = q.ilike('make', `%${escapeLike(p)}%`);
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
  if (make?.trim()) q = q.ilike('make', escapeLike(make));
  for (const p of parts) q = q.ilike('model', `%${escapeLike(p)}%`);
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

// Tokenize a search query — used for result HIGHLIGHTING (the actual matching
// happens server-side in the search_wiki RPC). Mirrors the Spec Search tab's
// model: the whole trimmed query is treated as one plain substring rather than
// split into multiple fuzzy sub-tokens, so highlighting stays simple and
// predictable — what lights up is exactly the text you typed, wherever it
// appears (case-insensitively).
export function tokenizeSearch(query) {
  const q = String(query || "").trim();
  return q ? [q] : [];
}

// Server-side fuzzy search via the search_wiki RPC (supabase/wiki_fuzzy_search_rpc.sql).
// Stage 1 matches on despaced normalized text so spacing/hyphenation is
// irrelevant in both directions ("ms441"↔"MS 441", "seadoo"↔"Sea-Doo"); stage 2
// falls back to pg_trgm similarity so brand typos ("honfa"→Honda) still resolve.
export async function searchWiki(query) {
  const { data, error } = await supabase.rpc("search_wiki", { q: query || "", lim: 50 });
  if (error) { console.error("searchWiki:", error); return []; }
  return data || [];
}

// ── Community stats ───────────────────────────────────────────────────────────

// Wiki-wide headline numbers for the discovery home.
export async function getWikiStats() {
  const [{ count: entries }, { count: contributors }] = await Promise.all([
    supabase.from("wiki_entries").select("id", { count: "exact", head: true }).eq("is_sample", false),
    supabase.from("wiki_contributions").select("user_id", { count: "exact", head: true }),
  ]);
  return { entries: entries || 0, contributions: contributors || 0 };
}

// Newest entries first — for a "recently added" strip.
export async function getRecentWikiEntries(limit = 8) {
  const { data } = await supabase.from("wiki_entries")
    .select("id,slug,make,model,type,view_count,created_at")
    .eq("is_sample", false)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

// How many distinct mechanics have contributed to an entry (social proof).
export async function getEntryContributorCount(entryId) {
  const { data } = await supabase.from("wiki_contributions")
    .select("user_id").eq("entry_id", entryId);
  if (!data) return 0;
  return new Set(data.map(r => r.user_id).filter(Boolean)).size;
}

// A user's own contribution tally — surfaced on their profile.
export async function getMyContributionStats(userId) {
  if (!userId) return { entries: 0, edits: 0 };
  const [{ data: contribs }, { count: edits }] = await Promise.all([
    supabase.from("wiki_contributions").select("entry_id").eq("user_id", userId),
    supabase.from("wiki_revisions").select("id", { count: "exact", head: true }).eq("edited_by", userId),
  ]);
  const entries = new Set((contribs || []).map(r => r.entry_id).filter(Boolean)).size;
  return { entries, edits: edits || 0 };
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
  const specData = sanitizeSpecData(machine);
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

  // Strip owner-contextual fields (photos, jobs, service history, carb links)
  const specData = sanitizeSpecData(machine);

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

// ── Photos ───────────────────────────────────────────────────────────────────
// A public gallery per entry, separate from spec revisions — photos persist
// independently of which revision is "current" and carry their own
// moderation state (live/hidden/removed).

export async function getWikiEntryPhotos(entryId) {
  const { data, error } = await supabase.from("wiki_entry_photos")
    .select("*").eq("entry_id", entryId).eq("status", "live")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function uploadWikiPhoto(entryId, file, userId) {
  const url = await uploadPhoto(file);
  const { data, error } = await supabase.from("wiki_entry_photos")
    .insert({ entry_id: entryId, uploaded_by: userId, url }).select().single();
  if (error) throw error;
  return data;
}

export async function reportWikiPhoto(photoId, reason) {
  const { data, error } = await supabase.rpc("report_wiki_photo", { p_photo_id: photoId, p_reason: reason });
  if (error) throw error;
  return data;
}

export async function setWikiCoverPhoto(photoId) {
  const { data, error } = await supabase.rpc("set_wiki_cover_photo", { p_photo_id: photoId });
  if (error) throw error;
  return data;
}

// ── Points ───────────────────────────────────────────────────────────────────
// Never surfaced as an error to the user — points are a bonus layer on top of
// an action that has already succeeded (the entry/revision is already saved),
// so a failed award shouldn't look like the publish/edit itself failed.

export async function awardWikiPushPoints(entryId) {
  const { data, error } = await supabase.rpc("award_wiki_push_points", { p_entry_id: entryId });
  if (error) { console.error("awardWikiPushPoints:", error); return null; }
  return data;
}

export async function awardWikiEditPoints(revisionId) {
  const { data, error } = await supabase.rpc("award_wiki_edit_points", { p_revision_id: revisionId });
  if (error) { console.error("awardWikiEditPoints:", error); return null; }
  return data;
}

export async function getMyWikiPoints() {
  const { data, error } = await supabase.rpc("get_my_wiki_points");
  if (error) { console.error("getMyWikiPoints:", error); return 0; }
  return data || 0;
}

// ── Verification ─────────────────────────────────────────────────────────────
// Confirm/dispute votes on a revision. 3 confirms pays the editor a bonus,
// 3 disputes costs them a penalty — both handled server-side in
// submit_wiki_verification() so vote counts and points can't drift apart.

export async function getRevisionVerifications(revisionId) {
  const { data, error } = await supabase.from("wiki_revision_verifications")
    .select("*").eq("revision_id", revisionId);
  if (error) throw error;
  return data || [];
}

// Batched variant for a history page listing many revisions at once —
// one round trip instead of one per revision. Returns { [revisionId]: rows[] }.
export async function getVerificationsForRevisions(revisionIds) {
  if (!revisionIds?.length) return {};
  const { data, error } = await supabase.from("wiki_revision_verifications")
    .select("*").in("revision_id", revisionIds);
  if (error) throw error;
  const byRev = {};
  (data || []).forEach(v => { (byRev[v.revision_id] ||= []).push(v); });
  return byRev;
}

export async function submitWikiVerification(revisionId, vote) {
  const { data, error } = await supabase.rpc("submit_wiki_verification", { p_revision_id: revisionId, p_vote: vote });
  if (error) throw error;
  return data;
}

// ── Leaderboard ──────────────────────────────────────────────────────────────
// Opt-in only — a user's raw points history is otherwise private to them.

export async function getWikiLeaderboard(limit = 20) {
  const { data, error } = await supabase.rpc("get_wiki_leaderboard", { p_limit: limit });
  if (error) throw error;
  return data || [];
}

export async function setWikiLeaderboardOptIn(profileId, optIn) {
  const { error } = await supabase.from("profiles")
    .update({ wiki_leaderboard_opt_in: optIn }).eq("id", profileId);
  if (error) throw error;
}
