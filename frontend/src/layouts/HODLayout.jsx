import React, { useState, useContext, Suspense, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import NotificationBar from '../components/NotificationBar';
import GlobalAlertBar from '../components/intelligence/GlobalAlertBar';
import { LuUser, LuMenu, LuLayoutDashboard, LuKey, LuSettings, LuLogOut, LuSun, LuMoon, LuMonitor } from 'react-icons/lu';
import './student-layout.css';

const LayoutLoader = () => (
  <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
    <div style={{ width: '40px', height: '40px', border: '4px solid rgba(11, 44, 107, 0.2)', borderTopColor: '#0B2C6B', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

const LG_BREAKPOINT = 1024;

const hodNavItems = [
  { path: '/hod', label: 'Dashboard', icon: <LuLayoutDashboard />, exact: true },
  { path: '/hod/change-password', label: 'Change Password', icon: <LuKey /> },
];

const HODLayout = () => {
  const { user, logout } = useAuth();
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= LG_BREAKPOINT);
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= LG_BREAKPOINT);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isDarkMode, toggleTheme, themePreference } = useContext(ThemeContext);

  useEffect(() => {
    const onResize = () => {
      const d = window.innerWidth >= LG_BREAKPOINT;
      setIsDesktop(d);
      setSidebarOpen(d);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`.toUpperCase()
    : (user?.username || 'HOD').toUpperCase();

  return (
    <div className="stu-layout">
      <aside className={`stu-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="stu-sidebar-header" style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center', overflow: 'hidden', height: '50px', background: 'var(--ims-topbar-bg)' }}>
          <Link to="/hod" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 0 }}>
            {sidebarOpen ? (
              <img
                src={isDarkMode ? '/assets/images/institutional-light-logo.png' : '/assets/images/institutional-dark-logo.png'}
                alt="RIT"
                style={{ height: '50px', width: 'auto', objectFit: 'contain', maxWidth: '200px' }}
              />
            ) : (
              <img src="/assets/images/RIT_LOGO.webp" alt="RIT" style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '6px' }} />
            )}
          </Link>
        </div>

        <nav className="stu-nav">
          {hodNavItems.map((item, idx) => (
            <div key={idx}>
              <NavLink
                to={item.path}
                end={item.exact || false}
                className={({ isActive }) => `stu-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => { if (!isDesktop) setSidebarOpen(false); }}
              >
                <span className="nav-icon" style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </div>
          ))}
        </nav>
      </aside>

      <AnimatePresence>
        {sidebarOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 999 }}
          />
        )}
      </AnimatePresence>

      <div className="stu-main">
        <header className="stu-topbar">
          <div className="stu-topbar-left lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '10px' }}>
            <button
              className="stu-hamburger"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle Sidebar"
              style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--ims-active-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            >
              <LuMenu />
            </button>
            <Link to="/hod" className="stu-topbar-logo-link" style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={isDarkMode ? '/assets/images/institutional-light-logo.png' : '/assets/images/institutional-dark-logo.png'}
                alt="RIT"
                style={{ height: '34px', width: 'auto', objectFit: 'contain', maxWidth: '140px' }}
              />
            </Link>
          </div>

          <div className="stu-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', padding: '0 8px' }}>
            <button
              onClick={toggleTheme}
              className="stu-topbar-icon-btn"
              style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--ims-icon-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title={`Theme: ${themePreference}`}
            >
              {themePreference === 'system' ? <LuMonitor size={22} /> : isDarkMode ? <LuMoon size={22} /> : <LuSun size={22} />}
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
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'var(--card-bg)', borderRadius: '12px', boxShadow: 'var(--shadow-medium)', width: '200px', zIndex: 1000, border: '1px solid var(--theme-border)', overflow: 'hidden' }}
                  >
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--theme-border)', background: 'var(--theme-bg-muted)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Signed in as</div>
                      <div style={{ fontSize: '13px', color: 'var(--theme-text)', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'hod@ritchennai.edu.in'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-accent-gold)', marginTop: '4px', fontWeight: 'bold' }}>HOD</div>
                    </div>
                    <NavLink to="/hod/change-password" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', textDecoration: 'none', color: 'var(--theme-text)', fontSize: '14px', borderBottom: '1px solid var(--theme-border)', transition: '0.2s' }} onClick={() => setUserMenuOpen(false)}>
                      <LuKey /> <span>Change Password</span>
                    </NavLink>
                    <NavLink to="/hod/settings" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', textDecoration: 'none', color: 'var(--theme-text)', fontSize: '14px', borderBottom: '1px solid var(--theme-border)', transition: '0.2s' }} onClick={() => setUserMenuOpen(false)}>
                      <LuSettings /> <span>Settings</span>
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="app-logout"
                      style={{
                        width: '100%', textAlign: 'left', padding: '12px 16px',
                        border: 'none', borderTop: '1px solid var(--theme-border)',
                        background: 'transparent', color: '#ef4444',
                        fontSize: '14px', cursor: 'pointer', fontWeight: '800',
                        display: 'flex', alignItems: 'center', gap: '8px'
                      }}
                    >
                      <LuLogOut size={18} style={{ color: 'inherit', flexShrink: 0 }} /> <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <GlobalAlertBar />

        <div className="stu-content">
          <Suspense fallback={<LayoutLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default HODLayout;
