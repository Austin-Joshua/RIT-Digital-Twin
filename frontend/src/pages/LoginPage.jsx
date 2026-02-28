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
    const [step, setStep] = useState(1); // 1: Identifier, 2: Choice (Login/Preview), 3: Password
    const { login, loginAsGuest } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleIdentifierSubmit = (e) => {
        e.preventDefault();
        if (credentials.username.trim()) {
            setStep(2);
        }
    };

    const handleGuestLogin = (role) => {
        loginAsGuest(role);
        if (role === 'STUDENT') navigate('/student');
        else if (role === 'ADMIN') navigate('/admin');
        else if (role === 'FACULTY') navigate('/faculty');
        else navigate('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(credentials.username.trim(), credentials.password);
            if (result.success) {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser?.role === 'STUDENT') navigate('/student');
                else if (storedUser?.role === 'ADMIN') navigate('/admin');
                else navigate('/');
            } else {
                setError(result.message || 'Invalid institutional credentials.');
                setStep(1); // Go back to start on error
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

            <div className="login-form-container">
                {step === 1 && (
                    <form onSubmit={handleIdentifierSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Input
                            label="INSTITUTIONAL ID / EMAIL"
                            type="text"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            placeholder="e.g. admin@ritchennai.edu.in"
                            required
                        />
                        <Button type="submit" style={{ width: '100%', marginTop: '16px' }}>Continue</Button>
                    </form>
                )}

                {step === 2 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--theme-text-muted)', marginBottom: '10px' }}>
                            Identify your access mode for <strong>{credentials.username}</strong>:
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button onClick={() => handleGuestLogin('ADMIN')} className="chooser-btn">Admin Preview</button>
                            <button onClick={() => handleGuestLogin('FACULTY')} className="chooser-btn">Faculty Preview</button>
                            <button onClick={() => handleGuestLogin('STUDENT')} className="chooser-btn">Student Preview</button>
                            <button onClick={() => handleGuestLogin('PARENT')} className="chooser-btn">Parent Preview</button>
                        </div>

                        <div style={{ margin: '15px 0', borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
                            <Button onClick={() => setStep(3)} style={{ width: '100%', background: 'transparent', border: '1px solid var(--color-primary-navy)', color: 'var(--color-primary-navy)' }}>
                                Login with Password
                            </Button>
                        </div>

                        <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--theme-text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>
                            ← Use different ID
                        </button>

                        <style>{`
                            .chooser-btn {
                                padding: 12px;
                                border-radius: 12px;
                                border: 1px solid var(--glass-border);
                                background: rgba(255,255,255,0.05);
                                color: var(--theme-text);
                                cursor: pointer;
                                transition: all 0.2s;
                                font-weight: 500;
                            }
                            .chooser-btn:hover {
                                background: var(--color-accent-gold);
                                color: white;
                                border-color: var(--color-accent-gold);
                                transform: translateY(-2px);
                            }
                        `}</style>
                    </motion.div>
                )}

                {step === 3 && (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ marginBottom: '15px', color: 'var(--theme-text-muted)', fontSize: '0.9rem' }}>
                            Logging in as <strong>{credentials.username}</strong>
                        </div>
                        <Input
                            label="PASSWORD"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--theme-text-muted)' }}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            }
                        />

                        <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: '16px' }}>
                            {loading ? 'Authenticating...' : 'Secure Login'}
                        </Button>

                        <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'var(--theme-text-muted)', fontSize: '0.8rem', cursor: 'pointer', marginTop: '10px' }}>
                            ← Back to choices
                        </button>
                    </form>
                )}
            </div>

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
