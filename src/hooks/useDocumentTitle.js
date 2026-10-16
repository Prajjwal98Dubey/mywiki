import { useEffect } from 'react';

export const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'MyWiki';

/** Sets document.title to "{title} - MyWiki" (or just the site name). */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} - ${SITE_NAME}` : SITE_NAME;
  }, [title]);
}
