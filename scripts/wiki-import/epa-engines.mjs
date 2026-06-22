/**
 * Import small engine specs from the EPA Nonroad Small Spark-Ignition (NRSI) database.
 * https://www.epa.gov/compliance-and-fuel-economy-data/annual-certification-data-vehicles-engines-and-equipment
 *
 * Covers: Honda GX/GC, Briggs & Stratton, Kawasaki FJ/FX, Kohler Command/Courage,
 *         Yamaha, Robin/Subaru, Tecumseh, and hundreds more certified small engines.
 *
 * Setup:
 *   1. Go to https://www.epa.gov/compliance-and-fuel-economy-data/annual-certification-data-vehicles-engines-and-equipment
 *   2. Under "Nonroad Engines" → download "Small Nonroad SI Engines" CSV or Excel
 *   3. Export/save as CSV: scripts/wiki-import/epa-engines.csv
 *   4. Run: node scripts/wiki-import/epa-engines.mjs
 *
 * Options:
 *   --dry-run     Preview counts without inserting
 *   --limit=200   Only import first N rows
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { makeSlug, fetchExistingSlugs, batchInsert } from './_shared.mjs';

const CSV_PATH = resolve(process.cwd(), 'scripts/wiki-import/epa-engines.csv');

const args     = process.argv.slice(2);
const dryRun   = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit    = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase().replace(/[\s/]+/g, '_'));
  return lines.slice(1).map(line => {
    const cells = [];
    let cur = ''; let inQ = false;
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === ',' && !inQ) { cells.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    cells.push(cur.trim());
    return Object.fromEntries(headers.map((h, i) => [h, (cells[i] || '').replace(/^"|"$/g, '').trim()]));
  });
}

// Infer RAT BENCH machine type from EPA engine family/application description
function inferType(row) {
  const desc = [row.application, row.engine_family, row.equipment_type, row.subcategory]
    .filter(Boolean).join(' ').toLowerCase();
  if (desc.includes('chain') || desc.includes('saw')) return 'Chainsaw';
  if (desc.includes('generator') || desc.includes('genset')) return 'Generator';
  if (desc.includes('pressure') || desc.includes('washer')) return 'Pressure Washer';
  if (desc.includes('outboard') || desc.includes('marine')) return 'Outboard Motor';
  if (desc.includes('trimmer') || desc.includes('brushcutter') || desc.includes('string')) return 'Trimmer';
  if (desc.includes('blower') || desc.includes('vacuu')) return 'Blower';
  if (desc.includes('tiller') || desc.includes('cultivat')) return 'Custom';
  if (desc.includes('mower') || desc.includes('lawn')) return 'Lawnmower';
  return 'Lawnmower'; // default: most NRSI engines end up in mowers
}

// Convert displacement: EPA uses litres or cubic inches — normalise to cc
function normaliseCc(val) {
  if (!val) return undefined;
  const n = parseFloat(val.replace(/[^0-9.]/g, ''));
  if (isNaN(n)) return undefined;
  const low = val.toLowerCase();
  if (low.includes('l') || (n < 5)) return `${Math.round(n * 1000)}cc`;   // litres → cc
  if (low.includes('ci') || low.includes('in')) return `${Math.round(n * 16.387)}cc`; // ci → cc
  return `${Math.round(n)}cc`; // assume already cc
}

function mapRow(row) {
  // Try common EPA column name patterns
  const manufacturer = (
    row.manufacturer_name || row.manufacturer || row.mfr_name || row.mfr || ''
  ).trim();

  const engineFamily = (
    row.engine_family_name || row.engine_family || row.family_name || row.family || row.model || ''
  ).trim();

  if (!manufacturer || !engineFamily) return null;

  const spec = {};

  const year = (row.model_year || row.year || '').trim();
  if (year) spec.year = year;

  const cc = normaliseCc(row.displacement || row.disp || row.engine_displacement || '');
  if (cc) spec.ccSize = cc;

  // EPA NRSI is all 4-stroke spark-ignition
  spec.strokeType = '4-stroke';
  spec.coolingType = 'Air-cooled';
  spec.fuelSystem = 'Carburettor';

  const hp = (row.rated_hp || row.hp || row.max_power || row.net_power || '').trim();
  if (hp) spec.notes = `Rated power: ${hp} HP`;

  return {
    make:        manufacturer,
    model:       engineFamily,
    type:        inferType(row),
    specData:    spec,
    editSummary: 'Imported from EPA NRSI certification database',
    source:      'EPA',
  };
}

async function run() {
  console.log(`\n🔧  EPA Small Engine Import${dryRun ? ' (DRY RUN)' : ''}`);

  let text;
  try {
    text = readFileSync(CSV_PATH, 'utf8');
  } catch {
    console.error(`❌  CSV not found at ${CSV_PATH}`);
    console.error('    Download from:');
    console.error('    https://www.epa.gov/compliance-and-fuel-economy-data/annual-certification-data-vehicles-engines-and-equipment');
    console.error('    Look for "Small Nonroad SI Engines" → export as CSV');
    console.error('    Save as scripts/wiki-import/epa-engines.csv');
    process.exit(1);
  }

  const rows = parseCSV(text);
  console.log(`  ${rows.length} rows in CSV`);
  if (rows.length > 0) console.log('  Detected columns:', Object.keys(rows[0]).join(', '));

  const mapped = rows.slice(0, limit).map(mapRow).filter(Boolean);

  // Deduplicate by manufacturer + engine family (EPA has duplicate rows across model years)
  const seen = new Set();
  const deduped = mapped.filter(r => {
    const key = makeSlug(r.make, r.model);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`  ${mapped.length} valid rows → ${deduped.length} after dedup`);

  console.log('Fetching existing wiki slugs…');
  const existingSlugs = await fetchExistingSlugs();
  console.log(`  ${existingSlugs.size} entries already in wiki\n`);

  const result = await batchInsert(deduped, existingSlugs, { dryRun });

  console.log(`\n✅  Done: ${result.inserted} inserted, ${result.skipped} skipped\n`);
}

run().catch(e => { console.error(e); process.exit(1); });
