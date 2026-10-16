// DEV ONLY: in-memory fake of the backend (PROJECT_SPEC §7), used when VITE_USE_FIXTURES=true
// so the UI can be built before the server exists. Loaded lazily, never bundled otherwise.
// Log in with demo@mywiki.local (any password) to act as the owner of the sample page.
import sample from '../fixtures/samplePage.json';
import { ApiError } from './client.js';
import { RESERVED_SLUGS, slugify } from '../lib/slug.js';
import { parseBlocks, parseInline, walk } from '../lib/wikitext/parser.js';
import { blockPlainText, excerpt } from '../lib/wikitext/plainText.js';

const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));
const fail = (status, code, message, details) => {
  throw new ApiError(status, { error: { code, message, details } });
};

const demoUser = { id: sample.owner.id, username: sample.owner.username, email: 'demo@mywiki.local', createdAt: '2026-10-15T09:00:00.000Z' };
const users = [demoUser];

const john = {
  ...structuredClone(sample.page),
  id: 'p-john',
  slug: 'john-doe',
  title: 'John Doe',
  shortDescription: 'Indian product designer (born 1995)',
  infobox: {
    name: '', image: null, birthDate: '1995-07-02', birthPlace: 'Pune, India', deathDate: null, deathPlace: '',
    fields: [{ label: 'Occupation', value: 'Product designer' }],
  },
  lead: "'''John Doe''' (born 2 July 1995) is an Indian product designer and a frequent collaborator of [[Jane Doe]].{{cite|r1}}",
  sections: [{ id: 'j1', heading: 'Career', level: 2, content: 'Doe has designed tools for developers since 2017.' }],
  references: [{ id: 'r1', type: 'web', title: 'Designers to watch', url: 'https://example.com/john', author: '', publisher: 'Example News', date: '2025-01-01', accessDate: '2026-10-15' }],
  seeAlso: ['Jane Doe'],
  externalLinks: [],
  categories: ['Living people', '1995 births'],
  createdAt: '2026-10-14T08:00:00.000Z',
  updatedAt: '2026-10-14T08:00:00.000Z',
};

const pages = [structuredClone(sample.page), john].map((p) => ({ visibility: 'public', ...p }));
const SNAPSHOT_KEYS = ['title', 'shortDescription', 'infobox', 'lead', 'sections', 'references', 'seeAlso', 'externalLinks', 'categories'];
const revisions = new Map();

function makeRevision(page, author, editSummary, prevSize = 0) {
  const snapshot = Object.fromEntries(SNAPSHOT_KEYS.map((k) => [k, structuredClone(page[k])]));
  const size = new TextEncoder().encode(JSON.stringify(snapshot)).length;
  const list = revisions.get(page.id) || [];
  const rev = {
    id: crypto.randomUUID(), pageId: page.id, revNumber: list.length + 1, authorId: author.id,
    authorUsername: author.username, editSummary, size, sizeDelta: size - prevSize, snapshot,
    createdAt: new Date().toISOString(),
  };
  revisions.set(page.id, [...list, rev]);
  page.currentRevisionId = rev.id;
  page.revisionCount = list.length + 1;
  return rev;
}
for (const page of pages) makeRevision(page, demoUser, 'Created page');

const currentUser = () => {
  try {
    const id = sessionStorage.getItem('mywiki:mock-user');
    return users.find((u) => u.id === id) || null;
  } catch {
    return null;
  }
};
const setCurrentUser = (u) => {
  try {
    if (u) sessionStorage.setItem('mywiki:mock-user', u.id);
    else sessionStorage.removeItem('mywiki:mock-user');
  } catch {
    /* ignore */
  }
};

const findPage = (slug) => {
  const s = slugify(slug);
  return s ? pages.find((p) => p.slug === s) : undefined;
};

function linkStatusFor(page) {
  const targets = new Set(page.seeAlso.map(slugify));
  const collect = (nodes) => walk(nodes, (n) => n.type === 'internalLink' && targets.add(n.slug));
  collect(parseBlocks(page.lead));
  page.sections.forEach((s) => collect(parseBlocks(s.content)));
  page.infobox.fields.forEach((f) => collect(parseInline(f.value)));
  return Object.fromEntries([...targets].map((t) => [t, Boolean(findPage(t))]));
}

