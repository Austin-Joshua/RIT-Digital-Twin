import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LuMenu, LuMonitor, LuMoon, LuSun, LuUser, LuKey, LuLogOut } from 'react-icons/lu';
import NotificationBar from '../NotificationBar';

const Header = ({ 
    sidebarOpen, 
    setSidebarOpen, 
    isDarkMode, 
    toggleTheme, 
    themePreference, 
    displayName, 
    displaySub, 
    user, 
    userMenuOpen, 
    setUserMenuOpen, 
    logout, 
    dropdownRef 
}) => {
    return (
        <header className="stu-topbar">
            <div className="stu-topbar-left lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '10px' }}>
                <button
                    className="stu-hamburger"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle Sidebar"
                    style={{
                        background: 'none', border: 'none', fontSize: '24px',
                        cursor: 'pointer', color: 'var(--ims-active-blue)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                >
                    <LuMenu />
                </button>

                <Link to="/" className="stu-topbar-logo-link" style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src={isDarkMode ? "/assets/images/institutional-light-logo.png" : "/assets/images/institutional-dark-logo.png"}
                        alt="RIT"
                        style={{ height: '34px', width: 'auto', objectFit: 'contain', maxWidth: '140px' }}
                    />
                </Link>
            </div>

            <div className="stu-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', padding: '0 8px' }}>
                <button
                    onClick={toggleTheme}
                    className="stu-topbar-icon-btn"
                    style={{
                        background: 'none', border: 'none', fontSize: '22px',
                        cursor: 'pointer', color: 'var(--ims-icon-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title={`Theme: ${themePreference}`}
                >
                    {themePreference === 'system' ? <LuMonitor size={22} /> : isDarkMode ? <LuMoon size={22} /> : <LuSun size={22} />}
                </button>

                <NotificationBar />

                <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <button
                        className="stu-user-badge"
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                    >
                        <LuUser className="user-icon" />
                        <span className="hidden md:inline">{displayName}</span>
                    </button>

                    <AnimatePresence>
                        {userMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.15 }}
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '8px',
                                    background: 'var(--card-bg)',
                                    borderRadius: '12px',
                                    boxShadow: 'var(--shadow-medium)',
                                    width: '200px',
                                    zIndex: 1000,
                                    border: '1px solid var(--theme-border)',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--theme-border)', background: 'var(--theme-bg-muted)' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Institutional Profile</div>
                                    <div style={{ fontSize: '13px', color: 'var(--theme-text)', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'admin@ritchennai.edu.in'}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--color-primary-navy)', marginTop: '4px', fontWeight: '900', letterSpacing: '0.05em' }}>{displaySub}</div>
                                </div>
                                <NavLink
                                    to="/change-password"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', textDecoration: 'none', color: 'var(--theme-text)', fontSize: '14px', borderBottom: '1px solid var(--theme-border)', transition: '0.2s' }}
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    <LuKey /> <span>Change Password</span>
                                </NavLink>
                                <NavLink
                                    to="/profile"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', textDecoration: 'none', color: 'var(--theme-text)', fontSize: '14px', borderBottom: '1px solid var(--theme-border)', transition: '0.2s' }}
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    <LuUser /> <span>My Profile</span>
                                </NavLink>
                                <div
                                    onClick={logout}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', cursor: 'pointer', color: '#ef4444', fontSize: '14px', transition: '0.2s' }}
                                >
                                    <LuLogOut /> <span style={{ fontWeight: '700' }}>Logout Instance</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default React.memo(Header);
