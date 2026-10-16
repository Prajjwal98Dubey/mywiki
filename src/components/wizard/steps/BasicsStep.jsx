import { useEffect, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { slugCheck } from '../../../api/pages.js';
import { isAbort } from '../../../api/client.js';
import { useDebounce } from '../../../hooks/useDebounce.js';
import { displayUrl, slugify } from '../../../lib/slug.js';
import { AppField, AppInput } from '../../app/forms.jsx';
import Icon from '../../ui/Icon.jsx';
import VisibilityPicker from '../../app/VisibilityPicker.jsx';
import { useFieldErrors } from '../fieldError.js';

function SlugPreview({ title }) {
  const base = slugify(title);
  const debounced = useDebounce(base, 350);
  const [check, setCheck] = useState(null);

  useEffect(() => {
    if (!debounced) return undefined;
    const ctrl = new AbortController();
    slugCheck(debounced, ctrl.signal)
      .then((res) => setCheck(res))
      .catch((err) => !isAbort(err) && setCheck(null));
    return () => ctrl.abort();
  }, [debounced]);

  if (!base) {
    return <p className="m-0 text-sm text-app-muted">Your page address appears here as you type the name.</p>;
  }
  const current = check && check.slug === base ? check : null;
  return (
    <div className="rounded-xl border border-app-border bg-app-surface-muted/60 px-4 py-3">
      <div className="text-xs font-medium tracking-wide text-app-muted uppercase">Your page address</div>
      <div className="mt-0.5 font-mono text-[0.95rem] break-all text-app-ink">
        {displayUrl(base)}
        {current && !current.available && <span className="text-app-muted">-xxxxxxxxx</span>}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem]" aria-live="polite">
        {!current && <span className="text-app-muted">Checking…</span>}
        {current?.available && (
          <span className="flex items-center gap-1.5 text-app-success">
            <Icon name="check" size={13} /> Available
          </span>
        )}
        {current && !current.available && (
          <span className="text-app-muted">
            Someone already has this name, so your page will get a short unique ending, e.g.{' '}
            <span className="font-mono">{base}-1rqdasr3r</span>.
          </span>
        )}
      </div>
    </div>
  );
}

export default function BasicsStep({ mode, slug }) {
  const { register, control } = useFormContext();
  const err = useFieldErrors();
  const title = useWatch({ control, name: 'title' }) ?? '';

  return (
    <div className="space-y-6">
      <AppField label="Full name" hint="This is the title of the page." error={err('title')}>
        <AppInput autoFocus placeholder="e.g. Ram Singh" maxLength={100} {...register('title')} />
      </AppField>
      <AppField
        label="Short description"
        hint="A few words shown under the name in search, like “Indian civil engineer (born 1987)”."
        error={err('shortDescription')}
      >
        <AppInput placeholder="e.g. Indian civil engineer and photographer" maxLength={120} {...register('shortDescription')} />
      </AppField>
      {mode === 'edit' ? (
        <div className="rounded-xl border border-app-border bg-app-surface-muted/60 px-4 py-3">
          <div className="text-xs font-medium tracking-wide text-app-muted uppercase">Page address</div>
          <div className="mt-0.5 font-mono text-[0.95rem] break-all">{displayUrl(slug)}</div>
          <div className="mt-1 text-[0.8125rem] text-app-muted">The address stays the same when you rename the page.</div>
        </div>
      ) : (
        <SlugPreview title={title} />
      )}
      <Controller control={control} name="visibility" render={({ field }) => <VisibilityPicker value={field.value} onChange={field.onChange} name={field.name} />} />
      {err('visibility') && <p className="m-0 text-[0.8125rem] text-app-danger">{err('visibility')}</p>}
    </div>
  );
}
