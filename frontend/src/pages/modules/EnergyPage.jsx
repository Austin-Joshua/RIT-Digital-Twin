import { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import api from '../../services/api';
import './Energy.css';

const COLORS = ['#003366', '#c9a227', '#004d99', '#0066cc', '#e6c84d', '#336699', '#1a8a5c', '#cc6600', '#8b4513', '#4a90d9'];

function EnergyPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);
    const [activeView, setActiveView] = useState('overview');
    const [params, setParams] = useState({
        forecastDays: 30,
        optimizationTarget: 15,
        solarCapacityKw: 100,
        costPerKwh: 8,
        includeHvac: true,
        includeLighting: true
    });

    const runSimulation = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/api/simulate/energy', params);
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'The simulation could not be completed. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/api/analytics/energy');
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to retrieve analytics data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const formatNum = (n) => {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n?.toFixed(1) ?? '0';
    };

    const formatCurrency = (n) => '₹' + formatNum(n);

    return (
        <div className="energy-page">
            {/* Header */}
            <div className="module-header energy-header">
                <div className="module-header-content">
                    <div className="module-icon energy-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                    </div>
                    <div>
                        <h1>Energy Consumption Simulation</h1>
                        <p>Predict, optimize, and plan sustainable energy for the campus</p>
                    </div>
                </div>
                <div className="module-stats">
                    <div className="stat-chip"><span className="stat-icon">⚡</span><span>10 Buildings</span></div>
                    <div className="stat-chip"><span className="stat-icon">☀️</span><span>Solar ROI</span></div>
                    <div className="stat-chip"><span className="stat-icon">🌱</span><span>15% Target</span></div>
                </div>
            </div>

            {/* Controls */}
            <div className="energy-controls">
                <div className="control-panel">
                    <h3>Simulation Parameters</h3>
                    <div className="param-grid">
                        <div className="param-group">
                            <label>Forecast Days</label>
                            <input type="number" value={params.forecastDays} min={7} max={365}
                                onChange={e => setParams(p => ({ ...p, forecastDays: +e.target.value }))} />
                        </div>
                        <div className="param-group">
                            <label>Optimization Target (%)</label>
                            <input type="number" value={params.optimizationTarget} min={5} max={50}
                                onChange={e => setParams(p => ({ ...p, optimizationTarget: +e.target.value }))} />
                        </div>
                        <div className="param-group">
                            <label>Solar Capacity (kW)</label>
                            <input type="number" value={params.solarCapacityKw} min={10} max={1000}
                                onChange={e => setParams(p => ({ ...p, solarCapacityKw: +e.target.value }))} />
                        </div>
                        <div className="param-group">
                            <label>Cost per kWh (₹)</label>
                            <input type="number" value={params.costPerKwh} step={0.5} min={1} max={20}
                                onChange={e => setParams(p => ({ ...p, costPerKwh: +e.target.value }))} />
                        </div>
                        <div className="param-toggle">
                            <label>
                                <input type="checkbox" checked={params.includeHvac}
                                    onChange={e => setParams(p => ({ ...p, includeHvac: e.target.checked }))} />
                                <span>HVAC Optimization</span>
                            </label>
                        </div>
                        <div className="param-toggle">
                            <label>
                                <input type="checkbox" checked={params.includeLighting}
                                    onChange={e => setParams(p => ({ ...p, includeLighting: e.target.checked }))} />
                                <span>Lighting Optimization</span>
                            </label>
                        </div>
                    </div>
                    <div className="control-actions">
                        <button className="btn-primary" onClick={runSimulation} disabled={loading}>
                            {loading ? <><span className="spinner"></span>Simulating...</> :
                                <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polygon points="5 3 19 12 5 21 5 3" /></svg>Run Simulation</>}
                        </button>
                        <button className="btn-secondary" onClick={loadAnalytics} disabled={loading}>
                            📊 Load Analytics
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="form-error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>{error}</div>
            )}

            {/* Results */}
            {data && (
                <>
                    {/* View Toggle */}
                    <div className="tab-nav">
                        {['overview', 'trend', 'comparison', 'solar', 'buildings', 'sustainability'].map(v => (
                            <button key={v} className={`tab-btn ${activeView === v ? 'active' : ''}`}
                                onClick={() => setActiveView(v)}>
                                {v.charAt(0).toUpperCase() + v.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Overview */}
                    {activeView === 'overview' && (
                        <div className="energy-overview">
                            <div className="overview-cards">
                                <div className="e-card">
                                    <div className="e-card-icon">⚡</div>
                                    <div className="e-card-value">{formatNum(data.currentUsage?.totalConsumptionKwh)} kWh</div>
                                    <div className="e-card-label">Total Consumption ({params.forecastDays}d)</div>
                                </div>
                                <div className="e-card highlight-gold">
                                    <div className="e-card-icon">💰</div>
                                    <div className="e-card-value">{formatCurrency(data.comparison?.savingsCostInr)}</div>
                                    <div className="e-card-label">Projected Monthly Savings</div>
                                </div>
                                <div className="e-card">
                                    <div className="e-card-icon">☀️</div>
                                    <div className="e-card-value">{formatNum(data.currentUsage?.solarGenerationKwh)} kWh</div>
                                    <div className="e-card-label">Solar Generation</div>
                                </div>
                                <div className="e-card highlight-green">
                                    <div className="e-card-icon">🌱</div>
                                    <div className="e-card-value">{data.sustainability?.grade}</div>
                                    <div className="e-card-label">Sustainability Grade</div>
                                </div>
                                <div className="e-card">
                                    <div className="e-card-icon">📉</div>
                                    <div className="e-card-value">{data.comparison?.savingsPercent}%</div>
                                    <div className="e-card-label">Energy Reduction</div>
                                </div>
                                <div className="e-card">
                                    <div className="e-card-icon">🔋</div>
                                    <div className="e-card-value">{formatNum(data.currentUsage?.peakDemandKw)} kW</div>
                                    <div className="e-card-label">Peak Demand</div>
                                </div>
                            </div>
                            {data.summary && <div className="results-insight"><p>{data.summary}</p></div>}
                        </div>
                    )}

                    {/* Energy Trend Chart */}
                    {activeView === 'trend' && data.hourlyTrend && (
                        <div className="chart-container">
                            <div className="chart-card">
                                <h3>24-Hour Energy Profile</h3>
                                <p className="chart-subtitle">Current vs Optimized with Solar Generation</p>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={data.hourlyTrend} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            formatter={(value, name) => [`${value} kWh`, name]}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="currentKwh" name="Current Usage" stroke="#003366" strokeWidth={3} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="optimizedKwh" name="Optimized" stroke="#c9a227" strokeWidth={3} dot={{ r: 4 }} strokeDasharray="8 4" />
                                        <Line type="monotone" dataKey="solarKwh" name="Solar Generation" stroke="#1a8a5c" strokeWidth={2} dot={{ r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Before vs After Comparison */}
                    {activeView === 'comparison' && data.comparison && (
                        <div className="comparison-section">
                            <div className="comparison-header">
                                <h3>Before vs After Optimization</h3>
                                <p>Impact of {params.optimizationTarget}% energy optimization target</p>
                            </div>
                            <div className="comparison-grid">
                                <div className="comp-card before">
                                    <div className="comp-badge">CURRENT</div>
                                    <div className="comp-value">{formatNum(data.comparison.currentMonthlyKwh)} kWh</div>
                                    <div className="comp-cost">{formatCurrency(data.comparison.currentMonthlyCostInr)}/month</div>
                                </div>
                                <div className="comp-arrow">
                                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#c9a227" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                    </svg>
                                    <span className="savings-badge">-{data.comparison.savingsPercent}%</span>
                                </div>
                                <div className="comp-card after">
                                    <div className="comp-badge">OPTIMIZED</div>
                                    <div className="comp-value">{formatNum(data.comparison.optimizedMonthlyKwh)} kWh</div>
                                    <div className="comp-cost">{formatCurrency(data.comparison.optimizedMonthlyCostInr)}/month</div>
                                </div>
                            </div>
                            <div className="savings-summary">
                                <div className="saving-item">
                                    <span>Monthly Energy Savings</span>
                                    <strong>{formatNum(data.comparison.savingsKwh)} kWh</strong>
                                </div>
                                <div className="saving-item">
                                    <span>Monthly Cost Savings</span>
                                    <strong>{formatCurrency(data.comparison.savingsCostInr)}</strong>
                                </div>
                                <div className="saving-item">
                                    <span>HVAC Reduction</span>
                                    <strong>{data.comparison.hvacReductionPercent}%</strong>
                                </div>
                                <div className="saving-item">
                                    <span>Lighting Reduction</span>
                                    <strong>{data.comparison.lightingReductionPercent}%</strong>
                                </div>
                            </div>
                            {/* Bar Chart comparing before/after */}
                            <div className="chart-card" style={{ marginTop: 24 }}>
                                <h3>Monthly Consumption Breakdown</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={[
                                        { name: 'HVAC', current: data.currentUsage?.hvacKwh, optimized: data.optimizedUsage?.hvacKwh },
                                        { name: 'Lighting', current: data.currentUsage?.lightingKwh, optimized: data.optimizedUsage?.lightingKwh },
                                        { name: 'Equipment', current: data.currentUsage?.equipmentKwh, optimized: data.optimizedUsage?.equipmentKwh },
                                    ]} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="name" />
                                        <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip formatter={(v) => `${formatNum(v)} kWh`} />
                                        <Legend />
                                        <Bar dataKey="current" name="Current" fill="#003366" radius={[6, 6, 0, 0]} />
                                        <Bar dataKey="optimized" name="Optimized" fill="#c9a227" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Solar ROI */}
                    {activeView === 'solar' && data.solarAnalysis && (
                        <div className="solar-section">
                            <div className="chart-card">
                                <h3>☀️ Solar ROI Analysis</h3>
                                <p className="chart-subtitle">{data.solarAnalysis.installedCapacityKw} kW installation</p>
                                <div className="solar-grid">
                                    <div className="solar-metric">
                                        <div className="sm-value">{formatNum(data.solarAnalysis.annualGenerationKwh)} kWh</div>
                                        <div className="sm-label">Annual Generation</div>
                                    </div>
                                    <div className="solar-metric gold">
                                        <div className="sm-value">{formatCurrency(data.solarAnalysis.annualSavingsInr)}</div>
                                        <div className="sm-label">Annual Savings</div>
                                    </div>
                                    <div className="solar-metric">
                                        <div className="sm-value">{formatCurrency(data.solarAnalysis.installationCostInr)}</div>
                                        <div className="sm-label">Installation Cost</div>
                                    </div>
                                    <div className="solar-metric highlight">
                                        <div className="sm-value">{data.solarAnalysis.paybackPeriodYears} yrs</div>
                                        <div className="sm-label">Payback Period</div>
                                    </div>
                                    <div className="solar-metric">
                                        <div className="sm-value">{formatCurrency(data.solarAnalysis.twentyYearSavingsInr)}</div>
                                        <div className="sm-label">20-Year Net Savings</div>
                                    </div>
                                    <div className="solar-metric green">
                                        <div className="sm-value">{data.solarAnalysis.carbonOffsetTonsPerYear} T</div>
                                        <div className="sm-label">CO₂ Offset/Year</div>
                                    </div>
                                </div>
                                <div className="roi-bar">
                                    <div className="roi-label">ROI: {data.solarAnalysis.roiPercent}%</div>
                                    <div className="roi-track">
                                        <div className="roi-fill" style={{ width: `${Math.min(data.solarAnalysis.roiPercent, 100)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Buildings Breakdown */}
                    {activeView === 'buildings' && data.buildingBreakdown && (
                        <div className="buildings-section">
                            <div className="chart-card">
                                <h3>Building-wise Energy Distribution</h3>
                                <div className="buildings-chart-grid">
                                    <ResponsiveContainer width="100%" height={350}>
                                        <PieChart>
                                            <Pie data={data.buildingBreakdown} dataKey="consumptionKwh" nameKey="buildingName"
                                                cx="50%" cy="50%" outerRadius={130} label={({ buildingName, percentage }) => `${buildingName} (${percentage}%)`}>
                                                {data.buildingBreakdown.map((_, i) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(v) => `${formatNum(v)} kWh`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="building-list">
                                        {data.buildingBreakdown.map((b, i) => (
                                            <div key={i} className="building-row">
                                                <div className="building-color" style={{ background: COLORS[i % COLORS.length] }}></div>
                                                <div className="building-info">
                                                    <span className="building-name">{b.buildingName}</span>
                                                    <span className="building-kwh">{formatNum(b.consumptionKwh)} kWh ({b.percentage}%)</span>
                                                </div>
                                                <div className="building-bar-wrap">
                                                    <div className="building-bar" style={{ width: `${b.percentage * 5}%`, background: COLORS[i % COLORS.length] }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sustainability Scorecard */}
                    {activeView === 'sustainability' && data.sustainability && (
                        <div className="sustainability-section">
                            <div className="score-hero">
                                <div className={`score-circle ${data.sustainability.grade.startsWith('A') ? 'grade-a' : data.sustainability.grade.startsWith('B') ? 'grade-b' : 'grade-c'}`}>
                                    <div className="score-grade">{data.sustainability.grade}</div>
                                    <div className="score-number">{data.sustainability.sustainabilityScore}</div>
                                    <div className="score-of">/100</div>
                                </div>
                                <div className="score-meta">
                                    <h3>Sustainability Score</h3>
                                    <p>Campus environmental performance index</p>
                                </div>
                            </div>
                            <div className="sustainability-metrics">
                                <div className="sust-card">
                                    <span className="sust-icon">🏭</span>
                                    <div className="sust-value">{data.sustainability.carbonEmissionTons} T</div>
                                    <div className="sust-label">Carbon Emissions</div>
                                </div>
                                <div className="sust-card green">
                                    <span className="sust-icon">🌿</span>
                                    <div className="sust-value">{data.sustainability.carbonOffsetTons} T</div>
                                    <div className="sust-label">Carbon Offset</div>
                                </div>
                                <div className="sust-card">
                                    <span className="sust-icon">🔆</span>
                                    <div className="sust-value">{data.sustainability.renewablePercent}%</div>
                                    <div className="sust-label">Renewable Mix</div>
                                </div>
                                <div className="sust-card">
                                    <span className="sust-icon">⚙️</span>
                                    <div className="sust-value">{data.sustainability.efficiencyRating}</div>
                                    <div className="sust-label">Efficiency Rating</div>
                                </div>
                            </div>
                            {data.sustainability.recommendations?.length > 0 && (
                                <div className="recommendations-panel">
                                    <h3>💡 Recommendations</h3>
                                    <ul>
                                        {data.sustainability.recommendations.map((r, i) => (
                                            <li key={i}>{r}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {!data && !loading && !error && (
                <div className="empty-state">
                    <div className="empty-icon">⚡</div>
                    <h3>Run Energy Simulation</h3>
                    <p>Configure parameters above and click "Run Simulation" to analyze campus energy consumption, optimization opportunities, and solar ROI.</p>
                </div>
            )}
        </div>
    );
}

export default EnergyPage;
