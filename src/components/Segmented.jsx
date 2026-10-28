// Kontrol pilihan tunggal berbentuk kapsul. Status terpilih ditandai warna DAN bentuk (tebal + latar).
export default function Segmented({ label, value, onChange, options, className = '' }) {
  return (
    <div role="group" aria-label={label} className={`flex gap-1 rounded-2xl bg-surface2 p-1 ${className}`}>
      {options.map(({ value: v, label: text, icon: Icon }) => {
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(v)}
            className={`flex min-h-[44px] min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-1.5 text-[13px] transition active:scale-95 md:min-h-[38px] ${
              active ? 'bg-surface font-extrabold text-primary-ink shadow-soft' : 'font-semibold text-muted hover:text-ink'
            }`}
          >
            {Icon && <Icon size={16} aria-hidden="true" />}
            {text}
          </button>
        );
      })}
    </div>
  );
}
