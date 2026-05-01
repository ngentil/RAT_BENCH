import React, { useState } from 'react';
import { upsertMachine, deleteMachineApi } from '../../lib/db';
import { ACC, MUT, BRD, SURF, TXT, btnA, btnG, dvdr, sm, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { MACHINE_TYPES } from '../../lib/constants';
import MachineTile from '../machine/MachineTile';
import MachineCard from '../machine/MachineCard';
import { SL, Empty } from '../ui/shared';
import MachineForm from '../machine/MachineForm';
import ErrorBoundary from '../ui/ErrorBoundary';
function Tracker({machines,setMachines,company,profile}){
  const [showAdd,setShowAdd]=useState(false);
  const [saving,setSaving]=useState(false);
  const [dragIdx,setDragIdx]=useState(null);
  const [dragOver,setDragOver]=useState(null);
  const [showSort,setShowSort]=useState(false);
  const [sortBy,setSortBy]=useState(null);
  const [view,setView]=useState(()=>localStorage.getItem("trackerView")||"list");
  const [cols,setCols]=useState(()=>parseInt(localStorage.getItem("trackerCols")||"2"));
  const [tileOpen,setTileOpen]=useState(null);
  const setViewP=v=>{setView(v);localStorage.setItem("trackerView",v);};
  const setColsP=c=>{setCols(c);localStorage.setItem("trackerCols",String(c));setViewP("grid");};

  const SORT_OPTS=[
    {k:"name_az",l:"Name A → Z"},
    {k:"name_za",l:"Name Z → A"},
    {k:"status",l:"Status"},
    {k:"type",l:"Machine Type"},
    {k:"newest",l:"Date Added (Newest)"},
    {k:"oldest",l:"Date Added (Oldest)"},
    {k:"rage_hi",l:"Rage ☠️ (Highest)"},
    {k:"rage_lo",l:"Rage ☠️ (Lowest)"},
  ];

  const sorted=sortBy?[...machines].sort((a,b)=>{
    if(sortBy==="name_az") return (a.name||"").localeCompare(b.name||"");
    if(sortBy==="name_za") return (b.name||"").localeCompare(a.name||"");
    if(sortBy==="status"){const o=["Active","Queued","Complete"];return o.indexOf(a.status||"Active")-o.indexOf(b.status||"Active");}
    if(sortBy==="type") return (a.type||"").localeCompare(b.type||"");
    if(sortBy==="newest") return new Date(b.createdAt||0)-new Date(a.createdAt||0);
    if(sortBy==="oldest") return new Date(a.createdAt||0)-new Date(b.createdAt||0);
    if(sortBy==="rage_hi") return (b.rage||0)-(a.rage||0);
    if(sortBy==="rage_lo") return (a.rage||0)-(b.rage||0);
    return 0;
  }):machines;

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
      {showAdd&&<ErrorBoundary><MachineForm onSave={addM} onClose={()=>setShowAdd(false)} company={company} units={profile?.units||"metric"} profile={profile}/></ErrorBoundary>}
      {showSort&&(
        <div style={ovly} onClick={()=>setShowSort(false)}>
          <div style={{...mdl,maxHeight:"70vh"}} onClick={ev=>ev.stopPropagation()}>
            <div style={mdlH}>
              <b style={{fontSize:13,textTransform:"uppercase",letterSpacing:"0.1em"}}>Sort Machines</b>
              <button style={{...btnG,...sm}} onClick={()=>setShowSort(false)}>✕</button>
            </div>
            <div style={{...mdlB,paddingTop:8}}>
              <label style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #1a1a1a",cursor:"pointer"}} onClick={()=>setSortBy(null)}>
                <input type="radio" readOnly checked={sortBy===null} style={{accentColor:ACC,width:15,height:15}} />
                <span style={{fontSize:11,color:sortBy===null?TXT:MUT,fontFamily:"'IBM Plex Mono',monospace"}}>Manual order (drag)</span>
              </label>
              {SORT_OPTS.map(o=>(
                <label key={o.k} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #1a1a1a",cursor:"pointer"}} onClick={()=>setSortBy(o.k)}>
                  <input type="radio" readOnly checked={sortBy===o.k} style={{accentColor:ACC,width:15,height:15}} />
                  <span style={{fontSize:11,color:sortBy===o.k?TXT:MUT,fontFamily:"'IBM Plex Mono',monospace"}}>{o.l}</span>
                </label>
              ))}
            </div>
            <div style={mdlF}>
              <button style={btnG} onClick={()=>{setSortBy(null);setShowSort(false);}}>Reset</button>
              <button style={btnA} onClick={()=>setShowSort(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <SL t="Machines" />
          {sortBy&&<span style={{fontSize:8,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase",border:"1px solid "+ACC+"44",borderRadius:2,padding:"1px 5px"}}>{SORT_OPTS.find(o=>o.k===sortBy)?.l}</span>}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <button style={{background:"none",border:"1px solid #2a2a2a",borderRadius:2,color:sortBy?ACC:MUT,cursor:"pointer",fontSize:11,padding:"4px 6px"}} onClick={()=>setShowSort(true)} title="Sort machines">⚙️</button>
          <button onClick={()=>{if(view==="list"){setColsP(2);}else if(cols<4){setColsP(cols+1);}else{setViewP("list");}}} style={{...btnG,...sm,fontSize:9,minWidth:36}}>{view==="list"?"☰":`⊞${cols}`}</button>
          <button style={{...btnA,...sm}} onClick={()=>setShowAdd(true)}>+ Add</button>
        </div>
      </div>
      {saving&&<div style={{fontSize:10,color:MUT,marginBottom:10}}>Saving...</div>}
      {machines.length===0&&<Empty t="No machines yet — tap + Add" />}
      {view==="grid"?(
        <>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:8}}>
            {sorted.map(m=>(
              <MachineTile key={m.id} machine={m} onClick={()=>setTileOpen(m.id)}/>
            ))}
          </div>
          {tileOpen&&(()=>{const m=sorted.find(x=>x.id===tileOpen);return m?(
            <div style={{position:"fixed",inset:0,background:"#000a",zIndex:200,overflowY:"auto"}} onClick={e=>{if(e.target===e.currentTarget)setTileOpen(null);}}>
              <div style={{maxWidth:640,margin:"24px auto",padding:"0 8px"}}>
                <MachineCard machine={m} onUpdate={u=>{updateM(u);}} onDelete={d=>{deleteM(d);setTileOpen(null);}} company={company} profile={profile}/>
                <button onClick={()=>setTileOpen(null)} style={{...btnG,width:"100%",marginTop:8,fontSize:10}}>Close</button>
              </div>
            </div>
          ):null;})()}
        </>
      ):sorted.map((m,idx)=>(
        <div
          key={m.id}
          draggable={!sortBy}
          onDragStart={e=>!sortBy&&onDragStart(e,idx)}
          onDragOver={e=>!sortBy&&onDragOver(e,idx)}
          onDrop={e=>!sortBy&&onDrop(e,idx)}
          onDragEnd={onDragEnd}
          style={{opacity:dragIdx===idx?0.4:1,borderTop:dragOver===idx&&dragIdx!==idx?"2px solid "+ACC:"2px solid transparent",transition:"opacity 0.15s,border-color 0.1s"}}
        >
          <MachineCard machine={m} onUpdate={updateM} onDelete={deleteM} company={company} profile={profile}/>
        </div>
      ))}
    </div>
  );
}
export default Tracker;