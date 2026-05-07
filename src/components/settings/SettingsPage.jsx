import React, { useState } from 'react';
import { ACC, MUT, BRD, btnG, btnA, sm } from '../../lib/styles';
import ProfileSettings from './ProfileSettings';
import CompanySettings from './CompanySettings';
import BillingPage from './BillingPage';
import { effectiveTier } from '../../lib/gates';

function SettingsPage({profile,setProfile,session,company,setCompany,onSignOut}){
  const [tab,setTab]=useState("profile");
  const tier = effectiveTier(profile, company);
  const canOrg = ["team","business"].includes(tier) || !!company;
  return(
    <div style={{padding:16,flex:1,maxWidth:560,margin:"0 auto",width:"100%"}}>
      <div style={{display:"flex",gap:4,marginBottom:20}}>
        {[["profile","Profile"],["company","Company / Org"],["billing","Billing"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{...btnG,...sm,...(tab===id?{background:ACC,color:"#fff",border:"1px solid "+ACC}:{})}}>{label}</button>
        ))}
      </div>
      {tab==="profile"&&<ProfileSettings profile={profile} setProfile={setProfile} session={session} onSignOut={onSignOut} isGuest={!!session?.user?.is_anonymous}/>}
      {tab==="company"&&(canOrg
        ? <CompanySettings profile={profile} setProfile={setProfile} company={company} setCompany={setCompany} session={session}/>
        : <div style={{textAlign:"center",padding:"40px 16px"}}>
            <div style={{fontSize:28,marginBottom:12}}>🏢</div>
            <div style={{fontSize:11,fontWeight:700,color:"#fff",marginBottom:8,letterSpacing:"0.06em"}}>Team Plan Required</div>
            <div style={{fontSize:10,color:MUT,marginBottom:20,lineHeight:1.7}}>Organisation features — multi-user access, shared machine library, and ACL — require a Team or Business plan.</div>
            <button onClick={()=>setTab("billing")} style={{...btnA,...sm}}>View Plans</button>
          </div>
      )}
      {tab==="billing"&&<BillingPage profile={profile} company={company} session={session}/>}
    </div>
  );
}
export default SettingsPage;