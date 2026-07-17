import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, SURF, TXT, BG } from '../../lib/styles';
import { getActiveListings, getRecentListings, getMostViewedListings, getMarketplaceStats } from '../../lib/marketplace';
import ListingTile from './ListingTile';

// Public, unauthenticated Marketplace discovery page — the Marketplace
// equivalent of the Wiki's standalone home (WikiHomePage.jsx's non-embedded
// branch). Reachable at /marketplace, no login required to browse; listing
// tiles link through to /listing/:id (PublicListingPage). Selling and
// messaging still need an account — same spam-prevention gate as before,
// just no longer tied to payment.
export default function PublicMarketplaceHome() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recent, setRecent] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
  const [stats, setStats] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    getRecentListings(6).then(setRecent);
    getMostViewedListings(20).then(setMostViewed);
    getMarketplaceStats().then(setStats);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const r = await getActiveListings({ query });
      setResults(r);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const isDefault = !query.trim();
  const recentIds = new Set(recent.map(l => l.id));
  const list = isDefault ? mostViewed.filter(l => !recentIds.has(l.id)) : results;

  const secLabel = t => (
    <div style={{ fontSize: 9, color: MUT, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, margin: "4px 0 10px" }}>{t}</div>
  );

  const openListing = id => { window.location.href = `/listing/${id}`; };

  const grid = (items) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, alignItems: "start", marginBottom: 18 }}>
      {items.map(l => <ListingTile key={l.id} listing={l} onClick={() => openListing(l.id)} />)}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TXT, fontFamily: "'IBM Plex Mono',monospace" }}>
      <div style={{ background: SURF, borderBottom: "2px solid " + ACC, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>🐀</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: ACC, letterSpacing: "0.04em", textTransform: "uppercase" }}>Rat Bench Marketplace</div>
          <div style={{ fontSize: 9, color: MUT, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 1 }}>community for-sale listings</div>
        </div>
        <a href="https://ratbench.net" style={{ fontSize: 9, color: MUT, textDecoration: "none", letterSpacing: "0.06em" }}>← App</a>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search listings by title, description, make, or model…"
          style={{ width: "100%", boxSizing: "border-box", background: "#0a0a0a", border: "1px solid " + BRD, color: TXT, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, padding: "8px 12px", borderRadius: 2, outline: "none", marginBottom: 14 }}
        />

        {stats && stats.listings > 0 && (
          <div style={{ fontSize: 10, color: MUT, letterSpacing: "0.04em", marginBottom: 14 }}>
            <span style={{ color: ACC, fontWeight: 700 }}>{stats.listings.toLocaleString()}</span> listing{stats.listings !== 1 ? "s" : ""} for sale right now
          </div>
        )}

        {searching && <div style={{ fontSize: 10, color: MUT, marginBottom: 12 }}>Searching…</div>}

        {!searching && list.length === 0 && (isDefault ? recent.length === 0 : true) && (
          <div style={{ fontSize: 10, color: MUT, textAlign: "center", marginTop: 40 }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>🛒</div>
            {query.trim() ? "No listings match that search." : "No listings yet — be the first to sell something."}
          </div>
        )}

        {isDefault && recent.length > 0 && (
          <>
            {secLabel("Recently added")}
            {grid(recent)}
          </>
        )}

        {list.length > 0 && (
          <>
            {isDefault && secLabel("Most viewed")}
            {grid(list)}
          </>
        )}
      </div>
    </div>
  );
}
