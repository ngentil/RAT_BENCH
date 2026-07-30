import React, { useState, useEffect } from 'react';
import { getMyUnreadCount, subscribeToMyMessages } from '../../lib/marketplace';
import MarketplaceInbox from './MarketplaceInbox';
import ThreadView from './ThreadView';

// Extracted out of MarketplaceTab so messaging lives as its own Community
// sub-tab (Wiki / Market / Messages) instead of being buried inside
// Marketplace's own internal nav — same unread-tracking and inbox/thread
// view logic, just no longer scoped to being "inside" Marketplace.
//
// pendingThreadId/onConsumePendingThread: Marketplace's "message seller"
// flow creates/finds a thread and wants this tab to jump straight to it —
// since the two are now separate Community sub-tabs, that request comes in
// as a prop from the shared parent (App.jsx) rather than local state.
// onOpenListing: the mirror image — a thread's linked-listing click needs to
// switch Community over to Market and open that listing there.
function MessagesTab({ profile, pendingThreadId, onConsumePendingThread, onOpenListing, onUnreadChange }) {
  const [view, setView] = useState("inbox");
  const [threadId, setThreadId] = useState(null);
  const [unread, setUnread] = useState(0);

  const refreshUnread = () => getMyUnreadCount().then(n => { setUnread(n); onUnreadChange?.(n); });

  useEffect(() => {
    refreshUnread();
    const unsubscribe = subscribeToMyMessages(
      profile.id, refreshUnread,
      // Re-check on every (re)subscribe, not just on a live INSERT event —
      // covers both the initial fetch/subscribe race and any badge drift
      // left by a dropped-then-restored websocket missing an event.
      (status) => { if (status === 'SUBSCRIBED') refreshUnread(); },
    );
    // Safety-net poll: Realtime is best-effort, and a fully blocked
    // websocket (firewall, etc.) never reaches 'SUBSCRIBED' at all, so the
    // reconnect refetch above can't cover that case — this bounds the
    // badge's worst-case staleness to one poll interval instead of forever.
    const pollId = setInterval(refreshUnread, 20000);
    return () => { unsubscribe(); clearInterval(pollId); };
  }, [profile.id]);

  // Re-check unread whenever a thread is closed — the recipient's own read
  // receipt (markThreadRead) has already fired by then.
  useEffect(() => { if (!threadId) refreshUnread(); }, [threadId]);

  const openThread = (id) => { setThreadId(id); setView("thread"); };

  // A caller elsewhere (Marketplace's "message seller") wants this tab to
  // jump straight to a thread — consume it once, so re-renders don't re-open
  // it after the user has already navigated away.
  useEffect(() => {
    if (!pendingThreadId) return;
    openThread(pendingThreadId);
    onConsumePendingThread?.();
  }, [pendingThreadId]);

  return (
    <div>
      {view === "inbox" && (
        <MarketplaceInbox profile={profile} onOpenThread={openThread} refreshKey={threadId ? 0 : unread} />
      )}
      {view === "thread" && threadId && (
        <ThreadView
          threadId={threadId}
          profile={profile}
          onBack={() => { setView("inbox"); setThreadId(null); }}
          onListingSelect={onOpenListing}
        />
      )}
    </div>
  );
}

export default MessagesTab;
