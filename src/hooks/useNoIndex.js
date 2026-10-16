import { useEffect } from 'react';

/** Adds <meta name="robots" content="noindex"> while `active` (unlisted pages, PROJECT_SPEC §6.5). */
export function useNoIndex(active) {
  useEffect(() => {
    if (!active) return undefined;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [active]);
}
