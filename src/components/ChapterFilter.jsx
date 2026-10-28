import { chapters } from '../lib/vocab.js';
import { chapterStyle } from '../lib/chapterColors.js';
import Chip from './Chip.jsx';

// Chip bab berwarna (pilih satu atau beberapa). Daftar bab dibaca otomatis dari data.
export default function ChapterFilter({ selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter bab">
      {chapters.map((c) => (
        <Chip key={c.bab} colored style={chapterStyle(c.bab)} selected={selected.includes(c.bab)} onClick={() => onToggle('babs', c.bab)}>
          Bab {c.bab}
        </Chip>
      ))}
    </div>
  );
}
