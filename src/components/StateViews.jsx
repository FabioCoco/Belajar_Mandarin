import { Component } from 'react';
import PandaMascot from './PandaMascot.jsx';

// Empty state, loading, dan error: semuanya diberi ilustrasi panda.
export function EmptyState({ mood = 'sleeping', title, message, action, size = 140 }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <PandaMascot mood={mood} size={size} />
      <h2 className="text-xl">{title}</h2>
      {message && <p className="max-w-sm text-muted">{message}</p>}
      {action}
    </div>
  );
}

export function LoadingState({ message = 'Panda sedang menyiapkan halaman...' }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <PandaMascot mood="thinking" size={120} />
      <p className="font-bold text-muted">{message}</p>
    </div>
  );
}

export function ErrorState({ message = 'Terjadi kesalahan tak terduga.', onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <PandaMascot mood="sad" size={140} />
      <h2 className="text-xl">Oh tidak, ada masalah</h2>
      <p className="max-w-sm text-muted">{message}</p>
      {onRetry && (
        <button type="button" className="btn-primary" onClick={onRetry}>
          Coba lagi
        </button>
      )}
    </div>
  );
}

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <ErrorState message={String(this.state.error.message || this.state.error)} onRetry={() => this.setState({ error: null })} />;
    }
    return this.props.children;
  }
}
