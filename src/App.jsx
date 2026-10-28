import { Suspense, lazy, useCallback } from 'react';
import { SettingsProvider } from './hooks/useSettings.jsx';
import { ProgressProvider } from './hooks/useProgress.jsx';
import { useHashRoute } from './hooks/useHashRoute.js';
import { useFilters } from './hooks/useFilters.js';
import Sidebar from './components/Sidebar.jsx';
import BottomNav from './components/BottomNav.jsx';
import MobileHeader from './components/MobileHeader.jsx';
import { BackgroundDecor } from './components/Decorations.jsx';
import { ErrorBoundary, LoadingState } from './components/StateViews.jsx';
import Home from './pages/Home.jsx';

const Vocab = lazy(() => import('./pages/Vocab.jsx'));
const Study = lazy(() => import('./pages/Study.jsx'));
const ComingSoon = lazy(() => import('./pages/ComingSoon.jsx'));

function Shell() {
  const { route, navigate } = useHashRoute();
  const filterApi = useFilters();
  const { setFilters } = filterApi;

  // Dari kartu bab di beranda: buka daftar kosakata yang sudah difilter ke bab itu
  const openChapter = useCallback(
    (bab) => {
      setFilters((f) => ({ ...f, babs: [bab] }));
      navigate('kosakata');
    },
    [setFilters, navigate],
  );

  let page;
  switch (route) {
    case 'kosakata':
      page = <Vocab filterApi={filterApi} />;
      break;
    case 'belajar':
      page = <Study filterApi={filterApi} navigate={navigate} />;
      break;
    case 'kuis':
      page = <ComingSoon title="Kuis" tahap={4} />;
      break;
    case 'progress':
      page = <ComingSoon title="Halaman progress" tahap={5} />;
      break;
    default:
      page = <Home navigate={navigate} openChapter={openChapter} />;
  }

  return (
    <div className="relative min-h-screen">
      <BackgroundDecor />
      <Sidebar route={route} navigate={navigate} />
      <div className="relative z-10 lg:pl-72">
        <MobileHeader />
        <main className="pl-safe pr-safe mx-auto w-full max-w-5xl px-4 pb-28 pt-5 sm:px-6 lg:pb-10 lg:pt-8">
          <ErrorBoundary key={route}>
            <Suspense fallback={<LoadingState />}>
              <div key={route} className="animate-page-in">
                {page}
              </div>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <BottomNav route={route} navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <ProgressProvider>
        <Shell />
      </ProgressProvider>
    </SettingsProvider>
  );
}
