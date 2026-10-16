import { useRef, useState } from 'react';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { uploadImage } from '../../../api/uploads.js';
import { AppAlert, AppField, AppInput } from '../../app/forms.jsx';
import Icon from '../../ui/Icon.jsx';
import DateField from '../DateField.jsx';
import { useFieldErrors } from '../fieldError.js';

const PRESETS = ['Occupation', 'Nationality', 'Alma mater', 'Years active', 'Known for', 'Spouse', 'Children', 'Website'];
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024;

function PhotoUpload() {
  const { control, setValue, register } = useFormContext();
  const err = useFieldErrors();
  const url = useWatch({ control, name: 'infobox.image.url' });
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  const onFile = async (file) => {
    setError(null);
    if (!file) return;
    if (!ACCEPT.includes(file.type)) return setError('Please choose a JPEG, PNG, WebP or GIF image.');
    if (file.size > MAX_BYTES) return setError('That image is larger than 5 MB.');
    setProgress(0);
    try {
      const res = await uploadImage(file, { onProgress: setProgress });
      setValue('infobox.image.url', res.url, { shouldDirty: true, shouldValidate: false });
    } catch (e) {
      setError(e.code === 'UNAUTHENTICATED' ? 'Your session expired. Please log in again.' : e.message || 'Upload failed.');
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-app-border bg-app-surface-muted text-app-muted">
          {url ? <img src={url} alt="" className="size-full object-cover" /> : <Icon name="image" size={30} />}
        </div>
        <div className="space-y-2">
          <input ref={inputRef} type="file" accept={ACCEPT.join(',')} className="sr-only" id="photo-input" onChange={(e) => onFile(e.target.files?.[0])} />
          <div className="flex flex-wrap gap-2">
            <label htmlFor="photo-input" className={`app-btn app-btn-secondary app-btn-sm cursor-pointer ${progress != null ? 'pointer-events-none opacity-60' : ''}`}>
              <Icon name="image" size={14} /> {url ? 'Replace photo' : 'Upload a photo'}
            </label>
            {url && (
              <button
                type="button"
                className="app-btn app-btn-ghost app-btn-sm !text-app-danger"
                onClick={() => setValue('infobox.image', { url: '', alt: '', caption: '' }, { shouldDirty: true })}
              >
                Remove
              </button>
            )}
          </div>
          <p className="m-0 text-xs text-app-muted">JPEG, PNG, WebP or GIF, up to 5 MB.</p>
          {progress != null && (
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-app-surface-muted" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
              <div className="h-full bg-app-accent transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          )}
        </div>
      </div>
      {error && <AppAlert>{error}</AppAlert>}
      {url && (
        <div className="grid gap-5 sm:grid-cols-2">
          <AppField label="Photo description" hint="For people who can’t see the image." error={err('infobox.image.alt')}>
            <AppInput placeholder="e.g. Ram Singh smiling, in 2024" {...register('infobox.image.alt')} />
          </AppField>
          <AppField label="Caption (optional)" error={err('infobox.image.caption')}>
            <AppInput placeholder="e.g. Singh in 2024" {...register('infobox.image.caption')} />
          </AppField>
        </div>
      )}
    </div>
  );
}

function FieldRows() {
  const { control, register } = useFormContext();
  const err = useFieldErrors();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'infobox.fields' });
  const rows = useWatch({ control, name: 'infobox.fields' }) ?? [];
  const used = new Set(rows.map((r) => r.label.trim().toLowerCase()));
  const available = PRESETS.filter((p) => !used.has(p.toLowerCase()));
  const full = fields.length >= 30;

  return (
    <div className="space-y-3">
      {fields.length === 0 && <p className="m-0 text-sm text-app-muted">No rows yet. Pick some below — they appear in the box on the right of the page.</p>}
      {fields.map((f, i) => (
        <div key={f.id} className="flex items-start gap-2">
          <div className="grid flex-1 gap-2 sm:grid-cols-[11rem_minmax(0,1fr)]">
            <div>
              <AppInput aria-label={`Row ${i + 1} label`} placeholder="Label" aria-invalid={err(`infobox.fields.${i}.label`) ? true : undefined} {...register(`infobox.fields.${i}.label`)} />
              {err(`infobox.fields.${i}.label`) && <p className="m-0 mt-1 text-xs text-app-danger">{err(`infobox.fields.${i}.label`)}</p>}
            </div>
            <div>
              <AppInput
                aria-label={`Row ${i + 1} value`}
                placeholder={rows[i]?.label === 'Website' ? '[https://example.com example.com]' : 'Value'}
                aria-invalid={err(`infobox.fields.${i}.value`) ? true : undefined}
                {...register(`infobox.fields.${i}.value`)}
              />
              {err(`infobox.fields.${i}.value`) && <p className="m-0 mt-1 text-xs text-app-danger">{err(`infobox.fields.${i}.value`)}</p>}
            </div>
          </div>
          <div className="flex shrink-0 pt-1">
            <button type="button" className="app-icon-btn size-9" aria-label={`Move row ${i + 1} up`} disabled={i === 0} onClick={() => move(i, i - 1)}>
              <Icon name="arrowUp" size={14} />
            </button>
            <button type="button" className="app-icon-btn size-9" aria-label={`Move row ${i + 1} down`} disabled={i === fields.length - 1} onClick={() => move(i, i + 1)}>
              <Icon name="arrowDown" size={14} />
            </button>
            <button type="button" className="app-icon-btn size-9 hover:!text-app-danger" aria-label={`Remove row ${i + 1}`} onClick={() => remove(i)}>
              <Icon name="trash" size={14} />
            </button>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2 pt-1">
        {available.map((p) => (
          <button key={p} type="button" disabled={full} className="app-btn app-btn-secondary app-btn-sm h-8 font-medium" onClick={() => append({ label: p, value: '' }, { shouldFocus: true, focusName: `infobox.fields.${fields.length}.value` })}>
            <Icon name="add" size={12} /> {p}
          </button>
        ))}
        <button type="button" disabled={full} className="app-btn app-btn-ghost app-btn-sm h-8" onClick={() => append({ label: '', value: '' })}>
          <Icon name="add" size={12} /> Custom row
        </button>
      </div>
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="space-y-4 border-t border-app-border pt-6 first:border-t-0 first:pt-0">
      <div>
        <h3 className="m-0 text-base font-semibold">{title}</h3>
        {description && <p className="m-0 mt-0.5 text-sm text-app-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function InfoboxStep() {
  const { control, register } = useFormContext();
  const err = useFieldErrors();
  const deathDate = useWatch({ control, name: 'infobox.deathDate' });
  const [showDeath, setShowDeath] = useState(Boolean(deathDate));

  return (
    <div className="space-y-8">
      <Section title="Photo">
        <PhotoUpload />
      </Section>

      <Section title="Birth">
        <div className="grid gap-5 sm:grid-cols-2">
          <AppField label="Date of birth" error={err('infobox.birthDate')}>
            {(p) => <Controller control={control} name="infobox.birthDate" render={({ field }) => <DateField {...field} {...p} />} />}
          </AppField>
          <AppField label="Place of birth" error={err('infobox.birthPlace')}>
            <AppInput placeholder="e.g. Jaipur, Rajasthan, India" {...register('infobox.birthPlace')} />
          </AppField>
        </div>
        {!showDeath ? (
          <button type="button" className="text-sm font-medium text-app-accent hover:underline" onClick={() => setShowDeath(true)}>
            + Add date of death
          </button>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <AppField label="Date of death" error={err('infobox.deathDate')}>
              {(p) => <Controller control={control} name="infobox.deathDate" render={({ field }) => <DateField {...field} {...p} />} />}
            </AppField>
            <AppField label="Place of death" error={err('infobox.deathPlace')}>
              <AppInput {...register('infobox.deathPlace')} />
            </AppField>
          </div>
        )}
      </Section>

      <Section title="Details" description="Rows in the infobox. Values can include links, like [[IIT Delhi]].">
        <FieldRows />
      </Section>

      <Section title="Infobox heading">
        <AppField label="Name shown at the top of the box (optional)" hint="Leave empty to use the page title." error={err('infobox.name')}>
          <AppInput {...register('infobox.name')} />
        </AppField>
      </Section>
    </div>
  );
}
