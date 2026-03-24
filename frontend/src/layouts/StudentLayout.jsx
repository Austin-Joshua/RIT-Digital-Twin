import React, { useState, useContext, Suspense, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    LuLayoutDashboard, LuClock, LuBookOpen, LuFileText, LuCalendarCheck2,
    LuAward, LuPenTool, LuTestTube, LuClipboardList,
    LuBook, LuBanknote, LuMessageSquare, LuUsers,
    LuFileCheck, LuMail, LuKey, LuLogOut,
    LuMenu, LuBell, LuUser, LuChevronDown, LuChevronRight, LuBus, LuCalculator, LuSettings, LuMap,
    LuSun, LuMoon, LuMonitor, LuLayoutGrid
} from 'react-icons/lu';
import GlobalSearch from '../components/common/GlobalSearch';
import NotificationBar from '../components/NotificationBar';
import GlobalAlertBar from '../components/intelligence/GlobalAlertBar';
import { ThemeContext } from '../context/ThemeContext';
import './student-layout.css';

const studentNav = [
    { path: '/student', label: 'Dashboard', icon: <LuLayoutDashboard />, end: true },
    { path: '/student/timetable', label: 'My Time Table', icon: <LuClock /> },
    { path: '/student/registration', label: 'My Subject Registration', icon: <LuBookOpen /> },
    { path: '/student/leave', label: 'Apply Leave / OD', icon: <LuFileText /> },
    { path: '/student/attendance', label: 'Attendance', icon: <LuCalendarCheck2 /> },
    { path: '/student/certificates', label: 'Apply Certificates', icon: <LuAward /> },
    { path: '/student/cat-mark', label: 'CAT Mark', icon: <LuPenTool /> },
    { path: '/student/lab-mark', label: 'LAB Mark', icon: <LuTestTube /> },
    { path: '/student/assignment', label: 'Assignment Mark', icon: <LuClipboardList /> },
    { path: '/student/gradebook', label: 'Grade Book', icon: <LuBook /> },
    { path: '/student/fee', label: 'Academic Fee', icon: <LuBanknote /> },
    { path: '/student/feedbacks', label: 'Feedbacks', icon: <LuMessageSquare /> },
    { path: '/student/simulator', label: 'CGPA Simulator', icon: <LuCalculator /> },
    { path: '/student/clubs', label: 'Club Management', icon: <LuUsers /> },
    { path: '/student/transport', label: 'Transport Directory', icon: <LuBus /> },
    { path: '/student/map', label: 'Campus IoT Map', icon: <LuMap /> },
];

