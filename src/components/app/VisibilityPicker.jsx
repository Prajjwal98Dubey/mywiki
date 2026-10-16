import { useId } from 'react';
import { VISIBILITY_OPTIONS } from '../../lib/visibility.js';
import Icon from '../ui/Icon.jsx';

/** Radio cards for page visibility. "Private" is shown as coming soon and can't be chosen. */
export default function VisibilityPicker({ value, onChange, name, disabled = false }) {
  const id = useId();
  return (
    <fieldset className="min-w-0 border-0 p-0" disabled={disabled}>
      <legend className="mb-2 p-0 text-sm font-medium text-app-ink">Who can find this page?</legend>
      <div className="grid gap-2.5 sm:grid-cols-3">
        {VISIBILITY_OPTIONS.map((o) => {
          const checked = value === o.value;
          return (
            <label
              key={o.value}
              htmlFor={`${id}-${o.value}`}
              className={`relative flex flex-col gap-1.5 rounded-xl border p-3.5 transition-colors ${
                o.comingSoon
                  ? 'cursor-not-allowed border-dashed border-app-border opacity-60'
                  : checked
                    ? 'cursor-pointer border-app-accent bg-app-accent-soft'
                    : 'cursor-pointer border-app-border-strong hover:border-app-accent/60'
              } has-[:focus-visible]:shadow-[0_0_0_4px_var(--app-ring)]`}
            >
              <input
                id={`${id}-${o.value}`}
                type="radio"
                name={name || `${id}-visibility`}
                value={o.value}
                checked={checked}
                disabled={o.comingSoon}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <span className="flex items-center gap-2 font-semibold">
                <Icon name={o.icon} size={15} className={checked ? 'text-app-accent' : 'text-app-muted'} />
                {o.label}
                {o.comingSoon && (
                  <span className="ml-auto rounded-full bg-app-surface-muted px-2 py-0.5 text-[0.68rem] font-semibold text-app-muted">
                    Coming soon
                  </span>
                )}
                {checked && <Icon name="check" size={14} className="ml-auto text-app-accent" />}
              </span>
              <span className="text-[0.8125rem] leading-snug text-app-muted">{o.description}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
