// Wizard form values ⇄ PageInput (PROJECT_SPEC §7.3).
import { formatDate } from './dates.js';
import { visibilityOf } from './visibility.js';

// Form values keep everything as plain strings (image url '' = no image) so inputs stay controlled.

const randomId = (n = 8) =>
  Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => (b % 36).toString(36)).join('');

export const newSectionId = () => `s-${randomId()}`;

export function emptyInfobox() {
  return {
    name: '',
    image: { url: '', alt: '', caption: '' },
    birthDate: '',
    birthPlace: '',
    deathDate: '',
    deathPlace: '',
    fields: [],
  };
}

export function emptyDraft(title = '') {
  return {
    title,
    shortDescription: '',
    visibility: 'public',
    infobox: emptyInfobox(),
    lead: '',
    sections: [],
    references: [],
    seeAlso: [],
    externalLinks: [],
    categories: [],
    editSummary: '',
  };
}

export function emptyReference(id, type = 'web') {
  return { id, type, title: '', url: '', author: '', publisher: '', date: '', accessDate: todayIso() };
}

export function todayIso() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Next free "rN" reference id. */
export function nextRefId(references) {
  let max = 0;
  for (const r of references) {
    const m = /^r(\d+)$/.exec(r.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  let n = max + 1;
  const ids = new Set(references.map((r) => r.id));
  while (ids.has(`r${n}`)) n += 1;
  return `r${n}`;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const citeRe = (id) => new RegExp(`\\{\\{\\s*cite\\s*\\|\\s*${escapeRe(id)}\\s*\\}\\}`, 'g');

/** How many {{cite|id}} markers use this reference (lead + sections). */
export function countCites(values, id) {
  const texts = [values.lead, ...values.sections.map((s) => s.content)];
  return texts.reduce((n, t) => n + (String(t ?? '').match(citeRe(id))?.length ?? 0), 0);
}

export const removeCites = (text, id) => String(text ?? '').replace(citeRe(id), '');

/** Page (from the API) → form values. */
export function pageToDraft(page) {
  const ib = page.infobox || {};
  return {
    title: page.title ?? '',
    shortDescription: page.shortDescription ?? '',
    visibility: visibilityOf(page),
    infobox: {
      name: ib.name ?? '',
      image: { url: ib.image?.url ?? '', alt: ib.image?.alt ?? '', caption: ib.image?.caption ?? '' },
      birthDate: ib.birthDate ?? '',
      birthPlace: ib.birthPlace ?? '',
      deathDate: ib.deathDate ?? '',
      deathPlace: ib.deathPlace ?? '',
      fields: (ib.fields ?? []).map((f) => ({ label: f.label ?? '', value: f.value ?? '' })),
    },
    lead: page.lead ?? '',
    sections: (page.sections ?? []).map((s) => ({
      id: s.id || newSectionId(),
      heading: s.heading ?? '',
      level: s.level === 3 ? 3 : 2,
      content: s.content ?? '',
    })),
    references: (page.references ?? []).map((r) => ({ ...emptyReference(r.id), accessDate: '', ...r })),
    seeAlso: [...(page.seeAlso ?? [])],
    externalLinks: (page.externalLinks ?? []).map((l) => ({ label: l.label ?? '', url: l.url ?? '' })),
    categories: [...(page.categories ?? [])],
    editSummary: '',
  };
}

const t = (s) => String(s ?? '').trim();

/** Form values → PageInput (+ editSummary). */
export function draftToInput(values) {
  const ib = values.infobox;
  const imageUrl = t(ib.image?.url);
  return {
    title: t(values.title),
    shortDescription: t(values.shortDescription),
    visibility: values.visibility === 'unlisted' ? 'unlisted' : 'public',
    infobox: {
      name: t(ib.name),
      image: imageUrl ? { url: imageUrl, alt: t(ib.image.alt), caption: t(ib.image.caption) } : null,
      birthDate: t(ib.birthDate) || null,
      birthPlace: t(ib.birthPlace),
      deathDate: t(ib.deathDate) || null,
      deathPlace: t(ib.deathPlace),
      fields: ib.fields.map((f) => ({ label: t(f.label), value: t(f.value) })),
    },
    lead: values.lead ?? '',
    sections: values.sections.map((s) => ({ id: s.id, heading: t(s.heading), level: Number(s.level) === 3 ? 3 : 2, content: s.content ?? '' })),
    references: values.references.map((r) => ({
      id: r.id,
      type: r.type,
      title: t(r.title),
      url: t(r.url),
      author: t(r.author),
      publisher: t(r.publisher),
      date: t(r.date),
      accessDate: t(r.accessDate),
    })),
    seeAlso: values.seeAlso.map(t).filter(Boolean),
    externalLinks: values.externalLinks.map((l) => ({ label: t(l.label), url: t(l.url) })),
    categories: [...new Set(values.categories.map(t).filter(Boolean))],
    editSummary: t(values.editSummary),
  };
}

/** "'''Ram Singh''' (born 21 August 1987) is an Indian civil engineer." */
export function starterSentence({ title, birthDate, deathDate, shortDescription }) {
  const name = title.trim() || 'Name';
  let dates = '';
  if (birthDate && deathDate) dates = ` (${formatDate(birthDate)} – ${formatDate(deathDate)})`;
  else if (birthDate) dates = ` (born ${formatDate(birthDate)})`;
  // Drop a trailing "(born 1987)" style note from the short description.
  const desc = shortDescription.trim().replace(/\s*\([^)]*\)\s*$/, '');
  const verb = deathDate ? 'was' : 'is';
  const article = /^[aeiou]/i.test(desc) ? 'an' : 'a';
  return `'''${name}'''${dates} ${verb} ${desc ? `${article} ${desc}` : '…'}.`;
}
