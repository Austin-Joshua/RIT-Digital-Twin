import './foundation.css';

export default function Panel({ title, children, action }) {
  return (
    <section className="campus-panel" style={{ padding: 'var(--spacing-md)' }}>
      {(title || action) && (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          {title ? <h2 className="campus-panel-title" style={{ margin: 0 }}>{title}</h2> : <span />}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
