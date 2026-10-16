import { useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { suggest } from '../../api/search.js';
import { isAbort } from '../../api/client.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { emptyReference, nextRefId } from '../../lib/pageDraft.js';
import { slugify } from '../../lib/slug.js';
import { isSafeExternalUrl } from '../../lib/wikitext/parser.js';
import { AppField, AppInput } from '../app/forms.jsx';
import Dialog from '../ui/Dialog.jsx';
import Icon from '../ui/Icon.jsx';

function ToolButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm text-app-ink-soft hover:bg-app-surface-muted hover:text-app-ink"
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      <Icon name={icon} size={15} />
    </button>
  );
}

const enterSubmits = (fn) => (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    fn();
  }
};

function DialogActions({ onCancel, onConfirm, confirmLabel, disabled }) {
  return (
    <>
      <button type="button" className="app-btn app-btn-secondary app-btn-sm" onClick={onCancel}>
        Cancel
      </button>
      <button type="button" className="app-btn app-btn-primary app-btn-sm" onClick={onConfirm} disabled={disabled}>
        {confirmLabel}
      </button>
    </>
  );
}

function InternalLinkDialog({ initialLabel, onInsert, onClose }) {
  const [target, setTarget] = useState('');
  const [label, setLabel] = useState(initialLabel);
  const [results, setResults] = useState([]);
  const q = useDebounce(target.trim(), 200);

  useEffect(() => {
    if (!q) return undefined;
    const ctrl = new AbortController();
    suggest(q, { limit: 6 }, ctrl.signal)
      .then((d) => setResults(d.results || []))
      .catch((err) => !isAbort(err) && setResults([]));
    return () => ctrl.abort();
  }, [q]);

  const insert = (t = target, l = label) => {
    const tt = t.trim();
    if (!tt) return;
    const ll = l.trim();
    onInsert(ll && ll !== tt ? `[[${tt}|${ll}]]` : `[[${tt}]]`);
  };

  return (
    <Dialog
      variant="app"
      title="Link to a page"
      onClose={onClose}
      actions={<DialogActions onCancel={onClose} onConfirm={() => insert()} confirmLabel="Insert link" disabled={!target.trim()} />}
    >
      <div className="space-y-4">
        <AppField label="Page" hint="The person's name or page address. Pages that don't exist yet show as red links.">
          <AppInput autoFocus value={target} onChange={(e) => setTarget(e.target.value)} onKeyDown={enterSubmits(() => insert())} placeholder="e.g. Ram Singh" />
        </AppField>
        {q && results.length > 0 && (
          <ul className="m-0 -mt-2 list-none space-y-1 p-0">
            {results.map((r) => (
              <li key={r.slug}>
                <button
                  type="button"
                  className="app-menu-item"
                  onClick={() => {
                    // Use the exact slug when it differs from the title (e.g. ram-singh-1rqdasr3r).
                    const exact = slugify(r.title) === r.slug ? r.title : r.slug;
                    insert(exact, label || (exact === r.slug ? r.title : ''));
                  }}
                >
                  <Icon name="article" size={15} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-app-ink">{r.title}</span>
                    {r.shortDescription && <span className="block truncate text-xs text-app-muted">{r.shortDescription}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <AppField label="Text to show (optional)">
          <AppInput value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={enterSubmits(() => insert())} />
        </AppField>
      </div>
    </Dialog>
  );
}

function ExternalLinkDialog({ initialLabel, onInsert, onClose }) {
  const [url, setUrl] = useState('https://');
  const [label, setLabel] = useState(initialLabel);
  const valid = isSafeExternalUrl(url.trim()) && url.trim() !== 'https://';
  const insert = () => valid && onInsert(label.trim() ? `[${url.trim()} ${label.trim()}]` : `[${url.trim()}]`);
  return (
    <Dialog
      variant="app"
      title="Link to a website"
      onClose={onClose}
      actions={<DialogActions onCancel={onClose} onConfirm={insert} confirmLabel="Insert link" disabled={!valid} />}
    >
      <div className="space-y-4">
        <AppField label="Web address">
          <AppInput autoFocus type="url" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={enterSubmits(insert)} />
        </AppField>
        <AppField label="Text to show (optional)">
          <AppInput value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={enterSubmits(insert)} />
        </AppField>
      </div>
    </Dialog>
  );
}

function CiteDialog({ onInsert, onClose }) {
  const { getValues, setValue } = useFormContext();
  const references = getValues('references');
  const [choice, setChoice] = useState(references[0]?.id ?? '__new');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const isNew = choice === '__new';
  const urlOk = !url.trim() || isSafeExternalUrl(url.trim());
  const canInsert = isNew ? Boolean(title.trim()) && urlOk : Boolean(choice);

  const insert = () => {
    if (!canInsert) return;
    let id = choice;
    if (isNew) {
      id = nextRefId(references);
      const ref = { ...emptyReference(id), title: title.trim(), url: url.trim() };
      setValue('references', [...references, ref], { shouldDirty: true });
    }
    onInsert(`{{cite|${id}}}`);
  };

  return (
    <Dialog
      variant="app"
      title="Cite a source"
      onClose={onClose}
      actions={<DialogActions onCancel={onClose} onConfirm={insert} confirmLabel="Insert citation" disabled={!canInsert} />}
    >
      <fieldset className="m-0 space-y-1.5 border-0 p-0">
        <legend className="mb-2 p-0 text-sm text-app-muted">Adds a numbered footnote like [1] that points to the source.</legend>
        {references.map((r) => (
          <label key={r.id} className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-app-border p-2.5 has-[:checked]:border-app-accent has-[:checked]:bg-app-accent-soft">
            <input type="radio" name="cite-ref" className="mt-1 accent-[var(--app-accent)]" checked={choice === r.id} onChange={() => setChoice(r.id)} />
            <span className="min-w-0">
              <span className="block truncate font-medium">{r.title || <i className="text-app-muted">Untitled source</i>}</span>
              <span className="block truncate text-xs text-app-muted">
                {r.id}
                {r.url && ` · ${r.url}`}
              </span>
            </span>
          </label>
        ))}
        <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-dashed border-app-border-strong p-2.5 has-[:checked]:border-app-accent has-[:checked]:bg-app-accent-soft">
          <input type="radio" name="cite-ref" className="accent-[var(--app-accent)]" checked={isNew} onChange={() => setChoice('__new')} />
          <span className="font-medium">Add a new source</span>
        </label>
      </fieldset>
      {isNew && (
        <div className="mt-4 space-y-4">
          <AppField label="Title" hint="You can add the author, date and more in step 5.">
            <AppInput autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={enterSubmits(insert)} placeholder="e.g. The engineer building bridges" />
          </AppField>
          <AppField label="Link (optional)" error={urlOk ? undefined : 'Enter a full link starting with https://'}>
            <AppInput type="url" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={enterSubmits(insert)} placeholder="https://" />
          </AppField>
        </div>
      )}
    </Dialog>
  );
}

/**
 * Textarea + WikiLite toolbar. Controlled: value/onChange from a react-hook-form Controller.
 * `allowCite` enables the Cite button (lead and sections).
 */
export default function WikitextEditor({ value = '', onChange, onBlur, name, ref: fieldRef, rows = 8, allowCite = true, placeholder, id, ...aria }) {
  const textareaRef = useRef(null);
  const selection = useRef({ start: 0, end: 0 });
  const [dialog, setDialog] = useState(null);
  const { control } = useFormContext();
  const refCount = useWatch({ control, name: 'references' })?.length ?? 0;

  const setRefs = (el) => {
    textareaRef.current = el;
    if (typeof fieldRef === 'function') fieldRef(el);
    else if (fieldRef) fieldRef.current = el;
  };

  const remember = () => {
    const el = textareaRef.current;
    if (el) selection.current = { start: el.selectionStart, end: el.selectionEnd };
  };

  /** Replaces the remembered selection with `text`, then selects [selFrom, selTo) inside it. */
  const replaceSelection = (text, selFrom = text.length, selTo = selFrom) => {
    const { start, end } = selection.current;
    onChange(value.slice(0, start) + text + value.slice(end));
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(start + selFrom, start + selTo);
    });
  };

  const wrap = (marker, placeholderText) => {
    remember();
    const { start, end } = selection.current;
    const selected = value.slice(start, end) || placeholderText;
    replaceSelection(`${marker}${selected}${marker}`, marker.length, marker.length + selected.length);
  };

  const openDialog = (kind) => {
    remember();
    const { start, end } = selection.current;
    setDialog({ kind, label: value.slice(start, end) });
  };

  const insertFromDialog = (text) => {
    if (dialog?.kind === 'cite') selection.current = { start: selection.current.end, end: selection.current.end };
    setDialog(null);
    replaceSelection(text);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-app-border-strong bg-app-surface focus-within:border-app-accent focus-within:shadow-[0_0_0_4px_var(--app-ring)]">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-app-border bg-app-surface-muted/60 px-1.5 py-1" role="toolbar" aria-label="Formatting">
        <ToolButton icon="bold" label="Bold" onClick={() => wrap("'''", 'bold text')} />
        <ToolButton icon="italic" label="Italic" onClick={() => wrap("''", 'italic text')} />
        <span className="mx-1 h-5 w-px bg-app-border" aria-hidden="true" />
        <ToolButton icon="link" label="Link to a page" onClick={() => openDialog('link')} />
        <ToolButton icon="linkExternal" label="Link to a website" onClick={() => openDialog('external')} />
        {allowCite && (
          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm text-app-ink-soft hover:bg-app-surface-muted hover:text-app-ink"
            onClick={() => openDialog('cite')}
          >
            <Icon name="quotes" size={15} /> Cite
            {refCount > 0 && <span className="text-xs text-app-muted">({refCount})</span>}
          </button>
        )}
      </div>
      <textarea
        ref={setRefs}
        id={id}
        name={name}
        rows={rows}
        placeholder={placeholder}
        className="block w-full resize-y border-0 bg-transparent px-3.5 py-3 font-mono text-[0.875rem] leading-relaxed text-app-ink outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => {
          remember();
          onBlur?.(e);
        }}
        {...aria}
      />
      {dialog?.kind === 'link' && <InternalLinkDialog initialLabel={dialog.label} onInsert={insertFromDialog} onClose={() => setDialog(null)} />}
      {dialog?.kind === 'external' && <ExternalLinkDialog initialLabel={dialog.label} onInsert={insertFromDialog} onClose={() => setDialog(null)} />}
      {dialog?.kind === 'cite' && <CiteDialog onInsert={insertFromDialog} onClose={() => setDialog(null)} />}
    </div>
  );
}
