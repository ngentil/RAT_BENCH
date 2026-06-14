import React from 'react';
import { MUT } from '../../lib/styles';
import { SCOL, SBG_ } from '../../lib/constants';
function StatusBadge({status, onClick, title}){
  return <span onClick={onClick} title={title} style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",padding:"3px 9px",borderRadius:2,fontFamily:"'IBM Plex Mono',monospace",background:SBG_[status]||"#222",color:SCOL[status]||MUT,border:"1px solid "+(SCOL[status]||MUT)+"88",cursor:onClick?"pointer":undefined}}>{status}</span>;
}
export default StatusBadge;