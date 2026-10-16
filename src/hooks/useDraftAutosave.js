import { useCallback, useEffect, useRef, useState } from 'react';

export const draftKey = (slug) => `mywiki:draft:${slug || 'new'}`;

export function readDraft(key) {
  try {
    const d = JSON.parse(localStorage.getItem(key));
    return d && d.values ? d : null;
  } catch {
    return null;
  }
}

export function clearDraft(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* storage unavailable */
  }
}

/**
 * Saves { values, savedAt, ...extra } to localStorage 1 s after the last change while `enabled`.
 * Returns { savedAt } — the time of the last successful save.
 */
export function useDraftAutosave(key, values, { enabled, extra }) {
  const [savedAt, setSavedAt] = useState(null);
  const extraRef = useRef(extra);
  useEffect(() => {
    extraRef.current = extra;
  });

  const save = useCallback(() => {
    try {
      const at = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify({ ...extraRef.current, values, savedAt: at }));
      setSavedAt(at);
    } catch {
      /* storage full or unavailable */
    }
  }, [key, values]);

  useEffect(() => {
    if (!enabled) return undefined;
    const t = setTimeout(save, 1000);
    return () => clearTimeout(t);
  }, [enabled, save]);

  return { savedAt };
}
