import { useEffect, useState } from 'react';

/**
 * Returns the id of the last heading (from `ids`, in document order) whose top has
 * scrolled past `offset` px from the top of the viewport, or null when above all of them.
 */
export function useScrollSpy(ids, offset = 80) {
  const [active, setActive] = useState(null);
  const key = ids.join('\u0000');

  useEffect(() => {
    const list = key ? key.split('\u0000') : [];
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = null;
      for (const id of list) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - offset <= 1) current = id;
        else break;
      }
      // At the very bottom of the page, highlight the last heading.
      if (list.length && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = list[list.length - 1];
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [key, offset]);

  return active;
}
