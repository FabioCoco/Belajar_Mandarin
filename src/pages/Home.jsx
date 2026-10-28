import { useMemo } from 'react';
import { Flame, CircleCheck, Play, BookOpen } from 'lucide-react';
import PandaMascot from '../components/PandaMascot.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import ChapterCard from '../components/ChapterCard.jsx';
import { EmptyState } from '../components/StateViews.jsx';
import { useProgress } from '../hooks/useProgress.jsx';
import { chapters, vocab } from '../lib/vocab.js';
import { DAILY_TARGET } from '../lib/constants.js';

function StatCard({ icon: Icon, label, value, tone }) {
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

export default function Home({ navigate, openChapter }) {
  const { isMemorized, words, todayCount, studiedToday, streak } = useProgress();

  // Jumlah kata hafal per bab
  const memorizedByChapter = useMemo(
    () => Object.fromEntries(chapters.map((c) => [c.bab, c.ids.filter((id) => isMemorized(id)).length])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [words],
  );
  const totalMemorized = Object.values(memorizedByChapter).reduce((a, b) => a + b, 0);

  if (vocab.length === 0) {
    return (
      <EmptyState
        mood="sleeping"
        title="Belum ada kosakata"
        message="Taruh file bab-N.json di folder data-mentah/ lalu jalankan npm run build:data."
      />
    );
  }

  const mood = todayCount >= DAILY_TARGET ? 'cheer' : studiedToday ? 'happy' : 'sleeping';
  const ratio = Math.min(1, todayCount / DAILY_TARGET);

  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-card border border-line/70 bg-hero p-5 shadow-soft sm:p-7">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <PandaMascot mood={mood} size={150} key={mood} />
          <div className="flex-1 text-center sm:text-left">
            <div className="relative inline-block rounded-3xl bg-surface px-5 py-3 shadow-soft">
              <h1 className="text-xl sm:text-2xl">Halo! Hari ini mau belajar apa?</h1>
            </div>
            <p className="mt-3 text-muted">
              {studiedToday
                ? `Hebat! ${todayCount} dari ${DAILY_TARGET} kata hari ini sudah dipelajari.`
                : 'Panda masih mengantuk. Yuk, mulai dengan beberapa kata!'}
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button type="button" className="btn-primary" onClick={() => navigate('belajar')}>
                <BookOpen size={20} aria-hidden="true" />
                Lanjut belajar
              </button>
              <button type="button" className="btn-soft" onClick={() => navigate('kuis')}>
                <Play size={20} aria-hidden="true" />
                Mulai kuis
              </button>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Ringkasan" className="grid gap-3 sm:grid-cols-3">
        <div className="card flex items-center gap-3 p-4">
          <ProgressRing
            value={ratio}
            size={56}
            stroke={7}
            color="rgb(var(--primary-ink))"
            label={`Target harian: ${todayCount} dari ${DAILY_TARGET} kata`}
          >
            {todayCount}
          </ProgressRing>
          <div>
            <p className="text-2xl font-black leading-none">
              {todayCount}/{DAILY_TARGET}
            </p>
            <p className="mt-1 text-sm text-muted">Target harian</p>
          </div>
        </div>
        <StatCard icon={Flame} label="Streak (hari berturut-turut)" value={streak} tone="bg-peach-soft text-peach-ink" />
        <StatCard icon={CircleCheck} label={`Kata hafal dari ${vocab.length}`} value={totalMemorized} tone="bg-ok-soft text-ok-ink" />
      </section>

      <section aria-labelledby="judul-bab">
        <h2 id="judul-bab" className="mb-3 text-xl">
          Pilih bab
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {chapters.map((c, i) => (
            <ChapterCard key={c.bab} index={i} chapter={c} memorized={memorizedByChapter[c.bab] ?? 0} onClick={() => openChapter(c.bab)} />
          ))}
        </div>
      </section>
    </div>
  );
}
