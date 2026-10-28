import { useEffect, useRef } from 'react';

const COLORS = ['#4CAF7A', '#FF8FAB', '#FFC857', '#6EC1E4', '#FF9F68', '#B79CED'];
const DURATION = 2600; // ms

// Konfeti ringan berbasis canvas (tanpa library). Setiap kali prop `fire` berubah menjadi
// angka > 0, satu ledakan dijalankan. Tidak berjalan sama sekali bila prefers-reduced-motion.
export default function Confetti({ fire = 0 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!fire) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return undefined;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = w < 500 ? 70 : 130;
    const parts = Array.from({ length: count }, () => ({
      x: w / 2 + (Math.random() - 0.5) * w * 0.25,
      y: h * 0.4,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 11 - 4,
      size: 6 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.35,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      round: Math.random() < 0.3,
    }));

    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = now - start;
      ctx.clearRect(0, 0, w, h);
      const fade = Math.max(0, 1 - Math.max(0, t - (DURATION - 700)) / 700);
      for (const p of parts) {
        p.vy += 0.28; // gravitasi
        p.vx *= 0.99; // hambatan udara
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }
      if (t < DURATION) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, w, h);
    };
  }, [fire]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] h-full w-full" />;
}
