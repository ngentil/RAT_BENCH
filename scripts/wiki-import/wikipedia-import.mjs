#!/usr/bin/env node
/**
 * Import machine specs from Wikipedia infoboxes into the RAT BENCH wiki.
 *
 * Usage:
 *   node scripts/wiki-import/wikipedia-import.mjs [--dry-run] [--make=Stihl]
 *
 * Options:
 *   --dry-run     Preview counts without writing to DB
 *   --make=NAME   Only process one brand (e.g. --make=Stihl)
 */

import { makeSlug, fetchExistingSlugs, batchInsert, delay } from './_shared.mjs';

const DRY_RUN     = process.argv.includes('--dry-run');
const MAKE_FILTER = (process.argv.find(a => a.startsWith('--make=')) || '').replace('--make=', '') || null;
const MIN_FIELDS  = 10;
const WIKI_API    = 'https://en.wikipedia.org/w/api.php';
const UA          = 'RatBenchBot/1.0 (https://ratbench.net; wiki data import) Node.js/22';
const RATE_MS     = 200;

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

async function getCategoryMembers(cat, limit = 500) {
  const d = await wikiGet({ action: 'query', list: 'categorymembers',
    cmtitle: `Category:${cat}`, cmlimit: String(limit), cmtype: 'page', cmnamespace: '0' });
  return (d.query?.categorymembers || []).map(r => r.title);
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
    // Walk to matching }}
    let depth = 0, i = start;
    while (i < wikitext.length - 1) {
      if (wikitext[i] === '{' && wikitext[i + 1] === '{')      { depth++; i += 2; }
      else if (wikitext[i] === '}' && wikitext[i + 1] === '}') { depth--; if (!depth) { i += 2; break; } i += 2; }
      else i++;
    }
    const block = wikitext.slice(start, i);
    // Parse | key = value lines; handle multi-line values
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
  // Engine size
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
  // Weight / dims
  weight: 'weightKg', dry_weight: 'weightKg', net_weight: 'weightKg', mass: 'weightKg',
  length: 'lengthMm', width: 'widthMm', height: 'heightMm',
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
  // Pump
  max_pressure: 'pumpPsi', flow_rate: 'pumpFlow',
};

const NUMERIC = new Set([
  'ccSize', 'boreDiameter', 'crankStroke', 'compressionRatio',
  'idleRpm', 'wotRpm', 'weightKg', 'fuelTankCapacity', 'plugGap',
  'barLength', 'chainDriveLinks', 'cylCount', 'sprocketTeethCS',
  'lengthMm', 'widthMm', 'heightMm', 'deckSize',
  'obGearRatio', 'pumpPsi', 'pumpFlow',
]);

