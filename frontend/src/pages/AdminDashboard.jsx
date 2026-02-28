import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ResponsiveContainer, BarChart, Bar, LineChart, Line,
    CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { FaBuilding, FaBolt, FaBus, FaLeaf, FaBullhorn, FaUsers, FaChartLine } from 'react-icons/fa';
import api from '../services/api';
import Skeleton from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import { useWebSocket } from '../context/WebSocketContext';
import InstitutionalAnalytics from '../components/intelligence/InstitutionalAnalytics';
import Card from '../components/common/Card';
import DetailModal from '../components/common/DetailModal';

const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};
const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const { publish } = useWebSocket();

    // Broadcast State
    const [bTitle, setBTitle] = useState('');
    const [bMessage, setBMessage] = useState('');
    const [selectedDetail, setSelectedDetail] = useState(null);

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
            publish('/app/broadcast', {
                sender: 'ADMIN',
                title: bTitle,
                message: bMessage,
                severity: 'HIGH'
            });

            addToast('Broadcast sent globally!', 'success');
            setBTitle('');
            setBMessage('');
        } catch (err) {
            addToast('Failed to send broadcast', 'error');
        }
    };

    const kpiCards = useMemo(() => [
        { title: 'Infrastructure Utilization', value: `${stats?.infrastructureUtil ?? 0}%`, icon: <FaBuilding />, color: 'green', class: 'green' },
        { title: 'Energy Optimization', value: `${stats?.energyOptimization ?? 0}`, icon: <FaBolt />, color: 'yellow', class: 'yellow' },
        { title: 'Transport Efficiency', value: `${stats?.transportEfficiency ?? 0}%`, icon: <FaBus />, color: 'teal', class: 'teal' },
        { title: 'Sustainability Index', value: `${stats?.sustainabilityIndex ?? 0}`, icon: <FaLeaf />, color: 'red', class: 'red' },
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
            <div className="stu-kpi-row">
                {kpiCards.map((card, i) => (
                    <div key={i} className={`stu-kpi-card ${card.class}`} onClick={() => setSelectedDetail(card)}>
                        <div className="kpi-main">
                            <div className="kpi-value">{card.value}</div>
                            <div className="kpi-label">{card.title}</div>
                        </div>
                        <div className="kpi-icon">{card.icon}</div>
                        <div className="kpi-more">View details →</div>
                    </div>
                ))}
            </div>

            {/* Main Content Layout */}
            <div className="admin-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
                {/* Analytics Chart */}
                <div className="stu-info-card" style={{ borderTopColor: '#0B2C6B' }}>
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
                <div className="stu-info-card" style={{ borderTopColor: '#3c8dbc' }}>
                    <div className="info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaBullhorn color="#3c8dbc" />
                        <span>Global Broadcast</span>
                    </div>
                    <div className="info-body">
                        <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input
                                type="text"
                                placeholder="Broadcast Title"
                                value={bTitle}
                                onChange={e => setBTitle(e.target.value)}
                                required
                                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                            />
                            <textarea
                                placeholder="Type your global message here..."
                                value={bMessage}
                                onChange={e => setBMessage(e.target.value)}
                                required
                                rows="4"
                                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px', resize: 'none' }}
                            />
                            <button className="table-btn primary" type="submit" style={{ width: '100%', padding: '10px', background: '#3c8dbc', borderColor: '#3c8dbc' }}>
                                Broadcast Globally
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

            {/* Detail Modal */}
            <DetailModal
                isOpen={!!selectedDetail}
                onClose={() => setSelectedDetail(null)}
                title={`${selectedDetail?.title} System Report`}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #0B2C6B' }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#0B2C6B' }}>Real-time Status: Optimized</h4>
                        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                            Current {selectedDetail?.title} is performing within expected parameters.
                            AI agents are continuously monitoring for anomalies.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                        <div style={{ padding: '15px', background: '#ecf0f5', borderRadius: '4px', textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#777', textTransform: 'uppercase' }}>EFFICIENCY</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>94.2%</div>
                        </div>
                        <div style={{ padding: '15px', background: '#ecf0f5', borderRadius: '4px', textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#777', textTransform: 'uppercase' }}>UPTIME</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>99.9%</div>
                        </div>
                        <div style={{ padding: '15px', background: '#ecf0f5', borderRadius: '4px', textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#777', textTransform: 'uppercase' }}>ALERTS</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00a65a' }}>NONE</div>
                        </div>
                    </div>
                </div>
            </DetailModal>

        </motion.div>
    );
};

export default AdminDashboard;
