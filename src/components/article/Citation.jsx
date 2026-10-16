import { formatDate } from '../../lib/dates.js';
import { isSafeExternalUrl } from '../../lib/wikitext/parser.js';

function Title({ title, url, italic }) {
  const text = title || url || 'Untitled';
  const content = isSafeExternalUrl(url) ? (
    <a className="external text" href={url} rel="nofollow noopener noreferrer">
      {text}
    </a>
  ) : (
    text
  );
  return italic ? <i>{content}</i> : <>&quot;{content}&quot;</>;
}

/**
 * CS1-style formatted citation:
 *   web/other: Author (Date). "Title". Publisher. Retrieved AccessDate.
 *   news:      Author (Date). "Title". *Publisher*. Retrieved AccessDate.
 *   book:      Author (Date). *Title*. Publisher.
 * Without an author the date moves after the publisher, like Wikipedia.
 */
export default function Citation({ reference: r }) {
  const isBook = r.type === 'book';
  const date = r.date ? formatDate(r.date) : '';
  const publisher = r.publisher ? r.type === 'news' ? <i>{r.publisher}</i> : r.publisher : null;
  const showAccess = r.accessDate && r.url && isSafeExternalUrl(r.url);

  return (
    <cite className="citation">
      {r.author && (
        <>
          {r.author}
          {date && ` (${date})`}.{' '}
        </>
      )}
      <Title title={r.title} url={r.url} italic={isBook} />.
      {publisher && <> {publisher}.</>}
      {!r.author && date && <> {date}.</>}
      {showAccess && <> Retrieved {formatDate(r.accessDate)}.</>}
    </cite>
  );
}
