import PandaMascot from './PandaMascot.jsx';
import SettingsControls from './SettingsControls.jsx';
import { NAV_ITEMS } from './navItems.js';
import { APP_NAME } from '../lib/constants.js';

// Navigasi desktop (>= 1024px): sidebar kiri.
export default function Sidebar({ route, navigate }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col gap-5 overflow-y-auto border-r border-line bg-surface/90 p-4 backdrop-blur lg:flex">
      <a href="#/beranda" className="flex items-center gap-3 rounded-2xl p-1">
        <PandaMascot mood="happy" size={52} animate={false} title="" />
        <span className="text-lg font-black leading-tight text-primary-ink">{APP_NAME}</span>
      </a>

      <nav aria-label="Menu utama" className="flex flex-col gap-1.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = route === to;
          return (
            <a
              key={to}
              href={`#/${to}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(to);
              }}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-[48px] items-center gap-3 rounded-2xl px-4 font-bold transition active:scale-[.98] ${
                active ? 'bg-primary/15 text-primary-ink' : 'text-muted hover:bg-surface2 hover:text-ink'
              }`}
            >
              <Icon size={22} aria-hidden="true" />
              {label}
            </a>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl bg-surface2 p-3">
        <SettingsControls />
      </div>
    </aside>
  );
}
