import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(credentials.username, credentials.password);
            if (result.success) {
                // Get fresh user data from context after login
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser?.role === 'STUDENT') {
                    navigate('/student');
                } else {
                    navigate('/');
                }
            } else {
                setError(result.message || 'Invalid institutional credentials.');
            }
        } catch (err) {
            setError('Authentication service unavailable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--glass-border)',
                padding: '40px',
                borderRadius: '24px',
                boxShadow: 'var(--shadow-soft)',
                width: '100%',
                position: 'relative',
                zIndex: 2
            }}
        >
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--color-accent-gold)', marginBottom: '8px' }}>Login</h2>
                <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.95rem' }}>Enter your credentials to access the Digital Twin.</p>
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
                        marginBottom: '24px',
                        borderLeft: '4px solid var(--color-danger)'
                    }}
                >
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit}>
                <Input
                    label="Institutional ID / Email"
                    type="text"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    required
                    placeholder="e.g. admin@ritchennai.edu.in"
                />

                <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    rightElement={
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--theme-text, #333)',
                                fontSize: '1.2rem',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
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
                        marginTop: '24px',
                        padding: '16px 32px',
                        fontSize: '1.2rem',
                        borderRadius: '12px',
                        backgroundColor: '#007bff',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: '700',
                        boxShadow: '0 10px 20px rgba(0, 123, 255, 0.2)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    {loading ? 'Authenticating...' : 'Login'}
                </Button>
            </form>

            <div style={{ marginTop: '32px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                New to the ecosystem? {' '}
                <Link to="/register" style={{ color: 'var(--color-accent-gold)', fontWeight: '600', textDecoration: 'none' }}>
                    Request Access
                </Link>
            </div>
        </motion.div>
    );
};

export default LoginPage;
