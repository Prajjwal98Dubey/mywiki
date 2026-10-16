import { api } from './client.js';

export const register = (body) => api('/auth/register', { method: 'POST', body });
export const login = (body) => api('/auth/login', { method: 'POST', body });
export const logout = () => api('/auth/logout', { method: 'POST' });
export const me = (signal) => api('/auth/me', { signal });

/** Sign-in providers the server has configured: [{ id, name }] (PROJECT_SPEC §7.2.1). */
export const getProviders = (signal) => api('/auth/providers', { signal });

/** Full-page navigation target that starts an OAuth sign-in (not a fetch). */
export const oauthStartUrl = (provider, returnTo = '/') =>
  `/api/auth/oauth/${encodeURIComponent(provider)}/start?returnTo=${encodeURIComponent(returnTo)}`;
