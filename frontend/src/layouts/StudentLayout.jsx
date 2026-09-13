import React, { useState, useContext, Suspense, useRef, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/AuthContext';
import {
    LuMenu, LuUser, LuSun, LuMoon, LuMonitor, LuLogOut
} from 'react-icons/lu';
import Sidebar from '../components/Sidebar';
import NotificationBar from '../components/NotificationBar';
import { ThemeContext } from '../hooks/ThemeContext';
import CampusAssistant from '../features/ai/CampusAssistant';
import PageTransition from '../platform/ui/PageTransition';
import './student-layout.css';

const LG_BREAKPOINT = 1024;
const StudentLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme, themePreference } = useContext(ThemeContext);
    const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= LG_BREAKPOINT);
    const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= LG_BREAKPOINT);
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

    useEffect(() => {
        // Warm up the timetable route chunk so first navigation feels instant.
        const preloadId = window.setTimeout(() => {
            import('../pages/student/Timetable');
        }, 150);
        return () => window.clearTimeout(preloadId);
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

    const resolvedFullName = [user?.firstName, user?.lastName]
        .filter((part) => Boolean(part && String(part).trim()))
        .join(' ')
        .trim();
    const displayName = resolvedFullName
        ? resolvedFullName.toUpperCase()
        : (user?.username || 'STUDENT').toUpperCase();
    const signedInPrimary = resolvedFullName || user?.username || 'Student';
    const signedInSecondary = user?.registerNo
        ? `Reg No: ${user.registerNo}`
        : (user?.email || 'student@ritchennai.edu.in');

    return (
        <div className="stu-layout">
            {/* ── Sidebar ── */}
            <Sidebar 
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                user={user}
                isDesktop={isDesktop}
            />

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
                                            <div style={{ fontSize: '13px', color: isDarkMode ? '#e2e8f0' : '#333', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{signedInPrimary}</div>
                                            <div style={{ fontSize: '11px', color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{signedInSecondary}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--color-accent-gold)', marginTop: '4px', fontWeight: 'bold' }}>{user?.role === 'ADMIN' ? 'Principal' : user?.role}</div>
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


                {/* Content */}
                <div className="stu-content">
                    <Suspense fallback={
                        <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', color: 'var(--theme-text)', opacity: 0.9, fontWeight: 700 }}>
                            <div className="app-soft-loader" />
                            Loading page...
                        </div>
                    }>
                        <PageTransition />
                    </Suspense>
                </div>

                {/* AI Assistant Integration */}
                <CampusAssistant studentId={user?.id} />
            </div>
        </div>
    );
};

export default StudentLayout;
