import { FiSettings, FiClock } from 'react-icons/fi';
import '../modules/ModulePage.css';

const SettingsPage = () => {
    const features = [
        'User Management', 'System Configuration', 'API Keys',
        'Notifications', 'Audit Logs', 'Theme Preferences',
    ];

    return (
        <div className="module-page">
            <div className="module-page-header">
                <div className="module-page-icon"><FiSettings /></div>
                <div className="module-page-info">
                    <h2>Settings</h2>
                    <p>System configuration and user preferences</p>
                </div>
            </div>
            <div className="module-coming-soon">
                <div className="coming-soon-icon"><FiClock /></div>
                <h3>Settings Coming Soon</h3>
                <p>Full system settings including user management, configuration, and audit logging will be available here.</p>
                <div className="coming-soon-features">
                    {features.map((f, i) => <span className="feature-tag" key={i}>{f}</span>)}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
