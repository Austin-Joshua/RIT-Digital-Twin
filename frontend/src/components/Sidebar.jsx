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
        <div className="rit-sidebar">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h3 style={{ color: 'var(--rit-navy)' }}>RIT Digital Twin</h3>
            </div>
            <nav>
                {menuItems.map((item) => (
                    <NavLink
                        to={item.path}
                        key={item.name}
                        className={({ isActive }) => `rit-sidebar-link ${isActive ? 'active' : ''}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
                <div
                    className="rit-sidebar-link"
                    onClick={logout}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', borderTop: '1px solid #ddd' }}
                >
                    <FaSignOutAlt />
                    <span>Logout</span>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
