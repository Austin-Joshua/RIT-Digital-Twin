import { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import api from '../../services/api';
import './Predictive.css';

const TREND_COLORS = { enrollment: '#003366', classroomUtil: '#f59e0b', energyKwh: '#ef4444', transportStudents: '#3b82f6' };
const sevColor = (s) => ({ CRITICAL: '#dc2626', HIGH: '#ea580c', MEDIUM: '#f59e0b', LOW: '#22c55e' }[s] || '#64748b');
const trendBadge = (t) => ({ RISING: '#059669', STABLE: '#3b82f6', DECLINING: '#dc2626' }[t] || '#64748b');

function PredictivePage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);
    const [activeView, setActiveView] = useState('overview');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/api/analytics/predictive');
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load forecast.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const fmt = (n) => {
        if (!n && n !== 0) return '0';
        if (n >= 100000) return (n / 100000).toFixed(1) + 'L';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toFixed?.(1) ?? n;
    };

    return (
        <div className="predict-page">
            {/* Header */}
            <div className="module-header predict-header">
                <div className="module-header-content">
                    <div className="module-icon predict-icon-style">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                    </div>
                    <div>
                        <h1>Predictive Analytics Engine</h1>
                        <p>Regression-based next-semester infrastructure demand forecasting</p>
                    </div>
                </div>
                {data && (
                    <div className="module-stats">
                        <div className="stat-chip"><span className="stat-icon">📈</span><span>{data.modelType}</span></div>
                        <div className="stat-chip"><span className="stat-icon">🎯</span><span>{data.confidenceLevel}% confidence</span></div>
                        <div className="stat-chip"><span className="stat-icon">📅</span><span>{data.forecastPeriod?.split('(')[0]}</span></div>
                    </div>
                )}
            </div>

            {error && <div className="form-error">{error}</div>}
            {loading && <div className="empty-state"><div className="spinner" style={{ width: 40, height: 40 }}></div></div>}

            {data && (
                <>
                    <div className="tab-nav">
                        {['overview', 'enrollment', 'infrastructure', 'forecast', 'risks', 'actions'].map(v => (
                            <button key={v} className={`tab-btn ${activeView === v ? 'active' : ''}`}
                                onClick={() => setActiveView(v)}>
                                {v.charAt(0).toUpperCase() + v.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* === OVERVIEW === */}
                    {activeView === 'overview' && (
                        <div className="pred-overview">
                            <div className="pred-summary-card">
                                <div className="pred-model-badge">{data.modelType} · R² = {(data.confidenceLevel / 100).toFixed(3)}</div>
                                <p>{data.summary}</p>
                            </div>

                            <div className="overview-cards">
                                <div className="e-card"><div className="e-card-icon">🎓</div><div className="e-card-value">{fmt(data.enrollment?.predictedEnrollment)}</div><div className="e-card-label">Predicted Enrollment</div></div>
                                <div className="e-card highlight-gold"><div className="e-card-icon">📈</div><div className="e-card-value">+{data.enrollment?.growthPercent}%</div><div className="e-card-label">Growth</div></div>
                                <div className="e-card"><div className="e-card-icon">🏫</div><div className="e-card-value">+{data.infrastructure?.shortfall}</div><div className="e-card-label">Classrooms Needed</div></div>
                                <div className="e-card"><div className="e-card-icon">🔬</div><div className="e-card-value">+{data.infrastructure?.labShortfall}</div><div className="e-card-label">Labs Needed</div></div>
                                <div className="e-card"><div className="e-card-icon">⚡</div><div className="e-card-value">{fmt(data.energy?.predictedMonthlyKwh)} kWh</div><div className="e-card-label">Energy Demand</div></div>
                                <div className="e-card highlight-green"><div className="e-card-icon">🚌</div><div className="e-card-value">+{data.transport?.additionalBuses}</div><div className="e-card-label">Buses Required</div></div>
                            </div>

                            {/* Semester trend chart */}
                            <div className="chart-card">
                                <h3>6-Semester Historical + Forecast Trend</h3>
                                <ResponsiveContainer width="100%" height={340}>
                                    <LineChart data={data.historicalTrend} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="semester" fontSize={11} />
                                        <YAxis yAxisId="left" label={{ value: 'Students', angle: -90, position: 'insideLeft' }} />
                                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Util %', angle: 90, position: 'insideRight' }} />
                                        <Tooltip />
                                        <Legend />
                                        <Line yAxisId="left" type="monotone" dataKey="enrollment" name="Enrollment" stroke={TREND_COLORS.enrollment} strokeWidth={3} dot={{ r: 5 }} />
                                        <Line yAxisId="left" type="monotone" dataKey="transportStudents" name="Transport" stroke={TREND_COLORS.transportStudents} strokeWidth={2} />
                                        <Line yAxisId="right" type="monotone" dataKey="classroomUtil" name="Classroom Util %" stroke={TREND_COLORS.classroomUtil} strokeWidth={2} strokeDasharray="5 5" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* === ENROLLMENT === */}
                    {activeView === 'enrollment' && data.enrollment && (
                        <div className="enroll-section">
                            <div className="enroll-hero">
                                <div className="enroll-current">
                                    <div className="enroll-label">Current</div>
                                    <div className="enroll-num">{data.enrollment.currentEnrollment}</div>
                                </div>
                                <div className="enroll-arrow">
                                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#c9a227" strokeWidth="2.5">
                                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                    </svg>
                                    <span className="enroll-growth">+{data.enrollment.growthPercent}%</span>
                                </div>
                                <div className="enroll-predicted">
                                    <div className="enroll-label">Predicted</div>
                                    <div className="enroll-num">{data.enrollment.predictedEnrollment}</div>
                                </div>
                            </div>

                            <div className="chart-card">
                                <h3>Department-wise Forecast</h3>
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={data.enrollment.departments} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="department" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="current" name="Current" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="predicted" name="Predicted" fill="#003366" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="dept-trend-grid">
                                {data.enrollment.departments?.map((d, i) => (
                                    <div key={i} className="dept-trend-card">
                                        <span className="dept-name">{d.department}</span>
                                        <span className="dept-growth" style={{ color: trendBadge(d.trend) }}>
                                            {d.growthPercent > 0 ? '+' : ''}{d.growthPercent}%
                                        </span>
                                        <span className="dept-trend-badge" style={{ background: trendBadge(d.trend) + '20', color: trendBadge(d.trend) }}>
                                            {d.trend}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* === INFRASTRUCTURE === */}
                    {activeView === 'infrastructure' && data.infrastructure && (
                        <div className="infra-section">
                            <div className="overview-cards" style={{ marginBottom: 20 }}>
                                <div className="e-card"><div className="e-card-icon">🏫</div><div className="e-card-value">{data.infrastructure.currentClassrooms} → {data.infrastructure.requiredClassrooms}</div><div className="e-card-label">Classrooms (need +{data.infrastructure.shortfall})</div></div>
                                <div className="e-card"><div className="e-card-icon">🔬</div><div className="e-card-value">{data.infrastructure.currentLabs} → {data.infrastructure.requiredLabs}</div><div className="e-card-label">Labs (need +{data.infrastructure.labShortfall})</div></div>
                                <div className="e-card highlight-gold"><div className="e-card-icon">📊</div><div className="e-card-value">{data.infrastructure.predictedUtilization}%</div><div className="e-card-label">Predicted Utilization</div></div>
                                <div className="e-card"><div className="e-card-icon">🔝</div><div className="e-card-value">{data.infrastructure.peakOccupancyPercent}%</div><div className="e-card-label">Peak Occupancy</div></div>
                            </div>

                            <div className="chart-card">
                                <h3>Facility Needs Assessment</h3>
                                <div className="facility-list">
                                    {data.infrastructure.facilityNeeds?.map((f, i) => (
                                        <div key={i} className={`facility-item priority-${f.priority?.toLowerCase()}`}>
                                            <div className="facility-info">
                                                <div className="facility-name">{f.facility}</div>
                                                <div className="facility-action">💡 {f.action}</div>
                                            </div>
                                            <div className="facility-caps">
                                                <span>{f.currentCapacity} → {f.requiredCapacity}</span>
                                            </div>
                                            <div className="facility-badges">
                                                <span className="facility-status">{f.status}</span>
                                                <span className="facility-priority" style={{ color: sevColor(f.priority) }}>{f.priority}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === FORECAST (ENERGY + TRANSPORT) === */}
                    {activeView === 'forecast' && (
                        <div className="fcast-section">
                            <div className="fcast-dual">
                                <div className="detail-card">
                                    <h3>⚡ Energy Forecast</h3>
                                    <div className="detail-metrics">
                                        <div className="dm"><span>Current</span><strong>{fmt(data.energy?.currentMonthlyKwh)} kWh/mo</strong></div>
                                        <div className="dm"><span>Predicted</span><strong>{fmt(data.energy?.predictedMonthlyKwh)} kWh/mo</strong></div>
                                        <div className="dm"><span>Increase</span><strong className="warn">+{data.energy?.increasePercent}%</strong></div>
                                        <div className="dm"><span>Peak Demand</span><strong>{fmt(data.energy?.predictedPeakKw)} kW</strong></div>
                                        <div className="dm"><span>Solar Coverage</span><strong className="green">{data.energy?.solarCoveragePercent}%</strong></div>
                                        <div className="dm"><span>Est. Monthly Cost</span><strong>₹{fmt(data.energy?.estimatedMonthlyCostInr)}</strong></div>
                                    </div>
                                </div>
                                <div className="detail-card">
                                    <h3>🚌 Transport Forecast</h3>
                                    <div className="detail-metrics">
                                        <div className="dm"><span>Current Students</span><strong>{fmt(data.transport?.currentStudentsServed)}</strong></div>
                                        <div className="dm"><span>Predicted Students</span><strong>{fmt(data.transport?.predictedStudentsServed)}</strong></div>
                                        <div className="dm"><span>Current Routes</span><strong>{data.transport?.currentRoutes}</strong></div>
                                        <div className="dm"><span>Required Routes</span><strong>{data.transport?.requiredRoutes}</strong></div>
                                        <div className="dm"><span>Additional Buses</span><strong className="warn">+{data.transport?.additionalBuses}</strong></div>
                                        <div className="dm"><span>Fuel/Day</span><strong>{fmt(data.transport?.predictedFuelLitresDaily)} L</strong></div>
                                    </div>
                                </div>
                            </div>

                            {/* Energy trend overlay */}
                            <div className="chart-card" style={{ marginTop: 24 }}>
                                <h3>Energy Consumption Trend + Forecast</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data.historicalTrend} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="semester" fontSize={11} />
                                        <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip formatter={v => `${fmt(v)} kWh`} />
                                        <Bar dataKey="energyKwh" name="Energy (kWh)" radius={[6, 6, 0, 0]}>
                                            {data.historicalTrend?.map((_, i) => (
                                                <Cell key={i} fill={i === data.historicalTrend.length - 1 ? '#c9a227' : '#003366'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* === RISKS === */}
                    {activeView === 'risks' && data.risks && (
                        <div className="risks-section">
                            <div className="chart-card">
                                <h3>⚠️ Risk Assessment Matrix</h3>
                                <div className="risk-list">
                                    {data.risks.map((r, i) => (
                                        <div key={i} className={`risk-item severity-${r.severity?.toLowerCase()}`}>
                                            <div className="risk-header">
                                                <span className="risk-severity" style={{ background: sevColor(r.severity) }}>{r.severity}</span>
                                                <span className="risk-category">{r.category}</span>
                                                <span className="risk-prob">{Math.round(r.probability * 100)}% probability</span>
                                            </div>
                                            <div className="risk-desc">{r.risk}</div>
                                            <div className="risk-mitigate">🛡️ {r.mitigation}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === ACTIONS === */}
                    {activeView === 'actions' && data.recommendations && (
                        <div className="actions-section">
                            <div className="chart-card">
                                <h3>🎯 Strategic Recommendations</h3>
                                <div className="rec-list">
                                    {data.recommendations.map((r, i) => (
                                        <div key={i} className="rec-item">
                                            <div className="rec-number">{i + 1}</div>
                                            <div className="rec-text">{r}</div>
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
                    <div className="empty-icon">📊</div>
                    <h3>Predictive Analytics</h3>
                    <p>Loading regression-based forecast...</p>
                </div>
            )}
        </div>
    );
}

export default PredictivePage;
