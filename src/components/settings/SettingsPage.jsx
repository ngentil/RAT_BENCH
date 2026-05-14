import React, { useState } from 'react';
import { ACC, MUT, btnG, sm } from '../../lib/styles';
import ProfileSettings from './ProfileSettings';
import CompanySettings from './CompanySettings';
import BillingPage from './BillingPage';
import AdminPanel from './AdminPanel';

const ADMIN_EMAIL = 'ratbenchadmin@gmail.com';

function SettingsPage({profile,setProfile,session,company,setCompany,onSignOut,machines,vehicles,equipment,tools}){
  const isAdmin = session?.user?.email === ADMIN_EMAIL;
  const [tab,setTab]=useState("profile");
  const tabs=[["profile","Profile"],["company","Company / Org"],["billing","Billing"],...(isAdmin?[["admin","⚙ Admin"]]:[])];
  return(
    <div style={{padding:16,flex:1,maxWidth:560,margin:"0 auto",width:"100%"}}>
      <div style={{display:"flex",borderBottom:"1px solid #252525",marginBottom:20}}>
        {tabs.map(([id,label])=>(
          <button key={id} className="tab-btn" onClick={()=>setTab(id)} style={{background:"none",border:"none",borderBottom:tab===id?"2px solid "+ACC:"2px solid transparent",color:tab===id?ACC:MUT,padding:"10px 14px",fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",transition:"color 0.12s",whiteSpace:"nowrap"}}>{label}</button>
        ))}
      </div>
      {tab==="profile"&&<ProfileSettings profile={profile} setProfile={setProfile} session={session} onSignOut={onSignOut} isGuest={!!session?.user?.is_anonymous} machines={machines}/>}
      {tab==="company"&&<CompanySettings profile={profile} setProfile={setProfile} company={company} setCompany={setCompany} session={session} machines={machines} vehicles={vehicles} equipment={equipment} tools={tools}/>}
      {tab==="billing"&&<BillingPage profile={profile} company={company} session={session}/>}
      {tab==="admin"&&isAdmin&&<AdminPanel/>}
    </div>
  );
}
export default SettingsPage;
