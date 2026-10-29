import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import Sheet from './Sheet.jsx';
import { useProgress } from '../hooks/useProgress.jsx';
import { MAX_BACKUP_BYTES, backupFileName, parseBackup } from '../lib/backup.js';

const formatDate = (iso) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : 'tidak diketahui';
};

// Ekspor progress ke file JSON dan impor kembali (untuk pindah perangkat atau cadangan).
// Impor selalu meminta konfirmasi karena menggantikan seluruh progress yang ada.
export default function BackupPanel() {
  const { exportBackup, importState } = useProgress();
  const fileRef = useRef(null);
  const [pending, setPending] = useState(null); // hasil parseBackup yang sukses, menunggu konfirmasi
  const [message, setMessage] = useState(null); // { type: 'ok' | 'error', text }

  const onExport = () => {
    const blob = new Blob([JSON.stringify(exportBackup(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupFileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMessage({ type: 'ok', text: `Cadangan disimpan sebagai ${a.download}.` });
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // izinkan memilih file yang sama lagi
    if (!file) return;
    if (file.size > MAX_BACKUP_BYTES) {
      setMessage({ type: 'error', text: 'File terlalu besar untuk berupa cadangan progress.' });
      return;
    }
    const result = parseBackup(await file.text());
    if (!result.ok) {
      setMessage({ type: 'error', text: result.error });
      return;
    }
    setMessage(null);
    setPending(result);
  };

  const onConfirm = () => {
    importState(pending.state);
    setPending(null);
    setMessage({ type: 'ok', text: 'Progress berhasil dipulihkan dari cadangan.' });
  };

  const s = pending?.summary;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        Progress hanya tersimpan di browser ini. Simpan cadangan untuk berpindah perangkat atau berjaga-jaga bila data browser terhapus.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" className="btn-soft" onClick={onExport}>
          <Download size={18} aria-hidden="true" />
          Ekspor progress
        </button>
        <button type="button" className="btn-soft" onClick={() => fileRef.current?.click()}>
          <Upload size={18} aria-hidden="true" />
          Impor progress
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} className="hidden" aria-label="Pilih file cadangan progress" />
      </div>
      <p role="status" className={`min-h-[1.25rem] text-sm font-bold ${message?.type === 'error' ? 'text-bad-ink' : 'text-ok-ink'}`}>
        {message?.text}
      </p>

      <Sheet
        open={!!pending}
        onClose={() => setPending(null)}
        title="Pulihkan progress dari cadangan?"
        variant="center"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-soft" onClick={() => setPending(null)}>
              Batal
            </button>
            <button type="button" className="btn-primary" onClick={onConfirm}>
              Ya, pulihkan
            </button>
          </div>
        }
      >
        {s && (
          <div className="flex flex-col gap-3">
            <p className="text-muted">Progress yang ada sekarang akan diganti dengan isi cadangan ini. Tindakan ini tidak bisa dibatalkan.</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-xl border border-line p-3 text-sm">
              <dt className="text-muted">Dibuat</dt>
              <dd className="font-bold">{formatDate(s.exportedAt)}</dd>
              <dt className="text-muted">Kata hafal</dt>
              <dd className="font-bold">{s.memorized}</dd>
              <dt className="text-muted">Kata pernah dipelajari</dt>
              <dd className="font-bold">{s.studied}</dd>
              <dt className="text-muted">Streak</dt>
              <dd className="font-bold">{s.streak} hari</dd>
              <dt className="text-muted">Hari tercatat di riwayat</dt>
              <dd className="font-bold">{s.days}</dd>
            </dl>
          </div>
        )}
      </Sheet>
    </div>
  );
}
