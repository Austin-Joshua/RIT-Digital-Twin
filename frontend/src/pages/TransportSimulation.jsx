import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import api from '../services/api';
import './modules/Transport.css';

const COLORS = ['#003366', '#c9a227', '#0066cc', '#1a8a5c', '#e6c84d', '#cc6600', '#4a90d9'];

function TransportPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);
    const [activeView, setActiveView] = useState('overview');
    const [params, setParams] = useState({
        routeCount: 12,
        totalStudents: 2800,
        fuelCostPerLitre: 100,
        optimizationTarget: 20,
        includeEvScenario: true
    });

    const runSimulation = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/api/simulate/transport', params);
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Simulation failed.');
        } finally {
            setLoading(false);
        }
    };

    const fmt = (n) => {
        if (!n && n !== 0) return '0';
        if (n >= 10000000) return (n / 10000000).toFixed(2) + ' Cr';
        if (n >= 100000) return (n / 100000).toFixed(1) + ' L';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toFixed?.(1) ?? n;
    };

    const statusColor = (s) => s === 'OPTIMAL' ? '#059669' : s === 'MODERATE' ? '#d97706' : '#dc2626';

    return (
        <div className="transport-page">
            {/* Header */}
            <div className="module-header transport-header">
                <div className="module-header-content">
                    <div className="module-icon transport-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                            <rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                            <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                    </div>
                    <div>
                        <h1>Transport Route Optimization</h1>
                        <p>Simulate fleet efficiency, fuel savings, and student cluster mapping</p>
                    </div>
                </div>
                <div className="module-stats">
                    <div className="stat-chip"><span className="stat-icon">🚌</span><span>12 Routes</span></div>
                    <div className="stat-chip"><span className="stat-icon">👥</span><span>2,800 Students</span></div>
                    <div className="stat-chip"><span className="stat-icon">⛽</span><span>20% Target</span></div>
                </div>
            </div>

            {/* Controls */}
            <div className="energy-controls">
                <div className="control-panel">
                    <h3>Simulation Parameters</h3>
                    <div className="param-grid">
                        <div className="param-group">
                            <label>Routes</label>
                            <input type="number" value={params.routeCount} min={1} max={12}
                                onChange={e => setParams(p => ({ ...p, routeCount: +e.target.value }))} />
                        </div>
                        <div className="param-group">
                            <label>Total Students</label>
                            <input type="number" value={params.totalStudents} min={100} max={5000}
                                onChange={e => setParams(p => ({ ...p, totalStudents: +e.target.value }))} />
                        </div>
                        <div className="param-group">
                            <label>Fuel Cost (₹/L)</label>
                            <input type="number" value={params.fuelCostPerLitre} min={50} max={200}
                                onChange={e => setParams(p => ({ ...p, fuelCostPerLitre: +e.target.value }))} />
                        </div>
                        <div className="param-group">
                            <label>Optimization (%)</label>
                            <input type="number" value={params.optimizationTarget} min={5} max={50}
                                onChange={e => setParams(p => ({ ...p, optimizationTarget: +e.target.value }))} />
                        </div>
                        <div className="param-toggle">
                            <label>
                                <input type="checkbox" checked={params.includeEvScenario}
                                    onChange={e => setParams(p => ({ ...p, includeEvScenario: e.target.checked }))} />
                                <span>EV Scenario</span>
                            </label>
                        </div>
                    </div>
                    <div className="control-actions">
                        <button className="btn-primary" onClick={runSimulation} disabled={loading}>
                            {loading ? <><span className="spinner"></span>Simulating...</> :
                                <>🚌 Run Simulation</>}
                        </button>
                    </div>
                </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            {data && (
                <>
                    <div className="tab-nav">
                        {['overview', 'routes', 'fuel', 'clusters', 'optimization', ...(data.evScenario ? ['ev'] : [])].map(v => (
                            <button key={v} className={`tab-btn ${activeView === v ? 'active' : ''}`}
                                onClick={() => setActiveView(v)}>
                                {v === 'ev' ? 'EV Scenario' : v.charAt(0).toUpperCase() + v.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Overview */}
                    {activeView === 'overview' && (
                        <div className="energy-overview">
                            <div className="overview-cards">
                                <div className="e-card"><div className="e-card-icon">🚌</div><div className="e-card-value">{data.fleetOverview?.totalRoutes}</div><div className="e-card-label">Routes Active</div></div>
                                <div className="e-card"><div className="e-card-icon">👥</div><div className="e-card-value">{fmt(data.fleetOverview?.totalStudents)}</div><div className="e-card-label">Students Served</div></div>
                                <div className="e-card highlight-gold"><div className="e-card-icon">⛽</div><div className="e-card-value">{fmt(data.fuelAnalysis?.dailyFuelLitres)} L</div><div className="e-card-label">Daily Fuel</div></div>
                                <div className="e-card"><div className="e-card-icon">📏</div><div className="e-card-value">{fmt(data.fleetOverview?.totalDailyTripsKm)} km</div><div className="e-card-label">Daily Distance</div></div>
                                <div className="e-card highlight-green"><div className="e-card-icon">📊</div><div className="e-card-value">{data.optimization?.optimizationScore}</div><div className="e-card-label">Optimization Score</div></div>
                                <div className="e-card"><div className="e-card-icon">🪑</div><div className="e-card-value">{data.fleetOverview?.averageOccupancyPercent}%</div><div className="e-card-label">Avg Occupancy</div></div>
                            </div>
                            {data.summary && <div className="results-insight"><p>{data.summary}</p></div>}
                        </div>
                    )}

                    {/* Routes Table */}
                    {activeView === 'routes' && (
                        <div className="chart-card">
                            <h3>Route Details</h3>
                            <div className="routes-table-wrap">
                                <table className="routes-table">
                                    <thead>
                                        <tr>
                                            <th>Code</th><th>Route</th><th>Origin</th><th>Dist (km)</th><th>Stops</th>
                                            <th>Students</th><th>Occupancy</th><th>Fuel (L)</th><th>Score</th><th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.routes?.map(r => (
                                            <tr key={r.routeCode}>
                                                <td className="route-code">{r.routeCode}</td>
                                                <td>{r.routeName}</td>
                                                <td>{r.origin}</td>
                                                <td>{r.distanceKm}</td>
                                                <td>{r.stops}</td>
                                                <td>{r.students}</td>
                                                <td>
                                                    <div className="occ-bar-wrap">
                                                        <div className="occ-bar" style={{ width: `${Math.min(r.occupancyPercent, 100)}%`, background: statusColor(r.status) }}></div>
                                                    </div>
                                                    <span className="occ-label">{r.occupancyPercent}%</span>
                                                </td>
                                                <td>{r.fuelLitres}</td>
                                                <td><span className="score-pill">{r.efficiencyScore}</span></td>
                                                <td><span className="status-badge" style={{ color: statusColor(r.status) }}>{r.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Fuel Analysis */}
                    {activeView === 'fuel' && data.fuelAnalysis && (
                        <div className="fuel-section">
                            <div className="comparison-grid" style={{ justifyContent: 'flex-start' }}>
                                <div className="comp-card before" style={{ borderColor: '#fecaca' }}>
                                    <div className="comp-badge">CURRENT MONTHLY</div>
                                    <div className="comp-value">{fmt(data.fuelAnalysis.monthlyFuelLitres)} L</div>
                                    <div className="comp-cost">₹{fmt(data.fuelAnalysis.monthlyCostInr)}</div>
                                </div>
                                <div className="comp-arrow">
                                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#c9a227" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                    </svg>
                                    <span className="savings-badge">-{params.optimizationTarget}%</span>
                                </div>
                                <div className="comp-card after" style={{ borderColor: '#a7f3d0' }}>
                                    <div className="comp-badge">OPTIMIZED MONTHLY</div>
                                    <div className="comp-value">{fmt(data.fuelAnalysis.monthlyFuelLitres * (1 - params.optimizationTarget / 100))} L</div>
                                    <div className="comp-cost">₹{fmt(data.fuelAnalysis.monthlyCostInr * (1 - params.optimizationTarget / 100))}</div>
                                </div>
                            </div>
                            <div className="savings-summary" style={{ marginTop: 20 }}>
                                <div className="saving-item"><span>Daily Fuel</span><strong>{fmt(data.fuelAnalysis.dailyFuelLitres)} L</strong></div>
                                <div className="saving-item"><span>Daily Cost</span><strong>₹{fmt(data.fuelAnalysis.dailyCostInr)}</strong></div>
                                <div className="saving-item"><span>Fuel per Student</span><strong>{data.fuelAnalysis.avgFuelPerStudent} L</strong></div>
                                <div className="saving-item"><span>Daily CO₂</span><strong>{fmt(data.fuelAnalysis.co2EmissionsKgDaily)} kg</strong></div>
                            </div>
                            {/* Fuel by route */}
                            <div className="chart-card" style={{ marginTop: 24 }}>
                                <h3>Fuel Consumption by Route</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data.routes} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="routeCode" />
                                        <YAxis label={{ value: 'Litres', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip formatter={(v) => `${v} L`} />
                                        <Bar dataKey="fuelLitres" name="Fuel (L)" fill="#003366" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Clusters */}
                    {activeView === 'clusters' && data.clusters && (
                        <div className="clusters-section">
                            <div className="chart-card">
                                <h3>Student Residential Clusters</h3>
                                <div className="buildings-chart-grid">
                                    <ResponsiveContainer width="100%" height={320}>
                                        <PieChart>
                                            <Pie data={data.clusters} dataKey="studentCount" nameKey="zoneName"
                                                cx="50%" cy="50%" outerRadius={120}
                                                label={({ zoneName, percentage }) => `${zoneName} (${percentage}%)`}>
                                                {data.clusters.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(v) => `${v} students`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="building-list">
                                        {data.clusters.map((c, i) => (
                                            <div key={i} className="building-row">
                                                <div className="building-color" style={{ background: COLORS[i % COLORS.length] }}></div>
                                                <div className="building-info">
                                                    <span className="building-name">{c.zoneName}</span>
                                                    <span className="building-kwh">{c.area} • {c.distanceFromCampusKm} km • Route {c.assignedRoute}</span>
                                                </div>
                                                <strong style={{ color: '#003366', fontSize: '0.85rem' }}>{c.studentCount}</strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Optimization */}
                    {activeView === 'optimization' && data.optimization && (
                        <div className="opt-section">
                            <div className="score-hero">
                                <div className={`score-circle ${data.optimization.optimizationScore >= 80 ? 'grade-a' : data.optimization.optimizationScore >= 60 ? 'grade-b' : 'grade-c'}`}>
                                    <div className="score-grade">{data.optimization.optimizationScore}</div>
                                    <div className="score-of">/100</div>
                                </div>
                                <div className="score-meta">
                                    <h3>Fleet Optimization Score</h3>
                                    <p>Current: {data.optimization.currentEfficiency} → Optimized: {data.optimization.optimizedEfficiency}</p>
                                </div>
                            </div>
                            <div className="sustainability-metrics">
                                <div className="sust-card"><span className="sust-icon">⛽</span><div className="sust-value">-{data.optimization.fuelReductionPercent}%</div><div className="sust-label">Fuel Reduction</div></div>
                                <div className="sust-card green"><span className="sust-icon">💰</span><div className="sust-value">₹{fmt(data.optimization.costSavingsInr)}</div><div className="sust-label">Monthly Savings</div></div>
                                <div className="sust-card"><span className="sust-icon">🔀</span><div className="sust-value">{data.optimization.routesMerged}</div><div className="sust-label">Routes Merged</div></div>
                                <div className="sust-card"><span className="sust-icon">📍</span><div className="sust-value">{data.optimization.stopsOptimized}</div><div className="sust-label">Stops Optimized</div></div>
                            </div>
                            {data.optimization.recommendations?.length > 0 && (
                                <div className="recommendations-panel">
                                    <h3>💡 Optimization Recommendations</h3>
                                    <ul>{data.optimization.recommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* EV Scenario */}
                    {activeView === 'ev' && data.evScenario && (
                        <div className="ev-section">
                            <div className="chart-card">
                                <h3>🔋 Electric Vehicle Replacement Scenario</h3>
                                <p className="chart-subtitle">Replacing {data.evScenario.evReplacements} diesel buses with electric</p>
                                <div className="solar-grid">
                                    <div className="solar-metric gold"><div className="sm-value">₹{fmt(data.evScenario.annualFuelSavingsInr)}</div><div className="sm-label">Annual Fuel Savings</div></div>
                                    <div className="solar-metric"><div className="sm-value">₹{fmt(data.evScenario.evPurchaseCostInr)}</div><div className="sm-label">EV Purchase Cost</div></div>
                                    <div className="solar-metric highlight"><div className="sm-value">{data.evScenario.paybackYears} yrs</div><div className="sm-label">Payback Period</div></div>
                                    <div className="solar-metric green"><div className="sm-value">-{data.evScenario.co2ReductionPercent}%</div><div className="sm-label">CO₂ Reduction</div></div>
                                    <div className="solar-metric"><div className="sm-value">₹{fmt(data.evScenario.electricityCostInr)}</div><div className="sm-label">Electricity Cost/yr</div></div>
                                    <div className="solar-metric gold"><div className="sm-value">₹{fmt(data.evScenario.netSavingsInr)}</div><div className="sm-label">10-Year Net Savings</div></div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {!data && !loading && !error && (
                <div className="empty-state">
                    <div className="empty-icon">🚌</div>
                    <h3>Transport Route Simulation</h3>
                    <p>Configure parameters and run the simulation to analyze route efficiency, fuel consumption, and optimization opportunities.</p>
                </div>
            )}
        </div>
    );
}

export default TransportPage;
