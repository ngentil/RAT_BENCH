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
        <div style={{background:"#0a1a0a",border:"1px solid #1a3a1a",borderRadius:2,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div>
            <div style={{fontSize:9,color:"#4ade80",letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,marginBottom:3}}>Free Plan</div>
            <div style={{fontSize:10,color:MUT,lineHeight:1.6}}>Browse &amp; read the wiki for free. Publishing specs requires an Enthusiast subscription.</div>
          </div>
          {onGoToBilling && <button onClick={onGoToBilling} style={{...btnA,...sm,whiteSpace:"nowrap"}}>Upgrade →</button>}
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
