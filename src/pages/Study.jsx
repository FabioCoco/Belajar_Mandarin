import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, CircleCheck, CircleX, RotateCw, Shuffle, VolumeX } from 'lucide-react';
import Flashcard from '../components/Flashcard.jsx';
import PandaMascot from '../components/PandaMascot.jsx';
import FilterLayout from '../components/FilterLayout.jsx';
import Segmented from '../components/Segmented.jsx';
import { EmptyState } from '../components/StateViews.jsx';
import { useProgress } from '../hooks/useProgress.jsx';
import { useSettings } from '../hooks/useSettings.jsx';
import { useSpeech } from '../hooks/useSpeech.js';
import { chapterStyle } from '../lib/chapterColors.js';
import { categoryLabel, filterVocab, vocab, vocabById } from '../lib/vocab.js';

function shuffled(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const isTyping = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);

export default function Study({ filterApi, navigate }) {
  const { filters, set, reset } = filterApi;
  const { lang, cardDir, setCardDir } = useSettings();
  const { isMemorized, markReviewed } = useProgress();
  const speech = useSpeech();

  const [random, setRandom] = useState(false);
  const [seed, setSeed] = useState(0);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reaction, setReaction] = useState(null); // 'hafal' | 'belum' | null
  const [session, setSession] = useState({ hafal: 0, belum: 0 });
  const cardRef = useRef(null);
  const timer = useRef(null);

  // Dek dibekukan saat filter berubah. Menandai "hafal" tidak membuang kartu dari dek
  // yang sedang berjalan (walau filter status = belum hafal), jadi isMemorized dibaca lewat ref.
  const memRef = useRef(isMemorized);
  memRef.current = isMemorized;
  const deck = useMemo(() => {
    const ids = filterVocab(vocab, filters, memRef.current).map((v) => v.id);
    return random ? shuffled(ids) : ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, random, seed]);

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    setReaction(null);
    setSession({ hafal: 0, belum: 0 });
  }, [deck]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const total = deck.length;
  const finished = total > 0 && index >= total;
  const item = !finished && total > 0 ? vocabById.get(deck[index]) : null;

  const flip = useCallback(() => setFlipped((f) => !f), []);

  const go = useCallback(
    (delta) => {
      setIndex((i) => Math.max(0, Math.min(total, i + delta)));
      setFlipped(false);
    },
    [total],
  );

  const mark = useCallback(
    (hafal) => {
      if (!item) return;
      markReviewed(item.id, hafal);
      setSession((s) => ({ ...s, [hafal ? 'hafal' : 'belum']: s[hafal ? 'hafal' : 'belum'] + 1 }));
      setReaction(hafal ? 'hafal' : 'belum');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setReaction(null), 1600);
      go(1);
      // Kembalikan fokus ke kartu agar Spasi tidak menekan ulang tombol yang tadi diklik
      requestAnimationFrame(() => cardRef.current?.focus());
    },
    [item, markReviewed, go],
  );

  // Keyboard: Spasi = balik, panah kiri/kanan = navigasi, H = hafal, B = belum hafal
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTyping(e.target) || document.querySelector('[role="dialog"]')) return;
      const onButton = e.target.tagName === 'BUTTON' || e.target.tagName === 'A';
      switch (e.key) {
        case ' ':
          // Jika fokus di tombol, biarkan perilaku bawaan (klik) agar tidak terjadi dua kali
          if (!onButton && item) {
            e.preventDefault();
            flip();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          go(1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          go(-1);
          break;
        case 'h':
        case 'H':
          mark(true);
          break;
        case 'b':
        case 'B':
          mark(false);
          break;
        default:
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flip, go, mark, item]);

  if (vocab.length === 0) {
    return <EmptyState mood="sleeping" title="Belum ada kosakata" message="Jalankan npm run build:data setelah menaruh file bab di data-mentah/." />;
  }

  const pandaMood = finished
    ? session.hafal >= session.belum
      ? 'cheer'
      : 'happy'
    : reaction === 'hafal'
      ? 'happy'
      : reaction === 'belum'
        ? 'sad'
        : 'thinking';
  const pandaText = finished
    ? 'Satu putaran selesai!'
    : reaction === 'hafal'
      ? 'Hafal! Mantap!'
      : reaction === 'belum'
        ? 'Tidak apa-apa, nanti diulang lagi.'
        : flipped
          ? 'Sudah ingat atau belum?'
          : 'Coba tebak dulu, lalu balik kartunya.';

  return (
    <FilterLayout filterApi={filterApi} count={total} countLabel="kartu">
      {({ filterButton }) => (
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl">Flashcard</h1>
              <p className="text-muted">{total > 0 ? `${total} kartu dalam dek` : 'Dek kosong'}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (random) setSeed((s) => s + 1);
                  else setRandom(true);
                }}
                aria-label={random ? 'Acak ulang urutan kartu' : 'Acak urutan kartu'}
                aria-pressed={random}
                className={`btn-soft ${random ? '!border-primary-ink !text-primary-ink' : ''}`}
              >
                <Shuffle size={18} aria-hidden="true" />
                <span className="hidden sm:inline">{random ? 'Acak ulang' : 'Acak'}</span>
              </button>
              {filterButton}
            </div>
          </div>

          <Segmented
            label="Arah kartu"
            value={cardDir}
            onChange={setCardDir}
            options={[
              { value: 'hanzi', label: 'Hanzi → Arti' },
              { value: 'arti', label: 'Arti → Hanzi' },
            ]}
          />

          {total === 0 ? (
            <EmptyState
              mood="thinking"
              title="Tidak ada kartu"
              message="Tidak ada kata yang cocok dengan filter saat ini."
              action={
                <button type="button" className="btn-primary" onClick={reset}>
                  Hapus semua filter
                </button>
              }
            />
          ) : finished ? (
            <div className="card flex flex-col items-center gap-3 px-4 py-8 text-center">
              <PandaMascot mood={pandaMood} size={150} key="done" />
              <h2 className="text-2xl">{pandaText}</h2>
              <p className="flex flex-wrap justify-center gap-2 text-sm font-bold">
                <span className="inline-flex items-center gap-1 rounded-pill bg-ok-soft px-3 py-1 text-ok-ink">
                  <CircleCheck size={16} aria-hidden="true" /> {session.hafal} hafal
                </span>
                <span className="inline-flex items-center gap-1 rounded-pill bg-todo-soft px-3 py-1 text-todo-ink">
                  <CircleX size={16} aria-hidden="true" /> {session.belum} belum hafal
                </span>
              </p>
              <div className="mt-2 flex w-full max-w-sm flex-col gap-2">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setIndex(0);
                    setSession({ hafal: 0, belum: 0 });
                  }}
                >
                  <RotateCw size={18} aria-hidden="true" /> Ulangi dari awal
                </button>
                {filters.status !== 'unmemorized' && (
                  <button type="button" className="btn-soft" onClick={() => set('status', 'unmemorized')}>
                    Latih yang belum hafal saja
                  </button>
                )}
                <button type="button" className="btn-soft" onClick={() => navigate('kuis')}>
                  Uji lewat kuis
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Panda + progress */}
              <div className="flex items-center gap-3" style={chapterStyle(item.bab)}>
                <PandaMascot mood={pandaMood} size={72} key={`${pandaMood}-${index}`} />
                <div className="min-w-0 flex-1">
                  <p aria-live="polite" className="font-bold text-ink">
                    {pandaText}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div
                      role="progressbar"
                      aria-label="Progress dek"
                      aria-valuemin={0}
                      aria-valuemax={total}
                      aria-valuenow={index}
                      className="h-2.5 flex-1 overflow-hidden rounded-pill bg-ink/10"
                    >
                      <div className="h-full rounded-pill bg-ch transition-all" style={{ width: `${(index / total) * 100}%` }} />
                    </div>
                    <span className="text-sm font-extrabold tabular-nums text-muted">
                      {index + 1}/{total}
                    </span>
                  </div>
                </div>
              </div>

              <Flashcard
                key={item.id}
                item={item}
                flipped={flipped}
                onFlip={flip}
                direction={cardDir}
                lang={lang}
                cardRef={cardRef}
                onSwipe={(dir) => mark(dir === 'right')}
                memorized={isMemorized(item.id)}
                speech={speech}
              />

              <p className="text-center text-sm text-muted" style={chapterStyle(item.bab)}>
                <span className="mr-1.5 inline-block rounded-pill bg-ch-ink px-2.5 py-0.5 text-xs font-extrabold text-surface">Bab {item.bab}</span>
                {item.babJudulId} · {categoryLabel(item.kategori)}
              </p>

              {/* Aksi */}
              <div className="mx-auto grid w-full max-w-xl grid-cols-2 gap-3">
                <button type="button" onClick={() => mark(false)} className="btn !min-h-[56px] bg-todo-soft text-todo-ink shadow-soft hover:brightness-95">
                  <CircleX size={22} aria-hidden="true" /> Belum hafal
                </button>
                <button type="button" onClick={() => mark(true)} className="btn-primary !min-h-[56px]">
                  <CircleCheck size={22} aria-hidden="true" /> Hafal
                </button>
                <div className="col-span-2 grid grid-cols-[1fr_auto_1fr] gap-3">
                  <button type="button" onClick={() => go(-1)} disabled={index === 0} className="btn-soft min-w-0 !gap-1 !px-3 disabled:opacity-40">
                    <ChevronLeft size={20} aria-hidden="true" /> Sebelumnya
                  </button>
                  <button type="button" onClick={flip} className="btn-soft" aria-label="Balik kartu">
                    <RotateCw size={20} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => go(1)} className="btn-soft min-w-0 !gap-1 !px-3">
                    Berikutnya <ChevronRight size={20} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Petunjuk shortcut hanya relevan di perangkat dengan keyboard */}
              <p className="hidden text-center text-sm text-muted md:block">
                <kbd className="rounded bg-surface2 px-1.5 py-0.5 font-bold">Spasi</kbd> balik ·{' '}
                <kbd className="rounded bg-surface2 px-1.5 py-0.5 font-bold">←</kbd> <kbd className="rounded bg-surface2 px-1.5 py-0.5 font-bold">→</kbd>{' '}
                pindah kartu · <kbd className="rounded bg-surface2 px-1.5 py-0.5 font-bold">H</kbd> hafal ·{' '}
                <kbd className="rounded bg-surface2 px-1.5 py-0.5 font-bold">B</kbd> belum hafal
              </p>
              <p className="text-center text-sm text-muted md:hidden">Geser kartu ke kanan = hafal, ke kiri = belum hafal.</p>

              {speech.message && (
                <p className="flex items-center justify-center gap-1.5 text-center text-sm text-muted">
                  <VolumeX size={16} aria-hidden="true" /> {speech.message}
                </p>
              )}
            </>
          )}
        </>
      )}
    </FilterLayout>
  );
}
