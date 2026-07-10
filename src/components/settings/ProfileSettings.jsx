import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, TXT, GRN, RED, inp, sel, btnA, btnG, col, dvdr, sm } from '../../lib/styles';
import { updateProfile } from '../../lib/db';
import { getMyContributionStats, getMyWikiPoints, setWikiLeaderboardOptIn } from '../../lib/wiki';
import GuestUpgradeModal from '../auth/GuestUpgradeModal';
import { Tooltip } from '../ui/shared';
const TIER_LABEL = { enthusiast:"Enthusiast", team:"Team", business:"Business" };

function timeLeft(expiresAt) {
  const ms = new Date(expiresAt) - Date.now();
  if (ms <= 0) return null;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function ProfileSettings({profile,setProfile,session,onSignOut,isGuest,machines}){
  const [displayName,setDisplayName]=useState(profile?.display_name||"");
  const [units,setUnits]=useState(profile?.units||"metric");
  const [defaultStatus,setDefaultStatus]=useState(profile?.default_status||"Active");
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [err,setErr]=useState("");
  const [pwSection,setPwSection]=useState(false);
  const [showUpgrade,setShowUpgrade]=useState(false);
  const [curPw,setCurPw]=useState(""),   [newPw,setNewPw]=useState(""),   [confPw,setConfPw]=useState("");
  const [pwErr,setPwErr]=useState(""),   [pwSaved,setPwSaved]=useState(false),   [pwBusy,setPwBusy]=useState(false);
  const [applyBusy,setApplyBusy]=useState(false);
  const [applyMsg,setApplyMsg]=useState(null);
  const [contrib,setContrib]=useState(null);
  const [wikiPoints,setWikiPoints]=useState(0);
  const [leaderboardOptIn,setLeaderboardOptIn]=useState(!!profile?.wiki_leaderboard_opt_in);
  const [optInSaving,setOptInSaving]=useState(false);

  useEffect(()=>{
    if(isGuest||!session?.user?.id) return;
    let alive=true;
    getMyContributionStats(session.user.id).then(s=>{ if(alive) setContrib(s); });
    getMyWikiPoints().then(p=>{ if(alive) setWikiPoints(p); });
    return ()=>{alive=false;};
  },[isGuest,session?.user?.id]);

  const toggleLeaderboardOptIn = async () => {
    const next = !leaderboardOptIn;
    setLeaderboardOptIn(next); setOptInSaving(true);
    try {
      await setWikiLeaderboardOptIn(profile.id, next);
      setProfile(p=>({...p, wiki_leaderboard_opt_in: next}));
    } catch (e) {
      setLeaderboardOptIn(!next); // revert on failure
    }
    setOptInSaving(false);
  };

  const pendingValid = profile?.pending_code && profile?.pending_code_expires_at
    && new Date(profile.pending_code_expires_at) > new Date();
  const remaining = pendingValid ? timeLeft(profile.pending_code_expires_at) : null;

  const activateUpgrade = async () => {
    setApplyBusy(true); setApplyMsg(null);
    const { data, error } = await supabase.rpc("apply_pending_upgrade");
    setApplyBusy(false);
    if (error || data?.error) { setApplyMsg({ ok:false, text: error?.message||data?.error }); return; }
    const { data:p } = await supabase.from("profiles").select("*").eq("id",session.user.id).single();
    if (p) setProfile(p);
    setApplyMsg({ ok:true, text:`You're now on the ${TIER_LABEL[data.tier]||data.tier} plan!` });
  };

  const saveProfile=async()=>{
    setSaving(true);setErr("");setSaved(false);
    try{
      const p=await updateProfile(session.user.id,{display_name:displayName.trim()||null,units,default_status:defaultStatus});
      setProfile(prev=>({...prev,...p}));setSaved(true);setTimeout(()=>setSaved(false),2500);
    }catch(e){setErr(e.message||"Save failed");}
    setSaving(false);
  };

  const changePassword=async()=>{
    if(newPw!==confPw){setPwErr("Passwords don't match.");return;}
    if(newPw.length<8){setPwErr("Minimum 8 characters.");return;}
    setPwBusy(true);setPwErr("");
    const{error}=await supabase.auth.updateUser({password:newPw});
    if(error){setPwErr(error.message);}else{setPwSaved(true);setCurPw("");setNewPw("");setConfPw("");setTimeout(()=>setPwSaved(false),2500);}
    setPwBusy(false);
  };

  const lbl={fontSize:9,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4};
  const sec={marginBottom:20,paddingBottom:20,borderBottom:"1px solid "+BRD};
  const secHd={fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,color:TXT,borderLeft:"2px solid "+ACC,paddingLeft:8,marginBottom:12};
  const secHdRed={fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,color:TXT,borderLeft:"2px solid "+RED,paddingLeft:8,marginBottom:12};
  const secSep={paddingTop:20,marginTop:20,borderTop:"1px solid #252525"};

  return(
    <div>
      {isGuest&&<div style={{background:"#0a1a0a",border:"1px solid #1a3a1a",borderRadius:2,padding:16,marginBottom:20}}>
        <div style={{fontSize:9,color:GRN,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,marginBottom:6}}>Save Your Data</div>
        <div style={{fontSize:10,color:MUT,marginBottom:12,lineHeight:1.6}}>Create an account to keep your machines and sign back in any time.</div>
        <button onClick={()=>setShowUpgrade(true)} style={{...btnA,...sm,background:"#1a7a3a",borderColor:"#1a7a3a"}}>Create Account</button>
      </div>}
      {pendingValid&&(
        <div style={{marginBottom:20,background:"#08100a",border:"1px solid "+GRN+"55",borderRadius:2,padding:16}}>
          <div style={{fontSize:9,color:GRN,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,marginBottom:8}}>Pending Plan Upgrade</div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:TXT,fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>
            {profile.pending_code}
          </div>
          <div style={{fontSize:10,color:MUT,marginBottom:12,lineHeight:1.6}}>
            Grants access to the <span style={{color:GRN,fontWeight:700}}>{TIER_LABEL[profile.pending_tier]||profile.pending_tier}</span> plan.{" "}
            {remaining?<>Expires in <span style={{color:TXT}}>{remaining}</span>.</>:<span style={{color:RED}}>Expired.</span>}
          </div>
          {applyMsg&&<div style={{fontSize:10,color:applyMsg.ok?GRN:RED,marginBottom:10}}>{applyMsg.ok?"✓ ":"✗ "}{applyMsg.text}</div>}
          {!applyMsg?.ok&&remaining&&(
            <button onClick={activateUpgrade} disabled={applyBusy} style={{...btnA,...sm,background:"#1a6a2a",borderColor:"#1a6a2a",opacity:applyBusy?0.6:1}}>
              {applyBusy?"Activating…":"Activate Upgrade"}
            </button>
          )}
        </div>
      )}
      <div style={sec}>
        <div style={secHd}>Profile</div>
        <div style={{...col,marginBottom:10}}><div style={lbl}>Display Name</div><input style={inp} value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="e.g. Jane Smith"/></div>
        <div style={{...col,marginBottom:10}}><div style={lbl}>Username</div><input style={{...inp,opacity:0.5}} value={profile?.username||""} disabled/></div>
        <div style={{...col,marginBottom:10}}><div style={lbl}>Email</div><input style={{...inp,opacity:0.5}} value={session?.user?.email||""} disabled/></div>
        <div style={{...col,marginBottom:10}}>
          <Tooltip text="Sets how measurements display across the app — mm/L/Nm for metric, in/gal/ft-lb for imperial">
            <div style={lbl}>Units</div>
          </Tooltip>
          <div style={{display:"flex",gap:6}}>
            {["metric","imperial"].map(u=><button key={u} onClick={()=>setUnits(u)} style={{...btnG,...sm,...(units===u?{background:ACC,color:"#fff",border:"1px solid "+ACC}:{})}}>{u.charAt(0).toUpperCase()+u.slice(1)}</button>)}
          </div>
        </div>
        <div style={{...col,marginBottom:12}}>
          <Tooltip text="New machines are pre-set to this status when added — Active, Queued (waiting on parts) or Complete">
            <div style={lbl}>Default Machine Status</div>
          </Tooltip>
          <select style={sel} value={defaultStatus} onChange={e=>setDefaultStatus(e.target.value)}>
            {["Active","Queued","Complete"].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        {err&&<div style={{fontSize:10,color:RED,marginBottom:10}}>{err}</div>}
        {saved&&<div style={{fontSize:10,color:GRN,marginBottom:10}}>✓ Saved</div>}
        <button onClick={saveProfile} disabled={saving} style={{...btnA,...sm,opacity:saving?0.6:1}}>{saving?"Saving…":"Save Profile"}</button>
        {contrib&&(contrib.entries>0||contrib.edits>0||wikiPoints!==0)&&(
          <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid "+BRD}}>
            <div style={{fontSize:9,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Wiki Contributions</div>
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:1,background:ACC+"0d",border:"1px solid "+ACC+"33",borderRadius:2,padding:"10px 12px"}}>
                <div style={{fontSize:18,fontWeight:700,color:ACC}}>{contrib.entries}</div>
                <div style={{fontSize:8,color:MUT,textTransform:"uppercase",letterSpacing:"0.08em"}}>machine{contrib.entries!==1?"s":""} enriched</div>
              </div>
              <div style={{flex:1,background:ACC+"0d",border:"1px solid "+ACC+"33",borderRadius:2,padding:"10px 12px"}}>
                <div style={{fontSize:18,fontWeight:700,color:ACC}}>{contrib.edits}</div>
                <div style={{fontSize:8,color:MUT,textTransform:"uppercase",letterSpacing:"0.08em"}}>spec edit{contrib.edits!==1?"s":""}</div>
              </div>
              <div style={{flex:1,background:GRN+"0d",border:"1px solid "+GRN+"33",borderRadius:2,padding:"10px 12px"}}>
                <div style={{fontSize:18,fontWeight:700,color:GRN}}>{wikiPoints}</div>
                <div style={{fontSize:8,color:MUT,textTransform:"uppercase",letterSpacing:"0.08em"}}>point{wikiPoints!==1?"s":""}</div>
              </div>
            </div>
            <div style={{fontSize:8,color:MUT,marginTop:8,lineHeight:1.6}}>Thanks for helping build the community reference. 🔧</div>
            <label style={{display:"flex",alignItems:"center",gap:8,marginTop:12,cursor:"pointer",opacity:optInSaving?0.6:1}}>
              <input type="checkbox" checked={leaderboardOptIn} onChange={toggleLeaderboardOptIn} disabled={optInSaving} />
              <span style={{fontSize:9,color:MUT}}>Show me on the public wiki leaderboard</span>
            </label>
          </div>
        )}
      </div>

      {!isGuest&&<div style={{...sec,...secSep}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:pwSection?12:0}}>
          <div style={{...secHd,marginBottom:0}}>Security</div>
          <button onClick={()=>setPwSection(o=>!o)} style={{...btnG,...sm}}>{pwSection?"▲":"▼"}</button>
        </div>
        {pwSection&&<>
          <div style={{...col,marginBottom:8,marginTop:12}}><div style={lbl}>New Password</div><input style={inp} type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="Min. 8 characters"/></div>
          <div style={{...col,marginBottom:10}}><div style={lbl}>Confirm Password</div><input style={inp} type="password" value={confPw} onChange={e=>setConfPw(e.target.value)}/></div>
          {pwErr&&<div style={{fontSize:10,color:RED,marginBottom:8}}>{pwErr}</div>}
          {pwSaved&&<div style={{fontSize:10,color:GRN,marginBottom:8}}>✓ Password updated</div>}
          <button onClick={changePassword} disabled={pwBusy} style={{...btnA,...sm,opacity:pwBusy?0.6:1}}>{pwBusy?"Saving…":"Update Password"}</button>
        </>}
      </div>}

      {machines?.length > 0 && (
        <div style={{...sec,...secSep}}>
          <div style={secHd}>Data</div>
          <div style={{fontSize:10,color:MUT,lineHeight:1.6,marginBottom:10}}>
            Export all your machine data as a JSON backup file.
          </div>
          <button onClick={()=>{
            const data={exportedAt:new Date().toISOString(),machines};
            const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
            const url=URL.createObjectURL(blob);
            const a=document.createElement("a");
            a.href=url;a.download=`ratbench-backup-${new Date().toISOString().slice(0,10)}.json`;
            a.click();URL.revokeObjectURL(url);
          }} style={{...btnG,...sm}}>⬇ Export Machines ({machines.length})</button>
        </div>
      )}

      <div style={secSep}>
        <div style={secHdRed}>Account</div>
        <button onClick={onSignOut} style={{...btnG,...sm,color:RED,border:"1px solid "+RED}}>Sign Out</button>
      </div>
      {showUpgrade&&<GuestUpgradeModal profile={profile} setProfile={setProfile} onClose={()=>setShowUpgrade(false)}/>}
    </div>
  );
}
export default ProfileSettings;