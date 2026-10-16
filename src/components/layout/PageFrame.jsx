import { useMemo } from 'react';
import { useAppearance } from '../../context/AppearanceContext.jsx';
import { BREAKPOINTS, useMediaQuery } from '../../hooks/useMediaQuery.js';
import { useScrollSpy } from '../../hooks/useScrollSpy.js';
import TableOfContents from '../toc/TableOfContents.jsx';
import TocDropdown from '../toc/TocDropdown.jsx';
import AppearancePanel from '../appearance/AppearancePanel.jsx';

/**
 * Vector 2022 page columns:  [TOC sidebar] | [title bar, tabs, body | pinned Appearance]
 * Every page renders through this so the title bar, TOC and Appearance column behave the same.
 */
export default function PageFrame({ title, tabs, tocEntries, children, hideTitle = false }) {
  const { tocPinned, setTocPinned, pinned: appearancePinned, setPinned } = useAppearance();
  const tocWide = useMediaQuery(BREAKPOINTS.toc);
  const wide = useMediaQuery(BREAKPOINTS.wide);

  const hasToc = Boolean(tocEntries?.length);
  const showSidebar = hasToc && tocPinned && tocWide;
  const showAppearance = appearancePinned && wide;

  const headingIds = useMemo(
    () => (tocEntries || []).flatMap((e) => [e.id, ...e.children.map((c) => c.id)]),
    [tocEntries],
  );
  const activeId = useScrollSpy(hasToc ? headingIds : [], 72);

  return (
    <div className={showSidebar ? 'grid grid-cols-[var(--column-width)_minmax(0,1fr)] gap-x-6' : ''}>
      {showSidebar && (
        <nav aria-label="Contents" className="relative">
          <div className="sticky top-[calc(var(--sticky-offset)+0.75rem)] mt-3 max-h-[calc(100vh-var(--sticky-offset)-1.5rem)] overflow-y-auto pr-1 pb-4">
            <TableOfContents
              entries={tocEntries}
              activeId={activeId}
              pinAction="hide"
              onPinAction={() => setTocPinned(false)}
            />
          </div>
        </nav>
      )}

      <main id="content" className="min-w-0 pb-8" tabIndex={-1}>
        <header className={hideTitle ? 'sr-only' : 'mw-page-title'}>
          {hasToc && !showSidebar && (
            <TocDropdown
              entries={tocEntries}
              activeId={activeId}
              canPin={tocWide}
              onPin={() => setTocPinned(true)}
            />
          )}
          <h1 id="firstHeading" className="firstHeading">
            {title}
          </h1>
        </header>
        {tabs ?? <div className="mb-4" />}

        <div className="flex gap-6">
          <div id="bodyContent" className="min-w-0 flex-1">
            {children}
          </div>
          {showAppearance && (
            <aside aria-label="Appearance" className="w-[var(--column-width)] shrink-0">
              <div className="sticky top-[calc(var(--sticky-offset)+0.75rem)]">
                <AppearancePanel pinAction="hide" onPinAction={() => setPinned(false)} />
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
