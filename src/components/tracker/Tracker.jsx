import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { supabase } from '../../lib/supabase';
import { upsertMachine, deleteMachineApi } from '../../lib/db';
import { ACC, MUT, BRD, SURF, TXT, RED, GRN, btnA, btnG, dvdr, sm, ovly, mdl, mdlH, mdlB, mdlF, inp } from '../../lib/styles';
import { MACHINE_TYPES, SCOL, SBG_, DEFAULT_TILE, ALL_BADGE_FIELDS, BADGE_PALETTE, TILE_COLOR_DEFAULTS } from '../../lib/constants';
import { atMachineLimit, machineLimit } from '../../lib/gates';
import { getPref, savePref } from '../../lib/db/preferences';
import MachineTile from '../machine/MachineTile';
import MachineCard from '../machine/MachineCard';
import { Empty } from '../ui/shared';
import StatusBadge from '../ui/StatusBadge';
import MachineForm from '../machine/MachineForm';
import ErrorBoundary from '../ui/ErrorBoundary';
import GuestUpgradeModal from '../auth/GuestUpgradeModal';
import { getMachineServiceStatus, mIcon } from '../../lib/helpers';
import { SPEC_SEARCH_FIELDS } from '../../lib/constants/specSearchFields';
import { tokenizeSearch } from '../../lib/wiki';
import { hl } from '../wiki/wikiSearchHighlight';

const _ARW = "#e8870a";
const _M = { fontFamily:"'IBM Plex Mono',monospace" };

// Same matching model as the wiki search: a single plain, case-insensitive
// substring, checked against name/make/model/type first, then every spec
// field the old Spec Search tab used to cover (plug gap, bore, carb brand,
// tyre size, etc.) — so one search box now does both jobs.
function machineMatchesQuery(m, q) {
  const lowerQ = q.toLowerCase();
  if ((m.name||"").toLowerCase().includes(lowerQ)) return true;
  if ((m.make||"").toLowerCase().includes(lowerQ)) return true;
  if ((m.model||"").toLowerCase().includes(lowerQ)) return true;
  if ((m.type||"").toLowerCase().includes(lowerQ)) return true;
  return SPEC_SEARCH_FIELDS.some(f => {
    const v = m[f.k];
    return v != null && v !== "" && v !== false && String(v).toLowerCase().includes(lowerQ);
  });
}

const SNIPPET_MAX = 90; // long free-text fields (e.g. notes, port notes) get a trimmed snippet around the match

// Finds the first spec field that explains a match not already obvious
// from name/make/model/type, so a result row can show WHY it matched —
// mirrors findSpecMatch() in WikiHomePage.jsx exactly.
function findMachineSpecMatch(m, q) {
  if (!q) return null;
  const lowerQ = q.toLowerCase();
  for (const f of SPEC_SEARCH_FIELDS) {
    const raw = m[f.k];
    if (raw == null || raw === "" || raw === false) continue;
    const value = String(raw) + (f.u ? " " + f.u : "");
    const lowerValue = value.toLowerCase();
    if (!lowerValue.includes(lowerQ)) continue;
    if (value.length <= SNIPPET_MAX) return { label: f.l, value };
    const idx = lowerValue.indexOf(lowerQ);
    const start = Math.max(0, idx - 30);
    const end = Math.min(value.length, idx + q.length + 50);
    const snippet = (start > 0 ? "…" : "") + value.slice(start, end) + (end < value.length ? "…" : "");
    return { label: f.l, value: snippet };
  }
  return null;
}

