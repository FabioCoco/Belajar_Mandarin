import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Play, X } from 'lucide-react';
import FilterLayout from '../components/FilterLayout.jsx';
import ChapterFilter from '../components/ChapterFilter.jsx';
import LeitnerBaskets from '../components/LeitnerBaskets.jsx';
import QuizQuestion from '../components/QuizQuestion.jsx';
import QuizResult from '../components/QuizResult.jsx';
import PandaMascot from '../components/PandaMascot.jsx';
import Segmented from '../components/Segmented.jsx';
import { EmptyState } from '../components/StateViews.jsx';
import { useProgress } from '../hooks/useProgress.jsx';
import { useSettings } from '../hooks/useSettings.jsx';
import { useSpeech } from '../hooks/useSpeech.js';
import { useHoldCelebration } from '../hooks/useCelebrationHold.jsx';
import { pickWeighted } from '../lib/leitner.js';
import { QUIZ_MODES, buildQuestion } from '../lib/quiz.js';
import { filterVocab, vocab } from '../lib/vocab.js';

const COUNT_OPTIONS = [
  { value: 10, label: '10 soal' },
  { value: 20, label: '20 soal' },
  { value: 'all', label: 'Semua' },
];

export default function Quiz({ filterApi }) {
  const { filters, toggle, reset } = filterApi;
  const { lang } = useSettings();
  const { words, isMemorized, getWord, answerQuiz } = useProgress();
  const speech = useSpeech();

  const [mode, setMode] = useState('hanzi-arti');
  const [count, setCount] = useState(10);
  // run = { questions, index, selected, log: [{ q, chosen, correct }], done }
  const [run, setRun] = useState(null);
  const nextRef = useRef(null);

  // Jangan menyela soal dengan perayaan target harian; tunggu sampai kuis selesai atau ditinggalkan
  useHoldCelebration(!!run && !run.done);

  const pool = useMemo(
    () => filterVocab(vocab, filters, isMemorized),
    // isMemorized berubah identitas setiap `words` berubah
    [filters, isMemorized],
  );

  // Isi tiga keranjang Leitner untuk kata yang lolos filter
  const boxCounts = useMemo(() => {
    const c = { 1: 0, 2: 0, 3: 0 };
    for (const v of pool) c[getWord(v.id).box] += 1;
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, words]);

  const start = useCallback(
    (items, n) => {
      // Kata di kotak rendah diambil lebih sering (lihat lib/leitner.js)
      const picked = pickWeighted(items, (v) => getWord(v.id).box, n === 'all' ? items.length : n);
      setRun({ questions: picked.map((v) => buildQuestion(v, mode, lang)), index: 0, selected: null, log: [], done: false });
    },
    [getWord, mode, lang],
  );

  const choose = useCallback(
    (i) => {
      if (!run || run.selected !== null || run.done) return;
      const q = run.questions[run.index];
      const correct = i === q.correctIndex;
      answerQuiz(q.item.id, correct);
      setRun((r) => ({ ...r, selected: i, log: [...r.log, { q, chosen: i, correct }] }));
    },
    [run, answerQuiz],
  );

  const next = useCallback(() => {
    setRun((r) => {
      if (!r || r.selected === null) return r;
      if (r.index + 1 >= r.questions.length) return { ...r, done: true };
      return { ...r, index: r.index + 1, selected: null };
    });
  }, []);

  // Setelah menjawab, fokus pindah ke tombol "berikutnya" agar Enter langsung melanjutkan
  useEffect(() => {
    if (run?.selected !== null && run?.selected !== undefined) {
      const btn = nextRef.current;
      btn?.focus({ preventScroll: true });
      // Tab bar bawah bisa menutupi tombol; gulirkan ke tengah layar
      btn?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [run?.selected, run?.index]);

  // Keyboard: 1-4 pilih jawaban, Enter lanjut
  useEffect(() => {
    if (!run || run.done) return undefined;
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || document.querySelector('[role="dialog"]')) return;
      if (/^[1-4]$/.test(e.key)) choose(Number(e.key) - 1);
      else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [run, choose, next]);

  if (vocab.length === 0) {
    return <EmptyState mood="sleeping" title="Belum ada kosakata" message="Jalankan npm run build:data setelah menaruh file bab di data-mentah/." />;
  }

  // ---------- Hasil ----------
  if (run?.done) {
    return (
      <>
        <h1 className="sr-only">Hasil kuis</h1>
        <QuizResult
          log={run.log}
          lang={lang}
          onRetryWrong={(items) => start(items, 'all')}
          onRestart={() => start(pool, count)}
          onSetup={() => setRun(null)}
        />
      </>
    );
  }

  // ---------- Sedang kuis ----------
  if (run) {
    const q = run.questions[run.index];
    const total = run.questions.length;
    const answered = run.selected !== null;
    const correctNow = answered && run.selected === q.correctIndex;
    const score = run.log.filter((l) => l.correct).length;
    const mood = !answered ? 'thinking' : correctNow ? 'happy' : 'sad';
    const text = !answered ? 'Pilih jawaban yang tepat.' : correctNow ? 'Benar! Hebat!' : 'Ups, tidak apa-apa. Ingat jawabannya ya.';

    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <h1 className="sr-only">Kuis berjalan</h1>
        <div className="flex items-center gap-3">
          <PandaMascot mood={mood} size={72} key={`${mood}-${run.index}`} />
          <div className="min-w-0 flex-1">
            <p aria-live="polite" className="font-bold">
              {text}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <div
                role="progressbar"
                aria-label="Progress soal"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={run.index + (answered ? 1 : 0)}
                className="h-2.5 flex-1 overflow-hidden rounded-pill bg-ink/10"
              >
                <div className="h-full rounded-pill bg-primary transition-all" style={{ width: `${((run.index + (answered ? 1 : 0)) / total) * 100}%` }} />
              </div>
              <span className="text-sm font-extrabold tabular-nums text-muted">
                {run.index + 1}/{total}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">Skor sementara: {score}</p>
          </div>
          <button type="button" onClick={() => setRun(null)} aria-label="Keluar dari kuis" className="btn-soft !min-w-[44px] !rounded-full !p-0">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <QuizQuestion
          key={`${q.item.id}-${run.index}`}
          question={q}
          selected={run.selected}
          onSelect={choose}
          lang={lang}
          speech={speech}
          nextRef={nextRef}
          onNext={next}
          isLast={run.index + 1 >= total}
        />
        <p className="hidden text-center text-sm text-muted md:block">
          Tekan <kbd className="rounded bg-surface2 px-1.5 py-0.5 font-bold">1</kbd>–<kbd className="rounded bg-surface2 px-1.5 py-0.5 font-bold">4</kbd> untuk
          memilih, <kbd className="rounded bg-surface2 px-1.5 py-0.5 font-bold">Enter</kbd> untuk lanjut.
        </p>
      </div>
    );
  }

  // ---------- Pengaturan ----------
  const n = count === 'all' ? pool.length : Math.min(count, pool.length);
  return (
    <FilterLayout filterApi={filterApi} count={pool.length}>
      {({ filterButton }) => (
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl">Kuis</h1>
              <p className="text-muted">{pool.length} kata siap diuji</p>
            </div>
            {filterButton}
          </div>

          <ChapterFilter selected={filters.babs} onToggle={toggle} />

          <section className="card flex flex-col gap-4 p-4">
            <div>
              <p className="mb-1.5 text-sm font-extrabold text-muted">Mode kuis</p>
              <Segmented label="Mode kuis" value={mode} onChange={setMode} options={QUIZ_MODES.map((m) => ({ value: m.key, label: m.label }))} />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-extrabold text-muted">Jumlah soal</p>
              <Segmented label="Jumlah soal" value={count} onChange={setCount} options={COUNT_OPTIONS} />
            </div>
          </section>

          <section className="card flex flex-col gap-3 p-4" aria-labelledby="judul-leitner">
            <h2 id="judul-leitner" className="text-lg">
              Keranjang bambu (Leitner)
            </h2>
            <LeitnerBaskets counts={boxCounts} />
            <details className="text-sm text-muted">
              <summary className="cursor-pointer font-bold text-primary-ink">Bagaimana cara kerjanya?</summary>
              <p className="mt-2">
                Jawaban benar menaikkan kata ke kotak berikutnya, jawaban salah mengembalikannya ke kotak 1 dan mengubah statusnya menjadi belum hafal. Kata di kotak
                rendah lebih sering muncul sebagai soal, jadi kata yang sulit lebih banyak dilatih.
              </p>
            </details>
          </section>

          {pool.length === 0 ? (
            <EmptyState
              mood="thinking"
              title="Tidak ada kata untuk diuji"
              message="Tidak ada kata yang cocok dengan filter saat ini."
              action={
                <button type="button" className="btn-primary" onClick={reset}>
                  Hapus semua filter
                </button>
              }
            />
          ) : (
            <button type="button" className="btn-primary !min-h-[56px] text-lg" onClick={() => start(pool, count)}>
              <Play size={22} aria-hidden="true" /> Mulai kuis ({n} soal)
            </button>
          )}
        </>
      )}
    </FilterLayout>
  );
}
