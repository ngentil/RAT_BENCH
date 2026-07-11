import React, { useState, useMemo, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { upsertMachine, deleteMachineApi } from '../../lib/db';
import { ACC, MUT, BRD, SURF, TXT, RED, btnA, btnG, dvdr, sm, ovly, mdl, mdlH, mdlB, mdlF, inp } from '../../lib/styles';
import { SCOL } from '../../lib/constants';
import { atMachineLimit, machineLimit } from '../../lib/gates';
import { getPref, savePref } from '../../lib/db/preferences';
import MachineTile from '../machine/MachineTile';
import MachineRow from '../machine/MachineRow';
import MachinePhotoRow from '../machine/MachinePhotoRow';
import MachineCard from '../machine/MachineCard';
import { Empty } from '../ui/shared';
import MachineForm from '../machine/MachineForm';
import ErrorBoundary from '../ui/ErrorBoundary';
import GuestUpgradeModal from '../auth/GuestUpgradeModal';
import { machineMatchesQuery } from '../../lib/helpers';
import { tokenizeSearch } from '../../lib/wiki';

const _ARW = "#e8870a";
const _M = { fontFamily:"'IBM Plex Mono',monospace" };

// The arrow needs pixel precision (it has to actually land on the +Add
// button), so it's positioned via a measured anchor — but the button sits
// fairly close to the left edge on a narrow phone screen, so right-anchoring
// the TEXT below it the same way risked the text block overflowing past the
// left edge entirely (there isn't always 200px of room to its left). The
// text doesn't need pixel-perfect alignment the way the arrow does — it just
// needs to be legible — so it renders in normal document flow, left-aligned
// like the rest of the page, while only the arrow is absolutely positioned.
function GuideArrow({ anchor }) {
  if (!anchor) return null;
  return (
    <svg className="arrow-guide" width="62" height="54" viewBox="0 0 62 54" style={{ position:"absolute", right:anchor.right, top:anchor.top, zIndex:1 }}>
      <path d="M 8 51 C 14 35, 32 18, 54 8" stroke={_ARW} strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <path d="M 49 4 L 56 9 L 51 15" stroke={_ARW} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GuideStep1({ onSkip, isGuest, onUpgrade, visible }) {
  if (!visible) return null;
  return (
    <div style={{ marginTop:58, marginBottom:20, userSelect:"none" }}>
      <div style={{ ..._M, fontSize:13, color:_ARW, fontWeight:700 }}>start here</div>
      <div style={{ ..._M, fontSize:9, color:"#666", marginTop:4 }}>tap + Add to track your first machine</div>
      <div style={{ ..._M, fontSize:9, color:"#555", marginTop:2 }}>name &amp; type is all you need to begin</div>
      {isGuest && (
        <div style={{ ..._M, fontSize:10, color:"#444", marginTop:8 }}>
          guest: 3-machine limit ·{" "}
          <span onClick={onUpgrade} style={{ color:_ARW, cursor:"pointer" }}>create a free account →</span>
        </div>
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

function Tracker({machines,setMachines,company,profile,setProfile,clients,isGuest,onGoToBilling,templateMachineId,onTemplateClear}){
  const [showAdd,setShowAdd]=useState(false);
  const [prefill,setPrefill]=useState(null);
  const [showUpgrade,setShowUpgrade]=useState(false);
  const [saving,setSaving]=useState(false);
  const [dragIdx,setDragIdx]=useState(null);
  const [dragOver,setDragOver]=useState(null);
  const [showSort,setShowSort]=useState(false);
  const [sortBy,setSortBy]=useState(()=>getPref(profile,"trackerSort",null));
  // "list" (poster-card) view was removed — it duplicated the full MachineCard
  // overlay every tile already opens into. Migrate any saved pref to photo.
  const [view,setView]=useState(()=>{
    const v=getPref(profile,"trackerView","photo");
    return v==="list"?"photo":v;
  });
  const [tileOpen,setTileOpen]=useState(null);
  // Phone back button closes the full-screen tile overlay in one press instead
  // of just collapsing the card inside it (mirrors MachineCard's own cardOpen
  // history trick, one level up).
  useEffect(()=>{
    if(!tileOpen) return;
    history.pushState({trackerTileOpen:tileOpen},'');
    const onPop=e=>{
      if(e.state?.trackerTileOpen===tileOpen) return;
      setTileOpen(null);
    };
    window.addEventListener('popstate',onPop);
    return ()=>window.removeEventListener('popstate',onPop);
  },[tileOpen]);
  const closeTile=()=>{
    if(history.state?.trackerTileOpen===tileOpen) history.back();
    else setTileOpen(null);
  };
  const [statusFilter,setStatusFilter]=useState(null);
  const [search,setSearch]=useState("");
  const [tutDone,setTutDone]=useState(()=>getPref(profile,'rat_tut',false));
  const [tutCardOpened,setTutCardOpened]=useState(false);
  const skipTut=()=>{setTutDone(true);savePref(profile?.id,'rat_tut',true);};
  const tutStep=!tutDone?(machines.length===0?1:machines.length===1?2:0):0;

  // Measures the real +Add button position so GuideStep1's arrow can anchor
  // to it precisely — flexbox right-alignment isn't reliable here since the
  // guide's own text (e.g. "guest: 3-machine limit…") can be wider than the
  // button row it's meant to point at.
  const contentRef=useRef(null);
  const addBtnRef=useRef(null);
  const [addBtnAnchor,setAddBtnAnchor]=useState(null);
  useLayoutEffect(()=>{
    if(tutStep!==1){setAddBtnAnchor(null);return;}
    const measure=()=>{
      if(!addBtnRef.current||!contentRef.current)return;
      const btn=addBtnRef.current.getBoundingClientRect();
      const container=contentRef.current.getBoundingClientRect();
      setAddBtnAnchor({right:container.right-btn.right,top:btn.bottom-container.top+8});
    };
    measure();
    window.addEventListener('resize',measure);
    return ()=>window.removeEventListener('resize',measure);
  },[tutStep,isGuest]);

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
    <div ref={contentRef} style={{padding:16,flex:1,position:"relative"}}>
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
          <button onClick={()=>setViewP(view==="grid"?"compact":view==="compact"?"photo":"grid")} style={{...btnG,minWidth:36,alignSelf:"stretch",color:ACC}} title={view==="grid"?"Compact list":view==="compact"?"Photo list":"Grid view"}>{view==="grid"?"≡":view==="compact"?"▣":"☰"}</button>
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
            : <button ref={addBtnRef} style={{...btnA, minHeight:44, display:"flex", alignItems:"center"}} onClick={()=>setShowAdd(true)}>+ Add</button>}
        </div>
      </div>
      <GuideArrow anchor={tutStep===1?addBtnAnchor:null}/>
      <GuideStep1 onSkip={skipTut} isGuest={isGuest} onUpgrade={()=>setShowUpgrade(true)} visible={tutStep===1}/>
      {saving&&<div style={{fontSize:10,color:MUT,marginBottom:10}}>Saving...</div>}
      {tutStep===0&&machines.length===0&&<Empty icon="🔧" t="No machines yet" sub="Tap + Add above to add your first machine — mowers, bikes, generators, anything you work on." />}
      {machines.length>0&&sorted.length===0&&<div style={{fontSize:10,color:MUT,textAlign:"center",padding:"24px 0"}}>No machines match your filter.</div>}
      {tutStep===2&&!tutCardOpened&&<GuideStep2 onSkip={skipTut}/>}
      {/* Shared tile overlay — used by both grid and compact views */}
      {tileOpen&&(()=>{const m=sorted.find(x=>x.id===tileOpen);return m?(
        <div style={{position:"fixed",inset:0,background:"#000",zIndex:200,overflowY:"auto"}}>
          <div style={{maxWidth:640,margin:"0 auto",padding:"8px 8px 0"}}>
            <MachineCard machine={m} onUpdate={u=>{updateM(u);}} onDelete={d=>{deleteM(d);setTileOpen(null);}} company={company} profile={profile} clients={clients} isGuest={isGuest} showGuide={tutStep===2} onTutDismiss={skipTut} onCardOpened={()=>setTutCardOpened(true)} initialOpen hideCollapse onClose={closeTile} searchQuery={searchQuery} searchTokens={searchTokens}/>
          </div>
        </div>
      ):null;})()}
      {(()=>{
        const Comp = view==="grid"?MachineTile:view==="compact"?MachineRow:MachinePhotoRow;
        const wrapStyle = view==="grid"
          // alignItems:"start" stops a tile with a long wrapped name from
          // stretching its whole grid row — without it every tile in that
          // row grows to match the tallest one, leaving dead space under
          // shorter tiles instead of each one just hugging its own content.
          ?{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,alignItems:"start"}
          :{borderTop:"1px solid "+BRD,borderRadius:3,overflow:"hidden"};
        return (
          <div style={wrapStyle}>
            {sorted.map((m,idx)=>(
              <div key={m.id} draggable={!sortBy}
                onDragStart={sortBy?undefined:e=>onDragStart(e,idx)}
                onDragOver={sortBy?undefined:e=>onDragOver(e,idx)}
                onDrop={sortBy?undefined:e=>onDrop(e,idx)}
                onDragEnd={sortBy?undefined:onDragEnd}
                style={sortBy?undefined:{opacity:dragIdx===idx?0.4:1,outline:dragOver===idx&&dragIdx!==idx?"2px solid "+ACC:"2px solid transparent",outlineOffset:-2,transition:"opacity 0.15s,outline-color 0.1s"}}
              >
                <Comp machine={m} onClick={()=>setTileOpen(m.id)} clientName={m.clientId?clientMap[m.clientId]:null} searchQuery={searchQuery} searchTokens={searchTokens}/>
              </div>
            ))}
          </div>
        );
      })()}
      {showUpgrade&&<GuestUpgradeModal profile={profile} setProfile={setProfile} onClose={()=>setShowUpgrade(false)}/>}
    </div>
  );
}
export default Tracker;