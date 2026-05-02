import React, { useState } from 'react';
import { ACC, MUT, TXT, inp, sel, btnA, btnG, btnD, sm, col } from '../../lib/styles';
import { FASTENER_LOCS, FASTENER_TYPES, DRIVE_TYPES, BOLT_DIAMETERS, STUD_LOCS } from '../../lib/constants';
import { FL } from './primitives';

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
