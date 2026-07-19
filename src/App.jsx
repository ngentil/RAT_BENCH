import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { BG, TXT, MUT, ACC, BRD, SURF, RED, GRN, btnG, sm } from './lib/styles';
import { getMachines, getMyCompany, getClients, migrateLocalClients } from './lib/db';
import { getVehicles } from './lib/db/vehicles';
import { getEquipment } from './lib/db/equipment';
import { getTools } from './lib/db/tools';
import { fromDb } from './lib/db/transforms';
import { TABS, WORKSHOP_TABS } from './lib/constants';
import { getMachineServiceStatus } from './lib/helpers';
import { savePref, migrateLocalPreferences } from './lib/db/preferences';
import { applyTabOrder } from './lib/tabOrder';
import { subscribeSitePresence } from './lib/presence';
import AuthScreen from './components/auth/AuthScreen';
import PasswordResetScreen from './components/auth/PasswordResetScreen';
import TermsPage from './components/legal/TermsPage';
import PrivacyPage from './components/legal/PrivacyPage';
import DataRetentionPage from './components/legal/DataRetentionPage';
import SettingsPage from './components/settings/SettingsPage';
import Tracker from './components/tracker/Tracker';
import JobBoard from './components/tracker/JobBoard';
import WikiTab from './components/wiki/WikiTab';
import MarketplaceTab from './components/marketplace/MarketplaceTab';
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
  const [tab,setTab]=useState("tracker");
  const [workshopTab,setWorkshopTab]=useState("parts");
  const [settingsTab,setSettingsTab]=useState("profile");
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
  const [templateMachineId,setTemplateMachineId]=useState(()=>{
    const p=new URLSearchParams(window.location.search);
    return p.get("template")||null;
  });
  const [retrying,setRetrying]=useState(false);
  const [announcements,setAnnouncements]=useState([]);
  const [dismissedAnns,setDismissedAnns]=useState([]);
  const [prefsSynced,setPrefsSynced]=useState(false);
  const [onlineCount,setOnlineCount]=useState(null);

  const dismissAnn=(id)=>{
    const next=[...dismissedAnns,id];
    savePref(profile?.id,'dismissedAnns',next);
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
      // Reset preference sync so the next sign-in restores that user's prefs
      setPrefsSynced(false);prefsSyncStartedRef.current=false;
      setAuthChecked(true);setProfileChecked(true);setInitializing(false);
      initializedRef.current=true;
      return;
    }
    setSession(session);
    setProfileChecked(false);

    // profileData/companyData declared here so they're in scope for the announcements fetch below
    let profileData = null;
    let companyData = null;
    try {
      const {data} = await supabase.rpc("get_my_profile").single();
      profileData = data;
      if(profileData){
        setProfile(profileData);
        if(profileData.company_id){
          const co=await getMyCompany(profileData.company_id);
          companyData = co;
          setCompany(co);
        }
      } else if(session.user.is_anonymous){
        const guestSuffix=session.user.id.replace(/-/g,"").slice(0,6);
        const {data:guest, error:guestErr}=await supabase.rpc('create_my_profile',{
          p_username:`guest_${guestSuffix}`,
          p_display_name:'Guest',
        }).single();
        if(guestErr) throw guestErr;
        profileData = guest;
        setProfile(guest||null);
      } else {
        // Regular user, first login after email confirm — auto-create profile from signup metadata
        const rawUsername = session.user.user_metadata?.username || "";
        const username = rawUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,20)
          || `user_${session.user.id.replace(/-/g,"").slice(0,6)}`;
        const {data:autoProfile, error:autoErr} = await supabase.rpc('create_my_profile',{
          p_username: username,
        }).single();
        if(autoErr) throw autoErr;
        profileData = autoProfile;
        setProfile(autoProfile||null);
      }
      if(!profileData && first) throw new Error("Profile unavailable");
    } catch(e){ if(first){ setProfile(null); setError("Could not load your profile. Please refresh the page."); } }
    setProfileChecked(true);
    setAuthChecked(true);

    // All five data loads run in parallel — was sequential (up to ~2.5s), now ~one RTT
    const [msR, csR, vsR, eqR, tsR] = await Promise.allSettled([
      getMachines(),
      (async () => { await migrateLocalClients(session.user.id); return getClients(); })(),
      getVehicles(),
      getEquipment(),
      getTools(),
    ]);
    const loadErrs = [];
    if (msR.status === 'fulfilled') setMachines(Array.isArray(msR.value) ? msR.value : []);
    else loadErrs.push("machines");
    if (csR.status === 'fulfilled') setClients(Array.isArray(csR.value) ? csR.value : []);
    else loadErrs.push("clients");
    if (vsR.status === 'fulfilled') setVehicles(Array.isArray(vsR.value) ? vsR.value : []);
    else loadErrs.push("vehicles");
    if (eqR.status === 'fulfilled') setEquipment(Array.isArray(eqR.value) ? eqR.value : []);
    else loadErrs.push("equipment");
    if (tsR.status === 'fulfilled') setTools(Array.isArray(tsR.value) ? tsR.value : []);
    else loadErrs.push("tools");

    if(first && loadErrs.length >= 4){
      // Total failure — almost certainly a transient network blip. Retry once after 2 s.
      setRetrying(true);
      await new Promise(r=>setTimeout(r,2000));
      const [msR2,csR2,vsR2,eqR2,tsR2]=await Promise.allSettled([
        getMachines(),
        (async()=>{ await migrateLocalClients(session.user.id); return getClients(); })(),
        getVehicles(),
        getEquipment(),
        getTools(),
      ]);
      setRetrying(false);
      const retryErrs=[];
      if(msR2.status==='fulfilled') setMachines(Array.isArray(msR2.value)?msR2.value:[]);
      else retryErrs.push("machines");
      if(csR2.status==='fulfilled') setClients(Array.isArray(csR2.value)?csR2.value:[]);
      else retryErrs.push("clients");
      if(vsR2.status==='fulfilled') setVehicles(Array.isArray(vsR2.value)?vsR2.value:[]);
      else retryErrs.push("vehicles");
      if(eqR2.status==='fulfilled') setEquipment(Array.isArray(eqR2.value)?eqR2.value:[]);
      else retryErrs.push("equipment");
      if(tsR2.status==='fulfilled') setTools(Array.isArray(tsR2.value)?tsR2.value:[]);
      else retryErrs.push("tools");
      if(retryErrs.length) setError(`Could not load: ${retryErrs.join(", ")}. Check your connection and refresh.`);
    } else if(first && loadErrs.length){
      setError(`Could not load: ${loadErrs.join(", ")}. Check your connection and refresh.`);
    }
    if(first){ setInitializing(false); initializedRef.current=true; }
    // Fetch announcements after UI is visible — non-blocking
    (async()=>{
      try {
        if (!profileData) return;
        const{data:anns}=await supabase.from("announcements").select("*")
          .eq("active",true);
        if(anns){
          const dismissed=profileData?.preferences?.dismissedAnns||[];
          setAnnouncements(anns.filter(a=>!dismissed.includes(a.id)&&(!a.expires_at||new Date(a.expires_at)>new Date())));
        }
      }catch{}
    })();
  };

  useEffect(()=>{ if(prefsSynced&&profile?.id) savePref(profile.id,'tab',tab); },[tab,prefsSynced,profile?.id]);
  useEffect(()=>{ if(prefsSynced&&profile?.id) savePref(profile.id,'workshopTab',workshopTab); },[workshopTab,prefsSynced,profile?.id]);

  // Site-wide "N online" — real Presence count, shared with the public wiki
  // subdomain via the same channel, shown always in the top bar regardless
  // of which tab is active.
  useEffect(()=>subscribeSitePresence(setOnlineCount),[]);

  // Ref guard: setPrefsSynced(true) lands asynchronously, so a profile refresh
  // (e.g. the billing poll) mid-migration must not start a second migration or
  // yank the user back to their saved tab.
  const prefsSyncStartedRef=useRef(false);
  useEffect(()=>{
    if(!profile) return;
    if(!prefsSynced&&!prefsSyncStartedRef.current){
      prefsSyncStartedRef.current=true;
      const prefs=profile.preferences||{};
      const WS_IDS=new Set(["parts","clients","tools","vehicles","equipment","consumables","revenue","reminders"]);
      if(prefs.tab&&prefs.tab!=="users"){
        // Reminders used to be its own top-level tab — route old saved prefs
        // straight to its new home instead of the last-used workshop sub-tab.
        if(prefs.tab==="reminders"){setTab("workshop");setWorkshopTab("reminders");}
        else if(WS_IDS.has(prefs.tab)){setTab("workshop");if(prefs.workshopTab)setWorkshopTab(prefs.workshopTab);}
        else setTab(prefs.tab);
      } else if(prefs.workshopTab){
        setWorkshopTab(prefs.workshopTab);
      }
      if(prefs.dismissedAnns) setDismissedAnns(prefs.dismissedAnns);
      migrateLocalPreferences(profile.id, prefs).then(()=>setPrefsSynced(true));
    }
    const validTopIds=new Set(TABS.map(t=>t.id).concat(["settings"]));
    if(!validTopIds.has(tab)) setTab("tracker");
    const wsVis=profile?.tab_order?.workshop_visible;
    if(Array.isArray(wsVis)&&!wsVis.includes(workshopTab)){
      const first=wsVis.find(id=>WORKSHOP_TABS.some(t=>t.id===id));
      if(first) setWorkshopTab(first);
    }
  },[profile,company]);

  useEffect(()=>{
    // onAuthStateChange fires INITIAL_SESSION immediately on mount — no need for a separate
    // getSession() call. Using both causes a race condition where two loadForSession calls
    // run in parallel and one can win with null profile.
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
    if(templateMachineId){
      const url=new URL(window.location.href);
      url.searchParams.delete("template");
      window.history.replaceState({},"",url.toString());
    }
  },[]);

  // Realtime sync — machines updated by other org members propagate here
  useEffect(()=>{
    if(!company?.id) return;
    const channel=supabase
      .channel("machines-sync")
      .on("postgres_changes",{event:"*",schema:"public",table:"machines",filter:`company_id=eq.${company.id}`},(payload)=>{
        if(payload.eventType==="DELETE"){
          const gone=payload.old?.id;
          if(gone) setMachines(prev=>prev.filter(m=>m.id!==gone));
          return;
        }
        const row=payload.new;
        if(!row||row.company_id!==company.id) return;
        const mapped=fromDb(row);
        // UPDATE for a known row replaces it; INSERT (or update for an unseen
        // row) prepends so teammates' new machines appear without a reload
        setMachines(prev=>prev.some(m=>m.id===row.id)
          ?prev.map(m=>m.id===row.id?mapped:m)
          :[mapped,...prev]);
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
        {retrying?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,textAlign:"center",padding:"0 24px"}}>
            <div style={{fontSize:10,color:MUT,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"0.12em"}}>Taking a bit longer than usual…</div>
            <div style={{fontSize:9,color:"#444",fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"0.08em"}}>slow connection — giving it another go</div>
          </div>
        ):(
          <div className="loading-text" style={{display:"flex",alignItems:"center",gap:1,fontSize:10,color:MUT,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"0.18em",textTransform:"uppercase"}}>
            Loading<span className="loading-dot">.</span><span className="loading-dot">.</span><span className="loading-dot">.</span>
          </div>
        )}
      </div>
    );
  }

  // Password reset flow
  if(passwordReset) return <PasswordResetScreen onComplete={()=>{setPasswordReset(false);loadForSession(session);}} />;

  // Not logged in
  if(!session) return <AuthScreen />;

  if(error || !profile){
    return (
      <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,padding:20}}>
        <div style={{fontSize:32}}>⚠️</div>
        <div style={{fontSize:11,color:RED,fontFamily:"'IBM Plex Mono',monospace",textAlign:"center",lineHeight:1.6,maxWidth:320}}>{error || "Could not load your profile. Please refresh the page."}</div>
      </div>
    );
  }

  const goToBilling=()=>{ setSettingsTab("billing"); setTab("settings"); };
  const overdueCount = machines.filter(m => getMachineServiceStatus(m).overdue).length;
  const dueSoonCount = machines.filter(m => { const s = getMachineServiceStatus(m); return !s.overdue && s.dueSoon; }).length;
  const timerRunning = machines.some(m => (m.jobTimers || []).some(t => t.status === "running"));
  const savedWorkshopVisible = profile?.tab_order?.workshop_visible;
  const visibleWorkshopTabs = applyTabOrder(
    WORKSHOP_TABS.filter(t=>{
      if(savedWorkshopVisible&&!savedWorkshopVisible.includes(t.id)) return false;
      return true;
    }),
    profile?.tab_order?.workshop
  );
  const orderedMainTabs = applyTabOrder(TABS, profile?.tab_order?.main);
  const mainTabsToShow = orderedMainTabs;

  return (
    <div style={{minHeight:"100vh",background:BG,color:TXT,fontFamily:"'IBM Plex Mono',monospace",display:"flex",flexDirection:"column",overflowX:"hidden"}}>
      {announcements.map(a=>(
        <div key={a.id} style={{background:"#0d0d18",borderBottom:"1px solid "+ACC+"44",color:TXT,fontSize:10,padding:"8px 16px",display:"flex",alignItems:"center",gap:10,lineHeight:1.5}}>
          <span style={{flex:1}}>{a.message}{a.link_url&&<>{" "}<a href={a.link_url} target="_blank" rel="noreferrer" style={{color:ACC,textDecoration:"none",fontWeight:700}}>{a.link_label||"Learn more"} →</a></>}</span>
          <button onClick={()=>dismissAnn(a.id)} style={{background:"none",border:"none",cursor:"pointer",color:MUT,fontSize:13,lineHeight:1,flexShrink:0}}>✕</button>
        </div>
      ))}
      <div style={{background:SURF,borderBottom:"3px solid "+ACC,padding:"12px 18px",display:"flex",alignItems:"center",gap:10,position:"relative",zIndex:10}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none",flex:1}}>
          {company?.logo
            ? <img src={company.logo} alt="" style={{width:36,height:36,objectFit:"cover",borderRadius:2,border:"1px solid "+BRD}}/>
            : <span style={{fontSize:20}}>🐀</span>}
          <div>
            <div style={{fontSize:17,fontWeight:700,color:ACC,letterSpacing:"0.04em",textTransform:"uppercase"}}>Rat Bench</div>
            {company
              ? <div style={{fontSize:9,color:TXT,letterSpacing:"0.08em",textTransform:"uppercase",marginTop:1}}>{company.name}</div>
              : <div style={{fontSize:9,color:MUT,letterSpacing:"0.18em",textTransform:"uppercase",marginTop:1}}>small engine & equipment repair</div>}
          </div>
        </a>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:9,color:MUT,letterSpacing:"0.06em"}}>{profile?.display_name||profile?.username}</span>
            {onlineCount!=null&&(
              <span style={{display:"flex",alignItems:"center",gap:5}} title="People currently using Rat Bench">
                <span className="live-dot" style={{width:6,height:6,borderRadius:"50%",background:GRN,display:"inline-block"}}/>
                <span style={{fontSize:9,color:MUT}}><span style={{color:GRN,fontWeight:700}}>{onlineCount}</span> online</span>
              </span>
            )}
          </span>
          {session?.user?.is_anonymous&&<button onClick={signOut} style={{...btnG,...sm,fontSize:10}}>Sign Out</button>}
          {!session?.user?.is_anonymous&&<button onClick={()=>setTab("settings")} style={{...btnG,...sm,fontSize:10}}>⚙️</button>}
        </div>
      </div>
      <div className="tab-bar tab-bar-rocker" style={{background:SURF,borderBottom:"1px solid "+BRD,overflowX:"auto",overflowY:"hidden",display:"flex",scrollbarWidth:"none"}}>
        {mainTabsToShow.map(t=>{
          const active=tab===t.id;
          const badge=
            t.id==="workshop"&&overdueCount>0?{n:overdueCount,c:RED}:
            t.id==="workshop"&&dueSoonCount>0?{n:dueSoonCount,c:"#e8870a"}:
            t.id==="jobs"&&timerRunning?{n:"▶",c:GRN}:
            null;
          return (
          <button key={t.id} onClick={()=>setTab(t.id)} className={"tab-btn tab-btn-rocker"+(active?" on":"")} style={{flex:"1 1 0",minWidth:0,padding:"10px 8px 13px",fontSize:10,fontWeight:active?900:700,letterSpacing:"0.06em",textTransform:"uppercase",color:active?ACC:MUT,cursor:"pointer",border:"none",background:active?"#191410":"none",fontFamily:"'IBM Plex Mono',monospace",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textAlign:"center",position:"relative"}}>
            {t.label}
            <span className="lamp" />
            {badge&&<span style={{position:"absolute",top:4,right:2,fontSize:9,fontWeight:900,lineHeight:1,background:badge.c+"22",color:badge.c,border:"1px solid "+badge.c+"66",borderRadius:2,padding:"0px 3px"}}>{badge.n}</span>}
          </button>
          );
        })}
      </div>
      {tab==="workshop"&&(
        <div className="tab-bar-rocker" style={{background:SURF,borderBottom:"1px solid "+BRD,overflowX:"auto",overflowY:"hidden",display:"flex",scrollbarWidth:"none"}}>
          {visibleWorkshopTabs.map(t=>{
            const active=workshopTab===t.id;
            const badge=
              t.id==="reminders"&&overdueCount>0?{n:overdueCount,c:RED}:
              t.id==="reminders"&&dueSoonCount>0?{n:dueSoonCount,c:"#e8870a"}:
              null;
            return (
            <button key={t.id} onClick={()=>setWorkshopTab(t.id)} className={"tab-btn-rocker"+(active?" on":"")} style={{flexShrink:0,padding:"8px 12px 11px",fontSize:10,fontWeight:active?900:700,letterSpacing:"0.06em",textTransform:"uppercase",color:active?ACC:MUT,cursor:"pointer",border:"none",background:active?"#191410":"none",fontFamily:"'IBM Plex Mono',monospace",whiteSpace:"nowrap",position:"relative"}}>
              {t.label}
              <span className="lamp" />
              {badge&&<span style={{position:"absolute",top:2,right:2,fontSize:9,fontWeight:900,lineHeight:1,background:badge.c+"22",color:badge.c,border:"1px solid "+badge.c+"66",borderRadius:2,padding:"0px 3px"}}>{badge.n}</span>}
            </button>
            );
          })}
        </div>
      )}

      <div style={{display:tab==="tracker"?"contents":"none"}}><Tracker     machines={machines} setMachines={setMachines} company={company} profile={profile} setProfile={setProfile} clients={clients} isGuest={!!session?.user?.is_anonymous} onGoToBilling={()=>goToBilling("unknown")} templateMachineId={templateMachineId} onTemplateClear={()=>setTemplateMachineId(null)}/></div>
      <div style={{display:tab==="jobs"?"contents":"none"}}><JobBoard    machines={machines} setMachines={setMachines} profile={profile} company={company} session={session} clients={clients} onGoToBilling={()=>goToBilling("unknown")}/></div>
      <div style={{display:tab==="wiki"?"block":"none",padding:16,flex:1,overflowY:"auto"}}><WikiTab session={session} profile={profile} company={company} onGoToBilling={()=>goToBilling("unknown")}/></div>
      <div style={{display:tab==="marketplace"?"block":"none",padding:16,flex:1,overflowY:"auto"}}>{profile&&<MarketplaceTab machines={machines} profile={profile} company={company} onGoToBilling={()=>goToBilling("unknown")}/>}</div>
      <div style={{display:tab==="workshop"&&workshopTab==="reminders"?"contents":"none"}}><ServiceReminders machines={machines} setMachines={setMachines} profile={profile} company={company} onGoToBilling={()=>goToBilling("unknown")}/></div>
      <div style={{display:tab==="workshop"&&workshopTab==="parts"?"contents":"none"}}><PartsTab machines={machines} session={session} profile={profile} company={company} onGoToBilling={()=>goToBilling("unknown")}/></div>
      <div style={{display:tab==="workshop"&&workshopTab==="clients"?"contents":"none"}}><CustomersTab machines={machines} setMachines={setMachines} clients={clients} setClients={setClients} session={session} company={company} profile={profile} onGoToBilling={()=>goToBilling("unknown")}/></div>
      <div style={{display:tab==="workshop"&&workshopTab==="tools"?"contents":"none"}}><ToolsTab session={session} profile={profile} company={company} onGoToBilling={()=>goToBilling("unknown")}/></div>
      <div style={{display:tab==="workshop"&&workshopTab==="vehicles"?"contents":"none"}}><VehiclesTab vehicles={vehicles} setVehicles={setVehicles} session={session} profile={profile} company={company} onGoToBilling={()=>goToBilling("unknown")}/></div>
      <div style={{display:tab==="workshop"&&workshopTab==="equipment"?"contents":"none"}}><EquipmentTab equipment={equipment} setEquipment={setEquipment} session={session} profile={profile} company={company} onGoToBilling={()=>goToBilling("unknown")}/></div>
      <div style={{display:tab==="workshop"&&workshopTab==="consumables"?"contents":"none"}}><ConsumablesTab machines={machines} session={session} profile={profile} company={company} onGoToBilling={()=>goToBilling("unknown")}/></div>
      <div style={{display:tab==="workshop"&&workshopTab==="revenue"?"contents":"none"}}><RevenueDashboard machines={machines} company={company} profile={profile} onGoToBilling={()=>goToBilling("unknown")}/></div>
      {tab==="settings"&&<SettingsPage profile={profile} setProfile={setProfile} session={session} company={company} setCompany={setCompany} onSignOut={signOut} machines={machines} vehicles={vehicles} equipment={equipment} tools={tools} initialTab={settingsTab}/>}
    </div>
  );
}
function AppRouter() {
  // Normalize trailing slashes and case so /terms/ and /Terms still match.
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase() || '/';
  const backToApp = () => { window.location.href = '/'; };
  if (path === '/terms')          return <TermsPage onClose={backToApp} />;
  if (path === '/privacy')        return <PrivacyPage onClose={backToApp} />;
  if (path === '/data-retention') return <DataRetentionPage onClose={backToApp} />;
  return <App />;
}
export default AppRouter;