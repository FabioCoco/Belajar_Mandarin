// Deretan batang bambu: makin banyak kata hafal, makin banyak batang yang sudah dimakan panda
// (tinggal tunggul pendek bergigitan). `eaten` dari `total` batang.
export default function BambooMeter({ eaten, total = 10 }) {
  const W = 30;
  return (
    <svg
      viewBox={`0 0 ${total * W} 92`}
      className="w-full max-w-md"
      role="img"
      aria-label={`Panda sudah makan ${eaten} dari ${total} batang bambu`}
    >
      {Array.from({ length: total }, (_, i) => {
        const cx = i * W + W / 2;
        if (i < eaten) {
          // Tunggul: pendek, pudar, dengan bekas gigitan
          return (
            <g key={i} opacity="0.55">
              <rect x={cx - 6} y="68" width="12" height="22" rx="3" fill="rgb(var(--primary))" stroke="rgb(var(--primary-ink))" strokeWidth="1.5" />
              <circle cx={cx - 5} cy="68" r="3.5" fill="rgb(var(--surface))" />
              <circle cx={cx + 4} cy="67" r="3" fill="rgb(var(--surface))" />
            </g>
          );
        }
        return (
          <g key={i}>
            <rect x={cx - 6} y="14" width="12" height="76" rx="5" fill="rgb(var(--primary))" stroke="rgb(var(--primary-ink))" strokeWidth="1.5" />
            <path d={`M${cx - 6} 38 H${cx + 6} M${cx - 6} 60 H${cx + 6}`} stroke="rgb(var(--primary-ink))" strokeWidth="2" />
            <path d={`M${cx} 18 q10 -2 14 -12 q-12 0 -14 12z`} fill="rgb(var(--primary))" stroke="rgb(var(--primary-ink))" strokeWidth="1.2" />
          </g>
        );
      })}
    </svg>
  );
}