const LG_BREAKPOINT = 1024;
const StudentLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme, themePreference } = useContext(ThemeContext);
    const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= LG_BREAKPOINT);
    const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= LG_BREAKPOINT);
    const [committeeOpen, setCommitteeOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const onResize = () => {
            const d = window.innerWidth >= LG_BREAKPOINT;
            setIsDesktop(d);
            setSidebarOpen(d);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Close dropdown on click outside
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
        navigate('/login', { replace: true });
    };

    const displayName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`.toUpperCase()
        : (user?.username || 'STUDENT').toUpperCase();

    const navItems = [
        ...studentNav,
        {
            label: 'Class Committee',
            icon: <LuUsers />,
            isDropdown: true,
            isOpen: committeeOpen,
            onToggle: () => setCommitteeOpen(!committeeOpen),
            subItems: [
                { path: '/student/committee/schedule', label: 'Schedule', icon: <LuCalendarCheck2 /> },
                { path: '/student/committee/minutes', label: 'Minutes of Meeting', icon: <LuFileText /> },
            ]
        },
        { path: '/student/nodue', label: 'No Due Request', icon: <LuFileCheck /> },
        { path: '/student/messages', label: 'Messages', icon: <LuMail /> },
        { path: '/student/change-password', label: 'Change Password', icon: <LuKey /> },
    ];

    return (
        <div className="stu-layout">
            {/* ── Sidebar ── */}
            <aside className={`stu-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="stu-sidebar-header" style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center', overflow: 'hidden', height: '50px', background: 'var(--ims-topbar-bg)' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 0 }}>
                        {sidebarOpen ? (
                            /* Wide logo when sidebar open */
                            <img
                                src={isDarkMode ? "/assets/images/institutional-light-logo.png" : "/assets/images/institutional-dark-logo.png"}
                                alt="RIT Rajalakshmi Institute of Technology"
                                style={{ height: '50px', width: 'auto', objectFit: 'contain', maxWidth: '200px' }}
                            />
                        ) : (
                            /* Small round icon when sidebar collapsed */
                            <img
                                src="/assets/images/RIT_LOGO.webp"
                                alt="RIT"
                                style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '6px' }}
                            />
                        )}
                    </Link>
                </div>

                <div className="stu-sidebar-search">
                    <GlobalSearch
                        navItems={navItems.filter(item => !item.isDropdown).concat(
                            navItems.filter(item => item.isDropdown).flatMap(item => item.subItems)
                        )}
                        placeholder="Search student portal..."
                    />
                </div>

                {/* Nav */}
                <nav className="stu-nav">
                    {navItems.map((item, idx) => (
                        <div key={idx}>
                            {item.isDropdown ? (
                                <>
                                    <div
                                        className={`stu-nav-item ${item.isOpen ? 'active' : ''}`}
                                        onClick={item.onToggle}
                                        style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className="nav-icon">{item.icon}</span>
                                            <span>{item.label}</span>
                                        </div>
                                        <span className="nav-chevron">
                                            {item.isOpen ? <LuChevronDown fontSize="14px" /> : <LuChevronRight fontSize="14px" />}
                                        </span>
                                    </div>
                                    {item.isOpen && (
                                        <div className="stu-submenu">
                                            {item.subItems.map((sub) => (
                                                <NavLink
                                                    key={sub.path}
                                                    to={sub.path}
                                                    className={({ isActive }) => `stu-nav-item submenu-item ${isActive ? 'active' : ''}`}
                                                    onClick={() => {
                                                        if (!isDesktop) setSidebarOpen(false);
                                                    }}
                                                >
                                                    <span className="nav-icon">{sub.icon}</span>
                                                    <span>{sub.label}</span>
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <NavLink
                                    to={item.path}
                                    end={item.end || false}
                                    className={({ isActive }) => `stu-nav-item ${isActive ? 'active' : ''}`}
                                    onClick={() => {
                                        if (!isDesktop) setSidebarOpen(false);
                                    }}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span>{item.label}</span>
                                </NavLink>
                            )}
                        </div>
                    ))}
                </nav>

            </aside>

            {/* Mobile Sidebar Backdrop */}
            {sidebarOpen && !isDesktop && (
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
                {/* Top Bar — exact IMS: white topbar, gray icons */}
                {/* Top Bar — refined visibility */}
                <header className="stu-topbar">
                    <div className="stu-topbar-left lg:hidden desktop-hidden" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '10px' }}>
                        {/* 1. Hamburger Toggle (Mobile Only) */}
                        <button
                            className="stu-hamburger"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle Sidebar"
                            style={{
                                background: 'none', border: 'none', fontSize: '24px',
                                cursor: 'pointer', color: 'var(--ims-active-blue)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            <LuMenu />
                        </button>

                        {/* 2. Logo (Mobile Only) */}
                        <Link to="/" className="stu-topbar-logo-link" style={{ display: 'flex', alignItems: 'center' }}>
                            <img
                                src={isDarkMode ? "/assets/images/institutional-light-logo.png" : "/assets/images/institutional-dark-logo.png"}
                                alt="RIT"
                                style={{ height: '34px', width: 'auto', objectFit: 'contain', maxWidth: '140px' }}
                            />
                        </Link>
                    </div>

                    <div className="stu-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', padding: '0 8px' }}>

                        {/* 3. Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="stu-topbar-icon-btn"
                            style={{
                                background: 'none', border: 'none', fontSize: '22px',
                                cursor: 'pointer', color: 'var(--ims-icon-color)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            title={`Theme: ${themePreference}`}
                        >
                            {themePreference === 'system' ? <LuMonitor size={22} /> : isDarkMode ? <LuMoon size={22} /> : <LuSun size={22} />}
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
                                            <div style={{ fontSize: '13px', color: isDarkMode ? '#e2e8f0' : '#333', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'student@ritchennai.edu.in'}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--color-accent-gold)', marginTop: '4px', fontWeight: 'bold' }}>{user?.role === 'ADMIN' ? 'Admin' : user?.role}</div>
                                        </div>
                                        <NavLink
                                            to="/student/profile"
                                            style={{
                                                display: 'block', padding: '12px 16px', textDecoration: 'none',
                                                color: isDarkMode ? '#e2e8f0' : '#333', fontSize: '14px', borderBottom: '1px solid #f4f4f4'
                                            }}
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <LuUser style={{ marginRight: '8px', verticalAlign: 'middle' }} /> My Profile
                                        </NavLink>
                                        <NavLink
                                            to="/student/change-password"
                                            style={{
                                                display: 'block', padding: '12px 16px', textDecoration: 'none',
                                                color: isDarkMode ? '#e2e8f0' : '#333', fontSize: '14px', borderBottom: '1px solid #f4f4f4'
                                            }}
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <LuKey style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Change Password
                                        </NavLink>
                                        <NavLink
                                            to="/student/settings"
                                            style={{
                                                display: 'block', padding: '12px 16px', textDecoration: 'none',
                                                color: isDarkMode ? '#e2e8f0' : '#333', fontSize: '14px', borderBottom: '1px solid #f4f4f4'
                                            }}
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <LuSettings style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Settings
                                        </NavLink>
                                        <button
                                            onClick={handleLogout}
                                            className="app-logout"
                                            style={{
                                                width: '100%', textAlign: 'left', padding: '12px 16px',
                                                border: 'none', borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                                                background: 'transparent', color: '#ef4444',
                                                fontSize: '14px', cursor: 'pointer', fontWeight: '800',
                                                display: 'flex', alignItems: 'center', gap: '8px'
                                            }}
                                        >
                                            <LuLogOut size={18} style={{ color: 'inherit', flexShrink: 0 }} /> <span>Logout</span>
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
                    <Suspense fallback={
                        <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ width: '40px', height: '40px', border: '4px solid #ccc', borderTopColor: '#0B2C6B', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        </div>
                    }>
                        <Outlet />
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default StudentLayout;
