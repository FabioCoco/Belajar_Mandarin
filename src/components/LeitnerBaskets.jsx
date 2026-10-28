import { BOXES } from '../lib/leitner.js';

// Keranjang bambu anyaman (SVG buatan sendiri). `tone` mengambil warna dari palet aksen.
export function BambooBasket({ tone = 'green', count, size = 120 }) {
  const fill = `rgb(var(--${tone}) / .45)`;
  const ink = `rgb(var(--${tone}-ink))`;
  return (
    <div className="relative" style={{ width: size, height: size * 0.85 }}>
      <svg viewBox="0 0 120 100" width="100%" height="100%" aria-hidden="true">
        {/* pegangan */}
        <path d="M30 32 Q60 -10 90 32" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
        {/* badan */}
        <path d="M14 36 L106 36 L97 90 Q96 96 90 96 L30 96 Q24 96 23 90 Z" fill={fill} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        {/* anyaman */}
        <g stroke={ink} strokeWidth="1.6" strokeOpacity=".55" strokeLinecap="round">
          <path d="M17 50 H103 M19 64 H101 M21 78 H99" />
          <path d="M34 36 L31 50 M52 36 L50 50 M70 36 L70 50 M88 36 L90 50" />
          <path d="M43 50 L41 64 M61 50 L60 64 M79 50 L79 64 M97 50 L95 64" />
          <path d="M34 64 L32 78 M52 64 L51 78 M70 64 L70 78 M88 64 L89 78" />
          <path d="M43 78 L42 94 M61 78 L61 94 M79 78 L78 94" />
        </g>
        {/* bibir keranjang */}
        <rect x="9" y="30" width="102" height="12" rx="6" fill={fill} stroke={ink} strokeWidth="2.5" />
      </svg>
      <span
        className="absolute inset-x-0 flex items-center justify-center font-black"
        style={{ top: '48%', color: ink, fontSize: size * 0.22 }}
      >
        <span className="rounded-pill bg-surface/85 px-2 leading-tight">{count}</span>
      </span>
    </div>
  );
}

// Tiga keranjang Leitner. `counts` = { 1: n, 2: n, 3: n }.
export default function LeitnerBaskets({ counts }) {
  return (
    <ul className="grid grid-cols-3 gap-2 sm:gap-4" aria-label="Isi kotak Leitner">
      {BOXES.map((b) => (
        <li key={b.box} className="flex flex-col items-center text-center">
          <BambooBasket tone={b.tone} count={counts[b.box] ?? 0} size={104} />
          <p className="mt-1 text-sm font-extrabold">{b.label}</p>
          <p className="text-xs text-muted">{b.hint}</p>
          <p className="sr-only">{counts[b.box] ?? 0} kata</p>
        </li>
      ))}
    </ul>
  );
}
