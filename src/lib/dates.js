export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Parses "YYYY", "YYYY-MM" or "YYYY-MM-DD". Returns null if invalid. */
export function parseDate(value) {
  if (typeof value !== 'string') return null;
  const m = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(value.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = m[2] ? Number(m[2]) : null;
  const day = m[3] ? Number(m[3]) : null;
  if (month !== null && (month < 1 || month > 12)) return null;
  if (day !== null) {
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (day < 1 || day > daysInMonth) return null;
  }
  return { year, month, day };
}

/** "1998-03-15" → "15 March 1998", "1998-03" → "March 1998", "1998" → "1998". */
export function formatDate(value) {
  const d = parseDate(value);
  if (!d) return value ?? '';
  if (d.day) return `${d.day} ${MONTHS[d.month - 1]} ${d.year}`;
  if (d.month) return `${MONTHS[d.month - 1]} ${d.year}`;
  return String(d.year);
}

/** Whole years between two full dates; null unless both are full dates. */
export function ageBetween(from, to) {
  const a = typeof from === 'string' ? parseDate(from) : from;
  const b = typeof to === 'string' ? parseDate(to) : to;
  if (!a?.day || !b?.day) return null;
  let age = b.year - a.year;
  if (b.month < a.month || (b.month === a.month && b.day < a.day)) age -= 1;
  return age >= 0 ? age : null;
}

/** Age today for a full birth date, otherwise null. */
export function ageToday(birthDate, now = new Date()) {
  const today = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  return ageBetween(birthDate, today);
}

const pad = (n) => String(n).padStart(2, '0');

/** ISO timestamp → "14:02, 15 October 2026" (local time, like MediaWiki). */
export function formatDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${pad(d.getHours())}:${pad(d.getMinutes())}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** ISO timestamp → "15 October 2026". */
export function formatDay(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
