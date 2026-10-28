// Warna identitas bab: diambil berputar dari palet aksen berdasarkan NOMOR bab,
// jadi bab baru (bab 7, 8, ...) otomatis kebagian warna tanpa konfigurasi.
// Bab 1 hijau, 2 sakura, 3 biru, 4 madu, 5 persik, 6 lavender, 7 hijau lagi, dst.
const PALETTE = ['green', 'sakura', 'sky', 'honey', 'peach', 'lavender'];

export function chapterColorName(bab) {
  const n = Number.isFinite(bab) && bab > 0 ? bab : 1;
  return PALETTE[(n - 1) % PALETTE.length];
}

// Mengembalikan style berisi CSS variables --ch / --ch-soft / --ch-ink.
// Elemen di dalamnya memakai kelas Tailwind: bg-ch, bg-ch-soft, text-ch-ink.
export function chapterStyle(bab) {
  const name = chapterColorName(bab);
  return {
    '--ch': `var(--${name})`,
    '--ch-soft': `var(--${name}-soft)`,
    '--ch-ink': `var(--${name}-ink)`,
  };
}
