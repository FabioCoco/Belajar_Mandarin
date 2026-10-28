import { useState } from 'react';
import { Settings } from 'lucide-react';
import PandaMascot from './PandaMascot.jsx';
import Sheet from './Sheet.jsx';
import SettingsControls from './SettingsControls.jsx';
import { APP_NAME } from '../lib/constants.js';

// Header mobile/tablet: logo panda + tombol pengaturan (bahasa, tema, reset).
export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="pt-safe pl-safe pr-safe sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-2">
        <a href="#/beranda" className="flex min-h-[44px] items-center gap-2">
          <PandaMascot mood="happy" size={40} animate={false} title="" />
          <span className="text-base font-black text-primary-ink">{APP_NAME}</span>
        </a>
        <button type="button" onClick={() => setOpen(true)} aria-label="Buka pengaturan" className="btn-soft !min-w-[44px] !rounded-full !p-0">
          <Settings size={20} aria-hidden="true" />
        </button>
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} title="Pengaturan">
        <SettingsControls />
      </Sheet>
    </header>
  );
}
