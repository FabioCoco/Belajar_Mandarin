import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadJSON, saveJSON } from '../lib/storage.js';
import { KEYS } from '../lib/constants.js';

const SettingsContext = createContext(null);
const DEFAULTS = { lang: 'id', theme: 'system' }; // lang: id | en | both; theme: system | light | dark

const systemDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => ({ ...DEFAULTS, ...loadJSON(KEYS.settings, {}) }));
  const [sysDark, setSysDark] = useState(systemDark);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return undefined;
    const onChange = (e) => setSysDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    saveJSON(KEYS.settings, settings);
  }, [settings]);

  const resolvedTheme = settings.theme === 'system' ? (sysDark ? 'dark' : 'light') : settings.theme;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolvedTheme === 'dark' ? '#16211D' : '#FFFBF2');
  }, [resolvedTheme]);

  const setLang = useCallback((lang) => setSettings((s) => ({ ...s, lang })), []);
  const setTheme = useCallback((theme) => setSettings((s) => ({ ...s, theme })), []);

  const value = useMemo(
    () => ({ lang: settings.lang, theme: settings.theme, resolvedTheme, setLang, setTheme }),
    [settings, resolvedTheme, setLang, setTheme],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings harus dipakai di dalam SettingsProvider');
  return ctx;
}
