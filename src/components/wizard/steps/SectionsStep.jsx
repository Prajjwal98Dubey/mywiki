import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { newSectionId } from '../../../lib/pageDraft.js';
import { AppField, AppInput } from '../../app/forms.jsx';
import Dialog from '../../ui/Dialog.jsx';
import Icon from '../../ui/Icon.jsx';
import WikitextEditor from '../WikitextEditor.jsx';
import { useFieldErrors } from '../fieldError.js';

const TEMPLATES = ['Early life and education', 'Career', 'Personal life', 'Awards and honours'];

function SectionCard({ index, total, sectionId, focused, onMove, onRemove }) {
  const { control, register } = useFormContext();
  const err = useFieldErrors();
  const level = Number(useWatch({ control, name: `sections.${index}.level` }));
  const heading = useWatch({ control, name: `sections.${index}.heading` });

  return (
    <li
      id={`section-card-${sectionId}`}
      className={`app-card list-none space-y-4 p-5 ${level === 3 ? 'ml-6 border-l-4 border-l-app-accent-soft' : ''} ${focused ? 'ring-4 ring-[var(--app-ring)]' : ''}`}
    >
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-[12rem] flex-1">
          <AppField label={level === 3 ? 'Subsection heading' : 'Section heading'} error={err(`sections.${index}.heading`)}>
            <AppInput placeholder="e.g. Career" {...register(`sections.${index}.heading`)} />
          </AppField>
        </div>
        <div className="w-40">
          <AppField label="Type" error={err(`sections.${index}.level`)}>
            <select className="app-input" {...register(`sections.${index}.level`, { setValueAs: Number })}>
              <option value={2}>Section</option>
              <option value={3}>Subsection</option>
            </select>
          </AppField>
        </div>
        <div className="flex gap-0.5 pt-7">
          <button type="button" className="app-icon-btn" aria-label={`Move “${heading || 'section'}” up`} disabled={index === 0} onClick={() => onMove(index, index - 1)}>
            <Icon name="arrowUp" size={14} />
          </button>
          <button type="button" className="app-icon-btn" aria-label={`Move “${heading || 'section'}” down`} disabled={index === total - 1} onClick={() => onMove(index, index + 1)}>
            <Icon name="arrowDown" size={14} />
          </button>
          <button type="button" className="app-icon-btn hover:!text-app-danger" aria-label={`Delete “${heading || 'section'}”`} onClick={() => onRemove(index)}>
            <Icon name="trash" size={14} />
          </button>
        </div>
      </div>
      <AppField label="Content" error={err(`sections.${index}.content`)}>
        {(p) => <Controller control={control} name={`sections.${index}.content`} render={({ field }) => <WikitextEditor {...field} {...p} rows={7} />} />}
      </AppField>
    </li>
  );
}

export default function SectionsStep({ focusSectionId }) {
  const { control, getValues } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'sections', keyName: 'key' });
  const [confirmIndex, setConfirmIndex] = useState(null);
  const headings = (useWatch({ control, name: 'sections' }) ?? []).map((s) => s.heading.trim().toLowerCase());
  const full = fields.length >= 50;

  useEffect(() => {
    if (!focusSectionId) return;
    const card = document.getElementById(`section-card-${focusSectionId}`);
    if (!card) return;
    card.scrollIntoView({ block: 'center' });
    card.querySelector('textarea')?.focus({ preventScroll: true });
  }, [focusSectionId]);

  const add = (heading = '', level = 2) => {
    const lvl = fields.length === 0 ? 2 : level;
    append({ id: newSectionId(), heading, level: lvl, content: '' }, { shouldFocus: true, focusName: heading ? `sections.${fields.length}.content` : `sections.${fields.length}.heading` });
  };

  const requestRemove = (i) => {
    const s = getValues(`sections.${i}`);
    if (s.content.trim()) setConfirmIndex(i);
    else remove(i);
  };

  return (
    <div className="space-y-5">
      <p className="m-0 text-sm text-app-muted">
        Sections become headings in the article and entries in its table of contents. Use subsections to break a long
        section into parts.
      </p>

      {fields.length > 0 && (
        <ol className="m-0 space-y-4 p-0">
          {fields.map((f, i) => (
            <SectionCard
              key={f.key}
              index={i}
              total={fields.length}
              sectionId={f.id}
              focused={focusSectionId === f.id}
              onMove={move}
              onRemove={requestRemove}
            />
          ))}
        </ol>
      )}

      <div className="rounded-2xl border border-dashed border-app-border-strong p-5">
        <div className="mb-3 text-sm font-medium">{fields.length ? 'Add another section' : 'Start with a common section'}</div>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.filter((t) => !headings.includes(t.toLowerCase())).map((t) => (
            <button key={t} type="button" disabled={full} className="app-btn app-btn-secondary app-btn-sm h-8 font-medium" onClick={() => add(t)}>
              <Icon name="add" size={12} /> {t}
            </button>
          ))}
          <button type="button" disabled={full} className="app-btn app-btn-ghost app-btn-sm h-8" onClick={() => add()}>
            <Icon name="add" size={12} /> Blank section
          </button>
          {fields.length > 0 && (
            <button type="button" disabled={full} className="app-btn app-btn-ghost app-btn-sm h-8" onClick={() => add('', 3)}>
              <Icon name="add" size={12} /> Subsection
            </button>
          )}
        </div>
      </div>

      {confirmIndex !== null && (
        <Dialog
          variant="app"
          title="Delete this section?"
          onClose={() => setConfirmIndex(null)}
          actions={
            <>
              <button type="button" className="app-btn app-btn-secondary app-btn-sm" onClick={() => setConfirmIndex(null)}>
                Keep it
              </button>
              <button
                type="button"
                className="app-btn app-btn-danger app-btn-sm"
                onClick={() => {
                  remove(confirmIndex);
                  setConfirmIndex(null);
                }}
              >
                Delete section
              </button>
            </>
          }
        >
          <p className="m-0 text-app-muted">“{getValues(`sections.${confirmIndex}.heading`) || 'Untitled'}” and its text will be removed.</p>
        </Dialog>
      )}
    </div>
  );
}
