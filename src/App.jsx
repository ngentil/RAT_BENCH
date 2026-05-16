import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { BG, TXT, MUT, ACC, BRD, SURF, RED, GRN, btnG, sm } from './lib/styles';
import { getMachines, getMyCompany, getClients, migrateLocalClients } from './lib/db';
import { getVehicles } from './lib/db/vehicles';
import { getEquipment } from './lib/db/equipment';
import { getTools } from './lib/db/tools';
import { fromDb } from './lib/db/transforms';
import { TABS, WORKSHOP_TABS } from './lib/constants';
import { effectiveTier } from './lib/gates';
import { getMachineServiceStatus } from './lib/helpers';

const TIER_GLOW = {
  enthusiast: { color: "#e8670a", label: "Enthusiast" },
  team:       { color: "#0a8fe8", label: "Team"       },
  business:   { color: "#e8c20a", label: "Business"   },
};
import AuthScreen from './components/auth/AuthScreen';
import OnboardingScreen from './components/auth/OnboardingScreen';
import PasswordResetScreen from './components/auth/PasswordResetScreen';
import SettingsPage from './components/settings/SettingsPage';
import Tracker from './components/tracker/Tracker';
import JobBoard from './components/tracker/JobBoard';
import SpecSearch from './components/tracker/SpecSearch';
import WikiTab from './components/wiki/WikiTab';
import UsersTab from './components/users/UsersTab';
import ServiceReminders from './components/tracker/ServiceReminders';
import RevenueDashboard from './components/tracker/RevenueDashboard';
import CustomersTab from './components/customers/CustomersTab';
import PartsTab from './components/tracker/PartsTab';
import ToolsTab from './components/tools/ToolsTab';
import VehiclesTab from './components/vehicles/VehiclesTab';
import EquipmentTab from './components/equipment/EquipmentTab';
import ConsumablesTab from './components/consumables/ConsumablesTab';
function App(){
  const [tab,setTab]=useState(()=>{
    const stored=localStorage.getItem("rat_tab")||"tracker";
    const WS_IDS=new Set(["parts","clients","tools","vehicles","equipment","consumables","revenue"]);
    if(WS_IDS.has(stored)){localStorage.setItem("rat_workshop_tab",stored);return"workshop";}
    if(stored==="users") return "tracker";
    return stored;
  });
  const [workshopTab,setWorkshopTab]=useState(()=>localStorage.getItem("rat_workshop_tab")||"parts");
  const [workshopVisibleTabs,setWorkshopVisibleTabs]=useState(()=>{
    try{return JSON.parse(localStorage.getItem("rat_workshop_visible")||"null");}catch{return null;}
  });
  const [machines,setMachines]=useState([]);
  const [clients,setClients]=useState([]);
  const [vehicles,setVehicles]=useState([]);
  const [equipment,setEquipment]=useState([]);
  const [tools,setTools]=useState([]);
  const [initializing,setInitializing]=useState(true);
  const [error,setError]=useState(null);
  const initializedRef=useRef(false);
  const [session,setSession]=useState(null);
  const [authChecked,setAuthChecked]=useState(false);
  const [profile,setProfile]=useState(null);
  const [profileChecked,setProfileChecked]=useState(false);
  const [passwordReset,setPasswordReset]=useState(false);
  const [company,setCompany]=useState(null);
  const [billingBanner,setBillingBanner]=useState(()=>{
    const p=new URLSearchParams(window.location.search);
    return p.get("billing")||null;
  });
  const [announcements,setAnnouncements]=useState([]);
  const [dismissedAnns,setDismissedAnns]=useState(()=>{
    try{return JSON.parse(localStorage.getItem("rat_dismissed_anns")||"[]");}catch{return[];}
  });

  const dismissAnn=(id)=>{
    const next=[...dismissedAnns,id];
    localStorage.setItem("rat_dismissed_anns",JSON.stringify(next));
    setDismissedAnns(next);
    setAnnouncements(prev=>prev.filter(a=>a.id!==id));
  };

  // Load data for a given session.
  // First call blocks the UI (initializing screen); subsequent calls refresh silently.
  const loadForSession = async(session) => {
    const first = !initializedRef.current;
    if(!session){
      setSession(null);setProfile(null);setMachines([]);setCompany(null);setClients([]);
      setVehicles([]);setEquipment([]);setTools([]);
      setAuthChecked(true);setProfileChecked(true);setInitializing(false);
      initializedRef.current=true;
      return;
    }
    setSession(session);
    if(first) setProfileChecked(false);
    try {
      const {data:profileData} = await supabase
        .from("profiles").select("*").eq("id",session.user.id).single();
      if(profileData){
        setProfile(profileData);
        if(profileData.company_id){
          const co=await getMyCompany(profileData.company_id);
          setCompany(co);
        }
      } else if(session.user.is_anonymous){
        const guestSuffix=session.user.id.replace(/-/g,"").slice(0,6);
        const {data:guest}=await supabase.from("profiles").upsert({
          id:session.user.id,
          username:`guest_${guestSuffix}`,
          display_name:"Guest",
          account_type:"personal",
        },{onConflict:"id"}).select().single();
        setProfile(guest||null);
      } else {
        if(first) setProfile(null);
      }
    } catch(e){ if(first) setProfile(null); }
    setProfileChecked(true);
    setAuthChecked(true);
    try {
      const ms = await getMachines();
      setMachines(Array.isArray(ms)?ms:[]);
    } catch(e){ if(first) setError("Could not load machines."); }
    try {
      await migrateLocalClients(session.user.id);
      const cs = await getClients();
      setClients(Array.isArray(cs)?cs:[]);
    } catch(e){ console.error("Could not load clients:", e); }
    try {
      const vs = await getVehicles();
      setVehicles(Array.isArray(vs)?vs:[]);
    } catch(e){ console.error("Could not load vehicles:", e); }
    try {
      const eq = await getEquipment();
      setEquipment(Array.isArray(eq)?eq:[]);
    } catch(e){ console.error("Could not load equipment:", e); }
    try {
      const ts = await getTools();
      setTools(Array.isArray(ts)?ts:[]);
    } catch(e){ console.error("Could not load tools:", e); }
    try {
      const userTier=profileData?.tier||"free";
      const{data:anns}=await supabase.from("announcements").select("*")
        .eq("active",true).or(`tier_filter.eq.all,tier_filter.eq.${userTier}`);
      if(anns){
        const dismissed=JSON.parse(localStorage.getItem("rat_dismissed_anns")||"[]");
        setAnnouncements(anns.filter(a=>!dismissed.includes(a.id)&&(!a.expires_at||new Date(a.expires_at)>new Date())));
      }
    }catch{}
    if(first){ setInitializing(false); initializedRef.current=true; }
  };

  useEffect(()=>{ localStorage.setItem("rat_tab",tab); },[tab]);
  useEffect(()=>{ localStorage.setItem("rat_workshop_tab",workshopTab); },[workshopTab]);
  useEffect(()=>{ localStorage.setItem("rat_workshop_visible",JSON.stringify(workshopVisibleTabs)); },[workshopVisibleTabs]);

  useEffect(()=>{
    if(!profile) return;
    const validTopIds=new Set(TABS.map(t=>t.id).concat(["settings"]));
    if(!validTopIds.has(tab)) setTab("tracker");
    const tier=effectiveTier(profile,company);
    const wsDef=WORKSHOP_TABS.find(t=>t.id===workshopTab);
    if(wsDef?.enthusiastOnly&&tier==="free") setWorkshopTab("parts");
  },[profile,company]);

  useEffect(()=>{
    // Bootstrap from existing session
    supabase.auth.getSession().then(({data:{session}})=>loadForSession(session));
    // Listen for auth changes (login/logout)
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      if(_event==="PASSWORD_RECOVERY"){
        setPasswordReset(true);
        setSession(session);
        setAuthChecked(true);
        setProfileChecked(true);
        setInitializing(false);
        initializedRef.current=true;
        return;
      }
      if(_event==="TOKEN_REFRESHED"){
        setSession(session);
        return;
      }
      setPasswordReset(false);
      loadForSession(session);
    });
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(billingBanner){
      const url=new URL(window.location.href);
      url.searchParams.delete("billing");
      window.history.replaceState({},"",url.toString());
    }
  },[billingBanner]);

  // Poll for tier update after billing success — only once session is loaded
  useEffect(()=>{
    if(billingBanner!=="success"||!session?.user?.id) return;
    let attempts=0;
    const poll=setInterval(async()=>{
      attempts++;
      const {data:p}=await supabase.from("profiles").select("*").eq("id",session.user.id).single();
      if(p) setProfile(p);
      if(attempts>=8) clearInterval(poll);
    },2000);
    return ()=>clearInterval(poll);
  },[billingBanner,session?.user?.id]);

  // Realtime sync — machines updated by other org members propagate here
  useEffect(()=>{
    if(!company?.id) return;
    const channel=supabase
      .channel("machines-sync")
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"machines",filter:`company_id=eq.${company.id}`},(payload)=>{
        setMachines(prev=>prev.map(m=>m.id===payload.new.id?fromDb(payload.new):m));
      })
      .subscribe();
    return ()=>supabase.removeChannel(channel);
  },[company?.id]);

  const signOut=async()=>{
    await supabase.auth.signOut();
    // onAuthStateChange will fire with null session and call loadForSession(null)
    // which resets all state correctly — don't touch state here
  };

  // Initial load — block the UI until auth + data are ready
  if(initializing||!authChecked||!profileChecked){
    return (
      <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
        <div className="loading-rat" style={{fontSize:44,lineHeight:1}}>🐀</div>
        <div className="loading-text" style={{display:"flex",alignItems:"center",gap:1,fontSize:10,color:MUT,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"0.18em",textTransform:"uppercase"}}>
          Loading<span className="loading-dot">.</span><span className="loading-dot">.</span><span className="loading-dot">.</span>
        </div>
      </div>
    );
  }

  // Password reset flow
  if(passwordReset) return <PasswordResetScreen onComplete={()=>{setPasswordReset(false);loadForSession(session);}} />;

  // Not logged in
  if(!session) return <AuthScreen />;

  // Logged in but no profile — show onboarding
  if(!profile) return <OnboardingScreen session={session} onComplete={p=>setProfile(p)} />;

  if(error){
    return (
      <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,padding:20}}>
        <div style={{fontSize:32}}>⚠️</div>
        <div style={{fontSize:11,color:RED,fontFamily:"'IBM Plex Mono',monospace",textAlign:"center",lineHeight:1.6,maxWidth:320}}>{error}</div>
      </div>
    );
  }

  const tier=effectiveTier(profile,company);
  const tierGlow = TIER_GLOW[tier];
  const overdueCount = machines.filter(m => getMachineServiceStatus(m).overdue).length;
  const dueSoonCount = machines.filter(m => { const s = getMachineServiceStatus(m); return !s.overdue && s.dueSoon; }).length;
  const timerRunning = machines.some(m => (m.jobTimers || []).some(t => t.status === "running"));
  const visibleWorkshopTabs = WORKSHOP_TABS.filter(t=>{
    if(t.enthusiastOnly&&tier==="free") return false;
    if(workshopVisibleTabs&&!workshopVisibleTabs.includes(t.id)) return false;
    return true;
  });

  return (
    <div style={{minHeight:"100vh",background:BG,color:TXT,fontFamily:"'IBM Plex Mono',monospace",display:"flex",flexDirection:"column",overflowX:"hidden"}}>
      {billingBanner==="success"&&(
        <div style={{background:"#0a1a0a",color:"#00ff66",fontSize:11,fontWeight:700,letterSpacing:"0.12em",textAlign:"center",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 0 24px #00ff6688, 0 0 6px #00ff6644",borderBottom:"1px solid #00ff6655"}}>
          <span style={{textShadow:"0 0 12px #00ff66, 0 0 4px #00ff66"}}>✓ SUBSCRIPTION ACTIVE — WELCOME TO YOUR NEW PLAN</span>
          <button onClick={()=>setBillingBanner(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#00ff66",fontSize:13,lineHeight:1,opacity:0.7}}>✕</button>
        </div>
      )}
      {billingBanner==="cancelled"&&(
        <div style={{background:"#333",color:MUT,fontSize:10,letterSpacing:"0.08em",textAlign:"center",padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          <span>Checkout cancelled — no charge was made.</span>
          <button onClick={()=>setBillingBanner(null)} style={{background:"none",border:"none",cursor:"pointer",color:MUT,fontSize:12,lineHeight:1}}>✕</button>
        </div>
      )}
      {billingBanner==="managed"&&(
        <div style={{background:"#1a1a1a",color:MUT,fontSize:10,letterSpacing:"0.08em",textAlign:"center",padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"center",gap:10,borderBottom:"1px solid #333"}}>
          <span>Billing updated. Changes may take a moment to reflect.</span>
          <button onClick={()=>setBillingBanner(null)} style={{background:"none",border:"none",cursor:"pointer",color:MUT,fontSize:12,lineHeight:1}}>✕</button>
        </div>
      )}
      {announcements.map(a=>(
        <div key={a.id} style={{background:"#0d0d18",borderBottom:"1px solid "+ACC+"44",color:TXT,fontSize:10,padding:"8px 16px",display:"flex",alignItems:"center",gap:10,lineHeight:1.5}}>
          <span style={{flex:1}}>{a.message}{a.link_url&&<>{" "}<a href={a.link_url} target="_blank" rel="noreferrer" style={{color:ACC,textDecoration:"none",fontWeight:700}}>{a.link_label||"Learn more"} →</a></>}</span>
          <button onClick={()=>dismissAnn(a.id)} style={{background:"none",border:"none",cursor:"pointer",color:MUT,fontSize:13,lineHeight:1,flexShrink:0}}>✕</button>
        </div>
      ))}
      <div style={{background:SURF,borderBottom:`3px solid ${tierGlow?.color||ACC}`,boxShadow:tierGlow?`0 2px 8px ${tierGlow.color}99, 0 4px 24px ${tierGlow.color}55`:"none",padding:"12px 18px",display:"flex",alignItems:"center",gap:10,position:"relative",zIndex:10}}>
        <a href="https://ratbench.net" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none",flex:1}}>
          {company?.logo
            ? <img src={company.logo} alt="" style={{width:36,height:36,objectFit:"cover",borderRadius:2,border:"1px solid "+BRD}}/>
            : <span style={{fontSize:20}}>🐀</span>}
          <div>
            <div style={{fontSize:17,fontWeight:700,color:ACC,letterSpacing:"0.04em",textTransform:"uppercase"}}>Rat Bench</div>
            {company
              ? <div style={{fontSize:9,color:TXT,letterSpacing:"0.08em",textTransform:"uppercase",marginTop:1}}>{company.name}</div>
              : <div style={{fontSize:9,color:MUT,letterSpacing:"0.18em",textTransform:"uppercase",marginTop:1}}>small engine & equipment repair</div>}
            {tierGlow&&<div style={{fontSize:8,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",marginTop:2,color:tierGlow.color,textShadow:`0 0 8px ${tierGlow.color}`}}>{tierGlow.label}</div>}
          </div>
        </a>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:9,color:MUT,letterSpacing:"0.06em"}}>{profile?.display_name||profile?.username}</span>
          {session?.user?.is_anonymous&&<button onClick={signOut} style={{...btnG,...sm,fontSize:8}}>Sign Out</button>}
          {!session?.user?.is_anonymous&&<button onClick={()=>setTab("settings")} style={{...btnG,...sm,fontSize:8}}>⚙️</button>}
        </div>
      </div>
      <div className="tab-bar" style={{background:SURF,borderBottom:"1px solid "+BRD,overflowX:"auto",overflowY:"hidden",display:"flex",scrollbarWidth:"none"}}>
        {TABS.map(t=>{
          const active=tab===t.id;
          const badge=
            t.id==="reminders"&&overdueCount>0?{n:overdueCount,c:RED}:
            t.id==="reminders"&&dueSoonCount>0?{n:dueSoonCount,c:"#e8870a"}:
            t.id==="jobs"&&timerRunning?{n:"▶",c:GRN}:
            null;
          return (
          <button key={t.id} onClick={()=>setTab(t.id)} className="tab-btn" style={{flexShrink:0,padding:"10px 10px",fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:active?ACC:MUT,cursor:"pointer",border:"none",background:active?ACC+"12":"none",borderBottom:active?"2px solid "+ACC:"2px solid transparent",fontFamily:"'IBM Plex Mono',monospace",whiteSpace:"nowrap",position:"relative"}}>
            {t.label}
            {badge&&<span style={{position:"absolute",top:4,right:2,fontSize:7,fontWeight:900,lineHeight:1,background:badge.c+"22",color:badge.c,border:"1px solid "+badge.c+"66",borderRadius:2,padding:"0px 3px"}}>{badge.n}</span>}
          </button>
          );
        })}
      </div>
      {tab==="workshop"&&(
        <div style={{background:SURF,borderBottom:"1px solid "+BRD,overflowX:"auto",overflowY:"hidden",display:"flex",scrollbarWidth:"none"}}>
          {visibleWorkshopTabs.map(t=>(
            <button key={t.id} onClick={()=>setWorkshopTab(t.id)} style={{flexShrink:0,padding:"8px 10px",fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:workshopTab===t.id?ACC:MUT,cursor:"pointer",border:"none",background:"none",borderBottom:workshopTab===t.id?"2px solid "+ACC:"2px solid transparent",fontFamily:"'IBM Plex Mono',monospace",whiteSpace:"nowrap"}}>
              {t.label}
            </button>
          ))}
        </div>
      )}
      {tab==="workshop"&&tier==="free"&&(
        <div style={{background:"#111",borderBottom:"1px solid #333",padding:"6px 16px",fontSize:9,color:MUT,letterSpacing:"0.06em",display:"flex",alignItems:"center",gap:10}}>
          <span>🔨 Workshop — free tier limited to 5 items per type.</span>
          <button onClick={()=>setTab("settings")} style={{background:"none",border:"none",cursor:"pointer",color:ACC,fontSize:9,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,letterSpacing:"0.06em",padding:0}}>Upgrade to Enthusiast →</button>
        </div>
      )}
      <div style={{display:tab==="tracker"?"contents":"none"}}><Tracker     machines={machines} setMachines={setMachines} company={company} profile={profile} setProfile={setProfile} clients={clients} isGuest={!!session?.user?.is_anonymous} onGoToBilling={()=>setTab("settings")}/></div>
      <div style={{display:tab==="jobs"?"contents":"none"}}><JobBoard    machines={machines} setMachines={setMachines} profile={profile} company={company} session={session} clients={clients} onGoToBilling={()=>setTab("settings")}/></div>
      <div style={{display:tab==="reminders"?"contents":"none"}}><ServiceReminders machines={machines} setMachines={setMachines} profile={profile} company={company} onGoToBilling={()=>setTab("settings")}/></div>
      <div style={{display:tab==="search"?"contents":"none"}}><SpecSearch  machines={machines} /></div>
      <div style={{display:tab==="wiki"?"block":"none",padding:16,flex:1,overflowY:"auto"}}><WikiTab session={session} profile={profile} company={company} onGoToBilling={()=>setTab("settings")}/></div>
      <div style={{display:tab==="workshop"&&workshopTab==="parts"?"contents":"none"}}><PartsTab machines={machines} session={session} profile={profile} company={company} onGoToBilling={()=>setTab("settings")}/></div>
      <div style={{display:tab==="workshop"&&workshopTab==="clients"?"contents":"none"}}><CustomersTab machines={machines} setMachines={setMachines} clients={clients} setClients={setClients} session={session} company={company} profile={profile} onGoToBilling={()=>setTab("settings")}/></div>
      <div style={{display:tab==="workshop"&&workshopTab==="tools"?"contents":"none"}}><ToolsTab session={session} profile={profile} company={company} onGoToBilling={()=>setTab("settings")}/></div>
      <div style={{display:tab==="workshop"&&workshopTab==="vehicles"?"contents":"none"}}><VehiclesTab vehicles={vehicles} setVehicles={setVehicles} session={session} profile={profile} company={company} onGoToBilling={()=>setTab("settings")}/></div>
      <div style={{display:tab==="workshop"&&workshopTab==="equipment"?"contents":"none"}}><EquipmentTab equipment={equipment} setEquipment={setEquipment} session={session} profile={profile} company={company} onGoToBilling={()=>setTab("settings")}/></div>
      <div style={{display:tab==="workshop"&&workshopTab==="consumables"?"contents":"none"}}><ConsumablesTab machines={machines} session={session} profile={profile} company={company} onGoToBilling={()=>setTab("settings")}/></div>
      <div style={{display:tab==="workshop"&&workshopTab==="revenue"?"contents":"none"}}><RevenueDashboard machines={machines} company={company} profile={profile} onGoToBilling={()=>setTab("settings")}/></div>
      <div style={{display:tab==="settings"?"contents":"none"}}><SettingsPage profile={profile} setProfile={setProfile} session={session} company={company} setCompany={setCompany} onSignOut={signOut} machines={machines} vehicles={vehicles} equipment={equipment} tools={tools} workshopVisibleTabs={workshopVisibleTabs} setWorkshopVisibleTabs={(v)=>{setWorkshopVisibleTabs(v);}} workshopTab={workshopTab} setWorkshopTab={setWorkshopTab}/></div>
    </div>
  );
}
export default App;