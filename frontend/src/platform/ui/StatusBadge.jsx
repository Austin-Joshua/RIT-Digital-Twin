import './foundation.css';
import { sourceOf } from '../sourceClass';

const CLASS_BY_SOURCE = {
  LIVE: 'source-live',
  SIMULATED: 'source-simulated',
  HISTORICAL: 'source-historical',
  PREDICTED: 'source-predicted',
  ESTIMATED: 'source-estimated',
};

export default function StatusBadge({ source, record }) {
  const label = sourceOf(record || { source }, source || 'ESTIMATED');
  return (
    <span className={`campus-status ${CLASS_BY_SOURCE[label] || 'source-estimated'}`}>
      <span className="campus-status-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
