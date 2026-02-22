import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ResponsiveContainer, BarChart, Bar, LineChart, Line,
    CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { FaBuilding, FaBolt, FaBus, FaLeaf } from 'react-icons/fa';
import api from '../services/api';
import Skeleton from '../components/common/Skeleton';

/* ---------- Animation Variants ---------- */
const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

/* ---------- Wrappers ---------- */
const AnimatedDashboardLayout = ({ children }) => (
    <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
        {children}
    </motion.div>
);

const AnimatedChartContainer = ({ children }) => (
    <motion.div variants={fadeInUp}>{children}</motion.div>
);

/* ---------- KPI Card ---------- */
const StatCard = memo(({ card }) => (
    <motion.div variants={fadeInUp}>
        <Link to={card.link} style={{ textDecoration: 'none' }}>
            <div style={{
                background: 'var(--glass-bg, #fff)',
                backdropFilter: 'blur(10px)',
                borderRadius: '14px',
                padding: '24px',
                borderTop: `4px solid ${card.color}`,
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
            }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #6b7280)', fontWeight: 500, marginBottom: '6px' }}>{card.title}</p>
                        <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary, #111827)', lineHeight: 1 }}>{card.value}</h3>
                    </div>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '10px',
                        backgroundColor: `${card.color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: card.color, fontSize: '1.25rem'
                    }}>
                        {card.icon}
                    </div>
                </div>
            </div>
        </Link>
    </motion.div>
));

/* ---------- Main Dashboard ---------- */
const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                setStats(response.data);
            } catch {
                // Use sensible fallback data so the dashboard still renders
                setStats({
                    infrastructureUtil: 78.5,
                    energyOptimization: 85.2,
                    transportEfficiency: 92.0,
                    sustainabilityIndex: 88.7,
                    totalBuildings: 12,
                    totalClassrooms: 48,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
            <Skeleton height="40px" width="300px" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <Skeleton height="120px" /><Skeleton height="120px" /><Skeleton height="120px" /><Skeleton height="120px" />
            </div>
            <Skeleton height="400px" />
        </div>
    );

    return (
        <AnimatedDashboardLayout>
            {/* Header Banner */}
            <motion.div variants={fadeInUp} style={{
                display: 'flex', alignItems: 'center', gap: '20px',
                background: 'var(--glass-bg, #fff)', borderRadius: '14px',
                padding: '20px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                borderLeft: '5px solid var(--color-primary-navy, #0B2C6B)'
            }}>
                <img src="/assets/images/rit-logo.png" alt="RIT Logo" style={{ height: '52px', width: 'auto' }} />
                <div style={{ width: '1px', height: '48px', background: '#e5e7eb' }} />
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary, #111827)', margin: 0 }}>Campus Intelligence Portal</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #6b7280)', margin: '4px 0 0' }}>Real-time Digital Twin Simulation &amp; Governance</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '24px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary-navy, #0B2C6B)' }}>{stats?.totalBuildings ?? 12}</div>
                        <div style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Buildings</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary-navy, #0B2C6B)' }}>{stats?.totalClassrooms ?? 48}</div>
                        <div style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Classrooms</div>
                    </div>
                </div>
            </motion.div>

            {/* Page Title */}
            <motion.h1 variants={fadeInUp} style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary, #111827)', margin: 0 }}>
                Smart Campus Intelligence Dashboard
            </motion.h1>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {kpiCards.map((card, i) => <StatCard key={i} card={card} />)}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <AnimatedChartContainer>
                    <div style={{ background: 'var(--glass-bg, #fff)', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #111827)', marginTop: 0, marginBottom: '20px' }}>Weekly Consumption Trends</h3>
                        <div style={{ height: '280px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                                    <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} />
                                    <Bar dataKey="Energy" fill="#0B2C6B" name="Energy (kWh)" radius={[4, 4, 0, 0]} barSize={28} />
                                    <Bar dataKey="Transport" fill="#D4AF37" name="Transport Load" radius={[4, 4, 0, 0]} barSize={28} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </AnimatedChartContainer>

                <AnimatedChartContainer>
                    <div style={{ background: 'var(--glass-bg, #fff)', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #111827)', marginTop: 0, marginBottom: '20px' }}>Simulation Analytics</h3>
                        <div style={{ height: '280px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                                    <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} />
                                    <Line type="monotone" dataKey="Energy" stroke="#0B2C6B" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Energy" />
                                    <Line type="monotone" dataKey="Transport" stroke="#D4AF37" strokeWidth={2.5} dot={{ r: 4 }} name="Transport" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </AnimatedChartContainer>
            </div>
        </AnimatedDashboardLayout>
    );
};

export default Dashboard;
