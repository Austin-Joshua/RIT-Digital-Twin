import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import { normalizeRole } from '../navCatalog';
import twinService from '../../services/twinService';
import StatusBadge from './StatusBadge';
import { ErrorState, LoadingState } from './AsyncState';
import './decision-center.css';

export default function DecisionCenter() {
  const { user } = useAuth();
  const canAuthorize = ['ADMIN', 'HOD'].includes(normalizeRole(user?.role));
  const [board, setBoard] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [params] = useSearchParams();
  const requested = params.get('problem');
  const opened = useRef('');

  const load = useCallback(() => {
    twinService.getDecisions()
      .then((response) => {
        setBoard(response.data);
        setError('');
      })
      .catch(() => setError('Decision records could not be read. No options were invented.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!requested || !board || opened.current === requested) return;
    if ((board.problems || []).some((problem) => problem.key === requested)) {
      opened.current = requested;
      openProblem(requested);
    }
  }, [requested, board]);

  const openProblem = (key) => {
    setPending(true);
    setError('');
    twinService.reviewDecision(key)
      .then((response) => setReview(response.data))
      .catch(() => setError('This problem could not be reviewed. No impact was substituted.'))
      .finally(() => setPending(false));
  };

  const authorize = (optionId) => {
    if (!review?.problem?.key) return;
    setPending(true);
    twinService.authorizeDecision(review.problem.key, optionId)
      .then(() => {
        setReview(null);
        load();
      })
      .catch(() => setError('Authorization was not stored. Campus systems were not changed.'))
      .finally(() => setPending(false));
  };

  const checkOutcome = (id) => {
    setPending(true);
    twinService.checkDecisionOutcome(id)
      .then(() => load())
      .catch(() => setError('The outcome could not be compared. No result was invented.'))
      .finally(() => setPending(false));
  };

  if (loading && !board) return <LoadingState label="Reading stored problems" />;
  if (error && !board) return <ErrorState message={error} onRetry={load} />;
  if (!board) return null;

  return (
    <section className="decision-center" aria-label="Decision intelligence">
      <header>
        <h2>Decision center</h2>
        <p className="decision-flow">{(board.flow || []).join(' → ')}</p>
        <p className="decision-note">{board.because}</p>
        {error ? <p className="decision-note">{error}</p> : null}
      </header>

      <div className="decision-list">
        {(board.problems || []).length === 0 ? (
          <p className="decision-note">No open stored problem. Options are not generated to fill this list.</p>
        ) : board.problems.map((problem) => (
          <button key={problem.key} type="button" onClick={() => openProblem(problem.key)}>
            <strong>{problem.severity} · {problem.title}</strong>
            <span> {problem.category}</span>
          </button>
        ))}
      </div>

      {pending && !review ? <LoadingState label="Comparing simulated options" /> : null}
      {review && (
        <article className="decision-card">
          <header>
            <strong>{review.problem?.title}</strong>
            <StatusBadge source={review.source} />
          </header>
          <p>{review.because}</p>
          <dl className="decision-evidence">
            {(review.evidence || []).map((item) => (
              <span key={item.label} style={{ display: 'contents' }}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </span>
            ))}
          </dl>
          <h3>Options</h3>
          <div className="decision-options">
            {(review.options || []).map((option) => (
              <article key={option.id} className={option.impactEstimated ? 'decision-option' : 'decision-option reserved'}>
                <header>
                  <strong>{option.label}</strong>
                  <span>{option.impactEstimated ? 'Simulated' : 'Not estimated'}</span>
                </header>
                <p>{option.because}</p>
                <p>{option.impact}</p>
                <p>Confidence: {option.confidence == null ? 'Not scored' : option.confidence}</p>
                {canAuthorize && option.impactEstimated && (
                  <div className="decision-actions">
                    <button type="button" className="primary" disabled={pending} onClick={() => authorize(option.id)}>Authorize planning choice</button>
                  </div>
                )}
              </article>
            ))}
          </div>
          <h3>Recommendation</h3>
          <p>{review.recommendation?.label || 'No option recommended'}</p>
          <p>{review.recommendation?.reason}</p>
          <p>Expected impact: {review.recommendation?.expectedImpact}</p>
          <p>Confidence: Not scored</p>
          <p>{review.authorization}</p>
        </article>
      )}

      <h3>Authorization and outcome</h3>
      {(board.decisions || []).length === 0 ? (
        <p className="decision-note">No planning choice has been authorized. Nothing has been applied to campus systems.</p>
      ) : board.decisions.map((decision) => (
        <article key={decision.id} className="decision-card">
          <header>
            <strong>{decision.optionLabel}</strong>
            <span>{decision.status}</span>
          </header>
          <p>{decision.problemTitle}</p>
          <p>{decision.expectedImpact}</p>
          <p>Planning decision recorded — campus configuration unchanged.</p>
          {decision.outcomeNote ? <p>{decision.outcomeNote}</p> : null}
          {canAuthorize && (
            <div className="decision-actions">
              <button type="button" disabled={pending} onClick={() => checkOutcome(decision.id)}>Check outcome</button>
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
