// Membaca data-mentah/bab-*.json -> src/data/vocab.json (array datar, ternormalisasi).
// Jalankan: npm run build:data
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = join(ROOT, 'data-mentah');
const OUT_FILE = join(ROOT, 'src', 'data', 'vocab.json');
const VERSION_FILE = join(ROOT, 'src', 'data', 'vocab-version.json');

// Urutan = prioritas saat menggabungkan duplikat (core menang atas yang lain)
const CATEGORIES = [
  { key: 'core', field: 'core_words' },
  { key: 'extended', field: 'extended_words' },
  { key: 'extra', field: 'extra_words' },
  { key: 'names', field: 'names' },
];
const PRIORITY = Object.fromEntries(CATEGORIES.map((c, i) => [c.key, i]));
const REQUIRED = ['hanzi', 'pinyin', 'english', 'indonesian'];

// Pinyin valid: huruf latin (a-z, ü), vokal bernada, spasi, apostrof, tanda hubung, titik tengah, tanda baca ringan
const PINYIN_RE = /^[a-züÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńňǹḿ\s'’\-·….,?!/()]+$/i;
const TONE_RE = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńňǹḿ]/;
const HANZI_RE = /[㐀-鿿]/;

// Koreksi hanzi tanpa mengubah data mentah. Kunci: "<bab>|<hanzi asli>", nilai: hanzi pengganti.
// Contoh: '3|103': '幺零三'. Saat ini kosong karena tidak ada entri yang perlu dikoreksi.
const HANZI_OVERRIDES = {};
const overrideLog = [];

// Petunjuk jenis kata untuk entri TANPA pos (extra_words/names) yang jenisnya jelas.
// Hanya dipakai aplikasi untuk memilih pengecoh kuis yang sejenis (field posHint); tidak ditampilkan
// di UI dan tidak masuk filter jenis kata. Bentuk: { 'kata hubung': ['因为', ...], ... }.
// Kosong karena extra_words saat ini berisi kalimat/ungkapan, bukan kata tunggal tanpa jenis kata.
const POS_HINTS = {};
const POS_HINT_BY_HANZI = Object.fromEntries(Object.entries(POS_HINTS).flatMap(([pos, list]) => list.map((h) => [h, pos])));
let hintCount = 0;

const warnings = [];
const warn =(where, msg) => warnings.push(`[${where}] ${msg}`);
const clean = (v) => (typeof v === 'string' ? v.trim() : v);
const nz = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);

function readChapterFiles() {
  if (!existsSync(SRC_DIR)) {
    console.error(`Folder ${SRC_DIR} tidak ditemukan.`);
    return [];
  }
  return readdirSync(SRC_DIR)
    .map((f) => ({ f, m: /^bab-(\d+)\.json$/i.exec(f) }))
    .filter((x) => x.m)
    .sort((a, b) => Number(a.m[1]) - Number(b.m[1]))
    .map((x) => ({ file: x.f, num: Number(x.m[1]) }));
}

function validate(item, where) {
  let ok = true;
  for (const f of REQUIRED) {
    if (!nz(item[f])) {
      warn(where, `field wajib "${f}" kosong (hanzi="${item.hanzi ?? ''}")`);
      ok = false;
    }
  }
  if (nz(item.hanzi) && !HANZI_RE.test(item.hanzi)) {
    warn(where, `hanzi tidak mengandung karakter Han: "${item.hanzi}"`);
  }
  if (nz(item.pinyin)) {
    const py = item.pinyin.trim();
    if (!PINYIN_RE.test(py)) {
      warn(where, `pinyin berisi karakter tidak valid: "${py}" (${item.hanzi})`);
    } else if (!TONE_RE.test(py)) {
      // Tanpa tanda nada: bisa nada netral, cukup diperingatkan
      warn(where, `pinyin tanpa tanda nada: "${py}" (${item.hanzi})`);
    }
  }
  return ok;
}

const byChapter = new Map(); // bab -> { meta, entries: Map(key -> entry) }
let duplicates = 0;
const dupLog = [];
const chapters = readChapterFiles();

