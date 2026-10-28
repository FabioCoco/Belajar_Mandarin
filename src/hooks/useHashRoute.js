import { useCallback, useEffect, useState } from 'react';

export const ROUTES = ['beranda', 'belajar', 'kuis', 'kosakata', 'progress'];

const read = () => {
  const r = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  return ROUTES.includes(r) ? r : 'beranda';
};

// Router hash sederhana: cocok untuk GitHub Pages tanpa konfigurasi rewrite.
export function useHashRoute() {
  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to) => {
    window.location.hash = `/${to}`;
  }, []);

  return { route, navigate };
}
