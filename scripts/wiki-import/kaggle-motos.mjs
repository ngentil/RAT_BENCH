/**
 * Import motorcycle specs from the Kaggle "Motorcycle Technical Specifications 1970-2022" dataset.
 * https://www.kaggle.com/datasets/emmanuelfwerr/motorcycle-technical-specifications-19702022
 *
 * This dataset has full engine specs: bore, stroke, compression, fuel system, weight, tyres, etc.
 * ~10,000 motorcycles from 583 brands.
 *
 * Setup:
 *   1. Download the CSV from Kaggle (free account required)
 *   2. Save as: scripts/wiki-import/kaggle-motos.csv
 *   3. Run: node scripts/wiki-import/kaggle-motos.mjs
 *
 * Options:
 *   --dry-run     Preview counts without inserting
 *   --limit=500   Only import first N rows (useful for testing)
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { makeSlug, delay, fetchExistingSlugs, batchInsert } from './_shared.mjs';

const CSV_PATH = resolve(process.cwd(), 'scripts/wiki-import/kaggle-motos.csv');

const args     = process.argv.slice(2);
const dryRun   = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit    = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

// ── CSV parser ─────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1).map(line => {
    // Handle quoted fields with commas inside
    const cells = [];
    let cur = '';
    let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { cells.push(cur.trim()); cur = ''; }
      else { cur += ch; }
    }
    cells.push(cur.trim());
    return Object.fromEntries(headers.map((h, i) => [h, (cells[i] || '').replace(/^"|"$/g, '').trim()]));
  });
}

// Strip units from numeric strings: "249 cc" → "249cc", "66.4 mm" → "66.4mm"
function stripUnits(val, unit) {
  if (!val) return undefined;
  const n = parseFloat(val.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? undefined : `${n}${unit}`;
}

// Extract RPM from "XX hp @ YYY rpm" or "XX kW @ YYY rpm"
function extractRpm(val) {
  if (!val) return undefined;
  const m = val.match(/[@at]\s*([\d,]+)\s*rpm/i);
  return m ? `${m[1].replace(',', '')} RPM` : undefined;
}

// Extract power figure
function extractPower(val) {
  if (!val) return undefined;
  const m = val.match(/([\d.]+)\s*(hp|kw|ps|bhp)/i);
  return m ? `${m[1]} ${m[2].toUpperCase()}` : val.slice(0, 20);
}

// Infer stroke type from displacement / fuel mix text
function inferStroke(row) {
  const disp = (row.displacement || '').toLowerCase();
  const fuel  = (row.fuel_system || '').toLowerCase();
  if (fuel.includes('2-stroke') || fuel.includes('two-stroke') || disp.includes('2t')) return '2-stroke';
  if (fuel.includes('4-stroke') || fuel.includes('four-stroke') || disp.includes('4t')) return '4-stroke';
  return '4-stroke'; // most modern motorcycles
}

function mapRow(row) {
  const make  = (row.make || row.brand || '').trim();
  const model = (row.model || '').trim();
  if (!make || !model) return null;

  // Build spec data — only include fields with actual values
  const spec = {};

  const year = (row.year || row.model_year || '').trim();
  if (year) spec.year = year;

  const cc = stripUnits(row.displacement || row.engine_displacement, 'cc');
  if (cc) spec.ccSize = cc;

  spec.strokeType = inferStroke(row);

  const cylinders = (row.cylinders || row.cylinder || '').trim();
  if (cylinders) spec.cylCount = cylinders;

  const bore = stripUnits(row.bore_mm || row.bore, 'mm');
  if (bore) spec.boreDiameter = bore;

  const stroke = stripUnits(row.stroke_mm || row.stroke, 'mm');
  if (stroke) spec.crankStroke = stroke;

  const comp = (row.compression || row.compression_ratio || '').trim();
  if (comp) spec.compressionRatio = comp.includes(':') ? comp : comp + ':1';

  const cooling = (row.cooling || row.cooling_system || '').trim();
  if (cooling) spec.coolingType = cooling;

  const fuel = (row.fuel_system || row.fuel || '').trim();
  if (fuel) spec.fuelSystem = fuel.slice(0, 30);

  const tank = stripUnits(row.fuel_capacity || row.tank, 'L');
  if (tank) spec.fuelTankCapacity = tank;

  const power = (row.power || row.max_power || '').trim();
  if (power) {
    const rpm = extractRpm(power);
    if (rpm) spec.wotRpm = rpm;
  }

  const trans = (row.transmission || row.gearbox || '').trim();
  if (trans) spec.transType = trans.slice(0, 40);

  const weight = stripUnits(row.dry_weight || row.weight, 'kg');
  if (weight) spec.weightKg = weight.replace('kg', '');

  const tyreFront = (row.front_tire || row.tyre_front || row.front_tyre || '').trim();
  if (tyreFront) spec.tyreSizeFront = tyreFront;

  const tyreRear = (row.rear_tire || row.tyre_rear || row.rear_tyre || '').trim();
  if (tyreRear) spec.tyreSizeRear = tyreRear;

  const forkTravel = stripUnits(row.front_wheel_travel || row.fork_travel, 'mm');
  if (forkTravel) spec.forkTravel = forkTravel;

  const rearTravel = stripUnits(row.rear_wheel_travel || row.rear_travel, 'mm');
  if (rearTravel) spec.rearTravel = rearTravel;

  const frontBrake = (row.front_brakes || row.front_brake || '').trim();
  if (frontBrake) spec.frontBrakeType = frontBrake.slice(0, 40);

  const rearBrake = (row.rear_brakes || row.rear_brake || '').trim();
  if (rearBrake) spec.rearBrakeType = rearBrake.slice(0, 40);

  const starter = (row.starting || row.starter || '').trim();
  if (starter) spec.starterType = starter;

  return { make, model, type: 'Motorcycle', specData: spec, editSummary: 'Imported from Kaggle motorcycle dataset', source: 'Kaggle' };
}

async function run() {
  console.log(`\n🏍️   Kaggle Motorcycle Import${dryRun ? ' (DRY RUN)' : ''}`);

  let text;
  try {
    text = readFileSync(CSV_PATH, 'utf8');
  } catch {
    console.error(`❌  CSV not found at ${CSV_PATH}`);
    console.error('    Download from https://www.kaggle.com/datasets/emmanuelfwerr/motorcycle-technical-specifications-19702022');
    console.error('    Save as scripts/wiki-import/kaggle-motos.csv');
    process.exit(1);
  }

  const rows = parseCSV(text);
  console.log(`  ${rows.length} rows in CSV`);

  // Print detected headers on first run to help debug column name mismatches
  if (rows.length > 0) {
    console.log('  Detected columns:', Object.keys(rows[0]).join(', '));
  }

  const mapped = rows
    .slice(0, limit)
    .map(mapRow)
    .filter(Boolean);

  console.log(`  ${mapped.length} valid rows to process`);

  console.log('Fetching existing wiki slugs…');
  const existingSlugs = await fetchExistingSlugs();
  console.log(`  ${existingSlugs.size} entries already in wiki\n`);

  const result = await batchInsert(mapped, existingSlugs, { dryRun });

  console.log(`\n✅  Done: ${result.inserted} inserted, ${result.skipped} skipped\n`);
}

run().catch(e => { console.error(e); process.exit(1); });
