import { MACHINE_TYPES } from './constants';
import { DEFAULT_STORAGE_TIERS } from './storageTiers';
// ── helpers ───────────────────────────────────────────────────────────────────
export const uid  = () => crypto.randomUUID();
export const nowL = () => { const n = new Date(); return new Date(n - n.getTimezoneOffset()*60000).toISOString().slice(0,16); };
export const fmtDT = iso => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU",{day:"2-digit",month:"short",year:"numeric"})
       + " " + d.toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit",hour12:true});
};
// Date only (no time) — shared across asset tabs
export const fmtDate = s => {
  if (!s) return null;
  return new Date(s).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
};
// Currency — shared across asset and customer tabs
export const fmtMoney = n => "$" + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

export function getStorageStatus(booking, tiers) {
  if (!booking || !booking.storage_enabled || booking.collected_at) {
    return { active: false, daysIn: 0, freeDaysLeft: 0, billableDays: 0, accrued: 0, escalated: false };
  }
  const T = tiers ?? DEFAULT_STORAGE_TIERS;
  const tier = T[booking.storage_tier] ?? T.Bench ?? DEFAULT_STORAGE_TIERS.Bench;
  const dailyRate = booking.storage_fee_override ?? tier.dailyRate;
  const daysIn = Math.floor((Date.now() - new Date(booking.received_at)) / 86400000);
  const freeDaysLeft = Math.max(0, (tier.freeDays ?? 0) - daysIn);
  const billableDays = Math.max(0, daysIn - (tier.freeDays ?? 0));
  const accrued = Math.max(tier.minFee ?? 0, billableDays * (dailyRate ?? 0));
  const escalated = tier.escalateDays != null && daysIn >= tier.escalateDays;
  return { active: true, daysIn, freeDaysLeft, billableDays, accrued, escalated, dailyRate, tier };
}

export function getClosedBookingFee(booking, tiers) {
  if (!booking || !booking.storage_enabled || !booking.collected_at) return 0;
  const T = tiers ?? DEFAULT_STORAGE_TIERS;
  const tier = T[booking.storage_tier] ?? T.Bench ?? DEFAULT_STORAGE_TIERS.Bench;
  const dailyRate = booking.storage_fee_override ?? tier.dailyRate;
  const daysIn = Math.floor((new Date(booking.collected_at) - new Date(booking.received_at)) / 86400000);
  const billableDays = Math.max(0, daysIn - (tier.freeDays ?? 0));
  return Math.max(tier.minFee ?? 0, billableDays * (dailyRate ?? 0));
}
