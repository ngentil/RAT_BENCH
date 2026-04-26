import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, TXT, inp, btnA, btnG } from '../../lib/styles';
function WikiLoginBar({profile,onLogin,onLogout}){
  const [show,setShow]=React.useState(false);
  const [email,setEmail]=React.useState("");
  const [pw,setPw]=React.useState("");
  const [err,setErr]=React.useState("");
  const [busy,setBusy]=React.useState(false);
  const doLogin=async()=>{
    setBusy(true);setErr("");
    const{error}=await supabase.auth.signInWithPassword({email,password:pw});
    if(error){setErr(error.message);setBusy(false);}
    else setShow(false);
  };
  return(
    <div style={{background:SURF,borderBottom:"1px solid "+BRD,padding:"6px 16px",display:"flex",alignItems:"center",gap:10,fontSize:9,fontFamily:"'IBM Plex Mono',monospace"}}>
      {profile?(
        <>
          <span style={{color:MUT,flex:1}}>{profile.display_name||profile.username}</span>
          <button onClick={onLogout} style={{...btnG,fontSize:8,padding:"3px 8px"}}>Sign out</button>
        </>
      ):(
        <>
          <span style={{color:MUT,flex:1}}>Sign in to edit or manage entries</span>
          <button onClick={()=>setShow(s=>!s)} style={{...btnG,fontSize:8,padding:"3px 8px"}}>{show?"Cancel":"Sign in"}</button>
        </>
      )}
      {show&&!profile&&(
        <div style={{position:"fixed",inset:0,background:"#000b",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)setShow(false);}}>
          <div style={{background:SURF,border:"1px solid "+BRD,borderRadius:2,padding:24,width:300,display:"flex",flexDirection:"column",gap:10}}>
            <div style={{fontSize:11,fontWeight:700,color:TXT,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>Sign in to Rat Bench</div>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" style={{background:BG,border:"1px solid "+BRD,color:TXT,fontFamily:"'IBM Plex Mono',monospace",fontSize:11,padding:"7px 10px",borderRadius:2,outline:"none"}}/>
            <input value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password" type="password" onKeyDown={e=>e.key==="Enter"&&doLogin()} style={{background:BG,border:"1px solid "+BRD,color:TXT,fontFamily:"'IBM Plex Mono',monospace",fontSize:11,padding:"7px 10px",borderRadius:2,outline:"none"}}/>
            {err&&<div style={{fontSize:9,color:RED}}>{err}</div>}
            <button onClick={doLogin} disabled={busy} style={{...btnA,fontSize:10}}>{busy?"Signing in…":"Sign in"}</button>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{flex:1,height:1,background:BRD}}/>
              <span style={{fontSize:9,color:MUT}}>or</span>
              <div style={{flex:1,height:1,background:BRD}}/>
            </div>
            <button onClick={()=>supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.href}})} style={{...btnG,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <span>G</span> Sign in with Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default WikiLoginBar;