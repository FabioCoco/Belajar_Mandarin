import { useEffect } from 'react';
import PandaMascot from './PandaMascot.jsx';

// Notifikasi singkat bergambar panda. Hilang sendiri; berupa role="status" untuk pembaca layar.
export default function Toast({ open, onClose, title, message, duration = 5000, mood = 'cheer' }) {
  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, onClose, duration]);

  if (!open) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-6 lg:left-72">
      <div role="status" className="pointer-events-auto flex max-w-sm animate-pop-in items-center gap-3 rounded-card border border-line bg-surface p-3 pr-4 shadow-lift">
        <PandaMascot mood={mood} size={64} />
        <div>
          <p className="font-extrabold">{title}</p>
          <p className="text-sm text-muted">{message}</p>
        </div>
      </div>
    </div>
  );
}
