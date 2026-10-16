import { createContext, useContext } from 'react';

/**
 * Render context for WikiLite trees:
 *   linkStatus  { [slug]: boolean } — false renders a red link
 *   mode        'live' | 'revision' | 'preview' — links are inert in preview
 *   references  Map<refId, reference> — for reference previews
 */
export const WikiContext = createContext({ linkStatus: {}, mode: 'live', references: new Map() });

export const useWikiContext = () => useContext(WikiContext);
