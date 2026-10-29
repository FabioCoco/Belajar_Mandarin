import { RotateCcw } from 'lucide-react';
import { CATEGORIES, allPos } from '../lib/vocab.js';
import ChapterFilter from './ChapterFilter.jsx';
import Dropdown from './Dropdown.jsx';
import Segmented from './Segmented.jsx';

const Section = ({ title, children }) => (
  <section className="flex flex-col gap-2">
    <h3 className="text-sm font-extrabold text-muted">{title}</h3>
    {children}
  </section>
);

// Isi filter. Dipakai sebagai panel samping (desktop lebar) dan di dalam bottom sheet (mobile).
const POS_OPTIONS = [{ value: 'all', label: 'Semua jenis kata' }, ...allPos.map((p) => ({ value: p, label: p }))];
const KATEGORI_OPTIONS = [{ value: 'all', label: 'Semua kategori' }, ...CATEGORIES.map((c) => ({ value: c.key, label: c.label }))];

export default function FilterPanel({ filters, set, reset, activeCount }) {
  return (
    <div className="flex flex-col gap-5">
      <Section title="Bab">
        <ChapterFilter selected={filters.babs} onChange={(v) => set('babs', v)} />
      </Section>

      <Section title="Kategori">
        <Dropdown
          label="Kategori"
          value={filters.kategori[0] ?? 'all'}
          onChange={(v) => set('kategori', v === 'all' ? [] : [v])}
          options={KATEGORI_OPTIONS}
        />
      </Section>

      {allPos.length > 0 && (
        <Section title="Jenis kata">
          <Dropdown
            label="Jenis kata"
            value={filters.pos[0] ?? 'all'}
            onChange={(v) => set('pos', v === 'all' ? [] : [v])}
            options={POS_OPTIONS}
          />
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
