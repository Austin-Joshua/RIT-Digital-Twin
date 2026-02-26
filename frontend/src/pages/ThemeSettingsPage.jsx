import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const ThemeSettingsPage = () => {
    const { themePreference, setThemeMode, isDarkMode } = useContext(ThemeContext);

    const options = [
        { value: 'light', label: 'Light Mode', desc: 'Always use a bright, clean appearance.', icon: '☀️' },
        { value: 'dark', label: 'Dark Mode', desc: 'Reduce eye strain with a darker interface.', icon: '🌙' },
        { value: 'system', label: 'System Default', desc: 'Follow your device\'s current theme setting.', icon: '🖥️' },
    ];

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 20px' }}>
            <h2 style={{ marginBottom: '8px', color: isDarkMode ? '#f8fafc' : '#0B2C6B' }}>Theme Settings</h2>
            <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '28px', fontSize: '14px' }}>
                Choose your preferred appearance. The <strong>System Default</strong> option automatically adapts
                to your device's light or dark mode setting.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {options.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setThemeMode(opt.value)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '18px 20px',
                            borderRadius: '12px',
                            border: themePreference === opt.value
                                ? '2px solid #0B2C6B'
                                : `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                            background: themePreference === opt.value
                                ? (isDarkMode ? 'rgba(11,44,107,0.2)' : 'rgba(11,44,107,0.05)')
                                : (isDarkMode ? '#1e293b' : '#fff'),
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <span style={{ fontSize: '28px' }}>{opt.icon}</span>
                        <div>
                            <div style={{
                                fontWeight: 'bold',
                                fontSize: '15px',
                                color: isDarkMode ? '#f8fafc' : '#1e293b',
                                marginBottom: '3px'
                            }}>
                                {opt.label}
                                {themePreference === opt.value && (
                                    <span style={{
                                        marginLeft: '8px',
                                        fontSize: '11px',
                                        color: '#0B2C6B',
                                        background: 'rgba(11,44,107,0.1)',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontWeight: 'bold'
                                    }}>ACTIVE</span>
                                )}
                            </div>
                            <div style={{
                                fontSize: '13px',
                                color: isDarkMode ? '#94a3b8' : '#64748b',
                            }}>
                                {opt.desc}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ThemeSettingsPage;
