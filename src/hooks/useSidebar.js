import { useCallback, useEffect, useState } from 'react';
import { loadJSON, saveJSON } from '../lib/storage.js';
import { KEYS } from '../lib/constants.js';

// Status sidebar: `collapsed` (desktop, diingat di localStorage) dan `mobileOpen` (drawer, selalu tertutup di awal).
export function useSidebar() {
  const [collapsed, setCollapsed] = useState(() => loadJSON(KEYS.sidebar, false) === true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    saveJSON(KEYS.sidebar, collapsed);
  }, [collapsed]);

  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return { collapsed, mobileOpen, toggleCollapsed, openMobile, closeMobile };
}
