import React from 'react';
import { MUT } from '../../lib/styles';
import { SCOL, SBG_ } from '../../lib/constants';
// compact: matches the sizing of the other tile badges (bStyle in
// MachineCard/MachineRow/MachinePhotoRow) so Status doesn't stand out as
// slightly wider when shown alongside them. JobBoard's standalone usage
// keeps the original, larger sizing.
function StatusBadge({status, onClick, title, compact=false}){
  return <span onClick={onClick} title={title} style={{fontSize:compact?9:10,fontWeight:700,letterSpacing:compact?"0.08em":"0.12em",textTransform:"uppercase",padding:compact?"3px 8px":"3px 9px",borderRadius:compact?3:2,fontFamily:"'IBM Plex Mono',monospace",background:SBG_[status]||"#222",color:SCOL[status]||MUT,border:"1px solid "+(SCOL[status]||MUT)+"88",cursor:onClick?"pointer":undefined}}>{status}</span>;
}
export default StatusBadge;