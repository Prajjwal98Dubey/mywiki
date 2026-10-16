import { useCallback, useEffect, useState } from 'react';
import { isAbort } from '../api/client.js';

/**
 * Minimal data loader: runs `load(signal)` whenever `deps` (primitives) change, aborting
 * stale requests. Previous data stays available while reloading.
 * Returns { data, error, loading, reload, setData }.
 */
export function useResource(load, deps) {
  const [nonce, setNonce] = useState(0);
  const key = JSON.stringify([...deps, nonce]);
  const [state, setState] = useState({ key: null, data: null, error: null });

  useEffect(() => {
    const ctrl = new AbortController();
    Promise.resolve()
      .then(() => load(ctrl.signal))
      .then((data) => {
        if (!ctrl.signal.aborted) setState({ key, data, error: null });
      })
      .catch((error) => {
        if (!ctrl.signal.aborted && !isAbort(error)) setState((s) => ({ key, data: s.data, error }));
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const loading = state.key !== key;
  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));
  }, []);

  return {
    data: loading || !state.error ? state.data : null,
    error: loading ? null : state.error,
    loading,
    reload,
    setData,
  };
}
