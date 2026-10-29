import { useMemo } from 'react';
import { Flame, CircleCheck, Target } from 'lucide-react';
import PandaMascot from '../components/PandaMascot.jsx';
import BambooMeter from '../components/BambooMeter.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import ChapterIcon from '../components/ChapterIcon.jsx';
import LeitnerBaskets from '../components/LeitnerBaskets.jsx';
import HistoryChart from '../components/HistoryChart.jsx';
import { EmptyState } from '../components/StateViews.jsx';
import { useProgress } from '../hooks/useProgress.jsx';
import { chapterStyle } from '../lib/chapterColors.js';
import { DAILY_TARGET } from '../lib/constants.js';
import { CATEGORIES, chapters, vocab } from '../lib/vocab.js';

const STALKS = 10;

function Stat({ icon: Icon, value, label, tone }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
        <Icon size={22} aria-hidden="true" />
      </span>
      <div>
        <p className="text-2xl font-black leading-none">{value}</p>
        <p className="mt-1 text-sm text-muted">{label}</p>
      </div>
    </div>
  );
}

export default function Progress() {
  const { words, isMemorized, getWord, streak, todayCount, history } = useProgress();

  const stats = useMemo(() => {
    const perBab = chapters.map((c) => ({ ...c, done: c.ids.filter((id) => isMemorized(id)).length }));
    const perKategori = CATEGORIES.map((cat) => {
      const items = vocab.filter((v) => v.kategori === cat.key);
      return { ...cat, total: items.length, done: items.filter((v) => isMemorized(v.id)).length };
    }).filter((c) => c.total > 0);
    const boxes = { 1: 0, 2: 0, 3: 0 };
    for (const v of vocab) boxes[getWord(v.id).box] += 1;
    return { perBab, perKategori, boxes, memorized: perBab.reduce((a, c) => a + c.done, 0) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words]);

  if (vocab.length === 0) {
    return <EmptyState mood="sleeping" title="Belum ada kosakata" message="Jalankan npm run build:data setelah menaruh file bab di data-mentah/." />;
  }

  const ratio = stats.memorized / vocab.length;
  const eaten = Math.round(ratio * STALKS);
  const started = stats.memorized > 0;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl">Progress</h1>

      {/* Panda makan bambu: makin banyak hafal, makin banyak bambu termakan */}
      <section aria-label="Ringkasan hafalan" className="overflow-hidden rounded-card border border-line bg-surface p-4 sm:p-5">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <PandaMascot mood={started ? 'eating' : 'sleeping'} size={150} />
          <div className="flex w-full flex-1 flex-col items-center gap-3 sm:items-start">
            <p className="text-center text-lg font-extrabold sm:text-left">
              {started ? `Panda sudah makan ${eaten} dari ${STALKS} batang bambu!` : 'Panda masih lapar. Hafalkan kata pertamamu!'}
            </p>
            <BambooMeter eaten={eaten} total={STALKS} />
            <p className="text-sm text-muted">
              {stats.memorized} dari {vocab.length} kata sudah hafal ({Math.round(ratio * 100)}%)
            </p>
          </div>
          <ProgressRing value={ratio} size={96} stroke={11} color="rgb(var(--primary-ink))" label={`Total hafal ${Math.round(ratio * 100)} persen`} />
        </div>
      </section>

      <section aria-label="Statistik" className="grid gap-3 sm:grid-cols-3">
        <Stat icon={Flame} value={streak} label="Streak (hari berturut-turut)" tone="bg-peach-soft text-peach-ink" />
        <Stat icon={Target} value={`${todayCount}/${DAILY_TARGET}`} label="Target harian" tone="bg-sky-soft text-sky-ink" />
        <Stat icon={CircleCheck} value={stats.memorized} label="Kata hafal" tone="bg-ok-soft text-ok-ink" />
      </section>

      <section aria-labelledby="judul-riwayat" className="card p-4 sm:p-5">
        <h2 id="judul-riwayat" className="mb-3 text-xl">
          Riwayat belajar
        </h2>
        <HistoryChart history={history} />
      </section>

      <section aria-labelledby="judul-bab" className="card p-4 sm:p-5">
        <h2 id="judul-bab" className="mb-4 text-xl">
          Hafalan per bab
        </h2>
        <ul className="flex flex-col gap-4">
          {stats.perBab.map((c) => (
            <ProgressBar
              key={c.bab}
              style={chapterStyle(c.bab)}
              icon={<ChapterIcon bab={c.bab} size={18} />}
              label={`Bab ${c.bab}: ${c.judulId}`}
              done={c.done}
              total={c.total}
            />
          ))}
        </ul>
      </section>

      <section aria-labelledby="judul-kategori" className="card p-4 sm:p-5">
        <h2 id="judul-kategori" className="mb-4 text-xl">
          Hafalan per kategori
        </h2>
        <ul className="flex flex-col gap-4">
          {stats.perKategori.map((c, i) => (
            <ProgressBar key={c.key} style={chapterStyle(i + 1)} label={c.label} done={c.done} total={c.total} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="judul-kotak" className="card flex flex-col gap-3 p-4 sm:p-5">
        <h2 id="judul-kotak" className="text-xl">
          Keranjang Leitner
        </h2>
        <LeitnerBaskets counts={stats.boxes} />
        <p className="text-sm text-muted">Kata yang belum pernah muncul di kuis berada di kotak 1. Jawab benar untuk menaikkannya, jawab salah dan ia kembali ke kotak 1.</p>
      </section>
    </div>
  );
}
