import React, { useState, useEffect, useRef } from 'react';
import { ACC, MUT, BRD2, TXT, dvdr, empt, btnA, btnG, btnD, inp, sel, txa, sm, col, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { RAGE_LBL, FASTENER_LOCS, FASTENER_TYPES, DRIVE_TYPES, BOLT_DIAMETERS, STUD_LOCS, RAM_LOCATIONS, ATTACH_TYPES, ALL_SECTIONS, ALL_BADGE_FIELDS, BADGE_PALETTE, DEFAULT_TILE, LIGHT_LOCATIONS, LIGHT_TYPES, LIGHT_VOLTAGES, LIGHT_PLUGS } from '../../lib/constants';

export function SL({t}){ return <div style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,marginBottom:8}}>{t}</div>; }
export function FL({t}){ return <div style={{fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:MUT,marginBottom:4}}>{t}</div>; }
export function Divider(){ return <div style={dvdr} />; }
export function Empty({t}){ return <div style={empt}>{t}</div>; }

export function Tooltip({text,children,pos="top"}){
  const [vis,setVis]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{
    if(!vis)return;
    const close=(e)=>{if(ref.current&&!ref.current.contains(e.target))setVis(false);};
    document.addEventListener("pointerdown",close);
    return()=>document.removeEventListener("pointerdown",close);
  },[vis]);
  const above=pos!=="bottom";
  return (
    <div ref={ref} style={{position:"relative",display:"inline-flex",alignItems:"center",gap:3}}>
      {children}
      <span
        onMouseEnter={()=>setVis(true)} onMouseLeave={()=>setVis(false)}
        onClick={e=>{e.stopPropagation();setVis(v=>!v)}}
        style={{color:MUT,fontSize:9,cursor:"pointer",userSelect:"none",opacity:0.6,flexShrink:0,lineHeight:1}}>ⓘ</span>
      {vis&&<div style={{position:"absolute",[above?"bottom":"top"]:"calc(100% + 5px)",left:0,maxWidth:"min(240px,calc(100vw - 32px))",background:"rgba(14,14,14,0.96)",border:"1px solid #2a2a2a",borderRadius:2,padding:"7px 10px",fontSize:9,color:"#ccc",whiteSpace:"normal",zIndex:9999,letterSpacing:"0.05em",lineHeight:1.6,fontFamily:"'IBM Plex Mono',monospace",boxShadow:"0 4px 16px rgba(0,0,0,0.7)"}}>{text}</div>}
    </div>
  );
}

export function SkullRating({value,onChange}){
  const [hov,setHov]=useState(0);
  const d=hov||value||0;
  return (
    <div>
      <FL t="Rage Factor" />
      <div style={{display:"flex",gap:2,alignItems:"center"}}>
        {[1,2,3,4,5].map(n=>(
          <button key={n} onClick={()=>onChange(n===value?0:n)} onMouseEnter={()=>setHov(n)} onMouseLeave={()=>setHov(0)}
            style={{background:"none",border:"none",cursor:"pointer",fontSize:16,padding:"1px",opacity:n<=d?1:0.15}}>☠️</button>
        ))}
        {value>0&&<span style={{fontSize:9,color:MUT,marginLeft:4,fontFamily:"'IBM Plex Mono',monospace"}}>{RAGE_LBL[value]}</span>}
      </div>
    </div>
  );
}

