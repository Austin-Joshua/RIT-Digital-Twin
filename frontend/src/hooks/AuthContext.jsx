import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Restore session on first load and validate JWT expiry
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                const payload = JSON.parse(atob(storedToken.split('.')[1] || ''));
                if (payload.exp && payload.exp * 1000 > Date.now()) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setToken(storedToken);
                    setRole(parsedUser.role || null);
                    setIsAuthenticated(true);
                } else {
                    localStorage.clear();
                }
            } catch (err) {
                console.error('Failed to restore auth state', err);
                localStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    const clearSession = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('userRole');
        localStorage.removeItem('authToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('rit_dt_token');
        localStorage.removeItem('rit_dt_user');
        sessionStorage.clear();

        setUser(null);
        setToken(null);
        setRole(null);
        setIsAuthenticated(false);
    };

    const login = async (username, password) => {
        const u = (username || '').trim();
        const p = (password || '').trim();
        if (!u || !p) {
            return { success: false, message: 'Please enter both email/username and password.' };
        }

        // wipe any stale session before logging in
        clearSession();

        try {
            const response = await api.post('/auth/login', { username: u, password: p });
            const { token: jwt, ...userData } = response.data || {};
            if (!jwt || !userData) {
                return { success: false, message: 'Invalid authentication response from server.' };
            }

            localStorage.setItem('token', jwt);
            localStorage.setItem('user', JSON.stringify(userData));
            if (userData.role) {
                localStorage.setItem('role', userData.role);
            }

            setUser(userData);
            setToken(jwt);
            setRole(userData.role || null);
            setIsAuthenticated(true);

            return { 
                success: true, 
                role: userData.role || null,
                mustChangePassword: userData.mustChangePassword === true
            };
        } catch (error) {
            console.error('Login failed', error);
            if (error.response) {
                console.error('Error data:', error.response.data);
                console.error('Error status:', error.response.status);
            }
            let errorMessage = 'Invalid username or password.';
            if (error.response?.data) {
                const data = error.response.data;
                if (typeof data === 'string') errorMessage = data;
                else if (data.message) errorMessage = data.message;
                else if (data.error) errorMessage = data.error;
            } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
                errorMessage = 'Cannot reach server. Ensure the backend is running on port 8080.';
            }
            clearSession();
            return { success: false, message: errorMessage };
        }
    };

    const googleLogin = async (credential) => {
        clearSession();
        try {
            const response = await api.post('/auth/google', { token: credential });
            const { token: jwt, ...userData } = response.data || {};
            if (!jwt || !userData) {
                return { success: false, message: 'Invalid Google authentication response from server.' };
            }

            localStorage.setItem('token', jwt);
            localStorage.setItem('user', JSON.stringify(userData));
            if (userData.role) {
                localStorage.setItem('role', userData.role);
            }

            setUser(userData);
            setToken(jwt);
            setRole(userData.role || null);
            setIsAuthenticated(true);

            return { 
                success: true, 
                role: userData.role || null,
                mustChangePassword: userData.mustChangePassword === true
            };
        } catch (error) {
            console.error('Google Login failed', error);
            const errorMessage = error.response?.data?.message || 'Google authentication failed. Please ensure you are using your institutional account.';
            clearSession();
            return { success: false, message: errorMessage };
        }
    };

    const logout = () => {
        clearSession();
    };

    const value = React.useMemo(() => ({
        user,
        token,
        role,
        isAuthenticated,
        login,
        googleLogin,
        logout,
        loading
    }), [user, token, role, isAuthenticated, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);
