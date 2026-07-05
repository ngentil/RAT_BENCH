// Build-time static prerender for the public wiki (SEO).
//
// Runs after `vite build` (see the "prerender" npm script / netlify.toml). For
// every non-sample wiki entry it writes dist/<slug>.html — a copy of the built
// index.html with a real <title>, meta/OpenGraph/canonical tags, and a
// crawler-visible spec block injected into #root. Netlify serves these static
// files at /<slug>; the SPA still boots and takes over for humans, so this adds
// SEO without changing the app runtime. Also emits dist/sitemap.xml.
//
// Robust by design: if Supabase env is missing or the fetch fails, it logs and
// exits 0 so the Netlify build still succeeds and deploys the SPA unchanged.
//
// Freshness: this is a build-time snapshot. New/edited entries appear after the
// next deploy — trigger a Netlify build on publish (or nightly) to keep current.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const WIKI_ORIGIN = 'https://wiki.ratbench.net';

// Slugs that would shadow real app/SPA routes or build assets — never prerender.
const RESERVED = new Set([
  'index', 'terms', 'privacy', 'data-retention', 'm', 'assets', 'sw',
  'registerSW', 'manifest', 'sitemap', 'robots', 'favicon', 'workbox',
]);

// Compact label map for the most useful spec fields (mirrors WIKI_FIELD_LABELS);
// unmapped keys fall back to a prettified camelCase → Title Case.
const LABELS = {
  year: 'Year', serial: 'Serial No.', colour: 'Colour',
  strokeType: 'Engine Type', ccSize: 'Engine CC', compression: 'Compression (PSI)',
  compressionRatio: 'Compression Ratio', idleRpm: 'Idle RPM', wotRpm: 'WOT RPM',
  cylCount: 'Cylinders', firingOrder: 'Firing Order', valveTrain: 'Valve Train',
  camType: 'Cam Type', intakeValveClear: 'Intake Valve Clear (mm)',
  exhaustValveClear: 'Exhaust Valve Clear (mm)', plugType: 'Spark Plug',
  plugGap: 'Plug Gap (mm)', coilType: 'Coil Type', starterType: 'Starter Type',
  fuelSystem: 'Fuel System', mixRatio: 'Fuel Mix Ratio', fuelTankCapacity: 'Fuel Tank (L)',
  coolingType: 'Cooling', boreDiameter: 'Bore (mm)', crankStroke: 'Stroke (mm)',
  pistonDiameter: 'Piston (mm)', barLength: 'Bar Length (in)', chainPitchCS: 'Chain Pitch',
  deckSize: 'Deck Size (in)', bladeLength: 'Blade Length (mm)', driveType: 'Drive Type',
  transType: 'Transmission', clutchType: 'Clutch', wotPower: 'Max Power',
  torqueNm: 'Max Torque (N·m)', topSpeed: 'Top Speed', weightKg: 'Weight (kg)',
  engineOilGrade: 'Engine Oil', oilChangeInterval: 'Oil Change Interval',
};
const prettify = k => k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim();
const labelFor = k => LABELS[k] || prettify(k);