export function SpecCell({label,value,highlight}){
  return (
    <div style={{background:"#0d0d0d",border:"1px solid "+(highlight?"#3a2200":BRD2),borderRadius:2,padding:"6px 9px"}}>
      <div style={{fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase",color:highlight?ACC:MUT,marginBottom:2}}>{label}</div>
      <div style={{fontSize:11,color:highlight?"#e8a060":TXT,fontFamily:"'IBM Plex Mono',monospace"}}>{value}</div>
    </div>
  );
}

export function FastenerRow({f, idx, onChange, onRemove}){
  return (
    <div style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"10px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase"}}>Fastener {idx+1}</span>
        <button onClick={()=>onRemove(idx)} style={{background:"none",border:"none",color:"#884040",cursor:"pointer",fontSize:12}}>✕</button>
      </div>
      <div style={col}>
        <FL t="Location" />
        <select style={sel} value={f.location||""} onChange={ev=>onChange(idx,{...f,location:ev.target.value,locOther:""})}>
          <option value="">— not set —</option>
          {FASTENER_LOCS.map(l=><option key={l}>{l}</option>)}
        </select>
      </div>
      {f.location==="Other"&&<div style={col}><FL t="Location (describe)" /><input style={inp} placeholder="e.g. Timing cover" value={f.locOther||""} onChange={ev=>onChange(idx,{...f,locOther:ev.target.value})} /></div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <div style={col}><FL t="Count" /><input style={inp} placeholder="e.g. 4" value={f.count||""} onChange={ev=>onChange(idx,{...f,count:ev.target.value})} /></div>
        <div style={col}>
          <FL t="Fastener type" />
          <select style={sel} value={f.fType||""} onChange={ev=>onChange(idx,{...f,fType:ev.target.value,driveType:""})}>
            <option value="">— not set —</option>
            {FASTENER_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        {f.fType==="Bolt"&&<div style={col}><FL t="Drive type" /><select style={sel} value={f.driveType||""} onChange={ev=>onChange(idx,{...f,driveType:ev.target.value})}><option value="">— not set —</option>{DRIVE_TYPES.map(d=><option key={d}>{d}</option>)}</select></div>}
        <div style={col}><FL t="Diameter" /><select style={sel} value={f.diameter||""} onChange={ev=>onChange(idx,{...f,diameter:ev.target.value})}><option value="">— not set —</option>{BOLT_DIAMETERS.map(d=><option key={d}>{d}</option>)}</select></div>
        <div style={col}><FL t="Length (mm)" /><input style={inp} type="number" placeholder="e.g. 25" step="0.5" min="0" value={f.length||""} onChange={ev=>onChange(idx,{...f,length:ev.target.value})} /></div>
      </div>
    </div>
  );
}

export function StudCard({s,onEdit,onRemove}){
  const loc=s.location==="Other"?(s.locOther||"Other"):(s.location||"—");
  const parts=[s.fType,s.fType==="Bolt"&&s.driveType?s.driveType:null,s.diameter?s.diameter+" dia":null,s.length?s.length+"mm length":null,s.spacing?s.spacing+"mm ctr spacing":null,s.countPerSide?s.countPerSide+"/side":null].filter(Boolean);
  const torque=[s.torqueNm?s.torqueNm+"Nm":null,s.torqueFtlb?s.torqueFtlb+"ft-lb":null].filter(Boolean);
  return (
    <div style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"10px 12px",marginBottom:6}}>
      <div style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{loc}</div>
      <div style={{fontSize:11,color:TXT,fontFamily:"'IBM Plex Mono',monospace",marginBottom:torque.length?4:8,lineHeight:1.5}}>{parts.length?parts.join(" · "):"No specs yet"}</div>
      {torque.length>0&&<div style={{fontSize:11,color:"#d4a017",fontFamily:"'IBM Plex Mono',monospace",marginBottom:8}}>⚡ {torque.join(" / ")}</div>}
      <div style={{display:"flex",gap:6}}>
        <button onClick={onEdit} style={{...btnG,...sm}}>Edit</button>
        <button onClick={onRemove} style={btnD}>Delete</button>
      </div>
    </div>
  );
}

