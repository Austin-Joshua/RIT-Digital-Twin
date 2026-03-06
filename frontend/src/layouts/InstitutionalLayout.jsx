import React, { useState, useContext, Suspense, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import NotificationBar from '../components/NotificationBar';
import GlobalAlertBar from '../components/intelligence/GlobalAlertBar';
import {
    LuUser, LuMenu, LuLayoutGrid, LuLayoutDashboard, LuTrendingUp, LuBriefcase,
    LuFileCode, LuCalendar, LuBook, LuRefreshCcw, LuAward,
    LuSchool, LuLightbulb, LuBus, LuUsers, LuCpu, LuKey, LuSettings,
    LuPenTool, LuFlame, LuLogOut, LuChevronDown, LuChevronRight,
    LuSun, LuMoon, LuMonitor
} from 'react-icons/lu';
import GlobalSearch from '../components/common/GlobalSearch';
import './student-layout.css';

const LayoutLoader = () => (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid rgba(11, 44, 107, 0.2)', borderTopColor: '#0B2C6B', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
);

const InstitutionalLayout = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        // Always open on desktop; respect localStorage only on mobile
        if (window.innerWidth >= 1025) return true;
        const saved = localStorage.getItem('sidebar-open');
        return saved !== null ? JSON.parse(saved) : false;
    });
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { isDarkMode, toggleTheme, themePreference } = useContext(ThemeContext);

    // Persist sidebar state
    useEffect(() => {
        localStorage.setItem('sidebar-open', JSON.stringify(sidebarOpen));
    }, [sidebarOpen]);

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
        { path: '/', label: 'Home', icon: <LuLayoutDashboard />, exact: true },
        { path: '/analytics', label: 'Analytics', icon: <LuTrendingUp />, exact: true },
        { path: '/analytics/placement', label: 'Placements', icon: <LuBriefcase /> },
        { path: '/management/audit', label: 'Audit Logs', icon: <LuFileCode /> },
        { path: '/management/exam-timetable', label: 'Exam Timetables', icon: <LuCalendar /> },
        { path: '/management/results', label: 'Results', icon: <LuBook /> },
        { path: '/management/substitutions', label: 'Class Substitutions', icon: <LuRefreshCcw /> },
        { path: '/management/certificates', label: 'Certificate', icon: <LuAward /> },
        { path: '/simulations/classroom', label: 'Classroom Allocation', icon: <LuSchool /> },
        { path: '/simulations/energy', label: 'Energy Optimization', icon: <LuLightbulb /> },
        { path: '/simulations/transport', label: 'Transport Analytics', icon: <LuBus /> },
        { path: '/transport', label: 'Transport Directory', icon: <LuBus /> },
        { path: '/simulations/crowd', label: 'Crowd Flow', icon: <LuUsers /> },
        { path: '/predictions', label: 'Predictive Analytics', icon: <LuCpu /> },

        { path: '/change-password', label: 'Change Password', icon: <LuKey /> },
    ];

    const facultyNavItems = [
        { path: '/', label: 'Dashboard', icon: <LuLayoutDashboard />, exact: true },
        { path: '/faculty/academics', label: 'Academics', icon: <LuBook /> },
        { path: '/faculty/attendance', label: 'Attendance', icon: <LuCalendar /> },
        { path: '/faculty/leaves', label: 'Leaves & Approvals', icon: <LuRefreshCcw /> },
        { path: '/faculty/analytics', label: 'Class Analytics', icon: <LuTrendingUp /> },
        { path: '/faculty/proctor', label: 'Proctor Wards', icon: <LuUsers /> },
        { path: '/faculty/research', label: 'Research Tracker', icon: <LuLightbulb /> },
        { path: '/transport', label: 'Transport Directory', icon: <LuBus /> },
        { path: '/change-password', label: 'Change Password', icon: <LuKey /> },
    ];

    const navItems = user?.role === 'FACULTY' ? facultyNavItems : adminNavItems;

    return (
        <div className="stu-layout">
            {/* ── Sidebar ── */}
            <aside className={`stu-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="stu-sidebar-header" style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center', overflow: 'hidden', height: '50px', background: 'var(--ims-topbar-bg)' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 0 }}>
                        {sidebarOpen ? (
                            <img
                                src={isDarkMode ? "/assets/images/institutional-light-logo.png" : "/assets/images/institutional-dark-logo.png"}
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

                <div className="stu-sidebar-search">
                    <GlobalSearch navItems={navItems} />
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

                {/* Desktop-only collapse button at sidebar bottom */}
                <button
                    className="stu-sidebar-collapse-btn"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
                >
                    <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {sidebarOpen ? '\u276e' : '\u276f'}
                    </span>
                </button>
            </aside>

            {/* Mobile Sidebar Backdrop */}
            <AnimatePresence>
                {sidebarOpen && window.innerWidth <= 768 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 999
                        }}
                    />
                )}
            </AnimatePresence>

            {/* ── Main ── */}
            <div className="stu-main">
                {/* Top Bar — exact IMS mirror */}
                {/* Top Bar — refined visibility */}
                <header className="stu-topbar">
                    <div className="stu-topbar-left lg:hidden desktop-hidden" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '10px' }}>
                        {/* 1. Hamburger Toggle (Mobile Only) */}
                        <button
                            className="stu-hamburger"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{
                                background: 'none', border: 'none', fontSize: '24px',
                                cursor: 'pointer', color: 'var(--ims-icon-color)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <LuMenu />
                        </button>

                        {/* 2. Logo (Mobile Only) */}
                        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                            <img
                                src={isDarkMode ? "/assets/images/institutional-light-logo.png" : "/assets/images/institutional-dark-logo.png"}
                                alt="RIT"
                                style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
                            />
                        </Link>
                    </div>

                    <div className="stu-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto', padding: '0 20px' }}>

                        {/* 3. Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            style={{
                                background: 'none', border: 'none', fontSize: '20px',
                                cursor: 'pointer', color: 'var(--ims-icon-color)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            title={`Theme: ${themePreference}`}
                        >
                            {themePreference === 'system' ? <LuMonitor /> : isDarkMode ? <LuMoon /> : <LuSun />}
                        </button>

                        {/* 4. Notifications */}
                        <NotificationBar />

                        {/* 5. User Profile */}
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <button
                                className="stu-user-badge"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                <LuUser className="user-icon" />
                                <span className="hidden md:inline">{displayName}</span>
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
                                            background: isDarkMode ? 'var(--ims-topbar-bg)' : 'white',
                                            borderRadius: '4px',
                                            boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.15)',
                                            width: '180px',
                                            zIndex: 1000,
                                            border: isDarkMode ? '1px solid #444' : '1px solid #eee'
                                        }}
                                    >
                                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f4f4f4', background: isDarkMode ? 'var(--ims-bg-dark)' : '#f8fafc' }}>
                                            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 'bold' }}>Signed in as</div>
                                            <div style={{ fontSize: '13px', color: isDarkMode ? '#e2e8f0' : '#333', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'admin@ritchennai.edu.in'}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--color-accent-gold)', marginTop: '4px', fontWeight: 'bold' }}>{user?.role}</div>
                                        </div>
                                        <NavLink
                                            to="/change-password"
                                            style={{ display: 'block', padding: '12px 16px', textDecoration: 'none', color: isDarkMode ? '#e2e8f0' : '#333', fontSize: '14px', borderBottom: '1px solid #f4f4f4' }}
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <LuKey style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Change Password
                                        </NavLink>
                                        <NavLink
                                            to="/profile"
                                            style={{ display: 'block', padding: '12px 16px', textDecoration: 'none', color: isDarkMode ? '#e2e8f0' : '#333', fontSize: '14px', borderBottom: '1px solid #f4f4f4' }}
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <LuUser style={{ marginRight: '8px', verticalAlign: 'middle' }} /> My Profile
                                        </NavLink>
                                        <NavLink
                                            to="/settings"
                                            style={{ display: 'block', padding: '12px 16px', textDecoration: 'none', color: isDarkMode ? '#e2e8f0' : '#333', fontSize: '14px', borderBottom: '1px solid #f4f4f4' }}
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <LuSettings style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Settings
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
