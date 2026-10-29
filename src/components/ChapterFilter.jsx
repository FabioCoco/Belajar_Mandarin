import { chapters } from '../lib/vocab.js';
import Dropdown from './Dropdown.jsx';

const OPTIONS = [{ value: 'all', label: 'Semua bab' }, ...chapters.map((c) => ({ value: c.bab, label: `Bab ${c.bab}: ${c.judulId}` }))];

// Dropdown bab (pilih satu). Daftar bab dibaca otomatis dari data. `onChange` menerima array bab ([] = semua).
export default function ChapterFilter({ selected, onChange }) {
  return <Dropdown label="Bab" value={selected[0] ?? 'all'} onChange={(v) => onChange(v === 'all' ? [] : [v])} options={OPTIONS} />;
}
