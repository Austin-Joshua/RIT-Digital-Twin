import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { auth, googleProvider } from '../utils/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const getInitialAuthState = () => {
        try {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                const parts = storedToken.split('.');
                if (parts.length !== 3) {
                    console.warn('[Auth] Malformed token detected');
                    return { user: null, token: null, role: null, isAuthenticated: false, loading: false };
                }

                const payload = JSON.parse(atob(parts[1] || ''));
                if (payload.exp && payload.exp * 1000 > Date.now()) {
                    const parsedUser = JSON.parse(storedUser);
                    return {
                        user: parsedUser,
                        token: storedToken,
                        role: parsedUser.role || null,
                        isAuthenticated: true,
                        loading: false
                    };
                } else {
                    console.info('[Auth] Session expired');
                }
            }
        } catch (err) {
            console.error('[Auth] Initialization error:', err);
        }
        return { user: null, token: null, role: null, isAuthenticated: false, loading: false };
    };

    const initialState = getInitialAuthState();
    const [user, setUser] = useState(initialState.user);
    const [token, setToken] = useState(initialState.token);
    const [role, setRole] = useState(initialState.role);
    const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated);
    const [loading, setLoading] = useState(false); // Immediate ready

    // Session heartbeat still useful for background sync
    useEffect(() => {
        if (isAuthenticated) {
            // Heartbeat logic could go here if needed
        }
    }, [isAuthenticated]);

    const clearSession = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        sessionStorage.clear();

        setUser(null);
        setToken(null);
        setRole(null);
        setIsAuthenticated(false);
        
        // Also sign out from Firebase if available
        if (auth) {
            signOut(auth).catch(err => console.warn('Firebase signout warning:', err));
        }
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

    const googleLogin = async () => {
        clearSession();
        if (!auth || !googleProvider) {
            return {
                success: false,
                message: 'Google login is not configured for this environment.'
            };
        }
        try {
            // Trigger Firebase Google Sign-In Popup
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            // Send Firebase ID Token to Backend
            const response = await api.post('/auth/google', { token: idToken });
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
            console.error('Firebase Google Login failed', error);
            let errorMessage = 'Google authentication failed.';
            
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Login popup was closed before completion.';
            } else if (error.code === 'auth/unauthorized-domain') {
                errorMessage = 'This domain is not authorized in Firebase Auth. Add localhost in Firebase -> Authentication -> Settings -> Authorized domains.';
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = 'Google sign-in is disabled in Firebase. Enable Google provider in Firebase -> Authentication -> Sign-in method.';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Popup was blocked by the browser. Allow popups for this site and try again.';
            } else if (error.code === 'auth/cancelled-popup-request') {
                errorMessage = 'Another sign-in popup was already open. Close popups and try again.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Network issue while contacting Firebase. Check internet connection and try again.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = `Google authentication failed: ${error.message}`;
            }
            
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
