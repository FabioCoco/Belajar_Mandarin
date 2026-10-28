import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

// Dialog modal. variant "bottom" = bottom sheet (mobile), "center" = dialog tengah.
// Dirender lewat portal agar tidak terpengaruh transform pada elemen induk.
export default function Sheet({ open, onClose, title, variant = 'bottom', children, footer }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const els = [...panelRef.current.querySelectorAll(FOCUSABLE)];
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  const isBottom = variant === 'bottom';

  return createPortal(
    <div className={`fixed inset-0 z-50 flex ${isBottom ? 'items-end sm:items-center' : 'items-center'} justify-center`}>
      <div className="absolute inset-0 animate-fade-in bg-ink/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative flex max-h-[88vh] w-full flex-col bg-surface text-ink shadow-lift outline-none ${
          isBottom
            ? 'animate-sheet-up rounded-t-3xl pb-safe sm:max-w-md sm:animate-pop-in sm:rounded-3xl'
            : 'mx-4 max-w-sm animate-pop-in rounded-3xl'
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-5">
          <h2 className="text-lg">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="btn-soft !min-h-[44px] !min-w-[44px] !rounded-full !p-0">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <div className="border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
