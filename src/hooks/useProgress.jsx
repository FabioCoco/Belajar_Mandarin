import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadJSON, saveJSON, removeKey } from '../lib/storage.js';
import { KEYS } from '../lib/constants.js';
import { nextBox } from '../lib/leitner.js';
import { version as DATASET_VERSION } from '../data/vocab-version.json';

// Bentuk data tersimpan:
// {
//   words:  { [id]: { memorized: bool, box: 1|2|3, correct, wrong } },   // box = kotak Leitner (Tahap 4)
//   daily:  { date: 'YYYY-MM-DD', ids: [id kata berbeda yang dipelajari hari ini] },
//   streak: { count, last: 'YYYY-MM-DD' }
// }
const ProgressContext = createContext(null);

// Penanda isi kosakata (dibuat oleh scripts/build-vocab.js). Progress yang tersimpan untuk versi lain dibuang.
const emptyState = () => ({ dataset: DATASET_VERSION, words: {}, daily: { date: null, ids: [] }, streak: { count: 0, last: null } });
const defaultWord = { memorized: false, box: 1, correct: 0, wrong: 0 };

const dateKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateKey(d);
};

let datasetWasReset = false;

function load() {
  const s = loadJSON(KEYS.progress, null);
  if (!s || typeof s !== 'object') return emptyState();
  if (s.dataset !== DATASET_VERSION) {
    // Isi kosakata berubah: id lama bisa menunjuk ke kata lain, jadi hafalan dan hitungan harian dibuang.
    // Streak dipertahankan karena tidak terikat pada kata tertentu.
    datasetWasReset = Object.keys(s.words || {}).length > 0;
    return { ...emptyState(), streak: s.streak || emptyState().streak };
  }
  const state = { ...emptyState(), ...s };
  // Migrasi data lama ({ date, count }) ke daftar id agar hitungan hari ini tidak hilang
  if (!Array.isArray(state.daily.ids)) {
    state.daily = { date: state.daily.date, ids: Array.from({ length: state.daily.count || 0 }, (_, i) => `lama-${i}`) };
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
  return { ...state, daily, streak };
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
      getWord,
      isMemorized,
      setMemorized,
      markReviewed,
      answerQuiz,
      resetAll,
      datasetReset,
      dismissDatasetReset,
    };
  }, [state, getWord, isMemorized, setMemorized, markReviewed, answerQuiz, resetAll, datasetReset, dismissDatasetReset]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress harus dipakai di dalam ProgressProvider');
  return ctx;
}
