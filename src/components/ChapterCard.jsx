import { chapterStyle } from '../lib/chapterColors.js';
import ChapterIcon from './ChapterIcon.jsx';
import ProgressRing from './ProgressRing.jsx';

// Kartu bab berwarna: ikon, judul bab (title_id), progress ring. Warna otomatis dari nomor bab.
export default function ChapterCard({ chapter, memorized, onClick, index = 0 }) {
  const ratio = chapter.total ? memorized / chapter.total : 0;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...chapterStyle(chapter.bab), animationDelay: `${Math.min(index, 8) * 60}ms`, animationFillMode: "backwards" }}
      className="group relative animate-pop-in flex w-full items-center gap-4 overflow-hidden rounded-card border border-ch/30 bg-gradient-to-br from-ch-soft to-surface p-4 text-left shadow-soft transition duration-150 hover:-translate-y-0.5 hover:shadow-lift active:scale-[.98]"
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-ch" />
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-ch-ink shadow-soft">
        <ChapterIcon bab={chapter.bab} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="inline-block rounded-pill bg-ch-ink px-2.5 py-0.5 text-xs font-extrabold text-surface">Bab {chapter.bab}</span>
        <span className="mt-1 block text-base font-extrabold leading-snug text-ink">{chapter.judulId}</span>
        <span className="mt-0.5 block text-sm text-muted">
          {memorized}/{chapter.total} kata hafal
        </span>
      </span>
      <ProgressRing value={ratio} size={58} stroke={7} label={`Bab ${chapter.bab}: ${Math.round(ratio * 100)} persen hafal`} />
    </button>
  );
}
