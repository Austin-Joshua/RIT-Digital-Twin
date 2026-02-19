import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaChalkboardTeacher, FaBolt, FaBus, FaUsers, FaLeaf, FaChartLine, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();

    const menuItems = [
        { path: '/dashboard', name: 'Dashboard', icon: <FaHome /> },
        { path: '/classrooms', name: 'Classroom Alloc.', icon: <FaChalkboardTeacher /> },
        { path: '/energy', name: 'Energy Mgmt.', icon: <FaBolt /> },
        { path: '/transport', name: 'Transport', icon: <FaBus /> },
        { path: '/crowd', name: 'Crowd Flow', icon: <FaUsers /> },
        { path: '/sustainability', name: 'Sustainability', icon: <FaLeaf /> },
        { path: '/analytics', name: 'Analytics', icon: <FaChartLine /> },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-brand">RIT Digital Twin</div>
            </div>

            <nav className="sidebar-nav">
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
