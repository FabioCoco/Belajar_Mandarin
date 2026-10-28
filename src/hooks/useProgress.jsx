import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadJSON, saveJSON, removeKey } from '../lib/storage.js';
import { KEYS } from '../lib/constants.js';

// Bentuk data tersimpan:
// {
//   words:  { [id]: { memorized: bool, box: 1|2|3, correct, wrong } },   // box = kotak Leitner (Tahap 4)
//   daily:  { date: 'YYYY-MM-DD', count },
//   streak: { count, last: 'YYYY-MM-DD' }
// }
const ProgressContext = createContext(null);

const emptyState = () => ({ words: {}, daily: { date: null, count: 0 }, streak: { count: 0, last: null } });
const defaultWord = { memorized: false, box: 1, correct: 0, wrong: 0 };

const dateKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateKey(d);
};

function load() {
  const s = loadJSON(KEYS.progress, null);
  return s && typeof s === 'object' ? { ...emptyState(), ...s } : emptyState();
}

// Catat 1 aktivitas belajar: menambah hitungan harian dan memperbarui streak.
function withStudy(state, n = 1) {
  const today = dateKey();
  const daily = state.daily.date === today ? { date: today, count: state.daily.count + n } : { date: today, count: n };
  let streak = state.streak;
  if (streak.last !== today) {
    streak = { count: streak.last === yesterdayKey() ? streak.count + 1 : 1, last: today };
  }
  return { ...state, daily, streak };
}

export function ProgressProvider({ children }) {
  const [state, setState] = useState(load);

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
      return memorized ? withStudy(next) : next;
    });
  }, []);

  // Satu kartu ditinjau di flashcard: set status dan selalu dihitung sebagai aktivitas belajar
  const markReviewed = useCallback((id, memorized) => {
    setState((s) => {
      const prev = { ...defaultWord, ...s.words[id] };
      return withStudy({ ...s, words: { ...s.words, [id]: { ...prev, memorized } } });
    });
  }, []);

  const recordStudy = useCallback((n = 1) => setState((s) => withStudy(s, n)), []);

  const resetAll = useCallback(() => {
    removeKey(KEYS.progress);
    setState(emptyState());
  }, []);

  const value = useMemo(() => {
    const today = dateKey();
    const todayCount = state.daily.date === today ? state.daily.count : 0;
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
      recordStudy,
      resetAll,
    };
  }, [state, getWord, isMemorized, setMemorized, markReviewed, recordStudy, resetAll]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress harus dipakai di dalam ProgressProvider');
  return ctx;
}