if (chapters.length === 0) console.warn('PERINGATAN: tidak ada file data-mentah/bab-*.json.');

for (const { file, num } of chapters) {
  let data;
  try {
    const text = readFileSync(join(SRC_DIR, file), 'utf8').replace(/^﻿/, '');
    if (!text.trim()) {
      warn(file, 'file kosong, dilewati');
      continue;
    }
    data = JSON.parse(text);
  } catch (e) {
    warn(file, `gagal dibaca/parse: ${e.message}`);
    continue;
  }
  const ch = data.chapter || {};
  if (ch.id != null && Number(ch.id) !== num) {
    warn(file, `chapter.id (${ch.id}) tidak cocok dengan nomor file (${num}); memakai nomor file`);
  }
  if (!nz(ch.title_id)) warn(file, 'chapter.title_id kosong');
  if (!nz(ch.title_en)) warn(file, 'chapter.title_en kosong');

  const entries = new Map();
  byChapter.set(num, {
    meta: { judulId: nz(ch.title_id) || `Bab ${num}`, judulEn: nz(ch.title_en) || `Chapter ${num}` },
    entries,
  });

  for (const { key, field } of CATEGORIES) {
    const list = data[field];
    if (list == null) {
      warn(file, `bagian "${field}" tidak ada`);
      continue;
    }
    if (!Array.isArray(list)) {
      warn(file, `bagian "${field}" bukan array`);
      continue;
    }
    list.forEach((raw, i) => {
      const where = `${file} > ${field}[${i}]`;
      if (!raw || typeof raw !== 'object') {
        warn(where, 'entri bukan objek');
        return;
      }
      const fixed = HANZI_OVERRIDES[`${num}|${raw.hanzi}`];
      if (fixed) {
        overrideLog.push(`Bab ${num}: "${raw.hanzi}" -> "${fixed}"`);
        raw = { ...raw, hanzi: fixed };
      }
      if (!validate(raw, where)) return; // entri dengan field wajib kosong dibuang
      const item = {
        kategori: key,
        hanzi: clean(raw.hanzi),
        pinyin: clean(raw.pinyin),
        english: clean(raw.english),
        indonesian: clean(raw.indonesian),
        posId: nz(raw.pos_id),
        posEn: nz(raw.pos_en),
        note: nz(raw.note),
        posHint: null,
      };
      if (!item.posId && POS_HINT_BY_HANZI[item.hanzi]) {
        item.posHint = POS_HINT_BY_HANZI[item.hanzi];
        hintCount++;
      }
      const dk = `${item.hanzi}|${item.pinyin}`;
      const existing = entries.get(dk);
      if (!existing) {
        entries.set(dk, item);
        return;
      }

      // Duplikat dalam satu bab: pertahankan kategori berprioritas tertinggi,
      // terjemahan yang berbeda disimpan sebagai alternatif.
      duplicates++;
      let keep = existing;
      let other = item;
      if (PRIORITY[item.kategori] < PRIORITY[existing.kategori]) {
        keep = item;
        other = existing;
      }
      keep.posId ||= other.posId;
      keep.posEn ||= other.posEn;
      keep.note ||= other.note;
      keep.posHint ||= other.posHint;
      if (other.english && other.english !== keep.english) {
        keep.altEnglish = [...new Set([...(keep.altEnglish || []), other.english, ...(other.altEnglish || [])])];
      }
      if (other.indonesian && other.indonesian !== keep.indonesian) {
        keep.altIndonesian = [
          ...new Set([...(keep.altIndonesian || []), other.indonesian, ...(other.altIndonesian || [])]),
        ];
      }
      entries.set(dk, keep);
      dupLog.push(`Bab ${num}: ${item.hanzi} (${item.pinyin}) ada di ${existing.kategori} & ${item.kategori} -> ${keep.kategori}`);
    });
  }
}

