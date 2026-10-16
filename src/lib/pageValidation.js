// Client mirror of the server's page validation (server/src/validation/page.schemas.js, PROJECT_SPEC §6.2).
import { z } from 'zod';
import { toNestErrors } from '@hookform/resolvers';
import { isSafeExternalUrl } from './wikitext/parser.js';

const BIRTH_DATE = /^\d{4}(-\d{2}-\d{2})?$/;
const REF_DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/;
const UPLOAD_PATH = /^\/uploads\/[A-Za-z0-9._-]+$/;

const isRealDate = (v) => {
  if (v.length === 4) return true;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
};

const max = (n) => z.string().trim().max(n, `Keep this under ${n} characters`);
const required = (n, msg) => max(n).min(1, msg);
const httpUrl = max(2000).refine(isSafeExternalUrl, 'Enter a full link starting with https://');
const optionalHttpUrl = z.union([z.literal(''), httpUrl]);
const personDate = z
  .string()
  .trim()
  .refine((v) => v === '' || (BIRTH_DATE.test(v) && isRealDate(v)), 'Enter a full date or a 4-digit year');
const refDate = z
  .string()
  .trim()
  .refine((v) => v === '' || REF_DATE.test(v), 'Use YYYY, YYYY-MM or YYYY-MM-DD');

const formSchema = z.object({
  title: required(100, 'Enter the person’s name'),
  shortDescription: max(120),
  visibility: z.enum(['public', 'unlisted'], { error: 'Choose who can find this page' }),
  infobox: z.object({
    name: max(100),
    image: z.object({
      url: z.string().refine((v) => v === '' || UPLOAD_PATH.test(v) || isSafeExternalUrl(v) || v.startsWith('blob:'), 'Invalid image'),
      alt: max(200),
      caption: max(300),
    }),
    birthDate: personDate,
    birthPlace: max(200),
    deathDate: personDate,
    deathPlace: max(200),
    fields: z
      .array(z.object({ label: required(40, 'Add a label'), value: required(500, 'Add a value or remove the row') }))
      .max(30, 'At most 30 rows'),
  }),
  lead: z.string().max(10000, 'Keep the introduction under 10,000 characters'),
  sections: z
    .array(
      z.object({
        id: z.string(),
        heading: required(100, 'Add a heading'),
        level: z.coerce.number(),
        content: z.string().max(20000, 'Keep each section under 20,000 characters'),
      }),
    )
    .max(50, 'At most 50 sections'),
  references: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum(['web', 'book', 'news', 'other']),
        title: required(300, 'Add a title for this source'),
        url: optionalHttpUrl,
        author: max(300),
        publisher: max(300),
        date: refDate,
        accessDate: refDate,
      }),
    )
    .max(200, 'At most 200 references'),
  seeAlso: z.array(max(100)).max(30, 'At most 30 links'),
  externalLinks: z
    .array(z.object({ label: required(200, 'Add a label'), url: httpUrl }))
    .max(30, 'At most 30 links'),
  categories: z.array(max(60)).max(20, 'At most 20 categories'),
  editSummary: max(255),
});

const CITE = /\{\{\s*cite\s*\|\s*([^}|\s]+)\s*\}\}/g;

/** Cross-field rules zod can't express per field. */
function crossFieldIssues(v) {
  const issues = [];
  const add = (path, message) => issues.push({ path, message });

  if (v.infobox.image.url && !v.infobox.image.alt.trim()) {
    add(['infobox', 'image', 'alt'], 'Describe the photo for people who can’t see it');
  }
  const b = v.infobox.birthDate.trim();
  const d = v.infobox.deathDate.trim();
  if (b && d && d.slice(0, b.length) < b.slice(0, d.length)) add(['infobox', 'deathDate'], 'Death date is before the birth date');

  if (v.sections.length && Number(v.sections[0].level) !== 2) {
    add(['sections', 0, 'level'], 'The first section must be a main section, not a subsection');
  }

  const refIds = new Set(v.references.map((r) => r.id));
  const checkCites = (text, path) => {
    for (const m of String(text ?? '').matchAll(CITE)) {
      if (!refIds.has(m[1])) {
        add(path, `Citation “${m[1]}” doesn’t match any reference — add it in step 5 or remove it`);
        return;
      }
    }
  };
  checkCites(v.lead, ['lead']);
  v.sections.forEach((s, i) => checkCites(s.content, ['sections', i, 'content']));
  return issues;
}

/** All validation issues for the form: [{ path: (string|number)[], message }]. */
export function validatePage(values) {
  const result = formSchema.safeParse(values);
  const issues = result.success ? [] : result.error.issues.map((i) => ({ path: i.path, message: i.message }));
  return [...issues, ...crossFieldIssues(values)];
}

/** react-hook-form resolver; values are returned unchanged (conversion happens in draftToInput). */
export async function pageResolver(values, _context, options) {
  const issues = validatePage(values);
  if (!issues.length) return { values, errors: {} };
  const flat = {};
  for (const i of issues) {
    const key = i.path.join('.');
    if (!flat[key]) flat[key] = { type: 'validation', message: i.message };
  }
  return { values: {}, errors: toNestErrors(flat, options) };
}

/** Which wizard step (0-based) owns a field path. */
export function stepForPath(path) {
  const root = String(Array.isArray(path) ? path[0] : String(path).split('.')[0]);
  if (root === 'title' || root === 'shortDescription' || root === 'visibility') return 0;
  if (root === 'infobox') return 1;
  if (root === 'lead') return 2;
  if (root === 'sections') return 3;
  if (['references', 'seeAlso', 'externalLinks', 'categories'].includes(root)) return 4;
  return 5;
}

export const STEP_FIELDS = [
  ['title', 'shortDescription', 'visibility'],
  ['infobox'],
  ['lead'],
  ['sections'],
  ['references', 'seeAlso', 'externalLinks', 'categories'],
  ['editSummary'],
];
