import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { ACC, MUT, BRD, SURF, TXT, BG } from '../../lib/styles';
import { mIcon } from '../../lib/helpers';
import { getPublicListing, incrementListingViews } from '../../lib/marketplace';
import { formatPrice } from './ListingTile';

const KIND_ICON = { part: "🔩", tool: "🔧", consumable: "📦", equipment: "⚙️" };

// Public, unauthenticated single-listing page — the Marketplace equivalent of
// the Wiki's standalone entry page. Reachable at /listing/:id (see main.jsx),
// no login required to view; messaging/buying still needs an account, same
// as before the paywall came out — that gate was always about spam
// prevention, not payment.
export default function PublicListingPage({ listingId }) {
  const [listing, setListing] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getPublicListing(listingId).then(l => {
      if (cancelled) return;
      if (!l) { setNotFound(true); return; }
      setListing(l);
      incrementListingViews(l.id);
      document.title = `${l.title} — Rat Bench Marketplace`;
    });
    return () => { cancelled = true; };
  }, [listingId]);

  useEffect(() => {
    if (!listing) return;
    const shareUrl = `${window.location.origin}/listing/${listing.id}`;
    QRCode.toDataURL(shareUrl, { width: 110, margin: 1, color: { dark: ACC, light: SURF } })
      .then(setQrDataUrl);
  }, [listing]);

  const Header = () => (
    <div style={{ background: SURF, borderBottom: "2px solid " + ACC, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 20 }}>🐀</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: ACC, letterSpacing: "0.04em", textTransform: "uppercase" }}>Rat Bench Marketplace</div>
        <div style={{ fontSize: 9, color: MUT, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 1 }}>community for-sale listings</div>
      </div>
      <a href="/marketplace" style={{ fontSize: 9, color: MUT, textDecoration: "none", letterSpacing: "0.06em" }}>← Browse</a>
    </div>
  );

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", background: BG, color: TXT, fontFamily: "'IBM Plex Mono',monospace" }}>
        <Header />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "80px 24px" }}>
          <div style={{ fontSize: 32 }}>🛒</div>
          <div style={{ fontSize: 13, color: TXT, fontWeight: 700 }}>Listing not found</div>
          <div style={{ fontSize: 10, color: MUT }}>It may have sold, been removed, or the link is wrong.</div>
          <a href="/marketplace" style={{ fontSize: 10, color: ACC, textDecoration: "none", marginTop: 8 }}>← Browse the Marketplace</a>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={{ minHeight: "100vh", background: BG, color: MUT, fontFamily: "'IBM Plex Mono',monospace", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
        Loading…
      </div>
    );
  }

  const photos = listing.photos || [];
  const icon = KIND_ICON[listing.item_kind] || mIcon(listing.type);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TXT, fontFamily: "'IBM Plex Mono',monospace" }}>
      <Header />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ background: SURF, border: "1px solid " + BRD, borderRadius: 2, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ height: 280, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {photos.length > 0
              ? <img src={photos[activePhoto]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: 54, opacity: 0.4 }}>{icon}</span>}
          </div>
          {photos.length > 1 && (
            <div style={{ display: "flex", gap: 6, padding: "8px 10px", overflowX: "auto" }}>
              {photos.map((p, i) => (
                <img key={i} src={p} alt="" onClick={() => setActivePhoto(i)}
                  style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 2, cursor: "pointer", border: "1px solid " + (i === activePhoto ? ACC : BRD), flexShrink: 0 }} />
              ))}
            </div>
          )}
        </div>

        <div style={{ fontSize: 18, fontWeight: 700, color: TXT, marginBottom: 4 }}>{listing.title}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: ACC, marginBottom: 10 }}>{formatPrice(listing.price) || "Price on request"}</div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {listing.quantity != null && <span style={{ fontSize: 10, color: ACC }}>×{listing.quantity}</span>}
          {listing.type && <span style={{ fontSize: 10, color: MUT }}>{listing.type}</span>}
          {(listing.make || listing.model) && <span style={{ fontSize: 10, color: MUT }}>{[listing.make, listing.model, listing.year].filter(Boolean).join(" · ")}</span>}
          {listing.location && <span style={{ fontSize: 10, color: MUT }}>📍 {listing.location}</span>}
          {listing.view_count > 0 && <span style={{ fontSize: 10, color: MUT }}>👁 {listing.view_count}</span>}
        </div>

        {listing.description && (
          <div style={{ fontSize: 12, color: TXT, lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 20, borderTop: "1px solid " + BRD, paddingTop: 14 }}>
            {listing.description}
          </div>
        )}

        <div style={{ borderTop: "1px solid " + BRD, paddingTop: 16, display: "flex", gap: 14, alignItems: "flex-start" }}>
          {qrDataUrl && (
            <div style={{ flexShrink: 0, textAlign: "center" }}>
              <img src={qrDataUrl} alt="QR code" style={{ width: 88, height: 88, display: "block", border: "1px solid " + BRD, borderRadius: 2 }} />
              <div style={{ fontSize: 7, color: MUT, marginTop: 4, letterSpacing: "0.08em" }}>scan to view</div>
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: MUT, marginBottom: 10, lineHeight: 1.6 }}>
              Sign up free to message the seller and see everything else for sale on Rat Bench.
            </div>
            <a href="/" style={{ display: "inline-block", background: ACC, color: "#000", fontSize: 11, fontWeight: 700, padding: "9px 16px", borderRadius: 2, textDecoration: "none", letterSpacing: "0.05em" }}>
              Open Rat Bench →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
