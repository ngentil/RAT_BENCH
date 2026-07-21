import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, SURF, TXT, RED, btnG } from '../../lib/styles';
import { mIcon } from '../../lib/helpers';
import { getMyListings, relistListing } from '../../lib/marketplace';
import { formatPrice } from './ListingTile';
import ConfirmDeleteListingModal from './ConfirmDeleteListingModal';

const KIND_ICON = { part: "🔩", tool: "🔧", consumable: "📦", equipment: "⚙️" };

function RemovedListingsTab({ profile, onSelect }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMyListings(profile.id).then(data => {
      if (cancelled) return;
      setListings((data || []).filter(l => l.status === 'removed'));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [profile.id]);

  const relist = async (listing) => {
    setBusyId(listing.id);
    setErrors(prev => ({ ...prev, [listing.id]: null }));
    try {
      await relistListing(listing.id);
      setListings(prev => prev.filter(l => l.id !== listing.id));
    } catch (e) {
      setErrors(prev => ({ ...prev, [listing.id]: e.message || "Couldn't relist this item." }));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "24px 0" }}>Loading…</div>;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TXT, letterSpacing: '0.06em' }}>Removed Listings</div>
        <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
          Listings you've taken down — relist any of them, or delete them for good.
        </div>
      </div>

      {listings.length === 0 ? (
        <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "32px 0" }}>
          <div style={{ fontSize: 22, marginBottom: 10 }}>🗑</div>
          Nothing removed — listings you take down show up here.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, alignItems: "start" }}>
          {listings.map(l => {
            const photo = l.photos?.[0];
            const icon = KIND_ICON[l.item_kind] || mIcon(l.type);
            const busy = busyId === l.id;
            return (
              <div key={l.id} style={{ background: SURF, border: "1px solid " + BRD, borderRadius: 2, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div onClick={() => onSelect?.(l.id)} style={{ height: 100, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, cursor: onSelect ? "pointer" : "default" }}>
                  {photo
                    ? <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 30, opacity: 0.4 }}>{icon}</span>}
                </div>
                <div style={{ padding: "8px 10px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: TXT, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.title}</div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: ACC, marginBottom: 8 }}>{formatPrice(l.price) || "—"}</span>
                  {errors[l.id] && <div style={{ fontSize: 9, color: RED, marginBottom: 6 }}>{errors[l.id]}</div>}
                  <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                    <button disabled={busy} onClick={() => relist(l)} style={{ ...btnG, flex: 1, fontSize: 9 }}>
                      {busy ? "…" : "↻ Relist"}
                    </button>
                    <button disabled={busy} onClick={() => setDeleteTarget(l)} style={{ ...btnG, flex: 1, fontSize: 9, color: RED, borderColor: "#3a1a1a" }}>
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDeleteListingModal
          listing={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => { setListings(prev => prev.filter(l => l.id !== deleteTarget.id)); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}

export default RemovedListingsTab;
