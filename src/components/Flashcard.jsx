import { useRef, useState } from 'react';
import { CircleCheck, CircleX, Volume2, RotateCw } from 'lucide-react';
import { chapterStyle } from '../lib/chapterColors.js';
import { getMeanings, splitPos } from '../lib/vocab.js';

const SWIPE_THRESHOLD = 90; // px

// Ukuran hanzi fluid (clamp) dan menyesuaikan panjang teks agar frasa panjang tetap muat.
function hanziSize(text, big) {
  const n = [...text].length;
  if (n <= 2) return big ? 'clamp(5rem, 26vw, 9rem)' : 'clamp(3rem, 14vw, 5rem)';
  if (n <= 4) return big ? 'clamp(3.5rem, 17vw, 6.5rem)' : 'clamp(2.5rem, 10vw, 4rem)';
  return big ? 'clamp(1.75rem, 8vw, 3rem)' : 'clamp(1.5rem, 6vw, 2.25rem)';
}

function Meanings({ item, lang, size = 'text-2xl' }) {
  const lines = getMeanings(item, lang);
  return (
    <div className="flex flex-col gap-1">
      {lines.map((l) => (
        <p key={l.lang} className={`${size} font-extrabold leading-snug text-ink`}>
          {lines.length > 1 && <span className="mr-2 rounded bg-ch-soft px-1.5 align-middle text-xs font-extrabold text-ch-ink">{l.lang}</span>}
          {l.text}
          {l.alt && <span className="block text-sm font-semibold text-muted">atau: {l.alt}</span>}
        </p>
      ))}
    </div>
  );
}

function PosAndNote({ item }) {
  const pos = splitPos(item.posId);
  return (
    <>
      {pos.length > 0 && <p className="rounded-pill bg-ch-soft px-3 py-0.5 text-sm font-bold text-ch-ink">{pos.join(' / ')}</p>}
      {item.note && <p className="max-w-[28ch] text-sm italic text-muted">{item.note}</p>}
    </>
  );
}

const Hanzi = ({ text, big }) => (
  <p lang="zh-CN" className="break-words font-hanzi font-bold leading-tight text-ink" style={{ fontSize: hanziSize(text, big) }}>
    {text}
  </p>
);

