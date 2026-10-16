import { useState } from 'react';

const isYear = (v) => /^\d{1,4}$/.test(v);

/**
 * Person date: a full date (YYYY-MM-DD, native date picker) or a year only (YYYY).
 * Takes react-hook-form Controller field props (value, onChange, onBlur, name, ref) plus id/aria-* from AppField.
 */
export default function DateField({ value = '', onChange, onBlur, name, ref, id, ...aria }) {
  const [yearOnly, setYearOnly] = useState(() => isYear(value));

  const toggle = (checked) => {
    setYearOnly(checked);
    onChange(checked ? value.slice(0, 4) : '');
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {yearOnly ? (
        <input
          ref={ref}
          id={id}
          name={name}
          inputMode="numeric"
          maxLength={4}
          placeholder="YYYY"
          className="app-input w-28"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
          onBlur={onBlur}
          {...aria}
        />
      ) : (
        <input
          ref={ref}
          id={id}
          name={name}
          type="date"
          className="app-input w-44"
          value={value}
          max="9999-12-31"
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          {...aria}
        />
      )}
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-app-muted">
        <input
          type="checkbox"
          className="size-4 accent-[var(--app-accent)]"
          checked={yearOnly}
          onChange={(e) => toggle(e.target.checked)}
        />
        Year only
      </label>
    </div>
  );
}
