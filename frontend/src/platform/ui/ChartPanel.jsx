import './foundation.css';

/** Chart chrome only. Pass an existing chart as children so Recharts stays in the page chunk. */
export default function ChartPanel({ title, source, children }) {
  return (
    <section className="campus-chart" style={{ padding: 'var(--spacing-md)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 className="campus-chart-title" style={{ margin: 0 }}>{title}</h2>
        {source ? <span className="campus-metric-label">{source}</span> : null}
      </header>
      {children}
    </section>
  );
}
