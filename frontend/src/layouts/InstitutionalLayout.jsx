import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const InstitutionalLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItems = [
        { path: '/', label: 'Overview', icon: '📊' },
        { path: '/simulations/classroom', label: 'Classroom Allocation', icon: '🏫' },
        { path: '/simulations/energy', label: 'Energy Optimization', icon: '⚡' },
        { path: '/simulations/transport', label: 'Transport Analytics', icon: '🚌' },
        { path: '/simulations/crowd', label: 'Crowd Flow', icon: '👥' },
        { path: '/predictions', label: 'Predictive Analytics', icon: '🔮' },
        { path: '/management', label: 'Governance', icon: '🏛️' },
    ];

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
                    <img
                        src="/assets/images/institutional-branding-logo.png"
                        alt="RIT Branding"
                        style={{ width: '100%', height: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                    />
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '24px 12px' }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
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

                {/* User Section */}
                <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {isSidebarOpen ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#0B2C6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.username}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user?.role}</div>
                            </div>
                            <button onClick={logout} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}>🚪</button>
                        </div>
                    ) : (
                        <button onClick={logout} style={{ width: '100%', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '20px' }}>🚪</button>
                    )}
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
                        <img
                            src="/assets/images/rit-logo.png"
                            alt="RIT Logo"
                            style={{ height: '45px', width: 'auto', display: 'block', filter: 'brightness(0) invert(1)' }}
                        />
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginLeft: '8px' }}>
                            <span>Portal / </span>
                            <span style={{ fontWeight: '600', color: 'white' }}>{navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}</span>
                        </div>
                    </div>
                </motion.header>

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
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default InstitutionalLayout;
