import { useState } from 'react';
import { Sun, Moon, Monitor, RotateCcw } from 'lucide-react';
import { useSettings } from '../hooks/useSettings.jsx';
import { useProgress } from '../hooks/useProgress.jsx';
import Segmented from './Segmented.jsx';
import Sheet from './Sheet.jsx';
import PandaMascot from './PandaMascot.jsx';

// Dipakai di sidebar (desktop) dan sheet pengaturan (mobile).
export default function SettingsControls() {
  const { lang, setLang, theme, setTheme } = useSettings();
  const { resetAll } = useProgress();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-1.5 text-sm font-bold text-muted">Bahasa terjemahan</p>
        <Segmented
          label="Bahasa terjemahan"
          value={lang}
          onChange={setLang}
          options={[
            { value: 'id', label: 'Indonesia' },
            { value: 'en', label: 'English' },
            { value: 'both', label: 'Keduanya' },
          ]}
        />
      </div>
      <div>
        <p className="mb-1.5 text-sm font-bold text-muted">Tema</p>
        <Segmented
          label="Tema tampilan"
          value={theme}
          onChange={setTheme}
          options={[
            { value: 'light', label: 'Terang', icon: Sun },
            { value: 'dark', label: 'Gelap', icon: Moon },
            { value: 'system', label: 'Sistem', icon: Monitor },
          ]}
        />
      </div>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="btn min-h-[44px] justify-start gap-2 !px-3 text-sm text-bad-ink hover:bg-bad-soft"
      >
        <RotateCcw size={16} aria-hidden="true" />
        Reset progress
      </button>

      <Sheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Reset semua progress?"
        variant="center"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-soft" onClick={() => setConfirmOpen(false)}>
              Batal
            </button>
            <button
              type="button"
              className="btn bg-bad-ink text-surface"
              onClick={() => {
                resetAll();
                setConfirmOpen(false);
              }}
            >
              Ya, reset
            </button>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <PandaMascot mood="sad" size={96} />
          <p className="text-muted">Semua kata yang sudah dihafal, kotak Leitner, dan streak akan dihapus. Tindakan ini tidak bisa dibatalkan.</p>
        </div>
      </Sheet>
    </div>
  );
}
