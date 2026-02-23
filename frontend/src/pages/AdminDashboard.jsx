import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ResponsiveContainer, BarChart, Bar, LineChart, Line,
    CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { FaBuilding, FaBolt, FaBus, FaLeaf, FaBullhorn, FaUsers } from 'react-icons/fa';
import api from '../services/api';
import Skeleton from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';

const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};
const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const AnimatedDashboardLayout = ({ children }) => (
    <motion.div initial="hidden" animate="visible" variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {children}
    </motion.div>
);

const AnimatedChartContainer = ({ children }) => (
    <motion.div variants={fadeInUp}>{children}</motion.div>
);

const StatCard = memo(({ card }) => (
    <motion.div variants={fadeInUp}>
        <Link to={card.link} style={{ textDecoration: 'none' }}>
            <div style={{
                background: 'var(--glass-bg, #fff)', backdropFilter: 'blur(10px)', borderRadius: '14px',
                padding: '24px', borderTop: `4px solid ${card.color}`, boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
            }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #6b7280)', fontWeight: 500, marginBottom: '6px' }}>{card.title}</p>
                        <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary, #111827)', lineHeight: 1 }}>{card.value}</h3>
                    </div>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: `${card.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, fontSize: '1.25rem' }}>
                        {card.icon}
                    </div>
                </div>
            </div>
        </Link>
    </motion.div>
));

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    // Broadcast State
    const [bTitle, setBTitle] = useState('');
    const [bMessage, setBMessage] = useState('');

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
            addToast('Broadcast sent globally!', 'success');
            setBTitle('');
            setBMessage('');
        } catch (err) {
            addToast('Failed to send broadcast', 'error');
        }
    };

    const kpiCards = useMemo(() => [
        { title: 'Infrastructure Utilization', value: `${stats?.infrastructureUtil ?? 0}%`, icon: <FaBuilding />, color: '#3b82f6', link: '/simulations/classroom' },
        { title: 'Energy Optimization', value: `${stats?.energyOptimization ?? 0}`, icon: <FaBolt />, color: '#D4AF37', link: '/simulations/energy' },
        { title: 'Transport Efficiency', value: `${stats?.transportEfficiency ?? 0}%`, icon: <FaBus />, color: '#22c55e', link: '/simulations/transport' },
        { title: 'Sustainability Index', value: `${stats?.sustainabilityIndex ?? 0}`, icon: <FaLeaf />, color: '#14b8a6', link: '/simulations/crowd' },
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
        <AnimatedDashboardLayout>


            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {kpiCards.map((card, i) => <StatCard key={i} card={card} />)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
                <AnimatedChartContainer>
                    <div style={{ background: 'var(--glass-bg)', padding: '24px', borderRadius: '14px' }}>
                        <h3 style={{ marginTop: 0 }}>Weekly Simulation Analytics</h3>
                        <div style={{ height: '280px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="Energy" stroke="#0B2C6B" />
                                    <Line type="monotone" dataKey="Transport" stroke="#D4AF37" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </AnimatedChartContainer>

                {/* Broadcast Panel */}
                <AnimatedChartContainer>
                    <div style={{ background: 'var(--glass-bg)', padding: '24px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><FaBullhorn color="#3b82f6" /> Global Broadcast</h3>
                        <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input type="text" placeholder="Title" value={bTitle} onChange={e => setBTitle(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                            <textarea placeholder="Message..." value={bMessage} onChange={e => setBMessage(e.target.value)} required rows="4" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' }} />
                            <button type="submit" style={{ padding: '12px', background: '#0B2C6B', color: 'white', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Broadcast Now</button>
                        </form>
                    </div>
                </AnimatedChartContainer>
            </div>
        </AnimatedDashboardLayout>
    );
};

export default AdminDashboard;
