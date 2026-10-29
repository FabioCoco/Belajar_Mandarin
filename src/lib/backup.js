import { vocabById } from './vocab.js';
import { version as DATASET_VERSION } from '../data/vocab-version.json';

// Format file cadangan progress. `format` dinaikkan bila bentuk isinya berubah.
const APP_ID = 'panda-belajar-mandarin';
const FORMAT = 1;
export const MAX_BACKUP_BYTES = 2 * 1024 * 1024;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const int = (v, min, max, fallback) => (Number.isInteger(v) ? Math.min(max, Math.max(min, v)) : fallback);

export function buildBackup(state, now = new Date()) {
  return { app: APP_ID, format: FORMAT, exportedAt: now.toISOString(), progress: state };
}

export const backupFileName = (now = new Date()) =>
  `panda-mandarin-progress-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.json`;

// Membaca teks file cadangan dan membersihkannya menjadi state progress yang aman dipakai.
// Mengembalikan { ok: true, state, summary } atau { ok: false, error }. Isi yang tidak dikenal dibuang,
// bukan dipercaya begitu saja, karena file bisa berasal dari mana saja.
export function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'File bukan JSON yang valid.' };
  }
  if (!isObj(data) || data.app !== APP_ID || !isObj(data.progress)) {
    return { ok: false, error: 'Ini bukan file cadangan Panda Belajar Mandarin.' };
  }
  if (data.format !== FORMAT) {
    return { ok: false, error: 'Versi format cadangan tidak dikenal. Perbarui aplikasi lalu coba lagi.' };
  }
  const p = data.progress;
  if (p.dataset !== DATASET_VERSION) {
    return { ok: false, error: 'Cadangan dibuat untuk isi kosakata yang berbeda, jadi tidak bisa dipulihkan di sini.' };
  }

  const words = {};
  for (const [id, w] of Object.entries(isObj(p.words) ? p.words : {})) {
    if (!vocabById.has(id) || !isObj(w)) continue;
    words[id] = {
      memorized: w.memorized === true,
      box: int(w.box, 1, 3, 1),
      correct: int(w.correct, 0, 1e6, 0),
      wrong: int(w.wrong, 0, 1e6, 0),
    };
  }

  const dailyIds = isObj(p.daily) && Array.isArray(p.daily.ids) ? p.daily.ids.filter((x) => typeof x === 'string').slice(0, 2000) : [];
  const daily = { date: isObj(p.daily) && DATE_RE.test(p.daily.date) ? p.daily.date : null, ids: dailyIds };
  if (!daily.date) daily.ids = [];

  const streak = {
    count: isObj(p.streak) ? int(p.streak.count, 0, 100000, 0) : 0,
    last: isObj(p.streak) && DATE_RE.test(p.streak.last) ? p.streak.last : null,
  };
  if (!streak.last) streak.count = 0;

  const history = {};
  for (const [d, n] of Object.entries(isObj(p.history) ? p.history : {})) {
    if (DATE_RE.test(d) && Number.isInteger(n) && n > 0) history[d] = Math.min(n, 5000);
  }

  const state = { dataset: DATASET_VERSION, words, daily, streak, history };
  const summary = {
    exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : null,
    memorized: Object.values(words).filter((w) => w.memorized).length,
    studied: Object.keys(words).length,
    streak: streak.count,
    days: Object.keys(history).length,
  };
  return { ok: true, state, summary };
}
