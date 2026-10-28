import { CircleCheck, Circle } from 'lucide-react';
import { chapterStyle } from '../lib/chapterColors.js';
import { categoryLabel, getMeanings, splitPos } from '../lib/vocab.js';

function Meaning({ item, lang }) {
  const lines = getMeanings(item, lang);
  return (
    <div className="flex flex-col gap-0.5">
      {lines.map((l) => (
        <p key={l.lang} className="leading-snug">
          {lines.length > 1 && <span className="mr-1.5 rounded bg-surface2 px-1 text-[10px] font-extrabold text-muted">{l.lang}</span>}
          {l.text}
          {l.alt && <span className="block text-xs text-muted">atau: {l.alt}</span>}
        </p>
      ))}
    </div>
  );
}

function BabBadge({ item }) {
  return (
    <span
      style={chapterStyle(item.bab)}
      title={item.babJudulId}
      className="inline-block whitespace-nowrap rounded-pill bg-ch-soft px-2.5 py-0.5 text-xs font-extrabold text-ch-ink"
    >
      Bab {item.bab}
    </span>
  );
}

// Tombol status: ikon + teks (tidak mengandalkan warna saja)
function StatusButton({ item, memorized, onToggle }) {
  const Icon = memorized ? CircleCheck : Circle;
  return (
    <button
      type="button"
      aria-pressed={memorized}
      onClick={() => onToggle(item.id, !memorized)}
      aria-label={`${item.hanzi}: ${memorized ? 'sudah hafal, klik untuk batalkan' : 'belum hafal, klik untuk tandai hafal'}`}
      className={`inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-pill px-2.5 text-[13px] font-bold transition active:scale-95 md:min-h-[36px] ${
        memorized ? 'bg-ok-soft text-ok-ink' : 'bg-todo-soft text-todo-ink'
      }`}
    >
      <Icon size={16} aria-hidden="true" />
      {memorized ? 'Hafal' : 'Belum hafal'}
    </button>
  );
}

const PosText = ({ item }) => {
  const pos = splitPos(item.posId);
  return pos.length ? <span className="text-xs text-muted">{pos.join(' / ')}</span> : null;
};

export default function VocabList({ items, lang, isMemorized, onToggle }) {
  return (
    <>
      {/* Mobile: daftar kartu */}
      <ul className="flex flex-col gap-3 md:hidden">
        {items.map((v) => (
          <li key={v.id} className="card flex flex-col gap-3 p-4">
            <div className="flex items-start gap-4">
              <span lang="zh-CN" className="min-w-[4.5rem] font-hanzi text-4xl font-bold leading-none text-ink">
                {v.hanzi}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-pinyin text-lg font-bold text-primary-ink">{v.pinyin}</p>
                <Meaning item={v} lang={lang} />
                <PosText item={v} />
                {v.note && <p className="mt-1 text-xs italic text-muted">{v.note}</p>}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <BabBadge item={v} />
                <span className="text-xs font-bold text-muted">{categoryLabel(v.kategori)}</span>
              </div>
              <StatusButton item={v} memorized={isMemorized(v.id)} onToggle={onToggle} />
            </div>
          </li>
        ))}
      </ul>

      {/* Tablet/desktop: tabel penuh */}
      <div className="card hidden overflow-hidden md:block">
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">Daftar kosakata</caption>
          <thead className="bg-surface2 text-sm text-muted">
            <tr>
              <th scope="col" className="w-[104px] px-4 py-3 font-extrabold">Hanzi</th>
              <th scope="col" className="w-[128px] px-3 py-3 font-extrabold">Pinyin</th>
              <th scope="col" className="px-3 py-3 font-extrabold">Arti</th>
              <th scope="col" className="w-[84px] px-3 py-3 font-extrabold">Bab</th>
              <th scope="col" className="w-[136px] px-3 py-3 font-extrabold">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((v) => (
              <tr key={v.id} className="border-t border-line/70 align-top hover:bg-surface2/60">
                <td className="px-4 py-3">
                  <span lang="zh-CN" className="font-hanzi text-2xl font-bold leading-tight break-words">
                    {v.hanzi}
                  </span>
                </td>
                <td className="px-3 py-3 font-pinyin text-base font-bold text-primary-ink">{v.pinyin}</td>
                <td className="px-3 py-3">
                  <Meaning item={v} lang={lang} />
                  <PosText item={v} />
                  {v.note && <p className="mt-0.5 text-xs italic text-muted">{v.note}</p>}
                  <p className="mt-0.5 text-[11px] font-bold text-muted">{categoryLabel(v.kategori)}</p>
                </td>
                <td className="px-3 py-3">
                  <BabBadge item={v} />
                </td>
                <td className="px-3 py-3">
                  <StatusButton item={v} memorized={isMemorized(v.id)} onToggle={onToggle} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
