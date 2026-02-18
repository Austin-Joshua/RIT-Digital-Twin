import { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import './Sustainability.css';

const pillarColors = { energy: '#f59e0b', transport: '#3b82f6', infrastructure: '#8b5cf6', composite: '#059669' };

function SustainabilityPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);
    const [activeView, setActiveView] = useState('overview');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/api/sustainability/dashboard');
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load dashboard.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const gradeColor = (g) =>
        g === 'A+' || g === 'A' ? '#059669' : g === 'B+' || g === 'B' ? '#2563eb' : '#d97706';

    const statusColor = (s) => ({
        AHEAD: '#059669', ON_TRACK: '#3b82f6', NEEDS_ATTENTION: '#f59e0b',
        IN_PROGRESS: '#3b82f6', PLANNED: '#8b5cf6', NEAR_COMPLETE: '#059669'
    }[s] || '#64748b');

    const radarData = data ? [
        { pillar: 'Energy', score: data.energy?.score },
        { pillar: 'Transport', score: data.transport?.score },
        { pillar: 'Infrastructure', score: data.infrastructure?.score },
        { pillar: 'Carbon', score: data.carbon ? Math.min(100, data.carbon.reductionFromBaseline * 1.5 + data.carbon.offsetTons / data.carbon.totalCo2TonsYear * 100) : 0 }
    ] : [];

    return (
        <div className="sust-page">
            {/* Header */}
            <div className="module-header sust-header">
                <div className="module-header-content">
                    <div className="module-icon sust-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <div>
                        <h1>Sustainability Dashboard</h1>
                        <p>Composite sustainability index — energy, transport, infrastructure & carbon</p>
                    </div>
                </div>
                {data && (
                    <div className="module-stats">
                        <div className="stat-chip"><span className="stat-icon">📊</span><span>{data.compositeIndex}/100</span></div>
                        <div className="stat-chip"><span className="stat-icon">🏅</span><span>Grade {data.compositeGrade}</span></div>
                        <div className="stat-chip"><span className="stat-icon">📅</span><span>{data.lastUpdated}</span></div>
                    </div>
                )}
            </div>

            {error && <div className="form-error">{error}</div>}
            {loading && <div className="empty-state"><div className="spinner" style={{ width: 40, height: 40 }}></div></div>}

            {data && (
                <>
                    <div className="tab-nav">
                        {['overview', 'pillars', 'trends', 'carbon', 'sdg', 'initiatives'].map(v => (
                            <button key={v} className={`tab-btn ${activeView === v ? 'active' : ''}`}
                                onClick={() => setActiveView(v)}>
                                {v === 'sdg' ? 'SDG Goals' : v.charAt(0).toUpperCase() + v.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* ===== OVERVIEW ===== */}
                    {activeView === 'overview' && (
                        <div className="sust-overview">
                            {/* Composite Hero */}
                            <div className="composite-hero">
                                <div className="composite-ring" style={{ '--ring-color': gradeColor(data.compositeGrade) }}>
                                    <div className="composite-value">{data.compositeIndex}</div>
                                    <div className="composite-of">/100</div>
                                    <div className="composite-grade" style={{ color: gradeColor(data.compositeGrade) }}>
                                        {data.compositeGrade}
                                    </div>
                                </div>
                                <div className="composite-detail">
                                    <h2>Composite Sustainability Index</h2>
                                    <p>{data.summary}</p>
                                </div>
                            </div>

                            {/* Pillar Cards */}
                            <div className="pillar-grid">
                                <div className="pillar-card energy-pillar">
                                    <div className="pillar-header"><span className="pillar-emoji">⚡</span><span>Energy</span></div>
                                    <div className="pillar-score" style={{ color: gradeColor(data.energy?.grade) }}>{data.energy?.score}</div>
                                    <div className="pillar-grade">{data.energy?.grade}</div>
                                    <div className="pillar-fact">{data.energy?.renewablePercent}% Renewable</div>
                                </div>
                                <div className="pillar-card transport-pillar">
                                    <div className="pillar-header"><span className="pillar-emoji">🚌</span><span>Transport</span></div>
                                    <div className="pillar-score" style={{ color: gradeColor(data.transport?.grade) }}>{data.transport?.score}</div>
                                    <div className="pillar-grade">{data.transport?.grade}</div>
                                    <div className="pillar-fact">{data.transport?.avgOccupancyPercent}% Occupancy</div>
                                </div>
                                <div className="pillar-card infra-pillar">
                                    <div className="pillar-header"><span className="pillar-emoji">🏗️</span><span>Infrastructure</span></div>
                                    <div className="pillar-score" style={{ color: gradeColor(data.infrastructure?.grade) }}>{data.infrastructure?.score}</div>
                                    <div className="pillar-grade">{data.infrastructure?.grade}</div>
                                    <div className="pillar-fact">{data.infrastructure?.classroomUtilizationPercent}% Classroom Util</div>
                                </div>
                                <div className="pillar-card carbon-pillar">
                                    <div className="pillar-header"><span className="pillar-emoji">🌿</span><span>Carbon</span></div>
                                    <div className="pillar-score" style={{ color: '#059669' }}>{data.carbon?.netEmissions}</div>
                                    <div className="pillar-grade">tons CO₂/yr</div>
                                    <div className="pillar-fact">-{data.carbon?.reductionFromBaseline}% from baseline</div>
                                </div>
                            </div>

                            {/* Radar */}
                            <div className="chart-card">
                                <h3>Pillar Balance</h3>
                                <ResponsiveContainer width="100%" height={320}>
                                    <RadarChart outerRadius={110} data={radarData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 12, fill: '#475569' }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                                        <Radar name="Score" dataKey="score" stroke="#003366" fill="#003366" fillOpacity={0.25} strokeWidth={2} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* ===== PILLARS DETAIL ===== */}
                    {activeView === 'pillars' && (
                        <div className="pillars-detail">
                            {/* Energy */}
                            <div className="detail-card">
                                <h3>⚡ Energy Performance</h3>
                                <div className="detail-metrics">
                                    <div className="dm"><span>Consumption</span><strong>{(data.energy?.totalConsumptionKwh / 1000).toFixed(0)}K kWh/mo</strong></div>
                                    <div className="dm"><span>Renewable Mix</span><strong>{data.energy?.renewablePercent}%</strong></div>
                                    <div className="dm"><span>Efficiency Gain</span><strong className="green">+{data.energy?.efficiencyGain}%</strong></div>
                                    <div className="dm"><span>Peak Demand</span><strong>{data.energy?.peakDemandKw} kW</strong></div>
                                    <div className="dm"><span>Solar Output</span><strong>{(data.energy?.solarGenerationKwh / 1000).toFixed(1)}K kWh</strong></div>
                                    <div className="dm"><span>Cost/sqft</span><strong>₹{data.energy?.costPerSqft}</strong></div>
                                </div>
                            </div>

                            {/* Transport */}
                            <div className="detail-card">
                                <h3>🚌 Transport Performance</h3>
                                <div className="detail-metrics">
                                    <div className="dm"><span>Fleet Efficiency</span><strong>{data.transport?.fleetEfficiency}%</strong></div>
                                    <div className="dm"><span>Avg Occupancy</span><strong>{data.transport?.avgOccupancyPercent}%</strong></div>
                                    <div className="dm"><span>Fuel/Student</span><strong>{data.transport?.fuelPerStudentLitres} L/day</strong></div>
                                    <div className="dm"><span>CO₂/Student</span><strong>{data.transport?.co2PerStudentKg} kg/day</strong></div>
                                    <div className="dm"><span>EV Adoption</span><strong className="green">{data.transport?.evAdoptionPercent}%</strong></div>
                                    <div className="dm"><span>Routes Optimized</span><strong>{data.transport?.routesOptimized}</strong></div>
                                </div>
                            </div>

                            {/* Infrastructure */}
                            <div className="detail-card">
                                <h3>🏗️ Infrastructure Performance</h3>
                                <div className="detail-metrics">
                                    <div className="dm"><span>Classroom Util</span><strong>{data.infrastructure?.classroomUtilizationPercent}%</strong></div>
                                    <div className="dm"><span>Lab Util</span><strong>{data.infrastructure?.labUtilizationPercent}%</strong></div>
                                    <div className="dm"><span>Facility Occupancy</span><strong>{data.infrastructure?.facilityOccupancyPercent}%</strong></div>
                                    <div className="dm"><span>Space Efficiency</span><strong>{data.infrastructure?.spaceEfficiencyIndex}</strong></div>
                                    <div className="dm"><span>Maintenance Response</span><strong>{data.infrastructure?.maintenanceResponseHrs} hrs</strong></div>
                                    <div className="dm"><span>Digitalized Rooms</span><strong>{data.infrastructure?.digitalizedRooms}</strong></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== TRENDS ===== */}
                    {activeView === 'trends' && data.monthlyTrend && (
                        <div className="trends-section">
                            <div className="chart-card">
                                <h3>12-Month Sustainability Index Trend</h3>
                                <ResponsiveContainer width="100%" height={350}>
                                    <LineChart data={data.monthlyTrend} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="month" />
                                        <YAxis domain={[40, 100]} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="composite" name="Composite" stroke={pillarColors.composite} strokeWidth={3} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="energy" name="Energy" stroke={pillarColors.energy} strokeWidth={2} strokeDasharray="5 5" />
                                        <Line type="monotone" dataKey="transport" name="Transport" stroke={pillarColors.transport} strokeWidth={2} strokeDasharray="5 5" />
                                        <Line type="monotone" dataKey="infrastructure" name="Infrastructure" stroke={pillarColors.infrastructure} strokeWidth={2} strokeDasharray="5 5" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* ===== CARBON ===== */}
                    {activeView === 'carbon' && data.carbon && (
                        <div className="carbon-section">
                            <div className="carbon-hero">
                                <div className="carbon-big">
                                    <div className="carbon-net">{data.carbon.netEmissions}</div>
                                    <div className="carbon-unit">tons CO₂/year (net)</div>
                                    <div className="carbon-target">Carbon neutral by {data.carbon.neutralityTarget}</div>
                                </div>
                                <div className="carbon-breakdown">
                                    <div className="cb-item scope1"><div className="cb-label">Scope 1 (Direct)</div><div className="cb-value">{data.carbon.scope1Tons} t</div></div>
                                    <div className="cb-item scope2"><div className="cb-label">Scope 2 (Electricity)</div><div className="cb-value">{data.carbon.scope2Tons} t</div></div>
                                    <div className="cb-item scope3"><div className="cb-label">Scope 3 (Indirect)</div><div className="cb-value">{data.carbon.scope3Tons} t</div></div>
                                    <div className="cb-item offset"><div className="cb-label">Offsets</div><div className="cb-value">-{data.carbon.offsetTons} t</div></div>
                                </div>
                            </div>

                            <div className="chart-card" style={{ marginTop: 24 }}>
                                <h3>Emission Breakdown</h3>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={[
                                        { name: 'Scope 1', value: data.carbon.scope1Tons, fill: '#f59e0b' },
                                        { name: 'Scope 2', value: data.carbon.scope2Tons, fill: '#ef4444' },
                                        { name: 'Scope 3', value: data.carbon.scope3Tons, fill: '#8b5cf6' },
                                        { name: 'Offsets', value: data.carbon.offsetTons, fill: '#22c55e' }
                                    ]} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="name" />
                                        <YAxis label={{ value: 'Tons CO₂', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip formatter={v => `${v} tons`} />
                                        <Bar dataKey="value" name="Tons CO₂" radius={[8, 8, 0, 0]}>
                                            {[
                                                { name: 'Scope 1', fill: '#f59e0b' },
                                                { name: 'Scope 2', fill: '#ef4444' },
                                                { name: 'Scope 3', fill: '#8b5cf6' },
                                                { name: 'Offsets', fill: '#22c55e' }
                                            ].map((e, i) => (
                                                <rect key={i} fill={e.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="savings-summary" style={{ marginTop: 20 }}>
                                <div className="saving-item"><span>Total Emissions</span><strong>{data.carbon.totalCo2TonsYear} t/yr</strong></div>
                                <div className="saving-item"><span>Per Capita</span><strong>{data.carbon.perCapitaCo2Kg} kg</strong></div>
                                <div className="saving-item"><span>Baseline Reduction</span><strong className="green">-{data.carbon.reductionFromBaseline}%</strong></div>
                                <div className="saving-item"><span>Net Emissions</span><strong>{data.carbon.netEmissions} t/yr</strong></div>
                            </div>
                        </div>
                    )}

                    {/* ===== SDG GOALS ===== */}
                    {activeView === 'sdg' && data.sdgGoals && (
                        <div className="sdg-section">
                            <div className="chart-card">
                                <h3>🌐 UN Sustainable Development Goal Progress</h3>
                                <div className="sdg-grid">
                                    {data.sdgGoals.map((g, i) => (
                                        <div key={i} className="sdg-card">
                                            <div className="sdg-number">SDG {g.sdgNumber}</div>
                                            <div className="sdg-title">{g.sdgTitle}</div>
                                            <div className="sdg-progress-ring">
                                                <svg viewBox="0 0 36 36">
                                                    <path className="sdg-bg" d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                                    <path className="sdg-fill" d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none" stroke={statusColor(g.status)} strokeWidth="3"
                                                        strokeDasharray={`${g.progress}, 100`} />
                                                </svg>
                                                <span className="sdg-pct">{g.progress}%</span>
                                            </div>
                                            <span className="sdg-status" style={{ color: statusColor(g.status) }}>{g.status?.replace(/_/g, ' ')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== INITIATIVES ===== */}
                    {activeView === 'initiatives' && data.activeInitiatives && (
                        <div className="init-section">
                            <div className="chart-card">
                                <h3>🚀 Active Sustainability Initiatives</h3>
                                <div className="init-list">
                                    {data.activeInitiatives.map((init, i) => (
                                        <div key={i} className="init-item">
                                            <div className="init-info">
                                                <div className="init-name">{init.name}</div>
                                                <div className="init-meta">
                                                    <span className="init-category" style={{ background: statusColor(init.status) + '20', color: statusColor(init.status) }}>{init.category}</span>
                                                    <span className="init-deadline">📅 {init.deadline}</span>
                                                </div>
                                                <div className="init-impact">💡 {init.impact}</div>
                                            </div>
                                            <div className="init-progress">
                                                <div className="init-bar-wrap">
                                                    <div className="init-bar" style={{
                                                        width: `${init.progressPercent}%`,
                                                        background: statusColor(init.status)
                                                    }}></div>
                                                </div>
                                                <div className="init-pct">{init.progressPercent}%</div>
                                                <span className="init-status" style={{ color: statusColor(init.status) }}>{init.status?.replace(/_/g, ' ')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {!data && !loading && !error && (
                <div className="empty-state">
                    <div className="empty-icon">🌿</div>
                    <h3>Sustainability Dashboard</h3>
                    <p>Loading composite sustainability index...</p>
                </div>
            )}
        </div>
    );
}

export default SustainabilityPage;