export function StudForm({s,onSave,onCancel}){
  const [location,setLocation]=useState(s.location||"");
  const [locOther,setLocOther]=useState(s.locOther||"");
  const [fType,setFType]=useState(s.fType||"");
  const [driveType,setDriveType]=useState(s.driveType||"");
  const [diameter,setDiameter]=useState(s.diameter||"");
  const [length,setLength]=useState(s.length||"");
  const [spacing,setSpacing]=useState(s.spacing||"");
  const [countPerSide,setCountPerSide]=useState(s.countPerSide||"");
  const [torqueNm,setTorqueNm]=useState(s.torqueNm||"");
  const [torqueFtlb,setTorqueFtlb]=useState(s.torqueFtlb||"");
  const NM_TO_FTLB=0.737562, FTLB_TO_NM=1.35582;
  const handleNm=v=>{setTorqueNm(v);if(v&&!isNaN(v))setTorqueFtlb((parseFloat(v)*NM_TO_FTLB).toFixed(2));else setTorqueFtlb("");};
  const handleFtlb=v=>{setTorqueFtlb(v);if(v&&!isNaN(v))setTorqueNm((parseFloat(v)*FTLB_TO_NM).toFixed(2));else setTorqueNm("");};
  const save=()=>onSave({...s,location,locOther,fType,driveType,diameter,length:length.toString(),spacing:spacing.toString(),countPerSide:countPerSide.toString(),torqueNm:torqueNm.toString(),torqueFtlb:torqueFtlb.toString()});
  return (
    <div style={{background:"#0d0d0d",border:"1px solid "+ACC,borderRadius:2,padding:"12px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase"}}>{s.id?"Edit Entry":"New Entry"}</span>
        <button onClick={onCancel} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:12}}>✕</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <div style={{...col,gridColumn:"1/-1"}}>
          <FL t="Location" />
          <select style={sel} value={location} onChange={ev=>setLocation(ev.target.value)}>
            <option value="">— not set —</option>
            {STUD_LOCS.map(l=><option key={l}>{l}</option>)}
          </select>
        </div>
        {location==="Other"&&<div style={{...col,gridColumn:"1/-1"}}><FL t="Describe location" /><input style={inp} placeholder="e.g. Timing cover" value={locOther} onChange={ev=>setLocOther(ev.target.value)} /></div>}
        <div style={col}>
          <FL t="Fastener type" />
          <select style={sel} value={fType} onChange={ev=>{setFType(ev.target.value);setDriveType("");}}>
            <option value="">— not set —</option>
            {FASTENER_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        {fType==="Bolt"&&<div style={col}><FL t="Drive type" /><select style={sel} value={driveType} onChange={ev=>setDriveType(ev.target.value)}><option value="">— not set —</option>{DRIVE_TYPES.map(d=><option key={d}>{d}</option>)}</select></div>}
        <div style={col}><FL t="Diameter" /><select style={sel} value={diameter} onChange={ev=>setDiameter(ev.target.value)}><option value="">— not set —</option>{BOLT_DIAMETERS.map(d=><option key={d}>{d}</option>)}</select></div>
        <div style={col}><FL t="Length (mm)" /><input style={inp} type="number" placeholder="e.g. 35" step="0.5" min="0" value={length} onChange={ev=>setLength(ev.target.value)} /></div>
        <div style={col}><FL t="Center spacing (mm)" /><input style={inp} type="number" placeholder="e.g. 31" step="0.5" min="0" value={spacing} onChange={ev=>setSpacing(ev.target.value)} /></div>
        <div style={col}><FL t="Count per side" /><input style={inp} placeholder="e.g. 2" value={countPerSide} onChange={ev=>setCountPerSide(ev.target.value)} /></div>
      </div>
      <div style={{height:1,background:"#1e1e1e",margin:"10px 0"}}/>
      <div style={{fontSize:9,color:"#d4a017",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Torque Spec</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <div style={col}><FL t="Torque (Nm)" /><input style={inp} type="number" placeholder="e.g. 12" step="0.1" min="0" value={torqueNm} onChange={ev=>handleNm(ev.target.value)} /></div>
        <div style={col}><FL t="Torque (ft-lb)" /><input style={inp} type="number" placeholder="e.g. 8.85" step="0.01" min="0" value={torqueFtlb} onChange={ev=>handleFtlb(ev.target.value)} /></div>
      </div>
      <div style={{fontSize:9,color:MUT,marginTop:-4,marginBottom:8,lineHeight:1.5}}>Enter either unit — the other auto-converts.</div>
      <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
        <button style={{...btnG,...sm}} onClick={onCancel}>Cancel</button>
        <button style={{...btnA,...sm}} onClick={save}>Save</button>
      </div>
    </div>
  );
}

export function SummaryCard({lines,onEdit}){
  const filtered=lines.filter(l=>l&&l.trim());
  return (
    <div style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"10px 12px",marginBottom:4}}>
      {filtered.map((l,i)=><div key={i} style={{fontSize:11,color:TXT,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.7,marginBottom:i<filtered.length-1?2:8}}>{l}</div>)}
      <button onClick={onEdit} style={{...btnG,...sm}}>Edit</button>
    </div>
  );
}

export function NotLogged({onAdd}){
  return (
    <div style={{padding:"10px 0 14px 0"}}>
      <div style={{fontSize:10,color:MUT,marginBottom:8,fontStyle:"italic"}}>Not logged yet</div>
      <button onClick={onAdd} style={{...btnG,...sm}}>+ Add</button>
    </div>
  );
}

export function SectionPicker({selected, onSave, onClose}){
  const [secs,setSecs]=useState(selected!==null&&selected!==undefined?selected:[...ALL_SECTIONS]);
  const toggle=s=>setSecs(prev=>prev.includes(s)?prev.filter(x=>x!==s):[...prev,s]);
  return (
    <div style={ovly} onClick={onClose}>
      <div style={{...mdl,maxHeight:"80vh"}} onClick={ev=>ev.stopPropagation()}>
        <div style={mdlH}>
          <b style={{fontSize:13,textTransform:"uppercase",letterSpacing:"0.1em"}}>Custom Sections</b>
          <button style={{...btnG,...sm}} onClick={onClose}>✕</button>
        </div>
        <div style={{...mdlB,paddingTop:8}}>
          <div style={{fontSize:9,color:MUT,marginBottom:14,lineHeight:1.6}}>Choose which sections apply to this machine.</div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <button style={{...btnG,...sm}} onClick={()=>setSecs([...ALL_SECTIONS])}>All</button>
            <button style={{...btnG,...sm}} onClick={()=>setSecs([])}>None</button>
          </div>
          {ALL_SECTIONS.map(s=>(
            <label key={s} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #1a1a1a",cursor:"pointer"}}>
              <input type="checkbox" checked={secs.includes(s)} onChange={()=>toggle(s)} style={{accentColor:ACC,width:15,height:15}} />
              <span style={{fontSize:11,color:secs.includes(s)?TXT:MUT,fontFamily:"'IBM Plex Mono',monospace"}}>{s}</span>
            </label>
          ))}
        </div>
        <div style={mdlF}>
          <button style={btnG} onClick={onClose}>Cancel</button>
          <button style={btnA} onClick={()=>onSave(secs)}>Save</button>
        </div>
      </div>
    </div>
  );
}

