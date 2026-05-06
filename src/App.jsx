import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { BG, TXT, MUT, ACC, BRD, SURF, RED, GRN, btnG, sm } from './lib/styles';
import { getMachines, getMyCompany } from './lib/db';
import { TABS } from './lib/constants';
import AuthScreen from './components/auth/AuthScreen';
import OnboardingScreen from './components/auth/OnboardingScreen';
import PasswordResetScreen from './components/auth/PasswordResetScreen';
import SettingsPage from './components/settings/SettingsPage';
import Tracker from './components/tracker/Tracker';
import JobBoard from './components/tracker/JobBoard';
import SpecSearch from './components/tracker/SpecSearch';
import WikiTab from './components/wiki/WikiTab';
function App(){
  const [tab,setTab]=useState(()=>localStorage.getItem("rat_tab")||"tracker");
  const [machines,setMachines]=useState([]);
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

  // Load data for a given session.
  // First call blocks the UI (initializing screen); subsequent calls refresh silently.
  const loadForSession = async(session) => {
    const first = !initializedRef.current;
    if(!session){
      setSession(null);setProfile(null);setMachines([]);setCompany(null);
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
    if(first){ setInitializing(false); initializedRef.current=true; }
  };

  useEffect(()=>{ localStorage.setItem("rat_tab",tab); },[tab]);

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
      if(billingBanner==="success"){
        // Webhook may take a moment — poll until tier changes, then stop
        let attempts=0;
        const poll=setInterval(async()=>{
          attempts++;
          const {data:p}=await supabase.from("profiles").select("*").eq("id",session?.user?.id).single();
          if(p){ setProfile(p); }
          if(attempts>=6) clearInterval(poll);
        },2000);
      }
    }
  },[billingBanner]);

  const signOut=async()=>{
    await supabase.auth.signOut();
    // onAuthStateChange will fire with null session and call loadForSession(null)
    // which resets all state correctly — don't touch state here
  };

  // Initial load — block the UI until auth + data are ready
  if(initializing||!authChecked||!profileChecked){
    return (
      <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
        <div style={{fontSize:32}}>🐀</div>
        <div style={{fontSize:11,color:MUT,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"0.1em"}}>Loading...</div>
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

  return (
    <div style={{minHeight:"100vh",background:BG,color:TXT,fontFamily:"'IBM Plex Mono',monospace",display:"flex",flexDirection:"column"}}>
      {billingBanner==="success"&&(
        <div style={{background:GRN,color:"#000",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textAlign:"center",padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          <span>✓ SUBSCRIPTION ACTIVE — WELCOME TO YOUR NEW PLAN</span>
          <button onClick={()=>setBillingBanner(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#000",fontSize:12,lineHeight:1}}>✕</button>
        </div>
      )}
      {billingBanner==="cancelled"&&(
        <div style={{background:"#333",color:MUT,fontSize:10,letterSpacing:"0.08em",textAlign:"center",padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          <span>Checkout cancelled — no charge was made.</span>
          <button onClick={()=>setBillingBanner(null)} style={{background:"none",border:"none",cursor:"pointer",color:MUT,fontSize:12,lineHeight:1}}>✕</button>
        </div>
      )}
      <div style={{background:SURF,borderBottom:"2px solid "+ACC,padding:"12px 18px",display:"flex",alignItems:"center",gap:10}}>
        <a href="https://ratbench.net" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none",flex:1}}>
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
          <span style={{fontSize:9,color:MUT,letterSpacing:"0.06em"}}>{profile?.display_name||profile?.username}</span>
          {session?.user?.is_anonymous&&<button onClick={signOut} style={{...btnG,...sm,fontSize:8}}>Sign Out</button>}
          {!session?.user?.is_anonymous&&<button onClick={()=>setTab("settings")} style={{...btnG,...sm,fontSize:8}}>⚙️</button>}
        </div>
      </div>
      <div style={{display:"flex",background:SURF,borderBottom:"1px solid "+BRD}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 4px",fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:tab===t.id?ACC:MUT,cursor:"pointer",border:"none",background:"none",borderBottom:tab===t.id?"2px solid "+ACC:"2px solid transparent",fontFamily:"'IBM Plex Mono',monospace",whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{display:tab==="tracker"?"contents":"none"}}><Tracker     machines={machines} setMachines={setMachines} company={company} profile={profile} setProfile={setProfile} isGuest={!!session?.user?.is_anonymous}/></div>
      <div style={{display:tab==="jobs"?"contents":"none"}}><JobBoard    machines={machines} setMachines={setMachines} /></div>
      <div style={{display:tab==="search"?"contents":"none"}}><SpecSearch  machines={machines} /></div>
      <div style={{display:tab==="wiki"?"block":"none",padding:16,flex:1,overflowY:"auto"}}><WikiTab profile={profile}/></div>
      <div style={{display:tab==="settings"?"contents":"none"}}><SettingsPage profile={profile} setProfile={setProfile} session={session} company={company} setCompany={setCompany} onSignOut={signOut}/></div>
    </div>
  );
}
export default App;