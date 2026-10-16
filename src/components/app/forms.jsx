import { cloneElement, isValidElement, useId, useState } from 'react';
import Icon from '../ui/Icon.jsx';

/** Label + control + hint/error for app-style forms (wires aria-describedby / aria-invalid). */
export function AppField({ label, hint, error, children, aside }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
  const controlProps = { id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined };
  // children: an element (props are injected) or a function (controlProps) => element, e.g. for Controllers.
  const control =
    typeof children === 'function' ? children(controlProps) : isValidElement(children) ? cloneElement(children, controlProps) : children;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-app-ink">
          {label}
        </label>
        {aside}
      </div>
      {control}
      {error ? (
        <p id={errorId} className="m-0 flex items-center gap-1.5 text-[0.8125rem] text-app-danger">
          <Icon name="alert" size={13} /> {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="m-0 text-[0.8125rem] text-app-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function AppInput({ className = '', ref, ...props }) {
  return <input ref={ref} className={`app-input ${className}`} {...props} />;
}

/** Password input with a show/hide toggle. */
export function PasswordInput({ ref, className = '', ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input ref={ref} type={visible ? 'text' : 'password'} className={`app-input pr-11 ${className}`} {...props} />
      <button
        type="button"
        className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-app-muted hover:text-app-ink"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
      >
        <Icon name={visible ? 'eyeClosed' : 'eye'} size={17} />
      </button>
    </div>
  );
}

const ALERT_STYLES = {
  error: 'border-app-danger/30 bg-app-danger-soft text-app-danger',
  info: 'border-app-accent/25 bg-app-accent-soft text-app-accent-ink',
  success: 'border-app-success/30 bg-app-success-soft text-app-success',
};

export function AppAlert({ type = 'error', children, className = '' }) {
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${ALERT_STYLES[type]} ${className}`}
    >
      <Icon name={type === 'error' ? 'alert' : type === 'success' ? 'check' : 'info'} size={16} className="mt-0.5" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
