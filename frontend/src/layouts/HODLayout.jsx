import React, { useState, useContext, Suspense, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LuLayoutDashboard, LuUsers, LuKey, LuMenu, LuMonitor, LuMoon, LuSun, LuUser, LuSettings, LuLogOut } from 'react-icons/lu';
import { useAuth } from '../hooks/AuthContext';
import { ThemeContext } from '../hooks/ThemeContext';
import NotificationBar from '../components/NotificationBar';
import ChatbotWidget from '../features/ai/components/ChatbotWidget';
import './student-layout.css';
import Sidebar from '../components/Sidebar';

import Skeleton from '../components/common/Skeleton';

const LayoutLoader = () => (
  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.2s ease-out' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--theme-text)', opacity: 0.9, fontWeight: 700 }}>
      <div className="app-soft-loader" />
      Loading your workspace...
    </div>
    <Skeleton height="40px" width="300px" />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
      <Skeleton height="120px" />
      <Skeleton height="120px" />
      <Skeleton height="120px" />
      <Skeleton height="120px" />
    </div>
    <Skeleton height="400px" />
  </div>
);

const LG_BREAKPOINT = 1024;

const hodNavItems = [
  { path: '/hod', label: 'Dashboard', icon: <LuLayoutDashboard />, exact: true },
  { path: '/hod/clubs', label: 'Clubs', icon: <LuUsers /> },
  { path: '/hod/change-password', label: 'Change Password', icon: <LuKey /> },
];

const HODLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
    navigate('/login', { replace: true });
  };

  const displayName = user?.lastName
    ? `PROF. ${user.lastName}`.toUpperCase()
    : 'PROF. HOD';

  return (
    <div className="stu-layout">
      <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}
          isDesktop={isDesktop}
          navItems={hodNavItems}
      />

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
                      <div style={{ fontSize: '11px', color: 'var(--color-accent-gold)', marginTop: '4px', fontWeight: 'bold' }}>PROF. HOD</div>
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


        <div className="stu-content">
          <Suspense fallback={<LayoutLoader />}>
            <Outlet />
          </Suspense>
        </div>

        {/* AI Assistant Integration */}
        <ChatbotWidget />
      </div>
    </div>
  );
};

export default HODLayout;
