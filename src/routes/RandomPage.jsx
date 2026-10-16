import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { randomPage } from '../api/pages.js';
import { isAbort } from '../api/client.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { pagePath } from '../lib/slug.js';
import { AppAlert } from '../components/app/forms.jsx';

export default function RandomPage() {
  useDocumentTitle('Random page');
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    randomPage(ctrl.signal)
      .then(({ slug }) => navigate(pagePath(slug), { replace: true }))
      .catch((err) => {
        if (!isAbort(err)) setError(err);
      });
    return () => ctrl.abort();
  }, [navigate]);

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      {!error && (
        <div role="status" className="flex flex-col items-center gap-4 text-app-muted">
          <span className="size-8 animate-spin rounded-full border-2 border-app-border border-t-app-accent" />
          Finding a random page…
        </div>
      )}
      {error?.status === 404 && (
        <>
          <h1 className="m-0 mb-2 font-display text-4xl font-medium">Nothing here yet</h1>
          <p className="m-0 text-app-muted">There are no pages to explore yet. Why not write the first one?</p>
          <Link to="/create" className="app-btn app-btn-primary mt-8">
            Create a page
          </Link>
        </>
      )}
      {error && error.status !== 404 && <AppAlert>{error.message}</AppAlert>}
    </div>
  );
}
