import { MACHINE_TYPES } from './constants';
import { DEFAULT_STORAGE_TIERS } from './storageTiers';
import { parseLocalDate } from './dates';
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
  const d = parseLocalDate(s);
  if (!d) return null;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
};
// Currency — shared across asset and customer tabs
export const fmtMoney = n => {
  const v = Number(n);
  if (!isFinite(v)) return "$0.00";
  const sign = v < 0 ? "-" : "";
  return sign + "$" + Math.abs(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
// Escape LIKE/ILIKE wildcards in user input before .ilike()/.like() queries.
export const escapeLike = s => String(s ?? "").replace(/[\\%_]/g, m => "\\" + m);
// Robust numeric input parser for price/qty/spec fields.
// Handles "$120", "1,500", rejects Infinity/NaN/scientific junk.
// Returns null when the input isn't a usable number (caller decides fallback).
export const parseNum = (v, { min = -Infinity, max = Infinity } = {}) => {
  if (v == null || v === "") return null;
  const cleaned = String(v).replace(/[$,\s]/g, "");
  if (!/^-?\d*\.?\d+(e-?\d+)?$/i.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!isFinite(n) || n < min || n > max) return null;
  return n;
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
      const d = parseLocalDate(lastDate);
      if (!d) return;
      const daysSince = Math.floor((Date.now() - d) / 86400000);
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
  // minFee only applies once the free period is exhausted — 0 billable days = $0.
  const accrued = billableDays > 0 ? Math.max(tier.minFee ?? 0, billableDays * (dailyRate ?? 0)) : 0;
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
  return billableDays > 0 ? Math.max(tier.minFee ?? 0, billableDays * (dailyRate ?? 0)) : 0;
}
