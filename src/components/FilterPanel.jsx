import { RotateCcw } from 'lucide-react';
import { CATEGORIES, allPos } from '../lib/vocab.js';
import ChapterFilter from './ChapterFilter.jsx';
import Chip from './Chip.jsx';
import Segmented from './Segmented.jsx';

const Section = ({ title, children }) => (
  <section className="flex flex-col gap-2">
    <h3 className="text-sm font-extrabold text-muted">{title}</h3>
    {children}
  </section>
);

// Isi filter. Dipakai sebagai panel samping (desktop lebar) dan di dalam bottom sheet (mobile).
export default function FilterPanel({ filters, toggle, set, reset, activeCount }) {
  return (
    <div className="flex flex-col gap-5">
      <Section title="Bab">
        <ChapterFilter selected={filters.babs} onToggle={toggle} />
      </Section>

      <Section title="Kategori">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Chip key={c.key} selected={filters.kategori.includes(c.key)} onClick={() => toggle('kategori', c.key)}>
              {c.label}
            </Chip>
          ))}
        </div>
      </Section>

      {allPos.length > 0 && (
        <Section title="Jenis kata">
          <div className="flex flex-wrap gap-2">
            {allPos.map((p) => (
              <Chip key={p} selected={filters.pos.includes(p)} onClick={() => toggle('pos', p)}>
                {p}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      <Section title="Status hafalan">
        <Segmented
          label="Status hafalan"
          value={filters.status}
          onChange={(v) => set('status', v)}
          options={[
            { value: 'all', label: 'Semua' },
            { value: 'unmemorized', label: 'Belum' },
            { value: 'memorized', label: 'Hafal' },
          ]}
        />
      </Section>

      <button type="button" onClick={reset} disabled={activeCount === 0} className="btn-soft disabled:opacity-50">
        <RotateCcw size={16} aria-hidden="true" />
        Hapus filter{activeCount > 0 ? ` (${activeCount})` : ''}
      </button>
    </div>
  );
}
