# RAT BENCH Wiki Import Scripts

Bulk-import tens of thousands of machine entries into the wiki from free public data sources.

## Setup

1. Get your **Supabase service role key** from Supabase Dashboard → Project Settings → API → `service_role` (secret key).

2. Add it to your root `.env`:
   ```
   SUPABASE_SERVICE_KEY=eyJ...
   ```
   The scripts also read `VITE_SUPABASE_URL` from the same file automatically.

3. Run scripts from the **project root** (not from inside this folder):
   ```bash
   node scripts/wiki-import/nhtsa.mjs
   ```

---

## Scripts

### 1. NHTSA — Vehicles & Motorcycles
**Source:** [vpic.nhtsa.dot.gov](https://vpic.nhtsa.dot.gov/api/)
**Free, no download needed** — hits the API directly.
**Coverage:** ~100,000+ car, truck, and motorcycle make/model combinations (1981–present).

> Note: NHTSA gives make + model + type. It does not have engine specs.
> These entries act as skeletons users can fill in from their own machines.

```bash
# Import everything (cars, trucks, motorcycles, ATVs)
node scripts/wiki-import/nhtsa.mjs

# Motorcycles only
node scripts/wiki-import/nhtsa.mjs --type motorcycle

# Preview counts without inserting
node scripts/wiki-import/nhtsa.mjs --dry-run
```

**Expected time:** 2–4 hours for full import (rate limited to ~8 req/sec to be kind to NHTSA servers).

---

### 2. Kaggle — Motorcycle Technical Specs
**Source:** [Motorcycle Technical Specifications 1970–2022](https://www.kaggle.com/datasets/emmanuelfwerr/motorcycle-technical-specifications-19702022)
**Free** (requires free Kaggle account to download).
**Coverage:** ~10,000 motorcycles from 583 brands with full specs: bore, stroke, compression, cooling, transmission, weight, tyres, brakes.

**Setup:**
1. Download the dataset from Kaggle (click Download → CSV)
2. Save the CSV as `scripts/wiki-import/kaggle-motos.csv`

```bash
# Import all
node scripts/wiki-import/kaggle-motos.mjs

# Test with first 100 rows
node scripts/wiki-import/kaggle-motos.mjs --limit=100 --dry-run
```

**Expected time:** ~2 minutes for all 10k rows.

---

### 3. EPA — Small Engines
**Source:** [EPA Annual Certification Data](https://www.epa.gov/compliance-and-fuel-economy-data/annual-certification-data-vehicles-engines-and-equipment)
**Free.**
**Coverage:** Every small engine certified for sale in the US — Honda GX/GC, Briggs & Stratton, Kawasaki FJ/FX, Kohler, Yamaha, Robin, Tecumseh, and hundreds more.

**Setup:**
1. Go to the EPA page linked above
2. Scroll to "Nonroad Engines" section
3. Download "Small Nonroad SI Engines" Excel file
4. Open in Excel/LibreOffice → File → Save As → CSV
5. Save as `scripts/wiki-import/epa-engines.csv`

```bash
node scripts/wiki-import/epa-engines.mjs

# Dry run first to check column detection
node scripts/wiki-import/epa-engines.mjs --dry-run
```

---

## Recommended Import Order

```bash
# 1. Motorcycles with full specs (fastest, best data quality)
node scripts/wiki-import/kaggle-motos.mjs

# 2. Small engines
node scripts/wiki-import/epa-engines.mjs

# 3. Full vehicle/motorcycle skeleton from NHTSA (run overnight)
node scripts/wiki-import/nhtsa.mjs
```

---

## Notes

- All scripts are **idempotent** — re-running skips entries that already exist (matched by `make-model` slug).
- Entries are inserted with `created_by = null` and `username = "RAT BENCH Import"` in revision history.
- The `--dry-run` flag on any script prints counts without touching the database.
- If a script crashes mid-run, just re-run it — it will pick up where it left off.
- Column name detection is printed on startup — if mapping looks wrong, check the logged column list and adjust the script.
