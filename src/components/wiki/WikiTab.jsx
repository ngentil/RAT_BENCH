import React, { useState, useEffect } from 'react';
import WikiHomePage from './WikiHomePage';
import WikiEntryPage from './WikiEntryPage';
import WikiLeaderboard from './WikiLeaderboard';
function WikiTab({ session, profile, company }) {
  const [currentSlug, setCurrentSlug] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // No online-count tracking here — the main app shell's top bar already
  // shows a single site-wide "N online" for anyone logged in, regardless
  // of which tab (including this one) they're on.

  // Phone/browser back button closes an open entry back to the wiki list in
  // one press, instead of falling through to the app-level "press back again
  // to exit" guard — same pushState/popstate trick Tracker.jsx's tileOpen
  // and MachineCard.jsx's cardOpen already use for a machine tile.
  useEffect(() => {
    if (!currentSlug) return;
    history.pushState({ wikiEntryOpen: currentSlug }, '');
    const onPop = e => {
      if (e.state?.wikiEntryOpen === currentSlug) return;
      setCurrentSlug(null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [currentSlug]);

  // Tapping "← Wiki" should consume the history entry we pushed above rather
  // than leaving it stranded (which would otherwise take a second back press
  // to get past later).
  const closeEntry = () => {
    if (history.state?.wikiEntryOpen === currentSlug) history.back();
    else setCurrentSlug(null);
  };

  if (showLeaderboard) {
    return <WikiLeaderboard embedded onBack={() => setShowLeaderboard(false)} />;
  }

  if (currentSlug) {
    return (
      <WikiEntryPage
        slug={currentSlug}
        session={session}
        profile={profile}
        onBack={closeEntry}
        embedded
      />
    );
  }

  return (
    <div>
      <WikiHomePage
        onSelect={slug => setCurrentSlug(slug)}
        onShowLeaderboard={() => setShowLeaderboard(true)}
        embedded
        profile={profile}
      />
    </div>
  );
}

export default WikiTab;
