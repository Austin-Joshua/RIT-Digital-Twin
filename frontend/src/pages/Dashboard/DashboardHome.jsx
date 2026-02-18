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

const DashboardHome = () => {
    const { user } = useAuth();

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
            {/* Welcome */}
            <div className="dashboard-welcome">
                <h2>Welcome, {user?.fullName || 'User'}</h2>
                <p>Campus intelligence overview &mdash; Rajalakshmi Institute of Technology</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <div className={`stat-card ${stat.variant}`} key={i}>
                        <div className="stat-card-header">
                            <div className="stat-card-icon">{stat.icon}</div>
                            <span className={`stat-card-trend ${stat.trendDir}`}>{stat.trend}</span>
                        </div>
                        <div className="stat-card-value">{stat.value}</div>
                        <div className="stat-card-label">{stat.label}</div>
                    </div>
                ))}
            </div>

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
    );
};

export default DashboardHome;
