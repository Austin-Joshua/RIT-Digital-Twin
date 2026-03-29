import React, { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext();

// themePreference: 'light' | 'dark' | 'system'
export const ThemeProvider = ({ children }) => {
    const [themePreference, setThemePreference] = useState(() => {
        return localStorage.getItem('theme-preference') || 'system';
    });

    const [isDarkMode, setIsDarkMode] = useState(false);

    // Resolve the actual mode from the preference
    const resolveTheme = useCallback(() => {
        if (themePreference === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return themePreference === 'dark';
    }, [themePreference]);

    // Apply theme to DOM
    useEffect(() => {
        const applyTheme = () => {
            const dark = resolveTheme();
            setIsDarkMode(dark);
            const root = window.document.documentElement;
            if (dark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        applyTheme();
        localStorage.setItem('theme-preference', themePreference);

        // Listen for OS-level preference changes (only matters when preference === 'system')
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            if (themePreference === 'system') {
                applyTheme();
            }
        };
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [themePreference, resolveTheme]);

    // Allow toggle to jump straight between light and dark
    const toggleTheme = () => {
        setThemePreference(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    // Direct setter for settings page
    const setThemeMode = (mode) => {
        setThemePreference(mode); // 'light' | 'dark' | 'system'
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, themePreference, toggleTheme, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
