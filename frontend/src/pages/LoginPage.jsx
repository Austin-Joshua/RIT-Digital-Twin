import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import api from '../services/api';

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // Temporary placeholder

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [backendStatus, setBackendStatus] = useState('checking');
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode } = useContext(ThemeContext);

    useEffect(() => {
        let timeoutId;
        const checkConnection = async () => {
            const controller = new AbortController();
            timeoutId = setTimeout(() => controller.abort(), 4000);

            try {
                const response = await fetch('http://localhost:8080/actuator/health', {
                    signal: controller.signal,
                    mode: 'cors'
                });
                if (response.ok) setBackendStatus('online');
                else setBackendStatus('offline');
            } catch (err) {
                setBackendStatus('offline');
            } finally {
                clearTimeout(timeoutId);
            }
        };

        checkConnection();
        const interval = setInterval(checkConnection, 10000);
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            clearInterval(interval);
        };
    }, []);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(credentials.username.trim(), credentials.password);
            if (result.success) {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const role = storedUser?.role;
                const normalizedRole = role?.replace('ROLE_', '').replace(/_/g, '').toUpperCase();

                if (normalizedRole === 'STUDENT') window.location.href = '/student';
                else if (normalizedRole === 'PARENT') window.location.href = '/parent';
                else if (normalizedRole === 'BOSS') window.location.href = '/boss';
                else window.location.href = '/';
            } else {
                setError(result.message || 'Invalid username or password.');
            }
        } catch (_err) {
            setError('Authentication service unavailable.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        setLoading(true);
        try {
            const result = await googleLogin(credentialResponse.credential);
            if (result.success) {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const role = storedUser?.role;
                const normalizedRole = role?.replace('ROLE_', '').replace(/_/g, '').toUpperCase();

                if (normalizedRole === 'STUDENT') window.location.href = '/student';
                else if (normalizedRole === 'PARENT') window.location.href = '/parent';
                else if (normalizedRole === 'BOSS') window.location.href = '/boss';
                else window.location.href = '/';
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Google sign-in failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="auth-form-wrapper">



                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        background: 'var(--card-bg)',
                        border: '1.5px solid var(--theme-border)',
                        padding: 'clamp(16px, 3vw, 28px)',
                        borderRadius: '16px',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
                        width: '100%',
                        maxWidth: '420px',
                        position: 'relative',
                        zIndex: 2
                    }}
                >
                    <div style={{ marginBottom: '16px', textAlign: 'center', position: 'relative' }}>
                        <div style={{
                            position: 'absolute', top: '-10px', right: '-10px',
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '4px 8px', borderRadius: '12px',
                            background: backendStatus === 'online' ? 'rgba(22, 163, 74, 0.1)' :
                                backendStatus === 'checking' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                            border: `1px solid ${backendStatus === 'online' ? 'var(--color-success)' :
                                backendStatus === 'checking' ? '#3B82F6' : 'var(--color-danger)'}`,
                            fontSize: '10px', fontWeight: 'bold', color: backendStatus === 'online' ? 'var(--color-success)' :
                                backendStatus === 'checking' ? '#3B82F6' : 'var(--color-danger)'
                        }}>
                            <div style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: 'currentColor',
                                animation: backendStatus === 'checking' ? 'pulse 1.5s infinite' : 'none'
                            }} />
                            {backendStatus.toUpperCase()}
                        </div>
                        <h2 style={{
                            fontSize: '1.6rem', fontWeight: '900',
                            color: isDarkMode ? '#FFD700' : '#B8860B', // Darker gold for better contrast
                            marginBottom: '4px',
                            textShadow: isDarkMode ? '0 0 10px rgba(255, 215, 0, 0.2)' : 'none',
                            letterSpacing: '0.02em'
                        }}>Institutional Access</h2>
                        <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.9rem', fontWeight: '500', lineHeight: '1.4' }}>Authenticate to access the Smart Campus platform</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{
                                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                color: 'var(--color-danger)',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                fontSize: '0.875rem',
                                marginBottom: '16px',
                                borderLeft: '4px solid var(--color-danger)'
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Input
                            label="Username"
                            type="text"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            required
                        />

                        <Input
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--theme-text-muted)',
                                        fontSize: '1.2rem',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            }
                        />

                        <Button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                marginTop: '4px',
                                padding: '8px 16px',
                                fontSize: '0.95rem',
                                borderRadius: '8px',
                                backgroundColor: 'var(--color-primary-navy)',
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: '700'
                            }}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </Button>

                        <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0', gap: '15px' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--theme-border)' }}></div>
                            <span style={{ color: 'var(--theme-text-muted)', fontSize: '0.85rem' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--theme-border)' }}></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google Authentication Failed')}
                                theme={isDarkMode ? 'dark' : 'outline'}
                                shape="pill"
                                text="signin_with"
                                width="100%"
                            />
                        </div>
                    </form>

                    <div style={{ marginTop: '12px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                        New to the platform? {' '}
                        <Link to="/register" style={{ color: 'var(--color-accent-gold)', fontWeight: '600', textDecoration: 'none' }}>
                            Request Access
                        </Link>
                    </div>

                </motion.div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default LoginPage;
