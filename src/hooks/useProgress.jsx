import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadJSON, saveJSON, removeKey } from '../lib/storage.js';
import { KEYS } from '../lib/constants.js';
import { nextBox } from '../lib/leitner.js';
import { dateKey, daysAgo, yesterdayKey } from '../lib/dates.js';
import { buildBackup } from '../lib/backup.js';
import { version as DATASET_VERSION } from '../data/vocab-version.json';

// Bentuk data tersimpan:
// {
//   words:  { [id]: { memorized: bool, box: 1|2|3, correct, wrong } },   // box = kotak Leitner (Tahap 4)
//   daily:  { date: 'YYYY-MM-DD', ids: [id kata berbeda yang dipelajari hari ini] },
//   streak: { count, last: 'YYYY-MM-DD' },
//   history: { 'YYYY-MM-DD': jumlah kata berbeda yang dipelajari hari itu }   // untuk grafik riwayat
// }
const ProgressContext = createContext(null);

// Penanda isi kosakata (dibuat oleh scripts/build-vocab.js). Progress yang tersimpan untuk versi lain dibuang.
const emptyState = () => ({ dataset: DATASET_VERSION, words: {}, daily: { date: null, ids: [] }, streak: { count: 0, last: null }, history: {} });
const defaultWord = { memorized: false, box: 1, correct: 0, wrong: 0 };

// Riwayat hanya menyimpan hari-hari terakhir agar ukuran data tetap kecil (grafik terpanjang 30 hari)
const HISTORY_DAYS = 90;
const pruneHistory = (history) => {
  const oldest = dateKey(daysAgo(HISTORY_DAYS));
  return Object.fromEntries(Object.entries(history).filter(([k]) => k >= oldest));
};

let datasetWasReset = false;

function load() {
  const s = loadJSON(KEYS.progress, null);
  if (!s || typeof s !== 'object') return emptyState();
  if (s.dataset !== DATASET_VERSION) {
    // Isi kosakata berubah: id lama bisa menunjuk ke kata lain, jadi hafalan dan hitungan harian dibuang.
    // Streak dipertahankan karena tidak terikat pada kata tertentu.
    datasetWasReset = Object.keys(s.words || {}).length > 0;
    // Riwayat juga dipertahankan: hanya berisi jumlah per hari, tidak menunjuk ke kata tertentu.
    return { ...emptyState(), streak: s.streak || emptyState().streak, history: s.history || {} };
  }
  const state = { ...emptyState(), ...s };
  // Migrasi data lama ({ date, count }) ke daftar id agar hitungan hari ini tidak hilang
  if (!Array.isArray(state.daily.ids)) {
    state.daily = { date: state.daily.date, ids: Array.from({ length: state.daily.count || 0 }, (_, i) => `lama-${i}`) };
  }
  // Data lama belum punya riwayat: hitungan hari terakhir yang tercatat ikut dimasukkan
  if (!s.history || typeof s.history !== 'object') {
    state.history = state.daily.date && state.daily.ids.length ? { [state.daily.date]: state.daily.ids.length } : {};
  }
  return state;
}

// Catat aktivitas belajar atas satu kata. Target harian menghitung KATA BERBEDA (mengulang kata yang sama
// tidak menambah hitungan), sedangkan streak naik oleh aktivitas apa pun.
function withStudy(state, id) {
  const today = dateKey();
  const before = state.daily.date === today ? state.daily.ids : [];
  const daily = { date: today, ids: before.includes(id) ? before : [...before, id] };
  let streak = state.streak;
  if (streak.last !== today) {
    streak = { count: streak.last === yesterdayKey() ? streak.count + 1 : 1, last: today };
  }
  const history = pruneHistory({ ...state.history, [today]: daily.ids.length });
  return { ...state, daily, streak, history };
}

export function ProgressProvider({ children }) {
  const [state, setState] = useState(load);
  const [datasetReset, setDatasetReset] = useState(() => datasetWasReset);
  const dismissDatasetReset = useCallback(() => setDatasetReset(false), []);

  useEffect(() => {
    saveJSON(KEYS.progress, state);
  }, [state]);

  const getWord = useCallback((id) => ({ ...defaultWord, ...state.words[id] }), [state.words]);
  const isMemorized = useCallback((id) => state.words[id]?.memorized === true, [state.words]);

  const setMemorized = useCallback((id, memorized) => {
    setState((s) => {
      const prev = { ...defaultWord, ...s.words[id] };
      if (prev.memorized === memorized) return s;
      const next = { ...s, words: { ...s.words, [id]: { ...prev, memorized } } };
      return memorized ? withStudy(next, id) : next;
    });
  }, []);

  // Satu kartu ditinjau di flashcard: set status dan selalu dihitung sebagai aktivitas belajar
  const markReviewed = useCallback((id, memorized) => {
    setState((s) => {
      const prev = { ...defaultWord, ...s.words[id] };
      return withStudy({ ...s, words: { ...s.words, [id]: { ...prev, memorized } } }, id);
    });
  }, []);

  // Jawaban kuis + Leitner: benar naik kotak, salah kembali ke kotak 1 dan turun ke "belum hafal"
  const answerQuiz = useCallback((id, correct) => {
    setState((s) => {
      const prev = { ...defaultWord, ...s.words[id] };
      const word = {
        ...prev,
        box: nextBox(prev.box, correct),
        correct: prev.correct + (correct ? 1 : 0),
        wrong: prev.wrong + (correct ? 0 : 1),
        memorized: correct ? prev.memorized : false,
      };
      return withStudy({ ...s, words: { ...s.words, [id]: word } }, id);
    });
  }, []);

  // Cadangan: ekspor state saat ini, impor mengganti seluruh progress dengan state yang sudah divalidasi (lib/backup.js)
  const exportBackup = useCallback(() => buildBackup(state), [state]);
  const importState = useCallback((next) => setState(next), []);

  const resetAll = useCallback(() => {
    removeKey(KEYS.progress);
    setState(emptyState());
  }, []);

  const value = useMemo(() => {
    const today = dateKey();
    const todayCount = state.daily.date === today ? state.daily.ids.length : 0;
    // Streak masih hidup bila terakhir belajar hari ini atau kemarin
    const streak = state.streak.last === today || state.streak.last === yesterdayKey() ? state.streak.count : 0;
    return {
      words: state.words,
      todayCount,
      studiedToday: todayCount > 0,
      streak,
      history: state.history,
      getWord,
      isMemorized,
      setMemorized,
      markReviewed,
      answerQuiz,
      resetAll,
      exportBackup,
      importState,
      datasetReset,
      dismissDatasetReset,
    };
  }, [state, getWord, isMemorized, setMemorized, markReviewed, answerQuiz, resetAll, exportBackup, importState, datasetReset, dismissDatasetReset]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress harus dipakai di dalam ProgressProvider');
  return ctx;
}
