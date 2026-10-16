import { Link } from 'react-router';
import { formatDay } from '../../lib/dates.js';
import { displayUrl, pagePath } from '../../lib/slug.js';
import Avatar from './Avatar.jsx';
import Icon from '../ui/Icon.jsx';

/** Card for a PageSummary ({ slug, title, shortDescription, thumbnail, createdAt, updatedAt }). */
export default function PageCard({ page, dateLabel = 'Created', date = page.createdAt, footer }) {
  return (
    <article className="app-card group relative flex flex-col p-5 transition-[box-shadow,transform,border-color] hover:-translate-y-0.5 hover:border-app-border-strong hover:shadow-app-md">
      <div className="flex items-start gap-4">
        <Avatar name={page.title} src={page.thumbnail} className="size-12 text-base" rounded="rounded-xl" />
        <div className="min-w-0 flex-1">
          <h3 className="m-0 font-display text-xl leading-snug font-medium">
            <Link to={pagePath(page.slug)} className="after:absolute after:inset-0 after:rounded-[1.25rem] group-hover:text-app-accent">
              {page.title}
            </Link>
          </h3>
          {page.visibility === 'unlisted' && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-app-gold-soft px-2 py-0.5 text-[0.7rem] font-semibold text-app-gold">
              <Icon name="link" size={10} /> Unlisted
            </span>
          )}
          {page.shortDescription && <p className="m-0 mt-1 line-clamp-2 text-sm text-app-muted">{page.shortDescription}</p>}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-app-border pt-3 text-xs text-app-muted">
        <span className="truncate font-mono">{displayUrl(page.slug)}</span>
        {date && (
          <span className="shrink-0">
            {dateLabel} {formatDay(date)}
          </span>
        )}
      </div>
      {footer && <div className="relative z-10 mt-3">{footer}</div>}
    </article>
  );
}
