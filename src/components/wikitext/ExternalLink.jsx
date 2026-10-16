import { isSafeExternalUrl } from '../../lib/wikitext/parser.js';
import { useWikiContext } from './WikiContext.js';

/** http(s) link with the external-link icon. Unsafe URLs render as plain text. */
export default function ExternalLink({ url, children }) {
  const { mode } = useWikiContext();
  if (!isSafeExternalUrl(url)) return <>{children}</>;
  return (
    <a
      className="external text"
      href={url}
      rel="nofollow noopener noreferrer"
      onClick={mode === 'preview' ? (e) => e.preventDefault() : undefined}
      tabIndex={mode === 'preview' ? -1 : undefined}
    >
      {children}
    </a>
  );
}
