import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FaBuilding, FaBolt, FaBus, FaLeaf } from 'react-icons/fa';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                setStats({
                    infrastructureUtil: 78.5,
                    energyOptimization: 85.2,
                    transportEfficiency: 92.0,
                    sustainabilityIndex: 88.7,
                    totalBuildings: 12,
                    totalClassrooms: 48
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="text-center p-10 text-navy-900">Loading Intelligence Platform...</div>;

    const kpiCards = [
        { title: 'Infrastructure Utilization', value: `${stats.infrastructureUtil}%`, icon: <FaBuilding />, borderTop: 'border-t-4 border-blue-500' },
        { title: 'Energy Optimization', value: `${stats.energyOptimization}`, icon: <FaBolt />, borderTop: 'border-t-4 border-gold-500' },
        { title: 'Transport Efficiency', value: `${stats.transportEfficiency}%`, icon: <FaBus />, borderTop: 'border-t-4 border-green-500' },
        { title: 'Sustainability Index', value: `${stats.sustainabilityIndex}`, icon: <FaLeaf />, borderTop: 'border-t-4 border-teal-500' },
    ];

    const data = [
        { name: 'Mon', Energy: 4000, Transport: 2400 },
        { name: 'Tue', Energy: 3000, Transport: 1398 },
        { name: 'Wed', Energy: 2000, Transport: 9800 },
        { name: 'Thu', Energy: 2780, Transport: 3908 },
        { name: 'Fri', Energy: 1890, Transport: 4800 },
        { name: 'Sat', Energy: 2390, Transport: 3800 },
        { name: 'Sun', Energy: 3490, Transport: 4300 },
    ];

    return (
        <div>
            <h1 className="page-header">Smart Campus Intelligence Dashboard</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {kpiCards.map((card, index) => (
                    <div key={index} className={`card relative overflow-hidden transition hover:shadow-md ${card.borderTop}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[14px] text-gray-500 font-medium mb-1">{card.title}</p>
                                <h3 className="text-[28px] font-bold text-navy-900 leading-tight">{card.value}</h3>
                            </div>
                            <div className="p-2 bg-gray-50 rounded-lg text-gold-500 text-xl">
                                {card.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="section-header !mb-6 !text-[18px]">Weekly Consumption Trends</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" tick={{ fill: '#374151', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#374151', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderColor: '#E5E7EB', borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#1F2937' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="Energy" fill="#0B2C6B" name="Energy Usage (kWh)" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="Transport" fill="#D4AF37" name="Transport load" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h3 className="section-header !mb-6 !text-[18px]">Simulation Analytics</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" tick={{ fill: '#374151', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#374151', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderColor: '#E5E7EB', borderRadius: '4px' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line type="monotone" dataKey="Energy" stroke="#0B2C6B" strokeWidth={2} dot={{ r: 4, fill: '#0B2C6B' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="Transport" stroke="#D4AF37" strokeWidth={2} dot={{ r: 4, fill: '#D4AF37' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
