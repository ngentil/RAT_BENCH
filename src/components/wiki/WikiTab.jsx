import React, { useState } from 'react';
import WikiHomePage from './WikiHomePage';
import WikiEntryPage from './WikiEntryPage';
import { effectiveTier } from '../../lib/gates';
import { MUT, btnA, sm } from '../../lib/styles';

function WikiTab({ session, profile, company, onGoToBilling }) {
  const [currentSlug, setCurrentSlug] = useState(null);
  const isFree = effectiveTier(profile, company) === "free";

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
      {isFree && (
        <div style={{fontSize:9,color:MUT,letterSpacing:"0.06em",padding:"8px 0 12px",lineHeight:1.6}}>
          The wiki is free to read for everyone.{" "}
          <span onClick={onGoToBilling} style={{color:ACC,cursor:"pointer"}}>Upgrade to Enthusiast</span> to publish your own specs.
        </div>
      )}
      <WikiHomePage
        onSelect={slug => setCurrentSlug(slug)}
        embedded
      />
    </div>
  );
}

export default WikiTab;
