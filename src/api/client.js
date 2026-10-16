export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error?.message || `Request failed (${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.error?.code || (status === 0 ? 'NETWORK_ERROR' : 'INTERNAL');
    this.details = body?.error?.details;
  }
}

export const USE_FIXTURES = import.meta.env.VITE_USE_FIXTURES === 'true';

export async function api(path, { method = 'GET', body, signal } = {}) {
  if (USE_FIXTURES) {
    const { mockApi } = await import('./mock.js');
    return mockApi(path, { method, body, signal });
  }

  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      signal,
      credentials: 'include',
      headers: body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : undefined,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ApiError(0, { error: { code: 'NETWORK_ERROR', message: 'Could not reach the server.' } });
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

/** Builds "?a=1&b=2", skipping empty values. */
export function qs(params) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export const isAbort = (err) => err?.name === 'AbortError';
