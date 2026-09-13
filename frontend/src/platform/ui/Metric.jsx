import './foundation.css';
import StatusBadge from './StatusBadge';

export default function Metric({ label, value, unit, source, record }) {
  return (
    <div className="campus-metric">
      <div className="campus-metric-value">
        {value ?? '—'}{unit ? <span style={{ fontSize: '0.75rem', fontWeight: 700 }}> {unit}</span> : null}
      </div>
      <div className="campus-metric-label">{label}</div>
      <StatusBadge source={source} record={record} />
    </div>
  );
}
