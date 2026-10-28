import { EmptyState } from '../components/StateViews.jsx';

// Placeholder untuk halaman yang dikerjakan di tahap berikutnya.
export default function ComingSoon({ title, tahap }) {
  return (
    <EmptyState
      mood="sleeping"
      title={`${title} segera hadir`}
      message={`Fitur ini dikerjakan di Tahap ${tahap}. Panda sedang tidur siang dulu.`}
      size={160}
    />
  );
}
