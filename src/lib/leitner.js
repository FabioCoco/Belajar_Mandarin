// Sistem Leitner 3 kotak ("keranjang bambu").
//   - Jawaban benar  : kata naik satu kotak (maksimal kotak 3).
//   - Jawaban salah  : kata kembali ke kotak 1.
//   - Pemilihan soal : kata di kotak rendah punya bobot lebih besar, jadi muncul lebih sering.
// Kata yang belum pernah dikuis dianggap berada di kotak 1.
export const BOXES = [
  { box: 1, label: 'Kotak 1', hint: 'Sering muncul', weight: 4, tone: 'peach' },
  { box: 2, label: 'Kotak 2', hint: 'Kadang muncul', weight: 2, tone: 'honey' },
  { box: 3, label: 'Kotak 3', hint: 'Jarang muncul', weight: 1, tone: 'green' },
];
export const MAX_BOX = BOXES.length;

export const nextBox = (box, correct) => (correct ? Math.min(MAX_BOX, box + 1) : 1);
export const weightOf = (box) => BOXES.find((b) => b.box === box)?.weight ?? 1;

// Pengambilan acak berbobot tanpa pengembalian (Efraimidis-Spirakis):
// tiap kata diberi kunci u^(1/bobot) dengan u acak di (0,1), lalu diurutkan menurun.
// Bobot besar -> kunci cenderung dekat 1 -> lebih sering terpilih dan lebih awal.
export function pickWeighted(items, getBox, n) {
  return items
    .map((it) => ({ it, key: Math.random() ** (1 / weightOf(getBox(it))) }))
    .sort((a, b) => b.key - a.key)
    .slice(0, n)
    .map((x) => x.it);
}
