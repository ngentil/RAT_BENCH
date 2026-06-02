import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, BG, TXT, GRN, RED, inp, btnA, btnG, sm } from '../../lib/styles';
import { checkUsernameAvailable, generateAvailableUsername } from '../../lib/username';
import TermsPage from '../legal/TermsPage';
import PrivacyPage from '../legal/PrivacyPage';
function AuthScreen(){
  const [mode,setMode]=useState("login"); // login | signup | forgot
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [confirmPassword,setConfirmPassword]=useState("");
  const [username,setUsername]=useState("");
  const [availability,setAvailability]=useState(null); // null | "checking" | "available" | "taken"
  const [generating,setGenerating]=useState(false);
  const checkRef=useRef(0);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [legal,setLegal]=useState(null); // "terms" | "privacy" | null

  // Reset loading if browser restores page from bfcache after OAuth redirect
  useEffect(()=>{
    const reset=(e)=>{if(e.persisted)setLoading(false);};
    window.addEventListener("pageshow",reset);
    return()=>window.removeEventListener("pageshow",reset);
  },[]);

  // Debounced username availability check
  useEffect(()=>{
    if(mode!=="signup"){return;}
    const val=username.trim().toLowerCase();
    if(!val||!/^[a-zA-Z0-9_]{3,20}$/.test(val)){setAvailability(null);return;}
    setAvailability("checking");
    const id=++checkRef.current;
    const t=setTimeout(async()=>{
      const ok=await checkUsernameAvailable(val);
      if(checkRef.current===id) setAvailability(ok?"available":"taken");
    },400);
    return()=>clearTimeout(t);
  },[username,mode]);

  const handleGenerate=async()=>{
    setGenerating(true);
    const name=await generateAvailableUsername();
    setUsername(name);
    setGenerating(false);
  };

  const handleGoogle=async()=>{
    setLoading(true);setError("");
    const{error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin}});
    if(error){setError(error.message);setLoading(false);}
  };

  const handleFacebook=async()=>{
    setLoading(true);setError("");
    const{error}=await supabase.auth.signInWithOAuth({provider:"facebook",options:{redirectTo:window.location.origin}});
    if(error){setError(error.message);setLoading(false);}
  };

  const handleApple=async()=>{
    setLoading(true);setError("");
    const{error}=await supabase.auth.signInWithOAuth({provider:"apple",options:{redirectTo:window.location.origin}});
    if(error){setError(error.message);setLoading(false);}
  };

  const handleGuest=async()=>{
    setLoading(true);setError("");
    const{error}=await supabase.auth.signInAnonymously();
    if(error){setError(error.message);setLoading(false);}
  };

  const handleSubmit=async()=>{
    setLoading(true);setError("");setMessage("");
    if(mode==="login"){
      const{error}=await supabase.auth.signInWithPassword({email,password});
      if(error)setError(error.message);
    } else if(mode==="signup"){
      if(!username.trim()){setError("Username is required.");setLoading(false);return;}
      if(!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())){setError("Username must be 3–20 characters, letters/numbers/underscores only.");setLoading(false);return;}
      if(availability==="taken"){setError("That username is already taken — try another.");setLoading(false);return;}
      if(availability==="checking"){setError("Still checking username — wait a moment.");setLoading(false);return;}
      if(password.length<8){setError("Password must be at least 8 characters.");setLoading(false);return;}
      if(password!==confirmPassword){setError("Passwords don't match.");setLoading(false);return;}
      const{error}=await supabase.auth.signUp({email,password,options:{data:{username:username.trim().toLowerCase()}}});
      if(error)setError(error.message);
      else setMessage("Check your email to confirm your account.");
    } else if(mode==="forgot"){
      const{error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});
      if(error)setError(error.message);
      else setMessage("Password reset link sent — check your email.");
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",fontFamily:"'IBM Plex Mono',monospace"}}>

      {/* Left — pitch panel */}
      <div style={{flex:1,background:"#111",borderRight:"1px solid #1e1e1e",padding:"60px 48px",flexDirection:"column",justifyContent:"center",display:"none"}} className="auth-left">
        <div style={{fontSize:28,marginBottom:16}}>🐀</div>
        <div style={{fontSize:22,fontWeight:700,color:ACC,letterSpacing:"0.04em",textTransform:"uppercase",marginBottom:6,lineHeight:1.3}}>Rat Bench</div>
        <div style={{fontSize:10,color:MUT,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:40}}>small engine & equipment repair</div>
        <div style={{fontSize:20,fontWeight:700,color:TXT,lineHeight:1.5,marginBottom:16}}>
          Log every machine.<br/>
          Find every spec.<br/>
          Never forget a torque<br/>value again.
        </div>
        <div style={{fontSize:10,color:MUT,lineHeight:1.8,marginTop:8}}>
        </div>
        <div style={{marginTop:48,display:"flex",flexDirection:"column",gap:12}}>
          {["Track full engine specs, fasteners & torque values","Service history with photo logging","Spec search across your entire inventory"].map((f,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,fontSize:10,color:"#666"}}>
              <span style={{color:ACC,flexShrink:0}}>✓</span>{f}
            </div>
          ))}
        </div>
      </div>

      {/* Right — auth form */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{width:"100%",maxWidth:380}}>

          {/* Mobile logo */}
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{fontSize:36,marginBottom:8}}>🐀</div>
            <div style={{fontSize:16,fontWeight:700,color:ACC,letterSpacing:"0.06em",textTransform:"uppercase"}}>Rat Bench</div>
            <div style={{fontSize:8,color:MUT,letterSpacing:"0.18em",textTransform:"uppercase",marginTop:4}}>small engine & equipment repair</div>
            <div style={{fontSize:12,color:"#666",marginTop:16,lineHeight:1.6}}>
              Log every machine. Find every spec.<br/>Never forget a torque value again.
            </div>
          </div>

          {/* Form card */}
          <div style={{background:SURF,border:"1px solid "+BRD,borderTop:"2px solid "+ACC,borderRadius:3,padding:24}}>

            {/* Mode tabs */}
            <div style={{display:"flex",borderRadius:2,overflow:"hidden",border:"1px solid "+BRD,marginBottom:20}}>
              {["login","signup"].map(m=>(
                <button key={m} onClick={()=>{setMode(m);setError("");setMessage("");}}
                  style={{flex:1,padding:"9px 0",fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'IBM Plex Mono',monospace",cursor:"pointer",border:"none",background:mode===m?ACC:"transparent",color:mode===m?"#fff":MUT,transition:"background 0.15s"}}>
                  {m==="login"?"Sign In":"Create Account"}
                </button>
              ))}
            </div>

            {/* OAuth buttons */}
            {mode!=="forgot"&&<div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
              {[
                {handler:handleGoogle,  label:"Continue with Google",   icon:"G",  iconStyle:{fontFamily:"serif",fontSize:15,fontWeight:700}},
                {handler:handleFacebook,label:"Continue with Facebook", icon:"f",  iconStyle:{fontFamily:"serif",fontSize:17,fontWeight:900,color:"#1877f2"}},
                {handler:handleApple,   label:"Continue with Apple",    icon:"",  iconStyle:{fontSize:16}},
              ].map(({handler,label,icon,iconStyle})=>(
                <button key={label} onClick={handler} disabled={loading}
                  style={{width:"100%",padding:"10px 0",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'IBM Plex Mono',monospace",cursor:"pointer",border:"1px solid "+BRD,borderRadius:2,background:"transparent",color:TXT,display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:loading?0.6:1}}>
                  <span style={iconStyle}>{icon}</span>{label}
                </button>
              ))}
            </div>}

            {/* Divider */}
            {mode!=="forgot"&&<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{flex:1,height:1,background:BRD}}/>
              <span style={{fontSize:9,color:MUT,letterSpacing:"0.1em"}}>OR</span>
              <div style={{flex:1,height:1,background:BRD}}/>
            </div>}

            {/* Email/password fields */}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {mode==="signup"&&(
                <div>
                  <div style={{fontSize:8,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Username</div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <input style={{...inp,flex:1}} placeholder="e.g. wrench_rat" value={username}
                      onChange={e=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,""))} />
                    {availability==="available"&&<span style={{fontSize:16,color:GRN,fontWeight:900,lineHeight:1,textShadow:"0 0 8px "+GRN,flexShrink:0}}>✓</span>}
                    {availability==="taken"&&<span style={{fontSize:16,color:RED,fontWeight:900,lineHeight:1,flexShrink:0}}>✗</span>}
                    {availability==="checking"&&<span style={{fontSize:10,color:MUT,flexShrink:0}}>…</span>}
                    <button type="button" onClick={handleGenerate} disabled={generating}
                      style={{...btnG,...sm,flexShrink:0,opacity:generating?0.5:1}} title="Generate random name">
                      {generating?"…":"🎲"}
                    </button>
                  </div>
                </div>
              )}
              <div>
                <div style={{fontSize:8,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Email</div>
                <input style={{...inp}} type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
              {mode!=="forgot"&&<div>
                <div style={{fontSize:8,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Password</div>
                <input style={{...inp}} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSubmit()} />
              </div>}
              {mode==="signup"&&<div>
                <div style={{fontSize:8,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Confirm Password</div>
                <input style={{...inp}} type="password" placeholder="••••••••" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSubmit()} />
              </div>}
            </div>

            {/* Error / message */}
            {error&&<div style={{background:RED+"12",border:"1px solid "+RED+"44",color:RED,fontSize:10,padding:"8px 12px",borderRadius:2,marginTop:12,lineHeight:1.5}}>{error}</div>}
            {message&&<div style={{background:GRN+"12",border:"1px solid "+GRN+"44",color:GRN,fontSize:10,padding:"8px 12px",borderRadius:2,marginTop:12,lineHeight:1.5}}>{message}</div>}

            {/* Submit button */}
            <button onClick={handleSubmit} disabled={loading}
              style={{...btnA,width:"100%",marginTop:16,padding:"11px 0",fontSize:10,opacity:loading?0.6:1,letterSpacing:"0.1em"}}>
              {loading?"Please wait...":(mode==="login"?"Sign In":mode==="signup"?"Create Account":"Send Reset Link")}
            </button>
            {mode==="signup"&&<div style={{fontSize:8,color:MUT,textAlign:"center",marginTop:10,lineHeight:1.7}}>
              By creating an account you agree to our{" "}
              <button onClick={()=>setLegal("terms")} style={{background:"none",border:"none",color:ACC,fontSize:8,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",padding:0,textDecoration:"underline"}}>Terms of Service</button>
              {" "}and{" "}
              <button onClick={()=>setLegal("privacy")} style={{background:"none",border:"none",color:ACC,fontSize:8,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",padding:0,textDecoration:"underline"}}>Privacy Policy</button>.
            </div>}

            {/* Forgot password */}
            {mode==="login"&&<div style={{textAlign:"center",marginTop:14}}>
              <button onClick={()=>{setMode("forgot");setError("");setMessage("");}}
                style={{background:"none",border:"none",color:MUT,fontSize:9,cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'IBM Plex Mono',monospace"}}>
                Forgot password?
              </button>
            </div>}
            {mode==="forgot"&&<div style={{textAlign:"center",marginTop:14}}>
              <button onClick={()=>setMode("login")}
                style={{background:"none",border:"none",color:MUT,fontSize:9,cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'IBM Plex Mono',monospace"}}>
                ← Back to sign in
              </button>
            </div>}

            {mode==="login"&&<div style={{textAlign:"center",marginTop:20}}>
              <button onClick={handleGuest} disabled={loading}
                style={{background:"none",border:"1px solid "+ACC,borderRadius:2,color:ACC,fontSize:9,cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'IBM Plex Mono',monospace",padding:"6px 14px",opacity:loading?0.4:1}}>
                Continue as Guest
              </button>
            </div>}

          </div>

          <div style={{fontSize:8,color:MUT,textAlign:"center",marginTop:24,lineHeight:2}}>
            ratbench.net
            <span style={{margin:"0 6px"}}>·</span>
            <button onClick={()=>setLegal("terms")} style={{background:"none",border:"none",color:MUT,fontSize:8,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",textDecoration:"underline",padding:0}}>Terms</button>
            <span style={{margin:"0 6px"}}>·</span>
            <button onClick={()=>setLegal("privacy")} style={{background:"none",border:"none",color:MUT,fontSize:8,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",textDecoration:"underline",padding:0}}>Privacy</button>
          </div>
        </div>
      </div>
      {legal === "terms"   && <TermsPage   onClose={() => setLegal(null)} />}
      {legal === "privacy" && <PrivacyPage onClose={() => setLegal(null)} />}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
// ── Onboarding Screen ────────────────────────────────────────────────────────
export default AuthScreen;
