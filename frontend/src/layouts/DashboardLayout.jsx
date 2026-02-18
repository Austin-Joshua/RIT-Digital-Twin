import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiHome,
    FiGrid,
    FiZap,
    FiTruck,
    FiUsers,
    FiBarChart2,
    FiActivity,
    FiLogOut,
    FiSettings,
    FiShield,
} from 'react-icons/fi';
import './DashboardLayout.css';

const navItems = [
    {
        section: 'Overview',
        items: [
            { path: '/dashboard', label: 'Dashboard', icon: <FiHome />, exact: true },
        ],
    },
    {
        section: 'Core Modules',
        items: [
            { path: '/dashboard/classroom', label: 'Smart Classroom', icon: <FiGrid /> },
            { path: '/dashboard/energy', label: 'Energy Analytics', icon: <FiZap /> },
            { path: '/dashboard/transport', label: 'Transport', icon: <FiTruck /> },
            { path: '/dashboard/crowd', label: 'Crowd Flow', icon: <FiUsers /> },
        ],
    },
    {
        section: 'Analytics',
        items: [
            { path: '/dashboard/sustainability', label: 'Sustainability', icon: <FiBarChart2 /> },
            { path: '/dashboard/predictive', label: 'Predictive', icon: <FiActivity /> },
        ],
    },
    {
        section: 'System',
        items: [
            { path: '/dashboard/settings', label: 'Settings', icon: <FiSettings /> },
        ],
    },
];

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getPageTitle = () => {
        for (const section of navItems) {
            for (const item of section.items) {
                if (location.pathname === item.path) return item.label;
            }
        }
        return 'Dashboard';
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="dashboard-layout">
            {/* ===== SIDEBAR ===== */}
            <aside className="sidebar">
                {/* RIT Branding */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <FiShield className="logo-icon" />
                    </div>
                    <div className="sidebar-brand">
                        <h2>RIT Digital Twin</h2>
                        <p>Smart Campus Platform</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.map((section, idx) => (
                        <div key={idx} className="nav-section">
                            <div className="nav-section-label">{section.section}</div>
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.exact}
                                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-label">{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* User Area */}
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">
                            {getInitials(user?.fullName)}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="name">{user?.fullName || 'User'}</div>
                            <div className="role">{user?.role || 'Faculty'}</div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <FiLogOut />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* ===== MAIN AREA ===== */}
            <div className="main-area">
                {/* Institutional Header Bar */}
                <header className="topbar">
                    <div className="topbar-left">
                        <div className="topbar-institution">
                            <div className="institution-logo-placeholder">RIT</div>
                            <div className="institution-text">
                                <div className="institution-name">Rajalakshmi Institute of Technology</div>
                                <div className="institution-sub">Digital Twin Platform — {getPageTitle()}</div>
                            </div>
                        </div>
                    </div>
                    <div className="topbar-right">
                        <div className="topbar-badge">
                            <span className="dot" />
                            System Online
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="page-content">
                    <Outlet />
                </main>

                {/* Footer */}
                <footer className="campus-footer">
                    <span>© 2026 Rajalakshmi Institute of Technology, Chennai</span>
                    <span className="footer-sep">•</span>
                    <span>Digital Twin Smart Campus Platform</span>
                </footer>
            </div>
        </div>
    );
};

export default DashboardLayout;
