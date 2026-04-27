import React from 'react';
import { upsertMachine } from '../../lib/db';
import { ACC, MUT, BRD, SURF, TXT, btnG, sm } from '../../lib/styles';
import { STATUSES, SCOL, SBG_ } from '../../lib/constants';
import { SL, Empty, SkullRating, Divider } from '../ui/shared';
import { mIcon } from '../../lib/helpers';
import StatusBadge from '../ui/StatusBadge';

function JobBoard({machines,setMachines}){
  const updateStatus=async(m,status)=>{const u={...m,status};await upsertMachine(u);setMachines(prev=>prev.map(x=>x.id===m.id?u:x));};
  const updateRage=async(m,rage)=>{const u={...m,rage};await upsertMachine(u);setMachines(prev=>prev.map(x=>x.id===m.id?u:x));};
  const groups=STATUSES.map(s=>({status:s,items:machines.filter(m=>(m.status||"Active")===s)}));
  return (
    <div style={{padding:16,flex:1}}>
      <SL t="Job Board" />
      {machines.length===0&&<Empty t="No machines yet" />}
      {groups.map(({status,items})=>items.length===0?null:(
        <div key={status} style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <StatusBadge status={status} />
            <span style={{fontSize:9,color:MUT,letterSpacing:"0.1em"}}>{items.length} machine{items.length!==1?"s":""}</span>
          </div>
          {items.map(m=>(
            <div key={m.id} style={{background:SURF,border:"1px solid "+BRD,borderRadius:3,marginBottom:8,padding:"13px 14px"}}>
              <div style={{display:"flex",gap:10}}>
                <span style={{fontSize:17}}>{mIcon(m.type)}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:TXT,marginBottom:2}}>{m.name}</div>
                  <div style={{fontSize:9,color:MUT,marginBottom:8}}>{[m.source,m.make,m.model].filter(Boolean).join("  ·  ")}</div>
                  {m.notes&&<div style={{fontSize:11,color:"#777",lineHeight:1.5,marginBottom:8}}>{m.notes}</div>}
                  <SkullRating value={m.rage||0} onChange={r=>updateRage(m,r)} />
                  <Divider />
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {STATUSES.filter(s=>s!==status).map(s=>(
                      <button key={s} onClick={()=>updateStatus(m,s)} style={{fontSize:8,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:"4px 9px",borderRadius:2,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",background:SBG_[s],color:SCOL[s],border:"1px solid "+SCOL[s]+"55"}}>
                        → {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
export default JobBoard;
