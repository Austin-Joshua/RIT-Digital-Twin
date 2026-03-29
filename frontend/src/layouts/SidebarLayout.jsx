import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import {
    FaChartPie,
    FaChalkboardTeacher,
    FaSolarPanel,
    FaBus,
    FaUsers,
    FaLeaf,
    FaSignOutAlt,
    FaUserCircle
} from 'react-icons/fa';

const SidebarLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: <FaChartPie /> },
        { path: '/classroom', label: 'Classroom Allocation', icon: <FaChalkboardTeacher /> },
        { path: '/energy', label: 'Energy Optimization', icon: <FaSolarPanel /> },
        { path: '/transport', label: 'Transport Simulation', icon: <FaBus /> },
        { path: '/crowd', label: 'Crowd Flow', icon: <FaUsers /> },
        { path: '/sustainability', label: 'Sustainability', icon: <FaLeaf /> },
    ];

    return (
        <div className="flex h-screen bg-[#F4F6F9] font-sans">
            {/* Sidebar - Fixed Width 240px, Primary Navy */}
            <aside className="w-[240px] bg-navy-900 text-white flex flex-col fixed h-full z-10">
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-center border-b border-navy-800 bg-navy-900">
                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-gold-500 rounded-sm flex items-center justify-center text-navy-900 font-bold shrink-0">
                            RIT
                        </div>
                        <span className="font-bold tracking-wide text-lg text-white">SMART CAMPUS</span>
                    </div>
                </div>

                <nav className="flex-1 py-4 overflow-y-auto">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center px-6 py-3 transition-colors duration-200 text-[14px] font-medium ${isActive
                                            ? 'bg-navy-800 border-l-4 border-gold-500 text-white'
                                            : 'text-gray-300 hover:bg-navy-800 hover:text-white border-l-4 border-transparent'
                                        }`
                                    }
                                >
                                    <span className="mr-3 text-lg text-gold-500">{item.icon}</span>
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-navy-800 bg-navy-900">
                    <div className="flex items-center mb-4 px-2">
                        <FaUserCircle className="text-3xl text-gray-300 mr-3" />
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate">{user?.username || 'User'}</p>
                            <p className="text-xs text-gray-400 capitalize">{(user?.role === 'ADMIN' ? 'Admin' : user?.role) || 'Guest'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="app-logout w-full flex items-center justify-start px-4 py-3 border-t border-navy-700 rounded-none transition-colors"
                        style={{ color: '#ef4444', fontWeight: 800, fontSize: '14px', background: 'transparent' }}
                    >
                        <FaSignOutAlt size={18} className="mr-2 flex-shrink-0" style={{ color: 'inherit' }} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col ml-[240px]">
                {/* Header - Height 64px, Primary Navy */}
                <header className="h-[64px] bg-navy-900 shadow-md flex items-center justify-between px-6 sticky top-0 z-20">
                    <h2 className="text-xl font-semibold text-white tracking-wide">Smart Campus Intelligence Platform</h2>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-300">Academic Year 2025-2026</div>
                        <div className="h-8 w-8 rounded-full bg-navy-800 border border-gold-500 flex items-center justify-center text-gold-500 font-bold text-xs">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                </header>

                {/* Page Content - Padding 24px, BG Light Grey */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <Outlet />
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-3 px-6 text-center text-gray-500 text-xs">
                    Empowering Data-Driven Institutional Governance
                </footer>
            </div>
        </div>
    );
};

export default SidebarLayout;
