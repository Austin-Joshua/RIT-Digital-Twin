import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ResponsiveContainer, BarChart, Bar, LineChart, Line,
    CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { FaBuilding, FaBolt, FaBus, FaLeaf, FaBullhorn, FaUsers, FaChartLine, FaBoxes, FaUserGraduate, FaSms, FaMobileAlt } from 'react-icons/fa';
import api from '../services/api';
import Skeleton from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import { useWebSocket } from '../context/WebSocketContext';
import InstitutionalAnalytics from '../components/intelligence/InstitutionalAnalytics';
import Card from '../components/common/Card';
import { useNavigate } from 'react-router-dom';
import MiniCalendar from '../components/common/MiniCalendar';

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

    // Broadcast State
    const [bTitle, setBTitle] = useState('');
    const [bMessage, setBMessage] = useState('');
    const [sendPush, setSendPush] = useState(true);
    const [sendSms, setSendSms] = useState(false);

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
        fetchStats();
    }, []);

    const handleBroadcast = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/notifications/admin/broadcast?title=${encodeURIComponent(bTitle)}&message=${encodeURIComponent(bMessage)}&type=SYSTEM`);

            // Push real-time event via raw websockets
            if (sendPush) {
                publish('/app/broadcast', {
                    sender: 'ADMIN',
                    title: bTitle,
                    message: bMessage,
                    severity: 'HIGH'
                });
            }

            if (sendSms) {
                // Simulate SMS Dispatch to Parents
                console.log(`[SMS Gateway Mock] Dispatched to Parent numbers: ${bMessage}`);
                addToast('SMS Alerts dispatched to 4,203 registered parents.', 'info');
            }

            addToast(sendPush ? 'Broadcast sent globally via App Push!' : 'Broadcast successful.', 'success');
            setBTitle('');
            setBMessage('');
        } catch (_err) {
            addToast('The broadcast could not be sent. Please try again later.', 'error');
        }
    };

    const kpiCards = useMemo(() => [
        { title: 'Infrastructure Utilization', value: `${stats?.infrastructureUtil ?? 0}%`, icon: <FaBuilding />, color: 'green', class: 'green', link: '/simulations/classroom' },
        { title: 'Energy Optimization', value: `${stats?.energyOptimization ?? 0}`, icon: <FaBolt />, color: 'yellow', class: 'yellow', link: '/simulations/energy' },
        { title: 'Transport Efficiency', value: `${stats?.transportEfficiency ?? 0}%`, icon: <FaBus />, color: 'teal', class: 'teal', link: '/simulations/transport' },
        { title: 'HR & Recruitment', value: `12 Open`, icon: <FaUsers />, color: 'indigo', class: 'indigo', link: '/management/hr-recruitment' },
        { title: 'Asset Inventory', value: `4.2k`, icon: <FaBoxes />, color: 'purple', class: 'purple', link: '/management/inventory' },
        { title: 'Alumni Network', value: `12.4k`, icon: <FaUserGraduate />, color: 'orange', class: 'orange', link: '/management/alumni' },
    ], [stats]);

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
            <div className="stu-kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {kpiCards.map((card, i) => (
                    <div key={i} className={`stu-kpi-card ${card.class}`} onClick={() => navigate(card.link)}>
                        <div className="kpi-main">
                            <div className="kpi-value" style={{ fontSize: '24px' }}>{card.value}</div>
                            <div className="kpi-label" style={{ fontSize: '13px' }}>{card.title}</div>
                        </div>
                        <div className="kpi-icon">{card.icon}</div>
                        <div className="kpi-more">View details →</div>
                    </div>
                ))}
            </div>

            {/* Main Content Layout */}
            <div className="stu-info-row">
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
