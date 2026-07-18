import React, { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import PhotoViewer from '../ui/PhotoViewer';
import { supabase } from '../../lib/supabase';
import { getServices, upsertService, deleteServiceApi, upsertMachine } from '../../lib/db';
import { ACC, MUT, BRD, BRD2, SURF, TXT, RED, GRN, inp, btnA, btnG, btnD, dvdr, sm, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { MACHINE_TYPES, SCOL, SBG_, DEFAULT_TILE, DEFAULT_EXPAND, ALL_BADGE_FIELDS, BADGE_PALETTE, TILE_COLOR_DEFAULTS } from '../../lib/constants';
import { SL, FL, Empty, SkullRating, SpecCell, TileConfig, ExpandConfig } from '../ui/shared';
import { mIcon, fmtDT, getMachineServiceStatus, getStorageStatus, findMachineSpecMatch } from '../../lib/helpers';
import { hl } from '../wiki/wikiSearchHighlight';
import { WikiTrackerModal } from '../wiki/WikiModals';
import { canUse, effectiveTier } from '../../lib/gates';
import { getTiers, TIER_NAMES } from '../../lib/storageTiers';
import { getActiveBooking, createBooking, collectMachine, updateBooking } from '../../lib/db/bookings';
import { deletePhoto } from '../../lib/storage';
import { toastError } from '../../lib/toast';
const PdfExportModal = lazy(() => import('../pdf/PdfExportModal'));
import ServiceModal from '../ui/ServiceModal';
import StatusBadge from '../ui/StatusBadge';
import MachineForm from './MachineForm';
function MachineCard({machine,onUpdate,onDelete,company,profile,clients,isGuest,showGuide,onTutDismiss,onCardOpened,initialOpen,hideCollapse,onClose,searchQuery,searchTokens}){
  const [open,setOpen]=useState(!!initialOpen);
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
  // Storage policy state
  const [booking,setBooking]=useState(null);
  const [bookingLoaded,setBookingLoaded]=useState(false);
  const [showBookIn,setShowBookIn]=useState(false);
  const [bookForm,setBookForm]=useState({storageTier:"Bench",receivedAt:"",storageEnabled:true,storageFeeOverride:"",notes:""});
  const [bookSaving,setBookSaving]=useState(false);
  const [copied,setCopied]=useState(false);
  const [bookErr,setBookErr]=useState("");
  const [confirmDelete,setConfirmDelete]=useState(false);
  const m=machine;
  // Notify parent when card opens so the above-card guide arrow can hide
  useEffect(()=>{if(open&&showGuide)onCardOpened?.();},[open,showGuide]);
  const withGuide=(desc,el)=>showGuide?(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
      {el}
      <svg className="arrow-guide" width="18" height="14" viewBox="0 0 18 14" style={{display:"block"}}>
        <path d="M 9 12 C 12 7, 6 5, 9 2" stroke="#e8870a" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <path d="M 6 4 L 9 1 L 12 4" stroke="#e8870a" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{fontSize:7,color:"#e8870a",fontFamily:"'IBM Plex Mono',monospace",textAlign:"center",lineHeight:"1.3",whiteSpace:"pre-line"}}>{desc}</span>
    </div>
  ):el;
  const openRef = useRef(false);
  openRef.current = open;

  const clientName = useMemo(() => {
    if (!m.clientId || !clients?.length) return null;
    return clients.find(c => c.id === m.clientId)?.name || null;
  }, [m.clientId, clients]);

  // Refetch on every open (and machine change) — a cached-once list goes
  // stale when entries are added elsewhere (PlugLog, another device).
  useEffect(()=>{
    if(!open) return;
    let alive=true;
    getServices(m.id).then(s=>{if(alive){setSvcs(s||[]);setLoaded(true);}});
    return ()=>{alive=false;};
  },[open,m.id]);

  const storagePolicyEnabled = canUse('storage_policy',profile,company) && !!(profile?.storage_policy_enabled);

  useEffect(()=>{
    if(!storagePolicyEnabled) return;
    let alive=true;
    getActiveBooking(m.id).then(b=>{if(alive){setBooking(b);setBookingLoaded(true);}});
    return ()=>{alive=false;};
  },[storagePolicyEnabled,m.id]);

  // Android back button collapses this card when it's open.
  // Pushing { cardOpen: id } means: back closes photo first (if open), then collapses card.
  // Skipped entirely when hideCollapse — that mode is the Tracker's full-screen
  // tile overlay, which owns back-button handling itself (closeTile) so one
  // press exits to the tracker instead of just collapsing the card underneath.
  useEffect(()=>{
    if(!open||hideCollapse) return;
    history.pushState({ cardOpen: m.id }, '');
    const onPop = e => {
      // If we landed on our own state somehow, ignore. Otherwise we were just popped.
      if (!openRef.current) return;
      if (e.state?.cardOpen === m.id) return;
      setOpen(false);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  },[open]);

  const activeTiers = useMemo(()=>getTiers(profile?.storage_tiers),[profile?.storage_tiers]);
  const storageStatus = useMemo(()=>booking?getStorageStatus(booking,activeTiers):null,[booking,activeTiers]);

  const doBookIn = async () => {
    setBookSaving(true); setBookErr("");
    try {
      const b = await createBooking({
        machineId: m.id,
        storageTier: bookForm.storageTier,
        receivedAt: bookForm.receivedAt ? new Date(bookForm.receivedAt).toISOString() : undefined,
        storageEnabled: bookForm.storageEnabled,
        storageFeeOverride: bookForm.storageFeeOverride ? parseFloat(bookForm.storageFeeOverride) : undefined,
        notes: bookForm.notes || undefined,
      });
      setBooking(b); setShowBookIn(false);
      setBookForm({storageTier:"Bench",receivedAt:"",storageEnabled:true,storageFeeOverride:"",notes:""});
    } catch(e){ setBookErr(e.message); }
    setBookSaving(false);
  };

  const doCollect = async () => {
    if(!booking) return;
    try {
      await collectMachine(booking.id);
      setBooking(null); setBookingLoaded(false);
    } catch(e){
      console.error("collectMachine:",e);
      toastError("Couldn't mark as collected — check connection");
    }
  };

  const toggleStorageOnBooking = async () => {
    if(!booking) return;
    try {
      const b = await updateBooking(booking.id, { storage_enabled: !booking.storage_enabled });
      setBooking(b);
    } catch(e){
      console.error("updateBooking:",e);
      toastError("Couldn't update storage — check connection");
    }
  };

  const saveSvc=async entry=>{
    setSaving(true);
    try{
      await upsertService(m.id,entry);
      setSvcs(prev=>prev.find(s=>s.id===entry.id)?prev.map(s=>s.id===entry.id?entry:s):[entry,...prev]);
      setShowSvc(false);setEditSvc(null);
    }finally{
      setSaving(false);
    }
  };
  const delSvc=async id=>{
    if(!confirm("Delete this entry?"))return;
    const svc=svcs.find(s=>s.id===id);
    // DB delete first — destroying photos before a failed delete leaves the
    // surviving record pointing at 404s.
    try{
      await deleteServiceApi(id);
    }catch(e){
      toastError("Delete failed — check connection");
      return;
    }
    if(svc?.plugPhoto) deletePhoto(svc.plugPhoto);
    (svc?.jobPhotos||[]).forEach(url=>deletePhoto(url));
    setSvcs(prev=>prev.filter(s=>s.id!==id));
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
    m.obShaftLength&&{label:"Shaft Length",value:m.obShaftLength+(m.obTransomHeight?" · Transom: "+m.obTransomHeight+"mm":"")},
    m.obTiltTrim&&{label:"Tilt / Trim",value:m.obTiltTrim+(m.obSteering?" · "+m.obSteering:"")},
    m.obPropPitch&&{label:"Propeller",value:[m.obPropDiameter?m.obPropDiameter+'" dia':null,m.obPropPitch?m.obPropPitch+'" pitch':null,m.obPropMaterial].filter(Boolean).join(" · ")},
    m.obGearRatio&&{label:"Gear Ratio",value:m.obGearRatio},
    m.obLowerUnitOilType&&{label:"Lower Unit Oil",value:m.obLowerUnitOilType+(m.obLowerUnitOilCapacity?" · "+m.obLowerUnitOilCapacity+"mL":"")},
    m.obAnodeMaterial&&{label:"Anode Material",value:m.obAnodeMaterial},
    m.obBreakInHours&&{label:"Break-in Hours",value:m.obBreakInHours+"h"},
    m.obImpellerLastChanged&&{label:"Impeller Last Changed",value:m.obImpellerLastChanged},
    // chipper
    m.chipperSpec?.type&&{label:"Chipper Type",value:[m.chipperSpec.type,m.chipperSpec.brand&&m.chipperSpec.brand!=="Other"?m.chipperSpec.brand:m.chipperSpec.brandOther].filter(Boolean).join(" · ")},
    m.chipperSpec?.inchSize&&{label:"Capacity",value:m.chipperSpec.inchSize+'" chip capacity'},
    m.chipperSpec?.bladeCount&&{label:"Blade Count",value:m.chipperSpec.bladeCount},
    m.chipperSpec?.hours&&{label:"Hour Meter",value:m.chipperSpec.hours+"h"},
    m.chipperSpec?.bladeLastSharpened&&{label:"Blades Last Sharpened",value:m.chipperSpec.bladeLastSharpened},
    // stump grinder
    m.stumpGrinderSpec?.brand&&{label:"Brand",value:m.stumpGrinderSpec.brand!=="Other"?m.stumpGrinderSpec.brand:m.stumpGrinderSpec.brandOther},
    m.stumpGrinderSpec?.driveType&&{label:"Drive Type",value:m.stumpGrinderSpec.driveType},
    m.stumpGrinderSpec?.wheelDiameter&&{label:"Wheel",value:m.stumpGrinderSpec.wheelDiameter+'" dia'+(m.stumpGrinderSpec.toothCount?" · "+m.stumpGrinderSpec.toothCount+" teeth":"")},
    m.stumpGrinderSpec?.cuttingDepth&&{label:"Cutting",value:m.stumpGrinderSpec.cuttingDepth+'" depth'+(m.stumpGrinderSpec.cuttingWidth?" · "+m.stumpGrinderSpec.cuttingWidth+'" wide':"")},
    m.stumpGrinderSpec?.hours&&{label:"Hour Meter",value:m.stumpGrinderSpec.hours+"h"},
    m.stumpGrinderSpec?.teethLastReplaced&&{label:"Teeth Last Replaced",value:m.stumpGrinderSpec.teethLastReplaced},
  ].filter(Boolean);

  const timerRunning = m.jobTimers?.[0]?.status === "running";
  const svcStatus = getMachineServiceStatus(m);
  const specMatch = findMachineSpecMatch(m, searchQuery);

  const _jBase   = {cursor:"pointer",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:"9px 14px",borderRadius:2,fontFamily:"'IBM Plex Mono',monospace",border:"none",width:"100%",boxSizing:"border-box",minHeight:44,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center"};
  const _jAct    = {..._jBase,background:ACC,color:"#fff"};
  const _jEdit   = _jAct;
  const _jPdf    = _jAct;
  const _jWiki   = _jAct;
  const _jShare  = _jAct;
  const _jLayout = _jAct;
  const _jTile   = _jAct;
  const _jDel    = {..._jBase,background:RED,color:"#fff"};
  const _jClose  = {..._jBase,background:"transparent",border:"1px solid "+BRD,color:MUT};

  return (
    <div style={{background:SURF,border:"1px solid "+(timerRunning?GRN+"55":BRD),borderRadius:3,marginBottom:8,overflow:"hidden",boxShadow:timerRunning?"0 0 8px "+GRN+"22":undefined}}>
      {fullImg&&<PhotoViewer src={fullImg} onClose={()=>setFullImg(null)} />}
      {confirmDelete&&(
        <div style={ovly} onClick={()=>setConfirmDelete(false)}>
          <div style={mdl} onClick={ev=>ev.stopPropagation()}>
            <div style={mdlH}>
              <span style={{fontWeight:700,fontSize:13,color:TXT}}>Delete machine?</span>
              <button onClick={()=>setConfirmDelete(false)} style={{background:"none",border:"none",color:MUT,fontSize:16,cursor:"pointer",padding:"0 4px",lineHeight:1}}>✕</button>
            </div>
            <div style={mdlB}>
              <p style={{margin:"0 0 10px",fontSize:12,color:TXT}}><strong style={{color:RED}}>{m.name}</strong> and all associated data will be <strong>permanently deleted</strong>. This cannot be undone.</p>
              <p style={{margin:"0 0 6px",fontSize:11,color:MUT,fontWeight:600,letterSpacing:"0.04em"}}>WHAT WILL BE LOST</p>
              <ul style={{margin:"0 0 12px",paddingLeft:18,fontSize:11,color:TXT,lineHeight:"1.8"}}>
                <li>Service &amp; maintenance history</li>
                <li>Time logs and labour records</li>
                <li>Photos and attachments</li>
                <li>Storage bookings</li>
                <li>Client links</li>
                <li>Parts and stock records</li>
              </ul>
              <div style={{background:"#1a1a1a",border:"1px solid "+BRD,borderRadius:3,padding:"8px 10px",fontSize:11,color:MUT,marginBottom:timerRunning?10:0}}>
                📖 Wiki entries submitted from this machine will <strong style={{color:TXT}}>persist</strong> and remain publicly accessible.
              </div>
              {timerRunning&&(
                <div style={{background:"#1a1500",border:"1px solid "+GRN,borderRadius:3,padding:"8px 10px",fontSize:11,color:GRN,marginTop:10}}>
                  ⚠️ This machine has a running timer. Deleting will lose all unfinished time.
                </div>
              )}
            </div>
            <div style={{...mdlF,gap:8}}>
              <button style={{...btnG,flex:1}} onClick={()=>setConfirmDelete(false)}>Cancel</button>
              <button style={{...btnA,flex:1,background:RED,borderColor:RED,color:"#fff",fontWeight:700}} onClick={()=>{setConfirmDelete(false);onDelete(m);}}>Delete Forever</button>
            </div>
          </div>
        </div>
      )}
      {showEdit&&<MachineForm existing={m} onSave={u=>{onUpdate(u);setShowEdit(false);}} onClose={()=>setShowEdit(false)} company={company} units={profile?.units||"metric"} profile={profile} isGuest={isGuest}/>}
      {showWiki&&<WikiTrackerModal machine={m} profile={profile} onClose={()=>setShowWiki(false)}/>}
      {showConfig&&<TileConfig machine={m} onSave={u=>{onUpdate(u);setShowConfig(false);}} onClose={()=>setShowConfig(false)} />
      }
      {showExpandConfig&&<ExpandConfig machine={m} onSave={u=>{onUpdate(u);setShowExpandConfig(false);}} onClose={()=>setShowExpandConfig(false)} />}
      {(showSvc||editSvc)&&<ServiceModal machine={m} existing={editSvc} onSave={saveSvc} onClose={()=>{setShowSvc(false);setEditSvc(null);}} />}

      {/* ── Collapsed card — poster style ── */}
      <div onClick={()=>{
        if(hideCollapse) return;
        // Closing via tap must pop the {cardOpen} history entry we pushed on
        // open (mirrors PhotoViewer) or stale entries pile up on the stack.
        if(open&&history.state?.cardOpen===m.id){setOpen(false);history.back();}
        else setOpen(o=>!o);
      }} style={{cursor:hideCollapse?"default":"pointer",userSelect:"none"}}>

        {/* Hero photo / icon placeholder */}
        {m.photos?.[0]
          ? <div style={{position:"relative"}}>
              <img src={m.photos[0]} alt="" style={{width:"100%",height:170,objectFit:"cover",display:"block"}} />
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:"65%",background:"linear-gradient(to bottom, transparent, #161616)",pointerEvents:"none"}} />
            </div>
          : <div style={{width:"100%",height:120,background:"#0e0e0e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:56,borderBottom:"1px solid #1a1a1a"}}>{mIcon(m.type)}</div>}

        {/* Info panel */}
        <div style={{padding:"10px 12px 12px"}}>

          {/* Icon + name/subtitle row */}
          <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
            {m.photos?.[0]&&<span style={{fontSize:24,flexShrink:0,marginTop:2,lineHeight:1}}>{mIcon(m.type)}</span>}
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:6}}>
                <div className={timerRunning?"loading-rat":undefined} style={{flex:1,minWidth:0,fontSize:15,fontWeight:700,color:TXT,lineHeight:1.25}}>
                  {hl(m.name,searchTokens)}
                  {timerRunning&&<span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:GRN,boxShadow:"0 0 6px "+GRN,marginLeft:7,verticalAlign:"middle"}}/>}
                </div>
                {!hideCollapse&&<span style={{fontSize:10,color:"#555",flexShrink:0,marginTop:2,userSelect:"none"}}>{open?"▲":"▼"}</span>}
              </div>
              {[m.make,m.model,m.year,m.source].filter(Boolean).length>0&&
                <div style={{fontSize:11,color:MUT,marginTop:3,lineHeight:1.4}}>
                  {hl([m.make,m.model,m.year].filter(Boolean).join(" · "),searchTokens)}
                  {m.source&&<span style={{color:"#444"}}> · {hl(m.source,searchTokens)}</span>}
                </div>}
              {m.type&&<div style={{fontSize:9,color:"#555",marginTop:2,letterSpacing:"0.06em",textTransform:"uppercase"}}>{hl(m.type,searchTokens)}</div>}
            </div>
          </div>

          {/* Badges — full width below info */}
          <div style={{display:"flex",alignItems:"center",gap:4,marginTop:9,flexWrap:"wrap"}}>
            {(m.tileFields&&m.tileFields.length>0?m.tileFields:DEFAULT_TILE).map(k=>{
              const tc=m.tileColors||{};
              const colIdx=tc[k]!==undefined?tc[k]:(TILE_COLOR_DEFAULTS[k]!==undefined&&TILE_COLOR_DEFAULTS[k]!=="auto"?TILE_COLOR_DEFAULTS[k]:0);
              const [cbg,cbrd,ctxt]=BADGE_PALETTE[colIdx]||BADGE_PALETTE[0];
              const bStyle={fontSize:9,fontWeight:700,letterSpacing:"0.08em",padding:"3px 8px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",background:cbg,color:ctxt,border:"1px solid "+cbrd,whiteSpace:"nowrap"};
              if(k==="status"){const S=["Active","Queued","Complete"];const cur=m.status||"Active";const next=S[(S.indexOf(cur)+1)%S.length];return <StatusBadge key="status" status={cur} onClick={ev=>{ev.stopPropagation();const u={...m,status:next};upsertMachine(u).then(()=>onUpdate(u)).catch(()=>{});}} title={`Click to set ${next}`} />;};
              if(k==="strokeType"&&m.strokeType) return <span key="st" style={{fontSize:9,fontWeight:700,letterSpacing:"0.08em",padding:"3px 8px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",background:m.strokeType==="4-stroke"?"#0e1a2a":m.strokeType==="Diesel"?"#0e200e":"#1a0e00",color:m.strokeType==="4-stroke"?"#3a7bd5":m.strokeType==="Diesel"?"#3d9e50":"#e8670a",border:"1px solid "+(m.strokeType==="4-stroke"?"#3a7bd555":m.strokeType==="Diesel"?"#3d9e5055":"#e8670a55"),whiteSpace:"nowrap"}}>{m.strokeType==="4-stroke"?"4T":m.strokeType==="Diesel"?"DSL":"2T"}</span>;
              if(k==="rage"&&(m.rage||0)>0) return <span key="rage" style={{fontSize:10,letterSpacing:-2}}>{"☠️".repeat(m.rage)}</span>;
              const field=ALL_BADGE_FIELDS.find(f=>f.k===k);
              if(field&&m[k]){const lbl=(field.s?field.s.replace(":",""):field.l.split("/")[0].trim().split(" ").slice(0,2).join(" "));return <span key={k} style={bStyle}>{lbl}: {String(m[k]).slice(0,14)}</span>;}
              return null;
            })}
            {svcStatus.overdue&&<span style={{fontSize:9,fontWeight:700,letterSpacing:"0.08em",padding:"3px 8px",borderRadius:3,background:RED+"22",color:RED,border:"1px solid "+RED+"44",whiteSpace:"nowrap"}}>SERVICE</span>}
            {!svcStatus.overdue&&svcStatus.dueSoon&&<span style={{fontSize:9,fontWeight:700,letterSpacing:"0.08em",padding:"3px 8px",borderRadius:3,background:"#e8870a22",color:"#e8870a",border:"1px solid #e8870a44",whiteSpace:"nowrap"}}>DUE SOON</span>}
            {storagePolicyEnabled&&storageStatus?.active&&(storageStatus.escalated?<span style={{fontSize:8,fontWeight:700,letterSpacing:"0.08em",padding:"2px 7px",borderRadius:3,background:RED+"22",color:RED,border:"1px solid "+RED+"44",whiteSpace:"nowrap",boxShadow:"0 0 6px "+RED+"44"}}>⚠ FOR SALE</span>:storageStatus.freeDaysLeft>0?<span style={{fontSize:8,fontWeight:700,letterSpacing:"0.08em",padding:"2px 7px",borderRadius:3,background:GRN+"15",color:GRN,border:"1px solid "+GRN+"33",whiteSpace:"nowrap"}}>{storageStatus.freeDaysLeft}d free</span>:<span style={{fontSize:8,fontWeight:700,letterSpacing:"0.08em",padding:"2px 7px",borderRadius:3,background:ACC+"18",color:ACC,border:"1px solid "+ACC+"44",whiteSpace:"nowrap"}}>${storageStatus.accrued.toFixed(0)}</span>)}
          </div>

          {/* Client / due / stats */}
          {(clientName||m.dueDate||(m.timeLog||[]).reduce((s,e)=>s+(e.seconds||0),0)>0||(m.rage||0)>0)&&
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6,flexWrap:"wrap"}}>
              {clientName&&<span style={{fontSize:9,color:ACC,whiteSpace:"nowrap"}}>👤 {clientName}</span>}
              {m.dueDate&&(()=>{const due=new Date(m.dueDate);const now=new Date();const overdue=due<now;const dueColor=overdue?"#e87a0a":now.toDateString()===due.toDateString()?"#4a9eff":MUT;return<span style={{fontSize:9,color:dueColor,whiteSpace:"nowrap"}}>{overdue?"⚠ OVERDUE":"DUE "}{!overdue&&due.toLocaleDateString('en-AU',{day:'numeric',month:'short'})}</span>;})()}
              {(()=>{const tHrs=(m.timeLog||[]).reduce((s,e)=>s+(e.seconds||0),0)/3600;const hasHrs=tHrs>0;const hasRage=(m.rage||0)>0;if(!hasHrs&&!hasRage)return null;return<>{hasHrs&&<span style={{fontSize:9,color:GRN,fontFamily:"'IBM Plex Mono',monospace"}}>{tHrs.toFixed(1)}h</span>}{hasRage&&<span style={{fontSize:9,color:RED,letterSpacing:-1}}>{"☠️".repeat(m.rage)}</span>}</>;})()}
            </div>}

          {specMatch&&(
            <div style={{fontSize:9,color:MUT,marginTop:6,lineHeight:1.4}}>
              <span style={{color:ACC,textTransform:"uppercase",letterSpacing:"0.06em",fontSize:8}}>{specMatch.label}:</span>{" "}
              {hl(specMatch.value,searchTokens)}
            </div>
          )}

        </div>
      </div>

      {open&&(
        <div className="card-expand" style={{borderTop:"1px solid "+BRD2}}>
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
              {show("photos")&&m.photos?.length>0&&<div style={{padding:"10px 14px 0"}}><div style={{borderLeft:"2px solid "+ACC,paddingLeft:8}}><FL t="Photos" /></div><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginTop:4}}>{m.photos.map((p,i)=><div key={i}><img src={p} alt="" onClick={()=>setFullImg(p)} style={{width:"100%",height:80,objectFit:"cover",borderRadius:"2px 2px 0 0",border:i===0?"1px solid "+ACC+"88":"1px solid "+BRD,borderBottom:"none",cursor:"zoom-in",display:"block"}} /><button title={i===0?"Cover photo":"Set as cover"} onClick={ev=>{ev.stopPropagation();if(i===0)return;const r=[p,...m.photos.filter((_,j)=>j!==i)];onUpdate({...m,photos:r});}} style={{width:"100%",minHeight:34,background:i===0?ACC:"#1a1a1a",border:"1px solid "+(i===0?ACC:BRD),borderTop:"none",borderRadius:"0 0 2px 2px",cursor:i===0?"default":"pointer",fontSize:9,fontWeight:700,color:i===0?"#000":MUT,fontFamily:"'IBM Plex Mono',monospace",padding:4}}>{i===0?"★ Cover":"☆ Set as Cover"}</button></div>)}</div></div>}
              {show("desc")&&m.desc&&<div style={{padding:"10px 14px 0"}}><div style={{borderLeft:"2px solid "+ACC,paddingLeft:8}}><FL t="Description" /></div><div style={{fontSize:11,color:"#999",lineHeight:1.5,marginTop:2}}>{m.desc}</div></div>}
              {visibleSpecs.length>0&&<div style={{padding:"12px 14px 0"}}><div style={{borderLeft:"2px solid "+ACC,paddingLeft:8}}><SL t="Engine Spec" /></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>{visibleSpecs.map(s=><SpecCell key={s.label} label={s.label} value={s.value} highlight={s.highlight} />)}</div></div>}
              {show("fasteners")&&m.fasteners&&m.fasteners.length>0&&<div style={{padding:"12px 14px 0"}}>
                <div style={{borderLeft:"2px solid "+ACC,paddingLeft:8}}><SL t="Fastener Specs" /></div>
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
              {show("lighting")&&m.lighting?.length>0&&<div style={{padding:"12px 14px 0"}}>
                <div style={{borderLeft:"2px solid "+ACC,paddingLeft:8}}><SL t="Lighting" /></div>
                <div style={{marginTop:6}}>
                  {m.lighting.map((l,idx)=>{
                    const loc=l.location==="Other"?(l.locationOther||"Other"):(l.location||"—");
                    const parts=[l.lightType,l.wattage?l.wattage+"W":null,l.voltage,l.amperage?l.amperage+"A":null,l.plug].filter(Boolean);
                    return <div key={l.id||idx} style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"8px 10px",marginBottom:5}}>
                      <div style={{fontSize:8,color:ACC,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>{loc}</div>
                      <div style={{fontSize:11,color:TXT,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.6}}>{parts.length?parts.join(" · "):"No specs"}</div>
                      {l.notes&&<div style={{fontSize:10,color:MUT,marginTop:2}}>{l.notes}</div>}
                    </div>;
                  })}
                </div>
              </div>}
              {show("notes")&&m.notes&&<div style={{padding:"10px 14px 0"}}><div style={{borderLeft:"2px solid "+ACC,paddingLeft:8}}><FL t="Notes" /></div><div style={{fontSize:11,color:"#999",lineHeight:1.5,marginTop:2}}>{m.notes}</div></div>}
              {show("parts")&&m.parts?.length>0&&(
                <div style={{padding:"12px 14px 0"}}>
                  <div style={{borderLeft:"2px solid "+ACC,paddingLeft:8}}><SL t="Parts Used" /></div>
                  <div style={{marginTop:6}}>
                    {m.parts.map((p,idx)=>{
                      const qty=Number(p.qty)||1;
                      const buy=(parseFloat(p.buyPrice)||0)*qty;
                      const sell=(parseFloat(p.sellPrice)||0)*qty;
                      return <div key={p.id||idx} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #181818"}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:10,color:TXT,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                          <div style={{fontSize:8,color:MUT}}>{[p.partNumber,p.brand,`Qty ${qty}`].filter(Boolean).join(" · ")}</div>
                        </div>
                        <div style={{display:"flex",gap:6,flexShrink:0,marginLeft:8,alignItems:"center"}}>
                          {buy>0&&<span style={{fontSize:9,color:MUT}}>${buy.toFixed(2)}</span>}
                          {sell>0&&<span style={{fontSize:9,color:GRN}}>${sell.toFixed(2)}</span>}
                        </div>
                      </div>;
                    })}
                    <div style={{fontSize:9,color:GRN,textAlign:"right",marginTop:5,fontWeight:700}}>
                      ${m.parts.reduce((s,p)=>(s+(parseFloat(p.sellPrice)||0)*(Number(p.qty)||1)),0).toFixed(2)} total parts
                    </div>
                  </div>
                </div>
              )}
              <div style={{height:1,background:BRD2,margin:"12px 0 0"}} />
            </>;
          })()}

          {(()=>{const ef=m.expandFields&&m.expandFields.length>0?m.expandFields:DEFAULT_EXPAND;const showSvcH=ef.includes("serviceHistory");return showSvcH&&(
          <div style={{padding:"12px 14px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{borderLeft:"2px solid "+ACC,paddingLeft:8}}><SL t="Service History" /></div>
              <button style={{...btnA,...sm}} onClick={ev=>{ev.stopPropagation();setShowSvc(true);}}>+ Log</button>
            </div>
            {saving&&<div style={{fontSize:10,color:MUT,marginBottom:8}}>Saving...</div>}
            {!loaded&&<div style={{fontSize:10,color:MUT}}>Loading...</div>}
            {loaded&&svcs.length===0&&<Empty t="No entries yet" />}
            {loaded&&svcs.length>0&&(
              <div style={{borderLeft:"2px solid "+ACC+"33",paddingLeft:10,marginLeft:6}}>
                {svcs.map(svc=>(
                  <div key={svc.id} style={{position:"relative",paddingLeft:18,marginBottom:14}}>
                    <div style={{position:"absolute",left:-13,top:5,width:6,height:6,borderRadius:"50%",background:ACC,flexShrink:0}} />
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
          {storagePolicyEnabled&&(
            <div style={{padding:"0 14px 12px"}}>
              <div style={{borderLeft:"2px solid "+ACC,paddingLeft:8,marginBottom:10}}><SL t="Storage" /></div>
              {!booking&&!showBookIn&&(
                <button style={{width:"100%",background:"none",border:"1px solid "+BRD,borderRadius:3,padding:"16px 14px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:12,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:MUT,fontSize:12,minHeight:56}} onClick={ev=>{ev.stopPropagation();const now=new Date();const pad=n=>String(n).padStart(2,"0");setBookForm(f=>({...f,receivedAt:now.getFullYear()+"-"+pad(now.getMonth()+1)+"-"+pad(now.getDate())+"T"+pad(now.getHours())+":"+pad(now.getMinutes())}));setShowBookIn(true);}}>
                  <span style={{fontSize:28,lineHeight:1}}>📥</span>
                  Book In
                </button>
              )}
              {showBookIn&&(
                <div style={{background:"#0a0a0a",border:"1px solid "+BRD,borderRadius:3,padding:"16px 14px"}}>
                  <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:14}}>
                    <div>
                      <div style={{fontSize:9,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Storage Tier</div>
                      <select value={bookForm.storageTier} onChange={e=>setBookForm(f=>({...f,storageTier:e.target.value}))} style={{...inp,fontSize:13,padding:"12px 10px",minHeight:48}}>
                        {TIER_NAMES.map(t=><option key={t} value={t}>{t}{activeTiers[t]?.dailyRate!=null?" — $"+activeTiers[t].dailyRate+"/day after "+activeTiers[t].freeDays+"d free":""}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{fontSize:9,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Received</div>
                      <input type="datetime-local" value={bookForm.receivedAt} onChange={e=>setBookForm(f=>({...f,receivedAt:e.target.value}))} style={{...inp,fontSize:13,padding:"12px 10px",minHeight:48}} />
                    </div>
                    {bookForm.storageTier==="Custom"&&(
                      <div>
                        <div style={{fontSize:9,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Custom Daily Rate ($)</div>
                        <input type="number" min="0" step="0.01" value={bookForm.storageFeeOverride} onChange={e=>setBookForm(f=>({...f,storageFeeOverride:e.target.value}))} placeholder="0.00" style={{...inp,fontSize:13,padding:"12px 10px",minHeight:48}} />
                      </div>
                    )}
                    <div>
                      <div style={{fontSize:9,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Notes</div>
                      <input value={bookForm.notes} onChange={e=>setBookForm(f=>({...f,notes:e.target.value}))} placeholder="Optional" style={{...inp,fontSize:13,padding:"12px 10px",minHeight:48}} />
                    </div>
                  </div>
                  <label htmlFor={"se-"+m.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",cursor:"pointer",borderTop:"1px solid #1a1a1a",borderBottom:"1px solid #1a1a1a",marginBottom:14}}>
                    <input type="checkbox" id={"se-"+m.id} checked={bookForm.storageEnabled} onChange={e=>setBookForm(f=>({...f,storageEnabled:e.target.checked}))} style={{width:22,height:22,accentColor:ACC,cursor:"pointer",flexShrink:0}} />
                    <span style={{fontSize:12,color:MUT}}>Charge storage for this visit</span>
                  </label>
                  {bookErr&&<div style={{fontSize:9,color:RED,marginBottom:10}}>{bookErr}</div>}
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <button style={{...btnA,width:"100%",padding:"14px",fontSize:12,minHeight:50,display:"flex",alignItems:"center",justifyContent:"center",gap:8}} onClick={doBookIn} disabled={bookSaving}>
                      <span style={{fontSize:20}}>📥</span>{bookSaving?"Saving…":"Book In"}
                    </button>
                    <button style={{...btnG,width:"100%",padding:"12px",fontSize:11,minHeight:44}} onClick={()=>{setShowBookIn(false);setBookErr("");}}>Cancel</button>
                  </div>
                </div>
              )}
              {booking&&!showBookIn&&(
                <div style={{background:"#0a0a0a",border:"1px solid "+BRD,borderRadius:2,padding:"10px 12px"}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                        <span style={{fontSize:9,color:TXT,fontWeight:700}}>{booking.storage_tier} tier</span>
                        <span style={{fontSize:9,color:MUT}}>·</span>
                        <span style={{fontSize:9,color:MUT}}>{storageStatus?.daysIn??0}d in shop</span>
                        {storageStatus?.escalated&&<span style={{fontSize:8,color:RED,fontWeight:700,letterSpacing:"0.08em",background:RED+"18",border:"1px solid "+RED+"44",padding:"1px 5px",borderRadius:2,boxShadow:"0 0 6px "+RED+"44"}}>⚠ FOR SALE</span>}
                      </div>
                      {storageStatus?.active&&(
                        storageStatus.freeDaysLeft>0
                          ?<div style={{fontSize:9,color:GRN}}>{storageStatus.freeDaysLeft}d free remaining</div>
                          :<div style={{fontSize:9,color:storageStatus.escalated?RED:ACC}}>${storageStatus.accrued.toFixed(2)} accrued · ${storageStatus.dailyRate}/day</div>
                      )}
                      {!booking.storage_enabled&&<div style={{fontSize:8,color:MUT,marginTop:3,fontStyle:"italic"}}>Storage billing paused</div>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"flex-end"}}>
                      <button style={{...btnA,...sm,fontSize:8}} onClick={ev=>{ev.stopPropagation();doCollect();}}>✓ Collected</button>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8,paddingTop:8,borderTop:"1px solid "+BRD}}>
                    <input type="checkbox" id={"sb-"+m.id} checked={booking.storage_enabled} onChange={toggleStorageOnBooking} />
                    <label htmlFor={"sb-"+m.id} style={{fontSize:8,color:MUT,cursor:"pointer"}}>Charge storage for this visit</label>
                    <span style={{flex:1}}/>
                    <span style={{fontSize:8,color:MUT}}>in since {new Date(booking.received_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          {showPdfOpts&&<Suspense fallback={null}><PdfExportModal m={m} svcs={svcs} onClose={()=>setShowPdfOpts(false)}/></Suspense>}
          <div style={{padding:"0 10px 14px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
            {withGuide("all specs\n& intervals",<button style={_jEdit} onClick={ev=>{ev.stopPropagation();setShowEdit(true);}}>Edit Machine</button>)}
            {withGuide("export\nspec sheet",<button style={_jPdf} onClick={ev=>{ev.stopPropagation();if(!loaded){getServices(m.id).then(s=>{setSvcs(s||[]);setLoaded(true);setShowPdfOpts(true);});}else setShowPdfOpts(true);}}>📄 PDF</button>)}
            {!isGuest&&effectiveTier(profile,company)!=="free"&&m.make&&m.model&&<button style={_jWiki} onClick={ev=>{ev.stopPropagation();setShowWiki(true);}}>🌐 Wiki</button>}
            {withGuide("public\nlink ↗",<button style={_jShare} onClick={ev=>{ev.stopPropagation();navigator.clipboard.writeText(window.location.origin+'/m/'+m.id);setCopied(true);setTimeout(()=>setCopied(false),2000);}}>{copied?'✓ Copied':'🔗 Share'}</button>)}
            {withGuide("customise\nlayout",<button style={_jLayout} onClick={ev=>{ev.stopPropagation();setShowExpandConfig(true);}}>⚙️ Layout</button>)}
            {withGuide("configure\nbadges",<button style={_jTile} onClick={ev=>{ev.stopPropagation();setShowConfig(true);}}>⚙️ Tile</button>)}
            {onClose&&<button style={{..._jClose,gridColumn:"1/-1"}} onClick={ev=>{ev.stopPropagation();onClose();}}>✕ Close</button>}
            <button style={{..._jDel,gridColumn:"1/-1"}} onClick={ev=>{ev.stopPropagation();setConfirmDelete(true);}}>Delete</button>
          </div>
          {showGuide&&(
            <div style={{padding:"0 14px 14px",textAlign:"right"}}>
              <button onClick={ev=>{ev.stopPropagation();onTutDismiss?.();}} style={{background:"none",border:"none",color:"#333",fontSize:8,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",padding:0,letterSpacing:"0.05em"}}>got it</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default MachineCard;