import React, { useState } from 'react';
import { ACC, btnG, sm } from '../../lib/styles';
import ProfileSettings from './ProfileSettings';
import CompanySettings from './CompanySettings';
import BillingPage from './BillingPage';
import AdminPanel from './AdminPanel';

const ADMIN_EMAIL = 'ratbenchadmin@gmail.com';

function SettingsPage({profile,setProfile,session,company,setCompany,onSignOut}){
  const isAdmin = session?.user?.email === ADMIN_EMAIL;
  const [tab,setTab]=useState("profile");
  const tabs=[["profile","Profile"],["company","Company / Org"],["billing","Billing"],...(isAdmin?[["admin","⚙ Admin"]]:[])];
  return(
    <div style={{padding:16,flex:1,maxWidth:560,margin:"0 auto",width:"100%"}}>
      <div style={{display:"flex",gap:4,marginBottom:20,flexWrap:"wrap"}}>
        {tabs.map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{...btnG,...sm,...(tab===id?{background:ACC,color:"#fff",border:"1px solid "+ACC}:{})}}>{label}</button>
        ))}
      </div>
      {tab==="profile"&&<ProfileSettings profile={profile} setProfile={setProfile} session={session} onSignOut={onSignOut} isGuest={!!session?.user?.is_anonymous}/>}
      {tab==="company"&&<CompanySettings profile={profile} setProfile={setProfile} company={company} setCompany={setCompany} session={session}/>}
      {tab==="billing"&&<BillingPage profile={profile} company={company} session={session}/>}
      {tab==="admin"&&isAdmin&&<AdminPanel/>}
    </div>
  );
}
export default SettingsPage;
