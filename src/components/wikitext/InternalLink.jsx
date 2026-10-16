import { Link } from 'react-router';
import { humanizeSlug, pagePath } from '../../lib/slug.js';
import { useWikiContext } from './WikiContext.js';

const preventDefault = (e) => e.preventDefault();

/**
 * Link to another MyWiki page; red ("new") when linkStatus says it doesn't exist.
 * `title` is the link target as written (e.g. "Ram Singh"), used to prefill /create for red links.
 */
export default function InternalLink({ slug, title: targetTitle, children }) {
  const { linkStatus, mode } = useWikiContext();
  const exists = linkStatus?.[slug] !== false; // unknown → assume it exists
  const title = targetTitle?.trim() || humanizeSlug(slug);

  if (mode === 'preview') {
    return (
      <a href={pagePath(slug)} className={exists ? undefined : 'new'} onClick={preventDefault} tabIndex={-1}>
        {children}
      </a>
    );
  }

  if (!exists) {
    return (
      <Link to={`/create?title=${encodeURIComponent(title)}`} className="new" title={`${title} (page does not exist)`}>
        {children}
      </Link>
    );
  }

  return (
    <Link to={pagePath(slug)} data-preview-slug={slug}>
      {children}
    </Link>
  );
}
