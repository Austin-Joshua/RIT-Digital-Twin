import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import { FaLeaf, FaSolarPanel, FaWater, FaRecycle, FaTree, FaChartLine } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const SustainabilityDashboard = () => {
    const [remote, setRemote] = useState(null);

    const fallbackCarbonData = [
        { month: 'Jan', emitted: 400, offset: 240 },
        { month: 'Feb', emitted: 300, offset: 139 },
        { month: 'Mar', emitted: 200, offset: 380 },
        { month: 'Apr', emitted: 278, offset: 390 },
        { month: 'May', emitted: 189, offset: 480 },
        { month: 'Jun', emitted: 239, offset: 380 },
        { month: 'Jul', emitted: 349, offset: 430 },
    ];

    const fallbackKpis = [
        { title: 'Carbon Footprint', value: '42.5 tCO2e', trend: '-12% vs Last Yr', color: '#10b981', icon: <FaLeaf size={24} color="#059669" />, bg: '#d1fae5' },
        { title: 'Renewable Power', value: '35%', trend: '+5% Solar Added', color: '#f59e0b', icon: <FaSolarPanel size={24} color="#d97706" />, bg: '#fef3c7' },
        { title: 'Water Recycled', value: '1.2M Ltrs', trend: 'STP Operating @ 90%', color: '#3b82f6', icon: <FaWater size={24} color="#2563eb" />, bg: '#dbeafe' },
        { title: 'Waste Diverted', value: '88%', trend: 'To compost & recycle', color: '#8b5cf6', icon: <FaRecycle size={24} color="#7c3aed" />, bg: '#ede9fe' },
    ];

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/analytics/sustainability');
                setRemote(res.data);
            } catch (_err) {
                setRemote(null);
            }
        };
        load();
    }, []);

    const kpis = (remote?.kpis || fallbackKpis).map((kpi, idx) => ({
        ...kpi,
        color: fallbackKpis[idx]?.color || '#10b981',
        bg: fallbackKpis[idx]?.bg || '#d1fae5',
        icon: fallbackKpis[idx]?.icon || <FaLeaf size={24} color="#059669" />
    }));
    const carbonData = remote?.carbonData || fallbackCarbonData;

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#0B2C6B', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaTree color="#10b981" /> Sustainability & Env. Impact
                    </h2>
                    <div className="breadcrumb-bar" style={{ marginTop: '8px' }}>
                        <span className="breadcrumb-item">Campus Operations</span>
                        <span className="breadcrumb-item active" style={{ marginLeft: '8px' }}>/ Sustainability</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Generate ESG Report
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {kpis.map((kpi, idx) => (
                    <Card key={idx} style={{ padding: '20px', borderLeft: `4px solid ${kpi.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>{kpi.title}</div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>{kpi.value}</div>
                                <div style={{ fontSize: '13px', color: kpi.color, fontWeight: '500' }}>{kpi.trend}</div>
                            </div>
                            <div style={{ background: kpi.bg, padding: '12px', borderRadius: '50%' }}>
                                {kpi.icon}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <Card style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaChartLine color="#0B2C6B" /> Carbon Emissions vs Offset (tons)
                    </h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                            <AreaChart data={carbonData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEmitted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorOffset" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#8884d8" />
                                <YAxis stroke="#8884d8" />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="emitted" name="Total Emitted" stroke="#ef4444" fillOpacity={1} fill="url(#colorEmitted)" />
                                <Area type="monotone" dataKey="offset" name="Total Offset" stroke="#10b981" fillOpacity={1} fill="url(#colorOffset)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card style={{ padding: '24px', background: '#0f172a', color: 'white' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Sustainable Development Goals (SDG)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                                <span>SDG 7: Affordable & Clean Energy</span>
                                <span style={{ color: '#fcd34d' }}>In Progress (70%)</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: '70%', height: '100%', background: '#fbbf24' }}></div>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                                <span>SDG 6: Clean Water & Sanitation</span>
                                <span style={{ color: '#60a5fa' }}>Achieved (95%)</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: '95%', height: '100%', background: '#3b82f6' }}></div>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                                <span>SDG 12: Responsible Consumption</span>
                                <span style={{ color: '#34d399' }}>Achieved (88%)</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: '88%', height: '100%', background: '#10b981' }}></div>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                                <span>SDG 13: Climate Action</span>
                                <span style={{ color: '#f87171' }}>Needs Attention (45%)</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: '45%', height: '100%', background: '#ef4444' }}></div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SustainabilityDashboard;
