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
                <header className="top-header">
                    <div className="header-title">Smart Campus Intelligence Platform</div>
                    <div className="user-profile">
                        <span>Welcome, {user?.firstName || 'User'}</span>
                    </div>
                </header>
                <main className="main-content">
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
