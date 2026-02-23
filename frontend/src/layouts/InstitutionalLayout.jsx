import React, { useState, useContext, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import NotificationBar from '../components/NotificationBar';
import GlobalAlertBar from '../components/intelligence/GlobalAlertBar';
import { FaUser } from 'react-icons/fa';

const LayoutLoader = () => (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid rgba(11, 44, 107, 0.2)', borderTopColor: '#0B2C6B', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
);

const InstitutionalLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);

    const adminNavItems = [
        { path: '/', label: 'Home', icon: '📊', exact: true },
        { path: '/analytics', label: 'Analytics', icon: '📈' },
        { path: '/analytics/placement', label: 'Placements', icon: '💼' },
        { path: '/management/audit', label: 'Audit Logs', icon: '🛡️' },
        { path: '/management/exam-timetable', label: 'Exam Timetables', icon: '📅' },
        { path: '/management/results', label: 'Results', icon: '✅' },
        { path: '/management/substitutions', label: 'Class Substitutions', icon: '🔄' },
        { path: '/management/certificates', label: 'Certificate', icon: '📜' },
        { path: '/simulations/classroom', label: 'Classroom Allocation', icon: '🏫' },
        { path: '/simulations/energy', label: 'Energy Optimization', icon: '⚡' },
        { path: '/simulations/transport', label: 'Transport Analytics', icon: '🚌' },
        { path: '/simulations/crowd', label: 'Crowd Flow', icon: '👥' },
        { path: '/predictions', label: 'Predictive Analytics', icon: '🔮' },
        { path: '/management', label: 'Governance', icon: '🏛️' },
        { path: '/change-password', label: 'Change Password', icon: '🔑' },
    ];

    const facultyNavItems = [
        { path: '/', label: 'Dashboard', icon: '📊', exact: true },
        { path: '/simulations/classroom', label: 'Timetables', icon: '🏫' },
        { path: '/faculty/upload-marks', label: 'Upload Results', icon: '📝' },
        { path: '/faculty/risk-heatmap', label: 'Class Risk Heatmap', icon: '🔥' },
        { path: '/management', label: 'Student Management', icon: '👥' },
        { path: '/change-password', label: 'Change Password', icon: '🔑' },
    ];

    const navItems = user?.role === 'FACULTY' ? facultyNavItems : adminNavItems;

    const sidebarVariants = {
        open: { width: 280, x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } },
        closed: { width: 80, x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } },
        initial: { x: -280, opacity: 0 }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--theme-bg)' }}>
            {/* Sidebar with Slide-in Entrance */}
            <motion.aside
                initial="initial"
                animate={isSidebarOpen ? 'open' : 'closed'}
                variants={sidebarVariants}
                style={{
                    backgroundColor: 'var(--color-primary-navy)',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    overflow: 'hidden',
                    boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
                    zIndex: 100
                }}
            >
                {/* Logo Section */}
                <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <a href="/" style={{ textDecoration: 'none', display: 'flex', width: '100%' }}>
                        <img
                            src="/assets/images/institutional-light-logo.png"
                            alt="RIT Branding"
                            style={{ width: '100%', height: 'auto', objectFit: 'contain', cursor: 'pointer' }}
                        />
                    </a>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '24px 12px', overflowY: 'auto' }}>
                    {navItems.map((item) => {
                        const isActive = item.exact
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{ textDecoration: 'none' }}
                                onClick={() => {
                                    // Smoothly scroll to top on navigation to ensure new view is visible immediately
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            >
                                <motion.div
                                    whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', borderRadius: '8px',
                                        marginBottom: '8px', color: isActive ? 'var(--color-accent-gold)' : 'rgba(255,255,255,0.7)',
                                        backgroundColor: isActive ? 'rgba(212,175,55,0.1)' : 'transparent',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        fontWeight: isActive ? '600' : '400',
                                        position: 'relative',
                                        borderLeft: isActive ? '4px solid var(--color-accent-gold)' : '4px solid transparent',
                                        paddingLeft: isActive ? '12px' : '16px'
                                    }}
                                >
                                    <span style={{ fontSize: '20px', opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                                    {isSidebarOpen && <span>{item.label}</span>}
                                </motion.div>
                            </Link>
                        );
                    })}


                </nav>

                {/* User Section bottom */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <AnimatePresence>
                        {isUserMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    borderRadius: '12px',
                                    marginBottom: '12px',
                                    padding: '12px',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>User Details</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{user?.username}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.email || 'user@ritchennai.edu.in'}</div>
                                    <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                                        <span style={{ backgroundColor: 'rgba(212,175,55,0.2)', color: 'var(--color-accent-gold)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>
                                            {user?.role}
                                        </span>
                                    </div>
                                </div>
                                <motion.div
                                    onClick={logout}
                                    whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px',
                                        borderRadius: '8px', cursor: 'pointer', color: '#f87171',
                                        fontSize: '0.9rem', fontWeight: '600', transition: '0.2s'
                                    }}
                                >
                                    <span style={{ fontSize: '18px' }}>🚪</span>
                                    <span>Logout</span>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '12px',
                            transition: '0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        {isSidebarOpen ? (
                            <>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#0B2C6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.username}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user?.role}</div>
                                </div>
                                <motion.span animate={{ rotate: isUserMenuOpen ? 180 : 0 }}>
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </motion.span>
                            </>
                        ) : (
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#0B2C6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header with Fade-in */}
                <motion.header
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{
                        height: '72px',
                        backgroundColor: 'var(--color-primary-navy)',
                        color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px',
                        position: 'sticky', top: 0, zIndex: 90,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}>☰</button>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginLeft: '8px' }}>
                            <span>Portal / </span>
                            <span style={{ fontWeight: '600', color: 'white' }}>{navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <NotificationBar />
                        <button
                            onClick={toggleTheme}
                            style={{
                                background: 'none', border: 'none', fontSize: '20px',
                                cursor: 'pointer', color: 'rgba(255,255,255,0.8)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            title="Toggle Dark Mode"
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                        <button style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white', padding: '6px 16px', borderRadius: '20px',
                            fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer'
                        }}>
                            <FaUser />
                            <span>{user?.role === 'FACULTY' ? 'FACULTY MODE' : 'ADMIN MODE'}</span>
                        </button>
                    </div>
                </motion.header>

                <GlobalAlertBar />

                {/* Page Content with Staggered Wrapper */}
                <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                            <Suspense fallback={<LayoutLoader />}>
                                <Outlet />
                            </Suspense>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default InstitutionalLayout;
