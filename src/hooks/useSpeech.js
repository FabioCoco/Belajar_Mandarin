import { useCallback, useEffect, useRef, useState } from 'react';

const supportsSpeech = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

// Web Speech API (lang zh-CN). `available` hanya true bila browser mendukung DAN ada suara Mandarin.
// Bila tidak tersedia, UI menyembunyikan tombol dan menampilkan `message`.
export function useSpeech() {
  const supported = supportsSpeech();
  const [voice, setVoice] = useState(null);
  const [checked, setChecked] = useState(!supported);
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef(null);

  useEffect(() => {
    if (!supported) return undefined;
    const synth = window.speechSynthesis;

    const pick = () => {
      const voices = synth.getVoices();
      const v = voices.find((x) => /^zh[-_]cn/i.test(x.lang)) || voices.find((x) => /^zh/i.test(x.lang)) || null;
      voiceRef.current = v;
      setVoice(v);
      if (voices.length) setChecked(true);
    };
    pick();
    // Chrome memuat daftar suara secara asinkron
    synth.addEventListener?.('voiceschanged', pick);
    // Jika daftar suara tak kunjung muncul, anggap tidak tersedia
    const t = setTimeout(() => setChecked(true), 1500);
    return () => {
      synth.removeEventListener?.('voiceschanged', pick);
      clearTimeout(t);
      synth.cancel();
    };
  }, [supported]);

  const speak = useCallback(
    (text) => {
      if (!supported || !voiceRef.current || !text) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.voice = voiceRef.current;
      u.rate = 0.85; // sedikit pelan agar mudah diikuti
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      synth.speak(u);
    },
    [supported],
  );

  const available = supported && !!voice;
  let message = null;
  if (!supported) message = 'Browser ini tidak mendukung suara.';
  else if (checked && !voice) message = 'Suara Mandarin tidak tersedia di perangkat ini.';

  return { available, speaking, speak, message };
}
