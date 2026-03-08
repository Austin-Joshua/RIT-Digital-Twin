import { Link, useNavigate } from 'react-router-dom';
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
import AIInsightPanel from '../../components/intelligence/AIInsightPanel';
import ChatbotWidget from '../../components/intelligence/ChatbotWidget';

const DashboardHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const stats = [
        { label: 'Total Classrooms', value: '156', trend: '+12%', trendDir: 'up', color: '#3B82F6', icon: <FiGrid />, link: '/simulations/classroom' },
        { label: 'Energy Conserved (kWh)', value: '8,420', trend: '+23%', trendDir: 'up', color: '#10B981', icon: <FiZap />, link: '/simulations/energy' },
        { label: 'Active Transport Routes', value: '12', trend: 'Live', trendDir: 'up', color: '#8B5CF6', icon: <FiTruck />, link: '/transport' },
        { label: 'Current Campus Population', value: '5,000', trend: 'Live', trendDir: 'up', color: '#F59E0B', icon: <FiUsers />, link: '/simulations/crowd' },
        { label: 'Sustainability Rating', value: 'A+', trend: 'Excellent', trendDir: 'up', color: '#14B8A6', icon: <FiBarChart2 />, link: '/simulations/sustainability' },
    ];

    const modules = [
        {
            title: 'Smart Classroom Allocation',
            description: 'Room scheduling, occupancy monitoring, and resource optimization across campus buildings.',
            icon: <FiGrid />,
            path: '/simulations/classroom',
            status: 'active',
        },
        {
            title: 'Energy Consumption Analytics',
            description: 'Energy monitoring, consumption simulation, and efficiency forecasting for sustainability.',
            icon: <FiZap />,
            path: '/simulations/energy',
            status: 'active',
        },
        {
            title: 'Transport Route Optimization',
            description: 'Comprehensive campus bus route planning, fleet utilisation analysis, and schedule optimisation.',
            icon: <FiTruck />,
            path: '/transport',
            status: 'active',
        },
        {
            title: 'Crowd Flow & Emergency',
            description: 'Real-time crowd density mapping, emergency evacuation simulation, and institutional readiness assessment.',
            icon: <FiUsers />,
            path: '/simulations/crowd',
            status: 'active',
        },
        {
            title: 'Sustainability Dashboard',
            description: 'Institutional environmental impact tracking, carbon footprint analysis, and Sustainable Development Goals progress monitoring.',
            icon: <FiBarChart2 />,
            path: '/simulations/sustainability',
            status: 'active',
        },
        {
            title: 'Predictive Analytics',
            description: 'Regression-based forecasting for enrolment trends, infrastructure demand projections, and strategic planning.',
            icon: <FiActivity />,
            path: '/predictions',
            status: 'active',
        },
    ];

    return (
        <div className="dashboard-home">

            <div className="stats-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-8">
                {stats.map((stat, i) => (
                    <Card
                        key={i}
                        onClick={() => navigate(stat.link)}
                        hoverEffect={true}
                        style={{
                            padding: '20px',
                            borderLeft: `4px solid ${stat.color}`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center'
                        }}
                    >
                        <div style={{ fontSize: '1.5rem', color: stat.color, marginBottom: '10px' }}>{stat.icon}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2px' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--theme-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>{stat.label}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#10B981', marginTop: '8px' }}>{stat.trend}</div>
                    </Card>
                ))}
            </div>

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
                                        {mod.status === 'active' ? 'Operational' : 'Coming Soon'}
                                    </span>
                                </div>
                                <p>{mod.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="mt-8">
                    <AIInsightPanel role={user?.role?.replace?.('ROLE_', '') || 'ADMIN'} />
                </div>
            </div>
            <ChatbotWidget />
        </div>
    );
};

export default DashboardHome;
