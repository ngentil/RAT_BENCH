import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, TXT, inp, sel, txa, btnA, btnG, col, dvdr, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { SVC_CATEGORIES } from '../../lib/constants';
// ── Service Modal ─────────────────────────────────────────────────────────────
function ServiceModal({machine,existing,onSave,onClose}){
  const e=existing||{};
  const [ca,setCa]=useState(e.completedAt||nowL());
  const [types,setTy]=useState(e.types||[]);
  const [notes,setNo]=useState(e.notes||"");
  const [pp,setPp]=useState(e.plugPhoto||null);
  const [jp,setJp]=useState(e.jobPhotos||[]);
  const [pb,setPb]=useState(false);
  const [openCats,setOpenCats]=useState({general:true});
  const tog=t=>setTy(prev=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t]);
  const togCat=id=>setOpenCats(prev=>({...prev,[id]:!prev[id]}));
  const handlePlug=async ev=>{const f=ev.target.files[0];if(!f)return;setPb(true);setPp(await resizeImg(await toB64(f)));setPb(false);};
  const save=()=>onSave({id:e.id||uid(),completedAt:ca,types:types.length?types:["General Service"],
    notes:notes.trim(),plugPhoto:pp,jobPhotos:jp,
    createdAt:e.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()});

  const mType = machine.type||"";
  const sType = machine.strokeType||"";

  const visibleCats = SVC_CATEGORIES.filter(cat=>cat.show(mType,sType));

  return (
    <div style={ovly} onClick={onClose}>
      <div style={mdl} onClick={ev=>ev.stopPropagation()}>
        <div style={mdlH}>
          <b style={{fontSize:14,textTransform:"uppercase"}}>{existing?"Edit Entry":"Log Service"}</b>
          <button style={{...btnG,...sm}} onClick={onClose}>✕</button>
        </div>
        <div style={mdlB}>
          <div style={{fontSize:11,color:MUT,marginBottom:10}}>{mIcon(machine.type)} {machine.name}</div>
          <div style={col}><FL t="Completed" /><input type="datetime-local" style={inp} value={ca} onChange={ev=>setCa(ev.target.value)} /></div>

          {types.length>0&&<div style={{marginBottom:10,padding:"8px 10px",background:"#0d0d0d",border:"1px solid "+BRD,borderRadius:2}}>
            <div style={{fontSize:8,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Selected ({types.length})</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {types.map(t=><span key={t} onClick={()=>tog(t)} style={{fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:2,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",textTransform:"uppercase",background:"#2a1200",border:"1px solid "+ACC,color:ACC}}>✕ {t}</span>)}
            </div>
          </div>}

          <FL t="Work Done" />
          <div style={{marginBottom:12}}>
            {visibleCats.map(cat=>{
              const items = typeof cat.items==="function" ? cat.items(mType,sType) : cat.items;
              if(!items||items.length===0) return null;
              const catSelected = items.filter(i=>types.includes(i)).length;
              const isOpen = openCats[cat.id];
              return (
                <div key={cat.id} style={{marginBottom:4,border:"1px solid "+(catSelected>0?ACC+"44":BRD),borderRadius:2,overflow:"hidden"}}>
                  <div onClick={()=>togCat(cat.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",cursor:"pointer",background:catSelected>0?"#1a0a00":"#0a0a0a",userSelect:"none"}}>
                    <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:catSelected>0?ACC:MUT}}>{cat.label}{catSelected>0&&<span style={{marginLeft:6,fontSize:8,background:ACC,color:"#fff",borderRadius:2,padding:"1px 5px"}}>{catSelected}</span>}</span>
                    <span style={{color:MUT,fontSize:11}}>{isOpen?"▲":"▼"}</span>
                  </div>
                  {isOpen&&<div style={{padding:"8px 10px",display:"flex",flexWrap:"wrap",gap:5,borderTop:"1px solid "+BRD}}>
                    {items.map(t=>(
                      <button key={t} onClick={()=>tog(t)} style={{fontSize:9,fontWeight:600,padding:"4px 8px",borderRadius:2,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",textTransform:"uppercase",background:types.includes(t)?"#2a1200":"none",border:types.includes(t)?"1px solid "+ACC:"1px solid "+BRD,color:types.includes(t)?ACC:MUT}}>
                        {t}
                      </button>
                    ))}
                  </div>}
                </div>
              );
            })}
          </div>

          <div style={col}><FL t="Notes" /><textarea style={txa} placeholder="What was found, done, part numbers..." value={notes} onChange={ev=>setNo(ev.target.value)} /></div>
          {sType!=="Electric"&&sType!=="Diesel"&&<div style={col}>
            <FL t="Spark Plug Photo" />
            {pp&&<img src={pp} alt="" style={{width:"100%",maxHeight:120,objectFit:"cover",borderRadius:2,marginBottom:6}} />}
            {pb?<div style={{fontSize:9,color:MUT,textAlign:"center",padding:"8px 0"}}>Processing...</div>:
            <div style={{display:"flex",gap:6}} onClick={ev=>ev.stopPropagation()}>
              <input id="plugCam" type="file" accept="image/*" capture="environment" onChange={handlePlug} style={{display:"none"}} />
              <input id="plugGal" type="file" accept="image/*" onChange={handlePlug} style={{display:"none"}} />
              <button onClick={()=>document.getElementById("plugCam").click()} style={{...btnG,flex:1,fontSize:9,padding:"8px 0"}}>📷 Camera</button>
              <button onClick={()=>document.getElementById("plugGal").click()} style={{...btnG,flex:1,fontSize:9,padding:"8px 0"}}>🖼 Gallery</button>
            </div>}
            {pp&&<button style={{...btnG,...sm,marginTop:5}} onClick={()=>setPp(null)}>Remove</button>}
          </div>}
          <PhotoAdder photos={jp} setPhotos={setJp} label="Job Photos" />
        </div>
        <div style={mdlF}>
          <button style={btnG} onClick={onClose}>Cancel</button>
          <button style={btnA} onClick={save}>{existing?"Save Changes":"Save Entry"}</button>
        </div>
      </div>
    </div>
  );
}

export default ServiceModal;