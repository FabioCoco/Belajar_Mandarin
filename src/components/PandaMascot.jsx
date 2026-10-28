// Maskot panda buatan sendiri (SVG inline, flat, bulat). Tidak memakai gambar/karakter pihak lain.
// Prop mood: happy | sad | thinking | sleeping | eating | cheer
// Animasi ada di index.css (kelas .panda-*) dan otomatis mati saat prefers-reduced-motion.
const INK = '#26292B';
const LINE = 'rgba(38,41,43,0.25)';
const MOUTH = '#D94F70';

export const PANDA_MOODS = ['happy', 'sad', 'thinking', 'sleeping', 'eating', 'cheer'];

const LABELS = {
  happy: 'Panda tersenyum senang',
  sad: 'Panda sedih',
  thinking: 'Panda sedang berpikir',
  sleeping: 'Panda tidur',
  eating: 'Panda makan bambu',
  cheer: 'Panda bersorak gembira',
};

const sparkle = (x, y, s, fill) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0 -8 L2.5 -2.5 L8 0 L2.5 2.5 L0 8 L-2.5 2.5 L-8 0 L-2.5 -2.5Z"
    fill={fill}
  />
);

function Arms({ mood }) {
  if (mood === 'cheer') {
    return (
      <>
        <ellipse cx="30" cy="94" rx="12" ry="24" transform="rotate(-25 30 94)" fill={INK} />
        <ellipse cx="170" cy="94" rx="12" ry="24" transform="rotate(25 170 94)" fill={INK} />
      </>
    );
  }
  if (mood === 'eating') return null; // lengan digambar setelah bambu
  return (
    <>
      <ellipse cx="54" cy="144" rx="12" ry="22" transform="rotate(18 54 144)" fill={INK} />
      <ellipse cx="146" cy="144" rx="12" ry="22" transform="rotate(-18 146 144)" fill={INK} />
    </>
  );
}

function Eyes({ mood }) {
  // Mata putih di atas bercak hitam. happy/cheer = mata melengkung ^ ^, sleeping = melengkung tertutup
  if (mood === 'happy' || mood === 'cheer') {
    return (
      <g fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round">
        <path d="M65 91 Q72 81 79 91" />
        <path d="M121 91 Q128 81 135 91" />
      </g>
    );
  }
  if (mood === 'sleeping') {
    return (
      <g fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round">
        <path d="M65 87 Q72 94 79 87" />
        <path d="M121 87 Q128 94 135 87" />
      </g>
    );
  }
  // Mata bulat: thinking melirik ke atas-kanan, sad melirik ke bawah
  const dx = mood === 'thinking' ? 2.5 : 0;
  const dy = mood === 'thinking' ? -2.5 : mood === 'sad' ? 1.5 : 0;
  const eye = (cx) => (
    <g className="panda-eye">
      <circle cx={cx} cy="89" r="6.8" fill="#fff" />
      <circle cx={cx + 1 + dx} cy={90 + dy} r="3.8" fill={INK} />
      <circle cx={cx + 2.2 + dx} cy={88.3 + dy} r="1.4" fill="#fff" />
    </g>
  );
  return (
    <>
      {eye(72)}
      {eye(128)}
    </>
  );
}

