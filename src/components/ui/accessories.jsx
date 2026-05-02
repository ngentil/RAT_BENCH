import React, { useState } from 'react';
import { ACC, MUT, TXT, inp, sel, txa, btnA, btnG, btnD, sm, col } from '../../lib/styles';
import { ATTACH_TYPES, LIGHT_LOCATIONS, LIGHT_TYPES, LIGHT_VOLTAGES, LIGHT_PLUGS, BEARING_LOCATIONS, BEARING_TYPES, BELT_TYPES } from '../../lib/constants';
import { FL } from './primitives';

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

export function BearingCard({b, onEdit, onRemove}){
  const parts=[b.type,b.partNo,b.clearance?b.clearance+"mm clearance":null,b.preload?b.preload+"Nm preload":null].filter(Boolean);
  return (
    <div style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"10px 12px",marginBottom:6}}>
      <div style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{b.location==="Other"?(b.locationOther||"Other"):b.location||"—"}</div>
      <div style={{fontSize:11,color:TXT,fontFamily:"'IBM Plex Mono',monospace",marginBottom:8,lineHeight:1.5}}>{parts.length?parts.join(" · "):"No specs yet"}</div>
      {b.notes&&<div style={{fontSize:10,color:MUT,marginBottom:6,lineHeight:1.4}}>{b.notes}</div>}
      <div style={{display:"flex",gap:6}}>
        <button onClick={onEdit} style={{...btnG,...sm}}>Edit</button>
        <button onClick={onRemove} style={btnD}>Delete</button>
      </div>
    </div>
  );
}

export function BearingForm({b, onSave, onCancel}){
  const [location,setLocation]=useState(b.location||"");
  const [locationOther,setLocationOther]=useState(b.locationOther||"");
  const [type,setType]=useState(b.type||"");
  const [partNo,setPartNo]=useState(b.partNo||"");
  const [clearance,setClearance]=useState(b.clearance||"");
  const [preload,setPreload]=useState(b.preload||"");
  const [notes,setNotes]=useState(b.notes||"");
  const save=()=>onSave({...b,location,locationOther,type,partNo,clearance:clearance.toString(),preload:preload.toString(),notes});
  return (
    <div style={{background:"#0d0d0d",border:"1px solid "+ACC,borderRadius:2,padding:"12px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase"}}>{b.id?"Edit Bearing":"New Bearing"}</span>
        <button onClick={onCancel} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:12}}>✕</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <div style={{...col,gridColumn:"1/-1"}}>
          <FL t="Location" />
          <select style={sel} value={location} onChange={ev=>setLocation(ev.target.value)}>
            <option value="">— not set —</option>
            {BEARING_LOCATIONS.map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        {location==="Other"&&<div style={{...col,gridColumn:"1/-1"}}><FL t="Describe location" /><input style={inp} placeholder="e.g. Idler shaft" value={locationOther} onChange={ev=>setLocationOther(ev.target.value)} /></div>}
        <div style={col}>
          <FL t="Bearing type" />
          <select style={sel} value={type} onChange={ev=>setType(ev.target.value)}>
            <option value="">— not set —</option>
            {BEARING_TYPES.map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div style={col}>
          <FL t="Part no. / dimensions" />
          <input style={inp} placeholder="e.g. 6203 / 17×40×12" value={partNo} onChange={ev=>setPartNo(ev.target.value)} />
        </div>
        <div style={col}>
          <FL t="Clearance (mm)" />
          <input style={inp} type="number" placeholder="e.g. 0.025" step="0.001" min="0" value={clearance} onChange={ev=>setClearance(ev.target.value)} />
        </div>
        <div style={col}>
          <FL t="Preload (Nm)" />
          <input style={inp} type="number" placeholder="e.g. 15" step="0.5" min="0" value={preload} onChange={ev=>setPreload(ev.target.value)} />
        </div>
        <div style={{...col,gridColumn:"1/-1"}}>
          <FL t="Notes" />
          <textarea style={{...txa,minHeight:40}} placeholder="e.g. Replace with sealed unit" value={notes} onChange={ev=>setNotes(ev.target.value)} />
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
        <button style={{...btnG,...sm}} onClick={onCancel}>Cancel</button>
        <button style={{...btnA,...sm}} onClick={save}>Save</button>
      </div>
    </div>
  );
}

