import React, { useState } from 'react';
import { ACC, MUT, TXT, btnA, btnG, sm, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { ALL_SECTIONS, ALL_BADGE_FIELDS, BADGE_PALETTE, DEFAULT_TILE } from '../../lib/constants';
import { getMachineSpecEntries, SPEC_LABEL_TO_SECTION, humanizeKey } from '../../lib/machineSpecs';

// Structural/internal machine keys that are never spec data — never offer
// these as tile badges or layout toggles no matter what value they hold.
const NON_SPEC_KEYS = new Set([
  "id","userId","companyId","clientId","createdAt","updatedAt","name","make","model",
  "tileFields","tileColors","expandFields","hiddenSpecFields",
  "photos","iPPhotos","ePPhotos","jobPhotos","services","parts","timeLog","jobTimers",
  "dueDate","lastServiceDate","lastServiceOdo","lastServiceNotes",
  "notes","desc","lighting","fasteners","belts","hydRams",
  "chipperSpec","stumpGrinderSpec","carbSpec",
  "submittedToWiki","wikiMachineId","status","strokeType","rage","type",
]);

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
  // Any machine key with a real scalar value that ALL_BADGE_FIELDS doesn't
  // already know about becomes a selectable badge too, bucketed under
  // "Other" — previously a field only became tile-able once someone
  // remembered to add it to that curated list, so real data (e.g. Outboard
  // Motor specs) could be logged and still be impossible to pick as a badge.
  const knownKeys = new Set(ALL_BADGE_FIELDS.map(f => f.k));
  const dynamicFields = Object.keys(machine)
    .filter(k => !knownKeys.has(k) && !NON_SPEC_KEYS.has(k))
    .filter(k => {
      const val = machine[k];
      if (val == null || val === "") return false;
      if (typeof val === "object") return false; // arrays/nested spec objects aren't single-badge-able
      return true;
    })
    .map(k => ({ k, l: humanizeKey(k), s: "", section: "Other" }));
  const availableFields = [...ALL_BADGE_FIELDS, ...dynamicFields].filter(f => {
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
            <button style={{...btnG,...sm}} onClick={()=>setFields([...DEFAULT_TILE])}>Reset</button>
          </div>
          {sections.map(section=>(
            <div key={section} style={{marginBottom:10}}>
              <div style={{fontSize:10,color:ACC,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:6,paddingBottom:4,borderBottom:"1px solid #1a1a1a"}}>{section}</div>
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
                      {val&&!isAuto&&<span style={{fontSize:10,color:"#444"}}>{String(val).slice(0,16)}</span>}
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
    {k:"parts",         l:"Parts Used",          hasData: m => m.parts?.length>0},
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

  // Every logged spec label that the coarse bucket toggles above have no
  // entry for at all (SPEC_LABEL_TO_SECTION only maps ~40 of them) — these
  // used to always render unconditionally with no way to hide them; now
  // they get a real per-field toggle here instead, backed by a separate
  // hiddenSpecFields list so it's purely additive and doesn't disturb the
  // existing expandFields bucket data at all.
  const otherLabels = getMachineSpecEntries(machine)
    .map(s => s.label)
    .filter(label => !SPEC_LABEL_TO_SECTION[label]);
  const [hidden, setHidden] = useState(new Set(machine.hiddenSpecFields||[]));
  const toggleHidden = label => setHidden(prev => {
    const next = new Set(prev);
    next.has(label) ? next.delete(label) : next.add(label);
    return next;
  });

  const save = () => onSave({...machine, expandFields: fields, hiddenSpecFields: [...hidden]});
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

          {otherLabels.length>0&&(
            <div style={{marginTop:14}}>
              <div style={{fontSize:10,color:ACC,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:6,paddingBottom:4,borderBottom:"1px solid #1a1a1a"}}>Other Specs</div>
              <div style={{fontSize:9,color:MUT,marginBottom:8,lineHeight:1.6}}>
                Individual fields not covered by a section above — shown by default, uncheck to hide.
              </div>
              {otherLabels.map(label=>(
                <label key={label} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:"1px solid #111",cursor:"pointer"}}>
                  <input type="checkbox" checked={!hidden.has(label)} onChange={()=>toggleHidden(label)} style={{accentColor:ACC,width:14,height:14,flexShrink:0}} />
                  <span style={{fontSize:10,color:hidden.has(label)?MUT:TXT,fontFamily:"'IBM Plex Mono',monospace"}}>{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div style={mdlF}>
          <button style={btnG} onClick={onClose}>Cancel</button>
          <button style={btnA} onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
