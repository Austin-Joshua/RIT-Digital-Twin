import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/AuthContext';
import { normalizeRole } from '../../../platform/navCatalog';
import StatusBadge from '../../../platform/ui/StatusBadge';
import './copilot.css';

const PROMPTS = {
  ADMIN: [
    'Show me the buildings with verified geometry.',
    'Which campus buildings still need geometry verification.',
    'Which classrooms have the lowest utilization today?',
    'Explain the campus energy consumption trend.',
    'Which buildings show unusual energy usage?',
    'What happens to crowd distribution if this entrance is closed?',
    'Explain the latest ESG score and metrics.',
    'Generate campus operational report',
    'Which students are at academic risk?'
  ],
  HOD: [
    'Show me the buildings with verified geometry.',
    'Which campus buildings still need geometry verification.',
    'Which classrooms have the lowest utilization today?',
    'Explain the campus energy consumption trend.',
    'Which students are at academic risk?',
    'Which classrooms are available tomorrow at 11?'
  ],
  FACULTY: [
    'Show me the buildings with verified geometry.',
    'Which classrooms are available tomorrow at 11?',
    'Which classrooms have the lowest utilization today?',
    'What is the energy usage in Computer Science building?',
    'What are the sustainability guidelines for RIT?'
  ],
  STUDENT: [
    'Show me the buildings with verified geometry.',
    'Which classrooms have the lowest utilization today?',
    'Show campus shuttle and transport metrics.',
    'What is our latest ESG sustainability score?'
  ],
  PARENT: ['What academic risk is stored for the linked student?'],
};

export default function CampusCopilotPanel() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const role = normalizeRole(user?.role);
  const [open, setOpen] = useState(false);
  const [briefing, setBriefing] = useState(null);
  const [log, setLog] = useState([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    api.get('/ai/copilot/briefing', { params: { page: location.pathname } })
      .then((response) => { if (!cancelled) setBriefing(response.data); })
      .catch(() => { if (!cancelled) setBriefing({ answer: 'Campus records could not be read. No estimate is substituted.', actions: [], provenance: 'UNKNOWN' }); });
    return () => { cancelled = true; };
  }, [open, location.pathname]);

  const ask = (query) => {
    const text = (query || input).trim();
    if (!text || pending) return;
    setInput('');
    setPending(true);
    setLog((rows) => [...rows, { role: 'you', text }]);
    api.post('/ai/copilot/ask', { query: text, page: location.pathname })
      .then((response) => setLog((rows) => [...rows, { role: 'copilot', ...response.data }]))
      .catch(() => setLog((rows) => [...rows, { role: 'copilot', answer: 'The copilot could not read campus records. Nothing was invented.', actions: [], provenance: 'UNKNOWN' }]))
      .finally(() => setPending(false));
  };

  const runAction = (action) => {
    if (!action?.path || action.executes) return;
    navigate(action.path);
  };

  if (!open) {
    return (
      <button type="button" className="copilot-rail" onClick={() => setOpen(true)}>
        RIT Digital Twin Copilot
      </button>
    );
  }

  return (
    <aside className="copilot-panel" aria-label="RIT Digital Twin Copilot">
      <header>
        <div>
          <p className="copilot-kicker">This page · {role || 'role unknown'}</p>
          <h2>RIT Digital Twin Copilot</h2>
        </div>
        <button type="button" onClick={() => setOpen(false)}>Close</button>
      </header>
      <StatusBadge source={briefing?.provenance || 'ESTIMATED'} />
      <p>{briefing?.answer || 'Reading records this role can see.'}</p>
      <div className="copilot-actions">
        <button type="button" onClick={() => ask('Why?')}>Why?</button>
        {(briefing?.actions || []).map((action) => (
          <button key={`${action.kind}-${action.path}`} type="button" onClick={() => runAction(action)}>{action.label}</button>
        ))}
      </div>
      <div className="copilot-log">
        {log.map((item, index) => (
          <article key={`${item.role}-${index}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <strong>{item.role === 'you' ? 'You' : 'Copilot'}</strong>
              {item.role === 'copilot' && item.provenance && (
                <StatusBadge source={item.provenance} />
              )}
            </div>
            <p>{item.text || item.answer}</p>

            {/* Stat Cards */}
            {item.cards && item.cards.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 6, margin: '8px 0' }}>
                {item.cards.map((c, cIdx) => (
                  <div key={cIdx} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--theme-border)', background: 'rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: 9, textTransform: 'uppercase', opacity: 0.7 }}>{c.title}</div>
                    <div style={{ fontWeight: 800, fontSize: 13 }}>{c.value} {c.unit || ''}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Table */}
            {item.table && item.table.headers && (
              <div style={{ overflowX: 'auto', margin: '6px 0', border: '1px solid var(--theme-border)', borderRadius: 6 }}>
                <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.05)' }}>
                      {item.table.headers.map((h, hIdx) => (
                        <th key={hIdx} style={{ padding: '4px 6px', textAlign: 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(item.table.rows || []).map((r, rIdx) => (
                      <tr key={rIdx} style={{ borderTop: '1px solid var(--theme-border)' }}>
                        {r.map((cell, cellIdx) => (
                          <td key={cellIdx} style={{ padding: '4px 6px' }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {item.because ? (
              <p style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--theme-text-muted)' }}>
                Provenance: {item.because}
              </p>
            ) : null}

            {/* Citations */}
            {item.citations && item.citations.length > 0 && (
              <div style={{ fontSize: 10, marginTop: 4, opacity: 0.8 }}>
                Refs: {item.citations.map(c => `${c.title} (${c.section || ''})`).join(', ')}
              </div>
            )}

            <div className="copilot-actions">
              {(item.actions || []).map((action) => (
                <button key={`${action.kind}-${action.label}`} type="button" onClick={() => runAction(action)}>{action.label}</button>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="copilot-prompts">
        {(PROMPTS[role] || []).map((prompt) => (
          <button key={prompt} type="button" onClick={() => ask(prompt)}>{prompt}</button>
        ))}
      </div>
      <form className="copilot-form" onSubmit={(event) => { event.preventDefault(); ask(); }}>
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about stored campus records" aria-label="Ask the campus copilot" />
        <button type="submit" disabled={pending}>{pending ? 'Reading' : 'Ask'}</button>
      </form>
    </aside>
  );
}