function GuideStep1({ onSkip, isGuest, onUpgrade }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", marginBottom:20, paddingRight:2, userSelect:"none" }}>
      <svg className="arrow-guide" width="62" height="54" viewBox="0 0 62 54">
        <path d="M 8 51 C 14 35, 32 18, 54 8" stroke={_ARW} strokeWidth="1.7" fill="none" strokeLinecap="round" />
        <path d="M 49 4 L 56 9 L 51 15" stroke={_ARW} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ ..._M, fontSize:13, color:_ARW, fontWeight:700, marginTop:4 }}>start here</span>
      <span style={{ ..._M, fontSize:9, color:"#666", marginTop:4 }}>tap + Add to track your first machine</span>
      <span style={{ ..._M, fontSize:9, color:"#555", marginTop:2 }}>name &amp; type is all you need to begin</span>
      {isGuest && (
        <span style={{ ..._M, fontSize:10, color:"#444", marginTop:8 }}>
          guest: 3-machine limit ·{" "}
          <span onClick={onUpgrade} style={{ color:_ARW, cursor:"pointer" }}>create a free account →</span>
        </span>
      )}
      <button onClick={onSkip} style={{ ..._M, marginTop:12, background:"none", border:"none", color:"#333", fontSize:10, cursor:"pointer", padding:0, letterSpacing:"0.05em" }}>skip guide</button>
    </div>
  );
}

function GuideStep2({ onSkip }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:14, userSelect:"none" }}>
      <span style={{ ..._M, fontSize:11, color:_ARW, fontWeight:700 }}>tap the card to explore</span>
      <span style={{ ..._M, fontSize:9, color:"#555", marginTop:4, textAlign:"center" }}>service history · timers · photos · invoices</span>
      <svg className="arrow-guide" width="30" height="42" viewBox="0 0 30 42" style={{ marginTop:8 }}>
        <path d="M 15 4 C 20 16, 11 25, 15 36" stroke={_ARW} strokeWidth="1.7" fill="none" strokeLinecap="round" />
        <path d="M 11 32 L 15 38 L 19 32" stroke={_ARW} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <button onClick={onSkip} style={{ ..._M, marginTop:10, background:"none", border:"none", color:"#333", fontSize:10, cursor:"pointer", padding:0, letterSpacing:"0.05em" }}>got it</button>
    </div>
  );
}
function MachinePhotoRow({ machine: m, onClick, clientName, searchQuery, searchTokens }) {
  const svc = getMachineServiceStatus(m);
  const timerRunning = (m.jobTimers||[]).some(t=>t.status==="running");
  const hrs = (m.timeLog||[]).reduce((s,e)=>s+(e.seconds||0),0)/3600;
  const specMatch = findMachineSpecMatch(m, searchQuery);
  return (
    <div onClick={onClick} style={{background:SURF,borderBottom:"1px solid "+BRD,padding:"10px 12px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:10,userSelect:"none"}}>
      <div style={{width:64,height:64,flexShrink:0,borderRadius:3,overflow:"hidden",border:"1px solid "+BRD,background:"#111",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {m.photos?.[0]
          ? <img src={m.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
          : <span style={{fontSize:26,lineHeight:1}}>{mIcon(m.type)}</span>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:700,color:TXT,lineHeight:1.2}}>
          {hl(m.name,searchTokens)}
          {timerRunning&&<span style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:GRN,boxShadow:"0 0 5px "+GRN,marginLeft:6,verticalAlign:"middle"}}/>}
        </div>
        {[m.make,m.model,m.year].filter(Boolean).length>0&&
          <div style={{fontSize:10,color:MUT,marginTop:2}}>
            {hl([m.make,m.model,m.year].filter(Boolean).join(" · "),searchTokens)}
          </div>}
        {m.type&&<div style={{fontSize:8,color:"#555",letterSpacing:"0.06em",textTransform:"uppercase",marginTop:1}}>{hl(m.type,searchTokens)}</div>}
        <div style={{display:"flex",gap:4,marginTop:5,flexWrap:"wrap",alignItems:"center"}}>
          <StatusBadge status={m.status||"Active"}/>
          {(m.tileFields&&m.tileFields.length>0?m.tileFields:DEFAULT_TILE).map(k=>{
            if(k==="status") return null;
            const tc=m.tileColors||{};
            const colIdx=tc[k]!==undefined?tc[k]:(TILE_COLOR_DEFAULTS[k]!==undefined&&TILE_COLOR_DEFAULTS[k]!=="auto"?TILE_COLOR_DEFAULTS[k]:0);
            const [cbg,cbrd,ctxt]=BADGE_PALETTE[colIdx]||BADGE_PALETTE[0];
            const bStyle={fontSize:9,fontWeight:700,letterSpacing:"0.08em",padding:"2px 6px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",background:cbg,color:ctxt,border:"1px solid "+cbrd,whiteSpace:"nowrap"};
            if(k==="strokeType"&&m.strokeType) return <span key="st" style={{fontSize:9,fontWeight:700,letterSpacing:"0.08em",padding:"2px 6px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",background:m.strokeType==="4-stroke"?"#0e1a2a":m.strokeType==="Diesel"?"#0e200e":"#1a0e00",color:m.strokeType==="4-stroke"?"#3a7bd5":m.strokeType==="Diesel"?"#3d9e50":"#e8670a",border:"1px solid "+(m.strokeType==="4-stroke"?"#3a7bd555":m.strokeType==="Diesel"?"#3d9e5055":"#e8670a55"),whiteSpace:"nowrap"}}>{m.strokeType==="4-stroke"?"4T":m.strokeType==="Diesel"?"DSL":"2T"}</span>;
            if(k==="rage"&&(m.rage||0)>0) return <span key="rage" style={{fontSize:9,letterSpacing:-1}}>{"☠️".repeat(m.rage)}</span>;
            const field=ALL_BADGE_FIELDS.find(f=>f.k===k);
            if(field&&m[k]) return <span key={k} style={bStyle}>{(field.s?field.s.replace(":",""):field.l.split("/")[0].trim().split(" ").slice(0,2).join(" "))}: {String(m[k]).slice(0,14)}</span>;
            return null;
          })}
          {svc.overdue&&<span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:3,background:RED+"22",color:RED,border:"1px solid "+RED+"44"}}>SERVICE</span>}
          {!svc.overdue&&svc.dueSoon&&<span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:3,background:"#e8870a22",color:"#e8870a",border:"1px solid #e8870a44"}}>DUE SOON</span>}
          {clientName&&<span style={{fontSize:9,color:ACC}}>👤 {clientName}</span>}
          {hrs>0&&<span style={{fontSize:9,color:GRN,fontFamily:"'IBM Plex Mono',monospace"}}>{hrs.toFixed(1)}h</span>}
        </div>
        {specMatch&&(
          <div style={{fontSize:9,color:MUT,marginTop:4,lineHeight:1.4}}>
            <span style={{color:ACC,textTransform:"uppercase",letterSpacing:"0.06em",fontSize:8}}>{specMatch.label}:</span>{" "}
            {hl(specMatch.value,searchTokens)}
          </div>
        )}
      </div>
      <span style={{fontSize:10,color:"#555",flexShrink:0,marginTop:26}}>▶</span>
    </div>
  );
}