export function BeltCard({b, onEdit, onRemove}){
  const parts = [
    b.beltType,
    b.beltCount ? b.beltCount+" belt"+(b.beltCount!=="1"?"s":"") : null,
    b.beltPartNo||null,
    b.beltWidth&&b.beltLength ? b.beltWidth+"×"+b.beltLength+"mm" : b.beltWidth ? b.beltWidth+"mm wide" : b.beltLength ? b.beltLength+"mm long" : null,
  ].filter(Boolean);
  return (
    <div style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"10px 12px",marginBottom:6}}>
      {b.beltFunction&&<div style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{b.beltFunction}</div>}
      <div style={{fontSize:11,color:TXT,fontFamily:"'IBM Plex Mono',monospace",marginBottom:b.beltNotes?6:8,lineHeight:1.5}}>{parts.length?parts.join(" · "):"No specs yet"}</div>
      {b.beltNotes&&<div style={{fontSize:10,color:MUT,marginBottom:8,lineHeight:1.4}}>{b.beltNotes}</div>}
      <div style={{display:"flex",gap:6}}>
        <button onClick={onEdit} style={{...btnG,...sm}}>Edit</button>
        <button onClick={onRemove} style={btnD}>Delete</button>
      </div>
    </div>
  );
}

export function BeltForm({b, onSave, onCancel}){
  const [beltType, setBeltType] = useState(b.beltType||"");
  const [beltCount, setBeltCount] = useState(b.beltCount||"");
  const [beltPartNo, setBeltPartNo] = useState(b.beltPartNo||"");
  const [beltWidth, setBeltWidth] = useState(b.beltWidth||"");
  const [beltLength, setBeltLength] = useState(b.beltLength||"");
  const [beltFunction, setBeltFunction] = useState(b.beltFunction||"");
  const [beltNotes, setBeltNotes] = useState(b.beltNotes||"");
  const save = () => onSave({...b, beltType, beltCount, beltFunction:beltFunction.trim(), beltPartNo:beltPartNo.trim(), beltWidth:beltWidth.toString(), beltLength:beltLength.toString(), beltNotes:beltNotes.trim()});
  return (
    <div style={{background:"#0d0d0d",border:"1px solid "+ACC,borderRadius:2,padding:"12px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:9,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase"}}>{b.id?"Edit Belt":"New Belt"}</span>
        <button onClick={onCancel} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:12}}>✕</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <div style={col}>
          <FL t="Belt type" />
          <select style={sel} value={beltType} onChange={ev=>setBeltType(ev.target.value)}>
            <option value="">— not set —</option>
            {BELT_TYPES.map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div style={col}>
          <FL t="Quantity" />
          <input style={inp} type="number" placeholder="e.g. 1" step="1" min="1" value={beltCount} onChange={ev=>setBeltCount(ev.target.value)} />
        </div>
        <div style={{...col,gridColumn:"1/-1"}}>
          <FL t="Belt function" />
          <input style={inp} placeholder="e.g. Fan belt, deck drive, alternator" value={beltFunction} onChange={ev=>setBeltFunction(ev.target.value)} />
        </div>
        <div style={{...col,gridColumn:"1/-1"}}>
          <FL t="Part no. / size code" />
          <input style={inp} placeholder="e.g. A56 / 13×1422" value={beltPartNo} onChange={ev=>setBeltPartNo(ev.target.value)} />
        </div>
        <div style={col}>
          <FL t="Width (mm)" />
          <input style={inp} type="number" placeholder="e.g. 13" step="0.5" min="0" value={beltWidth} onChange={ev=>setBeltWidth(ev.target.value)} />
        </div>
        <div style={col}>
          <FL t="Length (mm)" />
          <input style={inp} type="number" placeholder="e.g. 1422" step="1" min="0" value={beltLength} onChange={ev=>setBeltLength(ev.target.value)} />
        </div>
        <div style={{...col,gridColumn:"1/-1"}}>
          <FL t="Notes" />
          <textarea style={{...txa,minHeight:40}} placeholder="e.g. Fan belt, idler pulley tensioner" value={beltNotes} onChange={ev=>setBeltNotes(ev.target.value)} />
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
        <button style={{...btnG,...sm}} onClick={onCancel}>Cancel</button>
        <button style={{...btnA,...sm}} onClick={save}>Save</button>
      </div>
    </div>
  );
}
