import './foundation.css';

export function LoadingState({ label = 'Loading' }) {
  return (
    <div className="campus-state" role="status">
      <div className="app-soft-loader" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="campus-state campus-state-error" role="alert">
      <p>{message}</p>
      {onRetry ? <button type="button" onClick={onRetry}>Try again</button> : null}
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', detail }) {
  return (
    <div className="campus-state">
      <p style={{ fontWeight: 700, color: 'var(--theme-text)' }}>{title}</p>
      {detail ? <p>{detail}</p> : null}
    </div>
  );
}
