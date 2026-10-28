import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import FilterPanel from './FilterPanel.jsx';
import Sheet from './Sheet.jsx';

// Pola filter yang dipakai Kosakata, Flashcard, dan Kuis:
// panel samping di layar lebar (xl), bottom sheet di layar lebih kecil.
// `children` adalah fungsi yang menerima { filterButton } agar tombolnya bisa ditaruh di header halaman.
export default function FilterLayout({ filterApi, count, countLabel = 'kata', children }) {
  const [open, setOpen] = useState(false);
  const { activeCount } = filterApi;

  const filterButton = (
    <button type="button" onClick={() => setOpen(true)} className="btn-soft relative xl:hidden" aria-label="Buka filter">
      <SlidersHorizontal size={18} aria-hidden="true" />
      <span className="hidden sm:inline">Filter</span>
      {activeCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-primary-ink px-1 text-xs font-extrabold text-surface">
          {activeCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="xl:grid xl:grid-cols-[18rem_minmax(0,1fr)] xl:items-start xl:gap-6">
      <aside className="card sticky top-6 hidden max-h-[calc(100vh-3rem)] overflow-y-auto p-4 xl:block" aria-label="Filter">
        <FilterPanel {...filterApi} />
      </aside>

      <div className="flex min-w-0 flex-col gap-4">{children({ filterButton })}</div>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Filter"
        footer={
          <button type="button" className="btn-primary w-full" onClick={() => setOpen(false)}>
            Tampilkan {count} {countLabel}
          </button>
        }
      >
        <FilterPanel {...filterApi} />
      </Sheet>
    </div>
  );
}
