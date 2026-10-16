import { cloneElement, isValidElement, useId } from 'react';

/** Label + control + hint + error, wired up with aria-describedby / aria-invalid. */
export default function Field({ label, hint, error, children, id: idProp, className = '', optional = false }) {
  const autoId = useId();
  const id = idProp || autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const control = isValidElement(children)
    ? cloneElement(children, { id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })
    : children;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-bold">
          {label}
          {optional && <span className="ml-1 font-normal text-wiki-subtle-text">(optional)</span>}
        </label>
      )}
      {control}
      {hint && (
        <p id={hintId} className="mt-1 text-[0.8125rem] text-wiki-subtle-text">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-[0.8125rem] font-bold text-wiki-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
