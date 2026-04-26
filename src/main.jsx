import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { supabase } from './lib/supabase';
import { MACHINE_TYPES, TYPE_PH, getPH, HANDHELD, WHEELED, MOTO, VEHICLE, TRACKED, isCustom, isVehicle, isTracked, showForCustom, ALL_SECTIONS, ALL_TYPES, showPTO, showPump, showGenOutput, showDrivetrain, showSuspension, showBrakes, showTyres, showElectrics, showBlade, BODY_TYPES_VEHICLE, BODY_TYPES_MOTO, DRIVE_CONFIGS, VEHICLE_MAKES, COMMON_COLOURS, CHAINSAW_CHAIN_PITCHES, CHAINSAW_GAUGES, SPROCKET_STYLES, BAR_MOUNT_TYPES, TRACKED_BRANDS, TRACKED_SUBTYPES, OPERATING_WEIGHTS, TRACK_TYPES, HYD_PUMP_COUNTS, HYD_PUMP_TYPES, RAM_LOCATIONS, COOLING_TYPES, TURBO_TYPES, CHARGING_TYPES, CHARGE_VOLTAGES, RECT_REG, BELT_TYPES, ATTACH_TYPES, SOURCES, STATUSES, SCOL, SBG_, SVC_CATEGORIES, CARB_BRANDS, CARB_TYPES, CARB_BOLTS, EXH_BOLTS, RECOIL_BOLTS, RECOIL_COUNTS, VALVE_COUNTS, PULSE_LOC, PULSE_POS, PORT_CONDITION, SHAFT_TYPES, THREAD_DIR, THREAD_SIZES, PTO_DIAMETERS, SPROCKET_TYPES, CYLINDER_COUNTS, VALVE_TRAIN, CAM_TYPES, LOCKNUT_SIZES, SENSOR_STATUS, INJECTOR_COUNTS, STARTER_TYPES, DRIVE_TYPES, FASTENER_TYPES, FASTENER_LOCS, BOLT_DIAMETERS, CHAIN_PITCHES, TRANS_TYPES, CLUTCH_TYPES, CVT_BELT_TYPES, FORK_TYPES, SHOCK_TYPES, BRAKE_TYPES, BLADE_TYPES, PUMP_TYPES, INLET_SIZES, OUTLET_SIZES, VOLTAGE_OPTIONS, FRAME_TYPES, COIL_TYPES, ENG_BOLTS, ENG_COUNTS, STUD_N, RAGE_LBL, STUD_LOCS, TILE_FIELDS, DEFAULT_TILE, ALL_BADGE_FIELDS, BADGE_PALETTE, TILE_COLOR_DEFAULTS, EXPAND_SECTIONS, DEFAULT_EXPAND, getExpandFields, getTileFields, TABS } from './lib/constants';
import { BG, SURF, BRD, BRD2, TXT, MUT, ACC, GRN, RED, inp, sel, txa, btnA, btnG, btnD, sm, col, row, dvdr, empt, ovly, mdl, mdlH, mdlB, mdlF } from './lib/styles';
import { jsPDF } from 'jspdf';
import './index.css';
import AuthScreen from './components/auth/AuthScreen';
import OnboardingScreen from './components/auth/OnboardingScreen';
import PasswordResetScreen from './components/auth/PasswordResetScreen';
import ProfileSettings from './components/settings/ProfileSettings';
import CompanySettings from './components/settings/CompanySettings';
import SettingsPage from './components/settings/SettingsPage';
import WikiLoginBar from './components/wiki/WikiLoginBar';
import WikiHomePage from './components/wiki/WikiHomePage';
import WikiEntryPage from './components/wiki/WikiEntryPage';
import WikiHistoryPage from './components/wiki/WikiHistoryPage';
import WikiApp from './components/wiki/WikiApp';
import Tracker from './components/tracker/Tracker';
import MachineTile from './components/machine/MachineTile';
import MachineCard from './components/machine/MachineCard';
import MachineForm from './components/machine/MachineForm';
import ServiceModal from './components/ui/ServiceModal';
import PdfExportModal from './components/pdf/PdfExportModal';
import StatusBadge from './components/ui/StatusBadge';
import PhotoAdder from './components/ui/PhotoAdder';
import { uid, nowL, fmtDT, mIcon, resizeImg, toB64 } from './lib/helpers';
import { makeSlug, getWikiEntryBySlug, getWikiRevisions, searchWiki, incrementViewCount, saveWikiRevision, deleteWikiRevision, deleteWikiEntry, publishToWiki } from './lib/wikiApi';
import { toDb, fromDb, svcToDb, svcFromDb, getMachines, getServices, upsertMachine, upsertService, deleteMachineApi, deleteServiceApi, getMyCompany, createCompany, updateCompany, joinCompanyByCode, leaveCompany, getCompanyMembers, removeMember, regenerateInviteCode, updateProfile } from './lib/db';
import App from './App';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{padding:24,color:"#ff6b6b",fontFamily:"monospace",background:"#1a0000",border:"1px solid #ff3333",borderRadius:4,margin:16}}>
        <b>Render error:</b><br/>{this.state.error.message}<br/><pre style={{fontSize:10,marginTop:8,whiteSpace:"pre-wrap"}}>{this.state.error.stack}</pre>
      </div>
    );
    return this.props.children;
  }
}


function SL({t}){ return <div style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,marginBottom:8}}>{t}</div>; }
function FL({t}){ return <div style={{fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:MUT,marginBottom:4}}>{t}</div>; }
function Divider(){ return <div style={dvdr} />; }
function Empty({t}){ return <div style={empt}>{t}</div>; }


