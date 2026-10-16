import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import PageFrame from '../components/layout/PageFrame.jsx';
import Message from '../components/ui/Message.jsx';
import Icon from '../components/ui/Icon.jsx';

/** Temporary stand-in for routes that are planned but not built yet. variant: 'app' | 'wiki'. */
export default function ComingSoonPage({ title, variant = 'app' }) {
  useDocumentTitle(title);
  if (variant === 'wiki') {
    return (
      <PageFrame title={title}>
        <Message>This page is not built yet.</Message>
      </PageFrame>
    );
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-app-gold-soft text-app-gold">
        <Icon name="sparkle" size={24} />
      </span>
      <h1 className="mt-5 mb-2 font-display text-4xl font-medium">{title}</h1>
      <p className="m-0 text-app-muted">This part of MyWiki is being built. Check back soon.</p>
    </div>
  );
}
