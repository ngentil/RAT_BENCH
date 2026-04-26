import React from 'react';
import { ACC, MUT, BRD, SURF, TXT } from '../../lib/styles';
import { MACHINE_TYPES } from '../../lib/constants';
// ── Tracker ───────────────────────────────────────────────────────────────────
function MachineTile({machine,onClick}){
  const m=machine;
  const photo=m.photos?.[0];
  const icon=MACHINE_TYPES.find(t=>t.label===m.type)?.icon||"⚙️";
  const sc=SCOL[m.status]||MUT;
  return(
    <div onClick={onClick} style={{background:SURF,border:"1px solid "+BRD,borderRadius:2,cursor:"pointer",overflow:"hidden",display:"flex",flexDirection:"column"}}>
      <div style={{height:90,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
        {photo
          ? <img src={photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <span style={{fontSize:28,opacity:0.4}}>{icon}</span>}
      </div>
      <div style={{padding:"8px 10px",flex:1}}>
        <div style={{fontSize:11,fontWeight:700,color:TXT,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.name||`${m.make||""} ${m.model||""}`.trim()||"Unnamed"}</div>
        {(m.make||m.model)&&<div style={{fontSize:9,color:MUT,marginBottom:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.make} {m.model}</div>}
        <span style={{fontSize:8,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:"2px 6px",borderRadius:2,background:SBG_[m.status]||"#222",color:sc,border:"1px solid "+sc+"55"}}>{m.status||"Active"}</span>
      </div>
    </div>
  );
}
export default MachineTile;