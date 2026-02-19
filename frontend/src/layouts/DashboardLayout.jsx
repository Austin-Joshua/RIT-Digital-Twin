import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
    const { user } = useAuth();

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-wrapper">
                <header className="top-header" style={{ height: '60px', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button className="mobile-toggle" style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', marginRight: '15px' }}>
                            ☰
                        </button>
                    </div>
                    <div className="user-profile" style={{ background: '#007bff', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem' }}>👤</span>
                        <span>{user?.firstName ? `${user.firstName} ${user.lastName}`.toUpperCase() : 'AUSTIN JOSHUA M'}</span>
                    </div>
                </header>

                <div style={{ padding: '20px 30px 0 30px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#333', marginBottom: '5px' }}>Hi, welcome back!</h2>
                    <div style={{ background: '#e9ecef', padding: '10px 15px', borderRadius: '4px', color: '#495057', fontSize: '0.9rem' }}>
                        Dashboard
                    </div>
                </div>

                <main className="main-content" style={{ padding: '30px' }}>
                    <Outlet />
                </main>

                <footer className="app-footer">
                    &copy; {new Date().getFullYear()} Rajalakshmi Institute of Technology, Chennai
                </footer>
            </div>
        </div>
    );
};

export default DashboardLayout;
