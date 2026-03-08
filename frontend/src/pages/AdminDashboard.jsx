import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ResponsiveContainer, BarChart, Bar, LineChart, Line,
    CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { FaBuilding, FaBolt, FaBus, FaLeaf, FaBullhorn, FaUsers, FaChartLine, FaBoxes, FaUserGraduate, FaSms, FaMobileAlt, FaCloudSun, FaHeart, FaMagic } from 'react-icons/fa';
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

const AdminDashboard = () => {
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
        { title: 'Infrastructure Utilization', value: `${stats?.infrastructureUtil ?? 0}%`, icon: <FaBuilding />, color: 'green', class: 'green', link: '/simulations/classroom' },
        { title: 'Energy Optimization', value: `${stats?.energyOptimization ?? 0}`, icon: <FaBolt />, color: 'yellow', class: 'yellow', link: '/simulations/energy' },
        { title: 'Transport Efficiency', value: `${stats?.transportEfficiency ?? 0}%`, icon: <FaBus />, color: 'indigo', class: 'indigo', link: '/transport' },
        { title: 'Total Publications', value: totalPubs, icon: <FaBuilding />, color: 'teal', class: 'teal', link: '/academics/research' },
        { title: 'Total Citations', value: totalCitations, icon: <FaChartLine />, color: 'purple', class: 'purple', link: '/academics/research' },
        { title: 'Alumni Network', value: `12.4k`, icon: <FaUserGraduate />, color: 'orange', class: 'orange', link: '/management/alumni' },
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

            {/* Header / Breadcrumb Mirror from Student */}
            {/* Dashboard header removed as per user request */}

            {/* KPI Cards Row - Using stu-kpi-row classes */}
            <div className="stu-kpi-row">
                {kpiCards.map((card, i) => (
                    <div key={i} className={`stu-kpi-card ${card.class}`} onClick={() => setSelectedModal(card)} style={{ cursor: 'pointer' }}>
                        <div className="kpi-main">
                            <div className="kpi-value">{card.value}</div>
                            <div className="kpi-label">{card.title}</div>
                        </div>
                        <div className="kpi-icon">{card.icon}</div>
                        <div className="kpi-more" onClick={(e) => { e.stopPropagation(); navigate(card.link); }}>View details →</div>
                    </div>
                ))}
            </div>

            <DetailedReportModal
                isOpen={!!selectedModal}
                onClose={() => setSelectedModal(null)}
                title={selectedModal?.title || selectedModal?.label}
                value={selectedModal?.value}
                label={selectedModal?.title || selectedModal?.label}
                icon={selectedModal?.icon}
                description={selectedModal?.description}
            />

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* AI Institutional Wisdom */}
                <div className="lg:col-span-1 space-y-6">
                    <AIInsightPanel role="ADMIN" />

                    {/* Live Sentiment & Infrastructure Forecast */}
                    {/* AI Campus Sentiment Card - Light in light mode, dark in dark mode */}
                    <div
                        className="p-5 rounded-2xl shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all border"
                        style={{ background: 'var(--card-bg)', color: 'var(--theme-text)', borderColor: 'var(--theme-border)' }}
                        onClick={() => setSelectedModal({
                            title: 'AI Campus Sentiment',
                            value: '85% Positive',
                            icon: <FaHeart />,
                            description: 'Campus vibe is "Excited" (85% positive). Pulse is high due to upcoming Sports Meet. Student satisfaction trending +4%. Recommendation: Broadcast sports event update to sustain engagement.'
                        })}
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 blur-2xl opacity-30" style={{ background: 'var(--color-primary-navy)' }} />
                        <div className="info-header mb-4 relative z-10 flex items-center gap-2" style={{ border: 'none' }}>
                            <FaHeart style={{ color: '#db2777' }} />
                            <span className="font-black uppercase tracking-widest text-[11px]" style={{ color: 'var(--theme-accent)' }}>AI Campus Sentiment</span>
                        </div>
                        <div className="info-body relative z-10">
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-3xl font-black" style={{ color: 'var(--theme-text)' }}>85%</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-success)' }}>Excited / Stable</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full overflow-hidden shadow-inner" style={{ background: 'var(--theme-bg-muted)' }}>
                                <div className="h-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" style={{ width: '85%' }} />
                            </div>
                            <p className="text-[11px] mt-3 leading-tight italic font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                                "Pulse is high due to upcoming Sports Meet. Student satisfaction trending +4%."
                            </p>
                        </div>
                    </div>

                    {/* Infra Forecast Card - Light in light mode, dark in dark mode */}
                    <div
                        className="p-5 rounded-2xl shadow-xl relative overflow-hidden group border transition-all cursor-pointer hover:shadow-2xl"
                        style={{ background: 'var(--card-bg)', color: 'var(--theme-text)', borderColor: 'var(--theme-border)' }}
                        onClick={() => setSelectedModal({
                            title: 'Infrastructure Forecast',
                            value: 'Peak load Block D',
                            icon: <FaBolt />,
                            description: 'Peak load expected in Block D at 3 PM. Suggest pre-cooling Labs 401-408 for 12% energy saving. Click "Apply Automation" to schedule pre-cooling.'
                        })}
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform">
                            <FaBolt style={{ color: 'var(--color-warning)' }} className="text-4xl" />
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--theme-accent)' }}>
                            <FaMagic /> Infra Forecast
                        </div>
                        <p className="text-sm font-medium leading-relaxed mb-4" style={{ color: 'var(--theme-text)' }}>
                            Peak load expected in <b>Block D</b> at 3 PM. Suggest pre-cooling Labs 401-408 for 12% energy saving.
                        </p>
                        <button
                            type="button"
                            className="w-full py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors shadow-md"
                            style={{ background: 'var(--color-accent-gold)', color: 'var(--color-primary-navy)' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                addToast('Automation applied. Pre-cooling scheduled for Labs 401-408. Estimated 12% energy saving.', 'success');
                                setSelectedModal({
                                    title: 'Infrastructure Forecast',
                                    value: 'Automation applied',
                                    icon: <FaBolt />,
                                    description: 'Pre-cooling has been scheduled for Labs 401-408. Peak load in Block D at 3 PM will be mitigated. Estimated 12% energy saving.'
                                });
                            }}
                        >
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

export default AdminDashboard;
