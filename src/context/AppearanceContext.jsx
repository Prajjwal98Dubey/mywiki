import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Keep in sync with the bootstrap script in index.html.
const STORAGE_KEY = 'mywiki:appearance';
const TOC_KEY = 'mywiki:toc-pinned';
const TEXT_SIZES ={ small: '14px', standard: '16px', large: '20px' };
const DEFAULTS = { textSize: 'standard', width: 'standard', theme: 'auto', pinned: false };

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

function sanitize(s) {
  return {
    textSize: s?.textSize in TEXT_SIZES ? s.textSize : DEFAULTS.textSize,
    width: s?.width === 'wide' ? 'wide' : 'standard',
    theme: ['auto', 'light', 'dark'].includes(s?.theme) ? s.theme : 'auto',
    pinned: Boolean(s?.pinned),
  };
}

const prefersDark = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

const AppearanceContext = createContext(null);

export function AppearanceProvider({ children }) {
  const [settings, setSettings] = useState(() => sanitize(readJSON(STORAGE_KEY, DEFAULTS)));
  const [tocPinned, setTocPinnedState] = useState(() => readJSON(TOC_KEY, true) !== false);
  const [systemDark, setSystemDark] = useState(prefersDark);

  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mql) return undefined;
    const onChange = (e) => setSystemDark(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme = settings.theme === 'auto' ? (systemDark ? 'dark' : 'light') : settings.theme;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
    root.setAttribute('data-width', settings.width);
    root.style.setProperty('--text-size', TEXT_SIZES[settings.textSize]);
  }, [resolvedTheme, settings.width, settings.textSize]);

  const update = useCallback((patch) => {
    setSettings((prev) => {
      const next = sanitize({ ...prev, ...patch });
      writeJSON(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const setTocPinned = useCallback((value) => {
    setTocPinnedState(value);
    writeJSON(TOC_KEY, value);
  }, []);

  const value = useMemo(
    () => ({
      ...settings,
      resolvedTheme,
      tocPinned,
      setTextSize: (textSize) => update({ textSize }),
      setWidth: (width) => update({ width }),
      setTheme: (theme) => update({ theme }),
      setPinned: (pinned) => update({ pinned }),
      setTocPinned,
    }),
    [settings, resolvedTheme, tocPinned, update, setTocPinned],
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error('useAppearance must be used inside <AppearanceProvider>');
  return ctx;
}
