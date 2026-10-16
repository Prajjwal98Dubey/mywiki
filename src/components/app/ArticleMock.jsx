import { useLayoutEffect, useRef, useState } from 'react';
import Article from '../article/Article.jsx';
import Icon from '../ui/Icon.jsx';
import { demoLinkStatus, demoPage } from '../../lib/demoPage.js';
import { displayUrl } from '../../lib/slug.js';

const INNER_WIDTH = 760;

/** A browser window showing a real, scaled-down MyWiki article (decorative). */
export default function ArticleMock({ height = 440, className = '' }) {
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(0.6);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / INNER_WIDTH));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={`min-w-0 overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-app-lg ${className}`} aria-hidden="true">
      <div className="flex h-10 items-center gap-3 border-b border-app-border bg-app-surface-muted px-4">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex h-6 max-w-[16rem] flex-1 items-center justify-center gap-1.5 rounded-md bg-app-surface px-3 text-[0.72rem] text-app-muted">
          <Icon name="lock" size={10} />
          <span className="truncate">{displayUrl(demoPage.slug)}</span>
        </div>
        <div className="w-10" />
      </div>
      <div ref={viewportRef} className="relative overflow-hidden bg-[var(--bg-page)]" style={{ height }}>
        <div inert style={{ width: INNER_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }} className="px-8 pt-5">
          <Article page={demoPage} linkStatus={demoLinkStatus} mode="preview" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--bg-page)] to-transparent" />
      </div>
    </div>
  );
}
