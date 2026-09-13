import './foundation.css';
import StatusBadge from './StatusBadge';

export default function AlertCard({ priority = 'INFO', title, message, suggestion, source = 'ESTIMATED' }) {
  return (
    <article className="campus-alert" style={{ padding: 'var(--spacing-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <strong>{title || priority}</strong>
        <StatusBadge source={source} />
      </div>
      {message ? <p style={{ margin: '8px 0 0', fontSize: 'var(--font-size-small)' }}>{message}</p> : null}
      {suggestion ? <p style={{ margin: '6px 0 0', color: 'var(--theme-text-muted)', fontSize: 'var(--font-size-small)' }}>{suggestion}</p> : null}
    </article>
  );
}
