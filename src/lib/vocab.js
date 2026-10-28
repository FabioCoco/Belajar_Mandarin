import raw from '../data/vocab.json';

// Jika vocab.json kosong/rusak, aplikasi tetap jalan dengan daftar kosong.
export const vocab = Array.isArray(raw) ? raw : [];
export const vocabById = new Map(vocab.map((v) => [v.id, v]));

export const CATEGORIES = [
  { key: 'core', label: 'Kata Inti' },
  { key: 'extended', label: 'Kata Lanjutan' },
  { key: 'extra', label: 'Kata Ekstra' },
  { key: 'names', label: 'Nama' },
];
export const categoryLabel = (key) => CATEGORIES.find((c) => c.key === key)?.label ?? key;

// Daftar bab dibaca otomatis dari data (tidak di-hardcode).
export const chapters = (() => {
  const map = new Map();
  for (const v of vocab) {
    if (!map.has(v.bab)) map.set(v.bab, { bab: v.bab, judulId: v.babJudulId, judulEn: v.babJudulEn, ids: [] });
    map.get(v.bab).ids.push(v.id);
  }
  return [...map.values()].sort((a, b) => a.bab - b.bab).map((c) => ({ ...c, total: c.ids.length }));
})();

// Jenis kata gabungan dipecah agar filter rapi:
//   "kata benda, kata kerja"  -> ["kata benda", "kata kerja"]
//   "kata bilangan-satuan"    -> ["kata bilangan", "kata satuan"]
export function splitPos(posId) {
  if (!posId) return [];
  const out = [];
  for (const part of posId.split(',').map((s) => s.trim()).filter(Boolean)) {
    const m = /^(\S+ \S+)-(\S+)$/.exec(part);
    if (m) out.push(m[1], `${m[1].split(' ')[0]} ${m[2]}`);
    else out.push(part);
  }
  return [...new Set(out)];
}

export const allPos = [...new Set(vocab.flatMap((v) => splitPos(v.posId)))].sort((a, b) => a.localeCompare(b, 'id'));

// Pencarian: abaikan huruf besar/kecil dan tanda nada (cari "ni hao" menemukan "nǐ hǎo")
export const normalize = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const searchIndex = new Map(
  vocab.map((v) => [
    v.id,
    normalize([v.hanzi, v.pinyin, v.english, v.indonesian, ...(v.altEnglish || []), ...(v.altIndonesian || [])].join(' | ')),
  ]),
);

export function filterVocab(items, filters, isMemorized) {
  const q = normalize(filters.q.trim());
  return items.filter((v) => {
    if (filters.babs.length && !filters.babs.includes(v.bab)) return false;
    if (filters.kategori.length && !filters.kategori.includes(v.kategori)) return false;
    if (filters.pos.length && !splitPos(v.posId).some((p) => filters.pos.includes(p))) return false;
    if (filters.status === 'memorized' && !isMemorized(v.id)) return false;
    if (filters.status === 'unmemorized' && isMemorized(v.id)) return false;
    if (q && !searchIndex.get(v.id)?.includes(q)) return false;
    return true;
  });
}

// Teks arti sesuai pengaturan bahasa: 'id' | 'en' | 'both'.
// Mengembalikan [{ lang, text, alt }] agar tampilan bebas menata.
export function getMeanings(item, lang) {
  const id = { lang: 'ID', text: item.indonesian, alt: (item.altIndonesian || []).join('; ') || null };
  const en = { lang: 'EN', text: item.english, alt: (item.altEnglish || []).join('; ') || null };
  if (lang === 'en') return [en];
  if (lang === 'both') return [id, en];
  return [id];
}
