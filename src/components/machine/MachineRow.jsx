import React from 'react';
import { ACC, MUT, BRD, SURF, TXT, RED, GRN } from '../../lib/styles';
import { DEFAULT_TILE, ALL_BADGE_FIELDS, BADGE_PALETTE, TILE_COLOR_DEFAULTS } from '../../lib/constants';
import { getMachineServiceStatus, mIcon, findMachineSpecMatch } from '../../lib/helpers';
import { hl } from '../wiki/wikiSearchHighlight';
import StatusBadge from '../ui/StatusBadge';

function MachineRow({ machine: m, onClick, clientName, searchQuery, searchTokens }) {
  const svc = getMachineServiceStatus(m);
  const timerRunning = (m.jobTimers||[]).some(t=>t.status==="running");
  const hrs = (m.timeLog||[]).reduce((s,e)=>s+(e.seconds||0),0)/3600;
  const specMatch = findMachineSpecMatch(m, searchQuery);
  return (
    <div onClick={onClick} style={{background:SURF,borderBottom:"1px solid "+BRD,padding:"10px 12px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:10,userSelect:"none"}}>
      <span style={{fontSize:22,flexShrink:0,lineHeight:1,marginTop:3}}>{mIcon(m.type)}</span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:700,color:TXT,lineHeight:1.2}}>
          {hl(m.name,searchTokens)}
          {timerRunning&&<span style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:GRN,boxShadow:"0 0 5px "+GRN,marginLeft:6,verticalAlign:"middle"}}/>}
        </div>
        {[m.make,m.model,m.year,m.source].filter(Boolean).length>0&&
          <div style={{fontSize:10,color:MUT,marginTop:2}}>
            {hl([m.make,m.model,m.year].filter(Boolean).join(" · "),searchTokens)}
            {m.source&&<span style={{color:"#444"}}> · {hl(m.source,searchTokens)}</span>}
          </div>}
        {m.type&&<div style={{fontSize:8,color:"#555",letterSpacing:"0.06em",textTransform:"uppercase",marginTop:1}}>{hl(m.type,searchTokens)}</div>}
        <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap",alignItems:"center"}}>
          <StatusBadge status={m.status||"Active"}/>
          {(m.tileFields&&m.tileFields.length>0?m.tileFields:DEFAULT_TILE).map(k=>{
            if(k==="status") return null;
            const tc=m.tileColors||{};
            const colIdx=tc[k]!==undefined?tc[k]:(TILE_COLOR_DEFAULTS[k]!==undefined&&TILE_COLOR_DEFAULTS[k]!=="auto"?TILE_COLOR_DEFAULTS[k]:0);
            const [cbg,cbrd,ctxt]=BADGE_PALETTE[colIdx]||BADGE_PALETTE[0];
            const bStyle={fontSize:9,fontWeight:700,letterSpacing:"0.08em",padding:"2px 6px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",background:cbg,color:ctxt,border:"1px solid "+cbrd,whiteSpace:"nowrap"};
            if(k==="strokeType"&&m.strokeType) return <span key="st" style={{fontSize:9,fontWeight:700,letterSpacing:"0.08em",padding:"2px 6px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",background:m.strokeType==="4-stroke"?"#0e1a2a":m.strokeType==="Diesel"?"#0e200e":"#1a0e00",color:m.strokeType==="4-stroke"?"#3a7bd5":m.strokeType==="Diesel"?"#3d9e50":"#e8670a",border:"1px solid "+(m.strokeType==="4-stroke"?"#3a7bd555":m.strokeType==="Diesel"?"#3d9e5055":"#e8670a55"),whiteSpace:"nowrap"}}>{m.strokeType==="4-stroke"?"4T":m.strokeType==="Diesel"?"DSL":"2T"}</span>;
            if(k==="rage"&&(m.rage||0)>0) return <span key="rage" style={{fontSize:9,letterSpacing:-1}}>{"☠️".repeat(m.rage)}</span>;
            const field=ALL_BADGE_FIELDS.find(f=>f.k===k);
            if(field&&m[k]) return <span key={k} style={bStyle}>{(field.s?field.s.replace(":",""):field.l.split("/")[0].trim().split(" ").slice(0,2).join(" "))}: {String(m[k]).slice(0,14)}</span>;
            return null;
          })}
          {svc.overdue&&<span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:3,background:RED+"22",color:RED,border:"1px solid "+RED+"44"}}>SERVICE</span>}
          {!svc.overdue&&svc.dueSoon&&<span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:3,background:"#e8870a22",color:"#e8870a",border:"1px solid #e8870a44"}}>DUE SOON</span>}
          {clientName&&<span style={{fontSize:9,color:ACC}}>👤 {clientName}</span>}
          {m.dueDate&&(()=>{const due=new Date(m.dueDate);const ov=due<new Date();return<span style={{fontSize:9,color:ov?"#e87a0a":MUT}}>{ov?"⚠ OVERDUE":"DUE "+due.toLocaleDateString('en-AU',{day:'numeric',month:'short'})}</span>;})()}
          {hrs>0&&<span style={{fontSize:9,color:GRN,fontFamily:"'IBM Plex Mono',monospace"}}>{hrs.toFixed(1)}h</span>}
          {(m.rage||0)>0&&<span style={{fontSize:9,letterSpacing:-1}}>{"☠️".repeat(m.rage)}</span>}
        </div>
        {specMatch&&(
          <div style={{fontSize:9,color:MUT,marginTop:4,lineHeight:1.4}}>
            <span style={{color:ACC,textTransform:"uppercase",letterSpacing:"0.06em",fontSize:8}}>{specMatch.label}:</span>{" "}
            {hl(specMatch.value,searchTokens)}
          </div>
        )}
      </div>
      <span style={{fontSize:10,color:"#555",flexShrink:0,marginTop:4}}>▶</span>
    </div>
  );
}

export default MachineRow;
