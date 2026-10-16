import { useEffect } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router';
import { getPage } from '../api/pages.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useResource } from '../hooks/useResource.js';
import { useNoIndex } from '../hooks/useNoIndex.js';
import { visibilityOf } from '../lib/visibility.js';
import { slugify, humanizeSlug, pagePath } from '../lib/slug.js';
import Article from '../components/article/Article.jsx';
import MissingArticle from '../components/article/MissingArticle.jsx';
import PageFrame from '../components/layout/PageFrame.jsx';
import Message from '../components/ui/Message.jsx';
import Button from '../components/ui/Button.jsx';

function ArticleSkeleton() {
  return (
    <PageFrame title={<span className="inline-block h-[1em] w-64 animate-pulse rounded-[2px] bg-wiki-interactive" />}>
      <div className="space-y-3" aria-busy="true" aria-label="Loading article">
        {[100, 95, 98, 60, 0, 92, 97, 80].map((w, i) => (
          <div key={i} className="h-3.5 animate-pulse rounded-[2px] bg-wiki-interactive" style={{ width: `${w}%` }} />
        ))}
      </div>
    </PageFrame>
  );
}

export function LoadError({ error, onRetry, title = 'Error' }) {
  return (
    <PageFrame title={title}>
      <Message type="error">
        <p className="m-0">{error?.message || 'Something went wrong.'}</p>
        {onRetry && (
          <Button className="mt-2" onClick={onRetry}>
            Try again
          </Button>
        )}
      </Message>
    </PageFrame>
  );
}

/** Shown to the owner only: unlisted status, or a warning when a visibility change didn't save. */
function OwnerVisibilityNotice({ page, failed }) {
  const visibility = visibilityOf(page);
  if (failed && failed !== visibility) {
    return (
      <div className="mw-message-box mw-message-box-error">
        <b>Your page was saved, but its visibility could not be set to “{failed}”.</b> It is currently{' '}
        <b>{visibility}</b>
        {visibility === 'public' && ' and can be found in Explore and search'}. Try again from{' '}
        <Link to="/my-pages">My pages</Link>.
      </div>
    );
  }
  if (visibility !== 'unlisted') return null;
  return (
    <div className="mw-message-box">
      <b>This page is unlisted.</b> Only people with the link can see it; it does not appear in Explore or search.
      Only you can see this notice. <Link to="/my-pages">Change visibility</Link>
    </div>
  );
}

export default function ArticlePage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const { data, error, loading, reload } = useResource((signal) => getPage(slug, signal), [slug, user?.id]);
  const notFound = error?.status === 404;

  useDocumentTitle(data?.page?.title ?? (notFound ? humanizeSlug(slug) : null));
  useNoIndex(visibilityOf(data?.page) === 'unlisted');

  // Scroll to #fragment once the content exists.
  useEffect(() => {
    if (!data || !location.hash) return;
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    el?.scrollIntoView();
  }, [data, location.hash]);

  // Keep showing the current article while it refetches (e.g. after logging in), but not another page's.
  const isOtherPage = data && data.page.slug !== slugify(slug);
  if (loading && (!data || isOtherPage)) return <ArticleSkeleton />;
  if (notFound) return <MissingArticle slug={slug} />;
  if (error) return <LoadError error={error} onRetry={reload} title={humanizeSlug(slug)} />;

  const { page, linkStatus, canEdit } = data;
  // Redirect non-canonical URLs (e.g. /Ram-Singh) to the real slug.
  if (page.slug !== slug) return <Navigate to={pagePath(page.slug) + location.hash} replace />;

  return (
    <Article
      page={page}
      linkStatus={linkStatus}
      canEdit={canEdit}
      notice={canEdit && <OwnerVisibilityNotice page={page} failed={location.state?.visibilityFailed} />}
      editSectionHref={(sectionId) => `${pagePath(page.slug)}/edit?section=${encodeURIComponent(sectionId)}`}
    />
  );
}
