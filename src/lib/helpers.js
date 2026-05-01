import { MACHINE_TYPES } from './constants';
// ── helpers ───────────────────────────────────────────────────────────────────
export const uid  = () => crypto.randomUUID();
export const nowL = () => { const n = new Date(); return new Date(n - n.getTimezoneOffset()*60000).toISOString().slice(0,16); };
export const fmtDT = iso => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU",{day:"2-digit",month:"short",year:"numeric"})
       + " " + d.toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit",hour12:true});
};
export const mIcon = t => MACHINE_TYPES.find(m => m.label === t)?.icon || "⚙️";

export const resizeImg = (b64, maxW=1800) => new Promise(res => {
  const img = new Image();
  img.onload = () => {
    const r = Math.min(1, maxW/img.width);
    const c = document.createElement("canvas");
    c.width = img.width*r; c.height = img.height*r;
    c.getContext("2d").drawImage(img,0,0,c.width,c.height);
    res(c.toDataURL("image/jpeg",0.92));
  };
  img.src = b64;
});
export const toB64 = f => new Promise((res,rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(f);
});

