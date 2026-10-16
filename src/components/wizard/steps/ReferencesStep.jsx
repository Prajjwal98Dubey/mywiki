import { useCallback, useState } from 'react';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { suggest } from '../../../api/search.js';
import { countCites, emptyReference, nextRefId, removeCites } from '../../../lib/pageDraft.js';
import { slugify } from '../../../lib/slug.js';
import { AppField, AppInput } from '../../app/forms.jsx';
import Dialog from '../../ui/Dialog.jsx';
import Icon from '../../ui/Icon.jsx';
import TagInput from '../TagInput.jsx';
import { useFieldErrors } from '../fieldError.js';

const TYPES = [
  ['web', 'Website'],
  ['news', 'News article'],
  ['book', 'Book'],
  ['other', 'Other'],
];

function Block({ title, description, children }) {
  return (
    <section className="space-y-4 border-t border-app-border pt-7 first:border-t-0 first:pt-0">
      <div>
        <h3 className="m-0 text-base font-semibold">{title}</h3>
        {description && <p className="m-0 mt-0.5 text-sm text-app-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function ReferenceCard({ index, onRemove }) {
  const { control, register } = useFormContext();
  const err = useFieldErrors();
  const values = useWatch({ control });
  const ref = values.references?.[index];
  if (!ref) return null;
  const uses = countCites(values, ref.id);
  const f = (name) => `references.${index}.${name}`;

  return (
    <li className="app-card list-none space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-md bg-app-surface-muted px-2 py-0.5 font-mono text-xs">{ref.id}</span>
          <span className="text-app-muted">{uses === 0 ? 'Not cited yet' : `Cited ${uses} ${uses === 1 ? 'time' : 'times'}`}</span>
        </div>
        <button type="button" className="app-icon-btn hover:!text-app-danger" aria-label={`Delete reference ${ref.id}`} onClick={() => onRemove(index, uses)}>
          <Icon name="trash" size={14} />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <AppField label="Type">
          <select className="app-input" {...register(f('type'))}>
            {TYPES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </AppField>
        <AppField label="Title" error={err(f('title'))}>
          <AppInput {...register(f('title'))} />
        </AppField>
      </div>
      {ref.type !== 'book' && (
        <AppField label="Link" error={err(f('url'))}>
          <AppInput type="url" placeholder="https://" {...register(f('url'))} />
        </AppField>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <AppField label="Author (optional)" error={err(f('author'))}>
          <AppInput {...register(f('author'))} />
        </AppField>
        <AppField label={ref.type === 'news' ? 'Newspaper or site' : 'Publisher (optional)'} error={err(f('publisher'))}>
          <AppInput {...register(f('publisher'))} />
        </AppField>
        <AppField label="Published (optional)" hint="YYYY, YYYY-MM or YYYY-MM-DD" error={err(f('date'))}>
          <AppInput placeholder="2024-05-01" {...register(f('date'))} />
        </AppField>
        {ref.type !== 'book' && (
          <AppField label="Accessed (optional)" hint="When you read it" error={err(f('accessDate'))}>
            <AppInput placeholder="YYYY-MM-DD" {...register(f('accessDate'))} />
          </AppField>
        )}
      </div>
    </li>
  );
}

function References() {
  const { control, getValues, setValue } = useFormContext();
  const err = useFieldErrors();
  const { fields, append, remove } = useFieldArray({ control, name: 'references', keyName: 'key' });
  const [confirm, setConfirm] = useState(null);

  const doRemove = (index) => {
    const id = getValues(`references.${index}.id`);
    // Also strip its {{cite|id}} markers so the page still validates.
    setValue('lead', removeCites(getValues('lead'), id), { shouldDirty: true });
    getValues('sections').forEach((s, i) => setValue(`sections.${i}.content`, removeCites(s.content, id), { shouldDirty: true }));
    remove(index);
    setConfirm(null);
  };

  return (
    <>
      {err('references') && <p className="m-0 text-sm text-app-danger">{err('references')}</p>}
      {fields.length > 0 && (
        <ol className="m-0 space-y-4 p-0">
          {fields.map((f, i) => (
            <ReferenceCard key={f.key} index={i} onRemove={(idx, uses) => (uses ? setConfirm({ index: idx, uses }) : doRemove(idx))} />
          ))}
        </ol>
      )}
      <button
        type="button"
        disabled={fields.length >= 200}
        className="app-btn app-btn-secondary app-btn-sm"
        onClick={() => append(emptyReference(nextRefId(getValues('references'))), { shouldFocus: true, focusName: `references.${fields.length}.title` })}
      >
        <Icon name="add" size={14} /> Add a source
      </button>
      {confirm && (
        <Dialog
          variant="app"
          title="Delete this source?"
          onClose={() => setConfirm(null)}
          actions={
            <>
              <button type="button" className="app-btn app-btn-secondary app-btn-sm" onClick={() => setConfirm(null)}>
                Keep it
              </button>
              <button type="button" className="app-btn app-btn-danger app-btn-sm" onClick={() => doRemove(confirm.index)}>
                Delete and remove citations
              </button>
            </>
          }
        >
          <p className="m-0 text-app-muted">
            It is cited {confirm.uses} {confirm.uses === 1 ? 'time' : 'times'}. Those [n] markers will be removed from the text too.
          </p>
        </Dialog>
      )}
    </>
  );
}

function ExternalLinks() {
  const { control, register } = useFormContext();
  const err = useFieldErrors();
  const { fields, append, remove } = useFieldArray({ control, name: 'externalLinks' });
  return (
    <>
      {fields.map((f, i) => (
        <div key={f.id} className="flex items-start gap-2">
          <div className="grid flex-1 gap-2 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div>
              <AppInput aria-label={`Link ${i + 1} label`} placeholder="Label, e.g. Official website" aria-invalid={err(`externalLinks.${i}.label`) ? true : undefined} {...register(`externalLinks.${i}.label`)} />
              {err(`externalLinks.${i}.label`) && <p className="m-0 mt-1 text-xs text-app-danger">{err(`externalLinks.${i}.label`)}</p>}
            </div>
            <div>
              <AppInput aria-label={`Link ${i + 1} address`} type="url" placeholder="https://" aria-invalid={err(`externalLinks.${i}.url`) ? true : undefined} {...register(`externalLinks.${i}.url`)} />
              {err(`externalLinks.${i}.url`) && <p className="m-0 mt-1 text-xs text-app-danger">{err(`externalLinks.${i}.url`)}</p>}
            </div>
          </div>
          <button type="button" className="app-icon-btn mt-1 size-9 hover:!text-app-danger" aria-label={`Remove link ${i + 1}`} onClick={() => remove(i)}>
            <Icon name="trash" size={14} />
          </button>
        </div>
      ))}
      <button type="button" disabled={fields.length >= 30} className="app-btn app-btn-secondary app-btn-sm" onClick={() => append({ label: '', url: 'https://' }, { shouldFocus: true, focusName: `externalLinks.${fields.length}.label` })}>
        <Icon name="add" size={14} /> Add a link
      </button>
    </>
  );
}

function CategoryQuickAdd() {
  const { control, setValue } = useFormContext();
  const [categories, birthDate, deathDate] = useWatch({ control, name: ['categories', 'infobox.birthDate', 'infobox.deathDate'] });
  const ideas = [
    !deathDate && 'Living people',
    birthDate && `${birthDate.slice(0, 4)} births`,
    deathDate && `${deathDate.slice(0, 4)} deaths`,
  ].filter((c) => c && !categories.includes(c));
  if (!ideas.length || categories.length >= 20) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-app-muted">Suggested:</span>
      {ideas.map((c) => (
        <button key={c} type="button" className="app-btn app-btn-secondary app-btn-sm h-7 font-medium" onClick={() => setValue('categories', [...categories, c], { shouldDirty: true })}>
          <Icon name="add" size={11} /> {c}
        </button>
      ))}
    </div>
  );
}

export default function ReferencesStep() {
  const { control } = useFormContext();
  const err = useFieldErrors();
  const suggestPages = useCallback(
    (q, signal) =>
      suggest(q, { limit: 6 }, signal).then((d) =>
        (d.results || []).map((r) => ({
          // Plain title when it maps to the slug, otherwise the exact slug (e.g. sam-singh-1rqdasr3r).
          value: slugify(r.title) === r.slug ? r.title : r.slug,
          label: r.title,
          hint: r.shortDescription,
        })),
      ),
    [],
  );

  return (
    <div className="space-y-8">
      <Block title="References" description="Sources for what the page says. Cite them in the text with the Cite button.">
        <References />
      </Block>

      <Block title="See also" description="Other MyWiki pages related to this person.">
        <AppField label="Pages" hint="Type a name and press Enter." error={err('seeAlso')}>
          {(p) => <Controller control={control} name="seeAlso" render={({ field }) => <TagInput {...p} value={field.value} onChange={field.onChange} max={30} suggest={suggestPages} placeholder="e.g. Meera Singh" />} />}
        </AppField>
      </Block>

      <Block title="External links" description="Websites about the person, like a personal site or a profile.">
        <ExternalLinks />
      </Block>

      <Block title="Categories" description="Shown at the bottom of the page.">
        <CategoryQuickAdd />
        <AppField label="Categories" hint="Press Enter or comma after each one." error={err('categories')}>
          {(p) => <Controller control={control} name="categories" render={({ field }) => <TagInput {...p} value={field.value} onChange={field.onChange} max={20} placeholder="e.g. Indian civil engineers" />} />}
        </AppField>
      </Block>
    </div>
  );
}
