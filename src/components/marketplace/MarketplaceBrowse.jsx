import React, { useState, useEffect } from 'react';
import { MUT, BRD } from '../../lib/styles';
import { getActiveListings } from '../../lib/marketplace';
import ListingTile from './ListingTile';

function MarketplaceBrowse({ onSelect }) {
  const [listings, setListings] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getActiveListings({ query }).then(data => {
      if (!cancelled) { setListings(data); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [query]);

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search listings…"
        style={{ width: "100%", boxSizing: "border-box", background: "#0a0a0a", border: "1px solid " + BRD, color: "#d8cfc4", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, padding: "8px 12px", borderRadius: 2, outline: "none", marginBottom: 14 }}
      />
      {loading && <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "24px 0" }}>Loading…</div>}
      {!loading && listings.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "32px 0" }}>
          <div style={{ fontSize: 22, marginBottom: 10 }}>🛒</div>
          {query.trim() ? "No listings match that search." : "No listings yet — be the first to sell a machine."}
        </div>
      )}
      {listings.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, alignItems: "start" }}>
          {listings.map(l => <ListingTile key={l.id} listing={l} onClick={() => onSelect(l.id)} />)}
        </div>
      )}
    </div>
  );
}

export default MarketplaceBrowse;