// Susun array datar + id unik per kategori
const vocab = [];
const stats = {};
for (const [num, { meta, entries }] of byChapter) {
  const counters = {};
  const sorted = [...entries.values()].sort((a, b) => PRIORITY[a.kategori] - PRIORITY[b.kategori]);
  stats[num] = { total: 0, core: 0, extended: 0, extra: 0, names: 0 };
  for (const e of sorted) {
    counters[e.kategori] = (counters[e.kategori] || 0) + 1;
    const n = String(counters[e.kategori]).padStart(3, '0');
    stats[num][e.kategori]++;
    stats[num].total++;
    vocab.push({
      id: `b${num}-${e.kategori}-${n}`,
      bab: num,
      babJudulId: meta.judulId,
      babJudulEn: meta.judulEn,
      kategori: e.kategori,
      hanzi: e.hanzi,
      pinyin: e.pinyin,
      english: e.english,
      indonesian: e.indonesian,
      posId: e.posId,
      posEn: e.posEn,
      note: e.note,
      ...(e.posHint ? { posHint: e.posHint } : {}),
      ...(e.altEnglish ? { altEnglish: e.altEnglish } : {}),
      ...(e.altIndonesian ? { altIndonesian: e.altIndonesian } : {}),
    });
  }
}

const ids = new Set();
for (const v of vocab) {
  if (ids.has(v.id)) warn(v.id, 'ID ganda (bug script)');
  ids.add(v.id);
}

// Pengaman: jangan pernah menimpa vocab.json dengan daftar kosong (mis. folder data-mentah/ hilang di CI)
if (vocab.length === 0) {
  console.error('\nGAGAL: tidak ada kosakata yang berhasil dibaca dari data-mentah/. vocab.json TIDAK diubah.');
  warnings.forEach((w) => console.error(`  ! ${w}`));
  process.exit(1);
}

mkdirSync(dirname(OUT_FILE), { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(vocab, null, 2) + '\n', 'utf8');

// Versi dataset: hash dari (id + hanzi + pinyin). Aplikasi memakainya untuk membuang progress lama
// bila isi kosakata berubah, supaya status "hafal" tidak salah menunjuk ke kata lain.
const version = createHash('sha1')
  .update(vocab.map((v) => `${v.id}|${v.hanzi}|${v.pinyin}`).join('\n'))
  .digest('hex')
  .slice(0, 10);
writeFileSync(VERSION_FILE, JSON.stringify({ version }, null, 2) + '\n', 'utf8');

// ---------- Laporan ----------
const line = '-'.repeat(66);
console.log(`\n${line}\nLAPORAN BUILD KOSAKATA\n${line}`);
console.log('Bab  Judul                               Total  core  ext extra names');
for (const [num, { meta }] of byChapter) {
  const s = stats[num];
  console.log(
    `${String(num).padStart(3)}  ${meta.judulId.slice(0, 34).padEnd(34)} ${String(s.total).padStart(5)}  ${String(s.core).padStart(4)} ${String(s.extended).padStart(4)} ${String(s.extra).padStart(5)} ${String(s.names).padStart(5)}`,
  );
}
const totalByCat = { core: 0, extended: 0, extra: 0, names: 0 };
vocab.forEach((v) => totalByCat[v.kategori]++);
console.log(line);
console.log(`Total kata unik  : ${vocab.length}`);
console.log(
  `Per kategori     : core=${totalByCat.core}, extended=${totalByCat.extended}, extra=${totalByCat.extra}, names=${totalByCat.names}`,
);
console.log(`Duplikat digabung: ${duplicates}`);
dupLog.forEach((d) => console.log(`  - ${d}`));
console.log(`Petunjuk jenis kata (khusus pengecoh kuis): ${hintCount}`);
console.log(`Koreksi hanzi    : ${overrideLog.length}`);
overrideLog.forEach((d) => console.log(`  - ${d}`));
console.log(`Output           : ${OUT_FILE} (versi ${version})`);
console.log(line);
if (warnings.length) {
  console.log(`\nPERINGATAN (${warnings.length}):`);
  warnings.forEach((w) => console.log(`  ! ${w}`));
} else {
  console.log('\nTidak ada peringatan validasi.');
}
console.log('');
