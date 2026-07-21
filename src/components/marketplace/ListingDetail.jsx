import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, SURF, TXT, RED, btnA, btnG, dvdr } from '../../lib/styles';
import { mIcon } from '../../lib/helpers';
import { supabase } from '../../lib/supabase';
import {
  getListingById, getOrCreateThread, incrementListingViews,
  markListingSold, relistListing, removeListing,
} from '../../lib/marketplace';
import { formatPrice } from './ListingTile';
import ConfirmDeleteListingModal from './ConfirmDeleteListingModal';

const KIND_ICON = { part: "🔩", tool: "🔧", consumable: "📦", equipment: "⚙️" };

function ListingDetail({ listingId, profile, company, onGoToBilling, onBack, onOpenThread }) {
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [messaging, setMessaging] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getListingById(listingId).then(async l => {
      if (cancelled) return;
      setListing(l);
      if (l) incrementListingViews(l.id);
      if (l?.seller_id) {
        const { data } = await supabase.from('profiles').select('id,username,display_name').eq('id', l.seller_id).single();
        if (!cancelled) setSeller(data);
      }
    });
    return () => { cancelled = true; };
  }, [listingId]);

  if (!listing) return <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "24px 0" }}>Loading…</div>;

  const isMine = listing.seller_id === profile.id;
  const sellerName = seller?.username || seller?.display_name || "Seller";
  const photos = listing.photos || [];

  const handleMessage = async () => {
    setMessaging(true); setError(null);
    try {
      const threadId = await getOrCreateThread(listing.id);
      onOpenThread(threadId);
    } catch (e) {
      setError(e.message || "Couldn't start a conversation with the seller.");
    } finally {
      setMessaging(false);
    }
  };

  const runStatusChange = async (fn) => {
    setBusy(true); setError(null);
    try { setListing(await fn(listing.id)); }
    catch (e) { setError(e.message || 'That action failed.'); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <button onClick={onBack} style={{ ...btnG, marginBottom: 12 }}>← Back</button>

      <div style={{ background: SURF, border: "1px solid " + BRD, borderRadius: 2, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ height: 220, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {photos.length > 0
            ? <img src={photos[activePhoto]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: 44, opacity: 0.4 }}>{KIND_ICON[listing.item_kind] || mIcon(listing.type)}</span>}
        </div>
        {photos.length > 1 && (
          <div style={{ display: "flex", gap: 6, padding: "8px 10px", overflowX: "auto" }}>
            {photos.map((p, i) => (
              <img key={i} src={p} alt="" onClick={() => setActivePhoto(i)}
                style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 2, cursor: "pointer", border: "1px solid " + (i === activePhoto ? ACC : BRD), flexShrink: 0 }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 4, fontSize: 15, fontWeight: 700, color: TXT }}>{listing.title}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: ACC, marginBottom: 8 }}>{formatPrice(listing.price) || "Price on request"}</div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {listing.status !== "active" && (
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", padding: "2px 6px", borderRadius: 2, background: RED + "22", color: RED, border: "1px solid " + RED + "44" }}>{listing.status.toUpperCase()}</span>
        )}
        {listing.quantity != null && <span style={{ fontSize: 9, color: ACC }}>×{listing.quantity}</span>}
        {listing.type && <span style={{ fontSize: 9, color: MUT }}>{listing.type}</span>}
        {(listing.make || listing.model) && <span style={{ fontSize: 9, color: MUT }}>{[listing.make, listing.model, listing.year].filter(Boolean).join(" · ")}</span>}
        {listing.location && <span style={{ fontSize: 9, color: MUT }}>📍 {listing.location}</span>}
      </div>

      {listing.description && (
        <div style={{ fontSize: 11, color: TXT, lineHeight: 1.6, marginBottom: 14, whiteSpace: "pre-wrap" }}>{listing.description}</div>
      )}

      <div style={dvdr} />

      {isMine ? (
        <div>
          <div style={{ fontSize: 9, color: MUT, marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>Manage listing</div>
          {error && <div style={{ fontSize: 10, color: RED, marginBottom: 8 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {listing.status === "active" && <button disabled={busy} onClick={() => runStatusChange(markListingSold)} style={btnA}>Mark Sold</button>}
            {(listing.status === "sold" || listing.status === "removed") && <button disabled={busy} onClick={() => runStatusChange(relistListing)} style={btnG}>Relist</button>}
            {listing.status !== "removed" && <button disabled={busy} onClick={() => runStatusChange(removeListing)} style={{ ...btnG, color: RED, borderColor: "#3a1a1a" }}>Remove</button>}
            {listing.status === "removed" && <button disabled={busy} onClick={() => setShowDeleteConfirm(true)} style={{ ...btnG, color: RED, borderColor: "#3a1a1a" }}>🗑 Delete Permanently</button>}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 10, color: MUT, marginBottom: 10 }}>Sold by <span style={{ color: TXT }}>{sellerName}</span></div>
          {error && <div style={{ fontSize: 10, color: RED, marginBottom: 8 }}>{error}</div>}
          {listing.status !== "active" ? (
            <div style={{ fontSize: 10, color: MUT }}>This listing is no longer available.</div>
          ) : (
            <button disabled={messaging} onClick={handleMessage} style={btnA}>{messaging ? "Starting…" : "💬 Message Seller"}</button>
          )}
        </div>
      )}

      {showDeleteConfirm && (
        <ConfirmDeleteListingModal
          listing={listing}
          onClose={() => setShowDeleteConfirm(false)}
          onDeleted={onBack}
        />
      )}
    </div>
  );
}

export default ListingDetail;
