import { useState } from 'react';
import { Menu, Settings } from 'lucide-react';
import PandaMascot from './PandaMascot.jsx';
import Sheet from './Sheet.jsx';
import SettingsControls from './SettingsControls.jsx';
import { APP_NAME } from '../lib/constants.js';

// Header mobile/tablet: tombol menu (membuka drawer sidebar), logo panda, dan tombol pengaturan.
export default function MobileHeader({ onMenu }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="pt-safe pl-safe pr-safe sticky top-0 z-20 border-b border-line bg-surface lg:hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            onClick={onMenu}
            aria-label="Buka menu"
            aria-controls="sidebar"
            title="Buka menu"
            className="btn-soft !min-w-[44px] !rounded-full !p-0"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <a href="#/beranda" className="flex min-h-[44px] min-w-0 items-center gap-2 pl-1">
            <PandaMascot mood="happy" size={32} animate={false} title="" />
            <span className="truncate text-base font-black text-primary-ink">{APP_NAME}</span>
          </a>
        </div>
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