function Mouth({ mood }) {
  const stroke = { fill: 'none', stroke: INK, strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (mood) {
    case 'sad':
      return <path d="M100 107 V112 M91 121 Q100 111 109 121" {...stroke} />;
    case 'thinking':
      return <path d="M100 107 V112 M92 117 Q96 113 100 117 T108 117" {...stroke} />;
    case 'sleeping':
      return <path d="M100 107 V111 M94 113 Q100 119 106 113" {...stroke} />;
    case 'eating':
      return (
        <>
          <path d="M100 107 V111" {...stroke} />
          <ellipse className="panda-chew" cx="100" cy="117" rx="6.5" ry="4.5" fill={MOUTH} stroke={INK} strokeWidth="2" />
        </>
      );
    case 'cheer':
      return (
        <>
          <path d="M100 107 V110" {...stroke} />
          <path d="M87 110 Q100 134 113 110 Z" fill={MOUTH} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
          <ellipse cx="100" cy="123" rx="6" ry="3.6" fill="#FF8FAB" />
        </>
      );
    default: // happy
      return <path d="M100 107 V111 M91 111 Q100 123 109 111" {...stroke} />;
  }
}

export default function PandaMascot({ mood = 'happy', size = 160, animate = true, className = '', title }) {
  const m = PANDA_MOODS.includes(mood) ? mood : 'happy';
  const blush = m === 'happy' || m === 'cheer' || m === 'eating' || m === 'sleeping';

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={title || LABELS[m]}
      className={`panda panda-${m} ${animate ? 'panda-anim' : ''} ${className}`}
      style={{ overflow: 'visible' }}
    >
      <g className="panda-all">
        {/* badan */}
        <ellipse cx="100" cy="148" rx="50" ry="42" fill="#fff" stroke={LINE} strokeWidth="2" />
        <ellipse cx="66" cy="184" rx="22" ry="13" fill={INK} />
        <ellipse cx="134" cy="184" rx="22" ry="13" fill={INK} />
        <Arms mood={m} />

        {/* kepala */}
        <g className="panda-head">
          <circle cx="54" cy="46" r="19" fill={INK} />
          <circle cx="146" cy="46" r="19" fill={INK} />
          <circle cx="54" cy="48" r="8" fill="#4A4F52" />
          <circle cx="146" cy="48" r="8" fill="#4A4F52" />
          <ellipse cx="100" cy="88" rx="60" ry="50" fill="#fff" stroke={LINE} strokeWidth="2" />
          {/* bercak mata miring ke bawah-luar */}
          <ellipse cx="72" cy="90" rx="14" ry="18" transform="rotate(25 72 90)" fill={INK} />
          <ellipse cx="128" cy="90" rx="14" ry="18" transform="rotate(-25 128 90)" fill={INK} />
          <Eyes mood={m} />
          {blush && (
            <>
              <ellipse cx="55" cy="113" rx="9" ry="6" fill="#FF8FAB" opacity="0.55" />
              <ellipse cx="145" cy="113" rx="9" ry="6" fill="#FF8FAB" opacity="0.55" />
            </>
          )}
          {m === 'sad' && <path d="M85 99 q-4.5 7 0 10 q4.5 -3 0 -10z" fill="#6EC1E4" />}
          <ellipse cx="100" cy="102" rx="8" ry="5.5" fill={INK} />
          <Mouth mood={m} />
        </g>

        {m === 'eating' && (
          <g>
            {/* bambu: garis tepi, isi, lalu ruas lewat garis putus-putus */}
            <line x1="112" y1="128" x2="146" y2="186" stroke="#2E7D5B" strokeWidth="17" strokeLinecap="round" />
            <line x1="112" y1="128" x2="146" y2="186" stroke="#4CAF7A" strokeWidth="12" strokeLinecap="round" />
            <line x1="112" y1="128" x2="146" y2="186" stroke="#2E7D5B" strokeWidth="13" strokeDasharray="3 20" />
            <path d="M110 128 q12 0 20 -12 q-16 -2 -20 12z" fill="#4CAF7A" stroke="#2E7D5B" strokeWidth="1.5" />
            <ellipse cx="127" cy="160" rx="11" ry="18" transform="rotate(28 127 160)" fill={INK} />
            <ellipse cx="96" cy="152" rx="10" ry="17" transform="rotate(-62 96 152)" fill={INK} />
          </g>
        )}

        {m === 'sleeping' && (
          <g fontFamily="Nunito, sans-serif" fontWeight="800" fill="#6EC1E4">
            <text className="panda-z" x="156" y="42" fontSize="24">z</text>
            <text className="panda-z panda-z2" x="172" y="24" fontSize="17">z</text>
          </g>
        )}

        {m === 'thinking' && (
          <g className="panda-bubble">
            <circle cx="180" cy="24" r="14" fill="#fff" stroke={LINE} strokeWidth="2" />
            <circle cx="171" cy="46" r="3" fill="#fff" stroke={LINE} strokeWidth="1.5" />
            <text x="180" y="30" textAnchor="middle" fontSize="18" fontWeight="800" fontFamily="Nunito, sans-serif" fill={INK}>
              ?
            </text>
          </g>
        )}

        {m === 'cheer' && (
          <g>
            <g className="panda-confetti">
              {sparkle(22, 36, 1.1, '#FFC857')}
              {sparkle(180, 40, 0.9, '#FF8FAB')}
              {sparkle(100, 8, 0.8, '#6EC1E4')}
              <rect x="150" y="10" width="7" height="7" rx="1.5" fill="#B79CED" transform="rotate(20 153 13)" />
              <rect x="44" y="12" width="7" height="7" rx="1.5" fill="#4CAF7A" transform="rotate(-25 47 15)" />
              <circle cx="188" cy="86" r="3.5" fill="#FF9F68" />
              <circle cx="12" cy="70" r="3.5" fill="#FF8FAB" />
            </g>
          </g>
        )}
      </g>
    </svg>
  );
}
