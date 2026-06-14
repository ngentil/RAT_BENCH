import React, { useState, useMemo, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { upsertMachine, deleteMachineApi } from '../../lib/db';
import { ACC, MUT, BRD, SURF, TXT, RED, GRN, btnA, btnG, dvdr, sm, ovly, mdl, mdlH, mdlB, mdlF, inp } from '../../lib/styles';
import { MACHINE_TYPES, SCOL, SBG_ } from '../../lib/constants';
import { atMachineLimit } from '../../lib/gates';
import MachineTile from '../machine/MachineTile';
import MachineCard from '../machine/MachineCard';
import { SL, Empty } from '../ui/shared';
import MachineForm from '../machine/MachineForm';
import ErrorBoundary from '../ui/ErrorBoundary';
import GuestUpgradeModal from '../auth/GuestUpgradeModal';

const _ARW = "#e8870a";
const _M = { fontFamily:"'IBM Plex Mono',monospace" };

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
function Tracker({machines,setMachines,company,profile,setProfile,clients,isGuest,onGoToBilling}){
  const [showAdd,setShowAdd]=useState(false);
  const [showUpgrade,setShowUpgrade]=useState(false);
  const [saving,setSaving]=useState(false);
  const [dragIdx,setDragIdx]=useState(null);
  const [dragOver,setDragOver]=useState(null);
  const [showSort,setShowSort]=useState(false);
  const [sortBy,setSortBy]=useState(()=>localStorage.getItem("trackerSort")||null);
  const [view,setView]=useState(()=>localStorage.getItem("trackerView")||"list");
  const [cols,setCols]=useState(()=>parseInt(localStorage.getItem("trackerCols")||"2"));
  const [tileOpen,setTileOpen]=useState(null);
  const [statusFilter,setStatusFilter]=useState(null);
  const [search,setSearch]=useState("");
  const [tutDone,setTutDone]=useState(()=>localStorage.getItem('rat_tut')==='1');
  const [tutCardOpened,setTutCardOpened]=useState(false);
  const skipTut=()=>{localStorage.setItem('rat_tut','1');setTutDone(true);};
  const tutStep=!tutDone?(machines.length===0?1:machines.length===1?2:0):0;

  const clientMap = useMemo(() => Object.fromEntries((clients||[]).map(c => [c.id, c.name])), [clients]);
  const setViewP=v=>{setView(v);localStorage.setItem("trackerView",v);};
  const setSortByP=v=>{setSortBy(v);if(v)localStorage.setItem("trackerSort",v);else localStorage.removeItem("trackerSort");};
  const setColsP=c=>{setCols(c);localStorage.setItem("trackerCols",String(c));setViewP("grid");};

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

  const searched=search.trim()
    ?machines.filter(m=>{const q=search.toLowerCase();return (m.name||"").toLowerCase().includes(q)||(m.make||"").toLowerCase().includes(q)||(m.model||"").toLowerCase().includes(q)||(m.type||"").toLowerCase().includes(q);})
    :machines;
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

  const totalHrsAll = useMemo(() => machines.reduce((s,m) => s + (m.timeLog||[]).reduce((a,e) => a+(e.seconds||0),0)/3600, 0), [machines]);
  const rate = company?.hourly_rate || 0;

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
    if(!confirm(`Delete "${m.name}" and all its history?`))return;
    await deleteMachineApi(m.id);
    setMachines(prev=>prev.filter(x=>x.id!==m.id));
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

  return (
    <div style={{padding:16,flex:1}}>
      {showAdd&&<ErrorBoundary><MachineForm onSave={addM} onClose={()=>setShowAdd(false)} company={company} units={profile?.units||"metric"} profile={profile} isGuest={isGuest}/></ErrorBoundary>}
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
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <SL t="Machines" />
          {sortBy&&<span style={{fontSize:10,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase",border:"1px solid "+ACC+"44",borderRadius:2,padding:"1px 5px"}}>{SORT_OPTS.find(o=>o.k===sortBy)?.l}</span>}
          {!isGuest&&(profile?.tier||"free")==="free"&&<span style={{fontSize:10,color:atMachineLimit(machines.length,profile,company)?RED:MUT,letterSpacing:"0.06em"}}>{machines.length}/10</span>}
          {totalHrsAll>0&&<span style={{fontSize:10,color:GRN,letterSpacing:"0.06em"}}>{totalHrsAll.toFixed(1)}h{rate>0?" · $"+(totalHrsAll*rate).toFixed(0):""}</span>}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <button style={{background:"none",border:"1px solid #2a2a2a",borderRadius:2,color:sortBy?ACC:MUT,cursor:"pointer",fontSize:11,padding:"4px 6px"}} onClick={()=>setShowSort(true)} title="Sort machines">⚙️</button>
          <button onClick={()=>{if(view==="list"){setColsP(2);}else if(cols<4){setColsP(cols+1);}else{setViewP("list");}}} style={{...btnG,...sm,fontSize:9,minWidth:36}}>{view==="list"?"☰":`⊞${cols}`}</button>
          {isGuest&&machines.length>=3
            ? <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:9,color:MUT,letterSpacing:"0.06em"}}>3 machine guest limit</span>
                <button style={{...btnA,...sm,background:"#1a7a3a",borderColor:"#1a7a3a"}} onClick={()=>setShowUpgrade(true)}>Create a free account →</button>
              </div>
            : !isGuest&&atMachineLimit(machines.length,profile,company)
            ? <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:9,color:MUT,letterSpacing:"0.06em"}}>10 machines — nice work</span>
                <button style={{...btnA,...sm}} onClick={onGoToBilling}>Go unlimited →</button>
              </div>
            : <button style={{...btnA,...sm}} onClick={()=>setShowAdd(true)}>+ Add</button>}
        </div>
      </div>
      {machines.length>5&&<input style={{...inp,marginBottom:8,fontSize:11}} placeholder="Search machines…" value={search} onChange={e=>setSearch(e.target.value)} />}
      {machines.length>1&&<div style={{display:"flex",gap:0,marginBottom:10}}>
        {[null,"Active","Queued","Complete"].map((s,i,arr)=>{
          const count=s?searched.filter(m=>(m.status||"Active")===s).length:searched.length;
          const active=statusFilter===s;
          const c=s?SCOL[s]:MUT;
          return <button key={s||"all"} onClick={()=>setStatusFilter(statusFilter===s&&s!==null?null:s)} style={{fontSize:10,letterSpacing:"0.08em",fontWeight:700,textTransform:"uppercase",padding:"3px 8px",borderRadius:i===0?"2px 0 0 2px":i===arr.length-1?"0 2px 2px 0":0,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",border:"1px solid "+(active?c+"55":"#252525"),borderRight:i<arr.length-1?"none":undefined,background:active?c+"18":"transparent",color:active?c:c+"66"}}>{s||"All"} {count}</button>;
        })}
      </div>}
      {saving&&<div style={{fontSize:10,color:MUT,marginBottom:10}}>Saving...</div>}
      {tutStep===1&&<GuideStep1 onSkip={skipTut} isGuest={isGuest} onUpgrade={()=>setShowUpgrade(true)}/>}
      {tutStep===0&&machines.length===0&&<Empty icon="🔧" t="No machines yet" sub="Tap + Add above to add your first machine — mowers, bikes, generators, anything you work on." />}
      {machines.length>0&&sorted.length===0&&<div style={{fontSize:10,color:MUT,textAlign:"center",padding:"24px 0"}}>No machines match your filter.</div>}
      {tutStep===2&&!tutCardOpened&&<GuideStep2 onSkip={skipTut}/>}
      {view==="grid"?(
        <>
          {sorted.length > 0 && (
            <Virtuoso
              useWindowScroll
              data={sorted}
              style={{display:"grid"}}
              itemContent={(_idx, m) => (
                <div key={m.id} style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:8,marginBottom:0}}>
                  <MachineTile machine={m} onClick={()=>setTileOpen(m.id)} clientName={m.clientId?clientMap[m.clientId]:null}/>
                </div>
              )}
            />
          )}
          {tileOpen&&(()=>{const m=sorted.find(x=>x.id===tileOpen);return m?(
            <div style={{position:"fixed",inset:0,background:"#000a",zIndex:200,overflowY:"auto"}} onClick={e=>{if(e.target===e.currentTarget)setTileOpen(null);}}>
              <div style={{maxWidth:640,margin:"24px auto",padding:"0 8px"}}>
                <MachineCard machine={m} onUpdate={u=>{updateM(u);}} onDelete={d=>{deleteM(d);setTileOpen(null);}} company={company} profile={profile} clients={clients} isGuest={isGuest} showGuide={tutStep===2} onTutDismiss={skipTut} onCardOpened={()=>setTutCardOpened(true)}/>
                <button onClick={()=>setTileOpen(null)} style={{...btnG,width:"100%",marginTop:8,fontSize:10}}>Close</button>
              </div>
            </div>
          ):null;})()}
        </>
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