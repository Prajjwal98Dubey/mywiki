import { useId, useState } from 'react';
import Icon from '../ui/Icon.jsx';

function PinnableHeader({ title, actionLabel, onAction }) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2 border-b border-wiki-border-subtle pb-1">
      <h2 className="m-0 text-sm font-bold">{title}</h2>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="cdx-button cdx-button--quiet min-h-0 px-1.5 py-0.5 text-[0.8125rem] font-normal"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function Entry({ entry, activeId, expanded, onToggle, onNavigate }) {
  const listId = useId();
  const hasChildren = entry.children.length > 0;
  const active = entry.id === activeId;
  return (
    <li className="relative">
      {hasChildren && (
        <button
          type="button"
          className="absolute top-[0.3rem] -left-5 flex size-4 items-center justify-center rounded-[2px] text-wiki-text hover:bg-wiki-interactive"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-label={`Toggle ${entry.text} subsection`}
          onClick={() => onToggle(entry.id)}
        >
          <Icon name={expanded ? 'expand' : 'next'} size={10} />
        </button>
      )}
      <a
        href={`#${entry.id}`}
        onClick={onNavigate}
        className={`block py-[0.3125rem] leading-[1.4] ${active ? 'font-bold text-wiki-text' : ''}`}
        aria-current={active ? 'location' : undefined}
      >
        {entry.text}
      </a>
      {hasChildren && (
        <ul id={listId} hidden={!expanded} className="m-0 ml-3 list-none p-0">
          {entry.children.map((child) => (
            <li key={child.id}>
              <a
                href={`#${child.id}`}
                onClick={onNavigate}
                className={`block py-[0.3125rem] leading-[1.4] ${child.id === activeId ? 'font-bold text-wiki-text' : ''}`}
                aria-current={child.id === activeId ? 'location' : undefined}
              >
                {child.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Vector 2022 "Contents" list.
 * entries: [{ id, text, children: [{ id, text }] }]; activeId from useScrollSpy.
 */
export default function TableOfContents({ entries, activeId, pinAction, onPinAction, onNavigate }) {
  // User overrides of the collapsed/expanded state; otherwise the active group auto-expands.
  const [overrides, setOverrides] = useState({});
  const isExpanded = (e) =>
    overrides[e.id] ?? (e.id === activeId || e.children.some((c) => c.id === activeId));
  const toggle = (id) => {
    const entry = entries.find((e) => e.id === id);
    setOverrides((o) => ({ ...o, [id]: !isExpanded(entry) }));
  };

  return (
    <div className="text-sm">
      <PinnableHeader title="Contents" actionLabel={pinAction} onAction={onPinAction} />
      <ul className="m-0 list-none py-0 pr-0 pl-5">
        <li>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0 });
              history.replaceState(null, '', window.location.pathname + window.location.search);
              onNavigate?.();
            }}
            className={`block py-[0.3125rem] leading-[1.4] ${activeId == null ? 'font-bold text-wiki-text' : ''}`}
          >
            (Top)
          </a>
        </li>
        {entries.map((entry) => (
          <Entry
            key={entry.id}
            entry={entry}
            activeId={activeId}
            expanded={isExpanded(entry)}
            onToggle={toggle}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </div>
  );
}
