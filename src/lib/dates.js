// Timezone-safe date parsing/formatting helpers.
//
// The core problem: `new Date("2026-07-02")` parses as UTC midnight, so for
// any user east of UTC the date lands on the previous local day (and west of
// UTC, comparisons against "now" skew the other way). Every date-only string
// in the app (dueDate, lastServiceDate, custom range pickers) must go through
// parseLocalDate instead.

// Parse a date-only string ("YYYY-MM-DD") as LOCAL midnight.
// Full ISO datetimes (with time component) pass through to native parsing.
export function parseLocalDate(s) {
  if (!s) return null;
  if (s instanceof Date) return s;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim());
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

// End of the given local day (23:59:59.999) — for inclusive "to" range bounds.
export function endOfLocalDay(s) {
  const d = parseLocalDate(s);
  if (!d) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

// Whole local days elapsed since a date (0 = today). Returns null if unparseable.
export function daysSinceLocal(s, now = new Date()) {
  const d = parseLocalDate(s);
  if (!d) return null;
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((b - a) / 86400000);
}

// True if the date-only string is strictly before today (local).
export function isOverdueLocal(s, now = new Date()) {
  const days = daysSinceLocal(s, now);
  return days != null && days > 0;
}

// Convert any parseable timestamp to a value for <input type="datetime-local">
// ("YYYY-MM-DDTHH:mm" in LOCAL time). Returns "" if unparseable.
export function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Convert a datetime-local input value (local, timezone-naive) to a full ISO
// string with correct UTC instant. Returns null for empty/invalid input.
export function localInputToISO(value) {
  if (!value) return null;
  const d = new Date(value); // datetime-local values parse as LOCAL time
  return isNaN(d) ? null : d.toISOString();
}