function MachineRow({ machine: m, onClick, clientName, searchQuery, searchTokens }) {
  const svc = getMachineServiceStatus(m);
  const timerRunning = (m.jobTimers||[]).some(t=>t.status==="running");
  const hrs = (m.timeLog||[]).reduce((s,e)=>s+(e.seconds||0),0)/3600;
  const specMatch = findMachineSpecMatch(m, searchQuery);
  return (
    <div onClick={onClick} style={{background:SURF,borderBottom:"1px solid "+BRD,padding:"10px 12px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:10,userSelect:"none"}}>
      <span style={{fontSize:22,flexShrink:0,lineHeight:1,marginTop:3}}>{mIcon(m.type)}</span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:700,color:TXT,lineHeight:1.2}}>
          {hl(m.name,searchTokens)}
          {timerRunning&&<span style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:GRN,boxShadow:"0 0 5px "+GRN,marginLeft:6,verticalAlign:"middle"}}/>}
        </div>
        {[m.make,m.model,m.year,m.source].filter(Boolean).length>0&&
          <div style={{fontSize:10,color:MUT,marginTop:2}}>
            {hl([m.make,m.model,m.year].filter(Boolean).join(" · "),searchTokens)}
            {m.source&&<span style={{color:"#444"}}> · {hl(m.source,searchTokens)}</span>}
          </div>}
        {m.type&&<div style={{fontSize:8,color:"#555",letterSpacing:"0.06em",textTransform:"uppercase",marginTop:1}}>{hl(m.type,searchTokens)}</div>}
        <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap",alignItems:"center"}}>
          <StatusBadge status={m.status||"Active"}/>
          {(m.tileFields&&m.tileFields.length>0?m.tileFields:DEFAULT_TILE).map(k=>{
            if(k==="status") return null;
            const tc=m.tileColors||{};
            const colIdx=tc[k]!==undefined?tc[k]:(TILE_COLOR_DEFAULTS[k]!==undefined&&TILE_COLOR_DEFAULTS[k]!=="auto"?TILE_COLOR_DEFAULTS[k]:0);
            const [cbg,cbrd,ctxt]=BADGE_PALETTE[colIdx]||BADGE_PALETTE[0];
            const bStyle={fontSize:9,fontWeight:700,letterSpacing:"0.08em",padding:"2px 6px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",background:cbg,color:ctxt,border:"1px solid "+cbrd,whiteSpace:"nowrap"};
            if(k==="strokeType"&&m.strokeType) return <span key="st" style={{fontSize:9,fontWeight:700,letterSpacing:"0.08em",padding:"2px 6px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",background:m.strokeType==="4-stroke"?"#0e1a2a":m.strokeType==="Diesel"?"#0e200e":"#1a0e00",color:m.strokeType==="4-stroke"?"#3a7bd5":m.strokeType==="Diesel"?"#3d9e50":"#e8670a",border:"1px solid "+(m.strokeType==="4-stroke"?"#3a7bd555":m.strokeType==="Diesel"?"#3d9e5055":"#e8670a55"),whiteSpace:"nowrap"}}>{m.strokeType==="4-stroke"?"4T":m.strokeType==="Diesel"?"DSL":"2T"}</span>;
            if(k==="rage"&&(m.rage||0)>0) return <span key="rage" style={{fontSize:9,letterSpacing:-1}}>{"☠️".repeat(m.rage)}</span>;
            const field=ALL_BADGE_FIELDS.find(f=>f.k===k);
            if(field&&m[k]) return <span key={k} style={bStyle}>{(field.s?field.s.replace(":",""):field.l.split("/")[0].trim().split(" ").slice(0,2).join(" "))}: {String(m[k]).slice(0,14)}</span>;
            return null;
          })}
          {svc.overdue&&<span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:3,background:RED+"22",color:RED,border:"1px solid "+RED+"44"}}>SERVICE</span>}
          {!svc.overdue&&svc.dueSoon&&<span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:3,background:"#e8870a22",color:"#e8870a",border:"1px solid #e8870a44"}}>DUE SOON</span>}
          {clientName&&<span style={{fontSize:9,color:ACC}}>👤 {clientName}</span>}
          {m.dueDate&&(()=>{const due=new Date(m.dueDate);const ov=due<new Date();return<span style={{fontSize:9,color:ov?"#e87a0a":MUT}}>{ov?"⚠ OVERDUE":"DUE "+due.toLocaleDateString('en-AU',{day:'numeric',month:'short'})}</span>;})()}
          {hrs>0&&<span style={{fontSize:9,color:GRN,fontFamily:"'IBM Plex Mono',monospace"}}>{hrs.toFixed(1)}h</span>}
          {(m.rage||0)>0&&<span style={{fontSize:9,letterSpacing:-1}}>{"☠️".repeat(m.rage)}</span>}
        </div>
        {specMatch&&(
          <div style={{fontSize:9,color:MUT,marginTop:4,lineHeight:1.4}}>
            <span style={{color:ACC,textTransform:"uppercase",letterSpacing:"0.06em",fontSize:8}}>{specMatch.label}:</span>{" "}
            {hl(specMatch.value,searchTokens)}
          </div>
        )}
      </div>
      <span style={{fontSize:10,color:"#555",flexShrink:0,marginTop:4}}>▶</span>
    </div>
  );
}

