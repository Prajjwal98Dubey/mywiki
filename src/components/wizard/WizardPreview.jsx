import { useMemo } from 'react';
import { useDebounce } from '../../hooks/useDebounce.js';
import { draftToInput } from '../../lib/pageDraft.js';
import { displayUrl, slugify } from '../../lib/slug.js';
import Article from '../article/Article.jsx';
import Icon from '../ui/Icon.jsx';

/** The draft rendered with the real article renderer, inside a browser-window frame. */
export default function WizardPreview({ values, slug, className = 'max-h-[calc(100vh-7rem)]' }) {
  const debounced = useDebounce(values, 300);
  const page = useMemo(() => ({ ...draftToInput(debounced), slug: slug || slugify(debounced.title) }), [debounced, slug]);

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-app-md ${className}`}>
      <div className="flex h-9 shrink-0 items-center gap-3 border-b border-app-border bg-app-surface-muted px-3.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 text-xs text-app-muted">
          <Icon name="lock" size={10} />
          <span className="truncate font-mono">{displayUrl(page.slug || 'your-name')}</span>
        </div>
        <span className="text-[0.7rem] font-semibold tracking-wider text-app-muted uppercase">Preview</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--bg-page)] px-6 pt-4 pb-8 text-[var(--color-base)] [--text-size:15px]">
        <Article page={page} mode="preview" />
      </div>
    </div>
  );
}