const summary = (p) => ({ slug: p.slug, title: p.title, shortDescription: p.shortDescription, thumbnail: p.infobox.image?.url || null, visibility: p.visibility, updatedAt: p.updatedAt, createdAt: p.createdAt });
// PROJECT_SPEC §6.5: unlisted pages are reachable by URL but left out of every listing and search.
const listed = () => pages.filter((p) => p.visibility !== 'unlisted');
const VISIBILITIES = ['public', 'unlisted'];
const publicUser = ({ id, username, createdAt }) => ({ id, username, createdAt });
const pageResponse = (page) => {
  const user = currentUser();
  const owner = users.find((u) => u.id === page.ownerId);
  return { page, linkStatus: linkStatusFor(page), canEdit: user?.id === page.ownerId, owner: { id: owner.id, username: owner.username } };
};
const requireUser = () => currentUser() || fail(401, 'UNAUTHENTICATED', 'You must be logged in.');
const requireOwner = (page) => {
  const u = requireUser();
  if (u.id !== page.ownerId) fail(403, 'FORBIDDEN', 'You do not own this page.');
  return u;
};
// PROJECT_SPEC §6.4: base slug, or base + "-" + 9 random [a-z0-9] when taken/reserved/empty.
const randomSuffix = () => Array.from(crypto.getRandomValues(new Uint8Array(9)), (b) => (b % 36).toString(36)).join('');
const isSlugFree = (s) => Boolean(s) && !RESERVED_SLUGS.has(s) && !findPage(s);
const assignSlug = (title) => {
  const base = slugify(title);
  if (isSlugFree(base)) return base;
  for (;;) {
    const candidate = `${base || 'page'}-${randomSuffix()}`;
    if (!findPage(candidate)) return candidate;
  }
};

