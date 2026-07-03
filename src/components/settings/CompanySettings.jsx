import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, TXT, GRN, RED, inp, sel, btnA, btnG, col, dvdr, sm } from '../../lib/styles';
import { updateCompany, createCompany, joinCompanyByCode, leaveCompany, deleteCompany, getCompanyMembers, getMyCompany, getMachinePermissions, upsertMachinePermission, revokeMachinePermission } from '../../lib/db';
import { getVehiclePermissions, upsertVehiclePermission, revokeVehiclePermission } from '../../lib/db/vehicles';
import { getEquipmentPermissions, upsertEquipmentPermission, revokeEquipmentPermission } from '../../lib/db/equipment';
import { getToolPermissions, upsertToolPermission, revokeToolPermission } from '../../lib/db/tools';
import { getConsumables, getConsumablePermissions, upsertConsumablePermission, revokeConsumablePermission } from '../../lib/db/consumables';
import { COUNTRIES, COUNTRY_CONFIG, DEFAULT_COUNTRY_CONFIG } from '../../lib/constants/countries';
import { effectiveTier } from '../../lib/gates';
const INDUSTRIES = ["Small Engine Repair","Automotive","Marine / Watercraft","Agricultural / Farm Equipment","Construction / Earthmoving","Lawn & Garden","Motorcycle / Powersports","EV / Electric","Mining","Forestry","General Mechanical","Other"];
// Generic provisioning panel — works for machines, vehicles, equipment, tools.
// getFn   : async (assetId) => [{ user_id, can_edit, ... }]
// upsertFn: async (assetId, userId, companyId, canEdit)
// revokeFn: async (assetId, userId)
function AssetProvisioningPanel({ assets, emptyMsg, company, session, getFn, upsertFn, revokeFn }) {
  const [members, setMembers] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [perms, setPerms] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    if (!company?.id) return;
    getCompanyMembers(company.id).then(setMembers);
  }, [company?.id]);

  const expand = async (assetId) => {
    if (expanded === assetId) { setExpanded(null); return; }
    setExpanded(assetId);
    if (!perms[assetId]) {
      const p = await getFn(assetId);
      setPerms(prev => ({ ...prev, [assetId]: p }));
    }
  };

  const toggle = async (assetId, userId, currentPerm, canEdit) => {
    const key = `${assetId}-${userId}`;
    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      if (currentPerm && !canEdit && currentPerm.can_edit === false) {
        await revokeFn(assetId, userId);
        setPerms(prev => ({ ...prev, [assetId]: (prev[assetId] || []).filter(p => p.user_id !== userId) }));
      } else if (currentPerm) {
        await upsertFn(assetId, userId, company.id, canEdit);
        setPerms(prev => ({ ...prev, [assetId]: (prev[assetId] || []).map(p => p.user_id === userId ? { ...p, can_edit: canEdit } : p) }));
      } else {
        await upsertFn(assetId, userId, company.id, canEdit);
        setPerms(prev => ({ ...prev, [assetId]: [...(prev[assetId] || []), { user_id: userId, can_edit: canEdit }] }));
      }
    } catch (e) { console.error("toggle perm:", e); }
    setSaving(prev => ({ ...prev, [key]: false }));
  };

  const revoke = async (assetId, userId) => {
    const key = `${assetId}-${userId}`;
    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      await revokeFn(assetId, userId);
      setPerms(prev => ({ ...prev, [assetId]: (prev[assetId] || []).filter(p => p.user_id !== userId) }));
    } catch (e) { console.error("revoke perm:", e); }
    setSaving(prev => ({ ...prev, [key]: false }));
  };

  if (!assets || assets.length === 0) {
    return <div style={{ fontSize: 10, color: MUT, lineHeight: 1.7 }}>{emptyMsg}</div>;
  }

  const myAssets = assets.filter(a => a.userId === session?.user?.id);
  if (myAssets.length === 0) {
    return <div style={{ fontSize: 10, color: MUT, lineHeight: 1.7 }}>{emptyMsg}</div>;
  }

  const otherMembers = members.filter(m => m.user_id !== session?.user?.id);

  return (
    <div>
      {myAssets.map(asset => {
        const assetPerms = perms[asset.id] || [];
        const isOpen = expanded === asset.id;
        return (
          <div key={asset.id} style={{ marginBottom: 8, border: "1px solid " + BRD, borderRadius: 2, overflow: "hidden" }}>
            <button onClick={() => expand(asset.id)} style={{ width: "100%", background: isOpen ? "#111" : "#0a0a0a", border: "none", cursor: "pointer", padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "'IBM Plex Mono',monospace" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: TXT }}>{asset.name}</span>
                {assetPerms.length > 0 && <span style={{ fontSize: 7, color: MUT }}>{assetPerms.length} member{assetPerms.length !== 1 ? "s" : ""} provisioned</span>}
              </div>
              <span style={{ fontSize: 9, color: MUT }}>{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && (
              <div style={{ padding: "10px 12px", background: "#0a0a0a", borderTop: "1px solid " + BRD }}>
                {otherMembers.length === 0 && <div style={{ fontSize: 10, color: MUT }}>No other members in this organisation yet.</div>}
                {otherMembers.map(member => {
                  const perm = assetPerms.find(p => p.user_id === member.user_id);
                  const key = `${asset.id}-${member.user_id}`;
                  const isBusy = saving[key];
                  const name = member.profile?.display_name || member.profile?.username || member.user_id.slice(0, 8);
                  return (
                    <div key={member.user_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", borderBottom: "1px solid #1a1a1a", borderLeft: "2px solid #252525", marginBottom: 2 }}>
                      <div>
                        <div style={{ fontSize: 11, color: TXT, fontWeight: 700 }}>{name}</div>
                        <span style={{ display: "inline-block", fontSize: 8, color: MUT, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: "0.08em", textTransform: "uppercase", background: "#1a1a1a", border: "1px solid #252525", borderRadius: 2, padding: "1px 5px", marginTop: 2 }}>{member.role}</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {isBusy ? (
                          <span style={{ fontSize: 9, color: MUT }}>…</span>
                        ) : perm ? (
                          <>
                            <span style={{ display: "inline-flex", alignItems: "center", fontSize: 8, fontWeight: 700, padding: "3px 8px", borderRadius: 2, fontFamily: "'IBM Plex Mono',monospace", background: perm.can_edit ? "#1a2a1a" : "#1a1a2a", color: perm.can_edit ? GRN : ACC, border: `1px solid ${perm.can_edit ? GRN : ACC}55`, cursor: "pointer" }} onClick={() => toggle(asset.id, member.user_id, perm, !perm.can_edit)}>
                              {perm.can_edit ? "Can Edit" : "View Only"}
                            </span>
                            <button onClick={() => revoke(asset.id, member.user_id)}
                              style={{ fontSize: 8, padding: "3px 8px", borderRadius: 2, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace", background: "none", color: RED, border: `1px solid ${RED}55` }}>Revoke</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => toggle(asset.id, member.user_id, null, false)}
                              style={{ fontSize: 8, padding: "3px 8px", borderRadius: 2, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace", background: "none", color: ACC, border: `1px solid ${ACC}55` }}>Grant View</button>
                            <button onClick={() => toggle(asset.id, member.user_id, null, true)}
                              style={{ fontSize: 8, padding: "3px 8px", borderRadius: 2, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace", background: "none", color: GRN, border: `1px solid ${GRN}55` }}>Grant Edit</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CompanySettings({profile,setProfile,company,setCompany,session,machines,vehicles,equipment,tools}){
  const [consumables, setConsumables] = useState([]);
  useEffect(() => {
    if (session?.user?.id) getConsumables().then(setConsumables).catch(() => {});
  }, [session?.user?.id]);
  const canMultiUser=effectiveTier(profile,company)==="business";
  const [myRole,setMyRole]=useState(null);
  useEffect(()=>{
    if(!company?.id||!session?.user?.id) return;
    supabase.from("company_members").select("role").eq("company_id",company.id).eq("user_id",session.user.id).single()
      .then(({data})=>setMyRole(data?.role||null));
  },[company?.id,session?.user?.id]);
  const isOwner=myRole==="owner";
  const isAdmin=isOwner; // kept for backward compat in JSX below
  const canProvision=canMultiUser&&(isOwner||myRole==="admin");
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

  // Populate fields when editing existing company
  useEffect(()=>{
    if(company){
      setName(company.name||"");setTradingName(company.trading_name||"");setAbn(company.abn||"");
      setPhone(company.phone||"");setEmail(company.email||"");setWebsite(company.website||"");
      setAddress(company.address||"");setCity(company.city||"");setState(company.state||"");
      setPostcode(company.postcode||"");setCountry(company.country||"Australia");
      setIndustry(company.industry||"");setLogo(company.logo||"");
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
    const fields={name:name.trim(),trading_name:tradingName.trim()||null,abn:abn.trim()||null,phone:phone.trim()||null,email:email.trim()||null,website:website.trim()||null,address:address.trim()||null,city:city.trim()||null,state:state.trim()||null,postcode:postcode.trim()||null,country:country||null,industry:industry||null,logo:logo||null};
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
      const compId=await joinCompanyByCode(joinCode);
      const co=await getMyCompany(compId);
      setCompany(co);setProfile(prev=>({...prev,company_id:compId}));setMode("view");
    }catch(e){setErr(e.message);}
    setSaving(false);
  };

  const handleLeave=async()=>{
    if(!confirm("Leave this organisation? Your machines will remain."))return;
    await leaveCompany(company.id);
    setCompany(null);setProfile(prev=>({...prev,company_id:null}));
  };

  const lbl={fontSize:9,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4};
  const sec={marginBottom:20,paddingBottom:20,borderBottom:"1px solid "+BRD};
  const secHd={fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,color:TXT,borderLeft:"2px solid "+ACC,paddingLeft:8,marginBottom:12};
  const secHdRed={fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,color:TXT,borderLeft:"2px solid "+RED,paddingLeft:8,marginBottom:12};
  const secSep={paddingTop:20,marginTop:20,borderTop:"1px solid #252525"};

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
      <div style={secHd}>Join an Organisation</div>
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
      <div style={{...secHd,marginBottom:16}}>Create Organisation</div>
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
          <div style={{...secHd,marginBottom:10}}>Invite Code & Members</div>
          <div style={{height:60}}/>
        </div>
      )}

      {/* Asset provisioning */}
      {canProvision && (
        <div style={{...sec,...secSep}}>
          <div style={secHd}>Asset Provisioning</div>
          <div style={{fontSize:10,color:MUT,lineHeight:1.6,marginBottom:14}}>Grant org members access to your assets. Revoke at any time.</div>

          <div style={{fontSize:10,color:TXT,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700,marginBottom:8,borderLeft:"2px solid "+ACC,paddingLeft:8}}>Machines</div>
          <AssetProvisioningPanel
            assets={(machines||[]).filter(m=>m.companyId===company?.id)}
            emptyMsg="No org machines to provision. Add machines and tag them to this organisation from the Tracker tab."
            company={company} session={session}
            getFn={getMachinePermissions}
            upsertFn={upsertMachinePermission}
            revokeFn={revokeMachinePermission}
          />

          <div style={{fontSize:10,color:TXT,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700,marginTop:14,marginBottom:8,borderLeft:"2px solid "+ACC,paddingLeft:8}}>Vehicles</div>
          <AssetProvisioningPanel
            assets={vehicles||[]}
            emptyMsg="No vehicles to provision yet. Add vehicles from the Vehicles tab."
            company={company} session={session}
            getFn={getVehiclePermissions}
            upsertFn={upsertVehiclePermission}
            revokeFn={revokeVehiclePermission}
          />

          <div style={{fontSize:10,color:TXT,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700,marginTop:14,marginBottom:8,borderLeft:"2px solid "+ACC,paddingLeft:8}}>Equipment</div>
          <AssetProvisioningPanel
            assets={equipment||[]}
            emptyMsg="No equipment to provision yet. Add equipment from the Equipment tab."
            company={company} session={session}
            getFn={getEquipmentPermissions}
            upsertFn={upsertEquipmentPermission}
            revokeFn={revokeEquipmentPermission}
          />

          <div style={{fontSize:10,color:TXT,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700,marginTop:14,marginBottom:8,borderLeft:"2px solid "+ACC,paddingLeft:8}}>Tools</div>
          <AssetProvisioningPanel
            assets={tools||[]}
            emptyMsg="No tools to provision yet. Add tools from the Tools tab."
            company={company} session={session}
            getFn={getToolPermissions}
            upsertFn={upsertToolPermission}
            revokeFn={revokeToolPermission}
          />

          <div style={{fontSize:10,color:TXT,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700,marginTop:14,marginBottom:8,borderLeft:"2px solid "+ACC,paddingLeft:8}}>Consumables</div>
          <AssetProvisioningPanel
            assets={consumables||[]}
            emptyMsg="No consumables to provision yet. Add supplies from the Consumables tab."
            company={company} session={session}
            getFn={getConsumablePermissions}
            upsertFn={upsertConsumablePermission}
            revokeFn={revokeConsumablePermission}
          />
        </div>
      )}

      {/* Leave / danger */}
      <div style={secSep}>
        <div style={secHdRed}>Danger Zone</div>
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