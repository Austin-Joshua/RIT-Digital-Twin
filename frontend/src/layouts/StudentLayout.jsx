import React, { useState, useContext, Suspense, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    FaHome, FaClock, FaBookOpen, FaFileAlt, FaCalendarCheck,
    FaCertificate, FaPenFancy, FaFlask, FaClipboardList,
    FaBook, FaMoneyCheckAlt, FaCommentDots, FaUsers,
    FaFileInvoice, FaEnvelope, FaKey, FaSignOutAlt,
    FaBars, FaBell, FaUser, FaChevronDown, FaChevronRight, FaBus, FaCalculator
} from 'react-icons/fa';
import NotificationBar from '../components/NotificationBar';
import GlobalAlertBar from '../components/intelligence/GlobalAlertBar';
import { ThemeContext } from '../context/ThemeContext';
import './student-layout.css';

const studentNav = [
    { path: '/student', label: 'Dashboard', icon: <FaHome />, end: true },
    { path: '/student/timetable', label: 'My Time Table', icon: <FaClock /> },
    { path: '/student/registration', label: 'My Subject Registration', icon: <FaBookOpen /> },
    { path: '/student/leave', label: 'Apply Leave / OD', icon: <FaFileAlt /> },
    { path: '/student/attendance', label: 'Attendance', icon: <FaCalendarCheck /> },
    { path: '/student/certificates', label: 'Apply Certificates', icon: <FaCertificate /> },
    { path: '/student/cat-mark', label: 'CAT Mark', icon: <FaPenFancy /> },
    { path: '/student/lab-mark', label: 'LAB Mark', icon: <FaFlask /> },
    { path: '/student/assignment', label: 'Assignment Mark', icon: <FaClipboardList /> },
    { path: '/student/gradebook', label: 'Grade Book', icon: <FaBook /> },
    { path: '/student/fee', label: 'Academic Fee', icon: <FaMoneyCheckAlt /> },
    { path: '/student/feedbacks', label: 'Feedbacks', icon: <FaCommentDots /> },
    { path: '/student/simulator', label: 'CGPA Simulator', icon: <FaCalculator /> },
];

const StudentLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [committeeOpen, setCommitteeOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

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
        window.location.href = '/login';
    };

    const displayName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`.toUpperCase()
        : (user?.username || 'STUDENT').toUpperCase();

    const navItems = [
        ...studentNav,
        {
            label: 'Class Committee',
            icon: <FaUsers />,
            isDropdown: true,
            isOpen: committeeOpen,
            onToggle: () => setCommitteeOpen(!committeeOpen),
            subItems: [
                { path: '/student/committee/schedule', label: 'Schedule', icon: <FaCalendarCheck /> },
                { path: '/student/committee/minutes', label: 'Minutes Of Meet', icon: <FaFileAlt /> },
            ]
        },
        { path: '/student/nodue', label: 'No Due Request', icon: <FaFileInvoice /> },
        { path: '/student/messages', label: 'Messages', icon: <FaEnvelope /> },
        { path: '/student/change-password', label: 'Change password', icon: <FaKey /> },
    ];

    return (
        <div className="stu-layout">
            {/* ── Sidebar ── */}
            <aside className={`stu-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="stu-sidebar-header" style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center', overflow: 'hidden', height: '50px', background: '#fff' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 0 }}>
                        {sidebarOpen ? (
                            /* Wide logo when sidebar open */
                            <img
                                src="/assets/images/institutional-dark-logo.png"
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

                {/* Search */}
                <div className="stu-sidebar-search">
                    <input type="text" placeholder="Search..." />
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
                                            {item.isOpen ? <FaChevronDown fontSize="10px" /> : <FaChevronRight fontSize="10px" />}
                                        </span>
                                    </div>
                                    {item.isOpen && (
                                        <div className="stu-submenu">
                                            {item.subItems.map((sub) => (
                                                <NavLink
                                                    key={sub.path}
                                                    to={sub.path}
                                                    className={({ isActive }) => `stu-nav-item submenu-item ${isActive ? 'active' : ''}`}
                                                    onClick={() => setSidebarOpen(false)}
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
                                    onClick={() => setSidebarOpen(false)}
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
                {/* Top Bar — exact IMS: white topbar, gray icons */}
                <header className="stu-topbar">
                    <div className="stu-topbar-left" style={{ display: 'flex', alignItems: 'center', padding: 0 }}>
                        <button className="stu-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <FaBars />
                        </button>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', height: '100%', padding: 0 }}>
                            <img
                                src="/assets/images/institutional-dark-logo.png"
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
                                        <NavLink
                                            to="/student/profile"
                                            style={{
                                                display: 'block', padding: '12px 16px', textDecoration: 'none',
                                                color: '#333', fontSize: '14px', borderBottom: '1px solid #f4f4f4'
                                            }}
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            My Profile
                                        </NavLink>
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                width: '100%', textAlign: 'left', padding: '12px 16px',
                                                border: 'none', background: 'none', color: '#333',
                                                fontSize: '14px', cursor: 'pointer'
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
