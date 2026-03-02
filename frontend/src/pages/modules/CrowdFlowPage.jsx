import { useState } from 'react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import './CrowdFlow.css';

const SCENARIOS = ['NORMAL', 'PEAK_HOUR', 'EMERGENCY_EVACUATION', 'EVENT'];
const EMERGENCIES = ['FIRE', 'EARTHQUAKE', 'FLOOD', 'BOMB_THREAT'];

const heatColor = (intensity) => {
    if (intensity >= 0.9) return '#dc2626';
    if (intensity >= 0.7) return '#ea580c';
    if (intensity >= 0.5) return '#f59e0b';
    if (intensity >= 0.3) return '#84cc16';
    return '#22c55e';
};

const congestionBadge = (level) => {
    const map = { CRITICAL: '#dc2626', HIGH: '#ea580c', MODERATE: '#f59e0b', NORMAL: '#22c55e', LOW: '#16a34a' };
    return map[level] || '#64748b';
};

function CrowdFlowPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);
    const [activeView, setActiveView] = useState('heatmap');
    const [params, setParams] = useState({
        totalOccupancy: 5000,
        scenario: 'NORMAL',
        exitGates: 4,
        emergencyType: 'FIRE',
        includeEvacuation: true,
        timeOfDay: '10:00'
    });

    const run = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/api/simulate/crowdflow', params);
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'The simulation could not be completed. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="crowd-page">
            {/* Header */}
            <div className="module-header crowd-header">
                <div className="module-header-content">
                    <div className="module-icon crowd-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div>
                        <h1>Crowd Flow & Emergency Simulation</h1>
                        <p>Analyze crowd density, congestion zones, and evacuation readiness</p>
                    </div>
                </div>
                <div className="module-stats">
                    <div className="stat-chip"><span className="stat-icon">👥</span><span>15 Zones</span></div>
                    <div className="stat-chip"><span className="stat-icon">🚪</span><span>4 Exits</span></div>
                    <div className="stat-chip"><span className="stat-icon">🔥</span><span>Evacuation</span></div>
                </div>
            </div>

            {/* Controls */}
            <div className="energy-controls">
                <div className="control-panel">
                    <h3>Simulation Parameters</h3>
                    <div className="param-grid">
                        <div className="param-group">
                            <label>Total Occupancy</label>
                            <input type="number" value={params.totalOccupancy} min={100} max={10000}
                                onChange={e => setParams(p => ({ ...p, totalOccupancy: +e.target.value }))} />
                        </div>
                        <div className="param-group">
                            <label>Scenario</label>
                            <select value={params.scenario} onChange={e => setParams(p => ({ ...p, scenario: e.target.value }))}>
                                {SCENARIOS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                        <div className="param-group">
                            <label>Exit Gates</label>
                            <input type="number" value={params.exitGates} min={1} max={8}
                                onChange={e => setParams(p => ({ ...p, exitGates: +e.target.value }))} />
                        </div>
                        <div className="param-group">
                            <label>Emergency Type</label>
                            <select value={params.emergencyType} onChange={e => setParams(p => ({ ...p, emergencyType: e.target.value }))}>
                                {EMERGENCIES.map(e => <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                        <div className="param-toggle">
                            <label>
                                <input type="checkbox" checked={params.includeEvacuation}
                                    onChange={e => setParams(p => ({ ...p, includeEvacuation: e.target.checked }))} />
                                <span>Include Evacuation</span>
                            </label>
                        </div>
                    </div>
                    <div className="control-actions">
                        <button className="btn-primary" onClick={run} disabled={loading}>
                            {loading ? <><span className="spinner"></span>Simulating...</> : <>🏃 Run Simulation</>}
                        </button>
                    </div>
                </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            {data && (
                <>
                    <div className="tab-nav">
                        {['heatmap', 'evacuation', 'congestion', 'flow', 'readiness'].map(v => (
                            <button key={v} className={`tab-btn ${activeView === v ? 'active' : ''}`}
                                onClick={() => setActiveView(v)}>
                                {v.charAt(0).toUpperCase() + v.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* === HEATMAP TAB === */}
                    {activeView === 'heatmap' && (
                        <div className="heatmap-section">
                            {/* Overview cards */}
                            <div className="overview-cards">
                                <div className="e-card"><div className="e-card-icon">👥</div><div className="e-card-value">{data.campusOverview?.totalOccupancy}</div><div className="e-card-label">Total Occupancy</div></div>
                                <div className="e-card"><div className="e-card-icon">🏢</div><div className="e-card-value">{data.campusOverview?.totalZones}</div><div className="e-card-label">Campus Zones</div></div>
                                <div className="e-card highlight-gold"><div className="e-card-icon">⚠️</div><div className="e-card-value">{data.campusOverview?.congestionZones}</div><div className="e-card-label">Congestion Zones</div></div>
                                <div className="e-card highlight-green"><div className="e-card-icon">✅</div><div className="e-card-value">{data.campusOverview?.safeZones}</div><div className="e-card-label">Safe Zones</div></div>
                            </div>

                            {/* Heatmap Grid */}
                            <div className="chart-card">
                                <h3>Campus Zone Heatmap</h3>
                                <div className="heat-legend">
                                    <span className="heat-legend-item"><span className="heat-dot" style={{ background: '#22c55e' }}></span>Low</span>
                                    <span className="heat-legend-item"><span className="heat-dot" style={{ background: '#84cc16' }}></span>Normal</span>
                                    <span className="heat-legend-item"><span className="heat-dot" style={{ background: '#f59e0b' }}></span>Moderate</span>
                                    <span className="heat-legend-item"><span className="heat-dot" style={{ background: '#ea580c' }}></span>High</span>
                                    <span className="heat-legend-item"><span className="heat-dot" style={{ background: '#dc2626' }}></span>Critical</span>
                                </div>
                                <div className="heatmap-grid">
                                    {data.zones?.map(z => (
                                        <div key={z.zoneId} className="heat-block"
                                            style={{ '--heat-color': heatColor(z.heatmapIntensity), '--heat-intensity': z.heatmapIntensity }}>
                                            <div className="heat-bar" style={{ background: heatColor(z.heatmapIntensity), height: `${z.occupancyPercent}%` }}></div>
                                            <div className="heat-content">
                                                <span className="heat-zone-id">{z.zoneId}</span>
                                                <span className="heat-zone-name">{z.zoneName}</span>
                                                <span className="heat-building">{z.buildingName}</span>
                                                <div className="heat-stats">
                                                    <span>{z.currentOccupancy}/{z.maxCapacity}</span>
                                                    <span className="heat-pct" style={{ color: heatColor(z.heatmapIntensity) }}>{z.occupancyPercent}%</span>
                                                </div>
                                                <span className="heat-badge" style={{ background: congestionBadge(z.congestionLevel) }}>
                                                    {z.congestionLevel}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === EVACUATION TAB === */}
                    {activeView === 'evacuation' && data.evacuation && (
                        <div className="evac-section">
                            <div className="evac-hero">
                                <div className={`evac-timer ${data.evacuation.evacuationRating === 'EXCELLENT' ? 'rating-excellent' : data.evacuation.evacuationRating === 'GOOD' ? 'rating-good' : 'rating-warn'}`}>
                                    <div className="evac-time">{data.evacuation.estimatedEvacuationTimeMin}</div>
                                    <div className="evac-unit">minutes</div>
                                    <div className="evac-label">Estimated Evacuation Time</div>
                                </div>
                                <div className="evac-meta">
                                    <div className="evac-meta-item"><span>Emergency:</span><strong>{data.evacuation.emergencyType}</strong></div>
                                    <div className="evac-meta-item"><span>Rating:</span><strong className={`rating-${data.evacuation.evacuationRating?.toLowerCase()}`}>{data.evacuation.evacuationRating}</strong></div>
                                    <div className="evac-meta-item"><span>Flow Rate:</span><strong>{data.evacuation.flowRatePersonsPerSec} ppl/sec</strong></div>
                                    <div className="evac-meta-item"><span>Bottleneck Delay:</span><strong>+{data.evacuation.bottleneckDelayPct}%</strong></div>
                                </div>
                            </div>

                            <div className="chart-card">
                                <h3>Exit Gate Load Distribution</h3>
                                <div className="gate-grid">
                                    {data.evacuation.exitGates?.map((g, i) => (
                                        <div key={i} className={`gate-card ${g.status?.toLowerCase()}`}>
                                            <div className="gate-name">{g.gateName}</div>
                                            <div className="gate-people">{g.assignedPeople} people</div>
                                            <div className="gate-time">{Math.round(g.evacuationTimeSec)}s</div>
                                            <div className="gate-bar-wrap">
                                                <div className="gate-bar" style={{ width: `${Math.min((g.assignedPeople / g.capacity) * 100, 100)}%` }}></div>
                                            </div>
                                            <span className="gate-status">{g.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === CONGESTION TAB === */}
                    {activeView === 'congestion' && (
                        <div className="congestion-section">
                            <div className="chart-card">
                                <h3>⚠️ Detected Congestion Points</h3>
                                <div className="congestion-list">
                                    {data.congestionPoints?.map((cp, i) => (
                                        <div key={i} className="congestion-item">
                                            <div className="cong-severity" style={{ background: heatColor(cp.severity) }}>
                                                {Math.round(cp.severity * 100)}%
                                            </div>
                                            <div className="cong-info">
                                                <div className="cong-location">{cp.location}</div>
                                                <div className="cong-type">{cp.type?.replace(/_/g, ' ')} · {cp.affectedPeople} people</div>
                                                <div className="cong-rec">💡 {cp.recommendation}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Zone occupancy bar chart */}
                            <div className="chart-card" style={{ marginTop: 24 }}>
                                <h3>Zone Occupancy Overview</h3>
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={data.zones} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="zoneName" angle={-35} textAnchor="end" fontSize={10} interval={0} />
                                        <YAxis label={{ value: 'Occupancy %', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip formatter={(v) => `${v}%`} />
                                        <Bar dataKey="occupancyPercent" name="Occupancy %" radius={[6, 6, 0, 0]}
                                            fill="#003366" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* === FLOW TAB === */}
                    {activeView === 'flow' && data.hourlyFlow && (
                        <div className="flow-section">
                            <div className="chart-card">
                                <h3>24-Hour Campus Occupancy Flow</h3>
                                <ResponsiveContainer width="100%" height={340}>
                                    <AreaChart data={data.hourlyFlow} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                        <defs>
                                            <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#003366" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#003366" stopOpacity={0.05} />
                                            </linearGradient>
                                            <linearGradient id="congGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="label" />
                                        <YAxis yAxisId="left" label={{ value: 'People', angle: -90, position: 'insideLeft' }} />
                                        <YAxis yAxisId="right" orientation="right" domain={[0, 1]} label={{ value: 'Congestion', angle: 90, position: 'insideRight' }} />
                                        <Tooltip />
                                        <Legend />
                                        <Area yAxisId="left" type="monotone" dataKey="occupancy" name="Occupancy" stroke="#003366" fill="url(#occGrad)" strokeWidth={2} />
                                        <Area yAxisId="right" type="monotone" dataKey="congestionIndex" name="Congestion Index" stroke="#dc2626" fill="url(#congGrad)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="chart-card" style={{ marginTop: 24 }}>
                                <h3>Inflow / Outflow by Hour</h3>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={data.hourlyFlow} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="label" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="inflow" name="Inflow" fill="#059669" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="outflow" name="Outflow" fill="#dc2626" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* === READINESS TAB === */}
                    {activeView === 'readiness' && data.readiness && (
                        <div className="readiness-section">
                            <div className="score-hero">
                                <div className={`score-circle ${data.readiness.grade === 'A' ? 'grade-a' : data.readiness.grade === 'B' ? 'grade-b' : 'grade-c'}`}>
                                    <div className="score-grade">{data.readiness.grade}</div>
                                    <div className="score-of">{data.readiness.overallScore}/100</div>
                                </div>
                                <div className="score-meta">
                                    <h3>Emergency Readiness Score</h3>
                                    <p>Composite rating of campus safety preparedness</p>
                                </div>
                            </div>

                            <div className="readiness-bars">
                                {[
                                    { label: 'Evacuation Time', value: data.readiness.evacuationScore, icon: '🏃' },
                                    { label: 'Exit Access', value: data.readiness.exitAccessScore, icon: '🚪' },
                                    { label: 'Fire Equipment', value: data.readiness.fireEquipmentScore, icon: '🧯' },
                                    { label: 'Emergency Signage', value: data.readiness.signageScore, icon: '🪧' },
                                    { label: 'Drill Frequency', value: data.readiness.drillFrequencyScore, icon: '📋' }
                                ].map((item, i) => (
                                    <div key={i} className="readiness-bar-row">
                                        <span className="rb-icon">{item.icon}</span>
                                        <span className="rb-label">{item.label}</span>
                                        <div className="rb-track">
                                            <div className="rb-fill" style={{
                                                width: `${item.value}%`,
                                                background: item.value >= 80 ? '#059669' : item.value >= 60 ? '#f59e0b' : '#dc2626'
                                            }}></div>
                                        </div>
                                        <span className="rb-value">{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="readiness-lists">
                                {data.readiness.strengths?.length > 0 && (
                                    <div className="readiness-list strengths">
                                        <h4>✅ Strengths</h4>
                                        <ul>{data.readiness.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                                    </div>
                                )}
                                {data.readiness.improvements?.length > 0 && (
                                    <div className="readiness-list improvements">
                                        <h4>⚠️ Areas for Improvement</h4>
                                        <ul>{data.readiness.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {!data && !loading && !error && (
                <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>Crowd Flow Simulation</h3>
                    <p>Configure parameters and run the simulation to analyze crowd density, congestion zones, and emergency evacuation readiness.</p>
                </div>
            )}
        </div>
    );
}

export default CrowdFlowPage;
