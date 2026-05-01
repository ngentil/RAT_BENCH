import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { getServices, upsertService, deleteServiceApi } from '../../lib/db';
import { ACC, MUT, BRD, BRD2, SURF, TXT, RED, GRN, btnA, btnG, btnD, dvdr, sm } from '../../lib/styles';
import { MACHINE_TYPES, SCOL, SBG_, DEFAULT_TILE, DEFAULT_EXPAND, ALL_BADGE_FIELDS, BADGE_PALETTE, TILE_COLOR_DEFAULTS } from '../../lib/constants';
import { SL, FL, Empty, SkullRating, SpecCell, TileConfig, ExpandConfig } from '../ui/shared';
import { mIcon, fmtDT } from '../../lib/helpers';
import { WikiTrackerModal } from '../wiki/WikiModals';
import PdfExportModal from '../pdf/PdfExportModal';
import ServiceModal from '../ui/ServiceModal';
import StatusBadge from '../ui/StatusBadge';
import MachineForm from './MachineForm';
function MachineCard({machine,onUpdate,onDelete,company,profile}){
  const [open,setOpen]=useState(false);
  const [svcs,setSvcs]=useState([]);
  const [loaded,setLoaded]=useState(false);
  const [showEdit,setShowEdit]=useState(false);
  const [showSvc,setShowSvc]=useState(false);
  const [editSvc,setEditSvc]=useState(null);
  const [saving,setSaving]=useState(false);
  const [fullImg,setFullImg]=useState(null);
  const [showConfig,setShowConfig]=useState(false);
  const [showWiki,setShowWiki]=useState(false);
  const [showExpandConfig,setShowExpandConfig]=useState(false);
  const [showPdfOpts,setShowPdfOpts]=useState(false);
  const m=machine;

  useEffect(()=>{
    if(open&&!loaded) getServices(m.id).then(s=>{setSvcs(s||[]);setLoaded(true);});
  },[open]);

  const saveSvc=async entry=>{
    setSaving(true);
    await upsertService(m.id,entry);
    const updated=svcs.find(s=>s.id===entry.id)?svcs.map(s=>s.id===entry.id?entry:s):[entry,...svcs];
    setSvcs(updated);setSaving(false);setShowSvc(false);setEditSvc(null);
  };
  const delSvc=async id=>{
    if(!confirm("Delete this entry?"))return;
    await deleteServiceApi(id);
    setSvcs(svcs.filter(s=>s.id!==id));
  };

  const specs=[
    m.year&&{label:"Year",value:m.year},
    m.colour&&{label:"Colour",value:m.colour},
    m.bodyType&&{label:"Body Type",value:m.bodyType},
    m.driveConfig&&{label:"Drive Config",value:m.driveConfig},
    m.strokeType&&{label:"Engine Type",value:m.strokeType},
    m.cylCount&&{label:"Cylinder Count",value:m.cylCount+(parseInt(m.cylCount)>=2&&m.firingOrder?" · Firing: "+m.firingOrder:"")},
    m.valveTrain&&{label:"Valve Train",value:m.valveTrain+(m.camType?" · "+m.camType:"")},
    m.locknutSize&&{label:"Rocker Locknut",value:m.locknutSize},
    m.iValveFace&&{label:"Intake Valve",value:m.iValveFace+"mm face"+(m.iValveStem?" · "+m.iValveStem+"mm stem":"")+(m.iValveLift?" · "+m.iValveLift+"mm lift":"")+(m.iValveWeight?" · "+m.iValveWeight+"g":"")},
    m.eValveFace&&{label:"Exhaust Valve",value:m.eValveFace+"mm face"+(m.eValveStem?" · "+m.eValveStem+"mm stem":"")+(m.eValveLift?" · "+m.eValveLift+"mm lift":"")+(m.eValveWeight?" · "+m.eValveWeight+"g":"")},
    m.springFreeLen&&{label:"Valve Spring",value:m.springFreeLen+"mm free"+(m.springOuterD?" · ⌀"+m.springOuterD+"mm":"")+(m.springWireD?" · wire "+m.springWireD+"mm":"")+(m.springWeight?" · "+m.springWeight+"g":"")},
    m.ccSize&&{label:"CC Size / Rating",value:m.ccSize+" cc"},
    m.compression&&{label:"Compression",value:m.compression+" PSI"},
    m.idleRpm&&{label:"Idle RPM (approx)",value:m.idleRpm+" rpm"},
    m.wotRpm&&{label:"WOT RPM (approx)",value:m.wotRpm+" rpm"},
    m.plugType&&{label:"Spark Plug Type",value:m.plugType},
    m.plugGap&&{label:"Spark Plug Gap",value:m.plugGap+" mm"},
    m.coilType&&{label:"Coil Type",value:m.coilType},
    m.primaryOhms&&{label:"Primary Coil",value:m.primaryOhms+" Ω"},
    m.secondaryOhms&&{label:"Secondary Coil",value:m.secondaryOhms+" Ω"},
    m.starterType&&{label:"Starter System",value:m.starterType},
    m.ropeDiameter&&{label:"Starter Rope",value:m.ropeDiameter+"mm ⌀"+(m.ropeLength?" · "+m.ropeLength+"mm long":"")},
    m.rBoltN&&{label:"Recoil Bolts",value:m.rBoltN+" bolts"+(m.rBoltSz?" · "+m.rBoltSz:"")+(m.rBoltLen?" · "+m.rBoltLen+"mm":"")},
    m.intakeValveClear&&{label:"Intake Valve Clearance",value:m.intakeValveClear+" mm · "+m.intakeValveN+" valve"+(m.intakeValveN!=="1"?"s":"")},
    m.exhaustValveClear&&{label:"Exhaust Valve Clearance",value:m.exhaustValveClear+" mm · "+m.exhaustValveN+" valve"+(m.exhaustValveN!=="1"?"s":"")},
    m.iSpacing&&{label:"Intake Stud Center Spacing",value:m.iSpacing+" mm",highlight:true},
    m.iStuds&&m.iStuds!==""&&{label:"Intake Studs per Side",value:m.iStuds,highlight:true},
    m.iBoltSz&&{label:"Intake Stud Diameter",value:m.iBoltSz+(m.iBoltLen?" · "+m.iBoltLen+" mm":""),highlight:true},
    m.eSpacing&&{label:"Exhaust Stud Center Spacing",value:m.eSpacing+" mm",highlight:true},
    m.eStuds&&m.eStuds!==""&&{label:"Exhaust Studs per Side",value:m.eStuds,highlight:true},
    m.eBoltSz&&{label:"Exhaust Stud Diameter",value:m.eBoltSz+(m.eBoltLen?" · "+m.eBoltLen+" mm":""),highlight:true},
    m.iPW&&m.iPH&&{label:"Intake Port Dimensions",value:m.iPW+"×"+m.iPH+" mm"+(m.iPCond==="Modified"?" · Modified ✦":"")},
    m.ePW&&m.ePH&&{label:"Exhaust Port Dimensions",value:m.ePW+"×"+m.ePH+" mm"+(m.ePCond==="Modified"?" · Modified ✦":"")},
    m.pulseLoc&&m.strokeType==="2-stroke"&&{label:"Pulse Port Location",value:m.pulseLoc+(m.pulsePos?" · "+m.pulsePos:"")+(m.pulseOffset?" · "+m.pulseOffset+" mm offset":"")},
    m.boreDiameter&&{label:"Cylinder Bore Diameter",value:m.boreDiameter+" mm"},
    m.ptoDiameter&&{label:"PTO Shaft Diameter",value:m.ptoDiameter},
    m.shaftType&&{label:"Shaft Type",value:m.shaftType},
    m.threadDir&&{label:"Head Thread Direction",value:m.threadDir},
    m.threadSize&&{label:"Head Thread Size",value:m.threadSize},
    m.sprocketType&&{label:"Sprocket Type",value:m.sprocketType},
    m.fuelSystem&&{label:"Fuel System",value:m.fuelSystem},
    m.cBrand&&{label:"Carb Brand",value:m.cBrand},
    m.cType&&{label:"Carb Type",value:m.cType},
    m.cModel&&{label:"Carb Model",value:m.cModel},
    m.ecuModel&&{label:"ECU",value:m.ecuModel},
    m.tbDiameter&&{label:"Throttle Body",value:m.tbDiameter+" mm"},
    m.injectorCount&&{label:"Injectors",value:m.injectorCount+(m.injectorFlow?" · "+m.injectorFlow+" cc/min":"")},
    m.fuelRailPressure&&{label:"Fuel Rail Pressure",value:m.fuelRailPressure+" bar"},
    m.tpsSensor&&{label:"TPS",value:m.tpsSensor},
    m.mapSensor&&{label:"MAP Sensor",value:m.mapSensor},
    m.iatSensor&&{label:"IAT Sensor",value:m.iatSensor},
    m.o2Sensor&&{label:"O2 Sensor",value:m.o2Sensor},
    m.iacSensor&&{label:"IAC",value:m.iacSensor},
  ].filter(Boolean);

  return (
    <div style={{background:SURF,border:"1px solid "+BRD,borderRadius:3,marginBottom:8,overflow:"hidden"}}>
      {fullImg&&<div onClick={()=>setFullImg(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out"}}><img src={fullImg} alt="" style={{maxWidth:"95vw",maxHeight:"95vh",objectFit:"contain"}} /></div>}
      {showEdit&&<MachineForm existing={m} onSave={u=>{onUpdate(u);setShowEdit(false);}} onClose={()=>setShowEdit(false)} company={company} units={profile?.units||"metric"} profile={profile}/>}
      {showWiki&&<WikiTrackerModal machine={m} profile={profile} onClose={()=>setShowWiki(false)}/>}
      {showConfig&&<TileConfig machine={m} onSave={u=>{onUpdate(u);setShowConfig(false);}} onClose={()=>setShowConfig(false)} />
      }
      {showExpandConfig&&<ExpandConfig machine={m} onSave={u=>{onUpdate(u);setShowExpandConfig(false);}} onClose={()=>setShowExpandConfig(false)} />}
      {(showSvc||editSvc)&&<ServiceModal machine={m} existing={editSvc} onSave={saveSvc} onClose={()=>{setShowSvc(false);setEditSvc(null);}} />}

      <div style={{display:"flex",alignItems:"center",padding:"11px 14px",gap:10}}>
        <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:10,flex:1,cursor:"pointer",userSelect:"none",minWidth:0}}>
          <span style={{fontSize:16}}>{mIcon(m.type)}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:700,color:TXT}}>{m.name}</div>
            <div style={{fontSize:9,color:MUT,marginTop:2}}>{[m.make,m.model,m.year,m.source].filter(Boolean).join(" · ")}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap",justifyContent:"flex-end",maxWidth:"55%",overflow:"hidden"}}>
            {(m.tileFields&&m.tileFields.length>0?m.tileFields:DEFAULT_TILE).map(k=>{
              const tc=m.tileColors||{};
              const colIdx=tc[k]!==undefined?tc[k]:(TILE_COLOR_DEFAULTS[k]!==undefined&&TILE_COLOR_DEFAULTS[k]!=="auto"?TILE_COLOR_DEFAULTS[k]:0);
              const [cbg,cbrd,ctxt]=BADGE_PALETTE[colIdx]||BADGE_PALETTE[0];
              const bStyle={fontSize:8,fontWeight:700,letterSpacing:"0.1em",padding:"2px 6px",borderRadius:2,fontFamily:"'IBM Plex Mono',monospace",background:cbg,color:ctxt,border:"1px solid "+cbrd,whiteSpace:"nowrap"};
              if(k==="status") return <StatusBadge key="status" status={m.status||"Active"} />;
              if(k==="strokeType"&&m.strokeType) return <span key="st" style={{fontSize:8,fontWeight:700,letterSpacing:"0.1em",padding:"2px 6px",borderRadius:2,fontFamily:"'IBM Plex Mono',monospace",background:m.strokeType==="4-stroke"?"#0e1a2a":m.strokeType==="Diesel"?"#0e200e":"#1a0e00",color:m.strokeType==="4-stroke"?"#3a7bd5":m.strokeType==="Diesel"?"#3d9e50":"#e8670a",border:"1px solid "+(m.strokeType==="4-stroke"?"#3a7bd555":m.strokeType==="Diesel"?"#3d9e5055":"#e8670a55")}}>{m.strokeType==="4-stroke"?"4T":m.strokeType==="Diesel"?"DSL":"2T"}</span>;
              if(k==="rage"&&(m.rage||0)>0) return <span key="rage" style={{fontSize:10,letterSpacing:-2}}>{"☠️".repeat(m.rage)}</span>;
              const field=ALL_BADGE_FIELDS.find(f=>f.k===k);
              if(field&&m[k]){
                const lbl=(field.s?field.s.replace(":",""):field.l.split("/")[0].trim().split(" ").slice(0,2).join(" "));
                return <span key={k} style={bStyle}>{lbl}: {String(m[k]).slice(0,14)}</span>;
              }
              return null;
            })}
            <span style={{fontSize:10,color:MUT}}>{open?"▲":"▼"}</span>
          </div>
        </div>
        <button onClick={ev=>{ev.stopPropagation();setShowConfig(true);}} style={{background:"none",border:"1px solid #2a2a2a",borderRadius:2,color:MUT,cursor:"pointer",fontSize:11,padding:"4px 6px",flexShrink:0}} title="Configure tile">⚙️</button>
      </div>

      {open&&(
        <div style={{borderTop:"1px solid "+BRD2}}>
          {(()=>{
            const ef = m.expandFields&&m.expandFields.length>0 ? m.expandFields : DEFAULT_EXPAND;
            const show = k => ef.includes(k);
            // Filter specs based on expandFields
            const visibleSpecs = specs.filter(s=>{
              const fieldMap = {
                "Engine Type":"strokeType","Cylinder Count":"cylCount","CC Size / Rating":"ccSize",
                "Compression":"compression","Spark Plug Type":"plugType","Spark Plug Gap":"plugGap",
                "Glow Plug Type":"plugType","Glow plug resistance":"plugGap",
                "Coil Type":"coilType","Primary Coil":"primaryOhms","Secondary Coil":"primaryOhms",
                "Starter System":"starterType","Starter Rope":"ropeDiameter","Recoil Bolts":"rBoltN",
                "Intake Valve Clearance":"intakeValveClear","Exhaust Valve Clearance":"intakeValveClear",
                "Valve Train":"valveTrain","Cam Type":"valveTrain","Rocker Locknut":"valveTrain",
                "Intake Valve":"iValveFace","Exhaust Valve":"eValveFace","Valve Spring":"springFreeLen",
                "Intake Stud Center Spacing":"iSpacing","Intake Studs per Side":"iSpacing","Intake Stud Diameter":"iSpacing",
                "Exhaust Stud Center Spacing":"iSpacing","Exhaust Studs per Side":"iSpacing","Exhaust Stud Diameter":"iSpacing",
                "Intake Port Dimensions":"iPW","Exhaust Port Dimensions":"iPW",
                "Pulse Port Location":"pulseLoc","Cylinder Bore Diameter":"boreDiameter",
                "PTO Shaft Diameter":"ptoDiameter","Shaft Type":"ptoDiameter","Head Thread Direction":"ptoDiameter","Head Thread Size":"ptoDiameter","Sprocket Type":"ptoDiameter",
                "Fuel System":"fuelSystem","Carb Brand":"cBrand","Carb Type":"cBrand","Carb Model":"cBrand",
                "ECU":"ecuModel","Throttle Body":"ecuModel","Injectors":"ecuModel","Fuel Rail Pressure":"ecuModel",
                "TPS":"tpsSensor","MAP Sensor":"tpsSensor","IAT Sensor":"tpsSensor","O2 Sensor":"tpsSensor","IAC":"tpsSensor",
              };
              const fk = fieldMap[s.label];
              return fk ? show(fk) : true;
            });
            return <>
              {show("photos")&&m.photos?.length>0&&<div style={{padding:"10px 14px 0"}}><FL t="Photos" /><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginTop:4}}>{m.photos.map((p,i)=><img key={i} src={p} alt="" onClick={()=>setFullImg(p)} style={{width:"100%",height:80,objectFit:"cover",borderRadius:2,border:"1px solid "+BRD,cursor:"zoom-in",display:"block"}} />)}</div></div>}
              {show("desc")&&m.desc&&<div style={{padding:"10px 14px 0"}}><FL t="Description" /><div style={{fontSize:11,color:"#999",lineHeight:1.5,marginTop:2}}>{m.desc}</div></div>}
              {visibleSpecs.length>0&&<div style={{padding:"12px 14px 0"}}><SL t="Engine Spec" /><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>{visibleSpecs.map(s=><SpecCell key={s.label} label={s.label} value={s.value} highlight={s.highlight} />)}</div></div>}
              {show("fasteners")&&m.fasteners&&m.fasteners.length>0&&<div style={{padding:"12px 14px 0"}}>
                <SL t="Fastener Specs" />
                <div style={{marginTop:6}}>
                  {m.fasteners.map((f,idx)=>{
                    const loc=f.location==="Other"?(f.locOther||"Other"):(f.location||"—");
                    const parts=[
                      f.fType,
                      f.fType==="Bolt"&&f.driveType?f.driveType:null,
                      f.diameter?f.diameter+" dia":null,
                      f.length?f.length+"mm length":null,
                      f.spacing?f.spacing+"mm ctr spacing":null,
                      f.countPerSide?f.countPerSide+"/side":null,
                      f.torqueNm?f.torqueNm+"Nm torque":null,
                    ].filter(Boolean);
                    return <div key={f.id||idx} style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"8px 10px",marginBottom:5}}>
                      <div style={{fontSize:8,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>{loc}</div>
                      <div style={{fontSize:11,color:TXT,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.6}}>{parts.length?parts.join(" · "):"No specs"}</div>
                    </div>;
                  })}
                </div>
              </div>}
              {show("notes")&&m.notes&&<div style={{padding:"10px 14px 0"}}><FL t="Notes" /><div style={{fontSize:11,color:"#999",lineHeight:1.5,marginTop:2}}>{m.notes}</div></div>}
              <div style={{height:1,background:BRD2,margin:"12px 0 0"}} />
            </>;
          })()}

          {(()=>{const ef=m.expandFields&&m.expandFields.length>0?m.expandFields:DEFAULT_EXPAND;const showSvcH=ef.includes("serviceHistory");return showSvcH&&(
          <div style={{padding:"12px 14px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <SL t="Service History" />
              <button style={{...btnA,...sm}} onClick={ev=>{ev.stopPropagation();setShowSvc(true);}}>+ Log</button>
            </div>
            {saving&&<div style={{fontSize:10,color:MUT,marginBottom:8}}>Saving...</div>}
            {!loaded&&<div style={{fontSize:10,color:MUT}}>Loading...</div>}
            {loaded&&svcs.length===0&&<Empty t="No entries yet" />}
            {loaded&&svcs.length>0&&(
              <div style={{borderLeft:"1px solid "+BRD}}>
                {svcs.map(svc=>(
                  <div key={svc.id} style={{position:"relative",paddingLeft:18,marginBottom:14}}>
                    <div style={{position:"absolute",left:3,top:4,width:7,height:7,borderRadius:"50%",background:ACC,border:"1px solid #c04f00"}} />
                    <div style={{fontSize:9,color:MUT,marginBottom:2}}>{fmtDT(svc.completedAt)}</div>
                    <div style={{fontSize:13,fontWeight:700,color:TXT,marginBottom:3}}>{svc.types.join("  ·  ")}</div>
                    {svc.notes&&<div style={{fontSize:11,color:"#888",lineHeight:1.5,marginBottom:5}}>{svc.notes}</div>}
                    {svc.plugPhoto&&<div style={{marginBottom:6}}><FL t="Spark Plug" /><img src={svc.plugPhoto} alt="" onClick={()=>setFullImg(svc.plugPhoto)} style={{borderRadius:2,maxWidth:"100%",maxHeight:130,objectFit:"cover",border:"1px solid "+BRD,cursor:"zoom-in",display:"block"}} /></div>}
                    {svc.jobPhotos?.length>0&&<div style={{marginBottom:6}}><FL t={"Job Photos ("+svc.jobPhotos.length+")"} /><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>{svc.jobPhotos.map((p,i)=><img key={i} src={p} alt="" onClick={()=>setFullImg(p)} style={{width:"100%",height:70,objectFit:"cover",borderRadius:2,border:"1px solid "+BRD,cursor:"zoom-in",display:"block"}} />)}</div></div>}
                    <div style={{display:"flex",gap:6,marginTop:5}}>
                      <button style={{...btnG,...sm}} onClick={()=>setEditSvc(svc)}>Edit</button>
                      <button style={btnD} onClick={()=>delSvc(svc.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          );})()}
          <div style={{padding:"0 14px 12px",display:"flex",gap:8,justifyContent:"space-between",alignItems:"center"}}>
            <button onClick={ev=>{ev.stopPropagation();setShowExpandConfig(true);}} style={{background:"none",border:"1px solid #2a2a2a",borderRadius:2,color:MUT,cursor:"pointer",fontSize:11,padding:"4px 6px"}} title="Configure expanded view">⚙️</button>
            <div style={{display:"flex",gap:8}}>
              <button style={{...btnG,...sm}} onClick={ev=>{ev.stopPropagation();setShowEdit(true);}}>Edit Machine</button>
              <button style={{...btnG,...sm}} onClick={ev=>{ev.stopPropagation();if(!loaded){getServices(m.id).then(s=>{setSvcs(s||[]);setLoaded(true);setShowPdfOpts(true);});}else setShowPdfOpts(true);}}>📄 PDF</button>
              {showPdfOpts&&<PdfExportModal m={m} svcs={svcs} onClose={()=>setShowPdfOpts(false)}/>}
              {m.make&&m.model&&<button style={{...btnG,...sm}} onClick={ev=>{ev.stopPropagation();setShowWiki(true);}}>🌐 Wiki</button>}
              <button style={btnD} onClick={ev=>{ev.stopPropagation();onDelete(m);}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default MachineCard;