// Kartu 3D. `direction`: 'hanzi' (Hanzi -> Arti) atau 'arti' (Arti -> Hanzi).
// Swipe sentuh: kanan = hafal, kiri = belum hafal (tombol tetap ada sebagai cara utama).
export default function Flashcard({ item, flipped, onFlip, direction, lang, cardRef, onSwipe, memorized, speech }) {
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef(null);
  const moved = useRef(false);

  const onTouchStart = (e) => {
    start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, horizontal: null };
    moved.current = false;
  };
  const onTouchMove = (e) => {
    if (!start.current) return;
    const dx = e.touches[0].clientX - start.current.x;
    const dy = e.touches[0].clientY - start.current.y;
    // Kunci arah pada gerakan pertama agar scroll vertikal tidak ikut menggeser kartu
    if (start.current.horizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      start.current.horizontal = Math.abs(dx) > Math.abs(dy);
    }
    if (start.current.horizontal) {
      moved.current = true;
      setDragging(true);
      setDrag(dx);
    }
  };
  const onTouchEnd = () => {
    const dx = drag;
    start.current = null;
    setDragging(false);
    setDrag(0);
    if (Math.abs(dx) >= SWIPE_THRESHOLD) onSwipe(dx > 0 ? 'right' : 'left');
  };

  const handleClick = () => {
    if (moved.current) {
      moved.current = false; // ini akhir dari swipe, bukan ketukan
      return;
    }
    onFlip();
  };

  const showSpeak = speech.available && (direction === 'hanzi' || flipped);
  const hint = Math.min(1, Math.abs(drag) / SWIPE_THRESHOLD);

  const frontIsHanzi = direction === 'hanzi';
  const faceBase =
    'flip-face absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden rounded-card border border-line p-5 text-center';

  return (
    <div className="relative mx-auto w-full max-w-xl" style={chapterStyle(item.bab)}>
      <div
        className="relative select-none"
        style={{
          touchAction: 'pan-y',
          transform: `translateX(${drag}px) rotate(${drag / 25}deg)`,
          transition: dragging ? 'none' : 'transform .25s ease',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        <div className="flip-scene">
          <button
            ref={cardRef}
            type="button"
            onClick={handleClick}
            aria-label={flipped ? 'Kartu menampilkan jawaban. Balik kembali ke soal' : 'Balik kartu untuk melihat jawaban'}
            className={`flip-card relative block w-full rounded-card text-left ${flipped ? 'is-flipped' : ''}`}
            style={{ height: 'clamp(20rem, 50vw + 8rem, 28rem)' }}
          >
            {/* Depan */}
            <span aria-hidden={flipped} className={`${faceBase} bg-surface`}>
              {frontIsHanzi ? (
                <Hanzi text={item.hanzi} big />
              ) : (
                <>
                  <Meanings item={item} lang={lang} />
                  {splitPos(item.posId).length > 0 && <PosAndNote item={{ ...item, note: null }} />}
                </>
              )}
              <span className="absolute bottom-3 inline-flex items-center gap-1.5 text-xs font-bold text-muted">
                <RotateCw size={14} aria-hidden="true" />
                Ketuk untuk membalik
              </span>
            </span>

            {/* Belakang */}
            <span aria-hidden={!flipped} className={`${faceBase} flip-back bg-surface`}>
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-2 bg-ch" />
              {frontIsHanzi ? (
                <>
                  <p className="font-pinyin text-3xl font-black text-ch-ink sm:text-4xl">{item.pinyin}</p>
                  <Meanings item={item} lang={lang} />
                  <PosAndNote item={item} />
                </>
              ) : (
                <>
                  <Hanzi text={item.hanzi} />
                  <p className="font-pinyin text-2xl font-black text-ch-ink">{item.pinyin}</p>
                  {item.note && <p className="max-w-[28ch] text-sm italic text-muted">{item.note}</p>}
                </>
              )}
            </span>
          </button>
        </div>

        {/* Petunjuk swipe saat menggeser: ikon + teks, bukan warna saja */}
        {drag !== 0 && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute top-4 flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm font-extrabold ${
              drag > 0 ? 'left-4 bg-ok-soft text-ok-ink' : 'right-4 bg-todo-soft text-todo-ink'
            }`}
            style={{ opacity: hint }}
          >
            {drag > 0 ? <CircleCheck size={18} /> : <CircleX size={18} />}
            {drag > 0 ? 'Hafal' : 'Belum hafal'}
          </div>
        )}
      </div>

      {/* Di luar tombol kartu agar tidak ada tombol di dalam tombol */}
      {showSpeak && (
        <button
          type="button"
          onClick={() => speech.speak(item.hanzi)}
          aria-label={`Dengarkan pelafalan ${item.hanzi}`}
          className={`btn-soft absolute right-3 top-3 z-10 !min-h-[44px] !min-w-[44px] !rounded-full !p-0 ${speech.speaking ? 'ring-2 ring-primary-ink' : ''}`}
        >
          <Volume2 size={20} aria-hidden="true" />
        </button>
      )}
      {memorized && (
        <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-pill bg-ok-soft px-2.5 py-1 text-xs font-extrabold text-ok-ink">
          <CircleCheck size={14} aria-hidden="true" />
          Sudah hafal
        </span>
      )}

      {/* Pembaca layar: umumkan jawaban saat kartu dibalik */}
      <p className="sr-only" aria-live="polite">
        {flipped ? `${item.hanzi}, ${item.pinyin}, ${getMeanings(item, lang).map((m) => m.text).join('; ')}` : ''}
      </p>
    </div>
  );
}
