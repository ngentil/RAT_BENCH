import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, SURF, TXT, RED, GRN, btnA, btnG } from '../../lib/styles';
import { mIcon } from '../../lib/helpers';
import { getMyListings, relistListing } from '../../lib/marketplace';
import { formatPrice } from '../marketplace/ListingTile';

const KIND_ICON = { part: "🔩", tool: "🔧", consumable: "📦", equipment: "⚙️" };
const ORIGIN_LABEL = { machine: "Garage", part: "Parts", tool: "Tools", consumable: "Consumables", equipment: "Equipment" };

function SoldItemsTab({ profile, setMachines, setEquipment, onToolRelisted }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMyListings(profile.id).then(data => {
      if (cancelled) return;
      setListings((data || []).filter(l => l.status === 'sold'));
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
      if (listing.item_kind === 'machine') {
        setMachines(prev => prev.map(m => m.id === listing.machine_id ? { ...m, soldAt: null } : m));
      } else if (listing.item_kind === 'equipment') {
        setEquipment(prev => prev.map(e => e.id === listing.equipment_id ? { ...e, soldAt: null } : e));
      } else if (listing.item_kind === 'tool') {
        onToolRelisted?.();
      }
      // part / consumable: no source-record flag to clear — the source tab
      // reflects the re-decremented stock next time it fetches.
    } catch (e) {
      setErrors(prev => ({ ...prev, [listing.id]: e.message || "Couldn't relist this item." }));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "24px 0" }}>Loading…</div>;

  return (
    <div style={{ padding: 16, flex: 1 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TXT, letterSpacing: '0.06em' }}>Sold Items</div>
        <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
          Everything you've sold on the Marketplace — relist any of it any time.
        </div>
      </div>

      {listings.length === 0 ? (
        <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "32px 0" }}>
          <div style={{ fontSize: 22, marginBottom: 10 }}>📦</div>
          Nothing sold yet — items you mark "Sold" on the Marketplace show up here.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, alignItems: "start" }}>
          {listings.map(l => {
            const photo = l.photos?.[0];
            const icon = KIND_ICON[l.item_kind] || mIcon(l.type);
            const busy = busyId === l.id;
            return (
              <div key={l.id} style={{ background: SURF, border: "1px solid " + BRD, borderRadius: 2, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ height: 100, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                  {photo
                    ? <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 30, opacity: 0.4 }}>{icon}</span>}
                  <span style={{ position: "absolute", top: 4, left: 4, fontSize: 8, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: ACC, background: "rgba(0,0,0,0.65)", border: "1px solid " + ACC + "55", padding: "1px 5px", borderRadius: 2 }}>
                    {ORIGIN_LABEL[l.item_kind] || l.item_kind}
                  </span>
                </div>
                <div style={{ padding: "8px 10px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: TXT, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.title}</div>
                  {(l.make || l.model) && <div style={{ fontSize: 9, color: MUT, marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{[l.make, l.model, l.year].filter(Boolean).join(" · ")}</div>}
                  <span style={{ fontSize: 13, fontWeight: 700, color: ACC, marginBottom: 8 }}>{formatPrice(l.price) || "—"}</span>
                  {errors[l.id] && <div style={{ fontSize: 9, color: RED, marginBottom: 6 }}>{errors[l.id]}</div>}
                  <button disabled={busy} onClick={() => relist(l)} style={{ ...btnG, marginTop: "auto", color: GRN, borderColor: "#1e3a24", width: "100%" }}>
                    {busy ? "Relisting…" : "↻ Relist"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SoldItemsTab;