function SkullRating({value,onChange}){
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



function SpecCell({label,value,highlight}){
  return (
    <div style={{background:"#0d0d0d",border:"1px solid "+(highlight?"#3a2200":BRD2),borderRadius:2,padding:"6px 9px"}}>
      <div style={{fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase",color:highlight?ACC:MUT,marginBottom:2}}>{label}</div>
      <div style={{fontSize:11,color:highlight?"#e8a060":TXT,fontFamily:"'IBM Plex Mono',monospace"}}>{value}</div>
    </div>
  );
}

// ── Fastener Row ─────────────────────────────────────────────────────────────
function FastenerRow({f, idx, onChange, onRemove}){
  const [locOther,setLocOther]=useState(f.locOther||"");
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

// ── Stud Card & Form ─────────────────────────────────────────────────────────
function StudCard({s,onEdit,onRemove}){
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
function StudForm({s,onSave,onCancel}){
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

  const NM_TO_FTLB = 0.737562;
  const FTLB_TO_NM = 1.35582;

  const handleNm = v => {
    setTorqueNm(v);
    if(v&&!isNaN(v)) setTorqueFtlb((parseFloat(v)*NM_TO_FTLB).toFixed(2));
    else setTorqueFtlb("");
  };
  const handleFtlb = v => {
    setTorqueFtlb(v);
    if(v&&!isNaN(v)) setTorqueNm((parseFloat(v)*FTLB_TO_NM).toFixed(2));
    else setTorqueNm("");
  };

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

// ── Section Summary Card ─────────────────────────────────────────────────────
function SummaryCard({lines,onEdit}){
  const filtered=lines.filter(l=>l&&l.trim());
  return (
    <div style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"10px 12px",marginBottom:4}}>
      {filtered.map((l,i)=><div key={i} style={{fontSize:11,color:TXT,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.7,marginBottom:i<filtered.length-1?2:8}}>{l}</div>)}
      <button onClick={onEdit} style={{...btnG,...sm}}>Edit</button>
    </div>
  );
}
function NotLogged({onAdd}){
  return (
    <div style={{padding:"10px 0 14px 0"}}>
      <div style={{fontSize:10,color:MUT,marginBottom:8,fontStyle:"italic"}}>Not logged yet</div>
      <button onClick={onAdd} style={{...btnG,...sm}}>+ Add</button>
    </div>
  );
}

// ── Section Picker Modal ────────────────────────────────────────────────────
function SectionPicker({selected, onSave, onClose}){
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

// ── Hydraulic Ram Card & Form ─────────────────────────────────────────────────
function HydRamCard({r,onEdit,onRemove}){
  const loc=r.location==="Other"?(r.locationOther||"Other"):(r.location||"—");
  const parts=[r.bore?r.bore+"mm bore":null,r.rod?r.rod+"mm rod":null,r.stroke?r.stroke+"mm stroke":null,r.collapsed?r.collapsed+"mm collapsed":null,r.sealKit?"Seal: "+r.sealKit:null].filter(Boolean);
  return (
    <div style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"10px 12px",marginBottom:6}}>
      <div style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{loc}</div>
      <div style={{fontSize:11,color:TXT,fontFamily:"'IBM Plex Mono',monospace",marginBottom:8,lineHeight:1.5}}>{parts.length?parts.join(" · "):"No specs yet"}</div>
      {r.notes&&<div style={{fontSize:10,color:MUT,marginBottom:6,lineHeight:1.4}}>{r.notes}</div>}
      <div style={{display:"flex",gap:6}}><button onClick={onEdit} style={{...btnG,...sm}}>Edit</button><button onClick={onRemove} style={btnD}>Delete</button></div>
    </div>
  );
}
function HydRamForm({r,onSave,onCancel}){
  const [location,setLocation]=useState(r.location||"");
  const [locationOther,setLocationOther]=useState(r.locationOther||"");
  const [bore,setBore]=useState(r.bore||"");
  const [rod,setRod]=useState(r.rod||"");
  const [stroke,setStroke]=useState(r.stroke||"");
  const [collapsed,setCollapsed]=useState(r.collapsed||"");
  const [extended,setExtended]=useState(r.extended||"");
  const [sealKit,setSealKit]=useState(r.sealKit||"");
  const [notes,setNotes]=useState(r.notes||"");
  const save=()=>onSave({...r,location,locationOther,bore:bore.toString(),rod:rod.toString(),stroke:stroke.toString(),collapsed:collapsed.toString(),extended:extended.toString(),sealKit,notes});
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
        <div style={col}><FL t="Collapsed length (mm)" /><input style={inp} type="number" placeholder="e.g. 950" step="1" min="0" value={collapsed} onChange={ev=>setCollapsed(ev.target.value)} /></div>
        <div style={col}><FL t="Extended length (mm)" /><input style={inp} type="number" placeholder="e.g. 2150" step="1" min="0" value={extended} onChange={ev=>setExtended(ev.target.value)} /></div>
        <div style={col}><FL t="Seal kit part no." /><input style={inp} placeholder="e.g. KOM-707-98-09000" value={sealKit} onChange={ev=>setSealKit(ev.target.value)} /></div>
      </div>
      <div style={col}><FL t="Notes" /><textarea style={{...txa,minHeight:40}} placeholder="e.g. Outer seal only, no wiper" value={notes} onChange={ev=>setNotes(ev.target.value)} /></div>
      <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
        <button style={{...btnG,...sm}} onClick={onCancel}>Cancel</button>
        <button style={{...btnA,...sm}} onClick={save}>Save</button>
      </div>
    </div>
  );
}

// ── Attachment Card & Form ────────────────────────────────────────────────────
function AttachCard({a,onEdit,onRemove}){
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
function AttachForm({a,onSave,onCancel}){
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


// ── Machine Card ──────────────────────────────────────────────────────────────
// ── Tile Config Modal ────────────────────────────────────────────────────────
function TileConfig({machine, onSave, onClose}){
  const [fields, setFields] = useState(machine.tileFields&&machine.tileFields.length>0 ? machine.tileFields : [...DEFAULT_TILE]);
  const [colors, setColors] = useState(machine.tileColors||{});
  const toggle = k => setFields(prev => prev.includes(k) ? prev.filter(f=>f!==k) : [...prev,k]);
  const setColor = (k,idx) => setColors(prev=>({...prev,[k]:idx}));
  const getColorIdx = k => colors[k]!==undefined ? colors[k] : 0;
  const save = () => onSave({...machine, tileFields: fields, tileColors: colors});
  const autoFields = ["status","strokeType","rage"];

  // Only show fields that have data logged on this machine
  const availableFields = ALL_BADGE_FIELDS.filter(f => {
    if(f.auto) return true; // always show status/strokeType/rage
    const val = machine[f.k];
    if(!val) return false;
    if(typeof val === "string") return val.trim().length > 0;
    if(typeof val === "number") return val > 0;
    return true;
  });

  // Group by section
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

// ── Expand Config Modal ──────────────────────────────────────────────────────
function ExpandConfig({machine, onSave, onClose}){
  // Define all possible expand sections with data-presence check
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

  // Filter to sections that have data AND are relevant to this machine
  const available = ALL_EXPAND_SECTIONS.filter(s => {
    if(s.onlyFor && !s.onlyFor(machine.strokeType, machine.type)) return false;
    return s.hasData(machine);
  });

  const current = machine.expandFields&&machine.expandFields.length>0
    ? machine.expandFields
    : available.map(f=>f.k); // default to all sections with data

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

const PDF_SCHEMA=[
  {k:"basic",l:"Basic Info",fields:[
    {k:"status",l:"Status"},{k:"year",l:"Year"},{k:"source",l:"Source"},
    {k:"colour",l:"Colour"},{k:"bodyType",l:"Body Type"},{k:"driveConfig",l:"Drive Config"},{k:"desc",l:"Description"},
  ]},
  {k:"engine",l:"Engine",fields:[
    {k:"strokeType",l:"Engine Type"},{k:"ccSize",l:"CC / Rating"},{k:"compression",l:"Compression"},
    {k:"boreDiameter",l:"Bore Diameter"},{k:"idleRpm",l:"Idle RPM"},{k:"wotRpm",l:"WOT RPM"},
    {k:"cylCount",l:"Cylinders"},{k:"valveTrain",l:"Valve Train"},{k:"coolingType",l:"Cooling Type"},
    {k:"coolantType",l:"Coolant"},{k:"coolantCapacity",l:"Coolant Capacity"},
  ]},
  {k:"ignition",l:"Ignition",fields:[
    {k:"plugType",l:"Spark Plug"},{k:"plugGap",l:"Plug Gap"},{k:"coilType",l:"Coil Type"},
    {k:"primaryOhms",l:"Primary Coil Ω"},{k:"secondaryOhms",l:"Secondary Coil Ω"},
  ]},
  {k:"starter",l:"Starter System",fields:[
    {k:"starterType",l:"Starter Type"},{k:"ropeDiameter",l:"Rope Diameter"},{k:"ropeLength",l:"Rope Length"},
  ]},
  {k:"fuel",l:"Fuel System",fields:[
    {k:"fuelSystem",l:"Fuel System"},{k:"cBrand",l:"Carb Brand"},{k:"cType",l:"Carb Type"},
    {k:"cModel",l:"Carb Model"},{k:"fuelTankCapacity",l:"Tank Capacity"},{k:"mixRatio",l:"Mix Ratio"},
    {k:"ecuModel",l:"ECU"},{k:"tbDiameter",l:"Throttle Body"},{k:"injectorCount",l:"Injectors"},
    {k:"fuelRailPressure",l:"Fuel Rail Pressure"},{k:"fuelPumpPressure",l:"Pump Pressure"},
  ]},
  {k:"valves",l:"Valve Specs",fields:[
    {k:"intakeValveClear",l:"Intake Clearance"},{k:"exhaustValveClear",l:"Exhaust Clearance"},
    {k:"iValveFace",l:"Intake Face"},{k:"eValveFace",l:"Exhaust Face"},
    {k:"iValveStem",l:"Intake Stem"},{k:"eValveStem",l:"Exhaust Stem"},
    {k:"springFreeLen",l:"Spring Free Length"},{k:"springOuterD",l:"Spring OD"},
    {k:"locknutSize",l:"Rocker Locknut"},
  ]},
  {k:"fasteners",l:"Fastener Specs",array:true},
  {k:"ports",l:"Port Dimensions",fields:[
    {k:"iPW",l:"Intake Port W"},{k:"iPH",l:"Intake Port H"},
    {k:"ePW",l:"Exhaust Port W"},{k:"ePH",l:"Exhaust Port H"},
    {k:"iSpacing",l:"Intake Stud Spacing"},{k:"iBoltSz",l:"Intake Stud Size"},
    {k:"eSpacing",l:"Exhaust Stud Spacing"},{k:"eBoltSz",l:"Exhaust Stud Size"},
  ]},
  {k:"drivetrain",l:"Drivetrain",fields:[
    {k:"driveType",l:"Drive Type"},{k:"transType",l:"Transmission"},{k:"gearCount",l:"Gears"},
    {k:"gearboxBrand",l:"Gearbox Brand"},{k:"gearboxOilType",l:"Gearbox Oil"},
    {k:"chainPitch",l:"Chain Pitch"},{k:"frontSprocket",l:"Front Sprocket"},{k:"rearSprocket",l:"Rear Sprocket"},
    {k:"cvtBeltType",l:"CVT Belt"},
  ]},
  {k:"fluids",l:"Fluids",fields:[
    {k:"engineOilGrade",l:"Engine Oil"},{k:"engineOilCapacity",l:"Engine Oil Cap"},
    {k:"brakeFluidType",l:"Brake Fluid"},{k:"diffOilType",l:"Diff Oil"},{k:"diffOilCapacity",l:"Diff Oil Cap"},
    {k:"hydraulicFluidType",l:"Hydraulic Fluid"},
  ]},
  {k:"intervals",l:"Service Intervals",fields:[
    {k:"oilChangeInterval",l:"Oil Change"},{k:"filterInterval",l:"Filter Change"},
    {k:"majorServiceInterval",l:"Major Service"},{k:"lastServiceOdo",l:"Last Service Odo"},
  ]},
  {k:"electrics",l:"Electrics",fields:[
    {k:"battVoltage",l:"Battery Voltage"},{k:"batteryCCA",l:"Battery CCA"},{k:"batteryAh",l:"Battery Ah"},
    {k:"starterMotorType",l:"Starter Motor"},{k:"chargingType",l:"Charging Type"},
    {k:"chargeVoltage",l:"Charge Voltage"},{k:"chargeAmps",l:"Charge Amps"},
  ]},
  {k:"tyres",l:"Tyres",fields:[
    {k:"tyreFront",l:"Front Tyre"},{k:"tyreRear",l:"Rear Tyre"},
    {k:"rimFront",l:"Front Rim"},{k:"rimRear",l:"Rear Rim"},
  ]},
  {k:"notes",l:"Notes",fields:[{k:"notes",l:"Notes"}]},
  {k:"history",l:"Service History",svc:true},
];

function exportMachinePDF(m, svcs, opts){
  const iS=k=>!opts||(typeof opts[k]==='boolean'?opts[k]:!!(opts[k]&&Object.values(opts[k]).some(Boolean)));
  const iF=(s,f)=>!opts||!opts[s]||(typeof opts[s]==='object'?opts[s][f]!==false:true);

  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const W=210, margin=14, col=W-margin*2;
  let y=margin;

  const addLine=(text,size=10,bold=false,color=[30,30,30])=>{
    doc.setFontSize(size);doc.setFont("helvetica",bold?"bold":"normal");doc.setTextColor(...color);
    const lines=doc.splitTextToSize(text,col);
    lines.forEach(l=>{if(y>275){doc.addPage();y=margin;}doc.text(l,margin,y);y+=size*0.45;});
    y+=1;
  };
  const addSection=(title)=>{
    y+=3;doc.setFillColor(232,103,10);doc.rect(margin,y-4,col,6,"F");
    doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(255,255,255);
    doc.text(title.toUpperCase(),margin+2,y);y+=5;
  };
  const addField=(label,value)=>{
    if(!value)return;
    doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(100,100,100);
    doc.text(label.toUpperCase(),margin,y);
    doc.setFont("helvetica","normal");doc.setTextColor(30,30,30);
    const lines=doc.splitTextToSize(String(value),col-40);
    doc.text(lines,margin+40,y);y+=Math.max(5,lines.length*4);
  };
  const sf=(sk,fk,label,val)=>{if(iF(sk,fk))addField(label,val);};

  // Header
  doc.setFillColor(22,22,22);doc.rect(0,0,W,22,"F");
  doc.setFontSize(18);doc.setFont("helvetica","bold");doc.setTextColor(232,103,10);
  doc.text("RAT BENCH",margin,14);
  doc.setFontSize(8);doc.setFont("helvetica","normal");doc.setTextColor(90,90,90);
  doc.text("SMALL ENGINE & EQUIPMENT REPAIR",margin,19);
  y=30;

  addLine(`${m.name}`,16,true,[20,20,20]);
  if(m.make||m.model||m.year) addLine([m.make,m.model,m.year].filter(Boolean).join("  ·  "),9,false,[100,100,100]);
  if(m.type||m.strokeType) addLine([m.type,m.strokeType].filter(Boolean).join("  ·  "),9,false,[150,90,20]);
  y+=4;

  if(iS('basic')){
    addSection("Basic Info");
    sf('basic','status','Status',m.status);
    sf('basic','year','Year',m.year);
    sf('basic','source','Source',m.source);
    sf('basic','colour','Colour',m.colour);
    sf('basic','bodyType','Body Type',m.bodyType);
    sf('basic','driveConfig','Drive Config',m.driveConfig);
    if(iF('basic','desc')&&m.desc) addField("Description",m.desc);
  }

  if(iS('engine')&&(m.strokeType||m.ccSize||m.compression||m.boreDiameter||m.cylCount)){
    addSection("Engine");
    sf('engine','strokeType','Type',m.strokeType);
    sf('engine','ccSize','CC / Rating',m.ccSize?m.ccSize+"cc":null);
    sf('engine','compression','Compression',m.compression?m.compression+" PSI":null);
    sf('engine','boreDiameter','Bore',m.boreDiameter?m.boreDiameter+"mm":null);
    sf('engine','idleRpm','Idle RPM',m.idleRpm?m.idleRpm+" rpm":null);
    sf('engine','wotRpm','WOT RPM',m.wotRpm?m.wotRpm+" rpm":null);
    sf('engine','cylCount','Cylinders',m.cylCount);
    sf('engine','valveTrain','Valve Train',m.valveTrain);
    sf('engine','coolingType','Cooling',m.coolingType);
    sf('engine','coolantType','Coolant',m.coolantType?m.coolantType+(m.coolantCapacity?" / "+m.coolantCapacity+"L":""):null);
  }

  if(iS('ignition')&&(m.plugType||m.plugGap||m.coilType)){
    addSection("Ignition");
    sf('ignition','plugType','Plug Type',m.plugType);
    sf('ignition','plugGap','Plug Gap',m.plugGap?m.plugGap+"mm":null);
    sf('ignition','coilType','Coil Type',m.coilType);
    sf('ignition','primaryOhms','Primary Coil',m.primaryOhms?m.primaryOhms+"Ω":null);
    sf('ignition','secondaryOhms','Secondary Coil',m.secondaryOhms?m.secondaryOhms+"Ω":null);
  }

  if(iS('starter')&&m.starterType){
    addSection("Starter System");
    sf('starter','starterType','Type',m.starterType);
    sf('starter','ropeDiameter','Rope Diameter',m.ropeDiameter?m.ropeDiameter+"mm":null);
    sf('starter','ropeLength','Rope Length',m.ropeLength?m.ropeLength+"mm":null);
  }

  if(iS('fuel')&&(m.fuelSystem||m.cBrand||m.fuelTankCapacity||m.ecuModel)){
    addSection("Fuel System");
    sf('fuel','fuelSystem','Delivery',m.fuelSystem);
    sf('fuel','cBrand','Carb Brand',m.cBrand);
    sf('fuel','cType','Carb Type',m.cType);
    sf('fuel','cModel','Carb Model',m.cModel);
    sf('fuel','fuelTankCapacity','Tank Capacity',m.fuelTankCapacity?m.fuelTankCapacity+"L":null);
    sf('fuel','mixRatio','Mix Ratio',m.mixRatio);
    sf('fuel','ecuModel','ECU',m.ecuModel);
    sf('fuel','tbDiameter','Throttle Body',m.tbDiameter?m.tbDiameter+"mm":null);
    sf('fuel','injectorCount','Injectors',m.injectorCount?m.injectorCount+(m.injectorFlow?" / "+m.injectorFlow+"cc/min":""):null);
    sf('fuel','fuelRailPressure','Rail Pressure',m.fuelRailPressure?m.fuelRailPressure+" bar":null);
    sf('fuel','fuelPumpPressure','Pump Pressure',m.fuelPumpPressure?m.fuelPumpPressure+" bar":null);
  }

  if(iS('valves')&&(m.intakeValveClear||m.iValveFace||m.springFreeLen)){
    addSection("Valve Specs");
    sf('valves','intakeValveClear','Intake Clearance',m.intakeValveClear?m.intakeValveClear+" mm":null);
    sf('valves','exhaustValveClear','Exhaust Clearance',m.exhaustValveClear?m.exhaustValveClear+" mm":null);
    sf('valves','iValveFace','Intake Valve',m.iValveFace?m.iValveFace+"mm face"+(m.iValveStem?" / "+m.iValveStem+"mm stem":""):null);
    sf('valves','eValveFace','Exhaust Valve',m.eValveFace?m.eValveFace+"mm face"+(m.eValveStem?" / "+m.eValveStem+"mm stem":""):null);
    sf('valves','springFreeLen','Valve Spring',m.springFreeLen?m.springFreeLen+"mm free"+(m.springOuterD?" / OD "+m.springOuterD+"mm":""):null);
    sf('valves','locknutSize','Rocker Locknut',m.locknutSize);
  }

  if(iS('fasteners')&&m.fasteners&&m.fasteners.length>0){
    addSection("Fastener Specs");
    m.fasteners.forEach(f=>{
      const loc=f.location==="Other"?(f.locOther||"Other"):(f.location||"—");
      const parts=[f.fType,f.diameter,f.length?f.length+"mm":null,f.torqueNm?f.torqueNm+"Nm":null].filter(Boolean).join(" · ");
      addField(loc,parts);
    });
  }

  if(iS('ports')&&(m.iPW||m.iSpacing||m.iBoltSz)){
    addSection("Port Dimensions");
    sf('ports','iPW','Intake Port',m.iPW&&m.iPH?m.iPW+"×"+m.iPH+"mm":null);
    sf('ports','ePW','Exhaust Port',m.ePW&&m.ePH?m.ePW+"×"+m.ePH+"mm":null);
    sf('ports','iSpacing','Intake Stud Spacing',m.iSpacing?m.iSpacing+" mm":null);
    sf('ports','iBoltSz','Intake Stud Size',m.iBoltSz?m.iBoltSz+(m.iBoltLen?" / "+m.iBoltLen+"mm":""):null);
    sf('ports','eSpacing','Exhaust Stud Spacing',m.eSpacing?m.eSpacing+" mm":null);
    sf('ports','eBoltSz','Exhaust Stud Size',m.eBoltSz?m.eBoltSz+(m.eBoltLen?" / "+m.eBoltLen+"mm":""):null);
  }

  if(iS('drivetrain')&&(m.transType||m.driveType||m.chainPitch)){
    addSection("Drivetrain");
    sf('drivetrain','driveType','Drive Type',m.driveType);
    sf('drivetrain','transType','Transmission',m.transType);
    sf('drivetrain','gearCount','Gear Count',m.gearCount);
    sf('drivetrain','gearboxBrand','Gearbox Brand',m.gearboxBrand);
    sf('drivetrain','gearboxOilType','Gearbox Oil',m.gearboxOilType?m.gearboxOilType+(m.gearboxOilCapacity?" / "+m.gearboxOilCapacity+"L":""):null);
    sf('drivetrain','chainPitch','Chain Pitch',m.chainPitch);
    sf('drivetrain','frontSprocket','Front Sprocket',m.frontSprocket);
    sf('drivetrain','rearSprocket','Rear Sprocket',m.rearSprocket);
    sf('drivetrain','cvtBeltType','CVT Belt',m.cvtBeltType);
  }

  if(iS('fluids')&&(m.engineOilGrade||m.brakeFluidType||m.diffOilType)){
    addSection("Fluids");
    sf('fluids','engineOilGrade','Engine Oil',m.engineOilGrade?m.engineOilGrade+(m.engineOilCapacity?" / "+m.engineOilCapacity+"L":""):null);
    sf('fluids','brakeFluidType','Brake Fluid',m.brakeFluidType);
    sf('fluids','diffOilType','Diff Oil',m.diffOilType?m.diffOilType+(m.diffOilCapacity?" / "+m.diffOilCapacity+"L":""):null);
    sf('fluids','hydraulicFluidType','Hydraulic Fluid',m.hydraulicFluidType);
  }

  if(iS('intervals')&&(m.oilChangeInterval||m.majorServiceInterval)){
    addSection("Service Intervals");
    sf('intervals','oilChangeInterval','Oil Change',m.oilChangeInterval?m.oilChangeInterval+" "+m.oilChangeUnit:null);
    sf('intervals','filterInterval','Filter Change',m.filterInterval?m.filterInterval+" "+m.filterIntervalUnit:null);
    sf('intervals','majorServiceInterval','Major Service',m.majorServiceInterval?m.majorServiceInterval+" "+m.majorServiceUnit:null);
    sf('intervals','lastServiceOdo','Last Service',m.lastServiceOdo);
  }

  if(iS('electrics')&&(m.battVoltage||m.batteryCCA||m.starterMotorType||m.chargingType)){
    addSection("Electrics");
    sf('electrics','battVoltage','Battery Voltage',m.battVoltage);
    sf('electrics','batteryCCA','Battery CCA',m.batteryCCA);
    sf('electrics','batteryAh','Battery Ah',m.batteryAh);
    sf('electrics','starterMotorType','Starter Motor',m.starterMotorType);
    sf('electrics','chargingType','Charging',m.chargingType);
    sf('electrics','chargeVoltage','Charge Voltage',m.chargeVoltage?m.chargeVoltage+"V":null);
    sf('electrics','chargeAmps','Charge Amps',m.chargeAmps?m.chargeAmps+"A":null);
  }

  if(iS('tyres')&&(m.tyreFront||m.tyreRear)){
    addSection("Tyres");
    sf('tyres','tyreFront','Front Tyre',m.tyreFront);
    sf('tyres','tyreRear','Rear Tyre',m.tyreRear);
    sf('tyres','rimFront','Front Rim',m.rimFront);
    sf('tyres','rimRear','Rear Rim',m.rimRear);
  }

  if(iS('notes')&&m.notes){addSection("Notes");if(iF('notes','notes'))addLine(m.notes,9);}

  if(iS('history')&&svcs&&svcs.length>0){
    addSection("Service History");
    svcs.forEach(s=>{
      const d=s.completedAt?new Date(s.completedAt).toLocaleDateString("en-AU"):"-";
      addField(d,(s.types||[]).join(", "));
      if(s.notes) addLine("  "+s.notes,8,false,[80,80,80]);
      y+=1;
    });
  }

  doc.setFontSize(7);doc.setTextColor(120,120,120);
  doc.text("Generated by Rat Bench · ratbench.net · "+new Date().toLocaleDateString("en-AU"),margin,290);
  doc.save((m.name||"machine").replace(/[^a-z0-9]/gi,"_")+"_ratbench.pdf");
}


function WikiTrackerModal({machine,profile,onClose}){
  const [tab,setTab]=React.useState("publish");
  const [entry,setEntry]=React.useState(null);
  const [revisions,setRevisions]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [deleting,setDeleting]=React.useState(false);
  const m=machine;

  React.useEffect(()=>{
    (async()=>{
      const slug=makeSlug(m.make||"",m.model||"");
      const e=await getWikiEntryBySlug(slug);
      if(e){
        setEntry(e);
        const r=await getWikiRevisions(e.id);
        setRevisions(r||[]);
      }
      setLoading(false);
    })();
  },[]);

  const isOwner=entry&&profile&&entry.created_by===profile.id;
  const myRevs=revisions.filter(r=>r.edited_by===profile?.id);
  const hasContribs=isOwner||myRevs.length>0;

  return(
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:SURF,border:"1px solid "+BRD,borderRadius:"4px 4px 0 0",width:"100%",maxWidth:520,maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"12px 16px",borderBottom:"1px solid "+BRD,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{display:"flex",gap:12}}>
            <button onClick={()=>setTab("publish")} style={{fontSize:10,fontWeight:700,letterSpacing:"0.06em",background:"none",border:"none",cursor:"pointer",color:tab==="publish"?ACC:MUT,borderBottom:tab==="publish"?"2px solid "+ACC:"2px solid transparent",paddingBottom:2,fontFamily:"'IBM Plex Mono',monospace"}}>PUBLISH</button>
            {hasContribs&&<button onClick={()=>setTab("manage")} style={{fontSize:10,fontWeight:700,letterSpacing:"0.06em",background:"none",border:"none",cursor:"pointer",color:tab==="manage"?ACC:MUT,borderBottom:tab==="manage"?"2px solid "+ACC:"2px solid transparent",paddingBottom:2,fontFamily:"'IBM Plex Mono',monospace"}}>MANAGE</button>}
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:16}}>
          {tab==="publish"&&<PublishWikiModal machine={m} profile={profile} onClose={onClose} onPublished={onClose} inline/>}
          {tab==="manage"&&(
            loading?<div style={{fontSize:10,color:MUT}}>Loading…</div>:
            !entry?<div style={{fontSize:10,color:MUT}}>No wiki entry found for this machine.</div>:
            <div>
              <a href={"https://wiki.ratbench.net/"+makeSlug(m.make||"",m.model||"")} target="_blank" rel="noreferrer" style={{fontSize:10,color:ACC,display:"block",marginBottom:16}}>View on wiki ↗</a>
              {isOwner&&(
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:9,color:MUT,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Delete Entire Entry</div>
                  <div style={{fontSize:10,color:MUT,marginBottom:8}}>Permanently removes this machine and all revisions from the wiki.</div>
                  <button disabled={deleting} onClick={async()=>{
                    if(!confirm(`Delete the entire wiki entry for ${m.make} ${m.model}? This cannot be undone.`))return;
                    setDeleting(true);
                    try{await deleteWikiEntry(entry.id);alert("Wiki entry deleted.");onClose();}
                    catch(e){alert(e.message);setDeleting(false);}
                  }} style={{...btnG,fontSize:9,color:"#e05555",borderColor:"#e05555"}}>
                    {deleting?"Deleting…":"🗑 Delete Entire Wiki Entry"}
                  </button>
                </div>
              )}
              {myRevs.length>0&&(
                <div>
                  <div style={{fontSize:9,color:MUT,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>My Revisions ({myRevs.length})</div>
                  {myRevs.map(r=>(
                    <div key={r.id} style={{background:BG,border:"1px solid "+BRD,padding:"8px 12px",borderRadius:2,marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                      <div>
                        <div style={{fontSize:10,color:TXT}}>{r.edit_summary||"No summary"}</div>
                        <div style={{fontSize:9,color:MUT}}>{new Date(r.created_at).toLocaleDateString()}</div>
                      </div>
                      <button disabled={deleting} onClick={async()=>{
                        if(!confirm("Delete this revision?"))return;
                        setDeleting(true);
                        try{
                          await deleteWikiRevision(r.id,entry.id);
                          setRevisions(prev=>prev.filter(x=>x.id!==r.id));
                        }catch(e){alert(e.message);}
                        setDeleting(false);
                      }} style={{...btnG,fontSize:9,color:"#e05555",borderColor:"#e05555",flexShrink:0}}>🗑</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PublishWikiModal({machine,profile,onClose,onPublished,inline}){
  const [step,setStep]=useState("loading"); // loading|confirm|merge|done|error
  const [result,setResult]=useState(null);
  const [mergedData,setMergedData]=useState({});
  const [conflicts,setConflicts]=useState([]);
  const [picks,setPicks]=useState({}); // fieldKey -> "wiki"|"mine"
  const [summary,setSummary]=useState("");
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState("");
  const [publishedSlug,setPublishedSlug]=useState("");

  useEffect(()=>{
    publishToWiki(machine,profile).then(res=>{
      setResult(res);
      if(res.isNew){
        setSummary("Initial publish");
        setStep("confirm");
      } else {
        // Compute conflicts
        const wikiData=res.currentRevision?.data||{};
        const mine=res.specData;
        const cflcts=[];
        const auto={...wikiData};
        Object.keys(mine).forEach(k=>{
          const mv=mine[k],wv=wikiData[k];
          const hasM=mv!==null&&mv!==undefined&&mv!=="";
          const hasW=wv!==null&&wv!==undefined&&wv!=="";
          if(hasM&&hasW&&String(mv)!==String(wv)) cflcts.push({key:k,wiki:wv,mine:mv});
          else if(hasM&&!hasW) auto[k]=mv;
        });
        setConflicts(cflcts);
        const initPicks={};
        cflcts.forEach(c=>{initPicks[c.key]="wiki";});
        setPicks(initPicks);
        setMergedData(auto);
        setSummary("Merged specs from my machine");
        setStep(cflcts.length?"merge":"confirm");
      }
    }).catch(e=>{setErr(e.message);setStep("error");});
  },[]);

  const submit=async()=>{
    setBusy(true);setErr("");
    try{
      const finalData={...mergedData};
      conflicts.forEach(c=>{finalData[c.key]=picks[c.key]==="mine"?c.mine:c.wiki;});
      if(result.isNew){
        // Already created — just record contribution
        await supabase.from("wiki_contributions").insert({entry_id:result.entry.id,machine_id:machine.id,user_id:profile.id});
      } else {
        await saveWikiRevision(result.entry.id,{...result.currentRevision?.data,...finalData},summary,profile);
        await supabase.from("wiki_contributions").insert({entry_id:result.entry.id,machine_id:machine.id,user_id:profile.id});
      }
      setPublishedSlug(result.slug);
      setStep("done");
      onPublished&&onPublished(result.slug);
    }catch(e){setErr(e.message);}
    setBusy(false);
  };

  const lbl={fontSize:9,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4};

  const inner=(
    <>
        <div style={mdlH}>
          {!inline&&<b style={{fontSize:13,textTransform:"uppercase"}}>Publish to Wiki</b>}
          {!inline&&<button style={{...btnG,...sm}} onClick={onClose}>✕</button>}
        </div>
        <div style={mdlB}>
          {step==="loading"&&<div style={{textAlign:"center",padding:24,color:MUT,fontSize:11}}>Checking wiki…</div>}

          {step==="error"&&<>
            <div style={{fontSize:10,color:RED,marginBottom:12}}>{err}</div>
            <button onClick={onClose} style={{...btnG,...sm}}>Close</button>
          </>}

          {step==="done"&&<>
            <div style={{fontSize:13,color:GRN,marginBottom:8}}>✓ Published!</div>
            <div style={{fontSize:10,color:MUT,marginBottom:16}}>Your data is now live on the wiki.</div>
            <a href={`https://wiki.ratbench.net/${publishedSlug}`} target="_blank" rel="noreferrer"
              style={{...btnA,display:"inline-block",textDecoration:"none",fontSize:10,padding:"8px 14px"}}>
              View Wiki Page →
            </a>
          </>}

          {(step==="confirm"||step==="merge")&&<>
            {!result?.isNew&&<div style={{background:"#0d1a0d",border:"1px solid #1a3a1a",borderRadius:2,padding:"8px 12px",fontSize:10,color:GRN,marginBottom:14}}>
              A wiki entry for <b>{machine.make} {machine.model}</b> already exists. Your data will be merged as a new revision.
            </div>}
            {result?.isNew&&<div style={{fontSize:10,color:MUT,marginBottom:14}}>
              Creating new wiki entry: <span style={{color:ACC,fontFamily:"monospace"}}>wiki.ratbench.net/{result?.slug}</span>
            </div>}

            {step==="merge"&&conflicts.length>0&&<>
              <div style={{fontSize:9,color:ACC,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,marginBottom:10}}>
                Conflicting Fields — pick which value to keep
              </div>
              <div style={{maxHeight:260,overflowY:"auto",marginBottom:14}}>
                {conflicts.map(c=>(
                  <div key={c.key} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid "+BRD}}>
                    <div style={{...lbl,marginBottom:6}}>{c.key}</div>
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      {[["wiki","Wiki: "+String(c.wiki)],["mine","Mine: "+String(c.mine)]].map(([val,label])=>(
                        <label key={val} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"6px 8px",borderRadius:2,border:"1px solid "+(picks[c.key]===val?ACC:BRD),background:picks[c.key]===val?"#1a1200":"transparent"}}>
                          <input type="radio" name={c.key} checked={picks[c.key]===val} onChange={()=>setPicks(p=>({...p,[c.key]:val}))} style={{accentColor:ACC}}/>
                          <span style={{fontSize:10,color:picks[c.key]===val?TXT:MUT}}>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>}

            <div style={{...col,marginBottom:12}}>
              <div style={lbl}>Edit Summary</div>
              <input style={inp} value={summary} onChange={e=>setSummary(e.target.value)} placeholder="Brief description of changes"/>
            </div>
            {err&&<div style={{fontSize:10,color:RED,marginBottom:10}}>{err}</div>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={submit} disabled={busy} style={{...btnA,...sm,opacity:busy?0.6:1}}>{busy?"Publishing…":"Publish"}</button>
              <button onClick={onClose} style={{...btnG,...sm}}>Cancel</button>
            </div>
          </>}
        </div>
      </>
  );
  if(inline) return inner;
  return <div style={ovly} onClick={onClose}><div style={{...mdl,maxWidth:480}} onClick={e=>e.stopPropagation()}>{inner}</div></div>;
}






// ── Plug Log ──────────────────────────────────────────────────────────────────
function PlugLog({machines}){
  const [selId,setSelId]=useState("");
  const [ca,setCa]=useState(nowL());
  const [notes,setNotes]=useState("");
  const [photo,setPhoto]=useState(null);
  const [busy,setBusy]=useState(false);
  const [saved,setSaved]=useState(false);
  const machine=machines.find(m=>m.id===selId)||null;

  const handlePhoto=async e=>{const f=e.target.files[0];if(!f)return;setBusy(true);setPhoto(await resizeImg(await toB64(f)));setBusy(false);setSaved(false);};
  const doSave=async()=>{
    if(!machine||!photo)return;
    const entry={id:uid(),completedAt:ca,types:["Spark Plug"],notes:notes.trim(),plugPhoto:photo,jobPhotos:[],createdAt:new Date().toISOString()};
    await upsertService(machine.id,entry);
    setSaved(true);setPhoto(null);setNotes("");setCa(nowL());
  };

  return (
    <div style={{padding:16,flex:1}}>
      <SL t="Spark Plug Log" />
      <div style={col}>
        <FL t="Machine" />
        {machines.length===0
          ?<div style={{fontSize:11,color:MUT}}>Add a machine in the Tracker tab first</div>
          :<select style={sel} value={selId} onChange={e=>{setSelId(e.target.value);setSaved(false);}}>
            <option value="">— Select machine —</option>
            {machines.map(m=><option key={m.id} value={m.id}>{mIcon(m.type)} {m.name}</option>)}
          </select>}
      </div>
      {machine&&(
        <>
          <div style={col}><FL t="Completed" /><input type="datetime-local" style={inp} value={ca} onChange={e=>setCa(e.target.value)} /></div>
          <div style={col}>
            <FL t="Plug Photo" />
            <div style={{border:"1px dashed "+BRD,borderRadius:2,padding:14,textAlign:"center",cursor:"pointer",position:"relative"}} onClick={ev=>ev.stopPropagation()}>
              <input type="file" accept="image/*" onChange={handlePhoto}
                style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%"}} />
              {busy?<span style={{fontSize:9,color:MUT}}>Processing...</span>
                :photo?<img src={photo} alt="" style={{width:"100%",maxHeight:180,objectFit:"cover",borderRadius:2}} />
                :<div><div style={{fontSize:26,marginBottom:6}}>🔩</div><span style={{fontSize:9,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase"}}>Tap to photograph plug</span></div>}
            </div>
            {photo&&<button style={{...btnG,...sm,marginTop:5}} onClick={()=>{setPhoto(null);setSaved(false);}}>Retake</button>}
          </div>
          <div style={col}><FL t="Notes (optional)" /><textarea style={txa} placeholder="Gap, brand, condition reading..." value={notes} onChange={e=>{setNotes(e.target.value);setSaved(false);}} /></div>
          {saved&&<div style={{background:"#0e2410",border:"1px solid #1a3a1a",borderRadius:2,padding:"8px 12px",fontSize:11,color:GRN,marginBottom:12}}>✓ Logged to {machine.name}</div>}
          <button style={{...btnA,width:"100%",opacity:!photo?0.4:1}} onClick={doSave} disabled={!photo}>Save to {machine.name}</button>
        </>
      )}
    </div>
  );
}

// ── Job Board ─────────────────────────────────────────────────────────────────
function JobBoard({machines,setMachines}){
  const updateStatus=async(m,status)=>{const u={...m,status};await upsertMachine(u);setMachines(prev=>prev.map(x=>x.id===m.id?u:x));};
  const updateRage=async(m,rage)=>{const u={...m,rage};await upsertMachine(u);setMachines(prev=>prev.map(x=>x.id===m.id?u:x));};
  const groups=STATUSES.map(s=>({status:s,items:machines.filter(m=>(m.status||"Active")===s)}));
  return (
    <div style={{padding:16,flex:1}}>
      <SL t="Job Board" />
      {machines.length===0&&<Empty t="No machines yet" />}
      {groups.map(({status,items})=>items.length===0?null:(
        <div key={status} style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <StatusBadge status={status} />
            <span style={{fontSize:9,color:MUT,letterSpacing:"0.1em"}}>{items.length} machine{items.length!==1?"s":""}</span>
          </div>
          {items.map(m=>(
            <div key={m.id} style={{background:SURF,border:"1px solid "+BRD,borderRadius:3,marginBottom:8,padding:"13px 14px"}}>
              <div style={{display:"flex",gap:10}}>
                <span style={{fontSize:17}}>{mIcon(m.type)}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:TXT,marginBottom:2}}>{m.name}</div>
                  <div style={{fontSize:9,color:MUT,marginBottom:8}}>{[m.source,m.make,m.model].filter(Boolean).join("  ·  ")}</div>
                  {m.notes&&<div style={{fontSize:11,color:"#777",lineHeight:1.5,marginBottom:8}}>{m.notes}</div>}
                  <SkullRating value={m.rage||0} onChange={r=>updateRage(m,r)} />
                  <Divider />
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {STATUSES.filter(s=>s!==status).map(s=>(
                      <button key={s} onClick={()=>updateStatus(m,s)} style={{fontSize:8,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:"4px 9px",borderRadius:2,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",background:SBG_[s],color:SCOL[s],border:"1px solid "+SCOL[s]+"55"}}>
                        → {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Spec Search ───────────────────────────────────────────────────────────────
function SpecSearch({machines}){
  const [query,setQuery]=useState("");
  const q=query.trim().toLowerCase();
  const FIELDS=[
    {k:"name",             l:"Name",                              u:""},
    {k:"make",             l:"Make",                              u:""},
    {k:"model",            l:"Model",                             u:""},
    {k:"type",             l:"Machine Type",                      u:""},
    {k:"source",           l:"Source",                            u:""},
    {k:"status",           l:"Status",                            u:""},
    {k:"strokeType",       l:"Engine Type",                       u:""},
    {k:"plugGap",          l:"Spark Plug Gap",                    u:"mm"},
    {k:"coilType",         l:"Coil Type",                         u:""},
    {k:"primaryOhms",      l:"Primary Coil Resistance",           u:"ohms"},
    {k:"secondaryOhms",    l:"Secondary Coil Resistance",         u:"ohms"},
    {k:"starterType",      l:"Starter System",                    u:""},
    {k:"ropeDiameter",     l:"Starter Rope Diameter",             u:"mm"},
    {k:"ropeLength",       l:"Starter Rope Length",               u:"mm"},
    {k:"rBoltN",           l:"Recoil Bolt Count",                 u:""},
    {k:"rBoltSz",          l:"Recoil Bolt Diameter",              u:""},
    {k:"rBoltLen",         l:"Recoil Bolt Length",                u:"mm"},
    {k:"cylCount",         l:"Cylinder Count",                    u:""},
    {k:"firingOrder",      l:"Firing Order",                      u:""},
    {k:"valveTrain",       l:"Valve Train Type",                  u:""},
    {k:"camType",          l:"Cam Type",                          u:""},
    {k:"locknutSize",      l:"Rocker Arm Locknut Size",           u:""},
    {k:"iValveFace",       l:"Intake Valve Face Diameter",        u:"mm"},
    {k:"iValveStem",       l:"Intake Valve Stem Diameter",        u:"mm"},
    {k:"iValveLift",       l:"Intake Valve Lift",                 u:"mm"},
    {k:"iValveWeight",     l:"Intake Valve Weight",               u:"g"},
    {k:"eValveFace",       l:"Exhaust Valve Face Diameter",       u:"mm"},
    {k:"eValveStem",       l:"Exhaust Valve Stem Diameter",       u:"mm"},
    {k:"eValveLift",       l:"Exhaust Valve Lift",                u:"mm"},
    {k:"eValveWeight",     l:"Exhaust Valve Weight",              u:"g"},
    {k:"springFreeLen",    l:"Valve Spring Free Length",          u:"mm"},
    {k:"springOuterD",     l:"Valve Spring Outer Diameter",       u:"mm"},
    {k:"springWireD",      l:"Valve Spring Wire Diameter",        u:"mm"},
    {k:"springWeight",     l:"Valve Spring Weight",               u:"g"},
    {k:"ccSize",           l:"CC Size / Rating",                  u:"cc"},
    {k:"compression",      l:"Compression",                       u:"PSI"},
    {k:"idleRpm",          l:"Idle RPM (approx)",                 u:"rpm"},
    {k:"wotRpm",           l:"WOT RPM (approx)",                  u:"rpm"},
    {k:"plugType",         l:"Spark Plug Type",                   u:""},
    {k:"intakeValveClear", l:"Intake Valve Clearance",            u:"mm"},
    {k:"exhaustValveClear",l:"Exhaust Valve Clearance",           u:"mm"},
    {k:"intakeValveN",     l:"Valves per Intake",                 u:""},
    {k:"exhaustValveN",    l:"Valves per Exhaust",                u:""},
    {k:"iSpacing",         l:"Intake Stud Center Spacing",        u:"mm"},
    {k:"iStuds",           l:"Intake Studs per Side",             u:""},
    {k:"iBoltSz",          l:"Intake Stud Diameter",              u:""},
    {k:"iBoltLen",         l:"Intake Stud Length",                u:"mm"},
    {k:"eSpacing",         l:"Exhaust Stud Center Spacing",       u:"mm"},
    {k:"eStuds",           l:"Exhaust Studs per Side",            u:""},
    {k:"eBoltSz",          l:"Exhaust Stud Diameter",             u:""},
    {k:"eBoltLen",         l:"Exhaust Stud Length",               u:"mm"},
    {k:"iPW",              l:"Intake Port Width",                 u:"mm"},
    {k:"iPH",              l:"Intake Port Height",                u:"mm"},
    {k:"iPCond",           l:"Intake Port Condition",             u:""},
    {k:"iPNotes",          l:"Intake Port Notes",                 u:""},
    {k:"ePW",              l:"Exhaust Port Width",                u:"mm"},
    {k:"ePH",              l:"Exhaust Port Height",               u:"mm"},
    {k:"ePCond",           l:"Exhaust Port Condition",            u:""},
    {k:"ePNotes",          l:"Exhaust Port Notes",                u:""},
    {k:"pulseLoc",         l:"Pulse Port Location",               u:""},
    {k:"pulsePos",         l:"Pulse Port Position",               u:""},
    {k:"pulseOffset",      l:"Pulse Port Offset from Nearest Edge",u:"mm"},
    {k:"boreDiameter",     l:"Cylinder Bore Diameter",             u:"mm"},
    {k:"ptoDiameter",      l:"PTO Shaft Diameter",                 u:""},
    {k:"shaftType",        l:"Shaft Type",                         u:""},
    {k:"threadDir",        l:"Head Thread Direction",               u:""},
    {k:"threadSize",       l:"Head Thread Size",                    u:""},
    {k:"sprocketType",     l:"Sprocket Type",                       u:""},
    {k:"fuelSystem",       l:"Fuel System",                       u:""},
    {k:"cBrand",           l:"Carb Brand",                        u:""},
    {k:"cType",            l:"Carb Type",                         u:""},
    {k:"cModel",           l:"Carb Model",                        u:""},
    {k:"ecuModel",         l:"ECU Brand / Model",                 u:""},
    {k:"tbDiameter",       l:"Throttle Body Diameter",            u:"mm"},
    {k:"injectorCount",    l:"Fuel Injector Count",               u:""},
    {k:"injectorFlow",     l:"Injector Flow Rate",                u:"cc/min"},
    {k:"fuelRailPressure", l:"Fuel Rail Pressure",                u:"bar"},
    {k:"fuelPumpPressure", l:"Fuel Pump Pressure",                u:"bar"},
    {k:"tpsSensor",        l:"TPS Sensor",                        u:""},
    {k:"mapSensor",        l:"MAP Sensor",                        u:""},
    {k:"iatSensor",        l:"IAT Sensor",                        u:""},
    {k:"o2Sensor",         l:"O2 Sensor",                         u:""},
    {k:"iacSensor",        l:"IAC",                               u:""},
    {k:"cType",            l:"Carb Type",                         u:""},
    {k:"cModel",           l:"Carb Model (optional)",             u:""},
    {k:"notes",            l:"Notes",                             u:""},
    {k:"year",             l:"Year",                              u:""},
    {k:"colour",           l:"Colour",                            u:""},
    {k:"bodyType",         l:"Body Type",                         u:""},
    {k:"driveConfig",      l:"Drive Configuration",               u:""},
    {k:"desc",             l:"Description",                       u:""},
    {k:"pumpBrand",        l:"Pump Brand",                        u:""},
    {k:"pumpModel",        l:"Pump Model",                        u:""},
    {k:"pumpPsi",          l:"Pump Max PSI",                      u:"PSI"},
    {k:"pumpType",         l:"Pump Type",                         u:""},
    {k:"genWatts",         l:"Generator Rated Watts",             u:"W"},
    {k:"genVoltage",       l:"Generator Voltage",                 u:""},
    {k:"genFreq",          l:"Generator Frequency",               u:""},
    {k:"driveType",        l:"Drive Type",                        u:""},
    {k:"chainPitch",       l:"Chain Pitch",                       u:""},
    {k:"frontSprocket",    l:"Front Sprocket",                    u:"teeth"},
    {k:"rearSprocket",     l:"Rear Sprocket",                     u:"teeth"},
    {k:"transType",        l:"Transmission Type",                 u:""},
    {k:"forkType",         l:"Front Suspension Type",             u:""},
    {k:"forkDiameter",     l:"Fork Diameter",                     u:"mm"},
    {k:"rearShockType",    l:"Rear Suspension Type",              u:""},
    {k:"frontBrake",       l:"Front Brake Type",                  u:""},
    {k:"rearBrake",        l:"Rear Brake Type",                   u:""},
    {k:"tyreFront",        l:"Front Tyre Size",                   u:""},
    {k:"tyreRear",         l:"Rear Tyre Size",                    u:""},
    {k:"battVoltage",      l:"Battery Voltage",                   u:""},
    {k:"deckSize",         l:"Deck Size",                         u:"inches"},
    {k:"bladeType",        l:"Blade Type",                        u:""},
    {k:"bladeLength",      l:"Blade Length",                      u:"mm"},
  ];
  const results=!q?[]:machines.map(m=>{
    const hits=FIELDS.filter(f=>{
      const valMatch=(m[f.k]||"").toString().toLowerCase().includes(q);
      const labelMatch=f.l.toLowerCase().includes(q);
      return (valMatch||labelMatch)&&m[f.k];
    });
    const scored=hits.map(f=>({
      ...f,
      score:(m[f.k]||"").toString().toLowerCase().includes(q)?2:1
    })).sort((a,b)=>b.score-a.score);

    // Also search fastener entries
    const fastenerHits=[];
    (m.fasteners||[]).forEach((f,idx)=>{
      const vals=[f.location,f.locOther,f.fType,f.driveType,f.diameter,f.length,f.spacing,f.countPerSide,f.torqueNm?f.torqueNm+"Nm":null,f.torqueFtlb?f.torqueFtlb+"ft-lb":null].filter(Boolean);
      const matchedVals=vals.filter(v=>v.toString().toLowerCase().includes(q));
      if(matchedVals.length){
        fastenerHits.push({
          k:`fastener_${idx}`,
          l:`Fastener: ${f.location==="Other"?f.locOther:f.location||"Unknown"}`,
          u:"",
          value:vals.join(" · "),
          score:2,
          isFastener:true,
          fastenerData:f,
        });
      }
    });

    const allHits=[...scored,...fastenerHits];
    return allHits.length?{m,hits:allHits}:null;
  }).filter(Boolean)
  .sort((a,b)=>{
    const aScore=a.hits.reduce((s,f)=>s+f.score,0);
    const bScore=b.hits.reduce((s,f)=>s+f.score,0);
    return bScore-aScore;
  });

  return (
    <div style={{padding:16,flex:1}}>
      <SL t="Spec Search" />
      <div style={{fontSize:10,color:MUT,marginBottom:12,lineHeight:1.6}}>Search any spec across your inventory — stud spacing, carb brand, plug type, bolt size.</div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <input style={{...inp,fontSize:13}} placeholder="e.g.  28  /  Walbro  /  NGK  /  M5..." value={query} onChange={e=>setQuery(e.target.value)} />
        {query&&<button style={{...btnG,...sm,whiteSpace:"nowrap"}} onClick={()=>setQuery("")}>Clear</button>}
      </div>
      {!q&&machines.length===0&&<Empty t="No machines in inventory yet" />}
      {!q&&machines.length>0&&<div style={{fontSize:10,color:MUT,textAlign:"center",padding:"24px 0",lineHeight:2}}>{machines.length} machine{machines.length!==1?"s":""} in inventory<br /><span style={{fontSize:9}}>Start typing to search</span></div>}
      {q&&results.length===0&&<Empty t={"No matches for \""+query+"\""} />}
      {q&&results.length>0&&(
        <>
          <div style={{fontSize:9,color:MUT,marginBottom:10,letterSpacing:"0.1em"}}>{results.length} match{results.length!==1?"es":""} for "{query}"</div>
          {results.map(({m,hits})=>(
            <div key={m.id} style={{background:SURF,border:"1px solid "+BRD,borderRadius:3,marginBottom:10,padding:"13px 14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <span style={{fontSize:15}}>{mIcon(m.type)}</span>
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:TXT}}>{m.name}</div><div style={{fontSize:9,color:MUT,marginTop:1}}>{[m.make,m.model,m.source].filter(Boolean).join(" · ")}</div></div>
                <StatusBadge status={m.status||"Active"} />
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                {hits.map(f=>(
                  f.isFastener
                    ? <div key={f.k} style={{background:"#1a0e00",border:"1px solid #3a2200",borderRadius:2,padding:"6px 9px",gridColumn:"1/-1"}}>
                        <div style={{fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase",color:ACC,marginBottom:2}}>{f.l}</div>
                        <div style={{fontSize:11,color:"#e8a060",fontFamily:"'IBM Plex Mono',monospace"}}>{f.value}</div>
                      </div>
                    : <div key={f.k} style={{background:"#1a0e00",border:"1px solid #3a2200",borderRadius:2,padding:"6px 9px"}}>
                        <div style={{fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase",color:ACC,marginBottom:2}}>{f.l}</div>
                        <div style={{fontSize:11,color:"#e8a060",fontFamily:"'IBM Plex Mono',monospace"}}>{m[f.k]}{f.u?" "+f.u:""}</div>
                      </div>
                ))}
              </div>
              {FIELDS.filter(f=>m[f.k]&&!hits.find(h=>h.k===f.k)).length>0&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginTop:5}}>
                  {FIELDS.filter(f=>m[f.k]&&!hits.find(h=>h.k===f.k)).map(f=><div key={f.k} style={{background:"#0d0d0d",border:"1px solid "+BRD2,borderRadius:2,padding:"6px 9px"}}><div style={{fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase",color:MUT,marginBottom:2}}>{f.l}</div><div style={{fontSize:11,color:"#555",fontFamily:"'IBM Plex Mono',monospace"}}>{m[f.k]}{f.u?" "+f.u:""}</div></div>)}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

const isWiki = window.location.hostname === "wiki.ratbench.net";
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      {isWiki ? <WikiApp /> : <App />}
    </ErrorBoundary>
  </React.StrictMode>
);