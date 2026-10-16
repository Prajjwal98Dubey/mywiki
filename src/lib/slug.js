// Must match the backend exactly — see PROJECT_SPEC §6.4.
const APOSTROPHES = /['’]/g;
// Runs of anything that is not a letter, combining mark (Devanagari etc.) or number.
const SEPARATORS = /[^\p{L}\p{M}\p{N}]+/gu;
export const MAX_BASE_SLUG_LENGTH = 80;

/** App routes that can never be page slugs (PROJECT_SPEC §6.4). */
export const RESERVED_SLUGS = new Set([
  'api', 'uploads', 'wiki', 'create', 'search', 'random', 'login', 'logout', 'register', 'my-pages',
  'settings', 'help', 'about', 'admin', 'assets', 'static', 'src', 'node_modules',
]);

/** "Ram Singh" → "ram-singh". Idempotent; may return "" for titles made only of symbols. */
export function slugify(title) {
  if (typeof title !== 'string') return '';
  const s = title
    .toLowerCase()
    .normalize('NFC')
    .replace(APOSTROPHES, '')
    .replace(SEPARATORS, '-')
    .replace(/^-+|-+$/g, '');
  return Array.from(s).slice(0, MAX_BASE_SLUG_LENGTH).join('').replace(/-+$/, '');
}

/** "ram-singh" → "Ram Singh" — a best-effort display title when only the slug is known. */
export function humanizeSlug(slug) {
  return String(slug ?? '')
    .split('-')
    .filter(Boolean)
    .map((w) => {
      const chars = Array.from(w);
      return chars[0].toUpperCase() + chars.slice(1).join('');
    })
    .join(' ');
}

/** Site-relative URL of a page: "/ram-singh". */
export function pagePath(slug) {
  return `/${encodeURIComponent(slug)}`;
}

/** Absolute URL shown to people, e.g. "mywiki.com/ram-singh" (uses the current host). */
export function displayUrl(slug) {
  const host = typeof window !== 'undefined' ? window.location.host : 'mywiki.com';
  return `${host}/${slug}`;
}
