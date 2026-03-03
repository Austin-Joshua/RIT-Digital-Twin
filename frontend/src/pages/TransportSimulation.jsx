import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './modules/Transport.css';

const COLORS = ['var(--color-primary-navy)', 'var(--color-accent-gold)', 'var(--color-primary-600)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-error)', 'var(--color-primary-400)'];

function TransportPage() {
    const { user } = useAuth();
    if (user?.role !== 'ADMIN') {
        return <Navigate to="/transport" replace />;
    }
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
            setError(err.response?.data?.message || 'The simulation could not be completed. Please try again later.');
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
            <div className="module-header transport-header" style={{ background: 'linear-gradient(135deg, var(--color-primary-navy), var(--color-primary-800))' }}>
                <div className="module-header-content">
                    <div className="module-icon transport-icon" style={{ background: 'var(--color-primary-navy)' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                            <rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                            <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                    </div>
                    <div>
                        <h1 style={{ color: '#fff', margin: 0, fontWeight: '900', fontStyle: 'italic', letterSpacing: '-0.5px' }}>Transport Route Optimization</h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)', margin: '4px 0 0', fontWeight: '500' }}>Simulate fleet efficiency, fuel savings, and student cluster mapping</p>
                    </div>
                </div>
                <div className="module-stats">
                    <div className="stat-chip" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                        <span className="stat-icon">🚌</span>
                        <span style={{ color: '#fff', fontWeight: '700' }}>12 Active Routes</span>
                    </div>
                    <div className="stat-chip" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                        <span className="stat-icon">👥</span>
                        <span style={{ color: '#fff', fontWeight: '700' }}>2,800 Students</span>
                    </div>
                    <div className="stat-chip" style={{ background: 'var(--color-accent-gold)', color: 'var(--color-primary-navy)' }}>
                        <span className="stat-icon">⛽</span>
                        <span className="font-black italic">20% Target</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="energy-controls" style={{ background: 'var(--card-bg)', border: '1px solid var(--theme-border)', borderRadius: '16px', padding: '24px' }}>
                <div className="control-panel">
                    <h3 style={{ color: 'var(--theme-text)', marginBottom: '16px' }}>Simulation Parameters</h3>
                    <div className="param-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                        <div className="param-group">
                            <label style={{ color: 'var(--theme-text-muted)', fontSize: '13px', fontWeight: 'bold' }}>Routes</label>
                            <input type="number" value={params.routeCount} min={1} max={12}
                                style={{ background: 'var(--theme-bg-muted)', color: 'var(--theme-text)', borderColor: 'var(--theme-border)', padding: '8px', borderRadius: '4px' }}
                                onChange={e => setParams(p => ({ ...p, routeCount: +e.target.value }))} />
                        </div>
                        <div className="param-group">
                            <label style={{ color: 'var(--theme-text-muted)', fontSize: '13px', fontWeight: 'bold' }}>Total Students</label>
                            <input type="number" value={params.totalStudents} min={100} max={5000}
                                style={{ background: 'var(--theme-bg-muted)', color: 'var(--theme-text)', borderColor: 'var(--theme-border)', padding: '8px', borderRadius: '4px' }}
                                onChange={e => setParams(p => ({ ...p, totalStudents: +e.target.value }))} />
                        </div>
                        <div className="param-group">
                            <label style={{ color: 'var(--theme-text-muted)', fontSize: '13px', fontWeight: 'bold' }}>Fuel Cost (₹/L)</label>
                            <input type="number" value={params.fuelCostPerLitre} min={50} max={200}
                                style={{ background: 'var(--theme-bg-muted)', color: 'var(--theme-text)', borderColor: 'var(--theme-border)', padding: '8px', borderRadius: '4px' }}
                                onChange={e => setParams(p => ({ ...p, fuelCostPerLitre: +e.target.value }))} />
                        </div>
                        <div className="param-group">
                            <label style={{ color: 'var(--theme-text-muted)', fontSize: '13px', fontWeight: 'bold' }}>Optimization (%)</label>
                            <input type="number" value={params.optimizationTarget} min={5} max={50}
                                style={{ background: 'var(--theme-bg-muted)', color: 'var(--theme-text)', borderColor: 'var(--theme-border)', padding: '8px', borderRadius: '4px' }}
                                onChange={e => setParams(p => ({ ...p, optimizationTarget: +e.target.value }))} />
                        </div>
                        <div className="param-toggle" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '8px' }}>
                            <label style={{ color: 'var(--theme-text)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <input type="checkbox" checked={params.includeEvScenario}
                                    onChange={e => setParams(p => ({ ...p, includeEvScenario: e.target.checked }))} />
                                <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: '500' }}>EV Scenario</span>
                            </label>
                        </div>
                    </div>
                    <div className="control-actions" style={{ marginTop: '24px' }}>
                        <button className="btn-primary" onClick={runSimulation} disabled={loading} style={{ background: 'var(--color-primary-navy)', color: 'white' }}>
                            {loading ? <><span className="spinner"></span>Processing Simulation Data...</> :
                                <>🚌 Execute Simulation Analysis</>}
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="e-card group border-l-4 border-blue-500 hover:scale-[1.02] transition-all" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)', borderLeftColor: 'var(--color-primary-500)' }}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted)' }}>Routes</div>
                                            <div className="text-3xl font-black italic" style={{ color: 'var(--theme-text)' }}>{data.fleetOverview?.totalRoutes}</div>
                                        </div>
                                        <div className="p-3 rounded-xl" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>🚌</div>
                                    </div>
                                    <div className="mt-4 text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>Active Network Coverage</div>
                                </div>

                                <div className="e-card group border-l-4 border-gold-500 hover:scale-[1.02] transition-all" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)', borderLeftColor: 'var(--color-accent-gold)' }}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted)' }}>Fuel Consumption</div>
                                            <div className="text-3xl font-black italic" style={{ color: 'var(--theme-text)' }}>{fmt(data.fuelAnalysis?.dailyFuelLitres)} L</div>
                                        </div>
                                        <div className="p-3 rounded-xl" style={{ background: 'var(--color-accent-gold-rgba, rgba(201, 162, 39, 0.1))', color: 'var(--color-accent-gold)' }}>⛽</div>
                                    </div>
                                    <div className="mt-4 text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>Estimated Daily Usage</div>
                                </div>

                                <div className="e-card group border-l-4 border-green-500 hover:scale-[1.02] transition-all" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)', borderLeftColor: 'var(--color-success)' }}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted)' }}>Opt Score</div>
                                            <div className="text-3xl font-black italic" style={{ color: 'var(--theme-text)' }}>{data.optimization?.optimizationScore}</div>
                                        </div>
                                        <div className="p-3 rounded-xl" style={{ background: 'var(--color-success-rgba, rgba(26, 138, 92, 0.1))', color: 'var(--color-success)' }}>📊</div>
                                    </div>
                                    <div className="mt-4 text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>Network Efficiency Rating</div>
                                </div>
                            </div>
                            {data.summary && <div className="results-insight p-6 rounded-r-xl" style={{ background: 'var(--theme-bg-muted)', borderLeft: '4px solid var(--color-primary-navy)' }}><p className="font-medium italic" style={{ color: 'var(--theme-text)' }}>"{data.summary}"</p></div>}
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
                            <div className="chart-card" style={{ marginTop: 24, background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--theme-border)' }}>
                                <h3 style={{ color: 'var(--theme-text)', marginBottom: '20px' }}>Fuel Consumption by Route</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data.routes} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" />
                                        <XAxis dataKey="routeCode" stroke="var(--theme-text-muted)" />
                                        <YAxis stroke="var(--theme-text-muted)" label={{ value: 'Litres', angle: -90, position: 'insideLeft', fill: 'var(--theme-text-muted)' }} />
                                        <Tooltip
                                            contentStyle={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                                            itemStyle={{ color: 'var(--theme-text)' }}
                                            formatter={(v) => [`${v} L`, 'Fuel']}
                                        />
                                        <Bar dataKey="fuelLitres" name="Fuel (L)" fill="var(--color-primary-navy)" radius={[6, 6, 0, 0]} />
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
                                                <strong style={{ color: 'var(--theme-text)', fontSize: '0.85rem' }}>{c.studentCount}</strong>
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
                    <h3>Campus Transport Network Simulation</h3>
                    <p>Please configure the simulation parameters and execute the analysis to evaluate route efficiency and optimization potential.</p>
                </div>
            )}
        </div>
    );
}

export default TransportPage;
