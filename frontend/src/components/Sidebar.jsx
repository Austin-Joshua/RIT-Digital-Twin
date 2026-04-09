import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ThemeContext } from '../hooks/ThemeContext';
import { LuChevronDown, LuChevronRight } from 'react-icons/lu';
import GlobalSearch from './common/GlobalSearch';

const Sidebar = ({ 
    sidebarOpen, 
    setSidebarOpen, 
    user, 
    isDesktop, 
    navItems = [] 
}) => {
    const { isDarkMode } = useContext(ThemeContext);

    // Filter out dropdown sub-items for search
    const searchItems = navItems.filter(item => !item.subItems).concat(
        navItems.filter(item => item.subItems).flatMap(item => item.subItems)
    );

    return (
        <aside className={`stu-sidebar ${sidebarOpen ? 'open' : ''}`}>
            {/* Sidebar Header with Logo */}
            <div className="stu-sidebar-header" style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center', overflow: 'hidden', height: '50px', background: 'var(--ims-topbar-bg)' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 0 }}>
                    {sidebarOpen ? (
                        /* Wide logo when sidebar open */
                        <img
                            src={isDarkMode ? "/assets/images/institutional-light-logo.png" : "/assets/images/institutional-dark-logo.png"}
                            alt="RIT"
                            style={{ height: '50px', width: 'auto', objectFit: 'contain', maxWidth: '200px' }}
                        />
                    ) : (
                        /* Small round icon when sidebar collapsed */
                        <img
                            src="/assets/images/RIT_LOGO.webp"
                            alt="RIT"
                            style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '6px' }}
                        />
                    )}
                </Link>
            </div>

            {/* Sidebar Search */}
            <div className="stu-sidebar-search">
                <GlobalSearch
                    navItems={searchItems}
                    placeholder="Search"
                />
            </div>

            {/* Navigation */}
            <nav className="stu-nav">
                {navItems.map((item, idx) => (
                    <div key={idx}>
                        {item.subItems || item.isDropdown ? (
                            <>
                                <div
                                    className={`stu-nav-item ${(item.isOpen || item.active) ? 'active' : ''}`}
                                    onClick={item.onToggle}
                                    style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="nav-icon">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </div>
                                    <span className="nav-chevron">
                                        {(item.isOpen || item.active) ? <LuChevronDown fontSize="14px" /> : <LuChevronRight fontSize="14px" />}
                                    </span>
                                </div>
                                {(item.isOpen || item.active) && (
                                    <div className="stu-submenu">
                                        {item.subItems.map((sub) => (
                                            <NavLink
                                                key={sub.path}
                                                to={sub.path}
                                                className={({ isActive }) => `stu-nav-item submenu-item ${isActive ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (!isDesktop) setSidebarOpen(false);
                                                }}
                                            >
                                                <span className="nav-icon">{sub.icon}</span>
                                                <span>{sub.label}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <NavLink
                                to={item.path}
                                end={item.end || item.exact || false}
                                className={({ isActive }) => `stu-nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => {
                                    if (!isDesktop) setSidebarOpen(false);
                                }}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default React.memo(Sidebar);
