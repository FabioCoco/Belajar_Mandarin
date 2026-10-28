import { effectivePos, getMeanings, vocab } from './vocab.js';

export const QUIZ_MODES = [
  { key: 'hanzi-arti', label: 'Hanzi → Arti', prompt: 'Apa arti kata ini?' },
  { key: 'arti-hanzi', label: 'Arti → Hanzi', prompt: 'Mana hanzi yang tepat untuk arti ini?' },
  { key: 'hanzi-pinyin', label: 'Hanzi → Pinyin', prompt: 'Bagaimana pinyin kata ini?' },
];

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Isi jawaban sebuah kata menurut mode. `key` dipakai untuk mendeteksi pilihan yang kembar.
export function answerOf(v, mode, lang) {
  if (mode === 'arti-hanzi') return { key: v.hanzi, lines: [v.hanzi] };
  if (mode === 'hanzi-pinyin') return { key: v.pinyin.toLowerCase(), lines: [v.pinyin] };
  const lines = getMeanings(v, lang).map((m) => m.text);
  return { key: lines.join(' / ').toLowerCase(), lines };
}

// Dua kata dianggap "sejenis" bila jenis katanya beririsan (pos asli, atau posHint untuk entri tanpa pos).
// Bila keduanya tak punya jenis kata (mis. nama), dibandingkan lewat kategorinya.
function samePos(a, b) {
  const pa = effectivePos(a);
  const pb = effectivePos(b);
  if (!pa.length && !pb.length) return a.kategori === b.kategori;
  return pa.some((p) => pb.includes(p));
}

// Skor kemiripan tambahan agar pengecoh terasa masuk akal: kategori sama, panjang hanzi mirip, bab sama.
// Ditambah sedikit acak (jitter) supaya pilihan pengecoh tidak selalu sama.
function closeness(c, item) {
  const lenDiff = Math.abs([...c.hanzi].length - [...item.hanzi].length);
  const score = (c.kategori === item.kategori ? 2 : 0) + (lenDiff === 0 ? 2 : lenDiff === 1 ? 1 : 0) + (c.bab === item.bab ? 1 : 0);
  return score + Math.random() * 2.5;
}

// Kata lain yang juga merupakan jawaban benar untuk soal ini tidak boleh jadi pengecoh,
// misalnya hanzi yang sama di bab berbeda, atau dua kata dengan arti Indonesia/Inggris yang sama.
function conflicts(c, item, mode) {
  if (mode === 'arti-hanzi') return c.indonesian === item.indonesian || c.english === item.english;
  return c.hanzi === item.hanzi;
}

// Membuat satu soal pilihan ganda (maksimal 4 pilihan).
// Pengecoh: diutamakan dari kata dengan jenis kata yang sama agar tidak terlalu mudah ditebak; di dalam
// kelompok itu dan saat melengkapi dari kata lain, yang paling mirip (closeness) didahulukan.
// Pilihan dengan teks yang sama dibuang.
export function buildQuestion(item, mode, lang, pool = vocab) {
  const correct = answerOf(item, mode, lang);
  const seen = new Set([correct.key]);
  const eligible = pool
    .filter((c) => c.id !== item.id && !conflicts(c, item, mode) && answerOf(c, mode, lang).key !== correct.key)
    .map((c) => ({ c, same: samePos(c, item), score: closeness(c, item) }));
  const byScore = (x, y) => y.score - x.score;

  const picked = [];
  const take = (list) => {
    for (const { c } of list) {
      if (picked.length >= 3) return;
      const key = answerOf(c, mode, lang).key;
      if (seen.has(key)) continue;
      seen.add(key);
      picked.push(c);
    }
  };
  take(eligible.filter((x) => x.same).sort(byScore));
  take(eligible.filter((x) => !x.same).sort(byScore));

  const options = shuffle([item, ...picked]).map((v) => ({ id: v.id, ...answerOf(v, mode, lang) }));
  return { item, mode, options, correctIndex: options.findIndex((o) => o.id === item.id) };
}
