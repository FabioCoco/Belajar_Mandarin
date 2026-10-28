import { NAV_ITEMS } from './navItems.js';

// Navigasi mobile/tablet (< 1024px): tab bar bawah, area sentuh >= 44px, aman untuk notch.
export default function BottomNav({ route, navigate }) {
  return (
    <nav
      aria-label="Menu utama"
      className="pb-safe pl-safe pr-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = route === to;
          return (
            <li key={to}>
              <a
                href={`#/${to}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(to);
                }}
                aria-current={active ? 'page' : undefined}
                className="flex min-h-[60px] flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-bold transition active:scale-95"
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-pill transition ${
                    active ? 'bg-primary/20 text-primary-ink' : 'text-muted'
                  }`}
                >
                  <Icon size={21} aria-hidden="true" />
                </span>
                <span className={active ? 'text-primary-ink' : 'text-muted'}>{label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
