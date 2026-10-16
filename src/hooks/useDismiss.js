import { useEffect } from 'react';

/** Calls onDismiss on Escape or on a pointer-down outside `ref` while `open`. */
export function useDismiss(ref, open, onDismiss) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onDismiss('escape');
    };
    const onPointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onDismiss('outside');
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [ref, open, onDismiss]);
}
