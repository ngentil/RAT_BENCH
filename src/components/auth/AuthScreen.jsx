import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, BG, TXT, GRN, RED, inp, btnA, btnG } from '../../lib/styles';
function AuthScreen(){
  const [mode,setMode]=useState("login"); // login | signup | forgot
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [username,setUsername]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");

  // Reset loading if browser restores page from bfcache after OAuth redirect
  useEffect(()=>{
    const reset=(e)=>{if(e.persisted)setLoading(false);};
    window.addEventListener("pageshow",reset);
    return()=>window.removeEventListener("pageshow",reset);
  },[]);

  const handleGoogle=async()=>{
    setLoading(true);setError("");
    const{error}=await supabase.auth.signInWithOAuth({
      provider:"google",
      options:{redirectTo:window.location.origin}
    });
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
      const{error}=await supabase.auth.signUp({email,password,options:{data:{username:username.trim()}}});
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

          {/* Mode tabs */}
          <div style={{display:"flex",borderRadius:2,overflow:"hidden",border:"1px solid "+BRD,marginBottom:24}}>
            {["login","signup"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setError("");setMessage("");}}
                style={{flex:1,padding:"9px 0",fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'IBM Plex Mono',monospace",cursor:"pointer",border:"none",background:mode===m?ACC:"#0a0a0a",color:mode===m?"#fff":MUT,transition:"background 0.15s"}}>
                {m==="login"?"Sign In":"Create Account"}
              </button>
            ))}
          </div>

          {/* Google button */}
          {mode!=="forgot"&&<button onClick={handleGoogle} disabled={loading}
            style={{width:"100%",padding:"11px 0",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'IBM Plex Mono',monospace",cursor:"pointer",border:"1px solid "+BRD,borderRadius:2,background:"#0a0a0a",color:TXT,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:loading?0.6:1}}>
            <span style={{fontSize:14}}>G</span> Continue with Google
          </button>}

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
                <div style={{fontSize:9,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Username</div>
                <input style={{...inp}} placeholder="e.g. wrench_rat" value={username} onChange={e=>setUsername(e.target.value)} />
              </div>
            )}
            <div>
              <div style={{fontSize:9,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Email</div>
              <input style={{...inp}} type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            {mode!=="forgot"&&<div>
              <div style={{fontSize:9,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Password</div>
              <input style={{...inp}} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleSubmit()} />
            </div>}
          </div>

          {/* Error / message */}
          {error&&<div style={{fontSize:10,color:RED,marginTop:12,lineHeight:1.5,padding:"8px 10px",background:"#200e0e",border:"1px solid #3a1a1a",borderRadius:2}}>{error}</div>}
          {message&&<div style={{fontSize:10,color:GRN,marginTop:12,lineHeight:1.5,padding:"8px 10px",background:"#0e200e",border:"1px solid #1a3a1a",borderRadius:2}}>{message}</div>}

          {/* Submit button */}
          <button onClick={handleSubmit} disabled={loading}
            style={{...btnA,width:"100%",marginTop:16,padding:"11px 0",fontSize:10,opacity:loading?0.6:1,letterSpacing:"0.1em"}}>
            {loading?"Please wait...":(mode==="login"?"Sign In":mode==="signup"?"Create Account":"Send Reset Link")}
          </button>

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
              style={{background:"none",border:"none",color:MUT,fontSize:9,cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'IBM Plex Mono',monospace",opacity:loading?0.4:1}}>
              Continue as Guest
            </button>
          </div>}

          <div style={{fontSize:8,color:"#333",textAlign:"center",marginTop:32,lineHeight:1.8}}>
            Your data stays yours<br/>
            <span style={{color:"#2a2a2a"}}>ratbench.net</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
// ── Onboarding Screen ────────────────────────────────────────────────────────
export default AuthScreen;