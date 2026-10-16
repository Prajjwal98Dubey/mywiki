import { useFormContext, useWatch } from 'react-hook-form';
import { validatePage, stepForPath } from '../../../lib/pageValidation.js';
import { AppAlert, AppField, AppInput } from '../../app/forms.jsx';
import Icon from '../../ui/Icon.jsx';
import WizardPreview from '../WizardPreview.jsx';
import { VISIBILITY_OPTIONS } from '../../../lib/visibility.js';
import { useFieldErrors } from '../fieldError.js';

function VisibilitySummary({ visibility, onChange }) {
  const o = VISIBILITY_OPTIONS.find((x) => x.value === visibility) ?? VISIBILITY_OPTIONS[0];
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-app-border bg-app-surface px-4 py-3">
      <span className="flex items-center gap-3 text-sm">
        <span className="flex size-9 items-center justify-center rounded-xl bg-app-accent-soft text-app-accent">
          <Icon name={o.icon} size={16} />
        </span>
        <span>
          <b>{o.label}</b>
          <span className="block text-app-muted">{o.description}</span>
        </span>
      </span>
      <button type="button" className="text-sm font-semibold text-app-accent hover:underline" onClick={onChange}>
        Change
      </button>
    </div>
  );
}

export default function ReviewStep({ mode, steps, onGoTo, serverError }) {
  const { control, register } = useFormContext();
  const err = useFieldErrors();
  const values = useWatch({ control });
  const issues = validatePage(values);
  const byStep = new Map();
  for (const i of issues) {
    const s = stepForPath(i.path);
    if (!byStep.has(s)) byStep.set(s, []);
    byStep.get(s).push(i.message);
  }

  return (
    <div className="space-y-6">
      {serverError && <AppAlert>{serverError}</AppAlert>}
      {issues.length > 0 ? (
        <div className="rounded-2xl border border-app-danger/30 bg-app-danger-soft p-4" role="alert">
          <div className="flex items-center gap-2 font-semibold text-app-danger">
            <Icon name="alert" size={16} /> A few things need fixing before you can publish
          </div>
          <ul className="m-0 mt-3 list-none space-y-2 p-0">
            {[...byStep.entries()].map(([step, messages]) => (
              <li key={step} className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-app-surface/70 px-3 py-2 text-sm">
                <span>
                  <b>{steps[step]}:</b> {messages[0]}
                  {messages.length > 1 && <span className="text-app-muted"> (+{messages.length - 1} more)</span>}
                </span>
                <button type="button" className="font-semibold text-app-accent hover:underline" onClick={() => onGoTo(step)}>
                  Fix
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <AppAlert type="success">Everything looks good. This is exactly how your page will look.</AppAlert>
      )}

      <VisibilitySummary visibility={values.visibility} onChange={() => onGoTo(0)} />

      {mode === 'edit' && (
        <AppField label="Summary of your changes (optional)" hint="Shown in the page history, e.g. “Added career section”." error={err('editSummary')}>
          <AppInput maxLength={255} {...register('editSummary')} />
        </AppField>
      )}

      <WizardPreview values={values} className="max-h-none" />
    </div>
  );
}
