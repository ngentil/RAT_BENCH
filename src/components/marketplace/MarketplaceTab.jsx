import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, TXT } from '../../lib/styles';
import { getMyUnreadCount, subscribeToMyMessages } from '../../lib/marketplace';
import MarketplaceBrowse from './MarketplaceBrowse';
import ListingDetail from './ListingDetail';
import SellForm from './SellForm';
import MyListings from './MyListings';
import MarketplaceInbox from './MarketplaceInbox';
import ThreadView from './ThreadView';
import SoldItemsTab from '../soldItems/SoldItemsTab';
import RemovedListingsTab from './RemovedListingsTab';

const NAV = [
  { id: "browse",  label: "Browse" },
  { id: "sell",    label: "Sell" },
  { id: "mine",    label: "Active Listings" },
  { id: "inbox",   label: "Messages" },
  { id: "sold",    label: "Sold" },
  { id: "removed", label: "Removed" },
];

function MarketplaceTab({ machines, profile, company, onGoToBilling, setMachines, setEquipment, onToolRelisted }) {
  const [view, setView] = useState("browse");
  const [listingId, setListingId] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [listingsRefreshKey, setListingsRefreshKey] = useState(0);
  const [unread, setUnread] = useState(0);

  const refreshUnread = () => getMyUnreadCount().then(setUnread);

  useEffect(() => {
    refreshUnread();
    const unsubscribe = subscribeToMyMessages(profile.id, refreshUnread);
    return unsubscribe;
  }, [profile.id]);

  // Re-check unread whenever a thread is closed — the recipient's own read
  // receipt (markThreadRead) has already fired by then.
  useEffect(() => { if (!threadId) refreshUnread(); }, [threadId]);

  const openListing = (id) => { setListingId(id); setView("listing"); };
  const openThread = (id) => { setThreadId(id); setView("thread"); };

  const navTo = (id) => {
    setView(id);
    setListingId(null);
    setThreadId(null);
  };

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
          const active = view === n.id || (n.id === "browse" && view === "listing") || (n.id === "inbox" && view === "thread");
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
              {n.id === "inbox" && unread > 0 && (
                <span style={{ position: "absolute", top: -6, right: -6, background: "#c94040", color: "#fff", fontSize: 8, fontWeight: 700, borderRadius: 10, minWidth: 15, height: 15, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
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
          onOpenThread={openThread}
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

      {view === "inbox" && (
        <MarketplaceInbox profile={profile} onOpenThread={openThread} refreshKey={threadId ? 0 : unread} />
      )}

      {view === "thread" && threadId && (
        <ThreadView
          threadId={threadId}
          profile={profile}
          onBack={() => navTo("inbox")}
          onListingSelect={openListing}
        />
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
