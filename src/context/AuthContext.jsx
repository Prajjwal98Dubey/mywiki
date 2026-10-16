import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (signal) => {
    try {
      const data = await authApi.me(signal);
      setUser(data?.user ?? null);
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setUser(null);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    authApi
      .me(ctrl.signal)
      .then((data) => setUser(data?.user ?? null))
      .catch((err) => {
        if (err?.name !== 'AbortError') setUser(null);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, []);

  const login = useCallback(async (credentials) => {
    const { user: u } = await authApi.login(credentials);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data) => {
    const { user: u } = await authApi.register(data);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout, refresh }), [user, loading, login, register, logout, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