function Tracker({machines,setMachines,company,profile,setProfile,clients,isGuest,onGoToBilling,templateMachineId,onTemplateClear}){
  const [showAdd,setShowAdd]=useState(false);
  const [prefill,setPrefill]=useState(null);
  const [showUpgrade,setShowUpgrade]=useState(false);
  const [saving,setSaving]=useState(false);
  const [dragIdx,setDragIdx]=useState(null);
  const [dragOver,setDragOver]=useState(null);
  const [showSort,setShowSort]=useState(false);
  const [sortBy,setSortBy]=useState(()=>getPref(profile,"trackerSort",null));
  const [view,setView]=useState(()=>getPref(profile,"trackerView","photo"));
  const [tileOpen,setTileOpen]=useState(null);
  const [statusFilter,setStatusFilter]=useState(null);
  const [search,setSearch]=useState("");
  const [tutDone,setTutDone]=useState(()=>getPref(profile,'rat_tut',false));
  const [tutCardOpened,setTutCardOpened]=useState(false);
  const skipTut=()=>{setTutDone(true);savePref(profile?.id,'rat_tut',true);};
  const tutStep=!tutDone?(machines.length===0?1:machines.length===1?2:0):0;

  const clientMap = useMemo(() => Object.fromEntries((clients||[]).map(c => [c.id, c.name])), [clients]);
  const setViewP=v=>{setView(v);savePref(profile?.id,"trackerView",v);};
  const setSortByP=v=>{setSortBy(v);savePref(profile?.id,"trackerSort",v??null);};

  const SORT_OPTS=[
    {k:"name_az",l:"Name A → Z"},
    {k:"name_za",l:"Name Z → A"},
    {k:"status",l:"Status"},
    {k:"type",l:"Machine Type"},
    {k:"due",l:"Due Date (Soonest)"},
    {k:"newest",l:"Date Added (Newest)"},
    {k:"oldest",l:"Date Added (Oldest)"},
    {k:"rage_hi",l:"Rage ☠️ (Highest)"},
    {k:"rage_lo",l:"Rage ☠️ (Lowest)"},
  ];

  const searchQuery=search.trim();
  const searched=searchQuery
    ?machines.filter(m=>machineMatchesQuery(m,searchQuery))
    :machines;
  // Same tokenizer the wiki search uses (a single plain substring), and the
  // exact same hl() highlight component, so matches render identically.
  const searchTokens=tokenizeSearch(search);
  const filtered=statusFilter?searched.filter(m=>(m.status||"Active")===statusFilter):searched;
  const sorted=sortBy?[...filtered].sort((a,b)=>{
    if(sortBy==="name_az") return (a.name||"").localeCompare(b.name||"");
    if(sortBy==="name_za") return (b.name||"").localeCompare(a.name||"");
    if(sortBy==="status"){const o=["Active","Queued","Complete"];return o.indexOf(a.status||"Active")-o.indexOf(b.status||"Active");}
    if(sortBy==="type") return (a.type||"").localeCompare(b.type||"");
    if(sortBy==="due"){
      const ad=a.dueDate?new Date(a.dueDate).getTime():Infinity;
      const bd=b.dueDate?new Date(b.dueDate).getTime():Infinity;
      return ad-bd;
    }
    if(sortBy==="newest") return new Date(b.createdAt||0)-new Date(a.createdAt||0);
    if(sortBy==="oldest") return new Date(a.createdAt||0)-new Date(b.createdAt||0);
    if(sortBy==="rage_hi") return (b.rage||0)-(a.rage||0);
    if(sortBy==="rage_lo") return (a.rage||0)-(b.rage||0);
    return 0;
  }):filtered;


  const addM=async m=>{
    setSaving(true);
    try{
      await upsertMachine(m);
      setMachines(prev=>[m,...prev]);
      setShowAdd(false);
    }catch(e){alert("Save failed: "+e.message);}
    setSaving(false);
  };
  const updateM=async m=>{
    try{
      await upsertMachine(m);
      setMachines(prev=>prev.map(x=>x.id===m.id?m:x));
    }catch(e){alert("Save failed: "+e.message);}
  };
  const deleteM=async m=>{
    try{
      await deleteMachineApi(m.id);
      setMachines(prev=>prev.filter(x=>x.id!==m.id));
    }catch(e){alert("Delete failed: "+e.message);}
  };

  const onDragStart=(e,idx)=>{setDragIdx(idx);e.dataTransfer.effectAllowed="move";};
  const onDragOver=(e,idx)=>{e.preventDefault();setDragOver(idx);};
  const onDrop=(e,idx)=>{
    e.preventDefault();
    if(dragIdx===null||dragIdx===idx)return;
    const reordered=[...machines];
    const [moved]=reordered.splice(dragIdx,1);
    reordered.splice(idx,0,moved);
    setMachines(reordered);
    setDragIdx(null);setDragOver(null);
  };
  const onDragEnd=()=>{setDragIdx(null);setDragOver(null);};

  useEffect(()=>{
    if(!templateMachineId) return;
    supabase.rpc('get_public_machine',{p_id:templateMachineId}).then(({data})=>{
      if(data){
        setPrefill({name:data.name,type:data.type||"",make:data.make||"",model:data.model||"",year:data.year||"",desc:data.notes||""});
        setShowAdd(true);
      }
      onTemplateClear?.();
    }).catch(e=>{
      console.error("template fetch:",e);
      onTemplateClear?.();
    });
  },[templateMachineId]);

  return (
    <div style={{padding:16,flex:1}}>
      {showAdd&&<ErrorBoundary><MachineForm existing={prefill||undefined} onSave={m=>{addM(m);setPrefill(null);}} onClose={()=>{setShowAdd(false);setPrefill(null);}} company={company} units={profile?.units||"metric"} profile={profile} isGuest={isGuest}/></ErrorBoundary>}
      {showSort&&(
        <div style={ovly} onClick={()=>setShowSort(false)}>
          <div style={{...mdl,maxHeight:"70vh"}} onClick={ev=>ev.stopPropagation()}>
            <div style={mdlH}>
              <b style={{fontSize:13,textTransform:"uppercase",letterSpacing:"0.1em"}}>Sort Machines</b>
              <button style={{...btnG,...sm}} onClick={()=>setShowSort(false)}>✕</button>
            </div>
            <div style={{...mdlB,paddingTop:8}}>
              <label style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #1a1a1a",cursor:"pointer"}} onClick={()=>setSortByP(null)}>
                <input type="radio" readOnly checked={sortBy===null} style={{accentColor:ACC,width:15,height:15}} />
                <span style={{fontSize:11,color:sortBy===null?TXT:MUT,fontFamily:"'IBM Plex Mono',monospace"}}>Manual order (drag)</span>
              </label>
              {SORT_OPTS.map(o=>(
                <label key={o.k} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #1a1a1a",cursor:"pointer"}} onClick={()=>setSortByP(o.k)}>
                  <input type="radio" readOnly checked={sortBy===o.k} style={{accentColor:ACC,width:15,height:15}} />
                  <span style={{fontSize:11,color:sortBy===o.k?TXT:MUT,fontFamily:"'IBM Plex Mono',monospace"}}>{o.l}</span>
                </label>
              ))}
            </div>
            <div style={mdlF}>
              <button style={btnG} onClick={()=>{setSortByP(null);setShowSort(false);}}>Reset</button>
              <button style={btnA} onClick={()=>setShowSort(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
      <input style={{...inp,marginBottom:8,fontSize:11}} placeholder="Search name, make, model, or any spec (e.g. plug gap, tyre size)…" value={search} onChange={e=>setSearch(e.target.value)} />
      {machines.length>1&&<div style={{display:"flex",gap:0,marginBottom:10}}>
        {[null,"Active","Queued","Complete"].map((s,i,arr)=>{
          const count=s?searched.filter(m=>(m.status||"Active")===s).length:searched.length;
          const active=statusFilter===s;
          const c=s?SCOL[s]:MUT;
          return <button key={s||"all"} onClick={()=>setStatusFilter(statusFilter===s&&s!==null?null:s)} style={{fontSize:10,letterSpacing:"0.08em",fontWeight:700,textTransform:"uppercase",padding:"3px 8px",borderRadius:i===0?"2px 0 0 2px":i===arr.length-1?"0 2px 2px 0":0,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",border:"1px solid "+(active?c+"55":"#252525"),borderRight:i<arr.length-1?"none":undefined,background:active?c+"18":"transparent",color:active?c:c+"66"}}>{s||"All"} {count}</button>;
        })}
      </div>}
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:8,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",rowGap:6}}>
          <span style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,whiteSpace:"nowrap"}}>Machines</span>
          {sortBy&&<span style={{fontSize:10,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase",border:"1px solid "+ACC+"44",borderRadius:2,padding:"1px 5px",whiteSpace:"nowrap"}}>{SORT_OPTS.find(o=>o.k===sortBy)?.l}</span>}
          {!isGuest&&(profile?.tier||"free")==="free"&&<span style={{fontSize:10,color:atMachineLimit(machines.length,profile,company)?RED:MUT,letterSpacing:"0.06em",whiteSpace:"nowrap"}}>{machines.length}/{machineLimit(profile,company)}</span>}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <button style={{...btnG,color:sortBy?ACC:MUT,alignSelf:"stretch"}} onClick={()=>setShowSort(true)} title="Sort machines">⚙️</button>
          <button onClick={()=>setViewP(view==="list"?"grid":view==="grid"?"compact":view==="compact"?"photo":"list")} style={{...btnG,minWidth:36,alignSelf:"stretch",color:view!=="list"?ACC:undefined}} title={view==="list"?"Grid view":view==="grid"?"Compact list":view==="compact"?"Photo list":"Standard list"}>{view==="list"?"⊞":view==="grid"?"≡":view==="compact"?"▣":"☰"}</button>
          {isGuest&&machines.length>=3
            ? <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:9,color:MUT,letterSpacing:"0.06em"}}>3 machine guest limit</span>
                <button style={{...btnA,...sm,background:"#1a7a3a",borderColor:"#1a7a3a"}} onClick={()=>setShowUpgrade(true)}>Create a free account →</button>
              </div>
            : !isGuest&&atMachineLimit(machines.length,profile,company)
            ? <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:9,color:MUT,letterSpacing:"0.06em"}}>{machineLimit(profile,company)} machines — nice work</span>
                <button style={{...btnA}} onClick={onGoToBilling}>Go unlimited →</button>
              </div>
            : <button style={{...btnA, minHeight:44, display:"flex", alignItems:"center"}} onClick={()=>setShowAdd(true)}>+ Add</button>}
        </div>
      </div>
      {saving&&<div style={{fontSize:10,color:MUT,marginBottom:10}}>Saving...</div>}
      {tutStep===1&&<GuideStep1 onSkip={skipTut} isGuest={isGuest} onUpgrade={()=>setShowUpgrade(true)}/>}
      {tutStep===0&&machines.length===0&&<Empty icon="🔧" t="No machines yet" sub="Tap + Add above to add your first machine — mowers, bikes, generators, anything you work on." />}
      {machines.length>0&&sorted.length===0&&<div style={{fontSize:10,color:MUT,textAlign:"center",padding:"24px 0"}}>No machines match your filter.</div>}
      {tutStep===2&&!tutCardOpened&&<GuideStep2 onSkip={skipTut}/>}
      {/* Shared tile overlay — used by both grid and compact views */}
      {tileOpen&&(()=>{const m=sorted.find(x=>x.id===tileOpen);return m?(
        <div style={{position:"fixed",inset:0,background:"#000",zIndex:200,overflowY:"auto"}}>
          <div style={{maxWidth:640,margin:"0 auto",padding:"8px 8px 0"}}>
            <button onClick={()=>setTileOpen(null)} style={{...btnA,width:"100%",marginBottom:8,fontSize:12,background:ACC,borderColor:ACC,color:"#000",fontWeight:700}}>✕ Close</button>
            <MachineCard machine={m} onUpdate={u=>{updateM(u);}} onDelete={d=>{deleteM(d);setTileOpen(null);}} company={company} profile={profile} clients={clients} isGuest={isGuest} showGuide={tutStep===2} onTutDismiss={skipTut} onCardOpened={()=>setTutCardOpened(true)} initialOpen hideCollapse/>
          </div>
        </div>
      ):null;})()}
      {view==="grid"?(
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
          {sorted.map(m=>(
            <MachineTile key={m.id} machine={m} onClick={()=>setTileOpen(m.id)} clientName={m.clientId?clientMap[m.clientId]:null}/>
          ))}
        </div>
      ):view==="compact"?(
        <div style={{borderTop:"1px solid "+BRD,borderRadius:3,overflow:"hidden"}}>
          {sorted.map(m=>(
            <MachineRow key={m.id} machine={m} onClick={()=>setTileOpen(m.id)} clientName={m.clientId?clientMap[m.clientId]:null} searchQuery={searchQuery} searchTokens={searchTokens}/>
          ))}
        </div>
      ):view==="photo"?(
        <div style={{borderTop:"1px solid "+BRD,borderRadius:3,overflow:"hidden"}}>
          {sorted.map(m=>(
            <MachinePhotoRow key={m.id} machine={m} onClick={()=>setTileOpen(m.id)} clientName={m.clientId?clientMap[m.clientId]:null} searchQuery={searchQuery} searchTokens={searchTokens}/>
          ))}
        </div>
      ):sorted.length > 0 && (
        // Virtuoso for sorted/filtered lists (no drag reorder); fall back to plain map only for manual-drag mode with small lists
        sortBy || sorted.length > 30
          ? <Virtuoso
              useWindowScroll
              data={sorted}
              itemContent={(_idx, m) => (
                <MachineCard key={m.id} machine={m} onUpdate={updateM} onDelete={deleteM} company={company} profile={profile} clients={clients} isGuest={isGuest} showGuide={tutStep===2} onTutDismiss={skipTut} onCardOpened={()=>setTutCardOpened(true)}/>
              )}
            />
          : sorted.map((m,idx)=>(
              <div
                key={m.id}
                draggable
                onDragStart={e=>onDragStart(e,idx)}
                onDragOver={e=>onDragOver(e,idx)}
                onDrop={e=>onDrop(e,idx)}
                onDragEnd={onDragEnd}
                style={{opacity:dragIdx===idx?0.4:1,borderTop:dragOver===idx&&dragIdx!==idx?"2px solid "+ACC:"2px solid transparent",transition:"opacity 0.15s,border-color 0.1s"}}
              >
                <MachineCard machine={m} onUpdate={updateM} onDelete={deleteM} company={company} profile={profile} clients={clients} isGuest={isGuest} showGuide={tutStep===2} onTutDismiss={skipTut} onCardOpened={()=>setTutCardOpened(true)}/>
              </div>
            ))
      )}
      {showUpgrade&&<GuestUpgradeModal profile={profile} setProfile={setProfile} onClose={()=>setShowUpgrade(false)}/>}
    </div>
  );
}
export default Tracker;