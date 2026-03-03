import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // Temporary placeholder

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode } = useContext(ThemeContext);

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
                if (storedUser?.role === 'STUDENT') {
                    navigate('/student');
                } else {
                    navigate('/');
                }
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
                if (storedUser?.role === 'STUDENT') {
                    navigate('/student');
                } else {
                    navigate('/');
                }
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


                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <img
                        src="/assets/images/RIT_LOGO.webp"
                        alt="Rajalakshmi Institute of Technology"
                        style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '16px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}
                    />
                    <h1 style={{ color: 'var(--color-primary-navy)', fontSize: '1.5rem', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Rajalakshmi Institute of Technology
                    </h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        background: 'var(--card-bg)',
                        border: '1.5px solid var(--theme-border)',
                        padding: '40px',
                        borderRadius: '24px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                        width: '100%',
                        maxWidth: '440px',
                        position: 'relative',
                        zIndex: 2
                    }}
                >
                    <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--theme-text)', marginBottom: '8px' }}>Institutional Access</h2>
                        <p style={{ color: 'var(--theme-text-muted)', fontSize: '1rem', lineHeight: '1.5' }}>Authenticate to access the Smart Campus platform</p>
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

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
                                marginTop: '16px',
                                padding: '12px 24px',
                                fontSize: '1.1rem',
                                borderRadius: '12px',
                                backgroundColor: 'var(--color-primary-navy)',
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: '700'
                            }}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </Button>

                        <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', gap: '15px' }}>
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

                    <div style={{ marginTop: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
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
