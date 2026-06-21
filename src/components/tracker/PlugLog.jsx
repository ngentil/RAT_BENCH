import React, { useState } from 'react';
import { upsertService } from '../../lib/db';
import { ACC, MUT, BRD, SURF, GRN, TXT, inp, sel, txa, btnA, btnG, col, sm } from '../../lib/styles';
import { SL, FL } from '../ui/shared';
import { mIcon, nowL, uid } from '../../lib/helpers';
import { uploadPhoto, deletePhoto } from '../../lib/storage';

function PlugLog({machines}){
  const [selId,setSelId]=useState("");
  const [ca,setCa]=useState(nowL());
  const [notes,setNotes]=useState("");
  const [photo,setPhoto]=useState(null);
  const [busy,setBusy]=useState(false);
  const [saved,setSaved]=useState(false);
  const machine=machines.find(m=>m.id===selId)||null;

  const handlePhoto=async e=>{const f=e.target.files[0];if(!f)return;setBusy(true);if(photo)deletePhoto(photo);try{setPhoto(await uploadPhoto(f));}catch{setPhoto(null);}setBusy(false);setSaved(false);};
  const doSave=async()=>{
    if(!machine||!photo)return;
    const entry={id:uid(),completedAt:ca,types:["Spark Plug"],notes:notes.trim(),plugPhoto:photo,jobPhotos:[],createdAt:new Date().toISOString()};
    await upsertService(machine.id,entry);
    setSaved(true);setPhoto(null);setNotes("");setCa(nowL());
  };

  return (
    <div style={{padding:16,flex:1,overflowY:'auto'}}>
      <SL t="Spark Plug Log" />
      <div style={{fontSize:9,color:MUT,lineHeight:1.7,marginBottom:16}}>
        Photograph the plug at service time to build a visual history per machine.
      </div>
      <div style={col}>
        <FL t="Machine" />
        {machines.length===0
          ?<div style={{fontSize:10,color:MUT,padding:'24px 0',textAlign:'center'}}><div style={{fontSize:22,marginBottom:8}}>🔩</div>Add a machine in the Tracker tab first.</div>
          :<select style={sel} value={selId} onChange={e=>{setSelId(e.target.value);setSaved(false);}}>
            <option value="">— Select machine —</option>
            {machines.map(m=><option key={m.id} value={m.id}>{mIcon(m.type)} {m.name}</option>)}
          </select>}
      </div>
      {machine&&(
        <div style={{background:SURF,border:'1px solid #252525',borderTop:'2px solid '+ACC,borderRadius:2,padding:'14px',marginTop:4}}>
          <div style={{fontSize:9,color:ACC,letterSpacing:'0.15em',textTransform:'uppercase',fontWeight:700,marginBottom:12}}>{machine.name}</div>
          <div style={col}><FL t="Completed" /><input type="datetime-local" style={inp} value={ca} onChange={e=>setCa(e.target.value)} /></div>
          <div style={col}>
            <FL t="Plug Photo" />
            <div style={{border:'1px dashed '+(photo?ACC+'44':BRD),borderRadius:2,padding:14,textAlign:'center',cursor:'pointer',position:'relative',background:photo?'transparent':'#0a0a0a'}} onClick={ev=>ev.stopPropagation()}>
              <input type="file" accept="image/*" onChange={handlePhoto}
                style={{position:'absolute',inset:0,opacity:0,cursor:'pointer',width:'100%',height:'100%'}} />
              {busy?<span style={{fontSize:9,color:MUT}}>Processing…</span>
                :photo?<img src={photo} alt="" style={{width:'100%',maxHeight:180,objectFit:'cover',borderRadius:2}} />
                :<div><div style={{fontSize:26,marginBottom:6}}>📷</div><span style={{fontSize:9,color:MUT,letterSpacing:'0.1em',textTransform:'uppercase'}}>Tap to photograph plug</span></div>}
            </div>
            {photo&&<button style={{...btnG,...sm,marginTop:5}} onClick={()=>{deletePhoto(photo);setPhoto(null);setSaved(false);}}>Retake</button>}
          </div>
          <div style={col}><FL t="Notes (optional)" /><textarea style={txa} placeholder="Gap, brand, condition reading…" value={notes} onChange={e=>{setNotes(e.target.value);setSaved(false);}} /></div>
          {saved&&(
            <div style={{background:'#0a1a0a',border:'1px solid '+GRN+'44',borderRadius:2,padding:'8px 12px',fontSize:10,color:GRN,marginBottom:12,display:'flex',alignItems:'center',gap:6}}>
              <span>✓</span> Logged to <strong>{machine.name}</strong>
            </div>
          )}
          <button style={{...btnA,width:'100%',opacity:!photo?0.4:1}} onClick={doSave} disabled={!photo}>
            Save to {machine.name}
          </button>
        </div>
      )}
    </div>
  );
}
export default PlugLog;
