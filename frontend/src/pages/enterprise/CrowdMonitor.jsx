import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const CrowdMonitor = () => {
    const [crowdData, setCrowdData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDay, setSelectedDay] = useState('MON');
    const [selectedSlot, setSelectedSlot] = useState('09:00');

    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const slots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

    useEffect(() => {
        const fetchCrowdData = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get(`/twin/crowd-density?day=${selectedDay}&slot=${selectedSlot}`);
                setCrowdData(Array.isArray(res.data) ? res.data : []);
            } catch (_err) {
                setError('Unable to load crowd density data. The Digital Twin service may be unavailable.');
                setCrowdData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCrowdData();
    }, [selectedDay, selectedSlot]);

    const getDensityColor = (value) => {
        if (value == null) return '#9e9e9e';
        if (value >= 80) return '#c62828';
        if (value >= 60) return '#ef6c00';
        if (value >= 40) return '#f9a825';
        if (value >= 20) return '#2e7d32';
        return '#1b5e20';
    };

    const getDensityLabel = (value) => {
        if (value == null) return 'No Data';
        if (value >= 80) return 'High Congestion';
        if (value >= 60) return 'Moderate-High';
        if (value >= 40) return 'Moderate';
        if (value >= 20) return 'Normal';
        return 'Low';
    };

    return (
        <div>
            <h2>Real-time Crowd Flow</h2>

            <div className="rit-card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <label style={{ fontWeight: 600 }}>Day:</label>
                    <select
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc', background: 'var(--theme-bg, #fff)' }}
                    >
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <label style={{ fontWeight: 600 }}>Slot:</label>
                    <select
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc', background: 'var(--theme-bg, #fff)' }}
                    >
                        {slots.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {loading && (
                <div className="rit-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#888' }}>Loading crowd density data...</p>
                </div>
            )}

            {error && (
                <div className="rit-card" style={{ padding: '16px', background: '#fff3e0', color: '#e65100', borderRadius: '8px' }}>
                    {error}
                </div>
            )}

            {!loading && !error && crowdData.length === 0 && (
                <div className="rit-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#888' }}>No crowd density records found for {selectedDay} {selectedSlot}.</p>
                </div>
            )}

            {!loading && !error && crowdData.length > 0 && (
                <div className="rit-card">
                    <h3>Campus Density — {selectedDay} {selectedSlot}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', marginTop: '12px' }}>
                        {crowdData.map((item, idx) => (
                            <div key={idx} style={{
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                padding: '14px',
                                borderLeft: `4px solid ${getDensityColor(item.value)}`,
                                background: 'var(--theme-bg, #fafafa)'
                            }}>
                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                    {item.locationCode || item.metricType || `Zone ${idx + 1}`}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{
                                        color: getDensityColor(item.value),
                                        fontWeight: 700,
                                        fontSize: '1.1em'
                                    }}>
                                        {item.value != null ? `${Math.round(item.value)}%` : '—'}
                                    </span>
                                    <span style={{
                                        fontSize: '0.8em',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        background: getDensityColor(item.value) + '20',
                                        color: getDensityColor(item.value)
                                    }}>
                                        {getDensityLabel(item.value)}
                                    </span>
                                </div>
                                {item.because && (
                                    <div style={{ fontSize: '0.75em', color: '#888', marginTop: '6px' }}>
                                        {item.because}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="rit-card" style={{ marginTop: '16px' }}>
                <h3>Density Legend</h3>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {[
                        { label: 'Low (0–19%)', color: '#1b5e20' },
                        { label: 'Normal (20–39%)', color: '#2e7d32' },
                        { label: 'Moderate (40–59%)', color: '#f9a825' },
                        { label: 'Moderate-High (60–79%)', color: '#ef6c00' },
                        { label: 'High Congestion (80%+)', color: '#c62828' },
                    ].map(({ label, color }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                            <span style={{ fontSize: '0.85em' }}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CrowdMonitor;
