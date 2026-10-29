// Baris bab: nomor, judul, jumlah kata, dan status progres sederhana. Satu warna aksen, tanpa dekorasi.
export function chapterStatus(memorized, total) {
  if (memorized <= 0) return { label: 'Belum mulai', tone: 'text-muted' };
  if (memorized >= total) return { label: 'Selesai', tone: 'text-ok-ink' };
  return { label: 'Sedang', tone: 'text-primary-ink' };
}

export default function ChapterCard({ chapter, memorized, onClick }) {
  const ratio = chapter.total ? memorized / chapter.total : 0;
  const status = chapterStatus(memorized, chapter.total);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Bab ${chapter.bab}: ${chapter.judulId}. ${chapter.total} kata, ${memorized} hafal. ${status.label}`}
      className="flex w-full flex-col gap-2.5 rounded-xl border border-line bg-surface p-4 text-left transition hover:border-primary-ink active:bg-surface2"
    >
      <span className="flex items-baseline gap-3">
        <span className="text-2xl font-black tabular-nums text-primary-ink">{String(chapter.bab).padStart(2, '0')}</span>
        <span className="min-w-0 flex-1 text-base font-extrabold leading-snug text-ink">{chapter.judulId}</span>
      </span>
      <span className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted">{chapter.total} kata</span>
        <span className={`font-bold ${status.tone}`}>
          {status.label}
          {memorized > 0 && <span className="font-semibold text-muted"> · {memorized}/{chapter.total}</span>}
        </span>
      </span>
      <span aria-hidden="true" className="h-1.5 overflow-hidden rounded-pill bg-line">
        <span className="block h-full rounded-pill bg-primary-ink" style={{ width: `${ratio * 100}%` }} />
      </span>
    </button>
  );
}
