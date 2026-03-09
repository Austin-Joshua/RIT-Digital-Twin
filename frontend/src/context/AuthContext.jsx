import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error("Failed to parse stored user", err);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const u = (username || '').trim();
        const p = (password || '').trim();
        if (!u || !p) {
            return { success: false, message: 'Please enter both email/username and password.' };
        }
        try {
            const response = await api.post('/auth/login', { username: u, password: p });
            const { token, ...userData } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            if (error.response) {
                console.error("Error data:", error.response.data);
                console.error("Error status:", error.response.status);
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
            return { success: false, message: errorMessage };
        }
    };

    const googleLogin = async (credential) => {
        try {
            const response = await api.post('/auth/google', { token: credential });
            const { token, ...userData } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error("Google Login failed", error);
            const errorMessage = error.response?.data?.message || 'Google authentication failed. Please ensure you are using your institutional account.';
            return { success: false, message: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, googleLogin, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
