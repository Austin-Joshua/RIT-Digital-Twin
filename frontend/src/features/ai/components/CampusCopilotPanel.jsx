import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/AuthContext';
import { normalizeRole } from '../../../platform/navCatalog';
import StatusBadge from '../../../platform/ui/StatusBadge';
import './copilot.css';

const PROMPTS = {
  ADMIN: ['Why is a stored building crowded?', 'Which classrooms are available tomorrow at 11?', 'Why did energy usage increase?', 'Which students are at academic risk?', 'Compare scenarios'],
  HOD: ['Which students are at academic risk?', 'Which classrooms are available tomorrow at 11?'],
  FACULTY: ['Which classrooms are available tomorrow at 11?', 'Explain stored campus alerts'],
  STUDENT: ['What academic risk is stored for me?', 'Which classrooms are available tomorrow at 11?'],
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
      .catch(() => { if (!cancelled) setBriefing({ answer: 'Campus records could not be read. No estimate is substituted.', actions: [] }); });
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
      .catch(() => setLog((rows) => [...rows, { role: 'copilot', answer: 'The copilot could not read campus records. Nothing was invented.', actions: [] }]))
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
      <StatusBadge source="ESTIMATED" />
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
            <strong>{item.role === 'you' ? 'You' : 'Copilot'}</strong>
            <p>{item.text || item.answer}</p>
            {item.because ? <p>{item.because}</p> : null}
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
