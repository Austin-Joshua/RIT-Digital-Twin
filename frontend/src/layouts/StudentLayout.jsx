import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FaHome, FaClock, FaBookOpen, FaFileAlt, FaCalendarCheck,
    FaCertificate, FaPenFancy, FaFlask, FaClipboardList,
    FaBook, FaMoneyCheckAlt, FaCommentDots, FaSignOutAlt,
    FaBars, FaUser, FaDesktop
} from 'react-icons/fa';
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
];

const StudentLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const displayName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`.toUpperCase()
        : (user?.username || 'STUDENT').toUpperCase();

    return (
        <div className="stu-layout">
            {/* ── Sidebar ── */}
            <aside className={`stu-sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* Header — RIT brand text only (no logo image) */}
                <div className="stu-sidebar-header">
                    <div className="stu-sidebar-logo">
                        <span>RIT</span>
                    </div>
                    <div className="stu-brand-text">
                        <div className="brand-name">Rajalakshmi<br />Institute of<br />Technology</div>
                        <div className="brand-motto">Believe in the Possibilities</div>
                        <div className="brand-sub">An Autonomous Institution</div>
                    </div>
                </div>

                {/* Search */}
                <div className="stu-sidebar-search">
                    <input type="text" placeholder="Search..." />
                </div>

                {/* Nav */}
                <nav className="stu-nav">
                    {studentNav.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end || false}
                            className={({ isActive }) => `stu-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div style={{ padding: '4px 0', borderTop: '1px solid #e0e0e0' }}>
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
                {/* Top Bar — exact IMS: hamburger left, icons center-ish, user badge right */}
                <header className="stu-topbar">
                    <div className="stu-topbar-left">
                        <button className="stu-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <FaBars />
                        </button>
                    </div>
                    <div className="stu-topbar-right">
                        <span className="stu-topbar-icons">
                            <FaDesktop />
                        </span>
                        <button className="stu-user-badge">
                            <FaUser className="user-icon" />
                            <span>{displayName}</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="stu-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default StudentLayout;
