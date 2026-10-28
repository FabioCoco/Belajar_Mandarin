import { CircleCheck, CircleX, RotateCcw, Settings2 } from 'lucide-react';
import PandaMascot from './PandaMascot.jsx';
import Confetti from './Confetti.jsx';
import { chapterStyle } from '../lib/chapterColors.js';
import { getMeanings } from '../lib/vocab.js';

// Skor tinggi -> panda bersorak; sedang -> senang; rendah -> berpikir (menyemangati, bukan menghukum).
function verdict(pct) {
  if (pct >= 80) return { mood: 'cheer', title: 'Luar biasa!', text: 'Panda bangga sekali padamu.' };
  if (pct >= 50) return { mood: 'happy', title: 'Bagus!', text: 'Sedikit lagi, ulangi kata yang masih salah.' };
  return { mood: 'thinking', title: 'Ayo coba lagi', text: 'Tidak apa-apa. Kata yang salah akan lebih sering muncul.' };
}

export default function QuizResult({ log, lang, onRetryWrong, onRestart, onSetup }) {
  const total = log.length;
  const correct = log.filter((l) => l.correct).length;
  const wrong = log.filter((l) => !l.correct);
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const v = verdict(pct);

  return (
    <div className="flex flex-col gap-5">
      <Confetti fire={pct >= 80 ? 1 : 0} />
      <section className="card flex flex-col items-center gap-3 px-4 py-8 text-center">
        <PandaMascot mood={v.mood} size={150} />
        <h2 className="text-2xl">{v.title}</h2>
        <p className="text-5xl font-black text-primary-ink">
          {correct}/{total}
        </p>
        <p className="font-bold text-muted">Skor {pct}%</p>
        <p className="max-w-sm text-muted">{v.text}</p>
        <div className="mt-2 flex w-full max-w-sm flex-col gap-2">
          {wrong.length > 0 && (
            <button type="button" className="btn-primary" onClick={() => onRetryWrong(wrong.map((l) => l.q.item))}>
              <RotateCcw size={18} aria-hidden="true" /> Ulangi {wrong.length} soal yang salah
            </button>
          )}
          <button type="button" className={wrong.length ? 'btn-soft' : 'btn-primary'} onClick={onRestart}>
            Kuis lagi dengan pengaturan sama
          </button>
          <button type="button" className="btn-soft" onClick={onSetup}>
            <Settings2 size={18} aria-hidden="true" /> Ubah pengaturan
          </button>
        </div>
      </section>

      <section aria-labelledby="judul-salah">
        <h2 id="judul-salah" className="mb-3 text-xl">
          Jawaban yang salah
        </h2>
        {wrong.length === 0 ? (
          <p className="card flex items-center gap-2 p-4 font-bold text-ok-ink">
            <CircleCheck size={20} aria-hidden="true" /> Semua jawaban benar. Tidak ada yang perlu ditinjau.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {wrong.map(({ q, chosen }) => (
              <li key={q.item.id} style={chapterStyle(q.item.bab)} className="card flex flex-col gap-2 border-l-8 !border-l-ch p-4">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span lang="zh-CN" className="font-hanzi text-3xl font-bold">
                    {q.item.hanzi}
                  </span>
                  <span className="font-pinyin text-lg font-bold text-ch-ink">{q.item.pinyin}</span>
                  <span className="rounded-pill bg-ch-soft px-2.5 py-0.5 text-xs font-extrabold text-ch-ink">Bab {q.item.bab}</span>
                </div>
                <p className="font-bold">{getMeanings(q.item, lang).map((m) => m.text).join(' / ')}</p>
                <p className="flex items-start gap-1.5 text-sm text-bad-ink">
                  <CircleX size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    Jawabanmu: <strong lang={q.mode === 'arti-hanzi' ? 'zh-CN' : undefined}>{q.options[chosen].lines.join(' / ')}</strong>
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
