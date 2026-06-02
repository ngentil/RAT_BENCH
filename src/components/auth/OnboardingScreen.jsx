import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, BG, RED, inp, btnA } from '../../lib/styles';
import { RESERVED_USERNAMES } from '../../lib/constants';

function OnboardingScreen({session, onComplete}){
  const [username,setUsername]=useState(session?.user?.user_metadata?.username||"");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const save=async()=>{
    if(!username.trim()){setError("Username is required.");return;}
    if(!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())){setError("3–20 characters, letters/numbers/underscores only.");return;}
    if(RESERVED_USERNAMES.has(username.trim().toLowerCase())){setError("That username is reserved — please choose another.");return;}
    setLoading(true);setError("");
    const{error}=await supabase.from("profiles").upsert({
      id:session.user.id,
      username:username.trim().toLowerCase(),
      account_type:"personal",
    },{onConflict:"id"});
    if(error){
      if(error.code==="23505")setError("That username is already taken — try another.");
      else setError(error.message);
      setLoading(false);
    } else {
      onComplete({username:username.trim().toLowerCase(),accountType:"personal"});
    }
  };

  return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'IBM Plex Mono',monospace"}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:36,marginBottom:10}}>🐀</div>
          <div style={{fontSize:16,fontWeight:700,color:ACC,letterSpacing:"0.06em",textTransform:"uppercase"}}>One last thing</div>
          <div style={{fontSize:10,color:MUT,marginTop:8}}>Pick a username to get started.</div>
        </div>
        <div style={{background:SURF,border:"1px solid "+BRD,borderTop:"2px solid "+ACC,borderRadius:2,padding:20}}>
          <div style={{fontSize:8,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Username *</div>
          <input style={{...inp}} placeholder="e.g. wrench_rat" value={username}
            onChange={e=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,""))}
            onKeyDown={e=>e.key==="Enter"&&save()} />
          <div style={{fontSize:8,color:MUT,marginTop:4,marginBottom:16}}>3–20 chars · letters, numbers, underscores</div>
          {error&&<div style={{background:RED+"12",border:"1px solid "+RED+"44",color:RED,fontSize:10,padding:"8px 12px",borderRadius:2,marginBottom:12,lineHeight:1.5}}>{error}</div>}
          <button onClick={save} disabled={loading}
            style={{...btnA,width:"100%",padding:"11px 0",fontSize:10,letterSpacing:"0.1em",opacity:loading?0.6:1}}>
            {loading?"Saving...":"Let's Go →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingScreen;
