import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, TXT, GRN, RED, inp, sel, btnA, btnG, col, dvdr, sm } from '../../lib/styles';
import { updateCompany, createCompany, joinCompanyByCode, leaveCompany, deleteCompany } from '../../lib/db';
import { COUNTRIES, COUNTRY_CONFIG, DEFAULT_COUNTRY_CONFIG } from '../../lib/constants/countries';
import { effectiveTier } from '../../lib/gates';
const INDUSTRIES = ["Small Engine Repair","Automotive","Marine / Watercraft","Agricultural / Farm Equipment","Construction / Earthmoving","Lawn & Garden","Motorcycle / Powersports","EV / Electric","Mining","Forestry","General Mechanical","Other"];
function CompanySettings({profile,setProfile,company,setCompany,session}){
  const isAdmin=company&&company.owner_id===session?.user?.id;
  const canMultiUser=["team","business"].includes(effectiveTier(profile,company));
  const [mode,setMode]=useState("view"); // view|create|join
  const [err,setErr]=useState("");
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [joinCode,setJoinCode]=useState("");

  // Create form state
  const [name,setName]=useState("");
  const [tradingName,setTradingName]=useState("");
  const [abn,setAbn]=useState("");
  const [phone,setPhone]=useState("");
  const [email,setEmail]=useState("");
  const [website,setWebsite]=useState("");
  const [address,setAddress]=useState("");
  const [city,setCity]=useState("");
  const [state,setState]=useState("");
  const [postcode,setPostcode]=useState("");
  const [country,setCountry]=useState("Australia");
  const [industry,setIndustry]=useState("");
  const [logo,setLogo]=useState("");
  const [hourlyRate,setHourlyRate]=useState("");
  const [taxRate,setTaxRate]=useState("");
  const [taxLabel,setTaxLabel]=useState("");

  // Populate fields when editing existing company
  useEffect(()=>{
    if(company){
      setName(company.name||"");setTradingName(company.trading_name||"");setAbn(company.abn||"");
      setPhone(company.phone||"");setEmail(company.email||"");setWebsite(company.website||"");
      setAddress(company.address||"");setCity(company.city||"");setState(company.state||"");
      setPostcode(company.postcode||"");setCountry(company.country||"Australia");
      setIndustry(company.industry||"");setLogo(company.logo||"");
      setHourlyRate(company.hourly_rate!=null?String(company.hourly_rate):"");
      setTaxRate(company.tax_rate!=null?String(company.tax_rate):"");
      setTaxLabel(company.tax_label||"");
    }
  },[company?.id]);

  const handleLogo=async e=>{
    const file=e.target.files[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>setLogo(ev.target.result);
    reader.readAsDataURL(file);
  };

  const saveCompany=async()=>{
    if(!name.trim()){setErr("Company name is required.");return;}
    setSaving(true);setErr("");setSaved(false);
    const fields={name:name.trim(),trading_name:tradingName.trim()||null,abn:abn.trim()||null,phone:phone.trim()||null,email:email.trim()||null,website:website.trim()||null,address:address.trim()||null,city:city.trim()||null,state:state.trim()||null,postcode:postcode.trim()||null,country:country||null,industry:industry||null,logo:logo||null,hourly_rate:hourlyRate!==""?parseFloat(hourlyRate):null,tax_rate:taxRate!==""?parseFloat(taxRate):null,tax_label:taxLabel.trim()||null};
    try{
      if(company){
        const updated=await updateCompany(company.id,fields);
        setCompany(updated);
      }else{
        const created=await createCompany(session.user.id,fields);
        setCompany(created);
        setProfile(prev=>({...prev,company_id:created.id}));
      }
      setSaved(true);setTimeout(()=>setSaved(false),2500);setMode("view");
    }catch(e){setErr(e.message||"Save failed.");}
    setSaving(false);
  };

  const handleJoin=async()=>{
    if(!joinCode.trim()){setErr("Enter an invite code.");return;}
    setSaving(true);setErr("");
    try{
      const compId=await joinCompanyByCode(joinCode,session.user.id);
      const co=await getMyCompany(compId);
      setCompany(co);setProfile(prev=>({...prev,company_id:compId}));setMode("view");
    }catch(e){setErr(e.message);}
    setSaving(false);
  };

  const handleLeave=async()=>{
    if(!confirm("Leave this organisation? Your machines will remain."))return;
    await leaveCompany(company.id,session.user.id);
    setCompany(null);setProfile(prev=>({...prev,company_id:null}));
  };

  const lbl={fontSize:9,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4};
  const sec={marginBottom:20,paddingBottom:20,borderBottom:"1px solid "+BRD};

  const cfg = COUNTRY_CONFIG[country] || DEFAULT_COUNTRY_CONFIG;

  const fieldsJsx=(
    <>
      <div style={{marginBottom:12}}>
        <div style={lbl}>Logo</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {logo&&<img src={logo} alt="logo" style={{width:48,height:48,objectFit:"cover",borderRadius:2,border:"1px solid "+BRD}}/>}
          <label style={{...btnG,...sm,cursor:"pointer"}}>
            {logo?"Change":"Upload"}
            <input type="file" accept="image/*" onChange={handleLogo} style={{display:"none"}}/>
          </label>
          {logo&&<button onClick={()=>setLogo("")} style={{...btnG,...sm,color:RED}}>Remove</button>}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <div style={col}><div style={lbl}>Company Name *</div><input style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder="Legal name"/></div>
        <div style={col}><div style={lbl}>Trading Name</div><input style={inp} value={tradingName} onChange={e=>setTradingName(e.target.value)} placeholder="If different"/></div>
        <div style={col}><div style={lbl}>{cfg.biz}</div><input style={inp} value={abn} onChange={e=>setAbn(e.target.value)}/></div>
        <div style={col}><div style={lbl}>Industry</div><select style={sel} value={industry} onChange={e=>setIndustry(e.target.value)}><option value="">— select —</option>{INDUSTRIES.map(i=><option key={i}>{i}</option>)}</select></div>
        <div style={col}><div style={lbl}>Phone</div><input style={inp} value={phone} onChange={e=>setPhone(e.target.value)}/></div>
        <div style={col}><div style={lbl}>Email</div><input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)}/></div>
      </div>
      <div style={{...col,marginBottom:8}}><div style={lbl}>Website</div><input style={inp} value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://"/></div>
      <div style={{...col,marginBottom:8}}><div style={lbl}>Country</div>
        <select style={sel} value={country} onChange={e=>{setCountry(e.target.value);setState("");}}>
          {COUNTRIES.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={{...col,marginBottom:8}}><div style={lbl}>Street Address</div><input style={inp} value={address} onChange={e=>setAddress(e.target.value)}/></div>
      <div style={{display:"grid",gridTemplateColumns:cfg.state?"2fr 1fr 1fr":"2fr 1fr",gap:8,marginBottom:12}}>
        <div style={col}><div style={lbl}>City / Town</div><input style={inp} value={city} onChange={e=>setCity(e.target.value)}/></div>
        {cfg.state&&<div style={col}><div style={lbl}>{cfg.state}</div><input style={inp} value={state} onChange={e=>setState(e.target.value)}/></div>}
        <div style={col}><div style={lbl}>{cfg.postcode}</div><input style={inp} value={postcode} onChange={e=>setPostcode(e.target.value)}/></div>
      </div>
      <div style={{marginTop:4,paddingTop:14,borderTop:"1px solid #1a1a1a"}}>
        <div style={{fontSize:8,color:ACC,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8,fontWeight:700}}>Billing Rates</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <div style={col}><div style={lbl}>Labour Rate ($/hr)</div><input style={inp} type="number" min="0" step="0.5" value={hourlyRate} onChange={e=>setHourlyRate(e.target.value)} placeholder="e.g. 85"/></div>
          <div style={col}><div style={lbl}>Tax Rate (%)</div><input style={inp} type="number" min="0" max="100" step="0.5" value={taxRate} onChange={e=>setTaxRate(e.target.value)} placeholder="e.g. 10"/></div>
          <div style={col}><div style={lbl}>Tax Label</div><input style={inp} value={taxLabel} onChange={e=>setTaxLabel(e.target.value)} placeholder="e.g. GST"/></div>
        </div>
      </div>
    </>
  );

  if(!company&&mode==="view") return(
    <div>
      <div style={{fontSize:10,color:MUT,marginBottom:20,lineHeight:1.7}}>You're not part of any organisation yet.</div>
      <div style={{display:"flex",gap:8,marginBottom:24}}>
        <button onClick={()=>setMode("create")} style={btnA}>Create Org</button>
        <button onClick={()=>setMode("join")} style={btnG}>Join with Code</button>
      </div>
    </div>
  );

  if(mode==="join") return(
    <div>
      <div style={{fontSize:9,color:ACC,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,marginBottom:12}}>Join an Organisation</div>
      <div style={{...col,marginBottom:12}}><div style={lbl}>Invite Code</div><input style={inp} value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="e.g. AB12CD34"/></div>
      {err&&<div style={{fontSize:10,color:RED,marginBottom:10}}>{err}</div>}
      <div style={{display:"flex",gap:8}}>
        <button onClick={handleJoin} disabled={saving} style={{...btnA,...sm}}>{saving?"Joining…":"Join"}</button>
        <button onClick={()=>{setMode("view");setErr("");}} style={{...btnG,...sm}}>Cancel</button>
      </div>
    </div>
  );

  if(mode==="create"||(!company&&mode!=="join")) return(
    <div>
      <div style={{fontSize:9,color:ACC,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,marginBottom:16}}>Create Organisation</div>
      {fieldsJsx}
      {err&&<div style={{fontSize:10,color:RED,marginBottom:10}}>{err}</div>}
      <div style={{display:"flex",gap:8}}>
        <button onClick={saveCompany} disabled={saving} style={{...btnA,...sm}}>{saving?"Creating…":"Create"}</button>
        <button onClick={()=>{setMode("view");setErr("");}} style={{...btnG,...sm}}>Cancel</button>
      </div>
    </div>
  );

  return(
    <div>
      {/* Header */}
      <div style={{...sec,display:"flex",alignItems:"center",gap:12}}>
        {company.logo&&<img src={company.logo} alt="" style={{width:48,height:48,objectFit:"cover",borderRadius:2,border:"1px solid "+BRD}}/>}
        <div>
          <div style={{fontSize:14,fontWeight:700,color:TXT}}>{company.name}</div>
          {company.trading_name&&<div style={{fontSize:10,color:MUT}}>{company.trading_name}</div>}
          <div style={{fontSize:9,color:MUT,marginTop:2}}>{isAdmin?"Admin":"Member"}</div>
        </div>
        {isAdmin&&<button onClick={()=>setMode("edit")} style={{...btnG,...sm,marginLeft:"auto"}}>Edit</button>}
      </div>

      {/* Edit form */}
      {mode==="edit"&&isAdmin&&(
        <div style={sec}>
          {fieldsJsx}
          {err&&<div style={{fontSize:10,color:RED,marginBottom:10}}>{err}</div>}
          {saved&&<div style={{fontSize:10,color:GRN,marginBottom:10}}>✓ Saved</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={saveCompany} disabled={saving} style={{...btnA,...sm}}>{saving?"Saving…":"Save"}</button>
            <button onClick={()=>{setMode("view");setErr("");}} style={{...btnG,...sm}}>Cancel</button>
          </div>
        </div>
      )}

      {/* Team member management lives in the Users tab */}
      {canMultiUser ? (
        <div style={{...sec,padding:"12px 14px",background:"#0a0f0a",border:"1px solid #1a2a1a",borderRadius:2}}>
          <div style={{fontSize:9,color:GRN,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,marginBottom:4}}>Team Management</div>
          <div style={{fontSize:10,color:MUT,lineHeight:1.6}}>Invite codes, members, and role management have moved to the <span style={{color:TXT,fontWeight:700}}>Users</span> tab.</div>
        </div>
      ) : (
        <div style={{...sec,opacity:0.6,pointerEvents:"none",position:"relative"}}>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:1,pointerEvents:"all",flexDirection:"column",gap:6}}>
            <span style={{fontSize:16}}>🔒</span>
            <span style={{fontSize:9,color:MUT,letterSpacing:"0.08em"}}>Team plan required for multi-user features</span>
          </div>
          <div style={{fontSize:9,color:ACC,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,marginBottom:10}}>Invite Code & Members</div>
          <div style={{height:60}}/>
        </div>
      )}

      {/* Leave / danger */}
      <div>
        <div style={{fontSize:9,color:RED,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,marginBottom:10}}>Danger Zone</div>
        {!isAdmin&&<button onClick={handleLeave} style={{...btnG,...sm,color:RED,border:"1px solid "+RED}}>Leave Organisation</button>}
        {isAdmin&&<button onClick={async()=>{
          if(!confirm(`Permanently delete "${company.name}"? This cannot be undone. All members will be removed.`))return;
          try{
            await deleteCompany(company.id);
            setCompany(null);
            setProfile(prev=>({...prev,company_id:null}));
          }catch(e){setErr(e.message);}
        }} style={{...btnG,...sm,color:RED,border:"1px solid "+RED}}>Delete Organisation</button>}
      </div>
    </div>
  );
}
export default CompanySettings;