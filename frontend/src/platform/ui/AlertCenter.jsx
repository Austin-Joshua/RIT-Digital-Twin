import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import { normalizeRole } from '../navCatalog';
import { useCampusStream } from '../useCampusStream';
import twinService from '../../services/twinService';
import { buildingFromProblemKey } from '../problemKey';
import StatusBadge from './StatusBadge';
import { ErrorState, LoadingState } from './AsyncState';
import './alert-center.css';

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'];

function formatConfidence(value) {
  if (value == null || value === '') return null;
  const number = Number(value);
  if (Number.isNaN(number)) return null;
  const percent = number <= 1 ? Math.round(number * 100) : Math.round(number);
  return `${percent}%`;
}

function buildingFromKey(key) {
  return buildingFromProblemKey(key);
}

function formatOccupancy(value) {
  if (value == null || value === '') return 'Not stored';
  return `${value}%`;
}

export default function AlertCenter({ mapBase = '/map', simulationBase = '/simulations', decisionBase = '/' }) {
  const { user } = useAuth();
  const canManage = ['ADMIN', 'HOD'].includes(normalizeRole(user?.role));
  const stream = useCampusStream(() => {});
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [severity, setSeverity] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [groupBy, setGroupBy] = useState('severity');
  const [includeResolved, setIncludeResolved] = useState(false);
  const [savingKey, setSavingKey] = useState('');

  const load = useCallback(() => {
    twinService.getAlertCenter()
      .then((response) => {
        setCenter(response.data || null);
        setError('');
      })
      .catch(() => setError('Alert records could not be read. No estimated alerts are substituted.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load, stream.revision]);

  const coverage = useMemo(() => center?.coverage || [], [center?.coverage]);
  const cards = center?.predictionCards || [];
  const categories = useMemo(() => coverage.map((item) => item.category), [coverage]);

  const visible = useMemo(() => (center?.alerts || []).filter((alert) => {
    if (!includeResolved && alert.status === 'RESOLVED') return false;
    if (severity !== 'ALL' && alert.severity !== severity) return false;
    if (category !== 'ALL' && alert.category !== category) return false;
    return true;
  }), [center?.alerts, includeResolved, severity, category]);

  const groups = useMemo(() => {
    const keys = groupBy === 'category'
      ? (category === 'ALL' ? categories : [category])
      : (severity === 'ALL' ? SEVERITIES : [severity]);
    return keys.map((key) => ({
      key,
      items: visible.filter((alert) => (groupBy === 'category' ? alert.category : alert.severity) === key),
    })).filter((group) => group.items.length > 0);
  }, [categories, category, groupBy, severity, visible]);

  const visibleCards = cards.filter((card) => category === 'ALL' || card.category === category);
  const selectedCoverage = coverage.find((item) => item.category === category);

  const changeStatus = (key, status) => {
    setSavingKey(key);
    twinService.updateAlertStatus(key, status)
      .then(() => load())
      .catch(() => setError('Status was not saved. The underlying record was not changed.'))
      .finally(() => setSavingKey(''));
  };

  if (loading && !center) return <LoadingState label="Reading stored alerts" />;
  if (error && !center) return <ErrorState message={error} onRetry={load} />;
  if (!center) return null;

  return (
    <section className="alert-center" aria-label="Alert center">
      <header className="alert-center-head">
        <h2>Alert center</h2>
        <p>{center.because}</p>
        {error ? <p>{error}</p> : null}
      </header>

      {center.restricted ? (
        <p className="alert-note">Campus alerts are not included for this role.</p>
      ) : (
        <>
          <div className="alert-filters" role="toolbar" aria-label="Alert filters">
            {['ALL', ...SEVERITIES].map((item) => (
              <button key={item} type="button" className={severity === item ? 'active' : ''} onClick={() => setSeverity(item)}>{item}</button>
            ))}
            {categories.map((item) => (
              <button key={item} type="button" className={category === item ? 'active' : ''} onClick={() => setCategory(category === item ? 'ALL' : item)}>{item}</button>
            ))}
            <button type="button" className={groupBy === 'category' ? 'active' : ''} onClick={() => setGroupBy(groupBy === 'severity' ? 'category' : 'severity')}>
              Group by {groupBy === 'severity' ? 'category' : 'severity'}
            </button>
            <button type="button" className={includeResolved ? 'active' : ''} onClick={() => setIncludeResolved((value) => !value)}>
              {includeResolved ? 'Hide resolved' : 'Include resolved'}
            </button>
          </div>

          <div className="alert-coverage">
            {coverage.map((item) => (
              <article key={item.category} className={item.available ? '' : 'unsupported'}>
                <header>
                  <strong>{item.category}</strong>
                  <span>{item.available ? 'Connected' : 'No model'}</span>
                </header>
                <p>{item.because}</p>
              </article>
            ))}
          </div>

          {visibleCards.length > 0 && (
            <div className="alert-cards">
              {visibleCards.map((card) => (
                <article key={`${card.category}-${card.title}`} className="predict-card">
                  <header>
                    <strong>{card.title}</strong>
                    <StatusBadge source={card.source} />
                  </header>
                  <p>Current occupancy: {formatOccupancy(card.current)}</p>
                  <p>Predicted: {card.predicted == null ? 'Not stored' : `${card.predicted}%`}</p>
                  <p>Peak: {card.peak || 'Not stored'}</p>
                  <p>Confidence: {formatConfidence(card.confidence) || 'Not scored'}</p>
                  <p>Reason: {card.reason}</p>
                  <p>{card.because}</p>
                </article>
              ))}
            </div>
          )}

          {selectedCoverage && !selectedCoverage.available ? (
            <p className="alert-note">{selectedCoverage.category} is reserved. No prediction is shown because no model is connected.</p>
          ) : null}

          {groups.length === 0 ? (
            <p className="alert-note">No stored condition crossed a threshold. Empty categories stay empty until a model exists.</p>
          ) : groups.map((group) => (
            <section key={group.key} className="alert-group">
              <h3>{group.key}</h3>
              {group.items.map((alert) => (
                <article key={alert.key} className={`alert-card alert-card-${String(alert.severity || '').toLowerCase()}`}>
                  <header>
                    <strong>{alert.severity} · {alert.category}</strong>
                    <StatusBadge source={alert.source} />
                  </header>
                  <dl>
                    <dt>What</dt>
                    <dd>{alert.what || alert.title}</dd>
                    <dt>Why</dt>
                    <dd>{alert.why}</dd>
                    <dt>When</dt>
                    <dd>{alert.when}</dd>
                    <dt>Impact</dt>
                    <dd>{alert.impact}</dd>
                    <dt>What can I do</dt>
                    <dd>{alert.action}</dd>
                    <dt>Affected</dt>
                    <dd>{alert.affectedEntity}</dd>
                    <dt>Current</dt>
                    <dd>{alert.currentState || 'Not stored'}</dd>
                    <dt>Predicted</dt>
                    <dd>{alert.predictedState || 'Not stored'}</dd>
                    <dt>Confidence</dt>
                    <dd>{formatConfidence(alert.confidence) || 'Not scored'}</dd>
                    <dt>Status</dt>
                    <dd>{alert.status}</dd>
                  </dl>
                  <p className="alert-actions">
                    {buildingFromKey(alert.key) ? <Link to={`${mapBase}?building=${buildingFromKey(alert.key)}`}>Open on map</Link> : null}
                    {simulationBase && buildingFromKey(alert.key) ? <Link to={`${simulationBase}?building=${buildingFromKey(alert.key)}`}>Open simulation</Link> : null}
                    {alert.key ? <Link to={`${decisionBase}?step=decisions&problem=${encodeURIComponent(alert.key)}`}>Open decision</Link> : null}
                  </p>
                  {canManage && (
                    <label className="alert-status">
                      Lifecycle
                      <select
                        value={alert.status}
                        disabled={savingKey === alert.key}
                        onChange={(event) => changeStatus(alert.key, event.target.value)}
                      >
                        {(center.lifecycle || []).map((status) => (
                          <option key={status} value={status}>{status.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </label>
                  )}
                </article>
              ))}
            </section>
          ))}
        </>
      )}
    </section>
  );
}