function extractNum(s) {
  const m = String(s || '').match(/(\d[\d,]*\.?\d*)/);
  if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

function normalizeChainPitch(v) {
  if (!v) return null;
  if (/0\.404/.test(v)) return '0.404"';
  if (/0\.325/.test(v)) return '0.325"';
  if (/3\/8|0\.375/.test(v)) return '3/8"';
  return v;
}

function normalizeBarLength(v) {
  if (!v) return null;
  // Convert cm → inches
  if (/cm/i.test(v)) {
    const n = extractNum(v);
    return n ? String(Math.round(n / 2.54 * 2) / 2) : null;
  }
  return extractNum(v)?.toString() ?? null;
}

function normalizeStrokeType(v) {
  if (!v) return null;
  if (/4.?stroke|four.?stroke/i.test(v)) return '4-stroke';
  if (/2.?stroke|two.?stroke/i.test(v)) return '2-stroke';
  return null;
}

function normalizeCooling(v) {
  if (!v) return null;
  if (/air.*oil|oil.*air/i.test(v)) return 'Air + oil cooled';
  if (/air/i.test(v)) return 'Air-cooled';
  if (/water|liquid|fluid/i.test(v)) return 'Water-cooled';
  return v;
}

function normalizeStarter(v) {
  if (!v) return null;
  if (/recoil.*elec|elec.*recoil/i.test(v)) return 'Recoil + electric';
  if (/recoil|pull|manual/i.test(v)) return 'Recoil only';
  if (/electric|key.?start/i.test(v)) return 'Electric / key start only';
  return v;
}

function normalizeFuelSystem(v) {
  if (!v) return null;
  if (/carburet/i.test(v)) return 'Carburettor';
  if (/inject|efi|\bfi\b/i.test(v)) return 'Fuel Injected';
  return v;
}

// Infer type from infobox template name and/or which spec fields are populated
function detectType(templateName, data, defaultType) {
  if (/chainsaw/i.test(templateName))                      return 'Chainsaw';
  if (/outboard/i.test(templateName))                      return 'Outboard';
  if (/lawn.?mow|riding.?mow|mower/i.test(templateName))  return 'Lawnmower';
  if (/generator/i.test(templateName))                     return 'Generator';
  if (/pressure|washer/i.test(templateName))               return 'Pressure Washer';
  if (/tiller|cultivat/i.test(templateName))               return 'Tiller';
  if (/engine/i.test(templateName))                        return defaultType || 'Engine';
  if (/atv|quad|utv/i.test(templateName))                  return 'ATV';
  // Infer from populated fields
  if (data.barLength || data.chainPitchCS || data.chainDriveLinks) return 'Chainsaw';
  if (data.deckSize)                                        return 'Lawnmower';
  if (data.genVoltage || data.genHz)                        return 'Generator';
  if (data.obGearRatio || data.obShaftLength)               return 'Outboard';
  if (data.pumpPsi)                                         return 'Pressure Washer';
  return defaultType || 'Engine';
}

const IDENTITY_KEYS = new Set(['make', 'model', 'type', 'colour', 'year']);
function countSpecFields(data) {
  return Object.entries(data)
    .filter(([k, v]) => !IDENTITY_KEYS.has(k) && v !== null && v !== '' && v !== undefined)
    .length;
}

// ── Brand targets ─────────────────────────────────────────────────────────────

const BRANDS = [
  {
    make: 'Stihl',
    defaultType: 'Chainsaw',
    categories: ['Stihl products', 'Stihl chainsaws'],
    searches: [
      'Stihl MS 500i chainsaw', 'Stihl MS 661 chainsaw', 'Stihl MS 881 chainsaw',
      'Stihl MS 400 chainsaw', 'Stihl MS 271 chainsaw', 'Stihl MS 251 chainsaw',
      'Stihl MS 461 chainsaw', 'Stihl MSA chainsaw electric',
      'Stihl FS trimmer brushcutter', 'Stihl BR backpack blower',
      'Stihl BG handheld blower', 'Stihl KM kombisystem',
    ],
  },
  {
    make: 'Husqvarna',
    defaultType: 'Chainsaw',
    categories: ['Husqvarna AB products', 'Husqvarna chainsaws'],
    searches: [
      'Husqvarna 572 XP chainsaw', 'Husqvarna 565 chainsaw',
      'Husqvarna 550 XP Mark II', 'Husqvarna 455 Rancher chainsaw',
      'Husqvarna 450 chainsaw', 'Husqvarna 440 chainsaw',
      'Husqvarna 236 chainsaw', 'Husqvarna 130 chainsaw',
      'Husqvarna T540 XP arborist chainsaw',
      'Husqvarna 525 trimmer', 'Husqvarna 125B blower',
    ],
  },
  {
    make: 'Echo',
    defaultType: 'Chainsaw',
    categories: [],
    searches: [
      'Echo CS-590 Timber Wolf chainsaw', 'Echo CS-620P chainsaw',
      'Echo CS-400 chainsaw', 'Echo CS-310 chainsaw',
      'Echo SRM-225 trimmer', 'Echo SRM-266 trimmer',
      'Echo PB-8010 blower', 'Echo PB-580T blower',
      'Echo chainsaw power equipment',
    ],
  },
  {
    make: 'Honda',
    defaultType: 'Engine',
    categories: ['Honda engines'],
    searches: [
      'Honda GX200 engine', 'Honda GX390 engine', 'Honda GX120 engine',
      'Honda GX160 engine', 'Honda GX270 engine', 'Honda GX340 engine',
      'Honda GCV160 engine', 'Honda GCV190 engine', 'Honda GC160 engine',
      'Honda GXV160 engine', 'Honda GXV390 engine',
      'Honda GX35 engine', 'Honda GX50 engine',
      'Honda WB30 pump', 'Honda EU generator',
    ],
  },
  {
    make: 'Kawasaki',
    defaultType: 'Engine',
    categories: [],
    searches: [
      'Kawasaki FX850V engine', 'Kawasaki FX730V engine',
      'Kawasaki FR691V engine', 'Kawasaki FR651V engine',
      'Kawasaki FJ180V engine', 'Kawasaki FS481V engine',
      'Kawasaki small engine lawn mower',
    ],
  },
  {
    make: 'Briggs & Stratton',
    defaultType: 'Engine',
    categories: ['Briggs & Stratton engines'],
    searches: [
      'Briggs Stratton Vanguard 810cc engine', 'Briggs Stratton Intek engine',
      'Briggs Stratton 550E Series engine', 'Briggs Stratton 725EXi engine',
      'Briggs Stratton Professional Series engine',
      'Briggs Stratton small engine',
    ],
  },
  {
    make: 'Yamaha',
    defaultType: 'Outboard',
    categories: ['Yamaha outboard motors'],
    searches: [
      'Yamaha F70 outboard motor', 'Yamaha F115 outboard',
      'Yamaha F150 outboard', 'Yamaha F250 outboard',
      'Yamaha 4-stroke outboard motor', 'Yamaha portable outboard',
      'Yamaha EF generator', 'Yamaha engine',
    ],
  },
  {
    make: 'Makita',
    defaultType: 'Chainsaw',
    categories: [],
    searches: [
      'Makita DUC353Z chainsaw', 'Makita EA3201S chainsaw',
      'Makita DCS3410 chainsaw', 'Makita DCS5121 chainsaw',
      'Makita chainsaw power tool',
    ],
  },
  {
    make: 'Poulan',
    defaultType: 'Chainsaw',
    categories: [],
    searches: [
      'Poulan Pro PR5020AV chainsaw', 'Poulan Pro PP5020AV',
      'Poulan Wild Thing chainsaw', 'Poulan chainsaw model',
    ],
  },
  {
    make: 'McCulloch',
    defaultType: 'Chainsaw',
    categories: ['McCulloch chainsaws'],
    searches: ['McCulloch CS chainsaw', 'McCulloch Mac chainsaw'],
  },
  {
    make: 'Jonsered',
    defaultType: 'Chainsaw',
    categories: [],
    searches: ['Jonsered CS 2171 chainsaw', 'Jonsered chainsaw'],
  },
  {
    make: 'Dolmar',
    defaultType: 'Chainsaw',
    categories: [],
    searches: ['Dolmar PS-9010 chainsaw', 'Dolmar PS chainsaw'],
  },
  {
    make: 'Kohler',
    defaultType: 'Engine',
    categories: [],
    searches: [
      'Kohler Command Pro engine', 'Kohler Courage engine',
      'Kohler Confidant engine', 'Kohler KT745 engine',
    ],
  },
  {
    make: 'Robin',
    defaultType: 'Engine',
    categories: [],
    searches: ['Robin Subaru EX engine', 'Robin EH engine', 'Subaru Robin engine'],
  },
];

// ── Map one Wikipedia page → array of importable rows ─────────────────────────

function mapPage(title, wikitext, make, defaultType) {
  const rows = [];
  for (const { templateName, fields } of parseInfoboxes(wikitext)) {
    // Determine model name
    const rawName = fields.name || fields.model_name || fields.model || '';
    let model = clean(rawName) || title.replace(/\s*\([^)]*\)\s*/g, '').trim();
    // Strip make prefix (e.g. "Stihl MS 500i" → "MS 500i")
    const pfxRe = new RegExp('^' + make.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+', 'i');
    model = model.replace(pfxRe, '').trim();
    if (!model) continue;

    // Map infobox fields → spec data
    const specData = {};
    for (const [wkey, wval] of Object.entries(fields)) {
      if (!wval) continue;
      const sk = FIELD_MAP[wkey.toLowerCase().replace(/[\s\-]/g, '_')];
      if (!sk) continue;

      let v = wval;
      if (sk === 'strokeType')     v = normalizeStrokeType(v);
      else if (sk === 'coolingType')   v = normalizeCooling(v);
      else if (sk === 'starterType')   v = normalizeStarter(v);
      else if (sk === 'fuelSystem')    v = normalizeFuelSystem(v);
      else if (sk === 'chainPitchCS')  v = normalizeChainPitch(v);
      else if (sk === 'barLength')     v = normalizeBarLength(v);
      else if (sk === 'year') {
        const y = extractNum(clean(v));
        v = (y && y > 1950 && y < 2030) ? String(Math.floor(y)) : null;
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

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Wikipedia import — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}${MAKE_FILTER ? ` — brand: ${MAKE_FILTER}` : ''}\n`);

  const existingSlugs = await fetchExistingSlugs();
  console.log(`Existing wiki entries: ${existingSlugs.size}\n`);

  const brands = MAKE_FILTER
    ? BRANDS.filter(b => b.make.toLowerCase() === MAKE_FILTER.toLowerCase())
    : BRANDS;

  let totalInserted = 0, totalSkipped = 0;

  for (const brand of brands) {
    console.log(`\n── ${brand.make} ──`);
    const titleSet = new Set();

    for (const cat of brand.categories) {
      try {
        const members = await getCategoryMembers(cat);
        members.forEach(t => titleSet.add(t));
        console.log(`  category "${cat}": ${members.length} pages`);
      } catch (e) {
        console.log(`  category "${cat}": ${e.message}`);
      }
      await delay(RATE_MS);
    }

    for (const q of brand.searches) {
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
