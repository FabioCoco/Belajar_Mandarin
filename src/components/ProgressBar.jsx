import { useEffect, useState } from 'react';

// Bar progress berwarna. Warna datang dari variabel --ch (set lewat `style`, mis. chapterStyle).
// Angka dan persen selalu tampil sebagai teks, jadi informasi tidak bergantung pada warna.
export default function ProgressBar({ label, icon, done, total, style }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const [shown, setShown] = useState(0);

  // Lebar dianimasikan dari 0 saat pertama tampil
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <li style={style} className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 font-bold">
          {icon && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ch-soft text-ch-ink">{icon}</span>}
          <span className="min-w-0 break-words leading-snug">{label}</span>
        </span>
        <span className="shrink-0 text-sm font-extrabold tabular-nums text-ch-ink">
          {done}/{total} · {pct}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${label}: ${pct} persen hafal`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="h-4 overflow-hidden rounded-pill bg-ink/10"
      >
        <div
          className="h-full rounded-pill border border-ch-ink bg-gradient-to-r from-ch to-ch-ink transition-[width] duration-700 ease-out"
          style={{ width: `${shown}%`, minWidth: pct > 0 ? '0.75rem' : 0, borderWidth: pct > 0 ? 1 : 0 }}
        />
      </div>
    </li>
  );
}
