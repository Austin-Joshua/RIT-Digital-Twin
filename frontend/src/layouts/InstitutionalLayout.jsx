import React, { useState, useContext, Suspense, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import NotificationBar from '../components/NotificationBar';
import GlobalAlertBar from '../components/intelligence/GlobalAlertBar';
import { FaUser, FaBars, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import './student-layout.css';

const LayoutLoader = () => (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid rgba(11, 44, 107, 0.2)', borderTopColor: '#0B2C6B', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
);

const InstitutionalLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const displayName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`.toUpperCase()
        : (user?.username || user?.role || 'ADMIN').toUpperCase();

    const adminNavItems = [
        { path: '/', label: 'Home', icon: '📊', exact: true },
        { path: '/analytics', label: 'Analytics', icon: '📈', exact: true },
        { path: '/analytics/placement', label: 'Placements', icon: '💼' },
        { path: '/management/audit', label: 'Audit Logs', icon: '🛡️' },
        { path: '/management/exam-timetable', label: 'Exam Timetables', icon: '📅' },
        { path: '/management/results', label: 'Results', icon: '✅' },
        { path: '/management/substitutions', label: 'Class Substitutions', icon: '🔄' },
        { path: '/management/certificates', label: 'Certificate', icon: '📜' },
        { path: '/simulations/classroom', label: 'Classroom Allocation', icon: '🏫' },
        { path: '/simulations/energy', label: 'Energy Optimization', icon: '⚡' },
        { path: '/simulations/transport', label: 'Transport Analytics', icon: '🚌' },
        { path: '/simulations/crowd', label: 'Crowd Flow', icon: '👥' },
        { path: '/predictions', label: 'Predictive Analytics', icon: '🔮' },

        { path: '/change-password', label: 'Change Password', icon: '🔑' },
    ];

    const facultyNavItems = [
        { path: '/', label: 'Dashboard', icon: '📊', exact: true },
        { path: '/simulations/classroom', label: 'Timetables', icon: '🏫' },
        { path: '/faculty/upload-marks', label: 'Upload Results', icon: '📝' },
        { path: '/faculty/risk-heatmap', label: 'Class Risk Heatmap', icon: '🔥' },

        { path: '/change-password', label: 'Change Password', icon: '🔑' },
    ];

    const navItems = user?.role === 'FACULTY' ? facultyNavItems : adminNavItems;

    return (
        <div className="stu-layout">
            {/* ── Sidebar ── */}
            <aside className={`stu-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="stu-sidebar-header" style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center', overflow: 'hidden', height: '50px', background: '#fff' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 0 }}>
                        {sidebarOpen ? (
                            <img
                                src="/assets/images/logo.png"
                                alt="RIT Rajalakshmi Institute of Technology"
                                style={{ height: '50px', width: 'auto', objectFit: 'contain', maxWidth: '200px' }}
                            />
                        ) : (
                            <img
                                src="/assets/images/RIT_LOGO.webp"
                                alt="RIT"
                                style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '6px' }}
                            />
                        )}
                    </Link>
                </div>

                {/* Search */}
                <div className="stu-sidebar-search">
                    <input type="text" placeholder="Search..." />
                </div>

                {/* Nav */}
                <nav className="stu-nav">
                    {navItems.map((item, idx) => (
                        <div key={idx}>
                            <NavLink
                                to={item.path}
                                end={item.exact || false}
                                className={({ isActive }) => `stu-nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => {
                                    if (window.innerWidth <= 768) setSidebarOpen(false);
                                }}
                            >
                                <span className="nav-icon" style={{ fontSize: '18px' }}>{item.icon}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Mobile Sidebar Backdrop */}
            {sidebarOpen && window.innerWidth <= 768 && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 999
                    }}
                />
            )}

            {/* ── Main ── */}
            <div className="stu-main">
                {/* Top Bar — exact IMS mirror */}
                <header className="stu-topbar">
                    <div className="stu-topbar-left" style={{ display: 'flex', alignItems: 'center', padding: 0 }}>
                        <button className="stu-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <FaBars />
                        </button>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', height: '100%', padding: 0 }}>
                            <img
                                src="/assets/images/logo.png"
                                alt="RIT"
                                style={{ height: '50px', width: 'auto', objectFit: 'contain' }}
                            />
                        </Link>
                    </div>

                    <div className="stu-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={toggleTheme}
                            style={{
                                background: 'none', border: 'none', fontSize: '20px',
                                cursor: 'pointer', color: 'var(--ims-icon-color)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            title="Toggle Dark Mode"
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                        <NotificationBar />

                        {/* Dropdown User Menu */}
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <button
                                className="stu-user-badge"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                <FaUser className="user-icon" />
                                <span>{displayName}</span>
                            </button>

                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            marginTop: '8px',
                                            background: 'white',
                                            borderRadius: '4px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            width: '180px',
                                            zIndex: 1000,
                                            border: '1px solid #eee'
                                        }}
                                    >
                                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f4f4f4', background: '#f8fafc' }}>
                                            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 'bold' }}>Signed in as</div>
                                            <div style={{ fontSize: '13px', color: '#333', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'admin@ritchennai.edu.in'}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--color-accent-gold)', marginTop: '4px', fontWeight: 'bold' }}>{user?.role}</div>
                                        </div>
                                        <NavLink
                                            to="/student/profile"
                                            style={{ display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', borderBottom: '1px solid #f4f4f4' }}
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            My Profile
                                        </NavLink>
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                width: '100%', textAlign: 'left', padding: '12px 16px',
                                                border: 'none', background: 'none', color: '#dd4b39',
                                                fontSize: '14px', cursor: 'pointer', fontWeight: '500'
                                            }}
                                        >
                                            Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <GlobalAlertBar />

                {/* Content */}
                <div className="stu-content">
                    <Suspense fallback={<LayoutLoader />}>
                        <Outlet />
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default InstitutionalLayout;
