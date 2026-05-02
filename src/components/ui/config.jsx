import React, { useState } from 'react';
import { ACC, MUT, TXT, btnA, btnG, sm, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { ALL_SECTIONS, ALL_BADGE_FIELDS, BADGE_PALETTE, DEFAULT_TILE } from '../../lib/constants';

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
    {k:"belts",         l:"Belts",               hasData: m => m.belts?.length>0},
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
