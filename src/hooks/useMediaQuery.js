import { useSyncExternalStore } from 'react';

export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false),
    () => false,
  );
}

export const BREAKPOINTS = {
  mobile: '(max-width: 639.98px)',
  toc: '(min-width: 1120px)',
  wide: '(min-width: 1400px)',
  preview: '(min-width: 1280px)',
  canHover: '(hover: hover)',
};
