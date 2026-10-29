import { useEffect, useRef } from 'react';
import { PanelLeftClose, PanelLeftOpen, Settings, X } from 'lucide-react';
import PandaMascot from './PandaMascot.jsx';
import SettingsControls from './SettingsControls.jsx';
import { NAV_ITEMS } from './navItems.js';
import { APP_NAME } from '../lib/constants.js';

// Navigasi samping. Desktop (>= 1024px): panel tetap yang bisa diciutkan jadi strip ikon.
// Mobile/tablet: drawer yang tertutup secara default (dibuka dari MobileHeader).
export default function Sidebar({ route, navigate, collapsed, onToggle, mobileOpen, onMobileClose }) {
  const closeRef = useRef(null);
  // Label teks disembunyikan hanya di desktop saat ciut; di drawer mobile selalu tampil penuh
  const hide = collapsed ? 'lg:hidden' : '';

  useEffect(() => {
    if (!mobileOpen) return undefined;
    // Tunggu sampai drawer benar-benar terlihat (visibility baru berubah setelah transisi dimulai)
    const t = setTimeout(() => closeRef.current?.focus(), 50);
    const onKey = (e) => e.key === 'Escape' && onMobileClose();
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onMobileClose}
        className={`fixed inset-0 z-40 bg-ink/40 transition-opacity duration-200 lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        id="sidebar"
        aria-label="Sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-4 overflow-y-auto overflow-x-hidden border-r border-line bg-surface p-3 transition-[transform,width,visibility] duration-200 ease-out lg:z-30 lg:visible lg:translate-x-0 ${
          collapsed ? 'lg:w-[4.5rem]' : 'lg:w-72'
        } ${mobileOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'}`}
      >
        <div className={`flex items-center gap-2 ${collapsed ? 'lg:flex-col' : 'justify-between'}`}>
          <a href="#/beranda" className="flex min-w-0 items-center gap-3 rounded-2xl p-1" aria-label={APP_NAME} title={APP_NAME}>
            <PandaMascot mood="happy" size={collapsed ? 36 : 44} animate={false} title="" />
            <span className={`text-base font-black leading-tight text-primary-ink ${hide}`}>{APP_NAME}</span>
          </a>
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Buka sidebar' : 'Ciutkan sidebar'}
            aria-expanded={!collapsed}
            aria-controls="sidebar"
            title={collapsed ? 'Buka sidebar' : 'Ciutkan sidebar'}
            className="btn-soft !hidden !min-w-[44px] !rounded-xl !p-0 lg:!inline-flex"
          >
            {collapsed ? <PanelLeftOpen size={20} aria-hidden="true" /> : <PanelLeftClose size={20} aria-hidden="true" />}
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onMobileClose}
            aria-label="Tutup menu"
            title="Tutup menu"
            className="btn-soft !min-w-[44px] !rounded-xl !p-0 lg:!hidden"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Menu utama" className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = route === to;
            return (
              <a
                key={to}
                href={`#/${to}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(to);
                  onMobileClose();
                }}
                aria-current={active ? 'page' : undefined}
                aria-label={label}
                title={collapsed ? label : undefined}
                className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 font-bold transition ${collapsed ? 'lg:justify-center lg:px-0' : ''} ${
                  active ? 'bg-primary/15 text-primary-ink' : 'text-muted hover:bg-surface2 hover:text-ink'
                }`}
              >
                <Icon size={22} aria-hidden="true" className="shrink-0" />
                <span className={hide}>{label}</span>
              </a>
            );
          })}
        </nav>

        <div className="mt-auto">
          {collapsed && (
            <button
              type="button"
              onClick={onToggle}
              aria-label="Buka pengaturan"
              title="Pengaturan"
              className="btn-soft !hidden !min-w-[44px] !rounded-xl !p-0 lg:!inline-flex lg:w-full"
            >
              <Settings size={20} aria-hidden="true" />
            </button>
          )}
          <div className={`rounded-2xl bg-surface2 p-3 ${hide}`}>
            <SettingsControls />
          </div>
        </div>
      </aside>
    </>
  );
}
