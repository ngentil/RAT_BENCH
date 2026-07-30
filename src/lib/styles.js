// Accent color is a per-user preference (Settings → Profile → Appearance),
// picked from the same swatches as the tile badges (ACCENT_PRESETS). It's
// read once here, synchronously, at module load — every ACC-derived value
// below (and every inline style elsewhere that reads ACC) bakes in whichever
// color was current on this page load. Changing it therefore takes a reload
// to apply everywhere, rather than needing every consumer of ACC across the
// app converted into something that re-renders live on change.
export const ACCENT_KEY = 'rat_accent_color';
export const DEFAULT_ACCENT = "#e8670a";
const storedAccent = (typeof localStorage !== 'undefined' && localStorage.getItem(ACCENT_KEY)) || DEFAULT_ACCENT;

export const BG="#0e0e0e",SURF="#161616",BRD="#252525",BRD2="#1e1e1e",
             TXT="#d8cfc4",MUT="#5a5a5a",ACC=storedAccent,GRN="#3d9e50",RED="#c94040";

// Blends each channel toward white by a flat amount (clamped) — the bright
// highlight stop in btnA's gradient used to be a hand-picked lighter orange;
// this derives an equivalent for whichever accent is current.
function lighten(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n>>16)&0xff) + amt);
  const g = Math.min(255, ((n>>8)&0xff) + amt);
  const b = Math.min(255, (n&0xff) + amt);
  return '#' + [r,g,b].map(c=>c.toString(16).padStart(2,'0')).join('');
}
// Scales each channel toward black — preserves hue better than a flat
// subtract once a channel is already low (e.g. teal's red channel), used for
// btnA's darker gradient stop and its shadow-rim edge.
function darken(hex, factor) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n>>16)&0xff) * factor);
  const g = Math.round(((n>>8)&0xff) * factor);
  const b = Math.round((n&0xff) * factor);
  return '#' + [r,g,b].map(c=>c.toString(16).padStart(2,'0')).join('');
}
const ACC_LIGHT  = lighten(ACC, 45);
const ACC_DARK   = darken(ACC, 0.85);
const ACC_SHADOW = darken(ACC, 0.5);

export const inp  = {background:"#0a0a0a",border:"1px solid "+BRD,color:TXT,fontFamily:"'IBM Plex Mono',monospace",fontSize:12,padding:"8px 10px",borderRadius:2,width:"100%",outline:"none",boxSizing:"border-box"};
export const sel  = {...inp};
export const txa  = {...inp,resize:"vertical",minHeight:60,lineHeight:1.5};
// Raised-bezel look: a gradient + paired inset highlight/shade instead of a
// flat fill, so it reads as a domed switch rather than a printed rectangle.
// The mechanical press (sink + darken) is the global button:active rule in
// index.css, so every button using this gets it automatically. Every color
// here derives from ACC (via lighten/darken above) rather than a hardcoded
// orange shade, so the whole bezel follows the chosen accent, not just its
// middle gradient stop.
export const btnA = {background:"linear-gradient(180deg, "+ACC_LIGHT+", "+ACC+" 45%, "+ACC_DARK+")",color:"#1a0a00",fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:"8px 14px",borderRadius:2,cursor:"pointer",border:"none",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 3px rgba(0,0,0,0.35), 0 2px 0 "+ACC_SHADOW+", 0 2px 2px rgba(0,0,0,0.4)",position:"relative",top:0};
export const btnG = {background:"none",border:"1px solid "+BRD,color:MUT,fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:"8px 14px",borderRadius:2,cursor:"pointer"};
export const btnD = {background:"none",border:"1px solid #3a1a1a",color:"#884040",fontFamily:"'IBM Plex Mono',monospace",fontSize:10,padding:"3px 8px",borderRadius:2,cursor:"pointer"};
export const sm   = {padding:"5px 10px",fontSize:10};
export const col  = {display:"flex",flexDirection:"column",marginBottom:10};
export const row  = {display:"flex",gap:8};
export const dvdr = {height:1,background:BRD2,margin:"12px 0"};
export const empt = {textAlign:"center",padding:"24px",color:MUT,fontSize:11,border:"1px dashed "+BRD,borderRadius:3};
export const ovly = {position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16};
export const mdl  = {background:SURF,border:"1px solid "+BRD,borderTop:"2px solid "+ACC,borderRadius:3,width:"100%",maxWidth:500,maxHeight:"92vh",overflowY:"auto"};
export const mdlH = {padding:"12px 16px",borderBottom:"1px solid "+BRD,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:SURF,zIndex:1};
export const mdlB = {padding:16};
export const mdlF = {padding:"10px 16px",borderTop:"1px solid "+BRD,display:"flex",gap:8,justifyContent:"flex-end",position:"sticky",bottom:0,background:SURF};
