import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { FaGlobe, FaCity, FaPlus, FaCheckCircle, FaLaptopCode, FaCogs, FaTimes, FaBrain, FaSignal } from 'react-icons/fa';
import AIInsightPanel from '../components/intelligence/AIInsightPanel';

const DetailModal = ({ detail, onClose }) => {
    if (!detail) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    style={{
                        background: 'var(--theme-card-bg, #fff)',
                        color: 'var(--theme-text, #333)',
                        padding: '32px',
                        borderRadius: '16px',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{detail.title}</h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <FaTimes size={20} color="var(--theme-text-muted, #64748b)" />
                        </button>
                    </div>
                    <div style={{ lineHeight: '1.6', color: 'var(--theme-text-muted, #666)' }}>
                        <p>{detail.content}</p>
                        {detail.data && (
                            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--theme-bg, #f8fafc)', borderRadius: '8px' }}>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                    {JSON.stringify(detail.data, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const { addToast } = useToast();

    const chartData = [
        { name: 'Mon', Energy: 4000, Transport: 2400, AI: 2400 },
        { name: 'Tue', Energy: 3000, Transport: 1398, AI: 2210 },
        { name: 'Wed', Energy: 2000, Transport: 9800, AI: 2290 },
        { name: 'Thu', Energy: 2780, Transport: 3908, AI: 2000 },
        { name: 'Fri', Energy: 1890, Transport: 4800, AI: 2181 },
    ];

    useEffect(() => {
        // Force loading for transition feel
        setTimeout(() => {
            setStats({
                infrastructureUtil: 84.2,
                energyEfficiency: 91.5,
                transportPunctuality: 98.7,
                securityStatus: 'CRITICAL_OVERSIGHT_ACTIVE',
                totalNodes: 12,
                activeUsers: 4203
            });
            setLoading(false);
        }, 1200);
    }, []);

    const handleAction = (title, content) => {
        setSelectedDetail({ title, content });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-navy-950">
            <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-gold-500 font-black uppercase tracking-widest text-sm animate-pulse">Initializing God Mode Protocol...</div>
        </div>
    );

    return (
        <div className="p-6 space-y-6 animate-in fade-in zoom-in-95 duration-700 bg-gray-50 dark:bg-navy-950 min-h-screen">
            {selectedDetail && <DetailModal detail={selectedDetail} onClose={() => setSelectedDetail(null)} />}

            {/* Header / Command Center */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-navy-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <FaShieldAlt size={200} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black flex items-center gap-3">
                        <FaGlobe className="text-gold-500 animate-spin-slow" /> RIT Command Center
                    </h1>
                    <p className="text-blue-200 mt-2 font-medium opacity-80 uppercase tracking-widest text-xs">Global Digital Twin Oversight • Root Authority</p>
                </div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="text-right">
                        <div className="text-xs font-black text-gold-500 uppercase">Security Protocol</div>
                        <div className="text-sm font-bold text-white flex items-center justify-end gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> ENCRYPTED_LEVEL_7
                        </div>
                    </div>
                    <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all border border-white/10">
                        <FaCogs className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Global Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Campus Nodes', value: stats.totalNodes, icon: <FaCity />, color: 'blue' },
                    { label: 'Energy Optimization', value: `${stats.energyEfficiency}%`, icon: <FaBolt />, color: 'yellow' },
                    { label: 'Transport Punctuality', value: `${stats.transportPunctuality}%`, icon: <FaBus />, color: 'indigo' },
                    { label: 'Global Security Status', value: 'SECURE', icon: <FaShieldAlt />, color: 'green' }
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-700 hover:shadow-xl transition-all group cursor-pointer" onClick={() => handleAction(kpi.label, `Detailed historical analytics for ${kpi.label} indicate an optimal performance trend.`)}>
                        <div className={`p-3 rounded-2xl bg-${kpi.color}-50 dark:bg-${kpi.color}-900/20 text-${kpi.color}-600 dark:text-${kpi.color}-400 w-fit mb-4 group-hover:scale-110 transition-transform`}>
                            {kpi.icon}
                        </div>
                        <div className="text-[10px] font-black text-gray-400 uppercase mb-1">{kpi.label}</div>
                        <div className="text-2xl font-black text-navy-900 dark:text-white">{kpi.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI & Infrastructure Wisdom */}
                <div className="lg:col-span-1 space-y-6">
                    <AIInsightPanel role="SUPER_ADMIN" />

                    <div className="bg-white dark:bg-navy-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-navy-700">
                        <h4 className="font-black text-navy-900 dark:text-white flex items-center gap-2 mb-6">
                            <FaSignal className="text-blue-500" /> System Load Pulse
                        </h4>
                        <div className="h-40 w-full flex items-end gap-2">
                            {[40, 70, 45, 90, 65, 80, 50, 60].map((h, i) => (
                                <div key={i} className="flex-1 bg-navy-900 dark:bg-gold-500/20 rounded-t-lg transition-all hover:bg-gold-500 cursor-help" style={{ height: `${h}%` }} title={`Load: ${h}%`} />
                            ))}
                        </div>
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-navy-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-navy-700">
                            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Infrastructure Load</div>
                            <div className="text-sm font-bold text-navy-900 dark:text-white">All 12 Campus Nodes Operational</div>
                        </div>
                    </div>
                </div>

                {/* Central Management Hub */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-navy-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-navy-700">
                        <div className="flex justify-between items-center mb-8">
                            <h4 className="text-xl font-black text-navy-900 dark:text-white flex items-center gap-3">
                                <FaLaptopCode className="text-blue-500" /> Global Governance Analytics
                            </h4>
                            <div className="flex gap-2">
                                <span className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 text-xs font-black">7D</span>
                                <span className="p-2 text-gray-400 text-xs font-black">30D</span>
                            </div>
                        </div>
                        <div className="h-64 w-full">
                            <div className="h-full w-full bg-gray-50 dark:bg-navy-900/30 rounded-3xl flex items-center justify-center text-gray-400 text-xs italic border border-dashed border-gray-200 dark:border-navy-700">
                                [ Interactive Performance Area - Real-time Data Streaming ]
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6 mt-8">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl">
                                <div className="text-[10px] font-black text-blue-600 uppercase mb-1">Uptime</div>
                                <div className="text-lg font-black text-navy-900 dark:text-white">99.99%</div>
                            </div>
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl">
                                <div className="text-[10px] font-black text-emerald-600 uppercase mb-1">Safety</div>
                                <div className="text-lg font-black text-navy-900 dark:text-white">100%</div>
                            </div>
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl">
                                <div className="text-[10px] font-black text-amber-600 uppercase mb-1">Complaints</div>
                                <div className="text-lg font-black text-navy-900 dark:text-white">0</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Control Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-navy-800 p-8 rounded-3xl border border-gray-100 dark:border-navy-700 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <FaUsers size={80} />
                    </div>
                    <h4 className="text-xl font-black text-navy-900 dark:text-white mb-6">User Governance</h4>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">Manage access controls for 4,203 registered entities including Students, Faculty, and External Partners.</p>
                    <div className="flex gap-4">
                        <button className="flex-1 bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:shadow-xl transition-all">Audit Users</button>
                        <button className="flex-1 bg-gray-100 dark:bg-navy-900 text-gray-600 dark:text-white py-3 rounded-2xl font-black uppercase text-xs tracking-widest border border-gray-200 dark:border-navy-700">Role Protocols</button>
                    </div>
                </div>

                <div className="bg-white dark:bg-navy-800 p-8 rounded-3xl border border-gray-100 dark:border-navy-700 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <FaBullhorn size={80} />
                    </div>
                    <h4 className="text-xl font-black text-navy-900 dark:text-white mb-6">Omni-Broadcast</h4>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">Dispatch critical alerts via App Push, SMS, and Email gateways to the entire institution instantly.</p>
                    <div className="flex gap-4">
                        <button className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:shadow-xl transition-all" onClick={() => navigate('/analytics')}>Open Dispatcher</button>
                        <button className="flex-1 bg-gray-100 dark:bg-navy-900 text-gray-600 dark:text-white py-3 rounded-2xl font-black uppercase text-xs tracking-widest border border-gray-200 dark:border-navy-700">View Logs</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
