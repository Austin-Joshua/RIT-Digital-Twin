import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaBell } from 'react-icons/fa';

const DashboardLayout = () => {
    const { user, logout } = useAuth();

    // If no user, redirect to login
    if (!user && !localStorage.getItem('token')) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
            <Sidebar />
            
            <div className="main-wrapper" style={{ 
                flex: 1, 
                marginLeft: '260px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh'
            }}>
                {/* Top Header */}
                <header className="top-header" style={{
                    height: '70px',
                    padding: '0 32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#ffffff',
                    borderBottom: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }}>
                    {/* Left side - Page title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h1 style={{
                            fontSize: '1.4rem',
                            fontWeight: '700',
                            color: '#1a365d',
                            letterSpacing: '-0.5px'
                        }}>
                            Smart Campus Intelligence Platform
                        </h1>
                    </div>

                    {/* Right side - Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {/* Notifications */}
                        <button style={{
                            position: 'relative',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '10px',
                            borderRadius: '8px',
                            transition: 'background 0.2s'
                        }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                           onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <FaBell size={20} color="#64748b" />
                            <span style={{
                                position: 'absolute',
                                top: '6px',
                                right: '6px',
                                width: '10px',
                                height: '10px',
                                background: '#ef4444',
                                borderRadius: '50%',
                                border: '2px solid #fff'
                            }}></span>
                        </button>

                        {/* User Profile */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px 16px',
                            background: '#1a365d',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 8px rgba(26,54,93,0.3)'
                        }} onMouseEnter={e => e.currentTarget.style.background = '#234876'}
                           onMouseLeave={e => e.currentTarget.style.background = '#1a365d'}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                background: '#d4af37',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                color: '#1a365d',
                                fontSize: '0.9rem'
                            }}>
                                <FaUser size={14} />
                            </div>
                            <div>
                                <div style={{
                                    color: '#ffffff',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.2'
                                }}>
                                    {user?.fullName || user?.firstName || 'Admin User'}
                                </div>
                                <div style={{
                                    color: '#d4af37',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {user?.role || 'ADMIN'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Breadcrumb */}
                <div style={{
                    padding: '16px 32px 0',
                    background: '#ffffff'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.85rem',
                        color: '#64748b'
                    }}>
                        <span style={{ color: '#1a365d', fontWeight: '600' }}>Home</span>
                        <span>/</span>
                        <span>Dashboard</span>
                    </div>
                </div>

                {/* Main Content */}
                <main className="main-content" style={{
                    flex: 1,
                    padding: '24px 32px 32px'
                }}>
                    <Outlet />
                </main>

                {/* Footer */}
                <footer className="app-footer" style={{
                    padding: '20px 32px',
                    background: '#1a365d',
                    borderTop: '3px solid #d4af37',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{
                        fontSize: '0.85rem',
                        color: '#94a3b8'
                    }}>
                        <span style={{ color: '#d4af37', fontWeight: '600' }}>
                            Empowering Data-Driven Institutional Governance
                        </span>
                    </div>
                    <div style={{
                        fontSize: '0.8rem',
                        color: '#64748b'
                    }}>
                        © {new Date().getFullYear()} Smart Campus Platform. All rights reserved.
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DashboardLayout;
