import React, { useState, useContext, Suspense, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/AuthContext';
import {
    LuLayoutDashboard, LuCalendar, LuBookOpen, LuFileText, LuCalendarCheck2,
    LuAward, LuPenTool, LuSquareCheck, LuClipboardList,
    LuBook, LuBanknote, LuMessageSquare, LuUsers,
    LuFileCheck, LuMail, LuKey, LuLogOut, LuListChecks,
    LuMenu, LuUser, LuChevronDown, LuChevronRight, LuBus, LuCalculator, LuSettings, LuMap,
    LuSun, LuMoon, LuMonitor
} from 'react-icons/lu';
import GlobalSearch from '../components/common/GlobalSearch';
import Sidebar from '../components/Sidebar';
import NotificationBar from '../components/NotificationBar';
import { ThemeContext } from '../hooks/ThemeContext';
import ChatbotWidget from '../features/ai/components/ChatbotWidget';
import './student-layout.css';

const studentNav = [
    { path: '/student', label: 'Dashboard', icon: <LuLayoutDashboard />, end: true },
    { path: '/student/timetable', label: 'My Time Table', icon: <LuCalendar /> },
    { path: '/student/registration', label: 'My Subject Registration', icon: <LuBookOpen /> },
    { path: '/student/leave', label: 'Apply Leave / OD', icon: <LuFileText /> },
    { path: '/student/attendance', label: 'Attendance', icon: <LuCalendarCheck2 /> },
    { path: '/student/certificates', label: 'Apply Certificates', icon: <LuAward /> },
    { path: '/student/cat-mark', label: 'CAT Mark', icon: <LuPenTool /> },
    { path: '/student/lab-mark', label: 'LAB Mark', icon: <LuSquareCheck /> },
    { path: '/student/assignment', label: 'Assignment Mark', icon: <LuClipboardList /> },
    { path: '/student/gradebook', label: 'Grade Book', icon: <LuBook /> },
    { path: '/student/fee', label: 'Academic Fee', icon: <LuBanknote /> },
    { path: '/student/exam-fee', label: 'Exam Fee', icon: <LuBanknote /> },
    { path: '/student/feedbacks', label: 'Feedbacks', icon: <LuMessageSquare /> },
];

const LG_BREAKPOINT = 1024;
const StudentLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme, themePreference } = useContext(ThemeContext);
    const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= LG_BREAKPOINT);
    const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= LG_BREAKPOINT);
    const [committeeOpen, setCommitteeOpen] = useState(false);
    const [digitalTwinOpen, setDigitalTwinOpen] = useState(false);
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
        : (user?.username || 'AUSTIN JOSHUA M').toUpperCase();

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
                { path: '/student/committee/minutes', label: 'Minutes Of Meet', icon: <LuFileText /> },
            ]
        },
        { path: '/student/no-due', label: 'No Due Request', icon: <LuFileCheck /> },
        { path: '/student/assessments', label: 'Assessments', icon: <LuListChecks /> },
        { path: '/student/messages', label: 'Messages', icon: <LuMail /> },
        { path: '/student/change-password', label: 'Change password', icon: <LuKey /> },
        {
            label: 'Digital Twin Labs',
            icon: <LuMap />,
            isDropdown: true,
            isOpen: digitalTwinOpen,
            onToggle: () => setDigitalTwinOpen(!digitalTwinOpen),
            subItems: [
                { path: '/student/simulator', label: 'CGPA Simulator', icon: <LuCalculator /> },
                { path: '/student/clubs', label: 'Club Management', icon: <LuUsers /> },
                { path: '/student/transport', label: 'Transport Directory', icon: <LuBus /> },
                { path: '/student/map', label: 'Campus IoT Map', icon: <LuMap /> },
            ]
        }
    ];

    return (
        <div className="stu-layout">
            {/* ── Sidebar ── */}
            <Sidebar 
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                user={user}
                isDesktop={isDesktop}
                navItems={navItems}
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
                {/* Top Bar — exact IMS: white topbar, gray icons, blue user pill */}
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

                    <div className="stu-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto', padding: '0 16px' }}>

                        {/* 3. Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="stu-topbar-icon-btn"
                            style={{
                                background: 'none', border: 'none', fontSize: '20px',
                                cursor: 'pointer', color: '#6c757d',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            title={`Theme: ${themePreference}`}
                        >
                            {themePreference === 'system' ? <LuMonitor size={20} /> : isDarkMode ? <LuMoon size={20} /> : <LuSun size={20} />}
                        </button>

                        {/* 4. Notifications */}
                        <NotificationBar />

                        {/* 5. User Profile (Authentic IMS Royal Blue Pill) */}
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <button
                                className="stu-user-badge"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backgroundColor: '#007bff',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '6px 14px',
                                    fontWeight: 600,
                                    fontSize: '12.5px',
                                    cursor: 'pointer',
                                    letterSpacing: '0.3px',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <LuUser className="user-icon" style={{ fontSize: '15px' }} />
                                <span>{displayName}</span>
                            </button>

                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -6 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -6 }}
                                        transition={{ duration: 0.15 }}
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            marginTop: '6px',
                                            background: isDarkMode ? '#1e293b' : '#ffffff',
                                            borderRadius: '4px',
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                            width: '180px',
                                            zIndex: 1000,
                                            border: isDarkMode ? '1px solid #444' : '1px solid #e9ecef',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <NavLink
                                            to="/student/profile"
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                padding: '10px 16px', textDecoration: 'none',
                                                color: isDarkMode ? '#e2e8f0' : '#333333', fontSize: '13px',
                                                borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #f1f5f9'
                                            }}
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <LuUser size={15} /> My Profile
                                        </NavLink>
                                        <button
                                            onClick={handleLogout}
                                            className="app-logout"
                                            style={{
                                                width: '100%', textAlign: 'left', padding: '10px 16px',
                                                border: 'none', background: 'transparent',
                                                color: '#ef4444', fontSize: '13px', cursor: 'pointer',
                                                fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'
                                            }}
                                        >
                                            <LuLogOut size={15} /> <span>Logout</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="stu-content" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 56px)' }}>
                    <div style={{ flex: 1 }}>
                        <Suspense fallback={
                            <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', color: 'var(--theme-text)', opacity: 0.9, fontWeight: 700 }}>
                                <div className="app-soft-loader" />
                                Loading page...
                            </div>
                        }>
                            <Outlet />
                        </Suspense>
                    </div>

                    {/* Authentic Institutional Footer */}
                    <footer className="stu-footer" style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 24px', fontSize: '12.5px', color: '#6c757d',
                        borderTop: '1px solid #e9ecef', background: isDarkMode ? '#1e293b' : '#ffffff',
                        marginTop: 'auto'
                    }}>
                        <span>&copy; All rights reserved.</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: isDarkMode ? '#f8fafc' : '#333333' }}>
                            <img src="/assets/images/RIT_LOGO.webp" alt="RIT" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                            <span>RIT-IMS</span>
                        </div>
                    </footer>
                </div>

                {/* AI Assistant Integration */}
                <ChatbotWidget studentId={user?.id} />
            </div>
        </div>
    );
};

export default StudentLayout;
