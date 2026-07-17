// Build-time static prerender for public Marketplace listings (SEO).
// Mirrors scripts/prerender-wiki.mjs — see that file for the general approach
// and rationale. Key differences: this serves the main domain (not a
// subdomain), listing pages live under /listing/<id> (a nested path, not a
// flat slug) so the output goes to dist/listing/<id>.html, and it writes its
// own sitemap-marketplace.xml rather than sitemap.xml (which the wiki
// prerender already owns — both scripts write into the same dist/ folder).
//
// Runs after `vite build` (see the "prerender:marketplace" npm script /
// netlify.toml). Only active listings are prerendered — sold/removed ones
// have nothing worth indexing and would 404 for a real visitor anyway.
//
// Robust by design: if Supabase env is missing or the fetch fails, it logs
// and exits 0 so the Netlify build still succeeds and deploys the SPA
// unchanged.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const SITE_ORIGIN = 'https://ratbench.net';

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function formatPrice(price) {
  if (price == null) return null;
  return '$' + Number(price).toLocaleString();
}

// Build the head-meta + #root content and splice into the built index.html.
export function buildListingHtml(template, listing) {
  const { id, title, description, price, make, model, year, type, location, photos } = listing;
  const canonical = `${SITE_ORIGIN}/listing/${id}`;
  const priceLabel = formatPrice(price) || 'Price on request';
  const pageTitle = `${title} — ${priceLabel} | Rat Bench Marketplace`;
  const photo = Array.isArray(photos) && photos.length > 0 ? photos[0] : null;

  const descBits = [type, [make, model, year].filter(Boolean).join(' '), location].filter(Boolean).join(' · ');
  const desc = `${title} — ${priceLabel}${descBits ? `. ${descBits}` : ''}. For sale on Rat Bench, a community marketplace for workshop machines, parts, and tools.`;
  const descClamped = desc.length > 300 ? desc.slice(0, 297) + '…' : desc;

  const head = `
    <title>${esc(pageTitle)}</title>
    <meta name="description" content="${esc(descClamped)}" />
    <link rel="canonical" href="${esc(canonical)}" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="Rat Bench Marketplace" />
    <meta property="og:title" content="${esc(title)} — ${esc(priceLabel)}" />
    <meta property="og:description" content="${esc(descClamped)}" />
    <meta property="og:url" content="${esc(canonical)}" />
    ${photo ? `<meta property="og:image" content="${esc(photo)}" />` : ''}
    <meta name="twitter:card" content="${photo ? 'summary_large_image' : 'summary'}" />
    <meta name="twitter:title" content="${esc(title)} — Rat Bench Marketplace" />
    <meta name="twitter:description" content="${esc(descClamped)}" />`;

  const rootContent = `<article class="seo-prerender">
      <h1>${esc(title)}</h1>
      <p>${esc(priceLabel)}</p>
      <p>${esc([type, [make, model, year].filter(Boolean).join(' '), location].filter(Boolean).join(' · '))}</p>
      ${description ? `<p>${esc(description)}</p>` : ''}
      <p>Community for-sale listing on the Rat Bench Marketplace.</p>
    </article>`;

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace('</head>', `${head}\n  </head>`)
    .replace(/<div id="root">\s*<\/div>/, `<div id="root">${rootContent}</div>`);
  return html;
}

function xmlSitemap(listings) {
  const urls = [SITE_ORIGIN + '/marketplace', ...listings.map(l => `${SITE_ORIGIN}/listing/${l.id}`)]
    .map(u => `  <url><loc>${esc(u)}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function fetchActiveListings() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('[prerender-marketplace] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — skipping.');
    return null;
  }
  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(url, key);
  const { data, error } = await sb.from('marketplace_listings')
    .select('id,title,description,price,make,model,year,type,location,photos')
    .eq('status', 'active').limit(5000);
  if (error) throw error;
  return data || [];
}

async function main() {
  if (process.env.PRERENDER_SELFTEST === '1') {
    const template = readFileSync(join(DIST, 'index.html'), 'utf8');
    mkdirSync(join(DIST, 'listing'), { recursive: true });
    const html = buildListingHtml(template, {
      id: '00000000-0000-0000-0000-000000000000', title: 'Honda GX390 — good condition',
      description: 'Runs great, recently serviced.', price: 250, make: 'Honda', model: 'GX390',
      year: '2019', type: 'Engine', location: 'Brisbane', photos: [],
    });
    writeFileSync(join(DIST, 'listing', '__prerender_selftest.html'), html);
    console.log('[prerender-marketplace] self-test page written to dist/listing/__prerender_selftest.html');
    return;
  }

  let listings;
  try {
    listings = await fetchActiveListings();
  } catch (e) {
    console.warn('[prerender-marketplace] fetch failed — skipping (SPA still deploys):', e.message);
    return;
  }
  if (!listings) return;

  const template = readFileSync(join(DIST, 'index.html'), 'utf8');
  mkdirSync(join(DIST, 'listing'), { recursive: true });
  let written = 0;
  for (const l of listings) {
    if (!l.id) continue;
    try {
      writeFileSync(join(DIST, 'listing', `${l.id}.html`), buildListingHtml(template, l));
      written++;
    } catch (err) {
      console.warn(`[prerender-marketplace] failed for listing "${l.id}":`, err.message);
    }
  }
  writeFileSync(join(DIST, 'sitemap-marketplace.xml'), xmlSitemap(listings));
  console.log(`[prerender-marketplace] wrote ${written} listing pages + sitemap-marketplace.xml (${listings.length} listings scanned)`);
}

main();
