import React, { useState } from 'react';
import { ACC, MUT, BRD, TXT, btnG, sm } from '../../lib/styles';
import { effectiveTier } from '../../lib/gates';
import { WORKSHOP_TABS } from '../../lib/constants';
import ProfileSettings from './ProfileSettings';
import CompanySettings from './CompanySettings';
import BillingPage from './BillingPage';
import AdminPanel from './AdminPanel';
import StorageSettings from './StorageSettings';
import UsersTab from '../users/UsersTab';

const ADMIN_EMAIL = 'ratbenchadmin@gmail.com';

function WorkshopPrefs({workshopVisibleTabs,setWorkshopVisibleTabs,workshopTab,setWorkshopTab,tier}){
  const allIds=WORKSHOP_TABS.filter(t=>!(t.enthusiastOnly&&tier==="free")).map(t=>t.id);
  const visible=workshopVisibleTabs||allIds;
  const toggle=(id)=>{
    const next=visible.includes(id)?visible.filter(x=>x!==id):[...visible,id];
    if(next.length===0) return;
    setWorkshopVisibleTabs(next);
    if(!next.includes(workshopTab)) setWorkshopTab(next[0]);
  };
  const setDefault=(id)=>{ if(visible.includes(id)) setWorkshopTab(id); };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div>
        <div style={{fontSize:9,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Visible tabs</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {WORKSHOP_TABS.filter(t=>!(t.enthusiastOnly&&tier==="free")).map(t=>(
            <label key={t.id} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:11,color:TXT}}>
              <input type="checkbox" checked={visible.includes(t.id)} onChange={()=>toggle(t.id)} style={{accentColor:ACC}}/>
              {t.label}
              {visible.includes(t.id)&&workshopTab===t.id&&<span style={{fontSize:8,color:ACC,letterSpacing:"0.08em",marginLeft:4}}>DEFAULT</span>}
            </label>
          ))}
        </div>
      </div>
      <div>
        <div style={{fontSize:9,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Default tab</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {WORKSHOP_TABS.filter(t=>!(t.enthusiastOnly&&tier==="free")&&visible.includes(t.id)).map(t=>(
            <button key={t.id} onClick={()=>setDefault(t.id)} style={{...btnG,...sm,...(workshopTab===t.id?{background:ACC,color:"#fff",border:"1px solid "+ACC}:{})}}>{t.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsPage({profile,setProfile,session,company,setCompany,onSignOut,machines,vehicles,equipment,tools,workshopVisibleTabs,setWorkshopVisibleTabs,workshopTab,setWorkshopTab}){
  const isAdmin = session?.user?.email === ADMIN_EMAIL;
  const tier = effectiveTier(profile, company);
  const isTeam = ["team","business"].includes(tier);
  const [tab,setTab]=useState("profile");
  const tabs=[
    ["profile","Profile"],
    ["company","Company / Org"],
    ["billing","Billing"],
    ["storage","Storage"],
    ["workshop","🔨 Workshop"],
    ...(isTeam?[["users","👥 Users"]]:[]),
    ...(isAdmin?[["admin","⚙ Admin"]]:[]),
  ];
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
      {tab==="storage"&&<StorageSettings profile={profile} setProfile={setProfile} company={company}/>}
      {tab==="workshop"&&<WorkshopPrefs workshopVisibleTabs={workshopVisibleTabs} setWorkshopVisibleTabs={setWorkshopVisibleTabs} workshopTab={workshopTab} setWorkshopTab={setWorkshopTab} tier={tier}/>}
      {tab==="users"&&isTeam&&<UsersTab company={company} session={session} profile={profile} setCompany={setCompany} onGoToBilling={()=>setTab("billing")}/>}
      {tab==="admin"&&isAdmin&&<AdminPanel/>}
    </div>
  );
}
export default SettingsPage;
