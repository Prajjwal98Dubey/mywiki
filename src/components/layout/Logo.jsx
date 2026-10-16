import { Link } from 'react-router';
import { SITE_NAME } from '../../hooks/useDocumentTitle.js';

/** Our own simple mark + wordmark (we do not use Wikipedia's trademarks). */
export default function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2 text-wiki-text hover:no-underline" aria-label={`${SITE_NAME} main page`}>
      <svg viewBox="0 0 50 50" className="size-10 shrink-0 sm:size-[2.75rem]" aria-hidden="true">
        <circle cx="25" cy="25" r="23" fill="var(--bg-page)" stroke="var(--color-subtle)" strokeWidth="2" />
        <path d="M11 16h6l4 15 4-12 4 12 4-15h6l-7 22h-5l-2-7-2 7h-5z" fill="var(--color-base)" />
      </svg>
      <span className="hidden flex-col leading-none min-[500px]:flex">
        <span className="font-serif text-[1.375rem] tracking-[0.04em]">{SITE_NAME}</span>
        <span className="mt-0.5 font-serif text-[0.75rem] tracking-[0.02em] text-wiki-subtle-text">
          The encyclopedia about you
        </span>
      </span>
    </Link>
  );
}
