import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, GRN, RED, inp, btnA, btnG, col, sm, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';

const ADJS = ["rusty","greasy","turbo","speedy","chunky","mighty","brave","sneaky","cheeky","grumpy","fuzzy","zippy","nimble","cranky","dusty","peppy","feisty","gnarly","plucky","dinky","nifty","quirky","spunky","wiry","bolty","grimy","oily","ratty","scruffy","grubby"];
const ANIMALS = ["rat","mouse","vole","shrew","ferret","weasel","stoat","beaver","marmot","squirrel","rabbit","hare","mole","badger","raccoon","possum","skunk","lemur","degu","pika","jerboa","otter","quokka","numbat","bilby","wombat","gerbil","hamster","meerkat"];

const makeName = () => {
  const a = ADJS[Math.floor(Math.random()*ADJS.length)];
  const b = ANIMALS[Math.floor(Math.random()*ANIMALS.length)];
  return `${a}_${b}_${Math.floor(Math.random()*900)+100}`;
};

const checkAvailable = async (name) => {
  const { data } = await supabase.from("profiles").select("id").eq("username", name.toLowerCase()).maybeSingle();
  return !data;
};

function GuestUpgradeModal({profile,setProfile,onClose}){
  const [username,setUsername]=useState(profile?.username||"");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [busy,setBusy]=useState(false);
  const [generating,setGenerating]=useState(false);
  const [availability,setAvailability]=useState(null); // null | "checking" | "available" | "taken"
  const [err,setErr]=useState("");
  const [done,setDone]=useState(false);
  const checkRef=useRef(0);
  const lbl={fontSize:9,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4};

  // Debounced availability check on username change
  useEffect(()=>{
    const val=username.trim().toLowerCase();
    if(!val||!/^[a-zA-Z0-9_]{3,20}$/.test(val)){setAvailability(null);return;}
    setAvailability("checking");
    const id=++checkRef.current;
    const t=setTimeout(async()=>{
      const ok=await checkAvailable(val);
      if(checkRef.current===id) setAvailability(ok?"available":"taken");
    },400);
    return()=>clearTimeout(t);
  },[username]);

  const generate=async()=>{
    setGenerating(true);
    for(let i=0;i<10;i++){
      const name=makeName();
      const ok=await checkAvailable(name);
      if(ok){setUsername(name);setGenerating(false);return;}
    }
    // Fallback: just set last generated even if somehow all taken
    setUsername(makeName());
    setGenerating(false);
  };

  const save=async()=>{
    if(!email.trim()){setErr("Email is required.");return;}
    if(password.length<8){setErr("Password must be at least 8 characters.");return;}
    if(password!==confirm){setErr("Passwords don't match.");return;}
    if(!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())){setErr("Username must be 3–20 chars, letters/numbers/_ only.");return;}
    if(availability==="taken"){setErr("That username is already taken.");return;}
    setBusy(true);setErr("");
    if(username.trim().toLowerCase()!==profile?.username){
      const{error:uErr}=await supabase.from("profiles").update({username:username.trim().toLowerCase()}).eq("id",profile.id);
      if(uErr){setErr(uErr.code==="23505"?"That username is already taken.":uErr.message);setBusy(false);return;}
      setProfile(prev=>({...prev,username:username.trim().toLowerCase()}));
    }
    const{error}=await supabase.auth.updateUser({email:email.trim(),password});
    if(error){setErr(error.message);setBusy(false);return;}
    setDone(true);setBusy(false);
  };

  const availIcon = availability==="available"
    ? <span style={{fontSize:16,color:GRN,fontWeight:900,lineHeight:1,textShadow:"0 0 8px "+GRN}}>✓</span>
    : availability==="taken"
    ? <span style={{fontSize:16,color:RED,fontWeight:900,lineHeight:1}}>✗</span>
    : availability==="checking"
    ? <span style={{fontSize:10,color:MUT}}>…</span>
    : null;

  return(
    <div style={ovly} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{...mdl,maxWidth:400}} onClick={e=>e.stopPropagation()}>
        <div style={mdlH}>
          <b style={{fontSize:13,textTransform:"uppercase",letterSpacing:"0.08em"}}>Create Account</b>
          <button onClick={onClose} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
        </div>
        <div style={mdlB}>
          {done?(
            <>
              <div style={{fontSize:13,color:GRN,marginBottom:8}}>✓ Account created!</div>
              <div style={{fontSize:10,color:MUT,lineHeight:1.6}}>Check your email to confirm your address. Your machines and data are preserved.</div>
            </>
          ):(
            <>
              <div style={{fontSize:10,color:MUT,marginBottom:16,lineHeight:1.6}}>Your machines stay — we just attach a real login so you can sign back in.</div>
              <div style={{...col,marginBottom:10}}>
                <div style={lbl}>Username</div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <input style={{...inp,flex:1}} value={username} onChange={e=>setUsername(e.target.value)} placeholder="3–20 chars, letters/numbers/_"/>
                  {availIcon}
                  <button type="button" onClick={generate} disabled={generating} style={{...btnG,...sm,flexShrink:0,opacity:generating?0.5:1}} title="Generate random name">{generating?"…":"🎲"}</button>
                </div>
              </div>
              <div style={{...col,marginBottom:10}}><div style={lbl}>Email</div><input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div>
              <div style={{...col,marginBottom:10}}><div style={lbl}>Password</div><input style={inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 8 characters"/></div>
              <div style={{...col,marginBottom:14}}><div style={lbl}>Confirm Password</div><input style={inp} type="password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></div>
              {err&&<div style={{fontSize:10,color:RED,marginBottom:10}}>{err}</div>}
            </>
          )}
        </div>
        <div style={mdlF}>
          {done
            ?<button onClick={onClose} style={{...btnA,...sm}}>Done</button>
            :<><button onClick={onClose} style={{...btnG,...sm}}>Cancel</button><button onClick={save} disabled={busy||availability==="taken"||availability==="checking"} style={{...btnA,...sm,opacity:(busy||availability==="taken"||availability==="checking")?0.6:1}}>{busy?"Saving…":"Create Account"}</button></>
          }
        </div>
      </div>
    </div>
  );
}
export default GuestUpgradeModal;
