import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LuLayoutDashboard,
    LuCalendar,
    LuCalendarCheck2,
    LuAward,
    LuUser,
    LuBookOpen,
    LuBanknote,
    LuFileText,
    LuUsers
} from 'react-icons/lu';
import { useAuth } from '../../hooks/AuthContext';

const MobileBottomNav = () => {
    const { user } = useAuth();
    const role = user?.role || 'ROLE_STUDENT';

    let navItems = [
        { path: '/student', label: 'Home', icon: <LuLayoutDashboard size={20} />, end: true },
        { path: '/student/timetable', label: 'Timetable', icon: <LuCalendar size={20} /> },
        { path: '/student/attendance', label: 'Attendance', icon: <LuCalendarCheck2 size={20} /> },
        { path: '/student/cat-mark', label: 'Marks', icon: <LuAward size={20} /> },
        { path: '/student/profile', label: 'Profile', icon: <LuUser size={20} /> },
    ];

    if (role === 'ROLE_PARENT') {
        navItems = [
            { path: '/parent', label: 'Home', icon: <LuLayoutDashboard size={20} />, end: true },
            { path: '/parent/attendance', label: 'Attendance', icon: <LuCalendarCheck2 size={20} /> },
            { path: '/parent/grades', label: 'Grades', icon: <LuAward size={20} /> },
            { path: '/parent/fees', label: 'Fees', icon: <LuBanknote size={20} /> },
            { path: '/parent/profile', label: 'Profile', icon: <LuUser size={20} /> },
        ];
    } else if (role === 'ROLE_FACULTY') {
        navItems = [
            { path: '/faculty/academics', label: 'Academics', icon: <LuBookOpen size={20} /> },
            { path: '/faculty/attendance', label: 'Attendance', icon: <LuCalendarCheck2 size={20} /> },
            { path: '/faculty/grading', label: 'Grading', icon: <LuAward size={20} /> },
            { path: '/faculty/timetable', label: 'Schedule', icon: <LuCalendar size={20} /> },
            { path: '/faculty/leaves', label: 'Leaves', icon: <LuFileText size={20} /> },
        ];
    } else if (role === 'ROLE_HOD') {
        navItems = [
            { path: '/hod', label: 'Overview', icon: <LuLayoutDashboard size={20} />, end: true },
            { path: '/hod/performance', label: 'Academics', icon: <LuAward size={20} /> },
            { path: '/faculty/attendance', label: 'Registers', icon: <LuCalendarCheck2 size={20} /> },
            { path: '/faculty/leaves', label: 'Leaves', icon: <LuFileText size={20} /> },
            { path: '/profile', label: 'Profile', icon: <LuUser size={20} /> },
        ];
    } else if (role === 'ROLE_ADMIN' || role === 'ROLE_SUPER_ADMIN') {
        navItems = [
            { path: '/management', label: 'Twin', icon: <LuLayoutDashboard size={20} />, end: true },
            { path: '/management/users', label: 'Users', icon: <LuUsers size={20} /> },
            { path: '/management/results', label: 'Results', icon: <LuAward size={20} /> },
            { path: '/transport', label: 'Transit', icon: <LuCalendar size={20} /> },
            { path: '/profile', label: 'Profile', icon: <LuUser size={20} /> },
        ];
    }

    return (
        <nav
            className="ims-mobile-bottom-nav"
            aria-label="Mobile Navigation"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '62px',
                background: 'var(--card-bg, #ffffff)',
                borderTop: '1px solid var(--theme-border, #e2e8f0)',
                boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
                zIndex: 995,
                display: 'none', // Handled by media query
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '0 6px',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)'
            }}
        >
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    style={({ isActive }) => ({
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px',
                        textDecoration: 'none',
                        color: isActive ? '#0B2C6B' : 'var(--theme-text-muted, #64748b)',
                        fontWeight: isActive ? '700' : '500',
                        fontSize: '10.5px',
                        padding: '6px 10px',
                        borderRadius: '12px',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                        flex: 1,
                        maxWidth: '72px'
                    })}
                >
                    {({ isActive }) => (
                        <>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '24px',
                                    borderRadius: '12px',
                                    background: isActive ? 'rgba(11, 44, 107, 0.1)' : 'transparent',
                                    color: isActive ? '#0B2C6B' : 'inherit',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {item.icon}
                            </div>
                            <span style={{ letterSpacing: '0.2px' }}>{item.label}</span>
                            {isActive && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        bottom: '2px',
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        backgroundColor: '#0B2C6B'
                                    }}
                                />
                            )}
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
};

export default React.memo(MobileBottomNav);