export function HydRamCard({r,onEdit,onRemove}){
  const loc=r.location==="Other"?(r.locationOther||"Other"):(r.location||"—");
  const parts=[r.bore?r.bore+"mm bore":null,r.rod?r.rod+"mm rod":null,r.stroke?r.stroke+"mm stroke":null,r.collapsed?r.collapsed+"mm collapsed":null,r.sealKit?"Seal: "+r.sealKit:null].filter(Boolean);
  const calcs=(()=>{
    if(!r.bore||!r.systemPressure) return null;
    const b=parseFloat(r.bore), rod=parseFloat(r.rod)||0, s=parseFloat(r.stroke)||0, p=parseFloat(r.systemPressure);
    const A_ext=Math.PI/4*Math.pow(b/1000,2);
    const F_ext=(p*1e5*A_ext/1000/9.81).toFixed(2);
    const F_ret=rod?(p*1e5*(Math.PI/4*(Math.pow(b/1000,2)-Math.pow(rod/1000,2)))/1000/9.81).toFixed(2):null;
    const vol=s?(Math.PI/4*Math.pow(b/1000,2)*(s/1000)*1000).toFixed(2):null;
    return {F_ext,F_ret,vol};
  })();
  return (
    <div style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"10px 12px",marginBottom:6}}>
      <div style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{loc}</div>
      <div style={{fontSize:11,color:TXT,fontFamily:"'IBM Plex Mono',monospace",marginBottom:calcs?4:8,lineHeight:1.5}}>{parts.length?parts.join(" · "):"No specs yet"}</div>
      {calcs&&<div style={{display:"flex",gap:12,flexWrap:"wrap",padding:"6px 8px",background:"#060606",borderRadius:2,marginBottom:8}}>
        <div><div style={{fontSize:8,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:1}}>Extend</div><div style={{fontSize:11,color:ACC,fontFamily:"'IBM Plex Mono',monospace"}}>⚡ {calcs.F_ext}t</div></div>
        {calcs.F_ret&&<div><div style={{fontSize:8,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:1}}>Retract</div><div style={{fontSize:11,color:ACC,fontFamily:"'IBM Plex Mono',monospace"}}>⚡ {calcs.F_ret}t</div></div>}
        {calcs.vol&&<div><div style={{fontSize:8,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:1}}>Oil / cycle</div><div style={{fontSize:11,color:ACC,fontFamily:"'IBM Plex Mono',monospace"}}>⚡ {calcs.vol}L</div></div>}
      </div>}
      {r.notes&&<div style={{fontSize:10,color:MUT,marginBottom:6,lineHeight:1.4}}>{r.notes}</div>}
      <div style={{display:"flex",gap:6}}><button onClick={onEdit} style={{...btnG,...sm}}>Edit</button><button onClick={onRemove} style={btnD}>Delete</button></div>
    </div>
  );
}

