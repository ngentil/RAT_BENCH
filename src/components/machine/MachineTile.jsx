import React from 'react';
import { ACC, MUT, BRD, SURF, TXT, GRN, RED } from '../../lib/styles';
import { MACHINE_TYPES, SCOL, SBG_ } from '../../lib/constants';
import { getMachineServiceStatus } from '../../lib/helpers';
// ── Tracker ───────────────────────────────────────────────────────────────────
function MachineTile({machine,onClick}){
  const m=machine;
  const photo=m.photos?.[0];
  const icon=MACHINE_TYPES.find(t=>t.label===m.type)?.icon||"⚙️";
  const sc=SCOL[m.status]||MUT;
  const timerRunning=m.jobTimer?.status==="running";
  const svcStatus=getMachineServiceStatus(m);
  return(
    <div onClick={onClick} style={{background:SURF,border:"1px solid "+(timerRunning?GRN+"55":BRD),borderRadius:2,cursor:"pointer",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:timerRunning?"0 0 8px "+GRN+"33":undefined}}>
      <div style={{height:90,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,position:"relative"}}>
        {photo
          ? <img src={photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <span style={{fontSize:28,opacity:0.4}}>{icon}</span>}
        {timerRunning&&<span style={{position:"absolute",top:5,right:5,width:8,height:8,borderRadius:"50%",background:GRN,boxShadow:"0 0 6px "+GRN,display:"block"}}/>}
      </div>
      <div style={{padding:"8px 10px",flex:1}}>
        <div style={{fontSize:11,fontWeight:700,color:TXT,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.name||`${m.make||""} ${m.model||""}`.trim()||"Unnamed"}</div>
        {(m.make||m.model)&&<div style={{fontSize:9,color:MUT,marginBottom:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.make} {m.model}</div>}
        <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
          <span style={{fontSize:8,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:"2px 6px",borderRadius:2,background:SBG_[m.status]||"#222",color:sc,border:"1px solid "+sc+"55"}}>{m.status||"Active"}</span>
          {timerRunning&&<span style={{fontSize:7,fontWeight:700,letterSpacing:"0.08em",color:GRN}}>TIMER ON</span>}
          {svcStatus.overdue&&<span style={{fontSize:7,fontWeight:700,letterSpacing:"0.08em",padding:"2px 4px",borderRadius:2,background:RED+"22",color:RED,border:"1px solid "+RED+"44"}}>SERVICE</span>}
          {!svcStatus.overdue&&svcStatus.dueSoon&&<span style={{fontSize:7,fontWeight:700,letterSpacing:"0.08em",padding:"2px 4px",borderRadius:2,background:"#e8870a22",color:"#e8870a",border:"1px solid #e8870a44"}}>DUE SOON</span>}
        </div>
      </div>
    </div>
  );
}
export default MachineTile;