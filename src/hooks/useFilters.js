import { useCallback, useMemo, useState } from 'react';

export const DEFAULT_FILTERS = { babs: [], kategori: [], pos: [], status: 'all', q: '' };

// Filter dipegang di App agar dipakai bersama (daftar kosakata, nanti flashcard & kuis).
export function useFilters() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const toggle = useCallback((key, val) => {
    setFilters((f) => ({ ...f, [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val] }));
  }, []);
  const set = useCallback((key, val) => setFilters((f) => ({ ...f, [key]: val })), []);
  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  // Pencarian tidak dihitung karena kolomnya selalu terlihat
  const activeCount = useMemo(
    () => filters.babs.length + filters.kategori.length + filters.pos.length + (filters.status !== 'all' ? 1 : 0),
    [filters],
  );

  return { filters, toggle, set, reset, setFilters, activeCount };
}
