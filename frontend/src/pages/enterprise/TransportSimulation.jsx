import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import KPIDetailsModal from '../../components/common/KPIDetailsModal';
import { FaBus, FaUsers, FaChartLine, FaRobot, FaMicrochip } from 'react-icons/fa';
import '../modules/Transport.css';

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
    const [modal, setModal] = useState({ isOpen: false, title: '', value: '', label: '', description: '', icon: null, colorClass: 'blue' });

    const openModal = (title, value, label, description, icon, colorClass, view) => {
        setModal({ isOpen: true, title, value, label, description, icon, colorClass });
        if (view) setActiveView(view);
    };

    const runSimulation = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/simulate/transport', params);
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to complete network analysis. Please verify your connection to the institution server.');
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

    const statusColor = (s) => s === 'OPTIMAL' ? 'var(--color-success)' : s === 'MODERATE' ? 'var(--color-warning)' : 'var(--color-error)';

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            {/* Redesigned Header - Matching Alumni Portal */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-accent-gold)' }}>
                        <span className="p-2 bg-navy-900 text-white rounded-lg">🚌</span> Institutional Fleet Intelligence
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Evaluating fleet dynamics, fuel economics, and residential cluster distributions</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 hover:opacity-80 disabled:opacity-50" style={{ background: 'var(--card-bg)', color: 'var(--theme-text)', border: '1px solid var(--theme-border)' }}>
                        Network Map
                    </button>
                    <button className="px-4 py-2 font-bold rounded-lg transition-colors hover:opacity-90 active:scale-95 disabled:opacity-50" style={{ background: 'var(--color-primary-navy)', color: 'white' }}>
                        Optimise All
                    </button>
                </div>
            </div>

            {/* Redesigned KPI Row - Matching Alumni Portal Style */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                <div className="stu-kpi-card blue cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => openModal('Network Coverage', '12', 'Active Routes', 'Our institutional fleet operates across 12 strategic routes, ensuring comprehensive coverage for students residing in various parts of the city.', FaBus, 'blue', 'routes')}>
                    <div className="kpi-main">
                        <div className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-2">Active Routes</div>
                        <div className="text-4xl font-black mb-1 text-white">12</div>
                        <div className="text-sm text-blue-100">Across Campus Network</div>
                    </div>
                    <div className="kpi-icon">🚌</div>
                </div>
                <div className="stu-kpi-card green cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => openModal('Commuter Analytics', '2,800', 'Total Students', 'Over 2,800 students rely on our institutional transport daily, making it one of the largest private transit networks in the region.', FaUsers, 'green', 'clusters')}>
                    <div className="kpi-main">
                        <div className="text-sm font-bold text-green-200 uppercase tracking-wider mb-2">Total Students</div>
                        <div className="text-4xl font-black mb-1 text-white">2,800</div>
                        <div className="text-sm text-green-100">Bus Commuters</div>
                    </div>
                    <div className="kpi-icon">👥</div>
                </div>
                <div className="stu-kpi-card amber cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => openModal('Sustainability Goals', '20%', 'Target Efficiency', 'We are targeting a 20% reduction in fuel consumption through AI-driven route optimization and strategic fleet deployment.', FaChartLine, 'amber', 'optimization')}>
                    <div className="kpi-main">
                        <div className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-2">Target Efficiency</div>
                        <div className="text-4xl font-black mb-1" style={{ color: 'var(--ims-bg-light)' }}>20%</div>
                        <div className="text-sm text-amber-900">Projected Fuel Savings Goal</div>
                    </div>
                    <div className="kpi-icon">📈</div>
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
                            {loading ? <><span className="spinner"></span>Synthesizing Fleet Data...</> :
                                <>🚌 Run Predictive Network Analysis</>}
                        </button>
                    </div>
                </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            {data && (
                <>
                    <div className="tab-nav flex items-center justify-between">
                        <div>
                            {['overview', 'routes', 'fuel', 'clusters', 'multiplication', 'algorithm', 'optimization', ...(data.evScenario ? ['ev'] : [])].map(v => (
                                <button key={v} className={`tab-btn ${activeView === v ? 'active' : ''}`}
                                    onClick={() => setActiveView(v)}>
                                    {v === 'ev' ? 'EV Scenario' : v === 'multiplication' ? 'Cluster Multiplication' : v === 'algorithm' ? 'Algorithm Status' : v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>
                        {activeView !== 'overview' && (
                            <button
                                onClick={() => setActiveView('overview')}
                                className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            >
                                ✕ Close
                            </button>
                        )}
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
                            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
                                <div className="comp-card before w-full md:w-auto" style={{ borderColor: '#fecaca', flex: 1 }}>
                                    <div className="comp-badge text-center">CURRENT MONTHLY</div>
                                    <div className="comp-value text-center">{fmt(data.fuelAnalysis.monthlyFuelLitres)} L</div>
                                    <div className="comp-cost text-center">₹{fmt(data.fuelAnalysis.monthlyCostInr)}</div>
                                </div>
                                <div className="comp-arrow flex flex-col items-center">
                                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#c9a227" strokeWidth="2" className="rotate-90 md:rotate-0">
                                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                    </svg>
                                    <span className="savings-badge">-{params.optimizationTarget}%</span>
                                </div>
                                <div className="comp-card after w-full md:w-auto" style={{ borderColor: '#a7f3d0', flex: 1 }}>
                                    <div className="comp-badge text-center">OPTIMIZED MONTHLY</div>
                                    <div className="comp-value text-center">{fmt(data.fuelAnalysis.monthlyFuelLitres * (1 - params.optimizationTarget / 100))} L</div>
                                    <div className="comp-cost text-center">₹{fmt(data.fuelAnalysis.monthlyCostInr * (1 - params.optimizationTarget / 100))}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginTop: 20 }}>
                                <div className="p-4 rounded-xl border text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                                    <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Daily Fuel</div>
                                    <div className="text-lg font-black" style={{ color: 'var(--theme-text)' }}>{fmt(data.fuelAnalysis.dailyFuelLitres)} L</div>
                                </div>
                                <div className="p-4 rounded-xl border text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                                    <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Daily Cost</div>
                                    <div className="text-lg font-black" style={{ color: 'var(--theme-text)' }}>₹{fmt(data.fuelAnalysis.dailyCostInr)}</div>
                                </div>
                                <div className="p-4 rounded-xl border text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                                    <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Fuel/Student</div>
                                    <div className="text-lg font-black" style={{ color: 'var(--theme-text)' }}>{data.fuelAnalysis.avgFuelPerStudent} L</div>
                                </div>
                                <div className="p-4 rounded-xl border text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                                    <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Daily CO₂</div>
                                    <div className="text-lg font-black" style={{ color: 'var(--theme-text)' }}>{fmt(data.fuelAnalysis.co2EmissionsKgDaily)} kg</div>
                                </div>
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

                     {/* Cluster Multiplication */}
                    {activeView === 'multiplication' && (
                        <div className="multiplication-section animate-in fade-in slide-in-from-bottom-4">
                            <div className="chart-card" style={{ borderTop: '4px solid var(--color-primary-600)' }}>
                                <h3 className="flex items-center gap-2"><FaUsers color="var(--color-primary-600)" /> Smart Cluster Multiplication</h3>
                                <p className="text-sm text-gray-500 mb-4">Simulating future growth and residential density expansion</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <h4 className="font-bold mb-4">Projected Growth Distribution</h4>
                                        <div className="space-y-4">
                                            {data.multipliedClusters?.map((c, i) => (
                                                <div key={i} className="flex flex-col gap-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span>{c.zoneName}</span>
                                                        <span className="font-bold">+{((c.projectedCount / c.studentCount - 1) * 100).toFixed(0)}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500" style={{ width: `${(c.projectedCount / 1000) * 100}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20">
                                            <div className="text-xs font-bold uppercase text-indigo-400 mb-1">Total Capacity Multiplier</div>
                                            <div className="text-2xl font-black text-indigo-600">x1.45</div>
                                            <div className="text-sm text-indigo-500 mt-1">Institutional expansion readiness score</div>
                                        </div>
                                        <div className="p-4 rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20">
                                            <div className="text-xs font-bold uppercase text-green-400 mb-1">Synthetic Population Alpha</div>
                                            <div className="text-2xl font-black text-green-600">0.982</div>
                                            <div className="text-sm text-green-500 mt-1">High fidelity simulation coefficient</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Algorithm Status */}
                    {activeView === 'algorithm' && (
                        <div className="algorithm-section animate-in zoom-in-95">
                            <div className="chart-card" style={{ borderTop: '4px solid var(--color-accent-gold)' }}>
                                <h3 className="flex items-center gap-2"><FaMicrochip color="var(--color-accent-gold)" /> Intelligence Engine Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                                    <div className="p-6 rounded-2xl border text-center" style={{ borderColor: 'var(--theme-border)' }}>
                                        <div className="text-xs font-bold uppercase text-gray-500 mb-2">Complexity Class</div>
                                        <div className="text-xl font-bold">O(N log N)</div>
                                        <div className="mt-2 flex items-center justify-center gap-2 text-green-500 text-sm font-bold">
                                            <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                                            STABLE
                                        </div>
                                    </div>
                                    <div className="p-6 rounded-2xl border text-center" style={{ borderColor: 'var(--theme-border)' }}>
                                        <div className="text-xs font-bold uppercase text-gray-500 mb-2">Convergence Time</div>
                                        <div className="text-xl font-bold">244ms</div>
                                        <div className="mt-2 text-gray-500 text-sm">Adaptive learning active</div>
                                    </div>
                                    <div className="p-6 rounded-2xl border text-center" style={{ borderColor: 'var(--theme-border)' }}>
                                        <div className="text-xs font-bold uppercase text-gray-500 mb-2">Optimization Depth</div>
                                        <div className="text-xl font-bold">Iter-10,000</div>
                                        <div className="mt-2 text-gray-500 text-sm">Deep heuristic search</div>
                                    </div>
                                </div>
                                <div className="mt-8 p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300">
                                    <h4 className="text-sm font-bold uppercase text-slate-500 mb-4 flex items-center gap-2"><FaRobot /> Optimization Heuristics</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['Genetic Algorithm', 'Simulated Annealing', 'Path-Finding Alpha', 'Multi-Agent Flow', 'Dynamic Re-routing'].map(h => (
                                            <span key={h} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300">
                                                {h}
                                            </span>
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
                    <h3>Fleet Network Intelligence</h3>
                    <p>Configure institutional parameters and run the analysis to generate optimized route maps and sustainability projections.</p>
                </div>
            )}

            <KPIDetailsModal
                {...modal}
                onClose={() => setModal({ ...modal, isOpen: false })}
            />
        </div>
    );
}

export default TransportPage;
