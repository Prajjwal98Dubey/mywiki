import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { suggest } from '../../api/search.js';
import { isAbort } from '../../api/client.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useDismiss } from '../../hooks/useDismiss.js';
import { pagePath } from '../../lib/slug.js';
import { SITE_NAME } from '../../hooks/useDocumentTitle.js';
import Icon from '../ui/Icon.jsx';

/** Bolds the first case-insensitive occurrence of `q` in `text`. */
export function HighlightMatch({ text, q }) {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <b>{text.slice(i, i + q.length)}</b>
      {text.slice(i + q.length)}
    </>
  );
}

// 'wiki' = Vector 2022 search; 'app' = MyWiki's own pill search.
const STYLES = {
  wiki: {
    icon: 'left-2 text-wiki-placeholder',
    input: 'cdx-input rounded-r-none pl-8',
    button: 'cdx-button -ml-px rounded-l-none',
    list: 'wiki-dropdown mt-px',
    option: 'px-3 py-2',
    active: 'bg-wiki-interactive',
    hover: 'hover:bg-wiki-interactive',
    divider: 'border-t border-wiki-border-subtle',
    thumb: 'rounded-[2px] border border-wiki-border-subtle bg-wiki-subtle text-wiki-placeholder',
    title: 'text-wiki-text',
    desc: 'text-wiki-subtle-text',
  },
  app: {
    icon: 'left-3.5 text-app-muted',
    input: 'app-input h-10 rounded-full pr-4 pl-10 text-sm',
    button: 'sr-only',
    list: 'mt-2 overflow-hidden rounded-2xl border border-app-border bg-app-surface p-1.5 shadow-app-lg',
    option: 'rounded-xl px-2.5 py-2',
    active: 'bg-app-surface-muted',
    hover: 'hover:bg-app-surface-muted',
    divider: 'mt-1',
    thumb: 'rounded-lg bg-app-accent-soft text-app-accent',
    title: 'text-app-ink',
    desc: 'text-app-muted',
  },
};

function Thumbnail({ src, className }) {
  return (
    <span className={`flex size-10 shrink-0 items-center justify-center overflow-hidden ${className}`}>
      {src ? <img src={src} alt="" className="size-full object-cover" /> : <Icon name="image" size={18} />}
    </span>
  );
}

/** Search with suggestions (ARIA combobox). */
export default function SearchBox({ autoFocus = false, onDone, className = '', variant = 'wiki' }) {
  const s = STYLES[variant];
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState({ q: '', results: [] });
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listId = useId();
  const term = q.trim();
  const debounced = useDebounce(term, 200);

  useEffect(() => {
    if (!debounced) return undefined;
    const ctrl = new AbortController();
    suggest(debounced, { limit: 8 }, ctrl.signal)
      .then((data) => setSuggestions({ q: debounced, results: data.results || [] }))
      .catch((err) => {
        if (!isAbort(err)) setSuggestions({ q: debounced, results: [] });
      });
    return () => ctrl.abort();
  }, [debounced]);

  useDismiss(rootRef, open, () => setOpen(false));

  const results = term && suggestions.q && term.toLowerCase().startsWith(suggestions.q.toLowerCase()) ? suggestions.results : [];
  const rows = term ? [...results.map((r) => ({ kind: 'page', ...r })), { kind: 'search' }] : [];
  const showList = open && rows.length > 0;

  const finish = () => {
    setQ('');
    setOpen(false);
    setHighlight(-1);
    inputRef.current?.blur();
    onDone?.();
  };
  const go = (row) => {
    if (!row || row.kind === 'search') {
      if (!term) return;
      navigate(`/search?q=${encodeURIComponent(term)}`);
    } else {
      navigate(pagePath(row.slug));
    }
    finish();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => (rows.length ? (h + 1) % rows.length : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => (rows.length ? (h <= 0 ? rows.length - 1 : h - 1) : -1));
    } else if (e.key === 'Escape') {
      if (showList) {
        e.preventDefault();
        setOpen(false);
        setHighlight(-1);
      } else {
        onDone?.();
      }
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form
        role="search"
        className="flex"
        onSubmit={(e) => {
          e.preventDefault();
          go(showList && highlight >= 0 ? rows[highlight] : null);
        }}
      >
        <div className="relative min-w-0 flex-1">
          <Icon name="search" size={16} className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${s.icon}`} />
          <input
            ref={inputRef}
            type="search"
            name="search"
            autoFocus={autoFocus}
            autoComplete="off"
            placeholder={`Search ${SITE_NAME}`}
            aria-label={`Search ${SITE_NAME}`}
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showList && highlight >= 0 ? `${listId}-${highlight}` : undefined}
            className={s.input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
              setHighlight(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
          />
        </div>
        <button type="submit" className={s.button}>
          Search
        </button>
      </form>

      {showList && (
        <ul id={listId} role="listbox" aria-label="Search suggestions" className={`absolute top-full right-0 left-0 z-50 m-0 list-none ${s.list}`}>
          {rows.map((row, i) => (
            <li
              key={row.kind === 'page' ? row.slug : '__search'}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === highlight}
              className={`flex cursor-pointer items-center gap-3 ${s.option} ${i === highlight ? s.active : s.hover} ${row.kind === 'search' ? s.divider : ''}`}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(row)}
            >
              {row.kind === 'page' ? (
                <>
                  <Thumbnail src={row.thumbnail} className={s.thumb} />
                  <span className="min-w-0">
                    <span className={`block truncate ${s.title}`}>
                      <HighlightMatch text={row.title} q={term} />
                    </span>
                    {row.shortDescription && (
                      <span className={`block truncate text-[0.8125rem] ${s.desc}`}>{row.shortDescription}</span>
                    )}
                  </span>
                </>
              ) : (
                <>
                  <span className={`flex size-10 shrink-0 items-center justify-center ${s.desc}`}>
                    <Icon name="search" size={18} />
                  </span>
                  <span className="min-w-0 truncate">
                    Search for pages containing <b>{term}</b>
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
