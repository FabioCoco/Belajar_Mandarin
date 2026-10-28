// Dekorasi latar halus: daun bambu, awan, bintang, bunga sakura. Semua aria-hidden.
export function BambooLeaf({ className = '', style }) {
  return (
    <svg viewBox="0 0 60 30" className={className} style={style} aria-hidden="true">
      <path d="M2 24 C 12 4 36 -2 58 4 C 46 20 24 30 2 24 Z" fill="currentColor" />
      <path d="M4 23 C 20 16 38 10 55 5" fill="none" stroke="rgb(var(--bg))" strokeOpacity=".6" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function Cloud({ className = '', style }) {
  return (
    <svg viewBox="0 0 80 40" className={className} style={style} aria-hidden="true">
      <path
        d="M20 36 a12 12 0 0 1 -1 -24 a16 16 0 0 1 30 -3 a13 13 0 0 1 14 12 a9 9 0 0 1 -2 15 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Star({ className = '', style }) {
  return (
    <svg viewBox="-10 -10 20 20" className={className} style={style} aria-hidden="true">
      <path d="M0 -9 L2.6 -2.6 L9 0 L2.6 2.6 L0 9 L-2.6 2.6 L-9 0 L-2.6 -2.6Z" fill="currentColor" />
    </svg>
  );
}

export function Sakura({ className = '', style }) {
  return (
    <svg viewBox="-20 -20 40 40" className={className} style={style} aria-hidden="true">
      {[0, 72, 144, 216, 288].map((r) => (
        <path key={r} transform={`rotate(${r})`} d="M0 0 C -9 -8 -7 -17 0 -18 C 7 -17 9 -8 0 0Z" fill="currentColor" />
      ))}
      <circle r="2.6" fill="rgb(var(--bg))" fillOpacity=".7" />
    </svg>
  );
}

// Latar tetap di belakang konten. Tipis & pointer-events-none agar tidak mengganggu keterbacaan.
export function BackgroundDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <Cloud className="absolute left-[6%] top-[10%] w-24 text-sky/20 md:w-32" />
      <Cloud className="absolute right-[8%] top-[38%] w-20 text-sakura/15 md:w-28" />
      <Star className="absolute right-[14%] top-[8%] w-5 text-honey/50" />
      <Star className="absolute left-[40%] top-[22%] w-3 text-lavender/50" />
      <Sakura className="absolute left-[3%] top-[55%] w-10 text-sakura/30" />
      <Sakura className="absolute right-[5%] top-[72%] w-8 rotate-12 text-sakura/25" />
      <BambooLeaf className="absolute -left-4 bottom-[8%] w-32 -rotate-12 text-primary/15" />
      <BambooLeaf className="absolute -right-6 bottom-[22%] w-36 rotate-[200deg] text-primary/15" />
      <BambooLeaf className="absolute right-[30%] -top-3 w-24 rotate-[160deg] text-primary/10" />
    </div>
  );
}
