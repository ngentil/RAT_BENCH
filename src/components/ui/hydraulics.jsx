import React, { useState } from 'react';
import { ACC, MUT, TXT, inp, sel, txa, btnA, btnG, btnD, sm, col } from '../../lib/styles';
import { RAM_LOCATIONS } from '../../lib/constants';
import { FL } from './primitives';

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
