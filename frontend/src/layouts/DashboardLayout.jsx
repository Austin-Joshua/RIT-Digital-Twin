import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
    const { user } = useAuth();

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: '250px' }}>
                <header className="rit-header">
                    <h2>Smart Campus Intelligence Platform</h2>
                    <div>
                        <span>Welcome, {user?.firstName || 'User'}</span>
                    </div>
                </header>
                <main className="rit-main-content">
                    <Outlet />
                </main>
                <footer style={{ textAlign: 'center', padding: '20px', color: '#666', fontSize: '0.9em' }}>
                    Rajalakshmi Institute of Technology, Chennai
                </footer>
            </div>
        </div>
    );
};

export default DashboardLayout;