// Fields never worth showing to a crawler (internal/owner/array/object noise)
const SKIP_KEYS = new Set([
  'id', 'userId', 'companyId', 'clientId', 'make', 'model', 'type', 'slug',
  'photos', 'iPPhotos', 'ePPhotos', 'jobPhotos', 'parts', 'timeLog', 'jobTimers',
  'notes', 'carbSpec', 'chipperSpec', 'stumpGrinderSpec', 'tileFields', 'tileColors',
  'expandFields', 'customSections', 'fasteners', 'studs', 'bearings', 'lighting',
  'belts', 'batteries', 'hydRams', 'attachments', 'fuseBoxes',
]);

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Build the head-meta + #root content and splice into the built index.html.
export function buildEntryHtml(template, entry) {
  const { slug, make, model, type, data = {} } = entry;
  const titleName = [make, model].filter(Boolean).join(' ') || slug;
  const canonical = `${WIKI_ORIGIN}/${slug}`;
  const pageTitle = `${titleName}${type ? ` ${type}` : ''} — Specs & Repair Reference | Rat Bench Wiki`;

  // Spec rows for the crawler-visible block
  const specRows = Object.entries(data)
    .filter(([k, v]) => !SKIP_KEYS.has(k) && v != null && v !== '' && v !== false
      && typeof v !== 'object')
    .slice(0, 40)
    .map(([k, v]) => `<div class="spec"><dt>${esc(labelFor(k))}</dt><dd>${esc(v)}</dd></div>`)
    .join('');

  // Meta description — a few key specs so search snippets are useful (~160 chars)
  const keyBits = ['ccSize', 'strokeType', 'plugType', 'plugGap', 'wotPower']
    .map(k => data[k] ? `${labelFor(k)}: ${data[k]}` : null).filter(Boolean).slice(0, 3).join(' · ');
  const desc = `${titleName}${type ? ` (${type})` : ''} specifications${keyBits ? ` — ${keyBits}` : ''}. `
    + `Community-maintained specs and repair reference on Rat Bench.`;
  const descClamped = desc.length > 300 ? desc.slice(0, 297) + '…' : desc;

  const head = `
    <title>${esc(pageTitle)}</title>
    <meta name="description" content="${esc(descClamped)}" />
    <link rel="canonical" href="${esc(canonical)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Rat Bench Wiki" />
    <meta property="og:title" content="${esc(titleName)} — Specs & Repair Reference" />
    <meta property="og:description" content="${esc(descClamped)}" />
    <meta property="og:url" content="${esc(canonical)}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${esc(titleName)} — Rat Bench Wiki" />
    <meta name="twitter:description" content="${esc(descClamped)}" />`;

  const rootContent = `<article class="seo-prerender">
      <h1>${esc(titleName)}</h1>
      <p>${esc([type, data.year].filter(Boolean).join(' · '))}</p>
      ${specRows ? `<dl>${specRows}</dl>` : ''}
      <p>Community-maintained machine specifications on the Rat Bench Wiki.</p>
    </article>`;

  // Splice: replace <title>, inject meta before </head>, fill #root.
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, '') // drop the generic title
    .replace('</head>', `${head}\n  </head>`)
    .replace(/<div id="root">\s*<\/div>/, `<div id="root">${rootContent}</div>`);
  return html;
}

function xmlSitemap(entries) {
  const urls = [WIKI_ORIGIN + '/', ...entries.map(e => `${WIKI_ORIGIN}/${e.slug}`)]
    .map(u => `  <url><loc>${esc(u)}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function fetchEntries() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('[prerender] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — skipping wiki prerender.');
    return null;
  }
  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(url, key);
  const { data: entries, error } = await sb.from('wiki_entries')
    .select('id,slug,make,model,type,current_rev_id')
    .eq('is_sample', false).limit(5000);
  if (error) throw error;
  const revIds = entries.map(e => e.current_rev_id).filter(Boolean);
  const revMap = {};
  for (let i = 0; i < revIds.length; i += 500) {
    const { data: revs } = await sb.from('wiki_revisions')
      .select('id,data').in('id', revIds.slice(i, i + 500));
    (revs || []).forEach(r => { revMap[r.id] = r.data || {}; });
  }
  return entries.map(e => ({ ...e, data: revMap[e.current_rev_id] || {} }));
}

async function main() {
  // Self-test path: exercise templating locally with no network/env.
  if (process.env.PRERENDER_SELFTEST === '1') {
    const template = readFileSync(join(DIST, 'index.html'), 'utf8');
    const html = buildEntryHtml(template, {
      slug: 'stihl-ms-441', make: 'Stihl', model: 'MS 441', type: 'Chainsaw',
      data: { ccSize: '70.7', strokeType: '2-Stroke', plugType: 'NGK BPMR7A', plugGap: '0.5', barLength: '20', year: '2012' },
    });
    writeFileSync(join(DIST, '__prerender_selftest.html'), html);
    console.log('[prerender] self-test page written to dist/__prerender_selftest.html');
    return;
  }

  let entries;
  try {
    entries = await fetchEntries();
  } catch (e) {
    console.warn('[prerender] fetch failed — skipping wiki prerender (SPA still deploys):', e.message);
    return;
  }
  if (!entries) return;

  const template = readFileSync(join(DIST, 'index.html'), 'utf8');
  let written = 0;
  for (const e of entries) {
    if (!e.slug || RESERVED.has(e.slug) || e.slug.includes('/')) continue;
    try {
      writeFileSync(join(DIST, `${e.slug}.html`), buildEntryHtml(template, e));
      written++;
    } catch (err) {
      console.warn(`[prerender] failed for slug "${e.slug}":`, err.message);
    }
  }
  writeFileSync(join(DIST, 'sitemap.xml'), xmlSitemap(entries.filter(e => e.slug && !RESERVED.has(e.slug))));
  console.log(`[prerender] wrote ${written} wiki pages + sitemap.xml (${entries.length} entries scanned)`);
}

main();
