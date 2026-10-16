import { api, qs } from './client.js';

const p = (slug) => `/pages/${encodeURIComponent(slug)}`;

export const listPages = ({ sort = 'recent', limit = 10, offset = 0 } = {}, signal) =>
  api(`/pages${qs({ sort, limit, offset })}`, { signal });
export const myPages = (signal) => api('/pages/mine', { signal });
export const countPages = (signal) => api('/pages/count', { signal });
export const randomPage = (signal) => api('/pages/random', { signal });
export const slugCheck = (title, signal) => api(`/pages/slug-check${qs({ title })}`, { signal });

export const getPage = (slug, signal) => api(p(slug), { signal });
export const createPage = (body) => api('/pages', { method: 'POST', body });
export const updatePage = (slug, body) => api(p(slug), { method: 'PUT', body });
/** Page settings that are not content (no revision is created): { visibility }. */
export const updatePageSettings = (slug, body) => api(`${p(slug)}/settings`, { method: 'PATCH', body });
export const deletePage = (slug) => api(p(slug), { method: 'DELETE' });

export const listRevisions = (slug, { limit = 50, offset = 0 } = {}, signal) =>
  api(`${p(slug)}/revisions${qs({ limit, offset })}`, { signal });
export const getRevision = (slug, revId, signal) =>
  api(`${p(slug)}/revisions/${encodeURIComponent(revId)}`, { signal });
export const restoreRevision = (slug, revId, editSummary) =>
  api(`${p(slug)}/revisions/${encodeURIComponent(revId)}/restore`, { method: 'POST', body: { editSummary } });

// Page summaries (for hover previews) are cached in memory by slug.
const summaryCache = new Map();
export function getSummary(slug) {
  if (!summaryCache.has(slug)) {
    const promise = api(`${p(slug)}/summary`).catch((err) => {
      summaryCache.delete(slug);
      throw err;
    });
    summaryCache.set(slug, promise);
  }
  return summaryCache.get(slug);
}
export const clearSummaryCache = (slug) => (slug ? summaryCache.delete(slug) : summaryCache.clear());
