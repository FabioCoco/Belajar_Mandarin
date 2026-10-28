// Design token dipusatkan di sini + CSS variables (src/index.css).
// Warna memakai channel RGB ("R G B") agar modifier opacity Tailwind (bg-primary/20) tetap jalan.
const rgb = (v) => `rgb(var(${v}) / <alpha-value>)`;
const accent = (n) => ({
  DEFAULT: rgb(`--${n}`),
  soft: rgb(`--${n}-soft`),
  ink: rgb(`--${n}-ink`),
});
const status = (n) => ({ soft: rgb(`--${n}-soft`), ink: rgb(`--${n}-ink`) });

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        ui: ['Nunito', 'Quicksand', 'ui-rounded', 'system-ui', 'sans-serif'],
        pinyin: ['Nunito', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        hanzi: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      colors: {
        bg: rgb('--bg'),
        surface: rgb('--surface'),
        surface2: rgb('--surface2'),
        line: rgb('--line'),
        control: rgb('--control'),
        ink: rgb('--ink'),
        muted: rgb('--muted'),
        primary: { DEFAULT: rgb('--primary'), ink: rgb('--primary-ink') },
        green: accent('green'),
        sakura: accent('sakura'),
        sky: accent('sky'),
        honey: accent('honey'),
        peach: accent('peach'),
        lavender: accent('lavender'),
        // Warna bab aktif: di-set per elemen lewat style (lihat lib/chapterColors.js)
        ch: { DEFAULT: rgb('--ch'), soft: rgb('--ch-soft'), ink: rgb('--ch-ink') },
        // Status: hafal / belum hafal / salah
        ok: status('ok'),
        todo: status('todo'),
        bad: status('bad'),
      },
      borderRadius: {
        card: '1.5rem',
        pill: '9999px',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--shadow) / .06), 0 4px 12px rgb(var(--shadow) / .08), 0 12px 28px rgb(var(--shadow) / .06)',
        lift: '0 2px 4px rgb(var(--shadow) / .08), 0 10px 24px rgb(var(--shadow) / .12), 0 24px 48px rgb(var(--shadow) / .10)',
      },
      backgroundImage: {
        'btn-primary': 'linear-gradient(135deg, rgb(var(--btn-from)), rgb(var(--btn-to)))',
        hero: 'linear-gradient(135deg, rgb(var(--hero-from)), rgb(var(--hero-to)))',
      },
      keyframes: {
        'page-in': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'none' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'sheet-up': { '0%': { transform: 'translateY(100%)' }, '100%': { transform: 'none' } },
        'pop-in': { '0%': { opacity: '0', transform: 'scale(.94)' }, '100%': { opacity: '1', transform: 'none' } },
      },
      animation: {
        'page-in': 'page-in .28s ease-out both',
        'fade-in': 'fade-in .2s ease-out both',
        'sheet-up': 'sheet-up .28s cubic-bezier(.2,.8,.2,1) both',
        'pop-in': 'pop-in .2s ease-out both',
      },
    },
  },
  plugins: [],
};
