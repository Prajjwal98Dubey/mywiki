import { useId } from 'react';
import { useAppearance } from '../../context/AppearanceContext.jsx';

function RadioGroup({ legend, name, value, options, onChange, note }) {
  const id = useId();
  return (
    <fieldset className="mb-3 border-0 p-0">
      <legend className="mb-1 p-0 text-sm font-bold">{legend}</legend>
      {options.map((opt) => (
        <label key={opt.value} htmlFor={`${id}-${opt.value}`} className="flex cursor-pointer items-center gap-2 py-0.5 text-sm">
          <input
            id={`${id}-${opt.value}`}
            type="radio"
            name={`${name}-${id}`}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="size-4 accent-wiki-progressive"
          />
          {opt.label}
        </label>
      ))}
      {note && <p className="mt-1 text-xs text-wiki-subtle-text">{note}</p>}
    </fieldset>
  );
}

/** Vector 2022 Appearance menu: text size, width and color. */
export default function AppearancePanel({ pinAction, onPinAction }) {
  const a = useAppearance();
  return (
    <div className="text-sm">
      <div className="mb-2 flex items-center justify-between gap-2 border-b border-wiki-border-subtle pb-1">
        <h2 className="m-0 text-sm font-bold">Appearance</h2>
        {onPinAction && (
          <button
            type="button"
            onClick={onPinAction}
            className="cdx-button cdx-button--quiet min-h-0 px-1.5 py-0.5 text-[0.8125rem] font-normal"
          >
            {pinAction}
          </button>
        )}
      </div>
      <RadioGroup
        legend="Text"
        name="text-size"
        value={a.textSize}
        onChange={a.setTextSize}
        options={[
          { value: 'small', label: 'Small' },
          { value: 'standard', label: 'Standard' },
          { value: 'large', label: 'Large' },
        ]}
      />
      <RadioGroup
        legend="Width"
        name="width"
        value={a.width}
        onChange={a.setWidth}
        options={[
          { value: 'standard', label: 'Standard' },
          { value: 'wide', label: 'Wide' },
        ]}
        note="The content is as wide as possible for your browser window."
      />
      <RadioGroup
        legend="Color"
        name="theme"
        value={a.theme}
        onChange={a.setTheme}
        options={[
          { value: 'auto', label: 'Automatic' },
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ]}
      />
    </div>
  );
}
