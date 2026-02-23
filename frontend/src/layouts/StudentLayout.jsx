import React, { useState, useContext, Suspense } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
    { path: '/student/transport', label: 'Transport', icon: <FaBus /> },
    { path: '/student/simulator', label: 'What-If Simulator', icon: <FaCalculator /> },
];

const StudentLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [committeeOpen, setCommitteeOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
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
                {/* Header — EXACT IMS MIRROR */}
                <div className="stu-sidebar-header" style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                        src="/assets/images/RIT_LOGO.webp"
                        alt="RIT Institutional Branding"
                        style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px' }}
                    />
                    {sidebarOpen && (
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>
                            RIT Digital Twin <span style={{ fontWeight: 'normal', opacity: 0.8 }}>| Smart Campus Int</span>
                        </span>
                    )}
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

                {/* Logout */}
                <div style={{ padding: '4px 0', borderTop: '1px solid #374850' }}>
                    <button
                        className="stu-nav-item"
                        onClick={handleLogout}
                        style={{ width: '100%', border: 'none', background: 'none', color: '#dd4b39', cursor: 'pointer' }}
                    >
                        <span className="nav-icon"><FaSignOutAlt /></span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <div className="stu-main">
                {/* Top Bar — exact IMS: hamburger left, icons right */}
                <header className="stu-topbar">
                    <div className="stu-topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button className="stu-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <FaBars />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                                src="/assets/images/RIT_LOGO.webp"
                                alt="RIT Logo"
                                style={{ height: '32px', width: '32px', display: 'block', borderRadius: '6px' }}
                            />
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                                RIT Digital Twin <span style={{ fontWeight: 'normal', opacity: 0.8 }}>| Smart Campus Int</span>
                            </span>
                        </div>
                    </div>
                    <div className="stu-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={toggleTheme}
                            style={{
                                background: 'none', border: 'none', fontSize: '20px',
                                cursor: 'pointer', color: 'rgba(255,255,255,0.8)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            title="Toggle Dark Mode"
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                        <NotificationBar />
                        <button className="stu-user-badge">
                            <FaUser className="user-icon" />
                            <span>{displayName}</span>
                        </button>
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
