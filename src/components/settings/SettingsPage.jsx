import React, { useState } from 'react';
import { ACC, MUT } from '../../lib/styles';
import { effectiveTier } from '../../lib/gates';
import { applyTabOrder } from '../../lib/tabOrder';
import ProfileSettings from './ProfileSettings';
import CompanySettings from './CompanySettings';
import BillingPage from './BillingPage';
import AdminPanel from './AdminPanel';
import StorageSettings from './StorageSettings';
import TabOrderSettings from './TabOrderSettings';
import UsersTab from '../users/UsersTab';

const ADMIN_EMAILS = [import.meta.env.VITE_ADMIN_EMAIL, 'nathan.gentil.ai@gmail.com', 'nathan.gentil@gmail.com'].filter(Boolean);

function SettingsPage({profile,setProfile,session,company,setCompany,onSignOut,machines,vehicles,equipment,tools,initialTab}){
  const isAdmin = ADMIN_EMAILS.includes(session?.user?.email);
  const tier = effectiveTier(profile, company);
  const isPaid = tier !== "free";
  const [tab,setTab]=useState(initialTab||"profile");
  const baseTabs=[
    {id:"profile",  label:"Profile"},
    {id:"company",  label:"Company / Org"},
    {id:"billing",  label:"Billing"},
    {id:"storage",  label:"Billing & Storage"},
    {id:"tabs",     label:"⇅ Tabs"},
    ...(isPaid?[{id:"users",label:"👥 Users"}]:[]),
  ];
  const tabs = applyTabOrder(baseTabs, profile?.tab_order?.settings).concat(
    isAdmin ? [{id:"admin",label:"⚙ Admin"}] : []
  );
  return(
    <div style={{padding:16,flex:1,maxWidth:560,margin:"0 auto",width:"100%"}}>
      <div style={{display:"flex",borderBottom:"1px solid #252525",marginBottom:20,overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none",msOverflowStyle:"none"}}>
        {tabs.map(({id,label})=>(
          <button key={id} className="tab-btn" onClick={()=>setTab(id)} style={{background:"none",border:"none",borderBottom:tab===id?"2px solid "+ACC:"2px solid transparent",color:tab===id?ACC:MUT,padding:"10px 14px",fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",transition:"color 0.12s",whiteSpace:"nowrap",flexShrink:0}}>{label}</button>
        ))}
      </div>
      {tab==="profile"&&<ProfileSettings profile={profile} setProfile={setProfile} session={session} onSignOut={onSignOut} isGuest={!!session?.user?.is_anonymous} machines={machines}/>}
      {tab==="company"&&<CompanySettings profile={profile} setProfile={setProfile} company={company} setCompany={setCompany} session={session} machines={machines} vehicles={vehicles} equipment={equipment} tools={tools}/>}
      {tab==="billing"&&<BillingPage profile={profile} company={company} session={session}/>}
      {tab==="storage"&&<StorageSettings profile={profile} setProfile={setProfile} company={company} setCompany={setCompany}/>}
      {tab==="tabs"&&<TabOrderSettings profile={profile} setProfile={setProfile}/>}
      {tab==="users"&&isPaid&&<UsersTab company={company} session={session} profile={profile} setCompany={setCompany} onGoToBilling={()=>setTab("billing")}/>}
      {tab==="admin"&&isAdmin&&<AdminPanel/>}
    </div>
  );
}
export default SettingsPage;
