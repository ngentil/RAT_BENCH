import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { BG, TXT, MUT, ACC, BRD, SURF, RED, btnG, sm } from './lib/styles';
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
  const [tab,setTab]=useState("tracker");
  const [machines,setMachines]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [session,setSession]=useState(null);
  const [authChecked,setAuthChecked]=useState(false);
  const [profile,setProfile]=useState(null);
  const [profileChecked,setProfileChecked]=useState(false);
  const [passwordReset,setPasswordReset]=useState(false);
  const [company,setCompany]=useState(null);

  // Load data for a given session
  const loadForSession = async(session) => {
    if(!session){
      setSession(null);setProfile(null);setMachines([]);setCompany(null);
      setAuthChecked(true);setProfileChecked(true);setLoading(false);
      return;
    }
    setSession(session);
    setLoading(true);setProfileChecked(false);
    try {
      const {data:profileData} = await supabase
        .from("profiles").select("*").eq("id",session.user.id).single();
      setProfile(profileData||null);
      if(profileData?.company_id){
        const co=await getMyCompany(profileData.company_id);
        setCompany(co);
      }
    } catch(e){ setProfile(null); }
    setProfileChecked(true);
    setAuthChecked(true);
    try {
      const machines = await getMachines();
      setMachines(Array.isArray(machines)?machines:[]);
    } catch(e){ setError("Could not load machines."); }
    setLoading(false);
  };

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
        setLoading(false);
        return;
      }
      setPasswordReset(false);
      loadForSession(session);
    });
    return ()=>subscription.unsubscribe();
  },[]);

  const signOut=async()=>{
    await supabase.auth.signOut();
    // onAuthStateChange will fire with null session and call loadForSession(null)
    // which resets all state correctly — don't touch state here
  };

  // Auth not yet checked
  if(!authChecked||!profileChecked){
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

  // Loading machines
  if(loading){
    return (
      <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
        <div style={{fontSize:32}}>🐀</div>
        <div style={{fontSize:11,color:MUT,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"0.1em"}}>Loading...</div>
      </div>
    );
  }

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
      <div style={{background:SURF,borderBottom:"2px solid "+ACC,padding:"12px 18px",display:"flex",alignItems:"center",gap:10}}>
        {company?.logo
          ? <img src={company.logo} alt="" style={{width:36,height:36,objectFit:"cover",borderRadius:2,border:"1px solid "+BRD}}/>
          : <span style={{fontSize:20}}>🐀</span>}
        <div style={{flex:1}}>
          <div style={{fontSize:17,fontWeight:700,color:ACC,letterSpacing:"0.04em",textTransform:"uppercase"}}>Rat Bench</div>
          {company
            ? <div style={{fontSize:9,color:TXT,letterSpacing:"0.08em",textTransform:"uppercase",marginTop:1}}>{company.name}</div>
            : <div style={{fontSize:9,color:MUT,letterSpacing:"0.18em",textTransform:"uppercase",marginTop:1}}>small engine & equipment repair</div>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:9,color:MUT,letterSpacing:"0.06em"}}>{profile?.display_name||profile?.username}</span>
          <button onClick={()=>setTab("settings")} style={{...btnG,...sm,fontSize:8}}>⚙️</button>
        </div>
      </div>
      <div style={{display:"flex",background:SURF,borderBottom:"1px solid "+BRD}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 4px",fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:tab===t.id?ACC:MUT,cursor:"pointer",border:"none",background:"none",borderBottom:tab===t.id?"2px solid "+ACC:"2px solid transparent",fontFamily:"'IBM Plex Mono',monospace",whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        ))}
      </div>
      {tab==="tracker" &&<Tracker     machines={machines} setMachines={setMachines} company={company} profile={profile}/>}
      {tab==="jobs"    &&<JobBoard    machines={machines} setMachines={setMachines} />}
      {tab==="search"  &&<SpecSearch  machines={machines} />}
      {tab==="wiki"    &&<div style={{padding:16,flex:1,overflowY:"auto"}}><WikiTab profile={profile}/></div>}
      {tab==="settings"&&<SettingsPage profile={profile} setProfile={setProfile} session={session} company={company} setCompany={setCompany} onSignOut={signOut}/>}
    </div>
  );
}
export default App;