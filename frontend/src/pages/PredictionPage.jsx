import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const PredictionPage = () => {
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [metric, setMetric] = useState('STUDENT_ADMISSION');

    useEffect(() => {
        const fetchForecast = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/predictions/forecast?metric=${metric}&months=6`);
                setForecast(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchForecast();
    }, [metric]);

    if (loading) return <div>Analyzing trends...</div>;

    return (
        <div className="prediction-page">
            <div className="prediction-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>Predictive Intelligence</h1>
                    <p style={{ color: '#64748b' }}>Regression-based demand forecasting and resource projections</p>
                </div>
                <select
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#0B2C6B', fontWeight: '600' }}
                >
                    <option value="STUDENT_ADMISSION">Student Admission Trends</option>
                    <option value="ENERGY_DEMAND">Energy Demand Forecast</option>
                    <option value="TRAFFIC_CONGESTION">Traffic Congestion Index</option>
                    <option value="SPACE_UTILIZATION">Space Utilization Projections</option>
                </select>
            </div>

            <div className="prediction-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                {/* Forecast Chart */}
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '24px' }}>6-Month Forecast Trend</h2>
                    <div style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecast?.forecastData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0B2C6B" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0B2C6B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="monthIndex" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="value" stroke="#0B2C6B" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                                <Line type="monotone" dataKey="upperBound" stroke="#94a3b8" strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="lowerBound" stroke="#94a3b8" strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recommendations & Insights */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Growth Card */}
                    <div style={{ backgroundColor: '#0B2C6B', color: 'white', padding: '24px', borderRadius: '12px' }}>
                        <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Predicted Growth Rate</p>
                        <h3 style={{ fontSize: '2rem', fontWeight: '700' }}>+{forecast?.predictedGrowthRate}%</h3>
                        <p style={{ fontSize: '0.875rem', marginTop: '8px', color: '#d4af37' }}>↑ Above institutional average</p>
                    </div>

                    {/* Recommendations List */}
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', flex: 1 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>AI Recommendations</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {forecast?.recommendations.map((rec, i) => (
                                <div key={i} style={{ display: 'flex', gap: '12px' }}>
                                    <span style={{ color: '#d4af37' }}>●</span>
                                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.4' }}>{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PredictionPage;
