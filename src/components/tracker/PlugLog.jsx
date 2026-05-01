import React, { useState } from 'react';
import { upsertService } from '../../lib/db';
import { ACC, MUT, BRD, GRN, inp, sel, txa, btnA, btnG, col, sm } from '../../lib/styles';
import { STATUSES } from '../../lib/constants';
import { SL, FL } from '../ui/shared';
import { mIcon, nowL, uid, resizeImg, toB64 } from '../../lib/helpers';

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
export default PlugLog;
