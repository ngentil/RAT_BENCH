import React, { useState, useEffect } from 'react';
import WikiHomePage from './WikiHomePage';
import WikiEntryPage from './WikiEntryPage';
import WikiLeaderboard from './WikiLeaderboard';
import { effectiveTier } from '../../lib/gates';
import { subscribeWikiPresence } from '../../lib/wiki';
import { MUT, btnA, sm } from '../../lib/styles';
import UpgradeBanner from '../ui/UpgradeBanner';

function WikiTab({ session, profile, company, onGoToBilling }) {
  const [currentSlug, setCurrentSlug] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [onlineCount, setOnlineCount] = useState(null);
  const isFree = effectiveTier(profile, company) === "free";

  // One subscription for the whole tab's lifetime — stays tracked across
  // home/entry/leaderboard sub-views (only these three sub-views swap in
  // place, the tab itself doesn't remount), so the count isn't scoped to
  // just whichever sub-view happens to render the badge.
  useEffect(() => subscribeWikiPresence(setOnlineCount), []);

  if (showLeaderboard) {
    return <WikiLeaderboard embedded onBack={() => setShowLeaderboard(false)} onlineCount={onlineCount} />;
  }

  if (currentSlug) {
    return (
      <WikiEntryPage
        slug={currentSlug}
        session={session}
        profile={profile}
        onBack={() => setCurrentSlug(null)}
        embedded
        onlineCount={onlineCount}
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
        onlineCount={onlineCount}
      />
    </div>
  );
}

export default WikiTab;
