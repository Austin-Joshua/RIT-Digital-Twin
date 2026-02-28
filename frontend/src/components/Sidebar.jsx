import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FaHome, FaChalkboardTeacher, FaBolt, FaBus,
    FaUsers, FaLeaf, FaChartLine, FaCog, FaSignOutAlt,
    FaUniversity, FaShieldAlt, FaTools, FaMapMarkedAlt
} from 'react-icons/fa';

const Sidebar = () => {
    const { logout, user } = useAuth();

    // Role-based menu items
    const getMenuItems = () => {
        const baseItems = [
            { path: '/dashboard', name: 'Dashboard', icon: <FaHome /> },
            { path: '/map', name: 'Campus IoT Map', icon: <FaMapMarkedAlt /> },
        ];

        const adminItems = [
            { path: '/classrooms', name: 'Smart Classroom', icon: <FaChalkboardTeacher /> },
            { path: '/energy', name: 'Energy Optimization', icon: <FaBolt /> },
            { path: '/transport', name: 'Transport Manager', icon: <FaBus /> },
            { path: '/crowd', name: 'Crowd Simulation', icon: <FaUsers /> },
            { path: '/sustainability', name: 'Sustainability', icon: <FaLeaf /> },
            { path: '/analytics', name: 'Predictive Analytics', icon: <FaChartLine /> },
            { path: '/management/safety', name: 'Safety Simulation', icon: <FaShieldAlt /> },
            { path: '/management/assets', name: 'Asset Monitoring', icon: <FaTools /> },
            { path: '/settings', name: 'Settings', icon: <FaCog /> },
        ];

        const managementItems = [
            { path: '/classrooms', name: 'Smart Classroom', icon: <FaChalkboardTeacher /> },
            { path: '/energy', name: 'Energy Optimization', icon: <FaBolt /> },
            { path: '/transport', name: 'Transport Manager', icon: <FaBus /> },
            { path: '/sustainability', name: 'Sustainability', icon: <FaLeaf /> },
            { path: '/analytics', name: 'Predictive Analytics', icon: <FaChartLine /> },
        ];

        const facultyItems = [
            { path: '/classrooms', name: 'Smart Classroom', icon: <FaChalkboardTeacher /> },
            { path: '/crowd', name: 'Crowd Monitor', icon: <FaUsers /> },
            { path: '/faculty/upload-marks', name: 'Upload Marks', icon: <FaChartLine /> },
        ];

        const parentItems = [
            { path: '/parent', name: 'Ward Progress', icon: <FaHome /> },
        ];

        const superAdminItems = [
            { path: '/super-admin', name: 'Global View', icon: <FaUniversity /> },
            { path: '/analytics', name: 'Global Analytics', icon: <FaChartLine /> },
            { path: '/settings', name: 'System Settings', icon: <FaCog /> },
        ];

        const role = user?.role || 'FACULTY';

        switch (role) {
            case 'SUPER_ADMIN':
                return [...baseItems, ...superAdminItems];
            case 'PARENT':
                return [...baseItems, ...parentItems];
            case 'ADMIN':
                return [...baseItems, ...adminItems];
            case 'MANAGEMENT':
                return [...baseItems, ...managementItems];
            case 'FACULTY':
            default:
                return [...baseItems, ...facultyItems];
        }
    };

    const menuItems = getMenuItems();

    return (
        <aside className="sidebar" style={{
            width: '260px',
            height: '100vh',
            background: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 1000,
            boxShadow: '2px 0 10px rgba(0,0,0,0.05)'
        }}>
            {/* Header */}
            <div className="sidebar-header" style={{
                padding: '20px 24px',
                background: '#1a365d',
                borderBottom: '3px solid #d4af37'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '44px',
                        height: '44px',
                        background: '#ffffff',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        padding: '4px'
                    }}>
                        <img src="/assets/images/rit-icon.png" alt="RIT" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                        <div style={{
                            fontWeight: '800',
                            fontSize: '1.1rem',
                            color: '#ffffff',
                            letterSpacing: '0.5px',
                            lineHeight: '1.2'
                        }}>
                            Digital Twin
                        </div>
                        <div style={{
                            fontSize: '0.65rem',
                            color: '#d4af37',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            fontWeight: '600',
                            marginTop: '2px'
                        }}>
                            Smart Campus Platform
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav" style={{
                flex: 1,
                padding: '16px 0',
                overflowY: 'auto'
            }}>
                <div style={{
                    padding: '8px 24px',
                    fontSize: '0.7rem',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    fontWeight: '700',
                    marginBottom: '8px'
                }}>
                    Main Navigation
                </div>

                {menuItems.map((item) => (
                    <NavLink
                        to={item.path}
                        key={item.name}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            padding: '14px 24px',
                            color: isActive ? '#1a365d' : '#64748b',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            fontWeight: isActive ? '600' : '500',
                            borderLeft: isActive ? '4px solid #d4af37' : '4px solid transparent',
                            background: isActive ? 'linear-gradient(90deg, rgba(212,175,55,0.1) 0%, transparent 100%)' : 'transparent',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                        })}
                    >
                        <span className="sidebar-icon" style={{
                            fontSize: '1.2rem',
                            minWidth: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {item.icon}
                        </span>
                        <span>{item.name}</span>
                        {item.path === '/crowd' && (
                            <span style={{
                                marginLeft: 'auto',
                                background: '#ef4444',
                                color: '#fff',
                                fontSize: '0.65rem',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontWeight: '700'
                            }}>
                                LIVE
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer" style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc'
            }}>
                <div
                    className="sidebar-link logout-link"
                    onClick={logout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        color: '#dc2626',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease',
                        fontWeight: '600',
                        fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fee2e2';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <span className="sidebar-icon" style={{ fontSize: '1.2rem' }}>
                        <FaSignOutAlt />
                    </span>
                    <span>Logout</span>
                </div>

                <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e2e8f0',
                    fontSize: '0.7rem',
                    color: '#94a3b8',
                    textAlign: 'center',
                    lineHeight: '1.5'
                }}>
                    <div style={{ fontWeight: '600', color: '#64748b' }}>
                        Version 1.0.0
                    </div>
                    <div style={{ marginTop: '4px' }}>
                        Empowering Data-Driven<br />Institutional Governance
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
