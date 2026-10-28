import { CircleCheck, CircleX, Volume2 } from 'lucide-react';
import { chapterStyle } from '../lib/chapterColors.js';
import { getMeanings, splitPos } from '../lib/vocab.js';
import { QUIZ_MODES } from '../lib/quiz.js';

const LETTERS = ['A', 'B', 'C', 'D'];

function Prompt({ item, mode, lang }) {
  if (mode === 'arti-hanzi') {
    const lines = getMeanings(item, lang);
    const pos = splitPos(item.posId);
    return (
      <div className="flex flex-col items-center gap-2">
        {lines.map((l) => (
          <p key={l.lang} className="text-2xl font-extrabold leading-snug text-ink">
            {lines.length > 1 && <span className="mr-2 rounded bg-ch-soft px-1.5 align-middle text-xs font-extrabold text-ch-ink">{l.lang}</span>}
            {l.text}
          </p>
        ))}
        {pos.length > 0 && <span className="rounded-pill bg-surface px-3 py-0.5 text-sm font-bold text-ch-ink">{pos.join(' / ')}</span>}
      </div>
    );
  }
  const n = [...item.hanzi].length;
  const size = n <= 2 ? 'clamp(3.5rem, 18vw, 6rem)' : n <= 4 ? 'clamp(2.75rem, 13vw, 4.5rem)' : 'clamp(1.5rem, 7vw, 2.5rem)';
  return (
    <p lang="zh-CN" className="break-words font-hanzi font-bold leading-tight text-ink" style={{ fontSize: size }}>
      {item.hanzi}
    </p>
  );
}

function OptionContent({ option, mode }) {
  if (mode === 'arti-hanzi') {
    return (
      <span lang="zh-CN" className="break-words font-hanzi text-2xl font-bold leading-tight">
        {option.lines[0]}
      </span>
    );
  }
  if (mode === 'hanzi-pinyin') return <span className="font-pinyin text-xl font-extrabold">{option.lines[0]}</span>;
  return (
    <span className="flex flex-col text-lg font-bold leading-snug">
      {option.lines.map((t) => (
        <span key={t}>{t}</span>
      ))}
    </span>
  );
}

// Satu soal. `selected` = indeks pilihan yang diketuk (null bila belum menjawab).
// Umpan balik berupa warna + ikon + teks.
export default function QuizQuestion({ question, selected, onSelect, lang, speech, nextRef, onNext, isLast }) {
  const { item, mode, options, correctIndex } = question;
  const answered = selected !== null;
  const isCorrect = selected === correctIndex;
  const modeInfo = QUIZ_MODES.find((m) => m.key === mode);
  const showSpeak = speech.available && (mode !== 'arti-hanzi' || answered);

  return (
    <div className="flex flex-col gap-4" style={chapterStyle(item.bab)}>
      <div className="relative flex min-h-[10rem] flex-col items-center justify-center gap-2 rounded-card border-2 border-ch bg-gradient-to-br from-ch-soft to-surface px-14 py-5 text-center shadow-soft">
        <p className="text-sm font-extrabold text-ch-ink">{modeInfo.prompt}</p>
        <Prompt item={item} mode={mode} lang={lang} />
        {showSpeak && (
          <button
            type="button"
            onClick={() => speech.speak(item.hanzi)}
            aria-label={`Dengarkan pelafalan ${item.hanzi}`}
            className="btn-soft absolute right-3 top-3 !min-h-[44px] !min-w-[44px] !rounded-full !p-0"
          >
            <Volume2 size={20} aria-hidden="true" />
          </button>
        )}
      </div>

      <div role="group" aria-label="Pilihan jawaban" className="grid gap-3 md:grid-cols-2">
        {options.map((o, i) => {
          const isRight = i === correctIndex;
          const isChosen = i === selected;
          let tone = 'border-line bg-surface hover:border-ch hover:bg-ch-soft';
          if (answered) {
            if (isRight) tone = 'border-ok-ink bg-ok-soft text-ok-ink';
            else if (isChosen) tone = 'border-bad-ink bg-bad-soft text-bad-ink';
            else tone = 'border-line bg-surface opacity-60';
          }
          return (
            <button
              key={o.id}
              type="button"
              disabled={answered}
              onClick={() => onSelect(i)}
              className={`flex min-h-[60px] items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left shadow-soft transition active:scale-[.98] disabled:cursor-default disabled:active:scale-100 ${tone}`}
            >
              <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface2 text-sm font-extrabold text-ink">
                {LETTERS[i]}
              </span>
              <span className="min-w-0 flex-1">
                <OptionContent option={o} mode={mode} />
              </span>
              {answered && isRight && (
                <span className="flex shrink-0 items-center gap-1 text-sm font-extrabold">
                  <CircleCheck size={22} aria-hidden="true" /> Benar
                </span>
              )}
              {answered && isChosen && !isRight && (
                <span className="flex shrink-0 items-center gap-1 text-sm font-extrabold">
                  <CircleX size={22} aria-hidden="true" /> Salah
                </span>
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          role="status"
          className={`flex flex-col gap-3 rounded-2xl border-2 p-4 ${isCorrect ? 'border-ok-ink bg-ok-soft text-ok-ink' : 'border-bad-ink bg-bad-soft text-bad-ink'}`}
        >
          <p className="flex items-center gap-2 text-lg font-extrabold">
            {isCorrect ? <CircleCheck size={24} aria-hidden="true" /> : <CircleX size={24} aria-hidden="true" />}
            {isCorrect ? 'Benar! Kata naik ke kotak berikutnya.' : 'Belum tepat. Kata kembali ke kotak 1.'}
          </p>
          <p className="text-ink">
            <span lang="zh-CN" className="font-hanzi text-xl font-bold">
              {item.hanzi}
            </span>{' '}
            <span className="font-pinyin font-bold">{item.pinyin}</span> · {getMeanings(item, lang).map((m) => m.text).join(' / ')}
          </p>
          <button ref={nextRef} type="button" onClick={onNext} className="btn-primary self-stretch sm:self-end">
            {isLast ? 'Lihat hasil' : 'Soal berikutnya'}
          </button>
        </div>
      )}
    </div>
  );
}
