import { createContext, useContext, useEffect } from 'react';

// Perayaan target harian (konfeti + toast) ditahan saat halaman memintanya, mis. selama kuis berjalan,
// agar tidak menyela soal. Perayaan muncul begitu penahan dilepas (kuis selesai atau ditinggalkan).
export const CelebrationHoldContext = createContext(() => {});

export function useHoldCelebration(hold) {
  const setHeld = useContext(CelebrationHoldContext);
  useEffect(() => {
    setHeld(hold);
    return () => setHeld(false);
  }, [hold, setHeld]);
}
