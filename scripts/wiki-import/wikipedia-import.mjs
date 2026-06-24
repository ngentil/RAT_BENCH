#!/usr/bin/env node
/**
 * Import machine specs from Wikipedia infoboxes into the RAT BENCH wiki.
 *
 * Usage:
 *   node scripts/wiki-import/wikipedia-import.mjs [--dry-run] [--make=Stihl] [--category=motorcycle]
 *
 * Options:
 *   --dry-run              Preview counts without writing to DB
 *   --make=NAME            Only process one brand (e.g. --make=Stihl)
 *   --category=CAT         Filter by category: all, ope, engine, marine, motorcycle, atv  (default: all)
 */

import { makeSlug, fetchExistingSlugs, batchInsert, delay } from './_shared.mjs';

const DRY_RUN     = process.argv.includes('--dry-run');
const MAKE_FILTER = (process.argv.find(a => a.startsWith('--make='))     || '').replace('--make=', '')     || null;
const CAT_FILTER  = (process.argv.find(a => a.startsWith('--category=')) || '').replace('--category=', '') || 'all';
const MIN_FIELDS  = 10;
const WIKI_API    = 'https://en.wikipedia.org/w/api.php';
const UA          = 'RatBenchBot/1.0 (https://ratbench.net; wiki data import) Node.js/22';
const RATE_MS     = 250;

// ── Wikipedia API helpers ─────────────────────────────────────────────────────

