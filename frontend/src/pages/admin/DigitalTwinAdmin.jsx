import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CommandCenter from './CommandCenter';
import ConnectionStatus from '../../platform/ui/ConnectionStatus';
import AlertCenter from '../../platform/ui/AlertCenter';
import DecisionCenter from '../../platform/ui/DecisionCenter';
import SourceLayer from '../../platform/ui/SourceLayer';
import InstitutionalAnalytics from '../../features/ai/components/InstitutionalAnalytics';
import DigitalTwinDemo from './DigitalTwinDemo';
import './digital-twin-admin.css';

const STEPS = [
    { id: 'campus', label: 'Campus' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'decisions', label: 'Decisions' },
    { id: 'sources', label: 'Sources' },
];

export default function DigitalTwinAdmin({
    snapshot,
    loading,
    error,
    onRefresh,
    linkStatus,
    pulse = false,
    title = 'Campus command',
    mapPath = '/map',
    simulationPath = '/simulations',
    decisionPath = '/',
    showDemo = true,
    showAdminTools = true,
}) {
    const [params, setParams] = useSearchParams();
    const requested = params.get('step');
    const step = STEPS.some((item) => item.id === requested) ? requested : 'campus';
    const setStep = (id) => {
        const next = new URLSearchParams(params);
        if (id === 'campus') next.delete('step');
        else next.set('step', id);
        if (id !== 'decisions') next.delete('problem');
        setParams(next, { replace: true });
    };
    const [demo, setDemo] = useState(() => sessionStorage.getItem('rit-demo') === '1');
    const [charts, setCharts] = useState(false);

    const toggleDemo = () => {
        const next = !demo;
        setDemo(next);
        sessionStorage.setItem('rit-demo', next ? '1' : '0');
    };

    return (
        <div className="campus-os">
            <header className="campus-os-head">
                <div>
                    <p className="campus-os-kicker">RIT Digital Twin</p>
                    <h1>{title}</h1>
                    <p>State, anomaly, prediction, explanation, simulation, recommendation, decision, outcome. One workflow. The copilot stays in the side panel.</p>
                </div>
                <div className="campus-os-tools">
                    <ConnectionStatus status={linkStatus} />
                    <button type="button" onClick={onRefresh}>Refresh</button>
                    {showDemo ? (
                        <button type="button" aria-pressed={demo} onClick={toggleDemo}>
                            {demo ? 'Close demo' : 'Digital twin demo'}
                        </button>
                    ) : null}
                </div>
            </header>

            {showDemo && demo ? <DigitalTwinDemo onOpen={setStep} /> : null}

            <nav className="campus-os-steps" aria-label="Command workflow">
                {STEPS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={step === item.id ? 'active' : ''}
                        aria-current={step === item.id ? 'page' : undefined}
                        onClick={() => setStep(item.id)}
                    >
                        {item.label}
                    </button>
                ))}
                {simulationPath ? <Link to={simulationPath}>Simulation</Link> : null}
                <Link to={mapPath}>Map</Link>
            </nav>

            {step === 'campus' ? (
                <CommandCenter
                    snapshot={snapshot}
                    loading={loading && !snapshot}
                    error={error}
                    onRetry={onRefresh}
                    pulse={pulse}
                    embedded
                    mapPath={mapPath}
                    simulationPath={simulationPath}
                    decisionPath={decisionPath}
                    adminLinks={showAdminTools}
                />
            ) : null}
            {step === 'alerts' ? (
                <AlertCenter mapBase={mapPath} simulationBase={simulationPath} decisionBase={decisionPath} />
            ) : null}
            {step === 'decisions' ? <DecisionCenter /> : null}
            {step === 'sources' ? <SourceLayer sources={snapshot?.simulatedSources} /> : null}

            {!simulationPath ? <p className="campus-os-note">Simulation runs are not authorized for this role.</p> : null}

            {showAdminTools ? <section className="campus-os-more">
                <button type="button" aria-expanded={charts} onClick={() => setCharts((open) => !open)}>
                    {charts ? 'Hide department charts' : 'Department charts'}
                </button>
                {charts ? <InstitutionalAnalytics /> : null}
            </section> : null}
        </div>
    );
}
