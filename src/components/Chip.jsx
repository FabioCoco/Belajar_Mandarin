import { Check } from 'lucide-react';

// Chip filter. Memakai warna bab bila prop `style` berisi variabel --ch (lihat chapterStyle),
// selain itu memakai warna netral. Terpilih = ikon centang + latar pekat (bukan warna saja).
export default function Chip({ selected, onClick, children, colored = false, style }) {
  const base =
    'inline-flex min-h-[44px] items-center gap-1.5 rounded-pill border px-3.5 text-sm font-bold transition active:scale-95 md:min-h-[36px]';
  const tone = colored
    ? selected
      ? 'border-ch-ink bg-ch-ink text-surface'
      : 'border-transparent bg-ch-soft text-ch-ink hover:border-ch-ink/40'
    : selected
      ? 'border-primary-ink bg-primary-ink text-surface'
      : 'border-line bg-surface2 text-ink hover:border-primary-ink/40';
  return (
    <button type="button" aria-pressed={!!selected} onClick={onClick} style={style} className={`${base} ${tone}`}>
      {selected && <Check size={14} strokeWidth={3} aria-hidden="true" />}
      {children}
    </button>
  );
}
