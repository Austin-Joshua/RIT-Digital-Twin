import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';

const CampusMap3D = lazy(() => import('../../components/CampusMap3D'));

const SCENARIOS = [
    { id: 'normal-day', label: 'Normal Operating Day' },
    { id: 'exam-day', label: 'Examination Day (Quiet Halls)' },
    { id: 'peak-demand', label: 'Peak-Hour Demand (Heat Index + Crowds)' },
    { id: 'building-closure', label: 'Building Closure (Mechanical Block Offline)' },
    { id: 'energy-saving', label: 'Energy-Saving Mode (HVAC Setback)' },
    { id: 'transport-electrification', label: 'Fleet Electrification (80% EV)' },
    { id: 'emergency-crowd', label: 'Emergency Crowd Management (Staggered)' }
];

const CLOCK_SLOTS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

const CampusMap = () => {
    const [scenarioId, setScenarioId] = React.useState('normal-day');
    const [simulatedClock, setSimulatedClock] = React.useState('10:00');

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                padding: '16px',
                height: 'calc(100vh - 100px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: '1.7rem', color: 'var(--theme-text)', fontWeight: '800', marginBottom: '4px' }}>
                        3D Smart Campus Twin & Scenario Explorer
                    </h1>
                    <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.95rem' }}>
                        Geographically accurate 3D RIT campus (13.0389° N, 80.0449° E) driven by real OpenStreetMap footprints & digital twin scenarios.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--theme-text-muted)', fontWeight: 600 }}>Active Scenario:</span>
                        <select
                            value={scenarioId}
                            onChange={(e) => setScenarioId(e.target.value)}
                            style={{
                                background: 'var(--card-bg, #0f172a)',
                                border: '1px solid var(--theme-border, #334155)',
                                color: 'var(--theme-text, #fff)',
                                padding: '6px 10px',
                                borderRadius: 6,
                                fontSize: 13,
                                cursor: 'pointer'
                            }}
                        >
                            {SCENARIOS.map((s) => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--theme-text-muted)', fontWeight: 600 }}>Clock:</span>
                        <select
                            value={simulatedClock}
                            onChange={(e) => setSimulatedClock(e.target.value)}
                            style={{
                                background: 'var(--card-bg, #0f172a)',
                                border: '1px solid var(--theme-border, #334155)',
                                color: 'var(--color-accent-gold, #d4af37)',
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                padding: '6px 10px',
                                borderRadius: 6,
                                fontSize: 13,
                                cursor: 'pointer'
                            }}
                        >
                            {CLOCK_SLOTS.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--theme-border)', boxShadow: 'var(--shadow-soft)' }}>
                <Suspense fallback={
                    <div style={{ height: '100%', minHeight: '600px', display: 'grid', placeItems: 'center', color: 'var(--theme-text-muted)' }}>
                        Loading 3D campus renderer...
                    </div>
                }>
                    <CampusMap3D scenarioId={scenarioId} simulatedClock={simulatedClock} />
                </Suspense>
            </div>
        </motion.div>
    );
};

export default CampusMap;
