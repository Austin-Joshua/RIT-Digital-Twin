import React, { useState, useContext, Suspense, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    LuLayoutDashboard, LuBookOpen, LuCalendarCheck2, LuAward,
    LuBanknote, LuKey, LuLogOut, LuMenu, LuUser, LuSun, LuMoon, LuMonitor
} from 'react-icons/lu';
import GlobalSearch from '../components/common/GlobalSearch';
import NotificationBar from '../components/NotificationBar';
import { ThemeContext } from '../context/ThemeContext';
import './student-layout.css';

const parentNav = [
    { path: '/parent', label: 'Parent Dashboard', icon: <LuLayoutDashboard />, end: true },
    { path: '/parent/grades', label: 'Academic Grades', icon: <LuAward /> },
    { path: '/parent/attendance', label: 'Attendance Feed', icon: <LuCalendarCheck2 /> },
    { path: '/parent/fees', label: 'Fee Payments', icon: <LuBanknote /> },
    { path: '/parent/change-password', label: 'Change Password', icon: <LuKey /> },
];

const ParentLayout = () => {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme, themePreference } = useContext(ThemeContext);
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (window.innerWidth >= 1025) return true;
        return false;
    });
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const displayName = `PARENT: ${user?.firstName || 'GUARDIAN'}`.toUpperCase();

    return (
        <div className="stu-layout">
            <aside className={`stu-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="stu-sidebar-header" style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center', overflow: 'hidden', height: '50px', background: 'var(--ims-topbar-bg)' }}>
                    <Link to="/parent" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 0 }}>
                        {sidebarOpen ? (
                            <img
                                src={isDarkMode ? "/assets/images/institutional-light-logo.png" : "/assets/images/institutional-dark-logo.png"}
                                alt="RIT"
                                style={{ height: '50px', width: 'auto', objectFit: 'contain', maxWidth: '200px' }}
                            />
                        ) : (
                            <img
                                src="/assets/images/RIT_LOGO.webp"
                                alt="RIT"
                                style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px' }}
                            />
                        )}
                    </Link>
                </div>

                <div className="stu-sidebar-search">
                    <GlobalSearch navItems={parentNav} placeholder="Search portal..." />
                </div>

                <nav className="stu-nav">
                    {parentNav.map((item, idx) => (
                        <div key={idx}>
                            <NavLink
                                to={item.path}
                                end={item.end || false}
                                className={({ isActive }) => `stu-nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => {
                                    if (window.innerWidth <= 768) setSidebarOpen(false);
                                }}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        </div>
                    ))}
                </nav>
            </aside>

            {sidebarOpen && window.innerWidth <= 768 && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
                />
            )}

            <div className="stu-main">
                <header className="stu-topbar">
                    <div className="stu-topbar-left lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '10px' }}>
                        <button
                            className="stu-hamburger"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--ims-active-blue)' }}
                        >
                            <LuMenu />
                        </button>
                        {/* Logo for mobile */}
                        <Link to="/parent" style={{ display: 'flex', alignItems: 'center' }}>
                            <img
                                src={isDarkMode ? "/assets/images/institutional-light-logo.png" : "/assets/images/institutional-dark-logo.png"}
                                alt="RIT"
                                style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
                            />
                        </Link>
                    </div>

                    <div className="stu-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto', padding: '0 20px' }}>
                        <button
                            onClick={toggleTheme}
                            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--ims-icon-color)' }}
                        >
                            {themePreference === 'system' ? <LuMonitor /> : isDarkMode ? <LuMoon /> : <LuSun />}
                        </button>
                        <NotificationBar />
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <button className="stu-user-badge" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                                <LuUser className="user-icon" />
                                <span className="hidden md:inline">{displayName}</span>
                            </button>
                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        style={{
                                            position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                                            background: 'var(--card-bg)', borderRadius: '8px',
                                            boxShadow: 'var(--shadow-medium)', width: '200px', zIndex: 1000,
                                            border: '1px solid var(--theme-border)', overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--theme-border)', background: 'var(--theme-bg-muted)' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>Signed in as</div>
                                            <div style={{ fontSize: '13px', color: 'var(--theme-text)', fontWeight: '800' }}>{user?.email || 'parent@ritchennai.edu.in'}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--color-accent-gold)', marginTop: '4px', fontWeight: 'bold' }}>{user?.role}</div>
                                        </div>
                                        <NavLink
                                            to="/parent/profile"
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', textDecoration: 'none', color: 'var(--theme-text)', fontSize: '14px', borderBottom: '1px solid var(--theme-border)', transition: '0.2s' }}
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <LuUser /> <span>My Profile</span>
                                        </NavLink>
                                        <NavLink
                                            to="/parent/change-password"
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', textDecoration: 'none', color: 'var(--theme-text)', fontSize: '14px', borderBottom: '1px solid var(--theme-border)', transition: '0.2s' }}
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <LuKey /> <span>Change Password</span>
                                        </NavLink>
                                        <button
                                            onClick={handleLogout}
                                            style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: 'none', color: '#ef4444', fontSize: '14px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <LuLogOut /> <span>Logout</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <div className="stu-content">
                    <Suspense fallback={<div>Loading...</div>}>
                        <Outlet />
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default ParentLayout;
