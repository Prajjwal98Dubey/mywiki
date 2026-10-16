import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal dialog on the native <dialog> element (focus is trapped by the browser; Esc closes).
 * Render it only while open.
 */
const STYLES = {
  wiki: {
    dialog:
      'w-[min(32rem,calc(100vw-2rem))] rounded-[2px] border border-wiki-border bg-wiki-page text-wiki-text shadow-wiki-card backdrop:bg-white/65 dark:backdrop:bg-black/65',
    title: 'text-lg font-bold',
  },
  app: {
    dialog:
      'app w-[min(28rem,calc(100vw-2rem))] rounded-3xl border border-app-border bg-app-surface text-app-ink shadow-app-lg backdrop:bg-black/40 backdrop:backdrop-blur-sm',
    title: 'font-display text-2xl font-medium',
  },
};

export default function Dialog({ title, children, actions, onClose, variant = 'wiki' }) {
  const s = STYLES[variant];
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const previouslyFocused = document.activeElement;
    if (typeof el.showModal === 'function' && !el.open) el.showModal();
    else el.setAttribute('open', '');
    return () => {
      if (el.open && typeof el.close === 'function') el.close();
      previouslyFocused?.focus?.();
    };
  }, []);

  // Portalled to <body> so inputs inside never take part in a surrounding <form>.
  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose?.();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose?.(); // backdrop click
      }}
      className={`m-auto p-0 ${s.dialog}`}
    >
      <div className="px-6 pt-5 pb-2">
        <h2 id={titleId} className={`m-0 mb-2 ${s.title}`}>
          {title}
        </h2>
        <div className="text-sm">{children}</div>
      </div>
      {actions && <div className="flex flex-wrap justify-end gap-2 px-6 pt-2 pb-4">{actions}</div>}
    </dialog>,
    document.body,
  );
}
