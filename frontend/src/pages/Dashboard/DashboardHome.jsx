import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FiGrid,
    FiZap,
    FiTruck,
    FiUsers,
    FiBarChart2,
    FiActivity,
} from 'react-icons/fi';
import './DashboardHome.css';
import Card from '../../components/common/Card';
import DetailModal from '../../components/common/DetailModal';
import AIInsightPanel from '../../components/intelligence/AIInsightPanel';
import { useState } from 'react';

const DashboardHome = () => {
    const { user } = useAuth();
    const [selectedStat, setSelectedStat] = useState(null);

    const stats = [
        { label: 'Total Classrooms', value: '156', trend: '+12%', trendDir: 'up', variant: 'primary', icon: <FiGrid /> },
        { label: 'Energy Saved (kWh)', value: '8,420', trend: '+23%', trendDir: 'up', variant: 'success', icon: <FiZap /> },
        { label: 'Active Routes', value: '12', trend: 'Live', trendDir: 'up', variant: 'info', icon: <FiTruck /> },
        { label: 'Campus Population', value: '5,000', trend: 'Live', trendDir: 'up', variant: 'accent', icon: <FiUsers /> },
        { label: 'Sustainability', value: 'A+', trend: 'Excellent', trendDir: 'up', variant: 'success', icon: <FiBarChart2 /> },
        { label: 'Forecast Accuracy', value: '97%', trend: 'R²=0.99', trendDir: 'up', variant: 'warning', icon: <FiActivity /> },
    ];

    const modules = [
        {
            title: 'Smart Classroom Allocation',
            description: 'Room scheduling, occupancy monitoring, and resource optimization across campus buildings.',
            icon: <FiGrid />,
            path: '/dashboard/classroom',
            status: 'active',
        },
        {
            title: 'Energy Consumption Analytics',
            description: 'Energy monitoring, consumption simulation, and efficiency forecasting for sustainability.',
            icon: <FiZap />,
            path: '/dashboard/energy',
            status: 'active',
        },
        {
            title: 'Transport Route Optimization',
            description: 'Campus bus route planning, fleet analysis, and schedule optimization.',
            icon: <FiTruck />,
            path: '/dashboard/transport',
            status: 'active',
        },
        {
            title: 'Crowd Flow & Emergency',
            description: 'Crowd density mapping, emergency evacuation simulation, and readiness scoring.',
            icon: <FiUsers />,
            path: '/dashboard/crowd',
            status: 'active',
        },
        {
            title: 'Sustainability Dashboard',
            description: 'Environmental impact tracking, carbon footprint analysis, and SDG progress.',
            icon: <FiBarChart2 />,
            path: '/dashboard/sustainability',
            status: 'active',
        },
        {
            title: 'Predictive Analytics',
            description: 'Regression-based forecasting for enrollment, infrastructure demand, and planning.',
            icon: <FiActivity />,
            path: '/dashboard/predictive',
            status: 'active',
        },
    ];

    return (
        <div className="dashboard-home">

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {stats.map((stat, i) => (
                    <Card
                        key={i}
                        onClick={() => setSelectedStat(stat)}
                        hoverEffect={true}
                        style={{ padding: '24px', borderLeft: `4px solid var(--color-primary-navy)` }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ fontSize: '1.5rem', color: 'var(--color-primary-navy)' }}>{stat.icon}</div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#10B981' }}>{stat.trend}</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '4px' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--theme-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
                    </Card>
                ))}
            </div>

            {selectedStat && (
                <DetailModal
                    isOpen={!!selectedStat}
                    onClose={() => setSelectedStat(null)}
                    title={selectedStat.label}
                >
                    <div className="p-4">
                        <p><strong>Value:</strong> {selectedStat.value}</p>
                        <p><strong>Trend:</strong> {selectedStat.trend}</p>
                        <p><strong>Trend Direction:</strong> {selectedStat.trendDir}</p>
                        <p><strong>Variant:</strong> {selectedStat.variant}</p>
                        {/* Add more details as needed */}
                    </div>
                </DetailModal>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                <div className="lg:col-span-2">
                    {/* Modules */}
                    <div className="section-header">
                        <h3>Core Modules</h3>
                    </div>
                    <div className="module-grid">
                        {modules.map((mod, i) => (
                            <Link to={mod.path} className="module-card" key={i}>
                                <div className="module-card-header">
                                    <div className="module-card-icon">{mod.icon}</div>
                                    <h3>{mod.title}</h3>
                                    <span className={`module-status ${mod.status}`}>
                                        {mod.status === 'active' ? 'Active' : 'Coming Soon'}
                                    </span>
                                </div>
                                <p>{mod.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="mt-8">
                    <AIInsightPanel />
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
