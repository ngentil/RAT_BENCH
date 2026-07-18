import { MACHINE_TYPES } from './constants';
import { DEFAULT_STORAGE_TIERS } from './storageTiers';
import { parseLocalDate } from './dates';
import { SPEC_SEARCH_FIELDS } from './constants/specSearchFields';
// ── helpers ───────────────────────────────────────────────────────────────────

// Progressively-enhanced internal link click: a plain left-click hands off to
// the given client-side navigate() (pushState, no reload — same "back just
// pops state" behaviour as MachineCard/Tracker's cardOpen pattern) instead of
// the browser's real navigation; a modified click (ctrl/cmd/shift/middle) is
// left alone so "open in new tab" still works normally. Pass the real onClick
// handler too (e.g. persistQuery) if the link needs one regardless of path.
export function navClick(onNavigate, path, onClick) {
  return (e) => {
    onClick?.(e);
    if (!onNavigate || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onNavigate(path);
  };
}

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

// Same matching model as the wiki search: a single plain, case-insensitive
// substring, checked against name/make/model/type first, then every spec
// field the old Spec Search tab used to cover (plug gap, bore, carb brand,
// tyre size, etc.) — so one search box covers every Tracker view mode.
export function machineMatchesQuery(m, q) {
  const lowerQ = q.toLowerCase();
  if ((m.name||"").toLowerCase().includes(lowerQ)) return true;
  if ((m.make||"").toLowerCase().includes(lowerQ)) return true;
  if ((m.model||"").toLowerCase().includes(lowerQ)) return true;
  if ((m.type||"").toLowerCase().includes(lowerQ)) return true;
  return SPEC_SEARCH_FIELDS.some(f => {
    const v = m[f.k];
    return v != null && v !== "" && v !== false && String(v).toLowerCase().includes(lowerQ);
  });
}

const SNIPPET_MAX = 90; // long free-text fields (e.g. notes, port notes) get a trimmed snippet around the match

// Finds the first spec field that explains a match not already obvious
// from name/make/model/type, so a result tile/row/card can show WHY it
// matched — mirrors findSpecMatch() in WikiHomePage.jsx exactly.
export function findMachineSpecMatch(m, q) {
  if (!q) return null;
  const lowerQ = q.toLowerCase();
  for (const f of SPEC_SEARCH_FIELDS) {
    const raw = m[f.k];
    if (raw == null || raw === "" || raw === false) continue;
    const value = String(raw) + (f.u ? " " + f.u : "");
    const lowerValue = value.toLowerCase();
    if (!lowerValue.includes(lowerQ)) continue;
    if (value.length <= SNIPPET_MAX) return { label: f.l, value };
    const idx = lowerValue.indexOf(lowerQ);
    const start = Math.max(0, idx - 30);
    const end = Math.min(value.length, idx + q.length + 50);
    const snippet = (start > 0 ? "…" : "") + value.slice(start, end) + (end < value.length ? "…" : "");
    return { label: f.l, value: snippet };
  }
  return null;
}

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
