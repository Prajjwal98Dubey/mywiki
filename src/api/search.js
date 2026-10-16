import { api, qs } from './client.js';

export const suggest = (q, { limit = 8 } = {}, signal) => api(`/search/suggest${qs({ q, limit })}`, { signal });
export const search = (q, { limit = 20, offset = 0 } = {}, signal) =>
  api(`/search${qs({ q, limit, offset })}`, { signal });
