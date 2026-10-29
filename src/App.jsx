import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { SettingsProvider } from './hooks/useSettings.jsx';
import { ProgressProvider, useProgress } from './hooks/useProgress.jsx';
import { useHashRoute } from './hooks/useHashRoute.js';
import { useFilters } from './hooks/useFilters.js';
import { useSidebar } from './hooks/useSidebar.js';
import { CelebrationHoldContext } from './hooks/useCelebrationHold.jsx';
import Sidebar from './components/Sidebar.jsx';
import BottomNav from './components/BottomNav.jsx';
import MobileHeader from './components/MobileHeader.jsx';
import Confetti from './components/Confetti.jsx';
import Toast from './components/Toast.jsx';
import { ErrorBoundary, LoadingState } from './components/StateViews.jsx';
import Home from './pages/Home.jsx';
import { APP_NAME, DAILY_TARGET } from './lib/constants.js';

const Vocab = lazy(() => import('./pages/Vocab.jsx'));
const Study = lazy(() => import('./pages/Study.jsx'));
const Quiz = lazy(() => import('./pages/Quiz.jsx'));
const Progress = lazy(() => import('./pages/Progress.jsx'));

const TITLES = { beranda: 'Beranda', belajar: 'Flashcard', kuis: 'Kuis', kosakata: 'Kosakata', progress: 'Progress' };

function Shell() {
  const { route, navigate } = useHashRoute();
  const filterApi = useFilters();
  const sidebar = useSidebar();
  const { setFilters } = filterApi;
  const { todayCount, datasetReset, dismissDatasetReset } = useProgress();
  const mainRef = useRef(null);
  const firstRoute = useRef(true);

  // Perayaan saat target harian TERCAPAI di sesi ini (bukan saat halaman dibuka dengan target yang sudah lewat).
  // Bila halaman menahan perayaan (kuis berjalan), ia menunggu sampai penahan dilepas.
  const [fire, setFire] = useState(0);
  const [toast, setToast] = useState(false);
  const [held, setHeld] = useState(false);
  const prevCount = useRef(todayCount);
  const pending = useRef(false);
  useEffect(() => {
    if (prevCount.current < DAILY_TARGET && todayCount >= DAILY_TARGET) pending.current = true;
    if (todayCount < DAILY_TARGET) pending.current = false; // mis. progress di-reset
    prevCount.current = todayCount;
    if (pending.current && !held) {
      pending.current = false;
      setFire((f) => f + 1);
      setToast(true);
    }
  }, [todayCount, held]);

  // Judul tab per halaman + pindahkan fokus ke konten saat berpindah halaman (pembaca layar/keyboard)
  useEffect(() => {
    document.title = `${TITLES[route]} · ${APP_NAME}`;
    if (firstRoute.current) firstRoute.current = false;
    else mainRef.current?.focus({ preventScroll: true });
  }, [route]);

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
      page = <Quiz filterApi={filterApi} navigate={navigate} />;
      break;
    case 'progress':
      page = <Progress />;
      break;
    default:
      page = <Home navigate={navigate} openChapter={openChapter} />;
  }

  return (
    <CelebrationHoldContext.Provider value={setHeld}>
      <div className="relative min-h-screen">
        <button
          type="button"
          onClick={() => mainRef.current?.focus()}
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-xl focus:bg-surface focus:px-4 focus:py-2 focus:font-bold focus:text-primary-ink focus:shadow-lift"
        >
          Lewati ke konten
        </button>
        <Sidebar
          route={route}
          navigate={navigate}
          collapsed={sidebar.collapsed}
          onToggle={sidebar.toggleCollapsed}
          mobileOpen={sidebar.mobileOpen}
          onMobileClose={sidebar.closeMobile}
        />
        <div className={`relative z-10 transition-[padding] duration-200 ease-out ${sidebar.collapsed ? 'lg:pl-[4.5rem]' : 'lg:pl-72'}`}>
          <MobileHeader onMenu={sidebar.openMobile} />
          <main
            id="konten"
            ref={mainRef}
            tabIndex={-1}
            className="pl-safe pr-safe mx-auto w-full max-w-6xl px-3 pb-24 pt-3 focus:outline-none sm:px-5 lg:pb-8 lg:pt-5"
          >
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
        <Confetti fire={fire} />
        <Toast
          open={datasetReset}
          onClose={dismissDatasetReset}
          mood="thinking"
          duration={9000}
          title="Kosakata diperbarui"
          message="Isi kosakata berubah, jadi progress hafalan lama direset."
        />
        <Toast open={toast} onClose={() => setToast(false)} title="Target harian tercapai!" message={`${DAILY_TARGET} kata berbeda sudah dipelajari hari ini. Panda bangga!`} />
      </div>
    </CelebrationHoldContext.Provider>
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