export async function mockApi(path, { method, body }) {
  await delay();
  const url = new URL(path, 'http://mock');
  const q = Object.fromEntries(url.searchParams);
  const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  const route = `${method} /${parts.join('/')}`;

  // Auth
  if (route === 'GET /auth/me') {
    const u = currentUser();
    return { user: u ? { ...publicUser(u), email: u.email } : null };
  }
  if (route === 'POST /auth/login') {
    const u = users.find((x) => x.email === String(body?.email).toLowerCase());
    if (!u) fail(401, 'UNAUTHENTICATED', 'Incorrect email or password.');
    setCurrentUser(u);
    return { user: { ...publicUser(u), email: u.email } };
  }
  if (route === 'POST /auth/register') {
    if (users.some((x) => x.email === body.email.toLowerCase())) fail(409, 'EMAIL_TAKEN', 'That email is already registered.', [{ path: 'email', message: 'Email already in use' }]);
    if (users.some((x) => x.username.toLowerCase() === body.username.toLowerCase())) fail(409, 'USERNAME_TAKEN', 'That username is taken.', [{ path: 'username', message: 'Username already taken' }]);
    const u = { id: crypto.randomUUID(), username: body.username, email: body.email.toLowerCase(), createdAt: new Date().toISOString() };
    users.push(u);
    setCurrentUser(u);
    return { user: { ...publicUser(u), email: u.email } };
  }
  // OAuth needs real redirects, so the mock offers no providers (the buttons stay hidden).
  if (route === 'GET /auth/providers') return { providers: [] };
  if (route === 'POST /auth/logout') {
    setCurrentUser(null);
    return null;
  }

  // Search
  if (route === 'GET /search/suggest' || route === 'GET /search') {
    const term = (q.q || '').toLowerCase().trim();
    const ranked = listed()
      .map((p) => {
        const t = p.title.toLowerCase();
        const body = `${p.shortDescription} ${blockPlainText(p.lead)} ${p.sections.map((s) => blockPlainText(s.content)).join(' ')}`;
        const rank = t === term ? 0 : t.startsWith(term) ? 1 : t.includes(term) ? 2 : body.toLowerCase().includes(term) ? 3 : 9;
        return { p, rank, body };
      })
      .filter((x) => term && x.rank < 9)
      .sort((a, b) => a.rank - b.rank);
    if (route === 'GET /search/suggest') {
      return { results: ranked.slice(0, Number(q.limit) || 8).map(({ p }) => ({ slug: p.slug, title: p.title, shortDescription: p.shortDescription, thumbnail: p.infobox.image?.url || null })) };
    }
    return {
      total: ranked.length,
      results: ranked.map(({ p, body }) => {
        const idx = body.toLowerCase().indexOf(term);
        const start = Math.max(0, idx - 60);
        const snippet = idx < 0
          ? [{ text: excerpt(body, 160), match: false }]
          : [
              { text: (start ? '…' : '') + body.slice(start, idx), match: false },
              { text: body.slice(idx, idx + term.length), match: true },
              { text: `${body.slice(idx + term.length, idx + term.length + 100)}…`, match: false },
            ];
        const size = revisions.get(p.id).at(-1).size;
        return { slug: p.slug, title: p.title, shortDescription: p.shortDescription, snippet, size, updatedAt: p.updatedAt };
      }),
    };
  }

  // Pages
  if (route === 'GET /pages') {
    const sorted = listed().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const offset = Number(q.offset) || 0;
    return { pages: sorted.slice(offset, offset + (Number(q.limit) || 10)).map(summary), total: listed().length };
  }
  if (route === 'GET /pages/mine') {
    const u = requireUser();
    return { pages: pages.filter((p) => p.ownerId === u.id).map(summary) };
  }
  if (route === 'GET /pages/count') return { count: listed().length };
  if (route === 'GET /pages/random') {
    const pool = listed();
    if (!pool.length) fail(404, 'NOT_FOUND', 'No pages yet.');
    return { slug: pool[Math.floor(Math.random() * pool.length)].slug };
  }
  if (route === 'GET /pages/slug-check') {
    const slug = slugify(q.title || '');
    return { slug, available: isSlugFree(slug) };
  }
  if (route === 'POST /pages') {
    const u = requireUser();
    const now = new Date().toISOString();
    const input = structuredClone(body);
    delete input.slug;
    delete input.editSummary;
    if (input.visibility !== undefined && !VISIBILITIES.includes(input.visibility)) fail(400, 'VALIDATION_ERROR', 'Invalid visibility', [{ path: 'visibility', message: 'Invalid visibility' }]);
    input.visibility = input.visibility ?? 'public';
    const page = { id: crypto.randomUUID(), ...input, slug: assignSlug(body.title), ownerId: u.id, createdAt: now, updatedAt: now };
    pages.push(page);
    makeRevision(page, u, 'Created page');
    return { ...pageResponse(page), canEdit: true };
  }

  if (parts[0] === 'pages' && parts[1]) {
    const page = findPage(parts[1]);
    if (!page) fail(404, 'NOT_FOUND', 'Page not found.');
    const sub = parts.slice(2).join('/');
    if (method === 'GET' && !sub) return pageResponse(page);
    if (method === 'GET' && sub === 'summary') {
      return { slug: page.slug, title: page.title, shortDescription: page.shortDescription, excerpt: excerpt(blockPlainText(page.lead), 300), thumbnail: page.infobox.image?.url || null };
    }
    if (method === 'PATCH' && sub === 'settings') {
      requireOwner(page);
      if (!VISIBILITIES.includes(body?.visibility)) fail(400, 'VALIDATION_ERROR', 'Invalid visibility', [{ path: 'visibility', message: 'Choose public or unlisted' }]);
      page.visibility = body.visibility; // a page setting: no revision
      return { page };
    }
    if (method === 'PUT' && !sub) {
      const u = requireOwner(page);
      if (body.baseRevisionId !== page.currentRevisionId) fail(409, 'EDIT_CONFLICT', 'The page was changed since you started editing.', { currentRevisionId: page.currentRevisionId });
      const prev = revisions.get(page.id).at(-1).size;
      for (const k of SNAPSHOT_KEYS) page[k] = structuredClone(body[k]);
      page.updatedAt = new Date().toISOString();
      makeRevision(page, u, body.editSummary || '', prev);
      return pageResponse(page);
    }
    if (method === 'DELETE' && !sub) {
      requireOwner(page);
      pages.splice(pages.indexOf(page), 1);
      return null;
    }
    const revs = revisions.get(page.id) || [];
    if (method === 'GET' && sub === 'revisions') {
      const offset = Number(q.offset) || 0;
      const list = [...revs].reverse().slice(offset, offset + (Number(q.limit) || 50));
      // eslint-disable-next-line no-unused-vars
      return { revisions: list.map(({ snapshot, ...meta }) => meta), total: revs.length };
    }
    if (parts[2] === 'revisions' && parts[3]) {
      const rev = revs.find((r) => r.id === parts[3]);
      if (!rev) fail(404, 'NOT_FOUND', 'Revision not found.');
      if (method === 'GET' && !parts[4]) {
        const owner = users.find((x) => x.id === page.ownerId);
        return { revision: rev, isCurrent: rev.id === page.currentRevisionId, linkStatus: linkStatusFor({ ...page, ...rev.snapshot }), owner: { id: owner.id, username: owner.username } };
      }
      if (method === 'POST' && parts[4] === 'restore') {
        const u = requireOwner(page);
        const prev = revs.at(-1).size;
        Object.assign(page, structuredClone(rev.snapshot), { updatedAt: new Date().toISOString() });
        makeRevision(page, u, body?.editSummary || `Restored revision ${rev.revNumber}`, prev);
        return pageResponse(page);
      }
    }
  }

  if (route === 'GET /health') return { ok: true, storage: 'mock' };
  return fail(404, 'NOT_FOUND', `Mock API has no route for ${route}`);
}
