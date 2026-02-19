import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FaHome, FaCalendarAlt, FaBook, FaClipboardList,
    FaUserCheck, FaCertificate, FaChartBar, FaFlask, FaTasks,
    FaLayerGroup, FaMoneyBillWave, FaCommentDots, FaSignOutAlt
} from 'react-icons/fa';

const Sidebar = () => {
    const { logout } = useAuth();

    // Menu items based on the provided screenshot
    const menuItems = [
        { path: '/dashboard', name: 'Dashboard', icon: <FaHome /> },
        { path: '/timetable', name: 'My Time Table', icon: <FaCalendarAlt /> },
        { path: '/registration', name: 'My Subject Registration', icon: <FaBook /> },
        { path: '/leave', name: 'Apply Leave / OD', icon: <FaClipboardList /> },
        { path: '/attendance', name: 'Attendance', icon: <FaUserCheck /> },
        { path: '/certificates', name: 'Apply Certificates', icon: <FaCertificate /> },
        { path: '/cat-mark', name: 'CAT Mark', icon: <FaChartBar /> },
        { path: '/lab-mark', name: 'LAB Mark', icon: <FaFlask /> },
        { path: '/assignment', name: 'Assignment Mark', icon: <FaTasks /> },
        { path: '/gradebook', name: 'Grade Book', icon: <FaLayerGroup /> },
        { path: '/fees', name: 'Academic Fee', icon: <FaMoneyBillWave /> },
        { path: '/feedback', name: 'Feedbacks', icon: <FaCommentDots /> },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header" style={{ padding: '20px', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                {/* Logo placeholder - User to provide actual image */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/rit-logo.png" alt="RIT Logo" style={{ height: '40px' }} onError={(e) => e.target.style.display = 'none'} />
                    <div style={{ lineHeight: '1.2' }}>
                        <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#003366' }}>RIT</div>
                        <div style={{ fontSize: '0.6rem', color: '#555', textTransform: 'uppercase' }}>Rajalakshmi Institute<br />of Technology</div>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div style={{ padding: '10px 20px', fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Main Menu
                </div>
                {menuItems.map((item) => (
                    <NavLink
                        to={item.path}
                        key={item.name}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div
                    className="sidebar-link"
                    onClick={logout}
                    style={{ cursor: 'pointer', color: 'var(--color-danger)', borderLeft: '3px solid transparent' }}
                >
                    <span className="sidebar-icon"><FaSignOutAlt /></span>
                    <span>Logout</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
