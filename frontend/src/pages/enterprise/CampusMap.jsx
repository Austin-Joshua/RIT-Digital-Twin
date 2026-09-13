import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StatusBadge } from '../../platform/ui';
import RIT_CAMPUS from '../../config/rit-campus.config';
import twinService from '../../services/twinService';
import { valueToColor } from '../../utils/campus-3d.utils';
import ConnectionStatus from '../../platform/ui/ConnectionStatus';
import { useCampusStream } from '../../platform/useCampusStream';
import './campus-map.css';

const CampusMap3D = lazy(() => import('../../components/CampusMap3D'));

const LAYER_LABELS = {
    crowd: 'Crowd',
    energy: 'Energy',
    utilization: 'Classroom utilization',
    attendance: 'Attendance risk',
    transport: 'Transport',
    safety: 'Safety',
    maintenance: 'Maintenance',
};

function normalize(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function linkRecords(records) {
    const meshes = new Map();
    RIT_CAMPUS.BUILDINGS.forEach((building) => {
        meshes.set(normalize(building.id), building.id);
        meshes.set(normalize(building.name), building.id);
    });
    return (records || []).map((record) => ({
        ...record,
        spatialId: meshes.get(normalize(record.code)) || meshes.get(normalize(record.name)) || null,
    }));
}

function overlayColor(record, layer) {
    if (!record?.spatialId || !layer) return null;
    if (layer === 'crowd' && record.crowd != null) return valueToColor(record.crowd / 100);
    if (layer === 'utilization' && record.utilization != null) return valueToColor(record.utilization / 100);
    if (layer === 'energy' && record.energyKw != null) return '#C4A35A';
    if (layer === 'attendance' && record.attendanceRiskCount > 0) return '#C45454';
    if (layer === 'maintenance' && record.maintenanceMatches > 0) return '#C4A35A';
    return null;
}

export default function CampusMap() {
    const [params] = useSearchParams();
    const requestedBuilding = params.get('building');
    const cache = useRef(new Map());
    const [horizon, setHorizon] = useState('NOW');
    const [index, setIndex] = useState(null);
    const [error, setError] = useState('');
    const [layer, setLayer] = useState('crowd');
    const [meshId, setMeshId] = useState(null);
    const [recordId, setRecordId] = useState(null);
    const [building, setBuilding] = useState(null);
    const [room, setRoom] = useState(null);
    const [detailError, setDetailError] = useState('');
    const [pulse, setPulse] = useState(false);

    const applyState = (envelope) => {
        if (horizon !== 'NOW' || !envelope?.command) return;
        const byId = new Map((envelope.command.buildings || []).map((item) => [item.id, item]));
        setIndex((current) => {
            if (!current?.operational) return current;
            return {
                ...current,
                buildings: (current.buildings || []).map((building) => {
                    const next = byId.get(building.id);
                    if (!next) return building;
                    return {
                        ...building,
                        crowd: next.peakDensity == null ? building.crowd : Math.round(next.peakDensity * 1000) / 10,
                        utilization: next.utilization,
                        energyKw: next.energyKw,
                        energySource: next.energySource,
                        energyBecause: next.energyBecause,
                        activeClasses: next.activeClasses,
                        availableRooms: next.availableRooms,
                        scheduledStudents: next.scheduledStudents,
                        alertCount: (envelope.command.alerts || []).filter((alert) => alert.buildingId === building.id).length,
                    };
                }),
            };
        });
        setBuilding((current) => {
            if (!current) return current;
            const next = byId.get(current.id);
            return next ? { ...current, ...{
                activeClasses: next.activeClasses,
                availableRooms: next.availableRooms,
                scheduledStudents: next.scheduledStudents,
                utilization: next.utilization,
                energyKw: next.energyKw,
                energyBecause: next.energyBecause,
                rooms: next.rooms || current.rooms,
                prediction: next.prediction || current.prediction,
            } } : current;
        });
        setPulse(true);
        window.setTimeout(() => setPulse(false), 700);
    };
    const stream = useCampusStream(applyState);

    const loadIndex = (nextHorizon, force = false) => {
        if (!force && cache.current.has(nextHorizon)) {
            setIndex(cache.current.get(nextHorizon));
            setError('');
            return;
        }
        setError('');
        twinService.getSpatialIndex(nextHorizon)
            .then((response) => {
                cache.current.set(nextHorizon, response.data);
                setIndex(response.data);
            })
            .catch(() => setError('Campus records could not be read. The model stays visual.'));
    };

    useEffect(() => {
        loadIndex(horizon);
    }, [horizon]);

    useEffect(() => {
        if (!requestedBuilding || !index?.operational) return;
        const match = linkRecords(index.buildings).find((item) => String(item.id) === String(requestedBuilding));
        if (!match) return;
        setRecordId(match.id);
        setMeshId(match.spatialId || null);
        setRoom(null);
        setDetailError('');
    }, [requestedBuilding, index]);

    useEffect(() => {
        if (!recordId || !index?.operational) {
            setBuilding(null);
            return undefined;
        }
        let cancelled = false;
        twinService.getSpatialBuilding(recordId, horizon)
            .then((response) => {
                if (!cancelled) setBuilding(response.data);
            })
            .catch(() => {
                if (!cancelled) setDetailError('This building record could not be opened.');
            });
        return () => {
            cancelled = true;
        };
    }, [recordId, horizon, index]);

    const records = useMemo(() => linkRecords(index?.buildings), [index]);
    const selectedMesh = RIT_CAMPUS.BUILDINGS.find((item) => item.id === meshId) || null;
    const selectedRecord = records.find((item) => item.id === recordId)
        || records.find((item) => item.spatialId && item.spatialId === meshId)
        || null;
    const overlays = useMemo(() => {
        const next = {};
        records.forEach((record) => {
            const color = overlayColor(record, layer);
            if (record.spatialId && color) next[record.spatialId] = { color };
        });
        return next;
    }, [records, layer]);

    const openRecord = (id) => {
        setRecordId(id);
        setRoom(null);
        setDetailError('');
        const match = records.find((item) => item.id === id);
        setMeshId(match?.spatialId || null);
    };

    const openRoom = (id) => {
        setDetailError('');
        setRoom({ id });
    };

    useEffect(() => {
        if (!room?.id || !index?.operational) return undefined;
        let cancelled = false;
        twinService.getSpatialRoom(room.id, horizon)
            .then((response) => {
                if (!cancelled) setRoom(response.data);
            })
            .catch(() => {
                if (!cancelled) setDetailError('This room could not be opened.');
            });
        return () => {
            cancelled = true;
        };
    }, [room?.id, horizon, index]);

    const onMeshSelect = (id) => {
        setMeshId(id);
        setRoom(null);
        setBuilding(null);
        const match = records.find((item) => item.spatialId === id);
        if (match) openRecord(match.id);
        else setRecordId(null);
    };

    const enabledLayers = (index?.layers || []).filter((item) => LAYER_LABELS[item.id]);

    return (
        <section className="spatial-map" aria-label="Campus spatial twin">
            <div>
                <p className="spatial-kicker">Campus · Building · Floor · Room · Asset</p>
                <h1>Spatial campus</h1>
                <p className="spatial-note">
                    {index?.because || 'The 3D model is the campus shell. A building is colored only when its name or code matches a stored record.'}
                </p>
            </div>

            <div className="spatial-controls" role="group" aria-label="Time">
                {(index?.horizons || [{ id: 'PAST' }, { id: 'NOW' }, { id: 'PREDICTED' }]).map((item) => (
                    <button key={item.id} type="button" className={horizon === item.id ? 'active' : ''} title={item.because} onClick={() => setHorizon(item.id)}>
                        {item.id === 'PAST' ? 'Past' : item.id === 'PREDICTED' ? 'Next slot' : 'Now'}
                    </button>
                ))}
            </div>

            <div className="spatial-layers" role="group" aria-label="Map layers">
                {enabledLayers.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={layer === item.id ? 'active' : ''}
                        disabled={!item.enabled}
                        title={item.because}
                        onClick={() => item.enabled && setLayer(item.id)}
                    >
                        {LAYER_LABELS[item.id]}
                    </button>
                ))}
            </div>
            <ConnectionStatus status={stream.status} />
            {error ? <p className="spatial-note">{error}</p> : null}

            <div className="spatial-stage">
                <Suspense fallback={<p className="spatial-note" style={{ padding: 16 }}>Opening the campus model…</p>}>
                    <CampusMap3D overlayById={overlays} selectedId={meshId} onSelect={onMeshSelect} />
                </Suspense>
                <aside className={`spatial-panel${pulse ? ' state-changed' : ''}`} aria-live="polite">
                    <div className="spatial-crumb">
                        <button type="button" onClick={() => { setMeshId(null); setRecordId(null); setBuilding(null); setRoom(null); }}>Campus</button>
                        {selectedRecord || selectedMesh ? <button type="button" onClick={() => setRoom(null)}>{selectedRecord?.name || selectedMesh?.name}</button> : null}
                        {room ? <button type="button">{room.name}</button> : null}
                    </div>

                    {!selectedMesh && !selectedRecord && (
                        <>
                            <h2>Campus</h2>
                            <p>{index?.floorBecause}</p>
                            <p>Unplaced in 3D model. Those records stay in this list and are not pinned onto a shape.</p>
                            <div className="spatial-list">
                                {records.map((item) => (
                                    <button key={item.id} type="button" onClick={() => openRecord(item.id)}>
                                        {item.name}{item.spatialId ? '' : ' · Unplaced in 3D model'}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {(selectedMesh || selectedRecord) && !room && (
                        <>
                            <h2>{selectedRecord?.name || selectedMesh?.name}</h2>
                            <StatusBadge source={building?.source || selectedRecord?.source || 'ESTIMATED'} />
                            {selectedMesh && !selectedRecord ? (
                                <p>Visual model only. {selectedMesh.floors} floors in the drawing. No campus record matches this shape, so occupancy is not shown.</p>
                            ) : null}
                            {selectedRecord && !index?.operational ? <p>Operational room records are not included for this role.</p> : null}
                            {detailError ? <p>{detailError}</p> : null}
                            {building && (
                                <>
                                    <p>{building.because}</p>
                                    <p><strong>Occupancy:</strong> {building.scheduledStudents ?? '—'}</p>
                                    <p><strong>Utilization:</strong> {building.utilization == null ? '—' : `${building.utilization}%`}</p>
                                    <p><strong>Energy:</strong> {building.energyKw == null ? 'Not metered' : `${building.energyKw} kW`}</p>
                                    <p>{building.energyBecause}</p>
                                    <p><strong>Active classes:</strong> {building.activeClasses}</p>
                                    <p><strong>Available rooms:</strong> {building.availableRooms}</p>
                                    <p><strong>Alerts:</strong> {building.alertCount || 'None from the timetable'}</p>
                                    <p><strong>Prediction:</strong> {building.prediction?.classes ?? 0} classes starting within 30 minutes. {building.prediction?.because}</p>
                                    <p><strong>Maintenance:</strong> {building.maintenanceBecause}</p>
                                    <p><strong>Floor:</strong> {building.floors?.because}</p>
                                    <h2>Rooms</h2>
                                    <div className="spatial-list">
                                        {(building.rooms || []).map((item) => (
                                            <button key={item.id} type="button" onClick={() => openRoom(item.id)}>
                                                {item.name}{item.currentClass ? ` · ${item.currentClass}` : ' · no current slot'}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {room && (
                        <>
                            <h2>{room.name}</h2>
                            <StatusBadge source={room.source} />
                            <p>{room.because}</p>
                            <p><strong>Capacity:</strong> {room.capacity ?? '—'}</p>
                            <p><strong>Occupancy:</strong> {room.occupancy ?? '—'}</p>
                            <p><strong>Current class:</strong> {room.currentClass || 'None in this window'}</p>
                            <p><strong>Next class:</strong> {room.nextClass ? `${room.nextClass} at ${room.nextStart || 'unknown time'}` : 'None later today'}</p>
                            <p><strong>Utilization:</strong> {room.utilization == null ? '—' : `${room.utilization}% of capacity`}</p>
                            <p><strong>Availability:</strong> {room.available == null ? 'Not recorded for this window' : room.available ? 'No slot in this window' : 'Scheduled'}</p>
                            <p><strong>Alerts:</strong> {room.alert ? 'Scheduled above 85% of capacity' : 'None from the timetable'}</p>
                            <h2>Assets</h2>
                            <p>{room.assetsBecause}</p>
                            <ul>
                                {(room.assets || []).map((asset) => (
                                    <li key={asset.id}>{asset.name} · {asset.status || 'no status'} · {asset.because}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </aside>
            </div>
        </section>
    );
}
