import React from 'react';
import { ACC, MUT, BRD, SURF, TXT, GRN, RED } from '../../lib/styles';
import { MACHINE_TYPES, SCOL, SBG_ } from '../../lib/constants';
import { getMachineServiceStatus, findMachineSpecMatch } from '../../lib/helpers';
import { hl } from '../wiki/wikiSearchHighlight';
// ── Tracker ───────────────────────────────────────────────────────────────────
function MachineTile({machine,onClick,clientName,searchQuery,searchTokens}){
  const m=machine;
  const photo=m.photos?.[0];
  const icon=MACHINE_TYPES.find(t=>t.label===m.type)?.icon||"⚙️";
  const sc=SCOL[m.status]||MUT;
  const timerRunning=m.jobTimer?.status==="running";
  const svcStatus=getMachineServiceStatus(m);
  const specMatch=findMachineSpecMatch(m,searchQuery);
  return(
    <div onClick={onClick} style={{background:SURF,border:"1px solid "+(timerRunning?GRN+"55":BRD),borderLeft:"3px solid "+sc,borderRadius:2,cursor:"pointer",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:timerRunning?"0 0 8px "+GRN+"33":undefined}}>
      <div style={{height:90,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,position:"relative"}}>
        {photo
          ? <img src={photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <span style={{fontSize:28,opacity:0.4}}>{icon}</span>}
        {timerRunning&&<span style={{position:"absolute",top:5,right:5,width:8,height:8,borderRadius:"50%",background:GRN,boxShadow:"0 0 6px "+GRN,display:"block"}}/>}
      </div>
      <div style={{padding:"8px 10px",flex:1}}>
        <div style={{fontSize:12,fontWeight:700,color:TXT,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{hl(m.name||`${m.make||""} ${m.model||""}`.trim()||"Unnamed",searchTokens)}</div>
        {(m.make||m.model)&&<div style={{fontSize:9,color:MUT,marginBottom:clientName?2:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{hl(`${m.make||""} ${m.model||""}`.trim(),searchTokens)}</div>}
        {clientName&&<div style={{fontSize:10,color:ACC,marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>👤 {clientName}</div>}
        {m.shared&&<div style={{fontSize:10,color:ACC,marginBottom:3}}>SHARED</div>}
        {(m.rage||0)>0&&<div style={{display:"flex",alignItems:"center",gap:3,marginBottom:3}}><span style={{fontSize:9,color:RED,letterSpacing:-1}}>{"☠️".repeat(m.rage)}</span></div>}
        <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:"2px 6px",borderRadius:2,background:SBG_[m.status]||"#222",color:sc,border:"1px solid "+sc+"55"}}>{m.status||"Active"}</span>
          {timerRunning&&<span style={{fontSize:9,fontWeight:700,letterSpacing:"0.08em",color:GRN}}>TIMER ON</span>}
          {svcStatus.overdue&&<span style={{fontSize:9,fontWeight:700,letterSpacing:"0.08em",padding:"2px 4px",borderRadius:2,background:RED+"22",color:RED,border:"1px solid "+RED+"44"}}>SERVICE</span>}
          {!svcStatus.overdue&&svcStatus.dueSoon&&<span style={{fontSize:9,fontWeight:700,letterSpacing:"0.08em",padding:"2px 4px",borderRadius:2,background:"#e8870a22",color:"#e8870a",border:"1px solid #e8870a44"}}>DUE SOON</span>}
        </div>
        {specMatch&&(
          <div style={{fontSize:9,color:MUT,marginTop:4,lineHeight:1.4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
            <span style={{color:ACC,textTransform:"uppercase",letterSpacing:"0.06em",fontSize:8}}>{specMatch.label}:</span>{" "}
            {hl(specMatch.value,searchTokens)}
          </div>
        )}
      </div>
    </div>
  );
}
export default MachineTile;