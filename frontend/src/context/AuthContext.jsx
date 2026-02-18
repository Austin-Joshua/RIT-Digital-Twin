import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        const response = await authAPI.login(credentials);
        const data = response.data;

        setToken(data.token);
        const userData = {
            username: data.username,
            fullName: data.fullName,
            email: data.email,
            role: data.role,
        };
        setUser(userData);

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));

        return data;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const isAuthenticated = !!token;

    const hasRole = (role) => {
        if (!user) return false;
        return user.role === role;
    };

    const hasAnyRole = (roles) => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
        hasRole,
        hasAnyRole,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
