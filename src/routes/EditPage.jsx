import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { getPage } from '../api/pages.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useResource } from '../hooks/useResource.js';
import { pageToDraft } from '../lib/pageDraft.js';
import { pagePath } from '../lib/slug.js';
import Wizard from '../components/wizard/Wizard.jsx';
import { AppAlert } from '../components/app/forms.jsx';

function Centered({ children }) {
  return <div className="mx-auto max-w-xl px-4 py-24 text-center">{children}</div>;
}

export default function EditPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { data, error, loading, reload } = useResource((signal) => getPage(slug, signal), [slug, user?.id]);
  useDocumentTitle(data ? `Editing ${data.page.title}` : 'Edit page');

  const page = data?.page;
  const initialValues = useMemo(() => (page ? pageToDraft(page) : null), [page]);

  if (loading && !data) {
    return (
      <Centered>
        <div role="status" className="flex flex-col items-center gap-4 text-app-muted">
          <span className="size-8 animate-spin rounded-full border-2 border-app-border border-t-app-accent" />
          Loading the page…
        </div>
      </Centered>
    );
  }
  if (error) {
    return (
      <Centered>
        <AppAlert>{error.status === 404 ? 'This page doesn’t exist.' : error.message}</AppAlert>
        <Link to="/my-pages" className="app-btn app-btn-secondary mt-6">
          Back to my pages
        </Link>
      </Centered>
    );
  }
  if (!data.canEdit) {
    return (
      <Centered>
        <h1 className="m-0 mb-2 font-display text-4xl font-medium">You can’t edit this page</h1>
        <p className="m-0 text-app-muted">Only the person who created “{page.title}” can edit it.</p>
        <Link to={pagePath(page.slug)} className="app-btn app-btn-primary mt-8">
          Back to the page
        </Link>
      </Centered>
    );
  }

  const sectionId = params.get('section');
  const focusSection = sectionId && page.sections.some((s) => s.id === sectionId) ? sectionId : undefined;

  return (
    <Wizard
      // Re-mount on a new revision (after "Load latest version").
      key={page.currentRevisionId}
      mode="edit"
      slug={page.slug}
      baseRevisionId={page.currentRevisionId}
      initialValues={initialValues}
      initialStep={focusSection ? 3 : 0}
      focusSectionId={focusSection}
      onReloadLatest={reload}
    />
  );
}
