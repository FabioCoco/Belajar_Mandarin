import { useMemo } from 'react';
import { Search, X } from 'lucide-react';
import FilterLayout from '../components/FilterLayout.jsx';
import VocabList from '../components/VocabList.jsx';
import { EmptyState } from '../components/StateViews.jsx';
import { useProgress } from '../hooks/useProgress.jsx';
import { useSettings } from '../hooks/useSettings.jsx';
import { filterVocab, vocab } from '../lib/vocab.js';

export default function Vocab({ filterApi }) {
  const { filters, set, reset } = filterApi;
  const { lang } = useSettings();
  const { isMemorized, setMemorized, words } = useProgress();

  const items = useMemo(
    () => filterVocab(vocab, filters, isMemorized),
    // isMemorized berubah identitas setiap `words` berubah
    [filters, isMemorized],
  );

  if (vocab.length === 0) {
    return (
      <EmptyState mood="sleeping" title="Belum ada kosakata" message="Jalankan npm run build:data setelah menaruh file bab di data-mentah/." />
    );
  }

  const memorizedCount = Object.values(words).filter((w) => w.memorized).length;

  return (
    <FilterLayout filterApi={filterApi} count={items.length}>
      {({ filterButton }) => (
        <>
          <div>
            <h1 className="text-2xl">Daftar Kosakata</h1>
            <p className="text-muted">
              {items.length} dari {vocab.length} kata tampil · {memorizedCount} sudah hafal
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                type="search"
                value={filters.q}
                onChange={(e) => set('q', e.target.value)}
                placeholder="Cari hanzi, pinyin, atau arti"
                aria-label="Cari kosakata"
                className="min-h-[48px] w-full rounded-2xl border border-line bg-surface pl-11 pr-10 font-semibold text-ink placeholder:text-muted focus:border-primary-ink"
              />
              {filters.q && (
                <button
                  type="button"
                  onClick={() => set('q', '')}
                  aria-label="Hapus pencarian"
                  className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-ink"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              )}
            </div>
            {filterButton}
          </div>

          {items.length === 0 ? (
            <EmptyState
              mood="thinking"
              title="Kata tidak ditemukan"
              message="Coba ganti kata kunci atau longgarkan filter."
              action={
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    reset();
                  }}
                >
                  Hapus semua filter
                </button>
              }
            />
          ) : (
            <VocabList items={items} lang={lang} isMemorized={isMemorized} onToggle={setMemorized} />
          )}
        </>
      )}
    </FilterLayout>
  );
}
