import { useState } from 'react';
import { Link } from 'react-router';
import { deletePage, myPages, updatePageSettings } from '../api/pages.js';
import { VISIBILITY_OPTIONS, visibilityOf } from '../lib/visibility.js';
import Dropdown from '../components/ui/Dropdown.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useResource } from '../hooks/useResource.js';
import { pagePath } from '../lib/slug.js';
import PageCard from '../components/app/PageCard.jsx';
import { AppAlert } from '../components/app/forms.jsx';
import Dialog from '../components/ui/Dialog.jsx';
import Icon from '../components/ui/Icon.jsx';

/** Switch a page between public and unlisted (PATCH …/settings — no new revision). */
function VisibilityMenu({ page, onChanged, onError }) {
  const current = visibilityOf(page);
  const option = VISIBILITY_OPTIONS.find((o) => o.value === current);
  const [saving, setSaving] = useState(false);
  const choose = async (value, close) => {
    close();
    if (value === current) return;
    setSaving(true);
    try {
      const res = await updatePageSettings(page.slug, { visibility: value });
      onChanged(visibilityOf(res?.page ?? { visibility: value }));
    } catch (err) {
      onError(err.status === 404 || err.status === 405 ? 'Changing visibility isn’t available on the server yet.' : err.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dropdown
      variant="app"
      label={`Visibility: ${option.label}`}
      buttonClassName="app-btn app-btn-ghost app-btn-sm"
      button={
        <>
          <Icon name={option.icon} size={14} /> {saving ? 'Saving…' : option.label} <Icon name="expand" size={10} />
        </>
      }
      panelClassName="w-72"
    >
      {({ close }) => (
        <ul className="m-0 list-none p-0" aria-label="Visibility">
          {VISIBILITY_OPTIONS.map((o) => (
            <li key={o.value}>
              <button type="button" className="app-menu-item items-start" disabled={o.comingSoon} aria-pressed={o.value === current} onClick={() => choose(o.value, close)}>
                <Icon name={o.icon} size={15} className="mt-0.5" />
                <span className="flex-1">
                  <span className="flex items-center gap-2 font-medium text-app-ink">
                    {o.label}
                    {o.comingSoon && <span className="text-[0.68rem] font-semibold text-app-muted">Coming soon</span>}
                  </span>
                  <span className="block text-xs text-app-muted">{o.description}</span>
                </span>
                {o.value === current && <Icon name="check" size={15} className="mt-0.5 text-app-accent" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Dropdown>
  );
}

function CopyLinkButton({ slug }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${pagePath(slug)}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <button type="button" className="app-btn app-btn-ghost app-btn-sm" onClick={copy} aria-live="polite">
      <Icon name={copied ? 'check' : 'copy'} size={14} /> {copied ? 'Copied' : 'Copy link'}
    </button>
  );
}

export default function MyPagesPage() {
  useDocumentTitle('My pages');
  const { data, error, loading, reload, setData } = useResource((signal) => myPages(signal), []);
  const [confirming, setConfirming] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [actionError, setActionError] = useState(null);
  const pages = data?.pages ?? [];

  const doDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deletePage(confirming.slug);
      setData((d) => ({ ...d, pages: d.pages.filter((p) => p.slug !== confirming.slug) }));
      setNotice(`“${confirming.title}” was deleted.`);
      setConfirming(null);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 font-display text-4xl font-medium">Your pages</h1>
          <p className="mt-1 mb-0 text-app-muted">
            {data ? `${pages.length} ${pages.length === 1 ? 'page' : 'pages'} you own` : 'Pages you own and can edit'}
          </p>
        </div>
        <Link to="/create" className="app-btn app-btn-primary">
          <Icon name="add" size={16} /> New page
        </Link>
      </div>

      {notice && (
        <AppAlert type="success" className="mb-6">
          {notice}
        </AppAlert>
      )}
      {actionError && (
        <AppAlert className="mb-6">
          {actionError}
        </AppAlert>
      )}
      {error && (
        <AppAlert className="mb-6">
          {error.message}{' '}
          <button type="button" className="font-semibold underline" onClick={reload}>
            Try again
          </button>
        </AppAlert>
      )}

      {loading && !data && (
        <div className="grid gap-5 md:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="app-card h-48 animate-pulse bg-app-surface-muted" />
          ))}
        </div>
      )}

      {data && pages.length === 0 && (
        <div className="app-card flex flex-col items-center px-6 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-app-accent-soft text-app-accent">
            <Icon name="article" size={28} />
          </span>
          <h2 className="mt-5 mb-1 font-display text-2xl font-medium">You haven’t written a page yet</h2>
          <p className="m-0 max-w-sm text-sm text-app-muted">
            Start with your own story — or one for someone you know. It only takes a few minutes.
          </p>
          <Link to="/create" className="app-btn app-btn-primary mt-6">
            Create your first page
          </Link>
        </div>
      )}

      {pages.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {pages.map((p) => (
            <PageCard
              key={p.slug}
              page={p}
              dateLabel="Edited"
              date={p.updatedAt}
              footer={
                <div className="flex flex-wrap items-center gap-1">
                  <Link to={`${pagePath(p.slug)}/edit`} className="app-btn app-btn-secondary app-btn-sm">
                    <Icon name="edit" size={14} /> Edit
                  </Link>
                  <Link to={`${pagePath(p.slug)}/history`} className="app-btn app-btn-ghost app-btn-sm">
                    <Icon name="history" size={14} /> History
                  </Link>
                  <VisibilityMenu
                    page={p}
                    onChanged={(visibility) => {
                      setActionError(null);
                      setData((d) => ({ ...d, pages: d.pages.map((x) => (x.slug === p.slug ? { ...x, visibility } : x)) }));
                      setNotice(`“${p.title}” is now ${visibility === 'unlisted' ? 'unlisted — only people with the link can see it' : 'public'}.`);
                    }}
                    onError={(msg) => {
                      setNotice(null);
                      setActionError(msg);
                    }}
                  />
                  <CopyLinkButton slug={p.slug} />
                  <button
                    type="button"
                    className="app-btn app-btn-ghost app-btn-sm ml-auto !text-app-danger"
                    onClick={() => setConfirming(p)}
                  >
                    <Icon name="trash" size={14} /> Delete
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}

      {confirming && (
        <Dialog
          variant="app"
          title="Delete this page?"
          onClose={() => !deleting && setConfirming(null)}
          actions={
            <>
              <button type="button" className="app-btn app-btn-secondary" onClick={() => setConfirming(null)} disabled={deleting}>
                Cancel
              </button>
              <button type="button" className="app-btn app-btn-danger" onClick={doDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete page'}
              </button>
            </>
          }
        >
          <p className="mt-0 text-app-muted">
            “{confirming.title}” and its whole revision history will be permanently deleted. This can’t be undone.
          </p>
          {deleteError && <AppAlert>{deleteError}</AppAlert>}
        </Dialog>
      )}
    </div>
  );
}