export function HydRamForm({r,onSave,onCancel}){
  const [location,setLocation]=useState(r.location||"");
  const [locationOther,setLocationOther]=useState(r.locationOther||"");
  const [bore,setBore]=useState(r.bore||"");
  const [rod,setRod]=useState(r.rod||"");
  const [stroke,setStroke]=useState(r.stroke||"");
  const [systemPressure,setSystemPressure]=useState(r.systemPressure||"");
  const [collapsed,setCollapsed]=useState(r.collapsed||"");
  const [extended,setExtended]=useState(r.extended||"");
  const [sealKit,setSealKit]=useState(r.sealKit||"");
  const [notes,setNotes]=useState(r.notes||"");

  const calcs=(()=>{
    if(!bore||!systemPressure) return null;
    const b=parseFloat(bore), rod_=parseFloat(rod)||0, s=parseFloat(stroke)||0, p=parseFloat(systemPressure);
    const F_ext=(p*1e5*(Math.PI/4*Math.pow(b/1000,2))/1000/9.81).toFixed(2);
    const F_ret=rod_?(p*1e5*(Math.PI/4*(Math.pow(b/1000,2)-Math.pow(rod_/1000,2)))/1000/9.81).toFixed(2):null;
    const vol=s?(Math.PI/4*Math.pow(b/1000,2)*(s/1000)*1000).toFixed(2):null;
    return {F_ext,F_ret,vol};
  })();

  const save=()=>onSave({...r,location,locationOther,bore:bore.toString(),rod:rod.toString(),stroke:stroke.toString(),systemPressure:systemPressure.toString(),collapsed:collapsed.toString(),extended:extended.toString(),sealKit,notes});
  return (
    <div style={{background:"#0d0d0d",border:"1px solid "+ACC,borderRadius:2,padding:"12px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase"}}>{r.id?"Edit Ram":"New Ram"}</span>
        <button onClick={onCancel} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:12}}>✕</button>
      </div>
      <div style={{...col,gridColumn:"1/-1"}}><FL t="Location" /><select style={sel} value={location} onChange={ev=>setLocation(ev.target.value)}><option value="">— not set —</option>{RAM_LOCATIONS.map(l=><option key={l}>{l}</option>)}</select></div>
      {location==="Other"&&<div style={col}><FL t="Describe location" /><input style={inp} placeholder="e.g. Tilt cylinder" value={locationOther} onChange={ev=>setLocationOther(ev.target.value)} /></div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
        <div style={col}><FL t="Bore (mm)" /><input style={inp} type="number" placeholder="e.g. 80" step="0.5" min="0" value={bore} onChange={ev=>setBore(ev.target.value)} /></div>
        <div style={col}><FL t="Rod diameter (mm)" /><input style={inp} type="number" placeholder="e.g. 55" step="0.5" min="0" value={rod} onChange={ev=>setRod(ev.target.value)} /></div>
        <div style={col}><FL t="Stroke (mm)" /><input style={inp} type="number" placeholder="e.g. 1200" step="1" min="0" value={stroke} onChange={ev=>setStroke(ev.target.value)} /></div>
        <div style={col}><FL t="System pressure (bar)" /><input style={inp} type="number" placeholder="e.g. 200" step="5" min="0" value={systemPressure} onChange={ev=>setSystemPressure(ev.target.value)} /></div>
        <div style={col}><FL t="Collapsed length (mm)" /><input style={inp} type="number" placeholder="e.g. 950" step="1" min="0" value={collapsed} onChange={ev=>setCollapsed(ev.target.value)} /></div>
        <div style={col}><FL t="Extended length (mm)" /><input style={inp} type="number" placeholder="e.g. 2150" step="1" min="0" value={extended} onChange={ev=>setExtended(ev.target.value)} /></div>
        <div style={{...col,gridColumn:"1/-1"}}><FL t="Seal kit part no." /><input style={inp} placeholder="e.g. KOM-707-98-09000" value={sealKit} onChange={ev=>setSealKit(ev.target.value)} /></div>
      </div>
      {calcs&&<div style={{display:"flex",gap:12,flexWrap:"wrap",padding:"8px 10px",background:"#060606",border:"1px solid #1a1a1a",borderRadius:2,marginTop:8}}>
        <div><div style={{fontSize:8,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:1}}>Extend force</div><div style={{fontSize:11,color:ACC,fontFamily:"'IBM Plex Mono',monospace"}}>⚡ {calcs.F_ext}t</div></div>
        {calcs.F_ret&&<div><div style={{fontSize:8,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:1}}>Retract force</div><div style={{fontSize:11,color:ACC,fontFamily:"'IBM Plex Mono',monospace"}}>⚡ {calcs.F_ret}t</div></div>}
        {calcs.vol&&<div><div style={{fontSize:8,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:1}}>Oil / full cycle</div><div style={{fontSize:11,color:ACC,fontFamily:"'IBM Plex Mono',monospace"}}>⚡ {calcs.vol}L</div></div>}
      </div>}
      <div style={col}><FL t="Notes" /><textarea style={{...txa,minHeight:40}} placeholder="e.g. Outer seal only, no wiper" value={notes} onChange={ev=>setNotes(ev.target.value)} /></div>
      <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
        <button style={{...btnG,...sm}} onClick={onCancel}>Cancel</button>
        <button style={{...btnA,...sm}} onClick={save}>Save</button>
      </div>
    </div>
  );
}

export function AttachCard({a,onEdit,onRemove}){
  const parts=[a.attachType,a.sizeSpec,a.weight?a.weight+"kg":null].filter(Boolean);
  return (
    <div style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"10px 12px",marginBottom:6}}>
      <div style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{a.attachType||"Attachment"}</div>
      <div style={{fontSize:11,color:TXT,fontFamily:"'IBM Plex Mono',monospace",marginBottom:8,lineHeight:1.5}}>{parts.length>1?parts.slice(1).join(" · "):"No specs yet"}</div>
      {a.notes&&<div style={{fontSize:10,color:MUT,marginBottom:6,lineHeight:1.4}}>{a.notes}</div>}
      <div style={{display:"flex",gap:6}}><button onClick={onEdit} style={{...btnG,...sm}}>Edit</button><button onClick={onRemove} style={btnD}>Delete</button></div>
    </div>
  );
}

export function AttachForm({a,onSave,onCancel}){
  const [attachType,setAttachType]=useState(a.attachType||"");
  const [attachTypeOther,setAttachTypeOther]=useState(a.attachTypeOther||"");
  const [sizeSpec,setSizeSpec]=useState(a.sizeSpec||"");
  const [weight,setWeight]=useState(a.weight||"");
  const [notes,setNotes]=useState(a.notes||"");
  const save=()=>onSave({...a,attachType,attachTypeOther,sizeSpec,weight:weight.toString(),notes});
  return (
    <div style={{background:"#0d0d0d",border:"1px solid "+ACC,borderRadius:2,padding:"12px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase"}}>{a.id?"Edit Attachment":"New Attachment"}</span>
        <button onClick={onCancel} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:12}}>✕</button>
      </div>
      <div style={col}><FL t="Attachment type" /><select style={sel} value={attachType} onChange={ev=>setAttachType(ev.target.value)}><option value="">— not set —</option>{ATTACH_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
      {attachType==="Other"&&<div style={col}><FL t="Describe type" /><input style={inp} placeholder="e.g. Snow pusher" value={attachTypeOther} onChange={ev=>setAttachTypeOther(ev.target.value)} /></div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
        <div style={col}><FL t="Size / spec" /><input style={inp} placeholder='e.g. 600mm GP bucket' value={sizeSpec} onChange={ev=>setSizeSpec(ev.target.value)} /></div>
        <div style={col}><FL t="Weight (kg)" /><input style={inp} type="number" placeholder="e.g. 280" step="1" min="0" value={weight} onChange={ev=>setWeight(ev.target.value)} /></div>
      </div>
      <div style={col}><FL t="Notes" /><textarea style={{...txa,minHeight:40}} placeholder="e.g. Pin size 40mm, 2x bucket pins included" value={notes} onChange={ev=>setNotes(ev.target.value)} /></div>
      <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
        <button style={{...btnG,...sm}} onClick={onCancel}>Cancel</button>
        <button style={{...btnA,...sm}} onClick={save}>Save</button>
      </div>
    </div>
  );
}

