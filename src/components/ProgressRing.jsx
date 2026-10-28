// Cincin progress SVG. Warna mengikuti --ch bila ada (warna bab), selain itu hijau bambu.
export default function ProgressRing({ value = 0, size = 64, stroke = 8, label, color = 'rgb(var(--ch))', children }) {
  const v = Math.max(0, Math.min(1, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${Math.round(v * 100)} persen`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--ink) / .12)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-center text-sm font-extrabold text-ink">
        {children ?? `${Math.round(v * 100)}%`}
      </span>
    </div>
  );
}
