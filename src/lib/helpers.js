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


export function getMachineServiceStatus(machine) {
  const totalHrs = (machine.timeLog || []).reduce((s, e) => s + (e.seconds || 0), 0) / 3600;
  const lastDate = machine.lastServiceDate;
  const lastOdo  = parseFloat(machine.lastServiceOdo) || 0;
  let overdue = false, dueSoon = false;

  function check(interval, unit) {
    if (!interval) return;
    const n = parseFloat(interval);
    if (!n || isNaN(n)) return;
    const isHours = !unit || unit === "hours";
    if (isHours) {
      const dueAt = lastOdo > 0 ? lastOdo + n : n;
      const pct = totalHrs / dueAt;
      if (totalHrs >= dueAt) overdue = true;
      else if (pct >= 0.8) dueSoon = true;
    } else {
      if (!lastDate) return;
      const daysSince = Math.floor((Date.now() - new Date(lastDate)) / 86400000);
      const dueDays = n * 30;
      const pct = daysSince / dueDays;
      if (daysSince >= dueDays) overdue = true;
      else if (pct >= 0.8) dueSoon = true;
    }
  }

  check(machine.oilChangeInterval,   machine.oilChangeUnit);
  check(machine.filterInterval,       machine.filterIntervalUnit);
  check(machine.majorServiceInterval, machine.majorServiceUnit);

  return { overdue, dueSoon };
}
