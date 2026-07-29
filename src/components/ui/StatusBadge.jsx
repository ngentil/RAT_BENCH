import React from 'react';
import { GRN } from '../../lib/styles';
// Renders nothing unless the job is marked complete — "in Garage, not on the
// Bench" already communicates queued/in-progress by which tab you're looking
// at, so the only state left worth badging is "done, ready for pickup."
function StatusBadge({complete, compact=false, padding}){
  if(!complete) return null;
  const pad = padding || (compact ? "3px 8px" : "3px 9px");
  return <span style={{fontSize:compact?9:10,fontWeight:700,letterSpacing:compact?"0.08em":"0.12em",textTransform:"uppercase",padding:pad,borderRadius:compact?3:2,fontFamily:"'IBM Plex Mono',monospace",background:GRN+"22",color:GRN,border:"1px solid "+GRN+"55"}}>✓ Ready</span>;
}
export default StatusBadge;