async function wikiGet(params) {
  const url = new URL(WIKI_API);
  url.search = new URLSearchParams({ format: 'json', origin: '*', ...params }).toString();
  const res = await fetch(url.toString(), { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Wikipedia ${res.status}: ${params.action}`);
  return res.json();
}

async function searchPages(query, limit = 50) {
  const d = await wikiGet({ action: 'query', list: 'search', srsearch: query,
    srlimit: String(limit), srnamespace: '0' });
  return (d.query?.search || []).map(r => r.title);
}

async function getCategoryMembers(cat) {
  const all = [];
  let cmcontinue;
  do {
    const params = { action: 'query', list: 'categorymembers',
      cmtitle: `Category:${cat}`, cmlimit: '500', cmtype: 'page', cmnamespace: '0' };
    if (cmcontinue) params.cmcontinue = cmcontinue;
    const d = await wikiGet(params);
    all.push(...(d.query?.categorymembers || []).map(r => r.title));
    cmcontinue = d.continue?.cmcontinue;
    if (cmcontinue) await delay(RATE_MS);
  } while (cmcontinue);
  return all;
}

async function getPageWikitext(title) {
  const d = await wikiGet({ action: 'query', prop: 'revisions', rvprop: 'content',
    rvslots: 'main', titles: title, redirects: '1' });
  const page = Object.values(d.query?.pages || {})[0];
  if (!page || page.missing !== undefined) return null;
  return page.revisions?.[0]?.slots?.main?.['*'] || page.revisions?.[0]?.['*'] || null;
}

// ── Wikitext cleaner ──────────────────────────────────────────────────────────

function clean(v) {
  if (!v) return '';
  return v
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '')
    .replace(/<ref[^>]*\/>/gi, '')
    .replace(/\{\{convert\|([^|}\s,]+)[^}]*\}\}/gi, '$1')
    .replace(/\{\{val\|([^|}\s]+)[^}]*\}\}/gi, '$1')
    .replace(/\{\{nowrap\|([^}]+)\}\}/gi, '$1')
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, '$1')
    .replace(/'{2,3}([^']*?)'{2,3}/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Infobox parser ────────────────────────────────────────────────────────────

function parseInfoboxes(wikitext) {
  const boxes = [];
  let pos = 0;
  while (pos < wikitext.length) {
    const start = wikitext.toLowerCase().indexOf('{{infobox', pos);
    if (start === -1) break;
    const nameEnd = wikitext.indexOf('\n', start);
    const templateName = wikitext.slice(start + 2, nameEnd)
      .trim().replace(/^infobox\s+/i, '').split('|')[0].trim().toLowerCase();
    let depth = 0, i = start;
    while (i < wikitext.length - 1) {
      if (wikitext[i] === '{' && wikitext[i + 1] === '{')      { depth++; i += 2; }
      else if (wikitext[i] === '}' && wikitext[i + 1] === '}') { depth--; if (!depth) { i += 2; break; } i += 2; }
      else i++;
    }
    const block = wikitext.slice(start, i);
    const fields = {};
    let curKey = null, curVal = '';
    for (const line of block.split('\n')) {
      const m = line.match(/^\s*\|\s*([^=|{}]+?)\s*=\s*(.*)/);
      if (m) {
        if (curKey) fields[curKey] = clean(curVal.trim());
        curKey = m[1].toLowerCase().replace(/\s+/g, '_');
        curVal = m[2];
      } else if (curKey && !/^\s*\{\{[Ii]nfobox/.test(line) && !/^\s*\}\}/.test(line)) {
        curVal += ' ' + line.trim();
      }
    }
    if (curKey) fields[curKey] = clean(curVal.trim());
    boxes.push({ templateName, fields });
    pos = i;
  }
  return boxes;
}

// ── Field mapping ─────────────────────────────────────────────────────────────

const FIELD_MAP = {
  // Displacement
  displacement: 'ccSize', engine_displacement: 'ccSize', swept_volume: 'ccSize',
  capacity: 'ccSize', cylinder_capacity: 'ccSize', piston_displacement: 'ccSize',
  engine_capacity: 'ccSize',
  // Bore / stroke
  bore: 'boreDiameter', cylinder_bore: 'boreDiameter', bore_diameter: 'boreDiameter',
  stroke: 'crankStroke', piston_stroke: 'crankStroke',
  // Compression
  compression_ratio: 'compressionRatio', compression: 'compressionRatio',
  // RPM
  idle_speed: 'idleRpm', idle: 'idleRpm', idle_rpm: 'idleRpm',
  max_speed: 'wotRpm', max_engine_speed: 'wotRpm', engine_speed: 'wotRpm',
  rated_speed: 'wotRpm', max_rpm: 'wotRpm',
  // Power / torque
  power: 'wotPower', rated_power: 'wotPower', max_power: 'wotPower',
  power_output: 'wotPower', engine_power: 'wotPower',
  torque: 'torqueNm', max_torque: 'torqueNm', engine_torque: 'torqueNm',
  // Speed
  top_speed: 'topSpeed', maximum_speed: 'topSpeed',
  // Weight / dims
  weight: 'weightKg', dry_weight: 'weightKg', net_weight: 'weightKg', mass: 'weightKg',
  length: 'lengthMm', width: 'widthMm', height: 'heightMm',
  wheelbase: 'wheelbaseMm',
  seat_height: 'seatHeightMm', saddle_height: 'seatHeightMm',
  ground_clearance: 'groundClearanceMm',
  // Frame
  frame: 'frameType', frame_type: 'frameType',
  // Fuel tank
  fuel_tank: 'fuelTankCapacity', fuel_tank_capacity: 'fuelTankCapacity',
  tank_capacity: 'fuelTankCapacity', fuel_capacity: 'fuelTankCapacity',
  fuel_tank_volume: 'fuelTankCapacity',
  // Ignition
  spark_plug: 'plugType', sparkplug: 'plugType', plug: 'plugType',
  spark_plug_type: 'plugType',
  plug_gap: 'plugGap', spark_plug_gap: 'plugGap', electrode_gap: 'plugGap',
  // Cooling / starter
  cooling: 'coolingType', cooling_system: 'coolingType',
  starter: 'starterType', starting: 'starterType', start: 'starterType',
  // Cylinders / valve train
  cylinders: 'cylCount', cylinder_count: 'cylCount',
  number_of_cylinders: 'cylCount', no_of_cylinders: 'cylCount',
  valve_train: 'valveTrain', valvetrain: 'valveTrain',
  cam: 'camType', camshaft: 'camType',
  // Fuel system / stroke type
  fuel_system: 'fuelSystem', induction: 'fuelSystem',
  fuel_feed: 'fuelSystem', carburetion: 'fuelSystem',
  engine_type: 'strokeType', cycle: 'strokeType', type_of_cycle: 'strokeType',
  // Drivetrain
  transmission: 'transType', gearbox: 'transType',
  clutch: 'clutchType',
  final_drive: 'finalDriveType', drive: 'finalDriveType',
  // Suspension
  front_suspension: 'forkType', front_forks: 'forkType',
  rear_suspension: 'rearShockType', rear_shock: 'rearShockType',
  // Brakes
  front_brakes: 'frontBrakeType', front_brake: 'frontBrakeType',
  rear_brakes: 'rearBrakeType', rear_brake: 'rearBrakeType',
  // Tyres
  front_tyre: 'tyreSizeFront', front_tire: 'tyreSizeFront',
  rear_tyre: 'tyreSizeRear', rear_tire: 'tyreSizeRear',
  // Chainsaw
  bar_length: 'barLength', guide_bar: 'barLength',
  guide_bar_length: 'barLength', bar: 'barLength',
  chain_pitch: 'chainPitchCS', pitch: 'chainPitchCS',
  chain_gauge: 'barGauge', gauge: 'barGauge',
  drive_links: 'chainDriveLinks',
  sprocket_teeth: 'sprocketTeethCS', drive_sprocket: 'sprocketTeethCS',
  // Mower / blade
  cutting_width: 'deckSize', deck_size: 'deckSize', deck: 'deckSize',
  // Year
  introduced: 'year', year: 'year', years: 'year',
  production: 'year', model_year: 'year',
  // Colour / body
  colour: 'colour', color: 'colour',
  // Outboard
  gear_ratio: 'obGearRatio', shaft_length: 'obShaftLength',
  prop_pitch: 'obPropPitch', prop_diameter: 'obPropDiameter',
  // Generator
  voltage: 'genVoltage', frequency: 'genHz',
  watts: 'genWatts', rated_watts: 'genWatts', output_watts: 'genWatts',
  // Pump
  max_pressure: 'pumpPsi', flow_rate: 'pumpFlow',
};

const NUMERIC_MM = new Set(['wheelbaseMm', 'seatHeightMm', 'groundClearanceMm', 'lengthMm', 'widthMm', 'heightMm']);
const NUMERIC    = new Set([
  'ccSize', 'boreDiameter', 'crankStroke', 'compressionRatio',
  'idleRpm', 'wotRpm', 'weightKg', 'fuelTankCapacity', 'plugGap',
  'barLength', 'chainDriveLinks', 'cylCount', 'sprocketTeethCS',
  'obGearRatio', 'pumpPsi', 'pumpFlow', 'deckSize',
  ...NUMERIC_MM,
]);

function extractNum(s) {
  const m = String(s || '').match(/(\d[\d,]*\.?\d*)/);
  if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

// Extract mm value from strings like "1400 mm", "140 cm", "1.4 m"
function extractMm(s) {
  if (!s) return null;
  const mm = s.match(/(\d+(?:\.\d+)?)\s*mm/i);
  if (mm) return Math.round(parseFloat(mm[1]));
  const cm = s.match(/(\d+(?:\.\d+)?)\s*cm/i);
  if (cm) return Math.round(parseFloat(cm[1]) * 10);
  const m  = s.match(/(\d+(?:\.\d+)?)\s*m(?!m)/i);
  if (m)  return Math.round(parseFloat(m[1]) * 1000);
  return extractNum(s);
}

// ── Field normalisers ─────────────────────────────────────────────────────────

function normalizeChainPitch(v) {
  if (!v) return null;
  if (/0\.404/.test(v))      return '0.404"';
  if (/0\.325/.test(v))      return '0.325"';
  if (/3\/8|0\.375/.test(v)) return '3/8"';
  return v;
}

function normalizeBarLength(v) {
  if (!v) return null;
  if (/cm/i.test(v)) { const n = extractNum(v); return n ? String(Math.round(n / 2.54 * 2) / 2) : null; }
  return extractNum(v)?.toString() ?? null;
}

function normalizeStrokeType(v) {
  if (!v) return null;
  if (/4.?stroke|four.?stroke/i.test(v)) return '4-stroke';
  if (/2.?stroke|two.?stroke/i.test(v))  return '2-stroke';
  return null;
}

function normalizeCooling(v) {
  if (!v) return null;
  if (/air.*oil|oil.*air/i.test(v))    return 'Air + oil cooled';
  if (/air/i.test(v))                  return 'Air-cooled';
  if (/water|liquid|fluid/i.test(v))   return 'Water-cooled';
  return v;
}

function normalizeStarter(v) {
  if (!v) return null;
  if (/recoil.*elec|elec.*recoil/i.test(v)) return 'Recoil + electric';
  if (/recoil|pull|manual/i.test(v))        return 'Recoil only';
  if (/electric|key.?start/i.test(v))       return 'Electric / key start only';
  return v;
}

function normalizeFuelSystem(v) {
  if (!v) return null;
  if (/carburet/i.test(v))         return 'Carburettor';
  if (/inject|efi|\bfi\b/i.test(v)) return 'Fuel Injected';
  return v;
}

function normalizePower(v) {
  if (!v) return null;
  const kw = v.match(/(\d+(?:\.\d+)?)\s*kW/i);
  const hp = v.match(/(\d+(?:\.\d+)?)\s*(?:hp|bhp|ps|cv)\b/i);
  if (kw && hp) return `${kw[1]} kW / ${hp[1]} hp`;
  if (kw)       return `${kw[1]} kW`;
  if (hp)       return `${hp[1]} hp`;
  const c = clean(v); return c.length < 60 ? c : null;
}

function normalizeSpeed(v) {
  if (!v) return null;
  const kmh = v.match(/(\d+(?:\.\d+)?)\s*km\/h/i);
  const mph = v.match(/(\d+(?:\.\d+)?)\s*mph/i);
  if (kmh && mph) return `${kmh[1]} km/h (${mph[1]} mph)`;
  if (kmh)        return `${kmh[1]} km/h`;
  if (mph)        return `${mph[1]} mph`;
  const c = clean(v); return c.length < 40 ? c : null;
}

// ── detectType ────────────────────────────────────────────────────────────────

function detectType(templateName, data, defaultType) {
  const t = templateName.toLowerCase();
  if (/chainsaw/i.test(t))                            return 'Chainsaw';
  if (/outboard/i.test(t))                            return 'Outboard';
  if (/lawn.?mow|riding.?mow|mower/i.test(t))        return 'Lawnmower';
  if (/generator/i.test(t))                           return 'Generator';
  if (/pressure|washer/i.test(t))                     return 'Pressure Washer';
  if (/tiller|cultivat/i.test(t))                      return 'Tiller / Cultivator';
  if (/snowmobile|snowmach/i.test(t))                  return 'Snowmobile';
  if (/personal.?water|watercraft|\bpwc\b/i.test(t))  return 'Jet Ski / PWC';
  if (/\batv\b|quad.?bike|utv|side.by.side/i.test(t)) return 'Quad Bike';
  if (/motorcycle|motorbike/i.test(t))                 return 'Motorcycle';
  if (/engine/i.test(t))                               return defaultType || 'Standalone Engine';
  // Infer from populated spec fields
  if (data.barLength || data.chainPitchCS)                       return 'Chainsaw';
  if (data.deckSize)                                             return 'Lawnmower';
  if (data.genVoltage || data.genHz || data.genWatts)            return 'Generator';
  if (data.obGearRatio || data.obShaftLength)                    return 'Outboard Motor';
  if (data.pumpPsi)                                              return 'Pressure Washer';
  if (data.forkType || data.rearShockType || data.tyreSizeFront) return defaultType || 'Motorcycle';
  return defaultType || 'Standalone Engine';
}

// ── mapPage ───────────────────────────────────────────────────────────────────

const IDENTITY_KEYS = new Set(['make', 'model', 'type', 'colour', 'year']);

function countSpecFields(data) {
  return Object.entries(data)
    .filter(([k, v]) => !IDENTITY_KEYS.has(k) && v !== null && v !== '' && v !== undefined)
    .length;
}

function mapPage(title, wikitext, make, defaultType) {
  const rows = [];
  for (const { templateName, fields } of parseInfoboxes(wikitext)) {
    const rawName = fields.name || fields.model_name || fields.model || '';
    let model = clean(rawName) || title.replace(/\s*\([^)]*\)\s*/g, '').trim();
    const pfxRe = new RegExp('^' + make.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+', 'i');
    model = model.replace(pfxRe, '').trim();
    if (!model) continue;

    const specData = {};

    for (const [wkey, wval] of Object.entries(fields)) {
      if (!wval) continue;
      const nk = wkey.toLowerCase().replace(/[\s\-]/g, '_');

      // ── Special multi-value fields ──────────────────────────────────────────
      // bore × stroke in a single field: "77 mm × 53.6 mm"
      if (nk === 'bore_stroke' || nk === 'bore_x_stroke' || nk === 'bore_and_stroke') {
        const cv = clean(wval);
        const m = cv.match(/(\d+(?:\.\d+)?)\s*[×xX]\s*(\d+(?:\.\d+)?)/);
        if (m) { specData.boreDiameter = parseFloat(m[1]); specData.crankStroke = parseFloat(m[2]); }
        continue;
      }

      // engine field (free-text): "998 cc liquid-cooled inline-four DOHC"
      if (nk === 'engine' && !specData.ccSize) {
        const cv = clean(wval);
        const ccM = cv.match(/(\d+(?:\.\d+)?)\s*(?:cc|cm³)/i);
        if (ccM) specData.ccSize = parseFloat(ccM[1]);
        if (!specData.strokeType) {
          if (/4.?stroke|four.?stroke/i.test(cv))  specData.strokeType = '4-stroke';
          else if (/2.?stroke|two.?stroke/i.test(cv)) specData.strokeType = '2-stroke';
        }
        if (!specData.coolingType) {
          if (/liquid.?cool|water.?cool/i.test(cv)) specData.coolingType = 'Water-cooled';
          else if (/air.?cool/i.test(cv))           specData.coolingType = 'Air-cooled';
        }
        if (!specData.cylCount) {
          if    (/\bsingle\b|one.?cyl|\b1.?cyl/i.test(cv)) specData.cylCount = 1;
          else if (/\btwin\b|two.?cyl|parallel.?twin|v.?2/i.test(cv)) specData.cylCount = 2;
          else if (/\bthree\b|3.?cyl|inline.?3|triple/i.test(cv))    specData.cylCount = 3;
          else if (/\bfour\b|4.?cyl|inline.?4|v.?4/i.test(cv))       specData.cylCount = 4;
          else if (/\bsix\b|6.?cyl|inline.?6|v.?6/i.test(cv))        specData.cylCount = 6;
        }
        if (!specData.valveTrain) {
          if      (/dohc/i.test(cv)) specData.valveTrain = 'DOHC';
          else if (/sohc|ohc/i.test(cv)) specData.valveTrain = 'OHC';
          else if (/ohv/i.test(cv))  specData.valveTrain = 'Pushrod (OHV)';
        }
        continue;
      }

      // ── Standard field lookup ───────────────────────────────────────────────
      const sk = FIELD_MAP[nk];
      if (!sk) continue;

      let v = wval;
      if      (sk === 'strokeType')    v = normalizeStrokeType(v);
      else if (sk === 'coolingType')   v = normalizeCooling(v);
      else if (sk === 'starterType')   v = normalizeStarter(v);
      else if (sk === 'fuelSystem')    v = normalizeFuelSystem(v);
      else if (sk === 'chainPitchCS')  v = normalizeChainPitch(v);
      else if (sk === 'barLength')     v = normalizeBarLength(v);
      else if (sk === 'wotPower')      v = normalizePower(v);
      else if (sk === 'topSpeed')      v = normalizeSpeed(v);
      else if (NUMERIC_MM.has(sk))     v = extractMm(v);
      else if (sk === 'year') {
        const y = extractNum(clean(v));
        v = (y && y > 1900 && y < 2030) ? String(Math.floor(y)) : null;
      }
      else if (NUMERIC.has(sk)) {
        v = extractNum(v);
      }

      if (v === null || v === '' || v === undefined) continue;
      specData[sk] = v;
    }

    if (countSpecFields(specData) < MIN_FIELDS) continue;

    const type = detectType(templateName, specData, defaultType);
    rows.push({ make, model, type, specData, editSummary: 'Imported from Wikipedia', source: title });
  }
  return rows;
}

// ── Brand targets ─────────────────────────────────────────────────────────────
// category: 'ope' | 'engine' | 'marine' | 'motorcycle' | 'atv'

const BRANDS = [

  // ━━ OPE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  { make: 'Stihl', category: 'ope', defaultType: 'Chainsaw',
    categories: ['Stihl products', 'Stihl chainsaws'],
    searches: [
      'Stihl MS 150 chainsaw', 'Stihl MS 170 chainsaw', 'Stihl MS 180 chainsaw',
      'Stihl MS 193 chainsaw', 'Stihl MS 194 chainsaw', 'Stihl MS 201 chainsaw',
      'Stihl MS 211 chainsaw', 'Stihl MS 231 chainsaw', 'Stihl MS 251 chainsaw',
      'Stihl MS 261 chainsaw', 'Stihl MS 271 chainsaw', 'Stihl MS 291 chainsaw',
      'Stihl MS 311 chainsaw', 'Stihl MS 341 chainsaw', 'Stihl MS 361 chainsaw',
      'Stihl MS 362 chainsaw', 'Stihl MS 391 chainsaw', 'Stihl MS 400 chainsaw',
      'Stihl MS 441 chainsaw', 'Stihl MS 461 chainsaw', 'Stihl MS 462 chainsaw',
      'Stihl MS 500i chainsaw', 'Stihl MS 661 chainsaw', 'Stihl MS 881 chainsaw',
      'Stihl MSA 120 chainsaw', 'Stihl MSA 160 chainsaw', 'Stihl MSA 220 chainsaw',
      'Stihl FS 38 trimmer', 'Stihl FS 55 trimmer', 'Stihl FS 90 trimmer',
      'Stihl FS 111 trimmer', 'Stihl FS 131 trimmer', 'Stihl FS 311 trimmer',
      'Stihl FS 360 trimmer', 'Stihl FS 460 trimmer', 'Stihl FS 561 trimmer',
      'Stihl BR 200 blower', 'Stihl BR 350 backpack blower', 'Stihl BR 430 blower',
      'Stihl BR 600 blower', 'Stihl BR 800 blower',
      'Stihl BG 50 blower', 'Stihl BG 86 blower',
      'Stihl HS 45 hedge trimmer', 'Stihl HS 82 hedge trimmer',
      'Stihl HT 75 pole pruner', 'Stihl HT 101 pole pruner', 'Stihl HT 131 pole pruner',
      'Stihl KM 91 kombi', 'Stihl KM 111 kombi', 'Stihl KM 131 kombi',
      'Stihl MSE 141 electric chainsaw', 'Stihl MSE 220 electric chainsaw',
    ],
  },

  { make: 'Husqvarna', category: 'ope', defaultType: 'Chainsaw',
    categories: ['Husqvarna AB products', 'Husqvarna chainsaws'],
    searches: [
      'Husqvarna 120 chainsaw', 'Husqvarna 130 chainsaw', 'Husqvarna 135 chainsaw',
      'Husqvarna 240 chainsaw', 'Husqvarna 245 chainsaw', 'Husqvarna 350 chainsaw',
      'Husqvarna 353 chainsaw', 'Husqvarna 365 chainsaw', 'Husqvarna 372 XP chainsaw',
      'Husqvarna 390 XP chainsaw', 'Husqvarna 394 XP chainsaw', 'Husqvarna 395 XP chainsaw',
      'Husqvarna 440 chainsaw', 'Husqvarna 445 chainsaw', 'Husqvarna 450 chainsaw',
      'Husqvarna 455 Rancher chainsaw', 'Husqvarna 460 Rancher chainsaw',
      'Husqvarna 540 XP chainsaw', 'Husqvarna 550 XP chainsaw', 'Husqvarna 560 XP chainsaw',
      'Husqvarna 565 chainsaw', 'Husqvarna 572 XP chainsaw', 'Husqvarna 576 XP chainsaw',
      'Husqvarna 120i battery chainsaw', 'Husqvarna 540i XP chainsaw',
      'Husqvarna 122L trimmer', 'Husqvarna 128LD trimmer', 'Husqvarna 323L trimmer',
      'Husqvarna 525L trimmer', 'Husqvarna 535RX brushcutter',
      'Husqvarna 125B blower', 'Husqvarna 350BT blower', 'Husqvarna 580BTS blower',
      'Husqvarna Automower 315 robot mower', 'Husqvarna Automower 430X',
      'Husqvarna TS 354D riding mower', 'Husqvarna MZ61 zero turn mower',
    ],
  },

  { make: 'Echo', category: 'ope', defaultType: 'Chainsaw',
    categories: [],
    searches: [
      'Echo CS-310 chainsaw', 'Echo CS-400 chainsaw', 'Echo CS-490 chainsaw',
      'Echo CS-590 Timber Wolf chainsaw', 'Echo CS-620P chainsaw',
      'Echo CS-680 chainsaw', 'Echo CS-800P chainsaw',
      'Echo SRM-225 trimmer', 'Echo SRM-266 trimmer', 'Echo SRM-300 trimmer',
      'Echo PB-255LN blower', 'Echo PB-580T blower', 'Echo PB-8010T blower',
      'Echo HC-155 hedge trimmer', 'Echo PPT-266 pole pruner',
    ],
  },

  { make: 'Makita', category: 'ope', defaultType: 'Chainsaw',
    categories: [],
    searches: [
      'Makita DCS3410 chainsaw', 'Makita DCS5121 chainsaw', 'Makita DCS6421 chainsaw',
      'Makita EA3201S chainsaw', 'Makita EA4300 chainsaw', 'Makita EA5000P chainsaw',
      'Makita DUC353Z battery chainsaw',
      'Makita RBC411 brushcutter', 'Makita RBC4510 trimmer',
      'Makita BHX2500 blower', 'Makita EBH341L blower',
    ],
  },

  { make: 'Dolmar', category: 'ope', defaultType: 'Chainsaw',
    categories: [],
    searches: [
      'Dolmar PS-3410 chainsaw', 'Dolmar PS-420 chainsaw', 'Dolmar PS-460 chainsaw',
      'Dolmar PS-5105C chainsaw', 'Dolmar PS-7900 chainsaw', 'Dolmar PS-9010 chainsaw',
      'Dolmar chainsaw model', 'Dolmar EA3201S',
    ],
  },

  { make: 'Jonsered', category: 'ope', defaultType: 'Chainsaw',
    categories: [],
    searches: [
      'Jonsered CS 2152 chainsaw', 'Jonsered CS 2171 chainsaw',
      'Jonsered 2245 chainsaw', 'Jonsered 2163 chainsaw',
      'Jonsered chainsaw OPE',
    ],
  },

  { make: 'Partner', category: 'ope', defaultType: 'Chainsaw',
    categories: [],
    searches: ['Partner P840 chainsaw', 'Partner 350 chainsaw', 'Partner chainsaw'],
  },

  { make: 'McCulloch', category: 'ope', defaultType: 'Chainsaw',
    categories: ['McCulloch chainsaws'],
    searches: [
      'McCulloch CS 390 chainsaw', 'McCulloch CS 450 chainsaw',
      'McCulloch Mac 335 chainsaw', 'McCulloch chainsaw model',
    ],
  },

  { make: 'Poulan', category: 'ope', defaultType: 'Chainsaw',
    categories: [],
    searches: [
      'Poulan Pro PR5020AV chainsaw', 'Poulan Pro PP5020AV chainsaw',
      'Poulan Wild Thing chainsaw', 'Poulan 3314 chainsaw', 'Poulan chainsaw',
    ],
  },

  { make: 'Shindaiwa', category: 'ope', defaultType: 'Chainsaw',
    categories: [],
    searches: [
      'Shindaiwa 251 chainsaw', 'Shindaiwa 305 chainsaw', 'Shindaiwa 491 chainsaw',
      'Shindaiwa T230 trimmer', 'Shindaiwa T272 trimmer',
      'Shindaiwa EB802 blower', 'Shindaiwa chainsaw brushcutter',
    ],
  },

  { make: 'RedMax', category: 'ope', defaultType: 'Trimmer',
    categories: [],
    searches: [
      'RedMax BCZ2660S brushcutter', 'RedMax GZ25N trimmer',
      'RedMax EBZ8550 blower', 'RedMax HEZ2460S hedge trimmer',
      'RedMax chainsaw trimmer',
    ],
  },

  { make: 'Tanaka', category: 'ope', defaultType: 'Chainsaw',
    categories: [],
    searches: [
      'Tanaka TCS33EDTP chainsaw', 'Tanaka ECS3500 chainsaw',
      'Tanaka TBC-230S trimmer', 'Tanaka THB-260PF blower',
      'Tanaka chainsaw trimmer OPE',
    ],
  },

  { make: 'Zenoah', category: 'ope', defaultType: 'Chainsaw',
    categories: [],
    searches: [
      'Zenoah G3800 chainsaw', 'Zenoah G5000 chainsaw', 'Zenoah G6200 chainsaw',
      'Zenoah BCZ2601S trimmer', 'Zenoah chainsaw',
    ],
  },

  { make: 'Toro', category: 'ope', defaultType: 'Lawnmower',
    categories: ['Toro Company products'],
    searches: [
      'Toro TimeCutter MX5075 zero turn mower', 'Toro Titan MX6000 mower',
      'Toro Recycler 22 lawn mower', 'Toro Super Recycler lawn mower',
      'Toro Power Clear snowblower', 'Toro 724 snowblower',
      'Toro Groundsmaster mower', 'Toro Z Master mower',
    ],
  },

  { make: 'Ariens', category: 'ope', defaultType: 'Snowblower',
    categories: [],
    searches: [
      'Ariens Deluxe 28 snowblower', 'Ariens Platinum 24 snowblower',
      'Ariens Pro 28 snowblower', 'Ariens IKON-X 52 zero turn mower',
      'Ariens IKON XD 52 mower', 'Ariens Zoom 34 mower',
      'Ariens snowblower mower',
    ],
  },

  { make: 'Gravely', category: 'ope', defaultType: 'Lawnmower',
    categories: [],
    searches: [
      'Gravely Pro-Turn 472 zero turn mower', 'Gravely Pro-Turn 260 mower',
      'Gravely ZT HD 52 mower', 'Gravely compact pro mower',
      'Gravely zero turn lawn mower',
    ],
  },

  { make: 'Scag', category: 'ope', defaultType: 'Lawnmower',
    categories: [],
    searches: [
      'Scag Tiger Cat II zero turn mower', 'Scag Turf Tiger mower',
      'Scag Cheetah 61 mower', 'Scag V-Ride stand-on mower',
      'Scag commercial lawn mower',
    ],
  },

  { make: 'Ferris', category: 'ope', defaultType: 'Lawnmower',
    categories: [],
    searches: [
      'Ferris IS 700Z zero turn mower', 'Ferris IS 2100Z mower',
      'Ferris IS 3200Z mower', 'Ferris SRS Z3X mower',
      'Ferris commercial zero turn mower',
    ],
  },

  { make: 'Exmark', category: 'ope', defaultType: 'Lawnmower',
    categories: [],
    searches: [
      'Exmark Lazer Z zero turn mower', 'Exmark Radius E-Series mower',
      'Exmark Pioneer S-Series mower', 'Exmark Vantage stand-on mower',
      'Exmark commercial lawn mower',
    ],
  },

  { make: 'Snapper', category: 'ope', defaultType: 'Lawnmower',
    categories: [],
    searches: [
      'Snapper 21 inch lawn mower', 'Snapper SPX zero turn mower',
      'Snapper riding lawn mower', 'Snapper NXT 21 mower',
    ],
  },

  // ━━ ENGINES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  { make: 'Honda', category: 'engine', defaultType: 'Standalone Engine',
    categories: ['Honda engines'],
    searches: [
      'Honda GX35 engine', 'Honda GX50 engine', 'Honda GX100 engine',
      'Honda GX120 engine', 'Honda GX160 engine', 'Honda GX200 engine',
      'Honda GX270 engine', 'Honda GX340 engine', 'Honda GX390 engine',
      'Honda GX630 engine', 'Honda GX690 engine',
      'Honda GCV160 engine', 'Honda GCV190 engine', 'Honda GC160 engine',
      'Honda GXV160 engine', 'Honda GXV390 engine',
      'Honda iGX340 engine', 'Honda iGX390 engine',
      'Honda WB30 water pump', 'Honda WX10 pump',
      'Honda EU2200i generator', 'Honda EU3000is generator', 'Honda EU7000is generator',
      'Honda WT30 trash pump',
    ],
  },

  { make: 'Kawasaki', category: 'engine', defaultType: 'Standalone Engine',
    categories: [],
    searches: [
      'Kawasaki FJ180V engine', 'Kawasaki FJ400D engine',
      'Kawasaki FR691V engine', 'Kawasaki FR730V engine',
      'Kawasaki FS481V engine', 'Kawasaki FS541V engine', 'Kawasaki FS600V engine',
      'Kawasaki FX600V engine', 'Kawasaki FX730V engine',
      'Kawasaki FX751V engine', 'Kawasaki FX850V engine', 'Kawasaki FX921V engine',
      'Kawasaki FH430V engine', 'Kawasaki FH541V engine', 'Kawasaki FH580V engine',
      'Kawasaki FH601V engine', 'Kawasaki FH680V engine', 'Kawasaki FH721V engine',
      'Kawasaki small engine OPE',
    ],
  },

  { make: 'Briggs & Stratton', category: 'engine', defaultType: 'Standalone Engine',
    categories: ['Briggs & Stratton engines'],
    searches: [
      'Briggs Stratton 550E Series engine', 'Briggs Stratton 550EX engine',
      'Briggs Stratton 625EX engine', 'Briggs Stratton 675EXi engine',
      'Briggs Stratton 725EXi engine', 'Briggs Stratton 775EX engine',
      'Briggs Stratton Intek 190cc engine', 'Briggs Stratton Intek 500cc engine',
      'Briggs Stratton Vanguard 200cc engine', 'Briggs Stratton Vanguard 570cc engine',
      'Briggs Stratton Vanguard 810cc engine', 'Briggs Stratton Vanguard 993cc engine',
      'Briggs Stratton Professional Series engine',
      'Briggs Stratton 7.0 HP engine', 'Briggs Stratton 10.5 HP engine',
      'Briggs Stratton model 9B900 engine',
    ],
  },

  { make: 'Kohler', category: 'engine', defaultType: 'Standalone Engine',
    categories: [],
    searches: [
      'Kohler CH395 engine', 'Kohler CH440 engine', 'Kohler SH265 engine',
      'Kohler Command Pro CH620 engine', 'Kohler Command Pro CH730 engine',
      'Kohler Command Pro CH740 engine', 'Kohler Command Pro CH960 engine',
      'Kohler Courage SV470 engine', 'Kohler Courage SV600 engine',
      'Kohler Confidant ZT720 engine', 'Kohler KT715 engine', 'Kohler KT745 engine',
      'Kohler ECV980 engine', 'Kohler KDW1003 diesel engine',
    ],
  },

  { make: 'Robin', category: 'engine', defaultType: 'Standalone Engine',
    categories: [],
    searches: [
      'Robin Subaru EX13 engine', 'Robin Subaru EX17 engine', 'Robin Subaru EX21 engine',
      'Robin Subaru EX27 engine', 'Robin Subaru EX35 engine', 'Robin Subaru EX40 engine',
      'Robin EH12 engine', 'Robin EH17 engine', 'Robin EH25 engine',
      'Subaru Robin engine OPE', 'Subaru EX engine series',
    ],
  },

  { make: 'Tecumseh', category: 'engine', defaultType: 'Standalone Engine',
    categories: [],
    searches: [
      'Tecumseh H35 engine', 'Tecumseh H50 engine', 'Tecumseh H60 engine',
      'Tecumseh HM80 engine', 'Tecumseh HM100 engine',
      'Tecumseh TVS90 engine', 'Tecumseh TVS115 engine', 'Tecumseh TVS840 engine',
      'Tecumseh LEV115 engine', 'Tecumseh OHH50 engine',
      'Tecumseh Lauson small engine',
    ],
  },

  { make: 'Lombardini', category: 'engine', defaultType: 'Standalone Engine',
    categories: [],
    searches: [
      'Lombardini LDW 702 diesel engine', 'Lombardini LDW 1003 diesel engine',
      'Lombardini 6LD400 engine', 'Lombardini 15LD440 engine',
      'Lombardini diesel engine',
    ],
  },

  // ━━ MARINE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  { make: 'Yamaha', category: 'marine', defaultType: 'Outboard Motor',
    categories: ['Yamaha outboard motors'],
    searches: [
      'Yamaha F2.5 outboard', 'Yamaha F4 outboard', 'Yamaha F6 outboard',
      'Yamaha F8 outboard', 'Yamaha F9.9 outboard', 'Yamaha F15 outboard',
      'Yamaha F20 outboard', 'Yamaha F25 outboard', 'Yamaha F40 outboard',
      'Yamaha F50 outboard', 'Yamaha F70 outboard', 'Yamaha F90 outboard',
      'Yamaha F115 outboard', 'Yamaha F150 outboard', 'Yamaha F200 outboard',
      'Yamaha F225 outboard', 'Yamaha F250 outboard', 'Yamaha F300 outboard',
      'Yamaha F350 outboard',
      'Yamaha EF1000iS generator', 'Yamaha EF2000iS generator',
      'Yamaha EF6300iSDE generator',
    ],
  },

  { make: 'Mercury Marine', category: 'marine', defaultType: 'Outboard Motor',
    categories: [],
    searches: [
      'Mercury 2.5 HP outboard', 'Mercury 4 HP outboard', 'Mercury 5 HP outboard',
      'Mercury 6 HP outboard', 'Mercury 8 HP outboard', 'Mercury 9.9 HP outboard',
      'Mercury 15 HP outboard', 'Mercury 20 HP outboard', 'Mercury 25 HP outboard',
      'Mercury 30 HP outboard', 'Mercury 40 HP outboard', 'Mercury 50 HP outboard',
      'Mercury 60 HP outboard', 'Mercury 75 HP outboard', 'Mercury 90 HP outboard',
      'Mercury 115 HP outboard', 'Mercury 150 HP outboard', 'Mercury 200 HP outboard',
      'Mercury 225 HP outboard', 'Mercury 250 HP outboard', 'Mercury 300 HP outboard',
      'Mercury Verado 350 outboard', 'Mercury Verado 400R outboard',
      'Mercury FourStroke outboard engine',
    ],
  },

  { make: 'Evinrude', category: 'marine', defaultType: 'Outboard Motor',
    categories: ['Evinrude outboard motors'],
    searches: [
      'Evinrude E-TEC 25 outboard', 'Evinrude E-TEC 40 outboard',
      'Evinrude E-TEC 60 outboard', 'Evinrude E-TEC 90 outboard',
      'Evinrude E-TEC 115 outboard', 'Evinrude E-TEC 150 outboard',
      'Evinrude E-TEC G2 200 outboard', 'Evinrude E-TEC G2 250 outboard',
      'Evinrude E-TEC G2 300 outboard',
      'Evinrude outboard motor history',
    ],
  },

  { make: 'Johnson', category: 'marine', defaultType: 'Outboard Motor',
    categories: [],
    searches: [
      'Johnson 9.9 HP outboard', 'Johnson 25 HP outboard', 'Johnson 40 HP outboard',
      'Johnson 50 HP outboard', 'Johnson 90 HP outboard', 'Johnson 115 HP outboard',
      'Johnson 150 HP outboard', 'Johnson 200 HP outboard',
      'Johnson outboard motor model',
    ],
  },

  { make: 'Tohatsu', category: 'marine', defaultType: 'Outboard Motor',
    categories: [],
    searches: [
      'Tohatsu MFS2.5 outboard', 'Tohatsu MFS5 outboard', 'Tohatsu MFS9.8 outboard',
      'Tohatsu MFS20 outboard', 'Tohatsu MFS40 outboard', 'Tohatsu MFS60 outboard',
      'Tohatsu MFS90 outboard', 'Tohatsu MFS115 outboard', 'Tohatsu MFS140 outboard',
      'Tohatsu BFT250D outboard', 'Tohatsu outboard motor',
    ],
  },

  { make: 'Suzuki', category: 'marine', defaultType: 'Outboard Motor',
    categories: [],
    searches: [
      'Suzuki DF2.5 outboard', 'Suzuki DF6 outboard', 'Suzuki DF9.9 outboard',
      'Suzuki DF15 outboard', 'Suzuki DF25 outboard', 'Suzuki DF40 outboard',
      'Suzuki DF60 outboard', 'Suzuki DF90 outboard', 'Suzuki DF115 outboard',
      'Suzuki DF140 outboard', 'Suzuki DF175 outboard', 'Suzuki DF200 outboard',
      'Suzuki DF250 outboard', 'Suzuki DF300 outboard', 'Suzuki DF350 outboard',
      'Suzuki marine outboard 4-stroke',
    ],
  },

  // ━━ MOTORCYCLES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  { make: 'Honda', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: ['Honda motorcycles'],
    searches: [
      'Honda CBR1000RR-R Fireblade', 'Honda CBR600RR motorcycle',
      'Honda CB1000R motorcycle', 'Honda CB650R motorcycle', 'Honda CB500F motorcycle',
      'Honda CBR500R motorcycle', 'Honda CBR300R motorcycle', 'Honda CB125R motorcycle',
      'Honda Africa Twin CRF1100L', 'Honda CRF450L motorcycle',
      'Honda CRF250L motorcycle', 'Honda CRF300L motorcycle',
      'Honda Gold Wing GL1800', 'Honda NT1100 motorcycle',
      'Honda NC750X motorcycle', 'Honda NC750S motorcycle',
      'Honda XL750 Transalp', 'Honda XL1000V Varadero',
      'Honda Monkey 125 motorcycle', 'Honda Super Cub C125',
      'Honda Grom MSX125', 'Honda PCX125 scooter', 'Honda Forza 350 scooter',
      'Honda CMX500 Rebel motorcycle', 'Honda CMX1100 Rebel',
      'Honda Shadow 750 motorcycle', 'Honda VFR800F motorcycle',
      'Honda Hornet 750 motorcycle',
    ],
  },

  { make: 'Yamaha', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: ['Yamaha motorcycles'],
    searches: [
      'Yamaha YZF-R1 motorcycle', 'Yamaha YZF-R6 motorcycle', 'Yamaha YZF-R7 motorcycle',
      'Yamaha MT-10 motorcycle', 'Yamaha MT-09 motorcycle', 'Yamaha MT-07 motorcycle',
      'Yamaha MT-03 motorcycle', 'Yamaha MT-125 motorcycle',
      'Yamaha Ténéré 700 motorcycle', 'Yamaha Ténéré 1200 motorcycle',
      'Yamaha XSR900 motorcycle', 'Yamaha XSR700 motorcycle',
      'Yamaha XMAX 300 scooter', 'Yamaha NMAX 155 scooter', 'Yamaha TMAX 560 scooter',
      'Yamaha V-Star 950 motorcycle', 'Yamaha V-Star 1300 motorcycle',
      'Yamaha VMAX motorcycle', 'Yamaha FJR1300 motorcycle',
      'Yamaha YZ450F motocross', 'Yamaha WR450F enduro', 'Yamaha YZ250F',
      'Yamaha WR250R dual sport',
    ],
  },

  { make: 'Kawasaki', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: ['Kawasaki motorcycles'],
    searches: [
      'Kawasaki Ninja ZX-10R motorcycle', 'Kawasaki Ninja ZX-6R motorcycle',
      'Kawasaki Ninja ZX-14R motorcycle', 'Kawasaki Ninja H2 motorcycle',
      'Kawasaki Ninja 650 motorcycle', 'Kawasaki Ninja 400 motorcycle',
      'Kawasaki Z1000 motorcycle', 'Kawasaki Z900 motorcycle', 'Kawasaki Z650 motorcycle',
      'Kawasaki Versys 1000 motorcycle', 'Kawasaki Versys 650 motorcycle',
      'Kawasaki Vulcan S 650 motorcycle', 'Kawasaki Vulcan 900 motorcycle',
      'Kawasaki KLR650 dual sport', 'Kawasaki KX450 motocross', 'Kawasaki KX250 motocross',
      'Kawasaki W800 motorcycle', 'Kawasaki Eliminator 500 motorcycle',
    ],
  },

  { make: 'Suzuki', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: ['Suzuki motorcycles'],
    searches: [
      'Suzuki GSX-R1000 motorcycle', 'Suzuki GSX-R750 motorcycle',
      'Suzuki GSX-R600 motorcycle', 'Suzuki GSX-S1000 motorcycle',
      'Suzuki GSX-S750 motorcycle', 'Suzuki GSX-8S motorcycle',
      'Suzuki V-Strom 1050 motorcycle', 'Suzuki V-Strom 650 motorcycle',
      'Suzuki V-Strom 250 motorcycle', 'Suzuki SV650 motorcycle',
      'Suzuki Hayabusa GSX1300R', 'Suzuki Boulevard M109R',
      'Suzuki DR650 dual sport', 'Suzuki RMZ450 motocross',
      'Suzuki Burgman 400 scooter', 'Suzuki Katana 1000 motorcycle',
    ],
  },

  { make: 'KTM', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: ['KTM motorcycles'],
    searches: [
      'KTM 1290 Super Duke R', 'KTM 1290 Super Adventure S',
      'KTM 890 Duke motorcycle', 'KTM 890 Adventure motorcycle',
      'KTM 790 Adventure motorcycle', 'KTM 790 Duke motorcycle',
      'KTM 690 Enduro R motorcycle', 'KTM 690 Duke motorcycle',
      'KTM 500 EXC-F enduro', 'KTM 450 SX-F motocross',
      'KTM 350 EXC-F enduro', 'KTM 300 EXC two-stroke',
      'KTM 250 SX-F motocross', 'KTM 125 SX motocross',
      'KTM RC 390 motorcycle', 'KTM Duke 390 motorcycle',
      'KTM Freeride E-XC electric', 'KTM SX-E 5 electric',
    ],
  },

  { make: 'BMW', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: ['BMW motorcycles'],
    searches: [
      'BMW R 1250 GS motorcycle', 'BMW R 1250 RT motorcycle', 'BMW R 1250 RS motorcycle',
      'BMW S 1000 RR motorcycle', 'BMW S 1000 XR motorcycle', 'BMW S 1000 R motorcycle',
      'BMW F 900 XR motorcycle', 'BMW F 900 R motorcycle',
      'BMW F 850 GS motorcycle', 'BMW F 750 GS motorcycle',
      'BMW G 310 GS motorcycle', 'BMW G 310 R motorcycle',
      'BMW R nineT motorcycle', 'BMW R nineT Scrambler',
      'BMW M 1000 RR motorcycle', 'BMW M 1000 R motorcycle',
      'BMW K 1600 GTL motorcycle', 'BMW K 1600 Grand America',
      'BMW CE 04 electric scooter',
    ],
  },

  { make: 'Ducati', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: ['Ducati motorcycles'],
    searches: [
      'Ducati Panigale V4 motorcycle', 'Ducati Panigale V4 S',
      'Ducati Panigale V2 motorcycle', 'Ducati Streetfighter V4',
      'Ducati Multistrada V4 motorcycle', 'Ducati Multistrada 1260',
      'Ducati Monster 1200 motorcycle', 'Ducati Monster 937 motorcycle',
      'Ducati Scrambler 1100 motorcycle', 'Ducati Scrambler 800',
      'Ducati Hypermotard 950 motorcycle', 'Ducati SuperSport 950',
      'Ducati Diavel 1260 motorcycle', 'Ducati XDiavel motorcycle',
      'Ducati DesertX motorcycle',
    ],
  },

  { make: 'Triumph', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: ['Triumph motorcycles'],
    searches: [
      'Triumph Street Triple RS motorcycle', 'Triumph Street Triple R motorcycle',
      'Triumph Speed Triple 1200 RS', 'Triumph Tiger 900 motorcycle',
      'Triumph Tiger 1200 motorcycle', 'Triumph Tiger Sport 660',
      'Triumph Bonneville T120 motorcycle', 'Triumph Bonneville T100',
      'Triumph Thruxton RS motorcycle', 'Triumph Scrambler 1200 XE',
      'Triumph Rocket 3 motorcycle', 'Triumph Daytona 660 motorcycle',
      'Triumph Trident 660 motorcycle', 'Triumph Tiger 660 Sport',
      'Triumph Speed Twin 1200 motorcycle',
    ],
  },

  { make: 'Harley-Davidson', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: ['Harley-Davidson motorcycles'],
    searches: [
      'Harley-Davidson Street Glide motorcycle', 'Harley-Davidson Road Glide',
      'Harley-Davidson CVO Street Glide', 'Harley-Davidson Electra Glide Ultra',
      'Harley-Davidson Fat Boy motorcycle', 'Harley-Davidson Fat Bob',
      'Harley-Davidson Softail Standard', 'Harley-Davidson Heritage Classic',
      'Harley-Davidson Sportster S motorcycle', 'Harley-Davidson Nightster',
      'Harley-Davidson Pan America 1250 ADV', 'Harley-Davidson Bronx streetfighter',
      'Harley-Davidson Low Rider ST', 'Harley-Davidson Breakout',
      'Harley-Davidson Milwaukee-Eight engine',
    ],
  },

  { make: 'Aprilia', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: ['Aprilia motorcycles'],
    searches: [
      'Aprilia RSV4 motorcycle', 'Aprilia RS 660 motorcycle',
      'Aprilia Tuono V4 motorcycle', 'Aprilia Tuono 660 motorcycle',
      'Aprilia Tuareg 660 adventure motorcycle',
      'Aprilia SR GT 200 scooter', 'Aprilia SXR 160 scooter',
      'Aprilia Shiver 900 motorcycle', 'Aprilia Dorsoduro 900',
    ],
  },

  { make: 'Indian', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: ['Indian motorcycles'],
    searches: [
      'Indian Scout motorcycle', 'Indian Scout Bobber',
      'Indian Chief motorcycle', 'Indian Chieftain motorcycle',
      'Indian Pursuit motorcycle', 'Indian Springfield motorcycle',
      'Indian Challenger motorcycle', 'Indian Roadmaster motorcycle',
      'Indian FTR 1200 motorcycle', 'Indian Sport Chief',
    ],
  },

  { make: 'Royal Enfield', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: ['Royal Enfield motorcycles'],
    searches: [
      'Royal Enfield Classic 350 motorcycle', 'Royal Enfield Meteor 350',
      'Royal Enfield Bullet 350 motorcycle', 'Royal Enfield Hunter 350',
      'Royal Enfield Himalayan motorcycle', 'Royal Enfield Scram 411',
      'Royal Enfield Interceptor 650', 'Royal Enfield Continental GT 650',
      'Royal Enfield Super Meteor 650', 'Royal Enfield Shotgun 650',
    ],
  },

  { make: 'Moto Guzzi', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: ['Moto Guzzi motorcycles'],
    searches: [
      'Moto Guzzi V7 motorcycle', 'Moto Guzzi V9 Bobber motorcycle',
      'Moto Guzzi V85 TT motorcycle', 'Moto Guzzi V100 Mandello',
      'Moto Guzzi 850 Le Mans motorcycle', 'Moto Guzzi California 1400',
      'Moto Guzzi Stelvio motorcycle',
    ],
  },

  { make: 'MV Agusta', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: ['MV Agusta motorcycles'],
    searches: [
      'MV Agusta F4 motorcycle', 'MV Agusta F3 800 motorcycle',
      'MV Agusta Brutale 1000 motorcycle', 'MV Agusta Turismo Veloce 800',
      'MV Agusta Dragster 800 motorcycle', 'MV Agusta Superveloce 800',
      'MV Agusta Rush 1000 motorcycle',
    ],
  },

  { make: 'Benelli', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: ['Benelli motorcycles'],
    searches: [
      'Benelli TRK 502 motorcycle', 'Benelli TRK 702 motorcycle',
      'Benelli 752S motorcycle', 'Benelli TNT 600 motorcycle',
      'Benelli Leoncino 500 motorcycle', 'Benelli 502C cruiser',
      'Benelli 302S motorcycle',
    ],
  },

  { make: 'Beta', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: ['Beta motorcycles'],
    searches: [
      'Beta RR 125 enduro', 'Beta RR 250 enduro', 'Beta RR 300 two-stroke enduro',
      'Beta RR 350 enduro', 'Beta RR 430 enduro', 'Beta RR 450 enduro',
      'Beta Xtrainer 300 motorcycle', 'Beta RX 300 enduro',
      'Beta EVO 300 trials motorcycle', 'Beta Alp 4.0 dual sport',
    ],
  },

  { make: 'GasGas', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: ['GasGas motorcycles'],
    searches: [
      'GasGas MC 450F motocross', 'GasGas MC 250F motocross',
      'GasGas MC 125 motocross', 'GasGas EX 300 enduro',
      'GasGas EC 250F enduro', 'GasGas EC 350F enduro',
      'GasGas TXT Racing 300 trials', 'GasGas ES 700 adventure motorcycle',
    ],
  },

  { make: 'Husqvarna', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: ['Husqvarna motorcycles'],
    searches: [
      'Husqvarna Norden 901 adventure motorcycle', 'Husqvarna Svartpilen 901',
      'Husqvarna Vitpilen 901 motorcycle', 'Husqvarna Svartpilen 701',
      'Husqvarna Vitpilen 701 motorcycle', 'Husqvarna Svartpilen 401',
      'Husqvarna FC 450 motocross', 'Husqvarna FC 350 motocross',
      'Husqvarna FE 501 enduro', 'Husqvarna FE 350 enduro',
      'Husqvarna TX 300 two-stroke enduro', 'Husqvarna TE 300 enduro',
      'Husqvarna EE 5 electric motocross',
    ],
  },

  { make: 'Sherco', category: 'motorcycle', defaultType: 'Motorcycle',
    categories: [],
    searches: [
      'Sherco SE 300 Racing enduro', 'Sherco SE 450 Racing enduro',
      'Sherco SEF 300 Racing enduro', 'Sherco SEF 450 Racing enduro',
      'Sherco Factory 300 Racing', 'Sherco 300 SEF-R Factory',
      'Sherco trials motorcycle', 'Sherco ST 250 trials',
    ],
  },

  // ━━ ATV / POWERSPORTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  { make: 'Polaris', category: 'atv', defaultType: 'Quad Bike',
    categories: ['Polaris Inc. vehicles', 'Polaris snowmobiles'],
    searches: [
      'Polaris Sportsman 850 ATV', 'Polaris Sportsman 570 ATV',
      'Polaris Sportsman XP 1000 ATV', 'Polaris Scrambler XP 1000',
      'Polaris RZR XP 1000 side by side', 'Polaris RZR Pro XP',
      'Polaris Ranger 1000 UTV', 'Polaris Ranger XP 900 UTV',
      'Polaris General 1000 UTV', 'Polaris Ace 500 ATV',
      'Polaris 850 Indy snowmobile', 'Polaris 650 Rush Pro-S snowmobile',
      'Polaris RMK 850 snowmobile', 'Polaris Titan XC snowmobile',
      'Polaris Slingshot roadster',
    ],
  },

  { make: 'Can-Am', category: 'atv', defaultType: 'Quad Bike',
    categories: ['Can-Am off-road vehicles'],
    searches: [
      'Can-Am Outlander 1000R ATV', 'Can-Am Outlander 850 ATV',
      'Can-Am Outlander 570 ATV', 'Can-Am Outlander 450 ATV',
      'Can-Am Renegade 1000R ATV', 'Can-Am Renegade 570 ATV',
      'Can-Am DS 450 ATV', 'Can-Am Maverick X3 side by side',
      'Can-Am Maverick Trail 1000 UTV', 'Can-Am Defender 1000 UTV',
      'Can-Am Defender Max UTV', 'Can-Am Spyder RT roadster',
      'Can-Am Ryker 900 roadster',
    ],
  },

  { make: 'Arctic Cat', category: 'atv', defaultType: 'Quad Bike',
    categories: ['Arctic Cat snowmobiles'],
    searches: [
      'Arctic Cat Wildcat XX UTV', 'Arctic Cat Alterra 700 ATV',
      'Arctic Cat ZR 9000 Thundercat snowmobile', 'Arctic Cat M 8000 snowmobile',
      'Arctic Cat XF 8000 snowmobile', 'Arctic Cat Riot 850 snowmobile',
      'Arctic Cat ATV model', 'Textron Off Road Prowler',
    ],
  },

  { make: 'Ski-Doo', category: 'atv', defaultType: 'Snowmobile',
    categories: ['Ski-Doo snowmobiles'],
    searches: [
      'Ski-Doo MXZ 850 E-TEC snowmobile', 'Ski-Doo Summit 850 snowmobile',
      'Ski-Doo Renegade 900 Ace Turbo', 'Ski-Doo Expedition 1200 4-TEC',
      'Ski-Doo Freeride 850 snowmobile', 'Ski-Doo Tundra snowmobile',
      'Ski-Doo Skandic WT snowmobile', 'Ski-Doo Grand Touring 600',
      'Ski-Doo Backcountry 850 snowmobile', 'Ski-Doo Lynx snowmobile',
    ],
  },

  { make: 'Sea-Doo', category: 'atv', defaultType: 'Jet Ski / PWC',
    categories: [],
    searches: [
      'Sea-Doo RXP-X 300 personal watercraft', 'Sea-Doo RXT-X 300',
      'Sea-Doo GTX 300 personal watercraft', 'Sea-Doo Spark personal watercraft',
      'Sea-Doo Spark Trixx', 'Sea-Doo GTI 130 personal watercraft',
      'Sea-Doo Fish Pro 170', 'Sea-Doo Switch pontoon',
      'Sea-Doo Wake Pro 230',
    ],
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const catLabel = CAT_FILTER === 'all' ? 'all categories' : `category: ${CAT_FILTER}`;
  console.log(`Wikipedia import — ${DRY_RUN ? 'DRY RUN' : 'LIVE'} — ${catLabel}${MAKE_FILTER ? ` — brand: ${MAKE_FILTER}` : ''}\n`);

  const existingSlugs = await fetchExistingSlugs();
  console.log(`Existing wiki entries: ${existingSlugs.size}\n`);

  let brands = BRANDS;
  if (MAKE_FILTER) brands = brands.filter(b => b.make.toLowerCase() === MAKE_FILTER.toLowerCase());
  if (CAT_FILTER !== 'all') brands = brands.filter(b => b.category === CAT_FILTER);

  let totalInserted = 0, totalSkipped = 0;

  for (const brand of brands) {
    console.log(`\n── ${brand.make} [${brand.category}] ──`);
    const titleSet = new Set();

    for (const cat of (brand.categories || [])) {
      try {
        const members = await getCategoryMembers(cat);
        members.forEach(t => titleSet.add(t));
        console.log(`  category "${cat}": ${members.length} pages`);
      } catch (e) {
        console.log(`  category "${cat}": ${e.message}`);
      }
      await delay(RATE_MS);
    }

    for (const q of (brand.searches || [])) {
      try {
        const results = await searchPages(q, 50);
        results.forEach(t => titleSet.add(t));
        console.log(`  search "${q}": ${results.length} results`);
      } catch (e) {
        console.log(`  search "${q}": ${e.message}`);
      }
      await delay(RATE_MS);
    }

    console.log(`  Candidate pages: ${titleSet.size}`);

    const rows = [];
    for (const title of titleSet) {
      try {
        const wikitext = await getPageWikitext(title);
        await delay(RATE_MS);
        if (!wikitext) continue;
        const pageRows = mapPage(title, wikitext, brand.make, brand.defaultType);
        if (pageRows.length) {
          rows.push(...pageRows);
          for (const r of pageRows)
            console.log(`  ✓ ${r.make} ${r.model} (${countSpecFields(r.specData)} fields)`);
        }
      } catch (e) {
        console.log(`  ! "${title}": ${e.message}`);
      }
    }

    if (rows.length) {
      const { inserted, skipped } = await batchInsert(rows, existingSlugs, { dryRun: DRY_RUN });
      totalInserted += inserted;
      totalSkipped  += skipped;
      console.log(`  → inserted: ${inserted}  skipped (dup): ${skipped}`);
    } else {
      console.log('  → no qualifying entries found');
    }
  }

  console.log(`\n── Complete ──`);
  console.log(`Total inserted: ${totalInserted}`);
  console.log(`Total skipped:  ${totalSkipped}`);
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
