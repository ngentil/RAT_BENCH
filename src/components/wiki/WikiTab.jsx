import React, { useState } from 'react';
import WikiHomePage from './WikiHomePage';
import WikiEntryPage from './WikiEntryPage';
import WikiLeaderboard from './WikiLeaderboard';
import { effectiveTier } from '../../lib/gates';
import { MUT, btnA, sm } from '../../lib/styles';
import UpgradeBanner from '../ui/UpgradeBanner';

function WikiTab({ session, profile, company, onGoToBilling }) {
  const [currentSlug, setCurrentSlug] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const isFree = effectiveTier(profile, company) === "free";

  // No online-count tracking here — the main app shell's top bar already
  // shows a single site-wide "N online" for anyone logged in, regardless
  // of which tab (including this one) they're on.

  if (showLeaderboard) {
    return <WikiLeaderboard embedded onBack={() => setShowLeaderboard(false)} />;
  }

  if (currentSlug) {
    return (
      <WikiEntryPage
        slug={currentSlug}
        session={session}
        profile={profile}
        onBack={() => setCurrentSlug(null)}
        embedded
      />
    );
  }

  return (
    <div>
      {isFree && <UpgradeBanner text="The wiki is free to read. Become a Member to publish your own specs." onUpgrade={onGoToBilling} />}
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
