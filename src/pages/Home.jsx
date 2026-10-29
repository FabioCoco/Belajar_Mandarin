import { useMemo } from 'react';
import { Play, BookOpen } from 'lucide-react';
import PandaMascot from '../components/PandaMascot.jsx';
import ChapterCard from '../components/ChapterCard.jsx';
import { EmptyState } from '../components/StateViews.jsx';
import { useProgress } from '../hooks/useProgress.jsx';
import { chapters, vocab } from '../lib/vocab.js';
import { DAILY_TARGET } from '../lib/constants.js';

function Stat({ label, value }) {
  return (
    <div className="px-3 py-3 text-center sm:px-4">
      <p className="text-2xl font-black leading-none tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted sm:text-sm">{label}</p>
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

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <PandaMascot mood={mood} size={64} key={mood} />
          <div>
            <h1 className="text-xl sm:text-2xl">Beranda</h1>
            <p className="text-muted">
              {studiedToday ? `${todayCount} dari ${DAILY_TARGET} kata hari ini sudah dipelajari.` : 'Belum ada kata yang dipelajari hari ini.'}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" className="btn-primary" onClick={() => navigate('belajar')}>
            <BookOpen size={20} aria-hidden="true" />
            Lanjut belajar
          </button>
          <button type="button" className="btn-soft" onClick={() => navigate('kuis')}>
            <Play size={20} aria-hidden="true" />
            Mulai kuis
          </button>
        </div>
      </section>

      <section aria-label="Ringkasan" className="grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-surface">
        <Stat label="Target harian" value={`${todayCount}/${DAILY_TARGET}`} />
        <Stat label="Streak (hari)" value={streak} />
        <Stat label={`Hafal dari ${vocab.length}`} value={totalMemorized} />
      </section>

      <section aria-labelledby="judul-bab">
        <h2 id="judul-bab" className="mb-3 text-lg">
          Pilih bab
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {chapters.map((c) => (
            <ChapterCard key={c.bab} chapter={c} memorized={memorizedByChapter[c.bab] ?? 0} onClick={() => openChapter(c.bab)} />
          ))}
        </div>
      </section>
    </div>
  );
}
