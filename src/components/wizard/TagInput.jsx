import { useEffect, useId, useState } from 'react';
import { isAbort } from '../../api/client.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import Icon from '../ui/Icon.jsx';

/**
 * Chips + text input. Enter or comma adds, Backspace on empty removes the last chip.
 * `suggest(q, signal)` (optional) returns [{ value, label, hint }] for an autocomplete list.
 */
export default function TagInput({ value = [], onChange, placeholder, max, suggest, id, ...aria }) {
  const [draft, setDraft] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [highlight, setHighlight] = useState(-1);
  const listId = useId();
  const q = useDebounce(draft.trim(), 200);
  const full = max != null && value.length >= max;

  useEffect(() => {
    if (!suggest || !q) return undefined;
    const ctrl = new AbortController();
    suggest(q, ctrl.signal)
      .then((list) => setSuggestions(list))
      .catch((err) => !isAbort(err) && setSuggestions([]));
    return () => ctrl.abort();
  }, [q, suggest]);

  const shown = draft.trim() && q ? suggestions.filter((s) => !value.includes(s.value)) : [];

  const add = (raw) => {
    const v = String(raw).trim();
    setDraft('');
    setHighlight(-1);
    if (!v || full || value.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    onChange([...value, v]);
  };
  const remove = (i) => onChange(value.filter((_, j) => j !== i));

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown' && shown.length) {
      e.preventDefault();
      setHighlight((h) => (h + 1) % shown.length);
    } else if (e.key === 'ArrowUp' && shown.length) {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? shown.length - 1 : h - 1));
    } else if (e.key === 'Enter' || e.key === ',') {
      if (!draft.trim()) return; // let Enter submit the step when the box is empty
      e.preventDefault();
      add(highlight >= 0 && shown[highlight] ? shown[highlight].value : draft);
    } else if (e.key === 'Backspace' && !draft && value.length) {
      remove(value.length - 1);
    } else if (e.key === 'Escape') {
      setHighlight(-1);
      setSuggestions([]);
    }
  };

  return (
    <div className="relative">
      <div className="app-input flex h-auto min-h-[2.875rem] flex-wrap items-center gap-1.5 py-1.5 focus-within:border-app-accent focus-within:shadow-[0_0_0_4px_var(--app-ring)]">
        {value.map((v, i) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-app-accent-soft py-0.5 pr-1 pl-2.5 text-sm text-app-accent-ink">
            {v}
            <button
              type="button"
              className="flex size-5 items-center justify-center rounded-full hover:bg-app-accent/15"
              aria-label={`Remove ${v}`}
              onClick={() => remove(i)}
            >
              <Icon name="close" size={10} />
            </button>
          </span>
        ))}
        <input
          id={id}
          className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-1 text-[0.9375rem] outline-none"
          placeholder={full ? `Maximum of ${max} reached` : placeholder}
          disabled={full}
          value={draft}
          role={suggest ? 'combobox' : undefined}
          aria-expanded={suggest ? shown.length > 0 : undefined}
          aria-controls={suggest ? listId : undefined}
          aria-activedescendant={highlight >= 0 ? `${listId}-${highlight}` : undefined}
          onChange={(e) => {
            setDraft(e.target.value);
            setHighlight(-1);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => draft.trim() && !suggest && add(draft)}
          {...aria}
        />
      </div>
      {shown.length > 0 && (
        <ul id={listId} role="listbox" className="app-menu absolute top-full right-0 left-0 z-30 m-0 mt-1 list-none">
          {shown.map((s, i) => (
            <li
              key={s.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === highlight}
              className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-sm ${i === highlight ? 'bg-app-surface-muted' : 'hover:bg-app-surface-muted'}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => add(s.value)}
            >
              <div className="font-medium">{s.label}</div>
              {s.hint && <div className="text-xs text-app-muted">{s.hint}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
