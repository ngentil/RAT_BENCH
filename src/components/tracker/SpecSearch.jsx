import React, { useState } from 'react';
import { MUT, ACC, BRD, BRD2, SURF, TXT, inp, btnG, sm } from '../../lib/styles';
import { SL, Empty } from '../ui/shared';
import { mIcon } from '../../lib/helpers';
import StatusBadge from '../ui/StatusBadge';

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

function SpecSearch({machines}){
  const [query,setQuery]=useState("");
  const q=query.trim().toLowerCase();

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

    const fastenerHits=[];
    (m.fasteners||[]).forEach((f,idx)=>{
      const vals=[f.location,f.locOther,f.fType,f.driveType,f.diameter,f.length,f.spacing,f.countPerSide,f.torqueNm?f.torqueNm+"Nm":null,f.torqueFtlb?f.torqueFtlb+"ft-lb":null].filter(Boolean);
      const matchedVals=vals.filter(v=>v.toString().toLowerCase().includes(q));
      if(matchedVals.length){
        fastenerHits.push({
          k:`fastener_${idx}`,
          l:`Fastener: ${f.location==="Other"?f.locOther:f.location||"Unknown"}`,
          u:"",value:vals.join(" · "),score:2,isFastener:true,fastenerData:f,
        });
      }
    });

    const allHits=[...scored,...fastenerHits];
    return allHits.length?{m,hits:allHits}:null;
  }).filter(Boolean).sort((a,b)=>{
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
      {!q&&machines.length===0&&<Empty icon="🔍" t="No machines yet" sub="Add machines from the Tracker tab to search their specs here." />}
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
                  {FIELDS.filter(f=>m[f.k]&&!hits.find(h=>h.k===f.k)).map(f=>(
                    <div key={f.k} style={{background:"#0d0d0d",border:"1px solid "+BRD2,borderRadius:2,padding:"6px 9px"}}>
                      <div style={{fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase",color:MUT,marginBottom:2}}>{f.l}</div>
                      <div style={{fontSize:11,color:"#555",fontFamily:"'IBM Plex Mono',monospace"}}>{m[f.k]}{f.u?" "+f.u:""}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
export default SpecSearch;
