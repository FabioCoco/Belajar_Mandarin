import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

// Dropdown pilihan tunggal. Tertutup secara default dan hanya menampilkan pilihan aktif sebagai label.
// Daftar dibuka di alur halaman (bukan melayang) agar tidak terpotong panel/sheet yang bisa di-scroll.
// Tertutup otomatis setelah memilih, klik di luar, atau Escape.
// `options`: [{ value, label }]
export default function Dropdown({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const buttonRef = useRef(null);
  const listId = useId();
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="flex flex-col gap-1">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${current.label}`}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border border-control bg-surface px-3 text-left text-sm font-bold text-ink transition hover:bg-surface2 md:min-h-[40px]"
      >
        <span className="truncate">{current.label}</span>
        <ChevronDown size={16} aria-hidden="true" className={`shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul id={listId} role="listbox" aria-label={label} className="overflow-hidden rounded-xl border border-line bg-surface">
          {options.map((o) => {
            const selected = o.value === current.value;
            return (
              <li key={String(o.value)} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    buttonRef.current?.focus();
                  }}
                  className={`flex min-h-[44px] w-full items-center justify-between gap-2 px-3 text-left text-sm transition md:min-h-[38px] ${
                    selected ? 'bg-primary/10 font-extrabold text-primary-ink' : 'font-semibold text-ink hover:bg-surface2'
                  }`}
                >
                  {o.label}
                  {selected && <Check size={16} aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
