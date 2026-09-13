import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EntityDrawer, ErrorState, LoadingState, StatusBadge } from '../../platform/ui';
import './command-center.css';

const LAYERS = [
    { id: 'crowd', label: 'Crowd' },
    { id: 'utilization', label: 'Utilization' },
    { id: 'energy', label: 'Energy' },
    { id: 'alerts', label: 'Alerts' },
];

function layerValue(building, layer, alerts) {
    if (layer === 'crowd') return building.peakDensity == null ? '—' : `${Math.round(building.peakDensity * 100)}%`;
    if (layer === 'utilization') return building.utilization == null ? '—' : `${building.utilization}%`;
    if (layer === 'energy') return building.energyKw == null ? 'Not metered' : `${building.energyKw} kW`;
    return String(alerts.filter((alert) => alert.buildingId === building.id).length);
}

function SourceOrGap({ source, gap = 'Not metered' }) {
    if (!source) return <span className="command-gap">{gap}</span>;
    return <StatusBadge source={source} />;
}

function problemKey(alert) {
    if (!alert?.buildingId || !alert?.roomId) return '';
    const kind = Number(alert.densityPercent) > 100 ? 'infrastructure' : 'crowd';
    return `${kind}:${alert.buildingId}:${alert.roomId}`;
}

function mapHref(target, base = '/map') {
    return target?.buildingId || target?.id ? `${base}?building=${target.buildingId || target.id}` : base;
}

function simulationHref(target, base = '/simulations') {
    if (!base) return null;
    const id = target?.buildingId || target?.id;
    if (!id) return base;
    const name = target.building || target.name || '';
    return `${base}?building=${id}${name ? `&name=${encodeURIComponent(name)}` : ''}`;
}

