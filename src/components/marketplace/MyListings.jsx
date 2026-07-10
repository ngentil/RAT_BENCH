import React, { useState, useEffect } from 'react';
import { MUT } from '../../lib/styles';
import { getMyListings } from '../../lib/marketplace';
import ListingTile from './ListingTile';

function MyListings({ profile, onSelect, refreshKey }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMyListings(profile.id).then(data => {
      if (!cancelled) { setListings(data); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [profile.id, refreshKey]);

  if (loading) return <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "24px 0" }}>Loading…</div>;

  if (listings.length === 0) {
    return (
      <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "32px 0" }}>
        <div style={{ fontSize: 22, marginBottom: 10 }}>🛒</div>
        You haven't listed anything yet.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, alignItems: "start" }}>
      {listings.map(l => <ListingTile key={l.id} listing={l} onClick={() => onSelect(l.id)} />)}
    </div>
  );
}

export default MyListings;
