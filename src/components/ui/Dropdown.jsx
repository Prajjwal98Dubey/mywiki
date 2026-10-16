import { useCallback, useId, useRef, useState } from 'react';
import { useDismiss } from '../../hooks/useDismiss.js';

function PanelContent({ render, close }) {
  return render({ close });
}

/**
 * Click-to-open popover. `button` is the trigger content; `children` may be a function
 * receiving { close }. Closes on Escape (returning focus) and on outside click.
 */
export default function Dropdown({
  button,
  buttonClassName = '',
  label,
  align = 'left',
  panelClassName = '',
  variant = 'wiki',
  children,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const btnRef = useRef(null);
  const panelId = useId();

  const close = useCallback((reason) => {
    setOpen(false);
    if (reason === 'escape' || reason === 'select') btnRef.current?.focus();
  }, []);
  const closeOnSelect = useCallback(() => close('select'), [close]);
  useDismiss(ref, open, close);

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        type="button"
        className={buttonClassName}
        aria-label={label}
        title={label}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {button}
      </button>
      {open && (
        <div
          id={panelId}
          className={`${variant === 'app' ? 'app-menu mt-2' : 'wiki-dropdown mt-1'} absolute top-full z-50 ${align === 'right' ? 'right-0' : 'left-0'} ${panelClassName}`}
        >
          {typeof children === 'function' ? <PanelContent render={children} close={closeOnSelect} /> : children}
        </div>
      )}
    </div>
  );
}
