import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, TXT, BG, RED, inp, btnA, btnG, col } from '../../lib/styles';
import { RESERVED_USERNAMES } from '../../lib/constants';
function OnboardingScreen({session, onComplete}){
  const [username,setUsername]=useState(session?.user?.user_metadata?.username||"");
  const [accountType,setAccountType]=useState("personal");
  const [company,setCompany]=useState("");
  const [country,setCountry]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const COUNTRIES=["Australia","New Zealand","United States","United Kingdom","Canada","Ireland","South Africa","Other"];

  const save=async()=>{
    if(!username.trim()){setError("Username is required.");return;}
    if(!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())){setError("Username must be 3-20 characters, letters/numbers/underscores only.");return;}
    if(RESERVED_USERNAMES.has(username.trim().toLowerCase())){setError("That username is reserved — please choose another.");return;}
    setLoading(true);setError("");
    const{error}=await supabase.from("profiles").upsert({
      id:session.user.id,
      username:username.trim().toLowerCase(),
      account_type:accountType,
      company_name:company.trim()||null,
      country:country||null,
    },{onConflict:"id"});
    if(error){
      if(error.code==="23505")setError("That username is already taken — try another.");
      else setError(error.message);
      setLoading(false);
    } else {
      onComplete({username:username.trim().toLowerCase(),accountType,company,country});
    }
  };

  return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'IBM Plex Mono',monospace"}}>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:36,marginBottom:10}}>🐀</div>
          <div style={{fontSize:16,fontWeight:700,color:ACC,letterSpacing:"0.06em",textTransform:"uppercase"}}>Welcome to Rat Bench</div>
          <div style={{fontSize:10,color:MUT,marginTop:8,lineHeight:1.6}}>Just a few quick details to get you set up.</div>
        </div>

        <div style={{background:SURF,border:"1px solid "+BRD,borderTop:"2px solid "+ACC,borderRadius:3,padding:20}}>

          {/* Username */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:9,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Username *</div>
            <input style={{...inp}} placeholder="e.g. wrench_rat" value={username} onChange={e=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,""))} />
            <div style={{fontSize:8,color:"#444",marginTop:4}}>3-20 chars · letters, numbers, underscores · shown on wiki contributions</div>
          </div>

          {/* Account type */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:9,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>How are you using Rat Bench?</div>
            <div style={{display:"flex",gap:0,borderRadius:2,overflow:"hidden",border:"1px solid #252525"}}>
              {[["personal","🔧 Personal Tech"],["business","🏪 Shop / Business"]].map(([val,lbl])=>(
                <button key={val} onClick={()=>setAccountType(val)}
                  style={{flex:1,padding:"10px 4px",fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:"'IBM Plex Mono',monospace",cursor:"pointer",border:"none",background:accountType===val?ACC:"#0a0a0a",color:accountType===val?"#fff":MUT,transition:"background 0.15s"}}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Company name — business only */}
          {accountType==="business"&&<div style={{marginBottom:16}}>
            <div style={{fontSize:9,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Shop / Company Name</div>
            <input style={{...inp}} placeholder="e.g. Wrench Rat Small Engines" value={company} onChange={e=>setCompany(e.target.value)} />
          </div>}

          {/* Country */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:9,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Country</div>
            <select style={{...inp}} value={country} onChange={e=>setCountry(e.target.value)}>
              <option value="">— select country —</option>
              {COUNTRIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>

          {error&&<div style={{fontSize:10,color:RED,marginBottom:12,padding:"8px 10px",background:"#200e0e",border:"1px solid #3a1a1a",borderRadius:2}}>{error}</div>}

          <button onClick={save} disabled={loading}
            style={{...btnA,width:"100%",padding:"11px 0",fontSize:10,letterSpacing:"0.1em",opacity:loading?0.6:1}}>
            {loading?"Saving...":"Let's Go →"}
          </button>
        </div>

        <div style={{fontSize:8,color:"#333",textAlign:"center",marginTop:20}}>You can change these later in settings.</div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
// ── Password Reset Screen ─────────────────────────────────────────────────────
export default OnboardingScreen;