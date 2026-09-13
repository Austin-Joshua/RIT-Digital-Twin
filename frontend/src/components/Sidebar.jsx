import React, { useEffect, useState, useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ThemeContext } from '../hooks/ThemeContext';
import { LuSearch } from 'react-icons/lu';
import { sectionsForRole } from '../platform/navCatalog';
import CommandBar from '../platform/ui/CommandBar';

const Sidebar = ({ 
    sidebarOpen, 
    setSidebarOpen, 
    user, 
    isDesktop
}) => {
    const { isDarkMode } = useContext(ThemeContext);
    const [commandOpen, setCommandOpen] = useState(false);
    const normalizedRole = String(user?.role || '').replace('ROLE_', '').toUpperCase();
    const sections = sectionsForRole(normalizedRole);
    const homePath = normalizedRole === 'STUDENT'
        ? '/student'
        : normalizedRole === 'PARENT'
            ? '/parent'
            : normalizedRole === 'HOD'
                ? '/hod'
                : normalizedRole === 'FACULTY'
                    ? '/faculty'
                    : '/';

    useEffect(() => {
        const onKey = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setCommandOpen((open) => !open);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    return (
        <aside className={`stu-sidebar ${sidebarOpen ? 'open' : ''}`}>
            {/* Sidebar Header with Logo */}
            <div className="stu-sidebar-header" style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center', overflow: 'hidden', height: '50px', background: 'var(--ims-topbar-bg)' }}>
                <Link to={homePath} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 0 }}>
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
                <button type="button" className="command-launch" onClick={() => setCommandOpen(true)} aria-label="Search the campus">
                    <LuSearch size={16} aria-hidden="true" />
                    <span>Search</span>
                    <kbd>Ctrl K</kbd>
                </button>
            </div>

            <nav className="stu-nav" aria-label="Campus">
                {sections.map((section) => (
                    <div key={section.id} className="nav-section">
                        <p className="nav-section-label">{section.label}</p>
                        {section.items.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={Boolean(item.end)}
                                    className={({ isActive }) => `stu-nav-item ${isActive ? 'active' : ''}`}
                                    onClick={() => {
                                        if (!isDesktop) setSidebarOpen(false);
                                    }}
                                >
                                    <span className="nav-icon">{Icon ? <Icon size={16} /> : null}</span>
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                ))}
            </nav>
            <CommandBar open={commandOpen} onClose={() => setCommandOpen(false)} />
        </aside>
    );
};

export default React.memo(Sidebar);