export default function CommandCenter({
    snapshot,
    loading,
    error,
    onRetry,
    pulse = false,
    embedded = false,
    mapPath = '/map',
    simulationPath = '/simulations',
    decisionPath = '/',
    adminLinks = true,
}) {
    const navigate = useNavigate();
    const [layer, setLayer] = useState('crowd');
    const [buildingId, setBuildingId] = useState(null);
    const buildings = snapshot?.buildings || [];
    const alerts = snapshot?.alerts || [];
    const selected = buildings.find((building) => building.id === buildingId) || null;
    const indicators = useMemo(() => Object.values(snapshot?.indicators || {}), [snapshot]);
    const congestion = snapshot?.models?.congestion;
    const energyModel = snapshot?.models?.energy;

    if (loading) return <LoadingState label="Reading campus records" />;
    if (error) return <ErrorState message={error} onRetry={onRetry} />;
    if (!snapshot) return null;

    return (
        <section className={`command-center${pulse ? ' state-changed' : ''}`} aria-label="Campus command">
            <header className="command-head">
                <div>
                    <p className="command-kicker">Campus operating picture</p>
                    {embedded ? <h2>What needs attention</h2> : <h1>What needs attention</h1>}
                    <p>{snapshot.because}</p>
                    {snapshot.streamBecause ? <p>{snapshot.streamBecause}</p> : null}
                    {(snapshot.events || []).slice(0, 3).map((event) => (
                        <p key={`${event.at}-${event.kind}`}>{event.kind}: {event.because}</p>
                    ))}
                </div>
                <div className="command-score">
                    <strong>{snapshot.overall?.score ?? '—'}</strong>
                    <span>Campus score</span>
                    <StatusBadge source={snapshot.overall?.source} />
                    <small>{snapshot.overall?.trendBecause}</small>
                </div>
            </header>

            <div className="command-health">
                {(snapshot.health || []).map((item) => (
                    <article key={item.name}>
                        <header>
                            <span>{item.name}</span>
                            <StatusBadge source={item.source} />
                        </header>
                        <strong>{item.score ?? 'Not scored'}</strong>
                        <p>{item.because}</p>
                        {(item.contributors || []).map((line) => <p key={line}>{line}</p>)}
                        {(item.negatives || []).map((line) => <p key={line} className="command-negative">{line}</p>)}
                    </article>
                ))}
            </div>

            <div className="command-kpis">
                {indicators.map((item) => (
                    <article key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.value ?? '—'}{item.unit ? ` ${item.unit}` : ''}</strong>
                        <StatusBadge source={item.source} />
                        <p>{item.because}</p>
                    </article>
                ))}
            </div>

            <div className="command-main">
                <div className="command-board">
                    <div className="command-layers" role="tablist" aria-label="Campus layers">
                        {LAYERS.map((item) => (
                            <button key={item.id} type="button" role="tab" aria-selected={layer === item.id} className={layer === item.id ? 'active' : ''} onClick={() => setLayer(item.id)}>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    {buildings.length === 0 ? (
                        <p className="command-empty">No buildings are stored. The 3D map is a separate visual model and is not treated as live occupancy.</p>
                    ) : buildings.map((building) => (
                        <button key={building.id} type="button" className="command-building" onClick={() => setBuildingId(building.id)}>
                            <span>{building.name}</span>
                            <strong>{layerValue(building, layer, alerts)}</strong>
                            <SourceOrGap source={layer === 'energy' ? building.energySource : 'ESTIMATED'} />
                        </button>
                    ))}
                    <button type="button" className="command-map-link" onClick={() => navigate(mapPath)}>Open campus map</button>
                </div>

                <div>
                    <h2>From the timetable</h2>
                    <ol className="command-timeline">
                        {(snapshot.timeline || []).map((point) => (
                            <li key={point.label}>
                                <strong>{point.label}</strong>
                                <span>{point.classes} classes</span>
                                <span>{point.crowdPercent == null ? 'No density' : `${point.crowdPercent}% scheduled`}</span>
                                {point.tightRooms > 0 ? <em>{point.tightRooms} over capacity</em> : null}
                            </li>
                        ))}
                    </ol>
                    {(congestion || energyModel) && (
                        <section className="command-models">
                            <h2>Stored models</h2>
                            <p className="command-empty">Existing prediction services. Not the operating timeline, and not a meter.</p>
                            {congestion && (
                                <article>
                                    <header>
                                        <strong>Crowd model</strong>
                                        {congestion.available === false ? null : <StatusBadge source={congestion.source || 'PREDICTED'} />}
                                    </header>
                                    <p>{congestion.because}</p>
                                    <p>{congestion.suggestedAction}</p>
                                </article>
                            )}
                            {energyModel && (
                                <article>
                                    <header>
                                        <strong>Energy model</strong>
                                        {energyModel.available === false ? null : <StatusBadge source={energyModel.source} />}
                                    </header>
                                    <p>{energyModel.because}</p>
                                    <p>{energyModel.suggestedAction}</p>
                                </article>
                            )}
                        </section>
                    )}
                    <h2>Priority</h2>
                    <p className="command-empty">Open conditions are in Alerts. This list stays the timetable rooms used by the building board.</p>
                    {alerts.length === 0 ? <p className="command-empty">No room is scheduled above 85% of capacity in the next 30 minutes.</p> : alerts.map((alert) => (
                        <article key={`${alert.buildingId}-${alert.title}`} className="command-alert">
                            <header>
                                <strong>{alert.priority}</strong>
                                <StatusBadge source={alert.source} />
                            </header>
                            <p>{alert.title}</p>
                            <p>{alert.why}</p>
                            <p>{alert.impact}</p>
                            <p>{alert.action}</p>
                        </article>
                    ))}
                </div>
            </div>

            <div className="command-actions">
                <button type="button" onClick={() => navigate(mapHref(selected || alerts[0], mapPath))}>View campus</button>
                <button type="button" onClick={() => alerts[0]?.buildingId && setBuildingId(alerts[0].buildingId)} disabled={!alerts.length}>Investigate alert</button>
                {simulationPath ? <button type="button" onClick={() => navigate(simulationHref(selected || alerts[0], simulationPath))}>Run simulation</button> : null}
                {adminLinks ? <button type="button" onClick={() => navigate('/classrooms/allocation')}>View classrooms</button> : null}
                {adminLinks ? <button type="button" onClick={() => navigate('/simulations/energy')}>View energy</button> : null}
                {adminLinks ? <button type="button" onClick={() => navigate('/transport')}>View transport</button> : null}
                {adminLinks ? <button type="button" onClick={() => navigate('/management/audit')}>Open audit log</button> : null}
            </div>

            <EntityDrawer title={selected?.name || 'Building'} open={Boolean(selected)} onClose={() => setBuildingId(null)}>
                {selected && (
                    <div className="command-drawer">
                        <p>{selected.energyBecause || 'Scheduled state only.'}</p>
                        <p>Active classes: {selected.activeClasses}</p>
                        <p>Available rooms: {selected.availableRooms}</p>
                        <p>Scheduled students now: {selected.scheduledStudents}</p>
                        <p>Peak density: {selected.peakDensity == null ? '—' : `${Math.round(selected.peakDensity * 100)}%`}</p>
                        <p>Utilization: {selected.utilization == null ? '—' : `${selected.utilization}%`}</p>
                        <p>Energy formula: {selected.energyKw == null ? 'No base load stored' : `${selected.energyKw} kW`}</p>
                        <p>Alerts: {alerts.filter((alert) => alert.buildingId === selected.id).length || 'None from the timetable'}</p>
                        <p>Next window: {(snapshot.timeline || []).find((point) => point.label === '30 min')?.classes ?? 0} classes starting within 30 minutes across campus. This building is not modeled on its own.</p>
                        <p className="command-actions">
                            <button type="button" onClick={() => navigate(mapHref(selected, mapPath))}>Open on map</button>
                            {simulationPath ? <button type="button" onClick={() => navigate(simulationHref(selected, simulationPath))}>Simulate from here</button> : null}
                            {problemKey(alerts.find((alert) => alert.buildingId === selected.id)) ? (
                                <button type="button" onClick={() => navigate(`${decisionPath}?step=decisions&problem=${encodeURIComponent(problemKey(alerts.find((alert) => alert.buildingId === selected.id)))}`)}>Open decision</button>
                            ) : null}
                        </p>
                        <ul>
                            {(selected.rooms || []).map((room) => (
                                <li key={room.id}>{room.name} · {room.active ? room.subject || 'In session' : 'No current slot'}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </EntityDrawer>
        </section>
    );
}
