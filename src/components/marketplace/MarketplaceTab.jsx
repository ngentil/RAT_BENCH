import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, TXT } from '../../lib/styles';
import MarketplaceBrowse from './MarketplaceBrowse';
import ListingDetail from './ListingDetail';
import SellForm from './SellForm';
import MyListings from './MyListings';
import SoldItemsTab from '../soldItems/SoldItemsTab';
import RemovedListingsTab from './RemovedListingsTab';

const NAV = [
  { id: "browse",  label: "Browse" },
  { id: "sell",    label: "Sell" },
  { id: "mine",    label: "Active Listings" },
  { id: "sold",    label: "Sold" },
  { id: "removed", label: "Removed" },
];

// onOpenThread: "message seller" now hands off to the Community → Messages
// sub-tab instead of opening a thread view nested inside Marketplace itself
// (see MessagesTab.jsx). pendingListingId/onConsumePendingListing is the
// mirror image — a thread's linked-listing click asks this tab to open a
// specific listing.
function MarketplaceTab({ machines, profile, company, onGoToBilling, setMachines, setEquipment, onToolRelisted, onOpenThread, pendingListingId, onConsumePendingListing }) {
  const [view, setView] = useState("browse");
  const [listingId, setListingId] = useState(null);
  const [listingsRefreshKey, setListingsRefreshKey] = useState(0);

  const openListing = (id) => { setListingId(id); setView("listing"); };

  const navTo = (id) => {
    setView(id);
    setListingId(null);
  };

  // A caller elsewhere (a thread's linked-listing click, in Community →
  // Messages) wants this tab to jump straight to a listing — consume it
  // once so re-renders don't re-open it after the user navigates away.
  useEffect(() => {
    if (!pendingListingId) return;
    openListing(pendingListingId);
    onConsumePendingListing?.();
  }, [pendingListingId]);

  // Phone/browser back button closes an open listing back to Browse in one
  // press, instead of falling through to the app-level "press back again to
  // exit" guard — same pushState/popstate trick Tracker.jsx's tileOpen and
  // MachineCard.jsx's cardOpen already use for a machine tile.
  useEffect(() => {
    if (view !== "listing" || !listingId) return;
    history.pushState({ marketplaceListingOpen: listingId }, '');
    const onPop = e => {
      if (e.state?.marketplaceListingOpen === listingId) return;
      navTo("browse");
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [view, listingId]);

  // Consumes the history entry we pushed above rather than leaving it
  // stranded (which would otherwise take a second back press later).
  const closeListing = () => {
    if (history.state?.marketplaceListingOpen === listingId) history.back();
    else navTo("browse");
  };

  return (
    <div style={{ padding: "4px 0" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {NAV.map(n => {
          const active = view === n.id || (n.id === "browse" && view === "listing");
          return (
            <button
              key={n.id}
              onClick={() => navTo(n.id)}
              style={{
                background: active ? ACC : "none",
                color: active ? "#fff" : MUT,
                border: "1px solid " + (active ? ACC : BRD),
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                padding: "7px 12px", borderRadius: 2, cursor: "pointer", position: "relative",
              }}
            >
              {n.label}
            </button>
          );
        })}
      </div>

      {view === "browse" && <MarketplaceBrowse onSelect={openListing} />}

      {view === "listing" && listingId && (
        <ListingDetail
          listingId={listingId}
          profile={profile}
          company={company}
          onGoToBilling={onGoToBilling}
          onBack={closeListing}
          onOpenThread={onOpenThread}
        />
      )}

      {view === "sell" && (
        <SellForm
          machines={machines}
          profile={profile}
          onCreated={(listing) => { setListingsRefreshKey(k => k + 1); openListing(listing.id); }}
          onCancel={() => navTo("browse")}
        />
      )}

      {view === "mine" && (
        <MyListings profile={profile} onSelect={openListing} refreshKey={listingsRefreshKey} />
      )}

      {view === "sold" && (
        <SoldItemsTab profile={profile} setMachines={setMachines} setEquipment={setEquipment} onToolRelisted={onToolRelisted} />
      )}

      {view === "removed" && (
        <RemovedListingsTab profile={profile} onSelect={openListing} />
      )}
    </div>
  );
}

export default MarketplaceTab;
