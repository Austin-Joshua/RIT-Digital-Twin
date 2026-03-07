import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ResponsiveContainer, BarChart, Bar, LineChart, Line,
    CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { FaBuilding, FaBolt, FaBus, FaLeaf, FaBullhorn, FaUsers, FaChartLine, FaBoxes, FaUserGraduate, FaSms, FaMobileAlt, FaCloudSun, FaHeart, FaMagic, FaBriefcase, FaShieldAlt, FaRobot } from 'react-icons/fa';
import { LuLayoutGrid, LuTrendingUp, LuBriefcase, LuFileCode, LuCalendar, LuBook, LuRefreshCcw, LuAward, LuSchool, LuLightbulb, LuBus, LuKey, LuMenu, LuMonitor, LuMoon, LuSun } from 'react-icons/lu';
import api from '../services/api';
import Skeleton from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import { useWebSocket } from '../context/WebSocketContext';
import InstitutionalAnalytics from '../components/intelligence/InstitutionalAnalytics';
import AIInsightPanel from '../components/intelligence/AIInsightPanel';
import Card from '../components/common/Card';
import { useNavigate } from 'react-router-dom';
import MiniCalendar from '../components/common/MiniCalendar';
import DetailedReportModal from '../components/common/DetailedReportModal';

const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const BossDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const { publish } = useWebSocket();
    const [selectedModal, setSelectedModal] = useState(null);

    // Broadcast State
    const [bTitle, setBTitle] = useState('');
    const [bMessage, setBMessage] = useState('');
    const [sendPush, setSendPush] = useState(true);
    const [sendSms, setSendSms] = useState(false);

    // Dynamic State for Connected KPIs
    const [totalPubs, setTotalPubs] = useState(14);
    const [totalCitations, setTotalCitations] = useState(128);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch admin stats. Using defaults.", error);
                setStats({
                    infrastructureUtil: 78.5, energyOptimization: 85.2, transportEfficiency: 92.0,
                    sustainabilityIndex: 88.7, totalBuildings: 12, totalClassrooms: 48,
                });
            } finally {
                setLoading(false);
            }
        };

        const loadResearchConnectivity = () => {
            const storedPubs = localStorage.getItem('connectivity_publications');
            if (storedPubs) {
                const currentPapers = JSON.parse(storedPubs);
                setTotalPubs(currentPapers.length);
                const citations = currentPapers.reduce((sum, p) => sum + (Number(p.citations) || 0), 0);
                setTotalCitations(citations);
            }
        };

        fetchStats();
        loadResearchConnectivity();

        // Listen for live updates from FacultyResearch
        window.addEventListener('storage', loadResearchConnectivity);
        return () => window.removeEventListener('storage', loadResearchConnectivity);
    }, []);

    const handleBroadcast = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/notifications/admin/broadcast?title=${encodeURIComponent(bTitle)}&message=${encodeURIComponent(bMessage)}&type=SYSTEM`);
        } catch (_err) {
            // Ignore for local simulator
        }

        // CONNECTIVITY: Save broadcast to local storage to trigger toast in other roles
        const broadcastPayload = {
            id: Date.now(),
            title: bTitle,
            message: bMessage,
            sender: 'ADMIN',
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('connectivity_broadcasts', JSON.stringify(broadcastPayload));
        window.dispatchEvent(new Event('storage')); // trigger sync locally as well

        if (sendPush) {
            publish('/app/broadcast', {
                sender: 'ADMIN',
                title: bTitle,
                message: bMessage,
                severity: 'HIGH'
            });
        }

        if (sendSms) {
            console.log(`[SMS Gateway Mock] Dispatched to Parent numbers: ${bMessage}`);
            addToast('SMS Alerts dispatched to 4,203 registered parents.', 'info');
        }

        addToast(sendPush ? 'Broadcast sent globally via App Push!' : 'Broadcast successful.', 'success');
        setBTitle('');
        setBMessage('');
    };

    const kpiCards = useMemo(() => [
        { title: 'Infrastructure Utilization', value: `${stats?.infrastructureUtil ?? 0}%`, icon: <FaBuilding />, color: 'green', class: 'green', link: '/boss/simulations/classroom' },
        { title: 'Energy Optimization', value: `${stats?.energyOptimization ?? 0}`, icon: <FaBolt />, color: 'yellow', class: 'yellow', link: '/boss/simulations/energy' },
        { title: 'Transport Efficiency', value: `${stats?.transportEfficiency ?? 0}%`, icon: <FaBus />, color: 'indigo', class: 'indigo', link: '/boss/simulations/transport' },
        { title: 'Total Publications', value: totalPubs, icon: <FaBuilding />, color: 'teal', class: 'teal', link: '/boss/analytics' },
        { title: 'Network Strength', value: totalCitations, icon: <FaChartLine />, color: 'purple', class: 'purple', link: '/boss/analytics' },
        { title: 'Alumni Network', value: `12.4k`, icon: <FaUserGraduate />, color: 'orange', class: 'orange', link: '/boss/management/alumni' },
        { title: 'HR & Recruitment', value: `Active`, icon: <FaBriefcase />, color: 'blue', class: 'blue', link: '/boss/management/hr-recruitment' },
        { title: 'Global System Audit', value: `Secure`, icon: <FaShieldAlt />, color: 'red', class: 'red', link: '/boss/management/audit' },
    ], [stats, totalPubs, totalCitations]);

    const chartData = useMemo(() => [
        { name: 'Mon', Energy: 4000, Transport: 2400 },
        { name: 'Tue', Energy: 3000, Transport: 1398 },
        { name: 'Wed', Energy: 2000, Transport: 9800 },
        { name: 'Thu', Energy: 2780, Transport: 3908 },
        { name: 'Fri', Energy: 1890, Transport: 4800 },
        { name: 'Sat', Energy: 2390, Transport: 3800 },
        { name: 'Sun', Energy: 3490, Transport: 4300 },
    ], []);

    if (loading) return (
        <div style={{ padding: '24px' }}>
            <Skeleton height="40px" width="300px" style={{ marginBottom: '20px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <Skeleton height="120px" /><Skeleton height="120px" /><Skeleton height="120px" /><Skeleton height="120px" />
            </div>
            <Skeleton height="400px" />
        </div>
    );

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* KPI Cards Row - Moved to Top per User Feedback */}
            {/* KPI Cards Row - Using stu-kpi-row classes for standardized styling and mobile optimization */}
            <div className="stu-kpi-row">
                {kpiCards.map((card, i) => (
                    <div key={i} className={`stu-kpi-card ${card.class}`} onClick={() => setSelectedModal(card)} style={{ cursor: 'pointer' }}>
                        <div className="kpi-main">
                            <div className="kpi-value">
                                {card.value}
                                {card.title === 'Global System Audit' && (
                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black bg-white/20 uppercase">Secure</span>
                                )}
                            </div>
                            <div className="kpi-label">{card.title}</div>
                        </div>
                        <div className="kpi-icon">{card.icon}</div>
                        <div className="kpi-more" onClick={(e) => { e.stopPropagation(); navigate(card.link); }}>View details →</div>
                    </div>
                ))}
            </div>

            {/* AI Strategic Advisory Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <AIInsightPanel role="BOSS" />
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                            <FaRobot className="text-blue-600 dark:text-blue-400" size={20} />
                        </div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">AI Strategic Advisor</h3>
                    </div>
                    <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-4 leading-relaxed relative z-10">
                        Real-time intelligence feed for campus operations and strategic growth mapping.
                    </p>
                    <div className="space-y-3 relative z-10">
                        <button className="w-full bg-white dark:bg-slate-800 p-3 text-left text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-black/5 dark:hover:bg-slate-800/50 shadow-sm transition-all flex items-center justify-between group text-slate-900 dark:text-white">
                            Verify Global Security Status
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></div>
                        </button>
                        <button className="w-full bg-white dark:bg-slate-800 p-3 text-left text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-black/5 dark:hover:bg-slate-800/50 shadow-sm transition-all flex items-center justify-between group text-slate-900 dark:text-white">
                            Run Faculty Load Simulation
                            <span className="text-[9px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full dark:bg-blue-900/30">AI READY</span>
                        </button>
                    </div>
                </div>
            </div>

            <DetailedReportModal
                isOpen={!!selectedModal}
                onClose={() => setSelectedModal(null)}
                title={selectedModal?.title || selectedModal?.label}
                value={selectedModal?.value}
                label={selectedModal?.title || selectedModal?.label}
                icon={selectedModal?.icon}
            />

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* AI Institutional Wisdom */}
                <div className="lg:col-span-1 space-y-6">
                    <AIInsightPanel role="ADMIN" />

                    {/* Live Sentiment & Infrastructure Forecast */}
                    <div className="stu-info-card cursor-pointer hover:shadow-lg transition-all" style={{ borderTopColor: '#f39c12' }} onClick={() => setSelectedModal({ title: 'AI Campus Sentiment', value: '85% Positive', icon: <FaHeart /> })}>
                        <div className="info-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaHeart color="#e84393" /> <span style={{ color: 'var(--theme-text)' }}>AI Campus Sentiment</span>
                        </div>
                        <div className="info-body p-4">
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-3xl font-black text-navy-900 dark:text-white">85%</span>
                                <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Excited / Stable</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-navy-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full" style={{ width: '85%' }}></div>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3 leading-tight italic">
                                "Pulse is high due to upcoming Sports Meet. Student satisfaction trending +4%."
                            </p>
                        </div>
                    </div>

                    <div className="bg-navy-900 text-white p-5 rounded-2xl shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all" onClick={() => setSelectedModal({ title: 'Infrastructure Forecast', value: 'Peak load expected in Block D', icon: <FaBolt /> })}>
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                            <FaBolt className="text-4xl text-yellow-400" />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase mb-3">
                            <FaMagic /> Infra Forecast
                        </div>
                        <p className="text-sm font-medium leading-relaxed mb-4">
                            Peak load expected in <b>Block D</b> at 3 PM. Suggest pre-cooling Labs 401-408 for 12% energy saving.
                        </p>
                        <button className="w-full py-2 bg-yellow-400 text-navy-900 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-yellow-300 transition-colors">
                            Apply Automation
                        </button>
                    </div>
                </div>

                {/* Central Analytics Column */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Analytics Chart */}
                    <div className="stu-info-card">
                        <div className="info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaChartLine color="#0B2C6B" />
                            <span>Weekly Simulation Analytics</span>
                        </div>
                        <div className="info-body">
                            <div style={{ height: '300px', padding: '10px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="Energy" stroke="#0B2C6B" strokeWidth={2} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="Transport" stroke="#f39c12" strokeWidth={2} dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Broadcast Panel */}
                <div className="lg:col-span-1">
                    {/* Broadcast Panel */}
                    <div className="stu-info-card" style={{ borderTopColor: 'var(--ims-teal)' }}>
                        <div className="info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaBullhorn color="var(--ims-teal)" />
                            <span style={{ color: 'var(--theme-text)' }}>Global Broadcast</span>
                        </div>
                        <div className="info-body">
                            <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <input
                                    type="text"
                                    placeholder="Broadcast Title"
                                    value={bTitle}
                                    onChange={e => setBTitle(e.target.value)}
                                    required
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg-muted)', color: 'var(--theme-text)', fontSize: '14px' }}
                                />
                                <textarea
                                    placeholder="Type your global message here..."
                                    value={bMessage}
                                    onChange={e => setBMessage(e.target.value)}
                                    required
                                    rows="3"
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg-muted)', color: 'var(--theme-text)', fontSize: '14px', resize: 'none' }}
                                />

                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '5px' }}>
                                    <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={sendPush} onChange={e => setSendPush(e.target.checked)} />
                                        <FaMobileAlt color="#3c8dbc" /> App Push Notification
                                    </label>
                                    <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={sendSms} onChange={e => setSendSms(e.target.checked)} />
                                        <FaSms color="#f39c12" /> SMS Alert (Twilio/AWS route)
                                    </label>
                                </div>

                                <button className="table-btn primary" type="submit" style={{ width: '100%', padding: '10px', background: '#3c8dbc', borderColor: '#3c8dbc', marginTop: '5px' }}>
                                    Dispatch Communication
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Institutional Analytics Section */}
            <div className="stu-info-card" style={{ borderTopColor: '#00a65a' }}>
                <div className="info-header">
                    Institutional Intelligence Dashboard
                </div>
                <div className="info-body">
                    <InstitutionalAnalytics />
                </div>
            </div>

            {/* Academic Calendar */}
            <MiniCalendar />

        </motion.div>
    );
};

export default BossDashboard;
