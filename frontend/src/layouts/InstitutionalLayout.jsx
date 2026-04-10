import React, { useState, useContext, Suspense, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { ThemeContext } from '../hooks/ThemeContext';
import { useToast } from '../hooks/ToastContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/layout/Header';
import SystemBroadcastBar from '../components/layout/SystemBroadcastBar';
import ChatbotWidget from '../features/ai/components/ChatbotWidget';
import {
    LuLayoutDashboard, LuTrendingUp, LuBriefcase,
    LuFileCode, LuCalendar, LuBook, LuRefreshCcw, LuAward,
    LuSchool, LuLightbulb, LuBus, LuUsers, LuCpu, LuKey, LuShieldAlert,
    LuLayoutGrid, LuFlame
} from 'react-icons/lu';
import Skeleton from '../components/common/Skeleton';

const LayoutLoader = () => (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

const InstitutionalLayout = () => {
    const { user, logout } = useAuth();
    const { addToast } = useToast();
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
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        const handleBroadcastSync = (e) => {
            if (e.key === 'rit_global_broadcast' && e.newValue) {
                const broadcast = JSON.parse(e.newValue);
                addToast(`📢 Broadcast: ${broadcast.title}`, 'info');
            }
        };
        window.addEventListener('storage', handleBroadcastSync);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('storage', handleBroadcastSync);
        };
    }, [addToast]);

    // Optimized Performance Callbacks
    const handleLogout = useCallback(() => {
        logout();
        navigate('/login', { replace: true });
    }, [logout, navigate]);

    const handleToggleTheme = useCallback(() => toggleTheme(), [toggleTheme]);
    const handleSetSidebarOpen = useCallback((val) => setSidebarOpen(val), []);
    const handleSetUserMenuOpen = useCallback((val) => setUserMenuOpen(val), []);

    const displayName = user?.firstName && user?.lastName
        ? (user.role === 'HOD' 
            ? `HOD. ${user.lastName}` 
            : user.role === 'FACULTY' 
                ? `PROF. ${user.lastName}` 
                : `${user.firstName} ${user.lastName}`
          ).toUpperCase()
        : (user?.username || user?.role || 'User').toUpperCase();

    const displaySub = user?.department 
        ? `${user.role === 'HOD' ? 'Department Head' : user.role} • ${user.department}` 
        : (user?.role || 'Institutional User');

    const adminNavItems = [
        { path: '/', label: 'Home', icon: <LuLayoutDashboard />, exact: true },
        { path: '/analytics', label: 'Analytics', icon: <LuTrendingUp />, exact: true },
        { path: '/analytics/placement', label: 'Placements', icon: <LuBriefcase /> },
        { path: '/management/audit', label: 'Audit Logs', icon: <LuFileCode /> },
        { path: '/management/users', label: 'User Accounts', icon: <LuShieldAlert /> },
        { path: '/management/exam-timetable', label: 'Exam Timetables', icon: <LuCalendar /> },
        { path: '/management/results', label: 'Results', icon: <LuBook /> },
        { path: '/management/clubs', label: 'Club Management', icon: <LuUsers /> },
        { path: '/management/substitutions', label: 'Class Substitutions', icon: <LuRefreshCcw /> },
        { path: '/management/certificates', label: 'Certificate', icon: <LuAward /> },
        { path: '/simulations/classroom', label: 'Classroom Allocation', icon: <LuSchool /> },
        { path: '/simulations/energy', label: 'Energy Optimization', icon: <LuLightbulb /> },
        { path: '/simulations/transport', label: 'Route Flow Visualization', icon: <LuBus /> },
        { path: '/simulations/crowd', label: 'Crowd Flow', icon: <LuUsers /> },
        { path: '/simulations/sustainability', label: 'Sustainability', icon: <LuFlame /> },
        { path: '/predictions', label: 'Predictive Analysis', icon: <LuTrendingUp /> },
        { path: '/management/algorithms', label: 'Smart Algorithms', icon: <LuCpu /> },
        { path: '/change-password', label: 'Change Password', icon: <LuKey /> },
    ];

    const facultyNavItems = [
        { path: '/faculty', label: 'Dashboard', icon: <LuLayoutDashboard />, exact: true },
        { path: '/faculty/academics', label: 'Academics', icon: <LuBook /> },
        { path: '/faculty/timetable', label: 'My Timetable', icon: <LuCalendar /> },
        { path: '/faculty/grading', label: 'Performance Grading', icon: <LuAward /> },
        { path: '/faculty/attendance', label: 'Attendance', icon: <LuCalendar /> },
        { path: '/faculty/leaves', label: 'Leaves & Approvals', icon: <LuRefreshCcw /> },
        { path: '/faculty/analytics', label: 'Class Analytics', icon: <LuTrendingUp /> },
        { path: '/faculty/proctor', label: 'Proctor Wards', icon: <LuUsers /> },
        { path: '/faculty/clubs', label: 'Club Management', icon: <LuLayoutGrid /> },
        { path: '/faculty/research', label: 'Research Tracker', icon: <LuLightbulb /> },
        { path: '/faculty/upload-marks', label: 'Upload Marks', icon: <LuAward /> },
        { path: '/faculty/risk-heatmap', label: 'Class Risk Heatmap', icon: <LuShieldAlert /> },
        { path: '/change-password', label: 'Change Password', icon: <LuKey /> },
    ];

    const navItems = (user?.role === 'FACULTY') ? facultyNavItems : adminNavItems;

    return (
        <div className={`stu-layout ${isDarkMode ? 'dark' : 'light'}`}>
            <SystemBroadcastBar />
            
            <Sidebar 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={handleSetSidebarOpen}
                user={user}
                isDesktop={isDesktop}
                navItems={navItems}
            />

            {/* Mobile Sidebar Backdrop */}
            <AnimatePresence>
                {sidebarOpen && !isDesktop && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="sidebar-backdrop"
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 999
                        }}
                    />
                )}
            </AnimatePresence>

            {/* ── Main Container ── */}
            <div className="stu-main">
                <Header 
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={handleSetSidebarOpen}
                    isDarkMode={isDarkMode}
                    toggleTheme={handleToggleTheme}
                    themePreference={themePreference}
                    displayName={displayName}
                    displaySub={displaySub}
                    user={user}
                    userMenuOpen={userMenuOpen}
                    setUserMenuOpen={handleSetUserMenuOpen}
                    logout={handleLogout}
                    dropdownRef={dropdownRef}
                />

                {/* Content Area */}
                <main className="stu-content">
                    <Suspense fallback={<LayoutLoader />}>
                        <Outlet />
                    </Suspense>
                </main>

                {/* AI Assistant Integration */}
                <ChatbotWidget />
            </div>
        </div>
    );
};

export default InstitutionalLayout;
