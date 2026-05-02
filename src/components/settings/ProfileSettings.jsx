import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, TXT, GRN, RED, inp, sel, btnA, btnG, col, dvdr, sm } from '../../lib/styles';
import { updateProfile } from '../../lib/db';
import GuestUpgradeModal from '../auth/GuestUpgradeModal';
function ProfileSettings({profile,setProfile,session,onSignOut,isGuest}){
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

  return(
    <div>
      <div style={sec}>
        <div style={{fontSize:9,color:ACC,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,marginBottom:12}}>Profile</div>
        <div style={{...col,marginBottom:10}}><div style={lbl}>Display Name</div><input style={inp} value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="e.g. Jane Smith"/></div>
        <div style={{...col,marginBottom:10}}><div style={lbl}>Username</div><input style={{...inp,opacity:0.5}} value={profile?.username||""} disabled/></div>
        <div style={{...col,marginBottom:10}}><div style={lbl}>Email</div><input style={{...inp,opacity:0.5}} value={session?.user?.email||""} disabled/></div>
        <div style={{...col,marginBottom:10}}>
          <div style={lbl}>Units</div>
          <div style={{display:"flex",gap:6}}>
            {["metric","imperial"].map(u=><button key={u} onClick={()=>setUnits(u)} style={{...btnG,...sm,...(units===u?{background:ACC,color:"#fff",border:"1px solid "+ACC}:{})}}>{u.charAt(0).toUpperCase()+u.slice(1)}</button>)}
          </div>
        </div>
        <div style={{...col,marginBottom:12}}>
          <div style={lbl}>Default Machine Status</div>
          <select style={sel} value={defaultStatus} onChange={e=>setDefaultStatus(e.target.value)}>
            {["Active","Queued","Complete"].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        {err&&<div style={{fontSize:10,color:RED,marginBottom:10}}>{err}</div>}
        {saved&&<div style={{fontSize:10,color:GRN,marginBottom:10}}>✓ Saved</div>}
        <button onClick={saveProfile} disabled={saving} style={{...btnA,...sm,opacity:saving?0.6:1}}>{saving?"Saving…":"Save Profile"}</button>
      </div>

      {!isGuest&&<div style={sec}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:pwSection?12:0}}>
          <div style={{fontSize:9,color:ACC,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700}}>Change Password</div>
          <button onClick={()=>setPwSection(o=>!o)} style={{...btnG,...sm}}>{pwSection?"▲":"▼"}</button>
        </div>
        {pwSection&&<>
          <div style={{...col,marginBottom:8}}><div style={lbl}>New Password</div><input style={inp} type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="Min. 8 characters"/></div>
          <div style={{...col,marginBottom:10}}><div style={lbl}>Confirm Password</div><input style={inp} type="password" value={confPw} onChange={e=>setConfPw(e.target.value)}/></div>
          {pwErr&&<div style={{fontSize:10,color:RED,marginBottom:8}}>{pwErr}</div>}
          {pwSaved&&<div style={{fontSize:10,color:GRN,marginBottom:8}}>✓ Password updated</div>}
          <button onClick={changePassword} disabled={pwBusy} style={{...btnA,...sm,opacity:pwBusy?0.6:1}}>{pwBusy?"Saving…":"Update Password"}</button>
        </>}
      </div>}

      {isGuest&&<div style={{...sec,background:"#0a1a0a",border:"1px solid #1a3a1a",borderRadius:2,padding:16,marginBottom:20}}>
        <div style={{fontSize:9,color:GRN,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,marginBottom:6}}>Save Your Data</div>
        <div style={{fontSize:10,color:MUT,marginBottom:12,lineHeight:1.6}}>Create an account to keep your machines and sign back in any time.</div>
        <button onClick={()=>setShowUpgrade(true)} style={{...btnA,...sm,background:"#1a7a3a",borderColor:"#1a7a3a"}}>Create Account</button>
      </div>}

      <div>
        <div style={{fontSize:9,color:ACC,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,marginBottom:12}}>Account</div>
        <button onClick={onSignOut} style={{...btnG,...sm,color:RED,border:"1px solid "+RED}}>Sign Out</button>
      </div>
      {showUpgrade&&<GuestUpgradeModal profile={profile} setProfile={setProfile} onClose={()=>setShowUpgrade(false)}/>}
    </div>
  );
}
export default ProfileSettings;