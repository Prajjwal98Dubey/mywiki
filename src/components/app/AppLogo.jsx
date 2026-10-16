import { Link } from 'react-router';
import { SITE_NAME } from '../../hooks/useDocumentTitle.js';

export function LogoMark({ className = 'size-8' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="var(--app-ink)" />
      <path d="M8.5 13h4.6l3 11.2 3.1-9h1.6l3.1 9 3-11.2h4.6l-5.4 16h-3.6L20 21l-2.5 8h-3.6z" fill="var(--app-bg)" />
      <circle cx="31.5" cy="9" r="2.6" fill="var(--app-gold)" />
    </svg>
  );
}

export default function AppLogo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5 rounded-lg" aria-label={`${SITE_NAME} home`}>
      <LogoMark />
      <span className="font-display text-[1.35rem] leading-none font-semibold tracking-tight">{SITE_NAME}</span>
    </Link>
  );
}
