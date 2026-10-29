// Kunci tanggal lokal 'YYYY-MM-DD' (bukan UTC, supaya hari belajar mengikuti jam pengguna).
export const dateKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const daysAgo = (n, from = new Date()) => {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setDate(d.getDate() - n);
  return d;
};

export const yesterdayKey = () => dateKey(daysAgo(1));

// Daftar n hari terakhir (terlama dulu, berakhir hari ini) dengan jumlah kata dari `history`.
export function lastDays(history, n) {
  return Array.from({ length: n }, (_, i) => {
    const date = daysAgo(n - 1 - i);
    const key = dateKey(date);
    return { key, date, count: history[key] ?? 0 };
  });
}
