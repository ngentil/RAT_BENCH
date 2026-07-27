import React from 'react';
import { MUT } from '../../lib/styles';
import { SCOL, SBG_ } from '../../lib/constants';
// compact: matches the sizing of the other tile badges (bStyle in
// MachineCard/MachineRow/MachinePhotoRow) so Status doesn't stand out as
// slightly wider/taller when shown alongside them. JobBoard's standalone
// usage keeps the original, larger sizing. Padding differs between those
// three callers' own bStyle ("3px 8px" in MachineCard vs "2px 6px" in the
// two list rows) so it's a separate override rather than baked into compact.
function StatusBadge({status, onClick, title, compact=false, padding}){
  const pad = padding || (compact ? "3px 8px" : "3px 9px");
  return <span onClick={onClick} title={title} style={{fontSize:compact?9:10,fontWeight:700,letterSpacing:compact?"0.08em":"0.12em",textTransform:"uppercase",padding:pad,borderRadius:compact?3:2,fontFamily:"'IBM Plex Mono',monospace",background:SBG_[status]||"#222",color:SCOL[status]||MUT,border:"1px solid "+(SCOL[status]||MUT)+"88",cursor:onClick?"pointer":undefined}}>{status}</span>;
}
export default StatusBadge;