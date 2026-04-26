import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { inp, btnA, btnG } from '../../lib/styles';
// ── Password Reset Screen ─────────────────────────────────────────────────────
function PasswordResetScreen({onComplete}){
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [done,setDone]=useState(false);

  const save=async()=>{
    if(!password||password.length<8){setError("Password must be at least 8 characters.");return;}
    if(password!==confirm){setError("Passwords don't match.");return;}
    setLoading(true);setError("");
    const{error}=await supabase.auth.updateUser({password});
    if(error){setError(error.message);setLoading(false);}
    else{setDone(true);setTimeout(()=>onComplete(),2000);}
  };

  return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'IBM Plex Mono',monospace"}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:36,marginBottom:10}}>🐀</div>
          <div style={{fontSize:16,fontWeight:700,color:ACC,letterSpacing:"0.06em",textTransform:"uppercase"}}>Reset Password</div>
          <div style={{fontSize:10,color:MUT,marginTop:8}}>Choose a new password for your account.</div>
        </div>
        <div style={{background:SURF,border:"1px solid "+BRD,borderTop:"2px solid "+ACC,borderRadius:3,padding:20}}>
          {done?<div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:24,marginBottom:8}}>✓</div>
            <div style={{fontSize:11,color:GRN}}>Password updated. Redirecting...</div>
          </div>:<>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:9,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>New Password</div>
            <input style={{...inp}} type="password" placeholder="Min. 8 characters" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:9,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Confirm Password</div>
            <input style={{...inp}} type="password" placeholder="Repeat password" value={confirm} onChange={e=>setConfirm(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&save()} />
          </div>
          {error&&<div style={{fontSize:10,color:RED,marginBottom:12,padding:"8px 10px",background:"#200e0e",border:"1px solid #3a1a1a",borderRadius:2}}>{error}</div>}
          <button onClick={save} disabled={loading} style={{...btnA,width:"100%",padding:"11px 0",fontSize:10,letterSpacing:"0.1em",opacity:loading?0.6:1}}>
            {loading?"Saving...":"Set New Password"}
          </button>
          </>}
        </div>
      </div>
    </div>
  );
}

const INDUSTRIES = ["Small Engine Repair","Automotive","Marine / Watercraft","Agricultural / Farm Equipment","Construction / Earthmoving","Lawn & Garden","Motorcycle / Powersports","EV / Electric","Mining","Forestry","General Mechanical","Other"];
const COUNTRIES   = ["Australia","New Zealand","United States","United Kingdom","Canada","Other"];
export default PasswordResetScreen;