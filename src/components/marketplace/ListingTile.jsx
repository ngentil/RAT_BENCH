import React from 'react';
import { ACC, MUT, BRD, SURF, TXT } from '../../lib/styles';
import { mIcon } from '../../lib/helpers';

const STATUS_LABEL = { active: null, sold: "SOLD", removed: "REMOVED" };
const KIND_ICON = { part: "🔩", tool: "🔧", consumable: "📦", equipment: "⚙️" };

function formatPrice(price) {
  if (price == null) return null;
  return "$" + Number(price).toLocaleString();
}

function ListingTile({ listing, onClick }) {
  const l = listing;
  const photo = l.photos?.[0];
  const statusLabel = STATUS_LABEL[l.status];
  const icon = KIND_ICON[l.item_kind] || mIcon(l.type);
  return (
    <div onClick={onClick} style={{ background: SURF, border: "1px solid " + BRD, borderRadius: 2, cursor: "pointer", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 100, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, position: "relative" }}>
        {photo
          ? <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: 30, opacity: 0.4 }}>{icon}</span>}
        {statusLabel && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#fff", border: "1px solid #fff", padding: "3px 8px", borderRadius: 2 }}>{statusLabel}</span>
          </div>
        )}
        {l.quantity != null && (
          <span style={{ position: "absolute", top: 4, right: 4, fontSize: 8, fontWeight: 700, color: "#fff", background: "rgba(0,0,0,0.65)", padding: "1px 5px", borderRadius: 2 }}>×{l.quantity}</span>
        )}
      </div>
      <div style={{ padding: "8px 10px", flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: TXT, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.title}</div>
        {(l.make || l.model) && <div style={{ fontSize: 9, color: MUT, marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{[l.make, l.model, l.year].filter(Boolean).join(" · ")}</div>}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: ACC }}>{formatPrice(l.price) || "—"}</span>
          {l.location && <span style={{ fontSize: 8, color: MUT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "50%" }}>{l.location}</span>}
        </div>
        {l.view_count > 0 && <div style={{ fontSize: 8, color: MUT, marginTop: 3 }}>👁 {l.view_count}</div>}
      </div>
    </div>
  );
}

export default ListingTile;
export { formatPrice };
