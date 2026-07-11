import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, TXT } from '../../lib/styles';
import { effectiveTier } from '../../lib/gates';
import { getMyUnreadCount, subscribeToMyMessages } from '../../lib/marketplace';
import UpgradeBanner from '../ui/UpgradeBanner';
import MarketplaceBrowse from './MarketplaceBrowse';
import ListingDetail from './ListingDetail';
import SellForm from './SellForm';
import MyListings from './MyListings';
import MarketplaceInbox from './MarketplaceInbox';
import ThreadView from './ThreadView';

const NAV = [
  { id: "browse", label: "Browse" },
  { id: "sell",   label: "Sell" },
  { id: "mine",   label: "My Listings" },
  { id: "inbox",  label: "Messages" },
];

function MarketplaceTab({ machines, profile, company, onGoToBilling }) {
  const [view, setView] = useState("browse");
  const [listingId, setListingId] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [listingsRefreshKey, setListingsRefreshKey] = useState(0);
  const [unread, setUnread] = useState(0);
  // Browsing stays free; selling and starting a new conversation with a
  // seller are the community-facing write actions a disposable account
  // could spam, so both are gated the same way the Wiki gates publishing.
  // An existing conversation (Messages tab / ThreadView) stays reachable
  // even if you later lapse to free — only starting a new one is gated.
  const isFree = effectiveTier(profile, company) === "free";

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
          onBack={() => navTo("browse")}
          onOpenThread={openThread}
        />
      )}

      {view === "sell" && (
        isFree ? (
          <div>
            <UpgradeBanner text="Become a Member to sell on the Marketplace — it keeps listings and outreach free of spam accounts." onUpgrade={onGoToBilling} />
            <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 22, marginBottom: 10 }}>🛒</div>
              Browsing is always free.
            </div>
          </div>
        ) : (
          <SellForm
            machines={machines}
            profile={profile}
            onCreated={(listing) => { setListingsRefreshKey(k => k + 1); openListing(listing.id); }}
            onCancel={() => navTo("browse")}
          />
        )
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
    </div>
  );
}

export default MarketplaceTab;
