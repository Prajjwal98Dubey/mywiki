import { Link } from 'react-router';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="m-0 font-display text-[7rem] leading-none font-semibold text-app-accent-soft select-none">404</p>
      <h1 className="mt-2 mb-2 font-display text-4xl font-medium">This page took a different path</h1>
      <p className="m-0 text-app-muted">The address may be mistyped, or the page may have moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="app-btn app-btn-primary">
          Go home
        </Link>
        <Link to="/search?q=" className="app-btn app-btn-secondary">
          Search pages
        </Link>
      </div>
    </div>
  );
}