export function TileConfig({machine, onSave, onClose}){
  const [fields, setFields] = useState(machine.tileFields&&machine.tileFields.length>0 ? machine.tileFields : [...DEFAULT_TILE]);
  const [colors, setColors] = useState(machine.tileColors||{});
  const toggle = k => setFields(prev => prev.includes(k) ? prev.filter(f=>f!==k) : [...prev,k]);
  const setColor = (k,idx) => setColors(prev=>({...prev,[k]:idx}));
  const getColorIdx = k => colors[k]!==undefined ? colors[k] : 0;
  const save = () => onSave({...machine, tileFields: fields, tileColors: colors});
  const autoFields = ["status","strokeType","rage"];
  const availableFields = ALL_BADGE_FIELDS.filter(f => {
    if(f.auto) return true;
    const val = machine[f.k];
    if(!val) return false;
    if(typeof val === "string") return val.trim().length > 0;
    if(typeof val === "number") return val > 0;
    return true;
  });
  const sections = [...new Set(availableFields.map(f=>f.section))];
  return (
    <div style={ovly} onClick={onClose}>
      <div style={{...mdl,maxHeight:"80vh"}} onClick={ev=>ev.stopPropagation()}>
        <div style={mdlH}>
          <b style={{fontSize:13,textTransform:"uppercase",letterSpacing:"0.1em"}}>Tile Badges</b>
          <button style={{...btnG,...sm}} onClick={onClose}>✕</button>
        </div>
        <div style={{...mdlB,paddingTop:8}}>
          <div style={{fontSize:9,color:MUT,marginBottom:8,lineHeight:1.6}}>
            Showing {availableFields.length} fields with data logged. Pick what shows as badges on the card.
          </div>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            <button style={{...btnG,...sm}} onClick={()=>setFields(availableFields.map(f=>f.k))}>All</button>
            <button style={{...btnG,...sm}} onClick={()=>setFields(["status","strokeType"])}>Reset</button>
          </div>
          {sections.map(section=>(
            <div key={section} style={{marginBottom:10}}>
              <div style={{fontSize:8,color:ACC,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:6,paddingBottom:4,borderBottom:"1px solid #1a1a1a"}}>{section}</div>
              {availableFields.filter(f=>f.section===section).map(f=>{
                const active = fields.includes(f.k);
                const isAuto = autoFields.includes(f.k);
                const cidx = getColorIdx(f.k);
                const val = machine[f.k];
                return (
                  <div key={f.k} style={{padding:"6px 0",borderBottom:"1px solid #111"}}>
                    <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                      <input type="checkbox" checked={active} onChange={()=>toggle(f.k)} style={{accentColor:ACC,width:14,height:14,flexShrink:0}} />
                      <span style={{fontSize:10,color:active?TXT:MUT,fontFamily:"'IBM Plex Mono',monospace",flex:1}}>{f.l}</span>
                      {val&&!isAuto&&<span style={{fontSize:8,color:"#444"}}>{String(val).slice(0,16)}</span>}
                    </label>
                    {active&&!isAuto&&(
                      <div style={{display:"flex",gap:4,marginTop:6,marginLeft:24}}>
                        {BADGE_PALETTE.map(([bg,brd,txt],i)=>(
                          <button key={i} onClick={()=>setColor(f.k,i)}
                            style={{width:16,height:16,borderRadius:2,background:bg,border:cidx===i?"2px solid "+txt:"1px solid "+brd,cursor:"pointer",padding:0,flexShrink:0}}
                            title={["Orange","Blue","Green","Red","Purple","Yellow","Teal","Grey"][i]}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {availableFields.length===0&&<div style={{fontSize:10,color:MUT,textAlign:"center",padding:"20px 0"}}>No specs logged yet — add data to this machine first.</div>}
        </div>
        <div style={mdlF}>
          <button style={btnG} onClick={onClose}>Cancel</button>
          <button style={btnA} onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}

export function ExpandConfig({machine, onSave, onClose}){
  const ALL_EXPAND_SECTIONS = [
    {k:"photos",        l:"Photos",              hasData: m => m.photos?.length>0},
    {k:"desc",          l:"Description",         hasData: m => !!m.desc},
    {k:"strokeType",    l:"Engine Specs",        hasData: m => !!(m.strokeType||m.ccSize||m.compression||m.plugType||m.cylCount||m.motorPower)},
    {k:"fasteners",     l:"Fastener Specs",      hasData: m => m.fasteners?.length>0},
    {k:"iPW",           l:"Port Dimensions",     hasData: m => !!(m.iPW||m.ePW), onlyFor: s => s==="2-stroke"},
    {k:"boreDiameter",  l:"Cylinder Bore",       hasData: m => !!m.boreDiameter},
    {k:"ptoDiameter",   l:"PTO / Output Shaft",  hasData: m => !!m.ptoDiameter},
    {k:"fuelSystem",    l:"Fuel System",         hasData: m => !!(m.fuelSystem||m.cBrand||m.ecuModel||m.fuelTankCapacity)},
    {k:"coolingType",   l:"Cooling System",      hasData: m => !!m.coolingType},
    {k:"turboFitted",   l:"Turbo / Supercharger",hasData: m => !!m.turboFitted},
    {k:"chargingType",  l:"Charging System",     hasData: m => !!m.chargingType},
    {k:"driveType",     l:"Drivetrain",          hasData: m => !!(m.driveType||m.transType||m.chainPitch)},
    {k:"forkType",      l:"Suspension",          hasData: m => !!(m.forkType||m.rearShockType)},
    {k:"frontBrake",    l:"Brakes",              hasData: m => !!(m.frontBrake||m.rearBrake)},
    {k:"tyreFront",     l:"Tyres",               hasData: m => !!(m.tyreFront||m.tyreRear)},
    {k:"battVoltage",   l:"Electrics",           hasData: m => !!(m.battVoltage||m.batteryCCA||m.starterMotorType)},
    {k:"pumpBrand",     l:"Pump Details",        hasData: m => !!(m.pumpBrand||m.pumpPsi), onlyFor: (s,t) => t==="Pressure Washer"},
    {k:"genWatts",      l:"Generator Output",    hasData: m => !!m.genWatts, onlyFor: (s,t) => t==="Generator"},
    {k:"deckSize",      l:"Blade / Deck",        hasData: m => !!m.deckSize},
    {k:"engineOilGrade",l:"Fluids",              hasData: m => !!(m.engineOilGrade||m.brakeFluidType||m.diffOilType)},
    {k:"dryWeight",     l:"Dimensions & Weight", hasData: m => !!(m.dryWeight||m.overallLength||m.wheelbase)},
    {k:"beltType",      l:"Belt Specs",          hasData: m => !!m.beltType},
    {k:"oilChangeInterval",l:"Service Intervals",hasData: m => !!(m.oilChangeInterval||m.majorServiceInterval)},
    {k:"pistonDiameter",l:"Piston & Bore",       hasData: m => !!m.pistonDiameter},
    {k:"conrodLength",  l:"Connecting Rod",      hasData: m => !!m.conrodLength},
    {k:"crankStroke",   l:"Crankshaft",          hasData: m => !!(m.crankStroke||m.crankPinDiameter)},
    {k:"mainBearingType",l:"Main Bearings",      hasData: m => !!m.mainBearingType},
    {k:"cylMaxWear",    l:"Cylinder Wear Limits",hasData: m => !!m.cylMaxWear},
    {k:"trackedBrand",  l:"Tracked Machine",     hasData: m => !!(m.trackedBrand||m.trackType||m.hydRams?.length>0)},
    {k:"notes",         l:"Notes",               hasData: m => !!m.notes},
    {k:"serviceHistory",l:"Service History",     hasData: () => true},
  ];
  const available = ALL_EXPAND_SECTIONS.filter(s => {
    if(s.onlyFor && !s.onlyFor(machine.strokeType, machine.type)) return false;
    return s.hasData(machine);
  });
  const current = machine.expandFields&&machine.expandFields.length>0
    ? machine.expandFields
    : available.map(f=>f.k);
  const [fields, setFields] = useState(current);
  const toggle = k => setFields(prev => prev.includes(k) ? prev.filter(f=>f!==k) : [...prev,k]);
  const save = () => onSave({...machine, expandFields: fields});
  return (
    <div style={ovly} onClick={onClose}>
      <div style={{...mdl,maxHeight:"80vh"}} onClick={ev=>ev.stopPropagation()}>
        <div style={mdlH}>
          <b style={{fontSize:13,textTransform:"uppercase",letterSpacing:"0.1em"}}>Expanded View</b>
          <button style={{...btnG,...sm}} onClick={onClose}>✕</button>
        </div>
        <div style={{...mdlB,paddingTop:8}}>
          <div style={{fontSize:9,color:MUT,marginBottom:8,lineHeight:1.6}}>
            Showing {available.length} sections with data. Choose what appears when expanded.
          </div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <button style={{...btnG,...sm}} onClick={()=>setFields(available.map(f=>f.k))}>All</button>
            <button style={{...btnG,...sm}} onClick={()=>setFields(["serviceHistory"])}>Min</button>
          </div>
          {available.map(f=>(
            <label key={f.k} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #1a1a1a",cursor:"pointer"}}>
              <input type="checkbox" checked={fields.includes(f.k)} onChange={()=>toggle(f.k)} style={{accentColor:ACC,width:15,height:15}} />
              <span style={{fontSize:11,color:fields.includes(f.k)?TXT:MUT,fontFamily:"'IBM Plex Mono',monospace"}}>{f.l}</span>
            </label>
          ))}
          {available.length===0&&<div style={{fontSize:10,color:MUT,textAlign:"center",padding:"20px 0"}}>No data logged yet.</div>}
        </div>
        <div style={mdlF}>
          <button style={btnG} onClick={onClose}>Cancel</button>
          <button style={btnA} onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}

export function LightingCard({l, onEdit, onRemove}){
  const parts = [l.lightType, l.wattage ? l.wattage+"W" : null, l.voltage, l.amperage ? l.amperage+"A draw" : null, l.plug].filter(Boolean);
  return (
    <div style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"10px 12px",marginBottom:6}}>
      <div style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{l.location==="Other"?(l.locationOther||"Other"):l.location||"—"}</div>
      <div style={{fontSize:11,color:TXT,fontFamily:"'IBM Plex Mono',monospace",marginBottom:8,lineHeight:1.5}}>{parts.length?parts.join(" · "):"No specs yet"}</div>
      {l.notes&&<div style={{fontSize:10,color:MUT,marginBottom:6,lineHeight:1.4}}>{l.notes}</div>}
      <div style={{display:"flex",gap:6}}>
        <button onClick={onEdit} style={{...btnG,...sm}}>Edit</button>
        <button onClick={onRemove} style={btnD}>Delete</button>
      </div>
    </div>
  );
}

export function LightingForm({l, onSave, onCancel}){
  const [location, setLocation] = useState(l.location||"");
  const [locationOther, setLocationOther] = useState(l.locationOther||"");
  const [lightType, setLightType] = useState(l.lightType||"");
  const [wattage, setWattage] = useState(l.wattage||"");
  const [voltage, setVoltage] = useState(l.voltage||"12V");
  const [plug, setPlug] = useState(l.plug||"");
  const [notes, setNotes] = useState(l.notes||"");

  const amperage = wattage && voltage
    ? (parseFloat(wattage) / parseFloat(voltage)).toFixed(2)
    : "";

  const save = () => onSave({...l, location, locationOther, lightType, wattage:wattage.toString(), voltage, amperage:amperage.toString(), plug, notes});

  return (
    <div style={{background:"#0d0d0d",border:"1px solid "+ACC,borderRadius:2,padding:"12px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase"}}>{l.id?"Edit Light":"New Light"}</span>
        <button onClick={onCancel} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:12}}>✕</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <div style={{...col,gridColumn:"1/-1"}}>
          <FL t="Location" />
          <select style={sel} value={location} onChange={ev=>setLocation(ev.target.value)}>
            <option value="">— not set —</option>
            {LIGHT_LOCATIONS.map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        {location==="Other"&&<div style={{...col,gridColumn:"1/-1"}}><FL t="Describe location" /><input style={inp} placeholder="e.g. Roof rack" value={locationOther} onChange={ev=>setLocationOther(ev.target.value)} /></div>}
        <div style={col}>
          <FL t="Bulb / Unit type" />
          <select style={sel} value={lightType} onChange={ev=>setLightType(ev.target.value)}>
            <option value="">— not set —</option>
            {LIGHT_TYPES.map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div style={col}>
          <FL t="Voltage" />
          <select style={sel} value={voltage} onChange={ev=>setVoltage(ev.target.value)}>
            {LIGHT_VOLTAGES.map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div style={col}>
          <FL t="Wattage (W)" />
          <input style={inp} type="number" placeholder="e.g. 55" min="0" step="0.5" value={wattage} onChange={ev=>setWattage(ev.target.value)} />
        </div>
        <div style={col}>
          <FL t="Amperage draw (auto)" />
          <input style={{...inp,opacity:0.5}} value={amperage?amperage+"A":""} disabled />
        </div>
        <div style={{...col,gridColumn:"1/-1"}}>
          <FL t="Plug / Connector" />
          <select style={sel} value={plug} onChange={ev=>setPlug(ev.target.value)}>
            <option value="">— not set —</option>
            {LIGHT_PLUGS.map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div style={{...col,gridColumn:"1/-1"}}>
          <FL t="Notes" />
          <textarea style={{...txa,minHeight:40}} placeholder="e.g. Aftermarket LED bar, 120W total" value={notes} onChange={ev=>setNotes(ev.target.value)} />
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
        <button style={{...btnG,...sm}} onClick={onCancel}>Cancel</button>
        <button style={{...btnA,...sm}} onClick={save}>Save</button>
      </div>
    </div>
  );
}
